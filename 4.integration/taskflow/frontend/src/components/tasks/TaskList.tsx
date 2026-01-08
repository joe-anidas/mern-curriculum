import { useState, useMemo } from "react";
import type { Task, TaskStatus } from "../../types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "../ui/button";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      filter === "all" ? tasks : tasks.filter((task) => task.status === filter),
    [tasks, filter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({taskCounts.all})
        </Button>
        <Button
          variant={filter === "todo" ? "default" : "outline"}
          onClick={() => setFilter("todo")}
        >
          To Do ({taskCounts.todo})
        </Button>
        <Button
          variant={filter === "in-progress" ? "default" : "outline"}
          onClick={() => setFilter("in-progress")}
        >
          In Progress ({taskCounts["in-progress"]})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed ({taskCounts.completed})
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
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
            {filter === "all"
              ? "Get started by creating a new task."
              : `No ${filter} tasks found.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
