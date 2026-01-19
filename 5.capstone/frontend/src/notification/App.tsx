import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Routes, Route, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

type Notification = {
  type: string;
  payload: Record<string, unknown> | undefined;
};
type TaskStatus = "todo" | "in-progress" | "completed";

interface Task {
  taskId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  createdBy: string;
}

function App() {
  // Admin state
  const adminId = "admin";
  const [adminConnected, setAdminConnected] = useState(false);
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>("Design Homepage");
  const [taskDescription, setTaskDescription] = useState<string>(
    "Create mockups and wireframes"
  );
  const [taskDueDate, setTaskDueDate] = useState<string>("2026-01-15");

  // User state
  const [userId, setUserId] = useState<string>("user1");
  const [userConnected, setUserConnected] = useState(false);
  const [userTasks, setUserTasks] = useState<Task[]>([]);


  const navigate = useNavigate();

  // Notifications & UI
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);

  // Socket refs
  const adminSocketRef = useRef<Socket | null>(null);
  const userSocketRef = useRef<Socket | null>(null);
  const adminToken = useMemo(() => `user:${adminId}`, [adminId]);
  const userToken = useMemo(() => `user:${userId}`, [userId]);

  // Admin connect
  const connectAdmin = () => {
    if (adminSocketRef.current?.connected) return;
    const socket = io(import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000", { withCredentials: true });
    adminSocketRef.current = socket;

    socket.on("connect", () => {
      setAdminConnected(true);
      socket.emit("joinRoom", adminToken);
    });

    socket.on("joined", () =>
      pushNotification("Admin joined", { user: adminId })
    );
    socket.on("taskDueDateWarning", (payload) => {
      pushNotification("taskDueDateWarning", payload);
    });
    socket.on("taskStatusUpdated", (payload) => {
      pushNotification("taskStatusUpdated", payload);
      setAdminTasks((prev) =>
        prev.map((t) =>
          t.taskId === (payload as Record<string, unknown>).taskId
            ? {
                ...t,
                status: (payload as Record<string, unknown>)
                  .newStatus as TaskStatus,
              }
            : t
        )
      );
    });
    socket.on("disconnect", () => {
      setAdminConnected(false);
      pushNotification("Admin disconnected", {});
    });
  };

  // User connect
  const connectUser = () => {
    if (userSocketRef.current?.connected) return;
    const socket = io(import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000", { withCredentials: true });
    userSocketRef.current = socket;

    socket.on("connect", () => {
      setUserConnected(true);
      socket.emit("joinRoom", userToken);
    });

    socket.on("joined", () =>
      pushNotification("User joined", { user: userId })
    );
    socket.on("taskDueDateWarning", (payload) => {
      pushNotification("taskDueDateWarning", payload);
    });
    socket.on("taskAssigned", (payload) => {
      pushNotification("taskAssigned", payload);
      if ((payload as Record<string, unknown>).task) {
        setUserTasks((prev) => [
          ...prev,
          (payload as Record<string, unknown>).task as Task,
        ]);
      }
    });
    socket.on("disconnect", () => {
      setUserConnected(false);
      pushNotification("User disconnected", {});
    });
  };

  // Disconnect functions
  const disconnectAdmin = () => {
    adminSocketRef.current?.emit("logout");
    adminSocketRef.current?.disconnect();
    adminSocketRef.current = null;
  };

  const disconnectUser = () => {
    userSocketRef.current?.emit("logout");
    userSocketRef.current?.disconnect();
    userSocketRef.current = null;
  };

  // Helpers
  const pushNotification = (
    type: string,
    payload: Record<string, unknown> | undefined
  ) => {
    setNotifications((prev) => [{ type, payload }, ...prev].slice(0, 50));
  };

  const getNotificationSummary = (n: Notification) => {
    const p = n.payload || {};
    switch (n.type) {
      case "taskAssigned":
        return `New task "${
          (p as Record<string, unknown>).title ?? ""
        }" assigned to ${(p as Record<string, unknown>).assignedTo ?? "user"}`;
      case "taskStatusUpdated":
        return `Status changed to ${
          (p as Record<string, unknown>).newStatus ?? ""
        }`;
      case "taskDueDateWarning":
        return (p as Record<string, unknown>).message
          ? ((p as Record<string, unknown>).message as string)
          : "Task due today";
      case "Admin joined":
      case "User joined":
        return "Connected";
      default:
        return "New notification";
    }
  };

  const getNotificationDetail = (n: Notification | null) => {
    if (!n) return null;
    const p = n.payload || {};
    switch (n.type) {
      case "taskAssigned": {
        return {
          title: "Task Assigned",
          rows: [
            { label: "Title", value: (p as Record<string, unknown>).title },
            {
              label: "Description",
              value: (p as Record<string, unknown>).description,
            },
            {
              label: "Assigned To",
              value: (p as Record<string, unknown>).assignedTo,
            },
            {
              label: "Due Date",
              value: (p as Record<string, unknown>).dueDate,
            },
          ],
        };
      }
      case "taskStatusUpdated": {
        return {
          title: "Task Status Updated",
          rows: [
            { label: "Title", value: (p as Record<string, unknown>).title },
            {
              label: "Old Status",
              value: (p as Record<string, unknown>).oldStatus,
            },
            {
              label: "New Status",
              value: (p as Record<string, unknown>).newStatus,
            },
            {
              label: "Updated By",
              value: (p as Record<string, unknown>).updatedBy,
            },
          ],
        };
      }
      case "taskDueDateWarning": {
        const list = (p as Record<string, unknown>).tasks as
          | Array<Record<string, unknown>>
          | undefined;
        return {
          title: "Task Due Today",
          message: (p as Record<string, unknown>).message as string | undefined,
          list,
        };
      }
      default:
        return {
          title: n.type,
          message: JSON.stringify(p, null, 2),
        };
    }
  };

  // Admin: Create and assign task
  const assignTask = () => {
    const task: Task = {
      taskId: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      assignedTo: userId,
      status: "todo",
      dueDate: taskDueDate,
      createdBy: adminId,
    };
    setAdminTasks((prev) => [...prev, task]);
    adminSocketRef.current?.emit("taskAssigned", {
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      assignedTo: userId,
      dueDate: task.dueDate,
      task,
    });
    pushNotification("Task assigned", { taskId: task.taskId, to: userId });
  };



  useEffect(() => {
    return () => {
      disconnectAdmin();
      disconnectUser();
    };
  }, []);

  // Auto-check due dates for tasks created by admin when connected
  useEffect(() => {
    if (!adminConnected) return;
    const emitCheck = () =>
      adminSocketRef.current?.emit("checkDueDate", { adminId });
    emitCheck();
    const intervalId = window.setInterval(emitCheck, 60_000);
    return () => window.clearInterval(intervalId);
  }, [adminConnected, adminId]);

  const landingElement = (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200 p-10 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">
            📋 Task Tracker
          </h1>
          <p className="text-gray-600">
            Select a dashboard to enter real-time collaboration.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            onClick={() => {
              connectAdmin();
              navigate("/admin");
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            👨‍💼 Admin Dashboard
          </Button>
          <Button
            onClick={() => {
              connectUser();
              navigate("/user");
            }}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            👤 User Dashboard
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Admin creates/assigns tasks • User updates status • Due-date pings in
          real-time
        </p>
      </div>
    </div>
  );

  const adminElement = (
    <div className="w-full px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">
              👨‍💼 Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Create and assign tasks; track status in real time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={connectAdmin}
              disabled={adminConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {adminConnected ? "Connected" : "Connect as Admin"}
            </Button>
            <Button
              variant="outline"
              onClick={disconnectAdmin}
              disabled={!adminConnected}
            >
              Disconnect
            </Button>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                adminConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {adminConnected ? "🟢 Online" : "🔴 Offline"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Create & Assign Task
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium">Task Title</label>
                <input
                  className="w-full rounded border p-2"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Description</label>
                <textarea
                  className="w-full rounded border p-2"
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium">Due Date</label>
                <input
                  type="date"
                  className="w-full rounded border p-2"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium">
                  Assign To User
                </label>
                <input
                  className="w-full rounded border p-2"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user1"
                />
              </div>

              <Button
                onClick={assignTask}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!adminConnected}
              >
                📤 Assign Task
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tasks Assigned
            </h3>
            {adminTasks.length === 0 ? (
              <p className="text-sm text-gray-600">
                No tasks yet. Create one to notify a user.
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {adminTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="rounded border border-blue-100 bg-blue-50 p-3 text-sm"
                  >
                    <div className="font-semibold text-blue-900">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-700">
                      To: {task.assignedTo} • Due: {task.dueDate}
                    </div>
                    <div className="text-xs font-mono text-blue-700">
                      Status: {task.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = userTasks.find((t) => t.taskId === taskId);
    if (!task || task.status === newStatus) return;

    setUserTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId ? { ...t, status: newStatus } : t
      )
    );

    userSocketRef.current?.emit("taskStatusUpdated", {
      taskId,
      oldStatus: task.status,
      newStatus,
      updatedBy: userId,
    });
  };

  const userElement = (
    <div className="w-full px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-green-900">
              👤 User Dashboard
            </h2>
            <p className="text-gray-600">
              Drag and drop tasks to update status instantly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={connectUser}
              disabled={userConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              {userConnected ? "Connected" : "Connect as User"}
            </Button>
            <Button
              variant="outline"
              onClick={disconnectUser}
              disabled={!userConnected}
            >
              Disconnect
            </Button>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                userConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {userConnected ? "🟢 Online" : "🔴 Offline"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["todo", "in-progress", "completed"] as TaskStatus[]).map((status) => (
            <div
              key={status}
              className={`rounded-xl border p-4 min-h-[500px] transition-colors flex flex-col gap-4 ${
                status === "todo"
                  ? "bg-slate-50 border-slate-200"
                  : status === "in-progress"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="font-bold text-gray-700 capitalize">
                  {status === "in-progress" ? "In Progress" : status}
                </h3>
                <span className="text-xs bg-white px-2 py-1 rounded shadow-sm font-semibold text-gray-600">
                  {userTasks.filter((t) => t.status === status).length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {userTasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <div
                      key={task.taskId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.taskId)}
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {task.title}
                         </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs border-t pt-3 border-gray-50">
                        <span className="text-gray-400 font-mono">
                           {task.dueDate}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                             status === "todo" ? "bg-slate-400" :
                             status === "in-progress" ? "bg-blue-400" :
                             "bg-green-400"
                        }`} />
                      </div>
                    </div>
                  ))}
                  {userTasks.filter((t) => t.status === status).length === 0 && (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400 italic border-2 border-dashed border-gray-200 rounded-lg">
                          Drop items here
                      </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Navbar */}
      <nav className="relative z-40 flex items-center justify-between bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">📋 Task Tracker</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {adminConnected && (
              <span className="font-medium text-blue-600">👨‍💼 Admin Mode</span>
            )}
            {userConnected && (
              <span className="font-medium text-green-600">👤 User Mode</span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-50">
                <div className="sticky top-0 flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-900">
                    Notifications
                  </span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <ul className="divide-y">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No new notifications
                    </li>
                  ) : (
                    notifications.map((n, idx) => {
                      const summary = getNotificationSummary(n);
                      return (
                        <li
                          key={idx}
                          className="px-4 py-3 text-sm border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setActiveNotification(n);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="font-semibold text-gray-900 flex items-center justify-between">
                            <span>{n.type}</span>
                            <span className="text-xs text-gray-500">
                              #{notifications.length - idx}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {summary}
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              if (adminConnected) disconnectAdmin();
              if (userConnected) disconnectUser();
            }}
            variant="outline"
            className="text-sm"
          >
            Logout
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={landingElement} />
          <Route path="/admin" element={adminElement} />
          <Route path="/user" element={userElement} />
        </Routes>
      </main>

      {activeNotification &&
        (() => {
          const detail = getNotificationDetail(activeNotification);
          if (!detail) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {detail.title}
                  </h3>
                  <button
                    aria-label="Close notification"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setActiveNotification(null)}
                  >
                    ✖
                  </button>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm text-gray-800">
                  {detail.message && (
                    <p className="text-gray-700">{detail.message}</p>
                  )}

                  {detail.rows && (
                    <div className="space-y-2">
                      {detail.rows.map((row, idx) =>
                        row.value ? (
                          <div
                            key={idx}
                            className="flex justify-between rounded bg-gray-50 px-3 py-2"
                          >
                            <span className="text-gray-600">{row.label}</span>
                            <span className="font-medium text-gray-900">
                              {row.value as string}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  {Array.isArray(detail.list) && detail.list.length > 0 && (
                    <div className="space-y-2">
                      {detail.list.map((task, idx) => (
                        <div
                          key={idx}
                          className="rounded border border-gray-200 px-3 py-2"
                        >
                          <div className="font-semibold text-gray-900">
                            {(task as Record<string, unknown>).title as string}
                          </div>
                          <div className="text-xs text-gray-600">
                            Due:{" "}
                            {
                              (task as Record<string, unknown>)
                                .dueDate as string
                            }
                          </div>
                          <div className="text-xs text-blue-700">
                            Status:{" "}
                            {(task as Record<string, unknown>).status as string}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveNotification(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
export default App;
