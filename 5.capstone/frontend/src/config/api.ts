/**
 * API Configuration
 */
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

if (!import.meta.env.VITE_BACKEND_API_URL) {
  console.error(
    "VITE_BACKEND_API_URL is not set; defaulting to http://localhost:3000",
  );
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    CREATE_TENANT_USER: "/api/auth/tenant/users",
    USERS: "/api/auth/users",
    UPDATE_USER: (id: string) => `/api/auth/users/${id}`,
    DELETE_USER: (id: string) => `/api/auth/users/${id}`,
    ORGANIZATION: "/api/auth/organization",
    ALL_ORGANIZATIONS: "/api/auth/organizations",
    CREATE_ORGANIZATION: "/api/auth/organizations",
  },
  TASKS: {
    LIST: "/api/tasks",
    CREATE: "/api/tasks",
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: "/api/notifications/mark-read",
    MARK_ALL_READ: "/api/notifications/mark-all-read",
    DELETE: (id: string) => `/api/notifications/${id}`,
    DELETE_ALL_READ: "/api/notifications",
  },
  ANALYTICS: {
    STATS: "/api/analytics/stats",
    WORKLOAD: "/api/analytics/workload",
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;
