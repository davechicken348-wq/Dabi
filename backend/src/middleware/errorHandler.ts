import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image is too large (max 5MB)"
        : err.message;
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      res.status(409).json({ error: `Duplicate value for ${target ?? "field"}` });
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
