import type { Task } from "../../../types/task";
import type { User } from "../../../types/user";
import { Button } from "../../ui/button";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "../../../constants/task";
import { useAuthStore } from "@/store";
import { formatDateISTShort } from "@/utils/date";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  users?: User[]; // List of users (available for tenant admin)
}

export const TaskCard = ({ task, onEdit, onDelete, users }: TaskCardProps) => {
  const { user } = useAuthStore();

  const isTenantAdmin =
    user?.role === "tenantAdmin" || user?.role === "superadmin";
  const isUserRole = user?.role === "user";

  // Logic for Tenant Admin: Find Assignee
  const assignee =
    isTenantAdmin && users
      ? users.find((u) => u._id === task.userId || u.id === task.userId)
      : null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "tenantAdmin":
        return "bg-blue-600";
      case "superadmin":
        return "bg-purple-600";
      default:
        return "bg-green-600";
    }
  };

  // Logic for User Role: Tags
  const currentUserId = user?.id;
  const isOwn = task.createdBy === currentUserId;
  const isAssignedToMe = task.userId === currentUserId;

  // Permissions
  const canEdit = isOwn || isAssignedToMe || isTenantAdmin;
  const canDelete = isOwn || isTenantAdmin;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();

  const isUrgent =
    dueDateObj &&
    task.status !== "completed" &&
    !isOverdue &&
    dueDateObj.getTime() - now.getTime() < 2 * 24 * 60 * 60 * 1000;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all duration-200 group flex flex-col ${
        isOverdue
          ? "border-red-300 bg-red-50/50"
          : isUrgent
            ? "border-red-400 shadow-red-100 ring-1 ring-red-100"
            : "border-gray-200"
      }`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 pr-12 items-center">
            {/* User Role Tags */}
            {isUserRole && (
              <>
                {isOwn && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    OWN
                  </span>
                )}
              </>
            )}

            {/* Urgent Badge */}
            {isUrgent && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                URGENT
              </span>
            )}

            {/* Priority Badge */}
            {task.priority && (
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold ${
                  PRIORITY_COLORS[task.priority]
                }`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>
        </div>

        <div className="mt-1">
          <h3
            className={`text-sm font-semibold text-gray-900 leading-snug break-words pr-2 ${task.status === "completed" ? "line-through text-gray-400" : ""}`}
          >
            {task.title}
          </h3>

          <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[1.25rem]">
            {task.description || (
              <span className="text-gray-300 italic">No description</span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-2">
            {isUserRole && isAssignedToMe && !isOwn && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse"
                title="Assigned to you"
              ></span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>

            {/* Tenant Admin: Profile Circle in side of status */}
            {isTenantAdmin && assignee && (
              <div
                className={`w-5 h-5 rounded-full ${getRoleColor(assignee.role)} text-white text-[10px] font-bold flex items-center justify-center border border-white shadow-sm`}
                title={`Assigned to ${assignee.name}`}
                aria-label={assignee.name}
              >
                {getInitials(assignee.name)}
              </div>
            )}
            {/* Fallback */}
            {isTenantAdmin && !assignee && task.userId && (
              <div className="w-5 h-5 rounded-full bg-gray-300 text-white text-[10px] flex items-center justify-center border border-white">
                ?
              </div>
            )}
          </div>

          {task.dueDate && (
            <span
              className={`text-[10px] font-medium flex items-center gap-1 ${
                isOverdue
                  ? "text-red-600"
                  : isUrgent
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDateISTShort(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Absolute positioned actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100">
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit Task"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
        )}

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete Task"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
};
