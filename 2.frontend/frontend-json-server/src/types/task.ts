export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type CreateTaskData = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskData = Partial<TaskFormData>;
