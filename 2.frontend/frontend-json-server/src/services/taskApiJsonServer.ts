import type { Task, CreateTaskData, UpdateTaskData } from "../types/task";

const API_BASE_URL = import.meta.env.VITE_JSON_SERVER_API_URL;

export const getTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    throw new Error("User not found");
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks?userId=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const tasks = await response.json();

  return tasks.map((task: any) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));
};

export const getTask = async (id: string): Promise<Task | undefined> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }

  const task = await response.json();

  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  if (!data.userId) {
    throw new Error("User not found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  const task = await response.json();

  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
};

export const updateTask = async (
  id: string,
  data: UpdateTaskData
): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  const task = await response.json();

  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};
