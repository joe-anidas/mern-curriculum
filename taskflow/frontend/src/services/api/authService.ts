import { API_ENDPOINTS, STORAGE_KEYS } from "@/config/api";
import { httpClient } from "@/lib/httpClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  tenantId?: string;
  organizationName?: string;
}

export type UserRole = "superadmin" | "tenantAdmin" | "user";

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: UserRole;
    tenantId?: string | null;
  };
}

export interface CreateTenantUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  tenantId?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const result = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
      { skipAuth: true }
    );
    localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
    return result;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      { skipAuth: true }
    );
    localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
    return result;
  },

  async createTenantUser(
    data: CreateTenantUserData
  ): Promise<AuthResponse["user"]> {
    const result = await httpClient.post<{ user: AuthResponse["user"] }>(
      API_ENDPOINTS.AUTH.CREATE_TENANT_USER,
      data
    );
    return result.user;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
