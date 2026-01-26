import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";

export interface TaskStats {
  total: number;
  completionRate: number;
  statusCounts: {
    todo: number;
    "in-progress": number;
    "in-review": number;
    completed: number;
  };
  dueStats: {
    overdue: number;
    dueSoon: number;
  };
}

export interface WorkloadStat {
  userId: string;
  name: string;
  email: string;
  total: number;
  completed: number;
  inReview: number;
  inProgress: number;
  todo: number;
  completionRate: number;
}

export const analyticsService = {
  getTaskStats: async (params?: { startDate?: string; endDate?: string }) => {
    let url = API_ENDPOINTS.ANALYTICS.STATS;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    const response = await httpClient.get<{ data: TaskStats }>(url);
    return response.data;
  },

  getWorkloadStats: async () => {
    const response = await httpClient.get<{ data: WorkloadStat[] }>(
      API_ENDPOINTS.ANALYTICS.WORKLOAD,
    );
    return response.data;
  },
};
