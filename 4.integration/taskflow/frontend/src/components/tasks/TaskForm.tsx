import { useForm } from "react-hook-form";
import type { Task, TaskFormData } from "../../types/task";
import { Button } from "../ui/button";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onDemoClick?: () => void;
}

export const TaskForm = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskFormProps) => {
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
        }
      : {
          title: "",
          description: "",
          status: "todo",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title *
          </label>
        </div>
        <input
          id="title"
          type="text"
          {...register("title", {
            required: "Title is required",
            minLength: {
              value: 3,
              message: "Title must be at least 3 characters",
            },
            maxLength: {
              value: 200,
              message: "Title cannot exceed 200 characters",
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description *
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description", {
            required: "Description is required",
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters",
            },
            maxLength: {
              value: 500,
              message: "Description cannot exceed 500 characters",
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status *
        </label>
        <select
          id="status"
          {...register("status", {
            required: "Status is required",
            validate: (value) => {
              const validStatuses = ["todo", "in-progress", "completed"];
              return validStatuses.includes(value) || "Invalid status selected";
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};
