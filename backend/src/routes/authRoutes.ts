import { Router } from "express";
import { prisma } from "../prisma";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = (req.body ?? {}) as {
      email?: unknown;
      password?: unknown;
    };
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      throw new ApiError(400, "Email and password are required");
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!admin || !verifyPassword(admin.password, password)) {
      throw new ApiError(401, "Those credentials don't match our records.");
    }

    const token = signToken({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
    });
    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email },
    });
  }),
);

router.get(
  "/me",
  (req, res, next) => requireAuth(req, res, next),
  asyncHandler(async (req: AuthRequest, res) => {
    const admin = req.admin!;
    res.json({ user: { id: admin.id, name: admin.name, email: admin.email } });
  }),
);

export default router;
