import type { Task, TaskFormData, UpdateTaskData } from "../types/task";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const authHeader = (): Record<string, string> => {
  const { token } = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: { ...authHeader() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Failed to fetch tasks");
  }
  const tasks = (body?.tasks || []) as any[];
  return tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
  }));
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
