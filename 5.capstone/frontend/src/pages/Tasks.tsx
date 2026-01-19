import { useState, useEffect } from "react";
import type { Task, TaskFormData } from "../types/task";
import type { User } from "../types/user";
import { useTasks } from "../hooks/useTasks";
import { TaskList, TaskForm } from "@/components/features/tasks";
import { Loader, ErrorMessage, Button } from "@/components";
import { useAuthStore } from "../store/authStore";
import { AssignTaskModal } from "@/components/dashboard/modals/AssignTaskModal";
import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import { taskService } from "@/services/api/taskService";

interface AssignTaskForm {
  title: string;
  description?: string;
  userId: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
}

export const Tasks = () => {
  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "tenantAdmin";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Assign Task States
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  const {
    tasks,
    page,
    totalPages,
    setSearch,
    nextPage,
    prevPage,
    isLoading,
    isError,
    error,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
  } = useTasks({
    userId: user?.id,
    tenantId: user?.tenantId ?? null,
    role: user?.role,
  });

  useEffect(() => {
    if (isTenantAdmin) {
      const loadUsers = async () => {
        try {
          const data = await httpClient.get<{ users?: User[] }>(
             API_ENDPOINTS.AUTH.USERS
          );
          if (data.users && user?.tenantId) {
             setUsersList(data.users.filter(u => u.tenantId === user.tenantId));
          } else {
             setUsersList([]);
          }
        } catch (err) {
          console.error("Failed to load users for assignment", err);
        }
      };
      void loadUsers();
    }
  }, [isTenantAdmin, user?.tenantId]);

  const handleAssignTask = async (data: AssignTaskForm) => {
    setAssignLoading(true);
    setAssignError(null);
    try {
      const selectedUser = usersList.find(
        (u) => u.id === data.userId || u._id === data.userId
      );
      if (!selectedUser) throw new Error("Selected user not found");

      if (selectedUser.tenantId !== user?.tenantId) {
        throw new Error("Cannot assign tasks to users outside your tenant");
      }

      await taskService.createTask({
        title: data.title,
        description: data.description,
        userId: selectedUser.id || selectedUser._id,
        tenantId: user?.tenantId || undefined,
        status: "todo",
        priority: data.priority || "medium",
        dueDate: data.dueDate || null,
      });

      setAssignSuccess(`Task "${data.title}" assigned successfully!`);
      setShowAssignTask(false);
      // Ideally refresh task list if we want to see it (though it's another user's task)
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign task");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(
        { id: editingTask.id, data },
        {
          onSuccess: () => {
            setEditingTask(null);
            setIsFormOpen(false);
          },
        }
      );
    } else {
      createTask(
        {
          title: data.title,
          description: data.description,
          status: data.status,
        },
        {
          onSuccess: () => {
            setIsFormOpen(false);
          },
        }
      );
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your tasks efficiently
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {isTenantAdmin && (
              <Button 
                onClick={() => setShowAssignTask(true)} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Assign Task
              </Button>
            )}
            {!isFormOpen && (
              <Button
                onClick={() => setIsFormOpen(true)}
                size="lg"
                className="w-full sm:w-auto"
              >
                + New Task
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>
            <TaskForm
              task={editingTask}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isCreating || isUpdating}
            />
          </div>
        )}

        {isLoading && <Loader />}

        {isError && (
          <ErrorMessage
            message={error || "Failed to load tasks. Please try again."}
          />
        )}

        {assignSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
            {assignSuccess}
            <button onClick={() => setAssignSuccess(null)} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        {!isLoading && !isError && (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            page={page}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
          />
        )}
      </div>

      <AssignTaskModal
        isOpen={showAssignTask}
        onClose={() => { setShowAssignTask(false); setAssignError(null); }}
        users={usersList}
        onSubmit={handleAssignTask}
        isLoading={assignLoading}
        error={assignError}
      />
    </div>
  );
};
