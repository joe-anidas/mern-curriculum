import { useState, useMemo } from "react";
import type { Task, TaskStatus } from "../../types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "../ui/button";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  page?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  taskCounts?: {
    all: number;
    todo: number;
    "in-progress": number;
    completed: number;
  };
  status?: "all" | TaskStatus;
  onStatusChange?: (status: "all" | TaskStatus) => void;
}

export const TaskList = ({
  tasks,
  onEdit,
  onDelete,
  page = 1,
  totalPages = 1,
  onPrevPage,
  onNextPage,
  taskCounts: passedTaskCounts,
  status = "all",
  onStatusChange,
}: TaskListProps) => {
  const taskCounts = useMemo(
    () =>
      passedTaskCounts || {
        all: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        "in-progress": tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
      },
    [tasks, passedTaskCounts]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={status === "all" ? "default" : "outline"}
          onClick={() => onStatusChange?.("all")}
        >
          All ({taskCounts.all})
        </Button>
        <Button
          variant={status === "todo" ? "default" : "outline"}
          onClick={() => onStatusChange?.("todo")}
        >
          To Do ({taskCounts.todo})
        </Button>
        <Button
          variant={status === "in-progress" ? "default" : "outline"}
          onClick={() => onStatusChange?.("in-progress")}
        >
          In Progress ({taskCounts["in-progress"]})
        </Button>
        <Button
          variant={status === "completed" ? "default" : "outline"}
          onClick={() => onStatusChange?.("completed")}
        >
          Completed ({taskCounts.completed})
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            {status === "all"
              ? "Get started by creating a new task."
              : `No ${status} tasks found.`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onPrevPage}
              disabled={page <= 1 || !onPrevPage}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              onClick={onNextPage}
              disabled={page >= (totalPages || 1) || !onNextPage}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
