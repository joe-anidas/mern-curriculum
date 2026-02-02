/**
 * HTTP Client with interceptors and retry logic
 */

import {
  APIError,
  UnauthorizedError,
  NetworkError,
  ValidationError,
  type APIErrorResponse,
} from "@/types/errors";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/config/api";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

interface RequestOptions extends RequestInit {
  retries?: number;
  skipAuth?: boolean;
}

class HTTPClient {
  private baseURL: string;
  private tokenRefreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getValidToken(): Promise<string> {
    const { token, isAuthenticated } = useAuthStore.getState();

    if (!token || !isAuthenticated) {
      throw new UnauthorizedError("No authentication token available");
    }

    return token;
  }

  private async handleUnauthorized(): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.tokenRefreshPromise) {
      await this.tokenRefreshPromise;
      return;
    }

    const refreshPromise = (async () => {
      try {
        const { logout } = useAuthStore.getState();
        logout();
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    })();

    this.tokenRefreshPromise = refreshPromise;

    await refreshPromise;
    this.tokenRefreshPromise = null;
  }

  private parseErrorResponse(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "object" && error !== null) {
      const err = error as APIErrorResponse;
      return err.error || err.message || "Unknown error";
    }
    return "An unexpected error occurred";
  }

  private async handleResponse<T = unknown>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJSON = contentType?.includes("application/json");

    let data: unknown = null;
    if (isJSON) {
      try {
        data = await response.json();
      } catch (error) {
        console.error("Failed to parse response JSON:", error);
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = this.parseErrorResponse(data);

      switch (response.status) {
        case 400:
          throw new ValidationError(errorMessage);
        case 401:
          await this.handleUnauthorized();
          throw new UnauthorizedError(errorMessage);
        case 403:
          throw new ValidationError(errorMessage);
        default:
          throw new APIError(response.status, data, errorMessage);
      }
    }

    return data as T;
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      retries = MAX_RETRIES,
      skipAuth = false,
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    const headers = new Headers({
      ...(fetchOptions.headers instanceof Headers
        ? Object.fromEntries(fetchOptions.headers)
        : (fetchOptions.headers as Record<string, string>)),
    });

    // Only set JSON content type if it's not FormData
    if (!(fetchOptions.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = await this.getValidToken();
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry on network errors or 5xx errors, but not on client errors
      if (
        retries > 0 &&
        (error instanceof NetworkError ||
          (error instanceof APIError && error.statusCode >= 500))
      ) {
        await this.sleep(RETRY_DELAY);
        return this.request<T>(endpoint, {
          ...options,
          retries: retries - 1,
        });
      }

      throw error;
    }
  }

  get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData
        ? (data as BodyInit)
        : data
          ? JSON.stringify(data)
          : undefined,
    });
  }

  put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData
        ? (data as BodyInit)
        : data
          ? JSON.stringify(data)
          : undefined,
    });
  }

  patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const httpClient = new HTTPClient(
  API_BASE_URL,
);
