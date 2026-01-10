/**
 * API Configuration
 */
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

if (!API_BASE_URL) {
  console.error(
    "VITE_BACKEND_API_URL is not set; defaulting to http://localhost:3000"
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
    ORGANIZATION: "/api/auth/organization",
  },
  TASKS: {
    LIST: "/api/tasks",
    CREATE: "/api/tasks",
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;
