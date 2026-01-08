import { useState } from "react";
import type { Task, TaskFormData } from "../../types/task";
import { useTasks } from "../../hooks/useTasks";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import { Loader } from "../common/Loader";
import { ErrorMessage } from "../common/ErrorMessage";
import { Button } from "../ui/button";

export const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    page,
    totalPages,
    taskCounts,
    status,
    setSearch,
    setStatusFilter,
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
  } = useTasks();

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
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              size="default"
              className="w-full sm:w-auto"
            >
              + New Task
            </Button>
          )}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              {!editingTask && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const statuses = [
                      "todo",
                      "in-progress",
                      "completed",
                    ] as const;
                    const randomStatus =
                      statuses[Math.floor(Math.random() * statuses.length)];
                    const demoTask = {
                      title: "Complete project documentation",
                      description:
                        "Write comprehensive documentation for the new feature including API endpoints and usage examples",
                      status: randomStatus,
                    };
                    createTask(demoTask, {
                      onSuccess: () => {
                        setIsFormOpen(false);
                      },
                    });
                  }}
                >
                  ✨ Demo
                </Button>
              )}
            </div>
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
            message={
              error?.message || "Failed to load tasks. Please try again."
            }
          />
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
            taskCounts={taskCounts}
            status={status}
            onStatusChange={setStatusFilter}
          />
        )}
      </div>
    </div>
  );
};
