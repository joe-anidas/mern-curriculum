import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "server error" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "route not found" });
}

export function asyncHandler<
  T extends (req: Request, res: Response, next: NextFunction) => Promise<any>
>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
