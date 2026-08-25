import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export interface AdminClaim {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  admin?: AdminClaim;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  (req as AuthRequest).admin = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  };
  next();
}
