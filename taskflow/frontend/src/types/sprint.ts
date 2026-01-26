export type SprintStatus = "planned" | "active" | "completed";

export interface Sprint {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  status: SprintStatus;
  tenantId: string;
  createdBy: string;
  taskCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateSprintData {
  name: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
}

export interface UpdateSprintData {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}
