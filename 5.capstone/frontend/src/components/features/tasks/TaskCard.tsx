import type { Task } from "../../../types/task";
import { Button } from "../../ui/button";
import { STATUS_COLORS, STATUS_LABELS } from "../../../constants/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              STATUS_COLORS[task.status]
            }`}
          >
            {STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-gray-500">
          Updated: {new Date(task.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
