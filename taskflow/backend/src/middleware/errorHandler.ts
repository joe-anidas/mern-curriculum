import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("❌ Error:", {
    name: err.name,
    message: err.message,
    status: err.status,
    path: req.path,
    method: req.method,
  });

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((error: any) => error.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: messages,
      details: err.errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: "Duplicate Entry",
      message: `A record with this ${field} already exists`,
      field,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID Format",
      message: `Invalid ${err.kind} format: ${err.value}`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token Expired",
      message: "Your token has expired. Please login again",
      expiredAt: err.expiredAt,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";

  res.status(status).json({
    success: false,
    error: err.name || "Internal Server Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl,
  });
}

export function asyncHandler<
  T extends (req: Request, res: Response, next: NextFunction) => Promise<any>
>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
