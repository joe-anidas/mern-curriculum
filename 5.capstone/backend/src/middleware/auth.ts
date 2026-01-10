import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { UserRole } from "../models/User";

export interface AuthPayload extends JwtPayload {
  userId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  tenantId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Missing token",
        message: "Authorization header with Bearer token is required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Your session has expired. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
      message: "The provided token is invalid or malformed",
    });
  }
}

export function signJwt(
  payload: AuthPayload,
  options: jwt.SignOptions = { expiresIn: "1h" }
) {
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}
