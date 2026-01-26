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

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have permission to perform this action",
        requiredRoles: roles,
      });
    }

    next();
  };
};

/**
 * Basic token authentication middleware
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Missing Token",
        message: "Authorization header with Bearer token is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Validate token structure
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({
        success: false,
        error: "Invalid Token",
        message: "Token payload is malformed",
      });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token Expired",
        message: "Your session has expired. Please login again.",
        expiredAt: err.expiredAt,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid Token",
        message: "The provided token is invalid or malformed",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Authentication Failed",
      message: "Authentication failed. Please try again.",
    });
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      req.user = decoded;
    }
  } catch (err) {
    // Silently fail for optional auth
  }
  next();
}

/**
 * Sign JWT
 */
export function signJwt(
  payload: AuthPayload,
  options: jwt.SignOptions = { expiresIn: "7d" },
): string {
  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
}

/**
 * Verify token without throwing errors
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Logout - simplified without blacklisting
 */
export function logout(
  token: string,
  userId?: string,
  sessionId?: string,
): void {
  console.log(`✅ User ${userId} logged out successfully`);
}

/**
 * Validate user permissions for specific resource
 */
export function validateResourceAccess(
  req: AuthenticatedRequest,
  resourceUserId: string,
  resourceTenantId?: string,
): boolean {
  const user = req.user;
  if (!user) return false;

  // SuperAdmin has access to everything
  if (user.role === "superadmin") return true;

  // Tenant Admin has access to resources in their tenant
  if (user.role === "tenantAdmin") {
    if (resourceTenantId && user.tenantId === resourceTenantId) {
      return true;
    }
  }

  // Regular users can only access their own resources
  if (user.userId === resourceUserId) return true;

  return false;
}

/**
 * Middleware to validate resource ownership
 */
export const requireResourceOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resourceUserId = req.params.userId || req.body.userId;
  const resourceTenantId = req.params.tenantId || req.body.tenantId;

  if (!validateResourceAccess(req, resourceUserId, resourceTenantId)) {
    console.warn(
      `🚫 Unauthorized resource access attempt by user ${req.user?.userId}`,
    );
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "You do not have permission to access this resource",
    });
  }

  next();
};
