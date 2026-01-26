import { httpClient } from "@/lib/httpClient";
import type {
  Sprint,
  SprintStatus,
  CreateSprintData,
  UpdateSprintData,
} from "@/types/sprint";

const API_BASE = "/api/sprints";

interface SprintResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  tenantId: string;
  createdBy: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SprintsListResponse {
  success: boolean;
  message?: string;
  sprints: SprintResponse[];
}

interface SprintDetailResponse {
  success: boolean;
  message?: string;
  sprint: SprintResponse;
}

const normalizeSprint = (sprint: SprintResponse): Sprint => ({
  id: sprint.id,
  name: sprint.name,
  startDate: new Date(sprint.startDate),
  endDate: new Date(sprint.endDate),
  status: sprint.status as SprintStatus,
  tenantId: sprint.tenantId,
  createdBy: sprint.createdBy,
  taskCount: sprint.taskCount,
  createdAt: new Date(sprint.createdAt),
  updatedAt: new Date(sprint.updatedAt),
});

export const sprintService = {
  async getSprints(): Promise<Sprint[]> {
    const response = await httpClient.get<SprintsListResponse>(API_BASE);
    return (response.sprints || []).map(normalizeSprint);
  },

  async getSprint(id: string): Promise<Sprint> {
    const response = await httpClient.get<SprintDetailResponse>(
      `${API_BASE}/${id}`,
    );
    if (!response.sprint) {
      throw new Error("Sprint not found");
    }
    return normalizeSprint(response.sprint);
  },

  async createSprint(data: CreateSprintData): Promise<Sprint> {
    const response = await httpClient.post<SprintDetailResponse>(
      API_BASE,
      data,
    );
    if (!response.sprint) {
      throw new Error("Failed to create sprint");
    }
    return normalizeSprint(response.sprint);
  },

  async updateSprint(id: string, data: UpdateSprintData): Promise<Sprint> {
    const response = await httpClient.put<SprintDetailResponse>(
      `${API_BASE}/${id}`,
      data,
    );
    if (!response.sprint) {
      throw new Error("Failed to update sprint");
    }
    return normalizeSprint(response.sprint);
  },

  async deleteSprint(id: string): Promise<void> {
    await httpClient.delete(`${API_BASE}/${id}`);
  },
};
