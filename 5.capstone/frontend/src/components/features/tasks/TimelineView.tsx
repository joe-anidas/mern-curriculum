import type { Task } from "@/types/task";
import type { User } from "@/types/user";

interface TimelineViewProps {
  tasks: Task[];
  users?: User[];
}

type ParsedTask = Task & {
  startDate: Date;
  endDate: Date;
};

const STATUS_STYLES: Record<
  Task["status"],
  { bar: string; dot: string; label: string }
> = {
  todo: {
    bar: "bg-gray-200 border-gray-300 text-gray-700",
    dot: "bg-gray-400",
    label: "To do",
  },
  "in-progress": {
    bar: "bg-blue-100 border-blue-300 text-blue-800",
    dot: "bg-blue-500",
    label: "In progress",
  },
  "in-review": {
    bar: "bg-purple-100 border-purple-300 text-purple-800",
    dot: "bg-purple-500",
    label: "In review",
  },
  completed: {
    bar: "bg-green-100 border-green-300 text-green-800",
    dot: "bg-green-500",
    label: "Completed",
  },
};

const toDate = (value?: Date | string | null): Date | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatShort = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(
    date,
  );

const formatRangeLabel = (start: Date, end: Date) => {
  const sameDay = start.toDateString() === end.toDateString();
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return sameDay
    ? formatter.format(start)
    : `${formatter.format(start)} \u2192 ${formatter.format(end)}`;
};

export const TimelineView = (props: TimelineViewProps) => {
  const { tasks, users } = props;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "tenantAdmin":
        return "bg-purple-600";
      case "superadmin":
        return "bg-purple-600";
      default:
        return "bg-green-600";
    }
  };

  if (!tasks.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex items-center justify-center text-gray-500 text-sm">
        No tasks to show on the timeline yet.
      </div>
    );
  }

  const parsedTasks: ParsedTask[] = tasks
    .map((task) => {
      const start =
        toDate(task.createdAt) ??
        (() => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          return now;
        })();
      const due = toDate(task.dueDate) ?? start;
      const end = due < start ? start : due;
      return { ...task, startDate: start, endDate: end };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const minStart = parsedTasks.reduce(
    (min, task) => Math.min(min, task.startDate.getTime()),
    parsedTasks[0].startDate.getTime(),
  );
  const maxEnd = parsedTasks.reduce(
    (max, task) => Math.max(max, task.endDate.getTime()),
    parsedTasks[0].endDate.getTime(),
  );

  const padDays = 2;
  const timelineStart = new Date(minStart);
  timelineStart.setDate(timelineStart.getDate() - padDays);
  timelineStart.setHours(0, 0, 0, 0);

  const timelineEnd = new Date(maxEnd);
  timelineEnd.setDate(timelineEnd.getDate() + padDays);
  timelineEnd.setHours(0, 0, 0, 0);

  const dayDiff = (from: Date, to: Date) =>
    Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  const totalDays = Math.max(1, dayDiff(timelineStart, timelineEnd));

  const getPercent = (date: Date) => {
    const clamped = Math.min(
      timelineEnd.getTime(),
      Math.max(timelineStart.getTime(), date.getTime()),
    );
    return (dayDiff(timelineStart, new Date(clamped)) / totalDays) * 100;
  };

  const weekMarkers: Date[] = [];
  const startMarker = new Date(timelineStart);
  startMarker.setDate(startMarker.getDate() - startMarker.getDay()); // start of week (Sunday)
  for (
    let d = startMarker;
    d <= timelineEnd;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
  ) {
    weekMarkers.push(new Date(d));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <div className="w-64 p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide border-r border-gray-100 shrink-0">
          Task timeline
        </div>
        <div className="flex-1 flex">
          {weekMarkers.map((weekStart, idx) => (
            <div
              key={weekStart.toISOString()}
              className={`flex-1 p-4 border-r border-gray-100 text-center text-xs font-medium text-gray-500 last:border-r-0 ${
                idx === 0 ? "text-left" : ""
              }`}
            >
              WK of {formatShort(weekStart)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {parsedTasks.map((task) => {
          const startPercent = getPercent(task.startDate);
          const endPercent = Math.max(
            startPercent + 4,
            getPercent(task.endDate),
          ); // ensure visible width
          const width = Math.min(100 - startPercent, endPercent - startPercent);
          const styles = STATUS_STYLES[task.status];

          return (
            <div
              key={task.id}
              className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-16"
            >
              <div className="w-64 p-3 px-4 shrink-0 border-r border-gray-100 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${styles.dot}`}
                    ></span>
                    <span className="font-medium text-gray-900 truncate min-w-0">
                      {task.title}
                    </span>
                  </div>

                  {/* Assignee avatar aligned to the right end of the box */}
                  {users &&
                    (() => {
                      const assignee = users.find(
                        (u) => u.id === task.userId || u._id === task.userId,
                      );
                      if (assignee) {
                        return (
                          <div
                            className={`w-6 h-6 rounded-full ${getRoleColor(
                              assignee.role,
                            )} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                            title={assignee.name || assignee.email}
                            aria-label={assignee.name || assignee.email}
                          >
                            {getInitials(assignee.name || assignee.email)}
                          </div>
                        );
                      }
                      if (task.userId) {
                        return (
                          <div
                            className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-xs shrink-0"
                            title="Unresolved user"
                            aria-label="Unresolved user"
                          >
                            ?
                          </div>
                        );
                      }
                      return null;
                    })()}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {styles.label} •{" "}
                  {formatRangeLabel(task.startDate, task.endDate)}
                </div>
              </div>
              <div className="flex-1 relative h-full">
                <div className="absolute inset-y-0 left-0 right-0 border-b border-dashed border-gray-200"></div>
                <div
                  className={`absolute top-3 h-8 rounded-md shadow-sm border text-[11px] flex items-center px-3 font-semibold whitespace-nowrap ${styles.bar}`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${width}%`,
                  }}
                >
                  <span className="truncate">
                    {formatRangeLabel(task.startDate, task.endDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
