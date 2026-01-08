import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";


const JWT_SECRET: string = process.env.JWT_SECRET || "jwt-secret-change-me";

export interface AuthPayload extends JwtPayload {
  userId: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "no token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ error: "invalid token" });
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
