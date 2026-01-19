import { useForm } from "react-hook-form";
import { Button } from "@/components/ui";
import { ErrorMessage } from "@/components";
import type { User } from "@/types/user";

interface AssignTaskForm {
  title: string;
  description?: string;
  userId: string;
  status: "todo" | "in-progress" | "in-review" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
}

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSubmit: (data: AssignTaskForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AssignTaskModal = ({
  isOpen,
  onClose,
  users,
  onSubmit,
  isLoading,
  error,
}: AssignTaskModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignTaskForm>();

  // Use an effect or similar to reset defaults when opening? 
  // The parent handles open/close state, so if we rely on parent to reset, that's fine.
  // But standard modal practice is to reset on open. 
  // However, I'll stick to the props provided.
  // The user wanted specific defaults: "first available user" and "current date".
  // I will implement them in `defaultValues` or `useEffect`.

  if (!isOpen) return null;

  const validUsers = users.filter((u) => u.role === "user");

  const handleFormSubmit = async (data: AssignTaskForm) => {
    await onSubmit(data);
    if(!error) reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assign Task to User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              {...register("userId", { required: "Please select a user" })}
              id="userId"
              defaultValue={validUsers[0]?.id || validUsers[0]?._id || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Select a user</option>
              {validUsers.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>}
          </div>

          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              {...register("title", {
                required: "Task title is required",
                minLength: { value: 1, message: "Task title cannot be empty" },
                maxLength: { value: 200, message: "Task title cannot exceed 200 characters" },
              })}
              id="taskTitle"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter task title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              {...register("description", { maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" } })}
              id="taskDescription"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter task description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register("status", { required: true })}
              id="taskStatus"
              defaultValue="todo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                {...register("priority")}
                id="taskPriority"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input
                {...register("dueDate")}
                id="taskDueDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Assigning..." : "Assign Task"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
