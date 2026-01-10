export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  id: string;
  userId?: string;
  tenantId: string;
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

export type CreateTaskData = TaskFormData & {
  userId?: string;
  tenantId?: string;
};

export type UpdateTaskData = Partial<TaskFormData>;

export type TaskQueryParams = {
  page?: number;
  limit?: number;
  status?: TaskStatus | "all";
  q?: string;
  tenantId?: string;
  userId?: string;
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
