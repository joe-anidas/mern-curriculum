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

export type TaskQueryParams = {
  page?: number;
  limit?: number;
  status?: TaskStatus | "all";
  q?: string;
};

export type TaskPage = {
  success: boolean;
  message?: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
  tasks: Task[];
};
