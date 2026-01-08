import type {
  Task,
  TaskFormData,
  UpdateTaskData,
  TaskQueryParams,
  TaskPage,
} from "../types/task";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const authHeader = (): Record<string, string> => {
  const { token } = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const buildQuery = (params?: TaskQueryParams): string => {
  const q = new URLSearchParams();
  if (!params) return q.toString();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.q && params.q.trim()) q.set("q", params.q.trim());
  if (params.status && params.status !== "all") q.set("status", params.status);
  return q.toString();
};

export const getTasks = async (params?: TaskQueryParams): Promise<TaskPage> => {
  const qs = buildQuery(params);
  const url = qs ? `${API_BASE_URL}/tasks?${qs}` : `${API_BASE_URL}/tasks`;

  const res = await fetch(url, {
    headers: { ...authHeader() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Failed to fetch tasks");
  }
  const tasks = (body?.tasks || []) as any[];
  const normalizedTasks = tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
  }));

  return {
    success: body.success ?? true,
    message: body.message,
    page: body.page ?? 1,
    limit: body.limit ?? normalizedTasks.length,
    total: body.total ?? normalizedTasks.length,
    totalPages: body.totalPages ?? 1,
    count: body.count ?? normalizedTasks.length,
    tasks: normalizedTasks,
  } as TaskPage;
};

export const getTask = async (id: string): Promise<Task> => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    headers: { ...authHeader() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Failed to fetch task");
  }
  const t = body?.task;
  return {
    ...t,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
  } as Task;
};

export const createTask = async (data: TaskFormData): Promise<Task> => {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Failed to create task");
  }
  const t = body?.task;
  return {
    ...t,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
  } as Task;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskData
): Promise<Task> => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Failed to update task");
  }
  const t = body?.task;
  return {
    ...t,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
  } as Task;
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to delete task");
  }
};
