import { useState, useMemo } from "react";
import type { Task, TaskStatus, TaskPriority } from "../../../types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "../../ui/button";
import { PRIORITY_LABELS } from "../../../constants/task";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  page?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  isAssignedView?: boolean;
}

export const TaskList = ({
  tasks,
  onEdit,
  onDelete,
  page = 1,
  totalPages = 1,
  onPrevPage,
  onNextPage,
}: TaskListProps) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );
  const [dueDateFilter, setDueDateFilter] = useState<
    "all" | "overdue" | "today" | "week"
  >("all");

  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      "in-review": tasks.filter((t) => t.status === "in-review").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Due date filter
    if (dueDateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      result = result.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const dueDateNorm = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate()
        );

        switch (dueDateFilter) {
          case "overdue":
            return dueDateNorm < today && task.status !== "completed";
          case "today":
            return dueDateNorm.getTime() === today.getTime();
          case "week":
            return dueDateNorm >= today && dueDateNorm <= weekEnd;
          default:
            return false;
        }
      });
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, dueDateFilter]);

  return (
    <div>
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All ({taskCounts.all})
          </Button>
          <Button
            variant={statusFilter === "todo" ? "default" : "outline"}
            onClick={() => setStatusFilter("todo")}
            size="sm"
          >
            To Do ({taskCounts.todo})
          </Button>
          <Button
            variant={statusFilter === "in-progress" ? "default" : "outline"}
            onClick={() => setStatusFilter("in-progress")}
            size="sm"
          >
            In Progress ({taskCounts["in-progress"]})
          </Button>
          <Button
            variant={statusFilter === "in-review" ? "default" : "outline"}
            onClick={() => setStatusFilter("in-review")}
            size="sm"
          >
            In Review ({taskCounts["in-review"]})
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            size="sm"
          >
            Completed ({taskCounts.completed})
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={priorityFilter === "all" ? "default" : "outline"}
            onClick={() => setPriorityFilter("all")}
            size="sm"
          >
            All Priority
          </Button>
          <Button
            variant={priorityFilter === "low" ? "default" : "outline"}
            onClick={() => setPriorityFilter("low")}
            size="sm"
          >
            {PRIORITY_LABELS.low}
          </Button>
          <Button
            variant={priorityFilter === "medium" ? "default" : "outline"}
            onClick={() => setPriorityFilter("medium")}
            size="sm"
          >
            {PRIORITY_LABELS.medium}
          </Button>
          <Button
            variant={priorityFilter === "high" ? "default" : "outline"}
            onClick={() => setPriorityFilter("high")}
            size="sm"
          >
            {PRIORITY_LABELS.high}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={dueDateFilter === "all" ? "default" : "outline"}
            onClick={() => setDueDateFilter("all")}
            size="sm"
          >
            All Dates
          </Button>
          <Button
            variant={dueDateFilter === "overdue" ? "default" : "outline"}
            onClick={() => setDueDateFilter("overdue")}
            size="sm"
          >
            Overdue
          </Button>
          <Button
            variant={dueDateFilter === "today" ? "default" : "outline"}
            onClick={() => setDueDateFilter("today")}
            size="sm"
          >
            Today
          </Button>
          <Button
            variant={dueDateFilter === "week" ? "default" : "outline"}
            onClick={() => setDueDateFilter("week")}
            size="sm"
          >
            Next 7 Days
          </Button>
        </div>
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
            {statusFilter === "all"
              ? "Get started by creating a new task."
              : `No ${statusFilter} tasks found.`}
          </p>
        </div>
      ) : (
        <>
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
