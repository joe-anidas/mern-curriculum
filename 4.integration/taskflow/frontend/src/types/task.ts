export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  id: string;
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

export type CreateTaskData = TaskFormData;
export type UpdateTaskData = Partial<TaskFormData>;
