/**
 * Application Error Types
 */

export interface APIErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export class APIError extends Error {
  statusCode: number;
  originalError: unknown;

  constructor(statusCode: number, originalError: unknown, message?: string) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(401, null, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(403, null, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Not Found") {
    super(404, null, message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends APIError {
  constructor(message = "Validation Error") {
    super(400, null, message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network Error") {
    super(message);
    this.name = "NetworkError";
  }
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof NetworkError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
