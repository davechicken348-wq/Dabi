import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import { saveImage } from "../services/storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post(
  "/",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "No image was uploaded");
    }
    const origin = `${req.protocol}://${req.get("host")}`;
    const hostelId =
      typeof req.body?.hostelId === "string" ? req.body.hostelId : undefined;
    const url = await saveImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      origin,
      hostelId,
    );
    res.status(201).json({ url });
  }),
);

export default router;
