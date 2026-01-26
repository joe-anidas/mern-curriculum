export type TaskStatus = "todo" | "in-progress" | "in-review" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId?: string;
  createdBy?: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  sprintId?: string | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  attachments?: {
    _id?: string;
    name: string;
    url: string;
    publicId: string;
    uploadedAt: Date;
  }[];
}

export type TaskFormData = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type CreateTaskData = TaskFormData & {
  userId?: string;
  tenantId?: string;
};

export type UpdateTaskData = Partial<TaskFormData> & {
  userId?: string;
};

export type TaskQueryParams = {
  page?: number;
  limit?: number;
  status?: TaskStatus | "all";
  q?: string;
  tenantId?: string;
  userId?: string;
  priority?: TaskPriority | "all";
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
