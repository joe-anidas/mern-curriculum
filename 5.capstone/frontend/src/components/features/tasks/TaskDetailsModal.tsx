
import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/constants/task";
import { taskService } from "@/services/api/taskService";
import { toast } from "react-hot-toast";

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onTaskUpdate?: () => void;
}

// Mock Activity Data
const mockActivity = [
  { id: 1, type: "created", text: "Task created", date: "2 days ago" },
  { id: 2, type: "status", text: "Status changed from To Do to In Progress", date: "1 day ago" },
];

// Mock Comments Data
const mockComments = [
  { id: 1, user: "Jane Doe", text: "Looks good, proceeding with the initial draft.", date: "1 day ago", avatar: "JD" },
];

export const TaskDetailsModal = ({ task, isOpen, onClose, onSave, onTaskUpdate }: TaskDetailsModalProps) => {
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState<string>(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
  const [commentText, setCommentText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [actualHours, setActualHours] = useState("");
  
  // Attachments state
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update attachments when task updates (e.g. after upload/refetch)
  useEffect(() => {
    setAttachments(task.attachments || []);
  }, [task.attachments]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(task.id, {
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      const updatedTask = await taskService.addAttachments(task.id, fileArray);
      setAttachments(updatedTask.attachments || []);
      toast.success("Attachments uploaded successfully");
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("Failed to upload attachments", error);
      toast.error("Failed to upload attachments. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
     if (!confirm("Are you sure you want to delete this attachment?")) return;
     try {
        const updatedTask = await taskService.removeAttachment(task.id, attachmentId);
        setAttachments(updatedTask.attachments || []);
        toast.success("Attachment moved to trash");
        if (onTaskUpdate) onTaskUpdate();
     } catch (error) {
        console.error("Failed to delete attachment", error);
        toast.error("Failed to delete attachment");
     }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

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
              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">#{task.id.slice(-6)}</span>
              <h2 className="text-xl font-bold text-gray-900 truncate max-w-xl" title={task.title}>{task.title}</h2>
           </div>
           <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} className="hover:bg-gray-200 text-gray-500 rounded-full p-2 h-10 w-10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
           </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex overflow-hidden">
           

           {/* Left Section (Main) */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Description */}
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                 <textarea 
                    className="w-full min-h-[120px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y text-gray-700 leading-relaxed bg-gray-50/50 focus:bg-white transition-all"
                    placeholder="Add a detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                 />
              </div>

               {/* Attachments */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        Attachments
                     </label>
                     <div className="flex items-center gap-2">
                        {isUploading && <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>}
                        <button 
                           onClick={triggerFileUpload}
                           disabled={isUploading}
                           className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                           Add
                        </button>
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        multiple 
                     />
                  </div>
                  
                  {attachments.length > 0 ? (
                     <div className="grid grid-cols-2 gap-3">
                        {attachments.map((att, index) => (
                           <div key={att._id || index} className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-200 transition-colors">
                              <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
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
                                 <p className="text-[10px] text-gray-400">{new Date(att.uploadedAt).toLocaleDateString()}</p>
                              </div>
                              {att._id && (
                                <button 
                                  onClick={() => handleDeleteAttachment(att._id!)}
                                  className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                >
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              )}
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div 
                        onClick={triggerFileUpload}
                        className="border border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/30 text-gray-400 hover:bg-gray-50 hover:border-blue-200 transition-all cursor-pointer"
                     >
                        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-xs">Click to upload or drag and drop</span>
                     </div>
                  )}
               </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Activity
                 </label>
                 <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                    {mockActivity.map((act) => (
                       <div key={act.id} className="relative text-sm">
                          <div className="absolute -left-[21px] top-1 min-w-[10px] h-[10px] rounded-full bg-blue-400 border-2 border-white shadow-sm z-10"></div>
                          <p className="text-gray-800 font-medium text-xs">{act.text}</p>
                          <span className="text-[10px] text-gray-400">{act.date}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Comments
                  </label>
                  
                  <div className="space-y-3 mb-4">
                     {mockComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                           <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">{comment.avatar}</div>
                           <div className="flex-1 bg-gray-50 rounded-xl rounded-tl-none p-2.5 shadow-sm border border-gray-100 relative group">
                              <div className="flex justify-between items-start mb-0.5">
                                 <span className="font-semibold text-xs text-gray-900">{comment.user}</span>
                                 <span className="text-[10px] text-gray-400">{comment.date}</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">{comment.text}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="flex gap-3">
                     <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-500 text-[10px] font-bold">ME</div>
                     <div className="flex-1">
                        <textarea 
                           className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-xs min-h-[60px]"
                           placeholder="Write a comment..."
                           value={commentText}
                           onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                           <Button size="sm" className="h-7 text-xs px-3" disabled={!commentText.trim()}>Comment</Button>
                        </div>
                     </div>
                  </div>
              </div>

           </div>

           {/* Right Sidebar (Details) */}
           <div className="w-72 bg-gray-50/80 border-l border-gray-200 p-5 overflow-y-auto space-y-5">
              
              {/* Properties */}
              <div className="space-y-3">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Status</label>
                    <select 
                       value={status} 
                       onChange={(e) => setStatus(e.target.value as TaskStatus)}
                       className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                       {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                       ))}
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Priority</label>
                    <select 
                       value={priority} 
                       onChange={(e) => setPriority(e.target.value as TaskPriority)}
                       className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                       {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                       ))}
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Assignee</label>
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-blue-300 transition-colors">
                       <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                       <span className="text-xs text-gray-700 font-medium">John Doe</span>
                    </div>
                 </div>
              </div>

              {/* Dates */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Start Date</label>
                    <input 
                       type="date" 
                       className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Due Date</label>
                    <input 
                       type="date" 
                       className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       value={dueDate}
                       onChange={(e) => setDueDate(e.target.value)}
                    />
                 </div>
              </div>

               {/* Tracking */}
               <div className="space-y-3 pt-3 border-t border-gray-200">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Labels</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                       <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-100 rounded text-[10px] font-medium">Design</span>
                       <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-[10px] font-medium">Frontend</span>
                       <button className="px-2 py-0.5 border border-dashed border-gray-300 text-gray-400 rounded text-[10px] hover:border-gray-400 hover:text-gray-500 transition-colors">+ Add</button>
                    </div>
                 </div>
              </div>

              {/* Time Tracking */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Est. Hours</label>
                       <input 
                          type="number" 
                          placeholder="0h"
                          className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={estimatedHours}
                          onChange={(e) => setEstimatedHours(e.target.value)}
                       />
                    </div>
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wide">Actual</label>
                       <input 
                          type="number" 
                          placeholder="0h"
                          className="w-full h-8 px-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={actualHours}
                          onChange={(e) => setActualHours(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
           <Button variant="outline" onClick={onClose}>Cancel</Button>
           <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
