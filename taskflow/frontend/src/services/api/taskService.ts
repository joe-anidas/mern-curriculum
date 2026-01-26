import type {
  Task,
  TaskStatus,
  CreateTaskData,
  UpdateTaskData,
  TaskQueryParams,
  TaskPage,
  TaskPriority,
} from "@/types/task";
import { API_ENDPOINTS } from "@/config/api";
import { httpClient } from "@/lib/httpClient";

const buildQuery = (params?: TaskQueryParams): string => {
  const q = new URLSearchParams();
  if (!params) return q.toString();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.q && params.q.trim()) q.set("q", params.q.trim());
  if (params.status && params.status !== "all") q.set("status", params.status);
  if (params.priority && params.priority !== "all")
    q.set("priority", params.priority);
  if (params.tenantId) q.set("tenantId", params.tenantId);
  if (params.userId) q.set("userId", params.userId);
  return q.toString();
};

interface TaskResponse {
  id?: string;
  _id?: string;
  tenantId?: string;
  userId?: string;
  sprintId?: string | null;
  createdBy?: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string | null;
  status: TaskStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  attachments?: {
    _id: string;
    name: string;
    url: string;
    publicId: string;
    uploadedAt: string | Date;
  }[];
}

interface TaskListResponse {
  success?: boolean;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  count?: number;
  tasks?: TaskResponse[];
}

interface TaskCreateResponse {
  task?: TaskResponse;
  [key: string]: unknown;
}

interface TaskUpdateResponse {
  task?: TaskResponse;
  [key: string]: unknown;
}

const normalizeTask = (task: TaskResponse): Task => ({
  id: task.id || task._id || "",
  tenantId: task.tenantId || "",
  userId: task.userId,
  createdBy: task.createdBy,
  sprintId: task.sprintId ?? null,
  title: task.title,
  description: task.description,
  status: task.status as TaskStatus,
  priority: task.priority as TaskPriority,
  dueDate: task.dueDate ? new Date(task.dueDate) : null,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  attachments: task.attachments?.map((att) => ({
    ...att,
    uploadedAt: new Date(att.uploadedAt),
  })),
});

export const taskService = {
  async getTasks(params?: TaskQueryParams): Promise<TaskPage> {
    const qs = buildQuery(params);
    const url = qs
      ? `${API_ENDPOINTS.TASKS.LIST}?${qs}`
      : API_ENDPOINTS.TASKS.LIST;

    const data = await httpClient.get<TaskListResponse>(url);
    const tasks = (data.tasks || []).map(normalizeTask);

    return {
      success: data.success ?? true,
      message: data.message,
      page: data.page ?? 1,
      limit: data.limit ?? tasks.length,
      total: data.total ?? tasks.length,
      totalPages: data.totalPages ?? 1,
      count: data.count ?? tasks.length,
      tasks,
    } as TaskPage;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const result = await httpClient.post<TaskCreateResponse>(
      API_ENDPOINTS.TASKS.CREATE,
      data,
    );
    const task = result.task || result;

    return normalizeTask(task as TaskResponse);
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const result = await httpClient.put<TaskUpdateResponse>(
      API_ENDPOINTS.TASKS.UPDATE(id),
      data,
    );
    const task = result.task || result;

    return normalizeTask(task as TaskResponse);
  },

  async deleteTask(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.TASKS.DELETE(id));
  },

  async addAttachments(id: string, files: File[]): Promise<Task> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    // Note: httpClient wrapper needs to handle FormData correctly or we might need to pass headers.
    // Usually axios handles it if data is FormData.
    const result = await httpClient.post<TaskUpdateResponse>(
      `${API_ENDPOINTS.TASKS.UPDATE(id)}/attachments`,
      formData,
    );
    const task = result.task || result;
    return normalizeTask(task as TaskResponse);
  },

  async removeAttachment(taskId: string, attachmentId: string): Promise<Task> {
    const result = await httpClient.delete<TaskUpdateResponse>(
      `${API_ENDPOINTS.TASKS.UPDATE(taskId)}/attachments/${attachmentId}`,
    );
    const task = result.task || result;
    return normalizeTask(task as TaskResponse);
  },
};
