import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_VALIDATION,
} from "@/constants/task";
import { taskService } from "@/services/api/taskService";
import { toast } from "react-hot-toast";
import { formatDateInputIST, getTomorrowIST } from "@/utils/date";

interface UnifiedTaskModalProps {
  task?: Task | null; // If null/undefined, it's create mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    taskId: string,
    updates: Partial<Omit<Task, "dueDate">> & {
      dueDate?: string | Date | null;
    },
  ) => void;
  onCreate?: (
    data: Partial<Omit<Task, "dueDate">> & { dueDate?: string | Date | null },
  ) => void;
  onTaskUpdate?: () => void;
  defaultStatus?: TaskStatus;
  users?: User[]; // For tenant admin assignee selection
  currentUserId?: string;
  isTenantAdmin?: boolean;
  currentSprintId?: string | null; // Current sprint context
}

export const UnifiedTaskModal = ({
  task,
  isOpen,
  onClose,
  onSave,
  onCreate,
  onTaskUpdate,
  defaultStatus = "todo",
  users = [],
  currentUserId,
  isTenantAdmin = false,
  currentSprintId = null,
}: UnifiedTaskModalProps) => {
  const isCreateMode = !task;

  // Form state
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(
    task?.status || defaultStatus,
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium",
  );
  const [dueDate, setDueDate] = useState<string>(() =>
    task?.dueDate ? formatDateInputIST(task.dueDate) : getTomorrowIST(),
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    task?.userId || currentUserId || "",
  );

  // Sprint is set from context (parent component) for create mode, or from task for edit
  const lockedSprintId = task ? task.sprintId || "" : currentSprintId || "";

  // Validation errors
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Attachments state
  const [attachments, setAttachments] = useState(task?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Update attachments when task updates (e.g. after upload/refetch)
  useEffect(() => {
    if (task) {
      setAttachments(task.attachments || []);
    }
  }, [task, task?.attachments]);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority || "medium");
        setDueDate(
          task.dueDate ? formatDateInputIST(task.dueDate) : getTomorrowIST(),
        );
        setSelectedUserId(task.userId || currentUserId || "");
        // Sprint is read-only in edit mode
      } else {
        // Reset for create mode
        setTitle("");
        setDescription("");
        setStatus(defaultStatus);
        setPriority("medium");
        setDueDate(getTomorrowIST());
        setSelectedUserId(currentUserId || "");
        // Sprint is set from context
      }
      setErrors({});
    }
  }, [
    isOpen,
    task,
    task?.title,
    task?.description,
    task?.status,
    task?.priority,
    task?.dueDate,
    task?.userId,
    task?.sprintId,
    currentSprintId,
    defaultStatus,
    currentUserId,
  ]);

  // Auto-expand description textarea
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height =
        descriptionRef.current.scrollHeight + "px";
    }
  }, [description, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < TASK_VALIDATION.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${TASK_VALIDATION.TITLE_MIN_LENGTH} characters`;
    } else if (title.length > TASK_VALIDATION.TITLE_MAX_LENGTH) {
      newErrors.title = `Title cannot exceed ${TASK_VALIDATION.TITLE_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    if (isCreateMode) {
      // Create new task
      if (onCreate) {
        onCreate({
          title,
          description,
          status,
          priority,
          // Send date string (YYYY-MM-DD) - backend will parse as IST
          dueDate: dueDate || null,
          sprintId: lockedSprintId || null,
          // For tenant admin: send selectedUserId if it's not empty, otherwise undefined
          // For regular users: send currentUserId
          userId: isTenantAdmin
            ? selectedUserId && selectedUserId.trim() !== ""
              ? selectedUserId
              : undefined
            : currentUserId,
        });
      }
    } else {
      // Update existing task
      onSave(task.id, {
        title,
        description,
        status,
        priority,
        // Send date string (YYYY-MM-DD) - backend will parse as IST
        dueDate: dueDate || null,
        sprintId: lockedSprintId || null,
        // Include userId only if tenant admin and selectedUserId is not empty
        ...(isTenantAdmin &&
          selectedUserId &&
          selectedUserId.trim() !== "" && { userId: selectedUserId }),
      });
    }
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCreateMode) {
      toast.error("Please create the task first before adding attachments");
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      const updatedTask = await taskService.addAttachments(task!.id, fileArray);
      setAttachments(updatedTask.attachments || []);
      toast.success("Attachments uploaded successfully");
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("Failed to upload attachments", error);
      toast.error("Failed to upload attachments. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;
    try {
      const updatedTask = await taskService.removeAttachment(
        task!.id,
        attachmentId,
      );
      setAttachments(updatedTask.attachments || []);
      toast.success("Attachment moved to trash");
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("Failed to delete attachment", error);
      toast.error("Failed to delete attachment");
    }
  };

  const triggerFileUpload = () => {
    if (isCreateMode) {
      toast.error("Please create the task first before adding attachments");
      return;
    }
    fileInputRef.current?.click();
  };

  const getSelectedUserInfo = () => {
    if (!selectedUserId) return null;
    const user = users.find(
      (u) => u.id === selectedUserId || u._id === selectedUserId,
    );
    if (user) {
      const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : user.email.slice(0, 2).toUpperCase();
      return { name: user.name || user.email, initials };
    }
    return null;
  };

  const userInfo = getSelectedUserInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            {!isCreateMode && (
              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">
                #{task.id.slice(-6)}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {isCreateMode ? "Create New Task" : "Edit Task"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-gray-200 text-gray-500 rounded-full p-2 h-10 w-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Section (Main) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Title - Always editable */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-3 text-sm border ${errors.title ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-gray-50/50 focus:bg-white transition-all`}
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                ref={descriptionRef}
                className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-700 leading-relaxed bg-gray-50/50 focus:bg-white transition-all overflow-hidden"
                placeholder="Add a detailed description..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  // Auto-expand textarea
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                rows={3}
                style={{ minHeight: "80px", maxHeight: "300px" }}
              />
            </div>

            {/* Attachments - Available in both modes but disabled in create */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Attachments
                </label>
                {!isCreateMode && (
                  <div className="flex items-center gap-2">
                    {isUploading && (
                      <span className="text-xs text-blue-500 animate-pulse">
                        Uploading...
                      </span>
                    )}
                    <button
                      onClick={triggerFileUpload}
                      disabled={isUploading}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
              </div>

              {!isCreateMode && attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {attachments.map((att, index) => (
                    <div
                      key={att._id || index}
                      className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-200 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-700 truncate hover:text-blue-600 hover:underline block"
                          title={att.name}
                        >
                          {att.name}
                        </a>
                        <p className="text-[10px] text-gray-400">
                          {new Date(att.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {att._id && (
                        <button
                          onClick={() => handleDeleteAttachment(att._id!)}
                          className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={isCreateMode ? undefined : triggerFileUpload}
                  className={`border border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 transition-all ${
                    isCreateMode
                      ? "bg-gray-100/50 cursor-not-allowed"
                      : "bg-gray-50/30 hover:bg-gray-50 hover:border-blue-200 cursor-pointer"
                  }`}
                >
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-xs">
                    {isCreateMode
                      ? "Save task first to add attachments"
                      : "Click to upload or drag and drop"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (Details) */}
          <div className="w-72 bg-gray-50/80 border-l border-gray-200 p-5 overflow-y-auto space-y-5">
            {/* Properties */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee - always show, but editable only for tenant admin */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">
                  Assignee
                </label>
                {isTenantAdmin && users.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select user...</option>
                    {users.map((user) => (
                      <option
                        key={user.id || user._id}
                        value={user.id || user._id}
                      >
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                ) : userInfo ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                      {userInfo.initials}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {userInfo.name}
                    </span>
                    {!isTenantAdmin && (
                      <span className="text-[10px] text-gray-400 ml-auto">
                        (You)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                    {isTenantAdmin ? "Not assigned" : "Assigned to you"}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isCreateMode ? "Create Task" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};
