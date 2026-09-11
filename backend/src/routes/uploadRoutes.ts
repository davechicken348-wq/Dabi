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
  upload.any(),
  asyncHandler(async (req, res) => {
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const uploadedFile = uploadedFiles.find(
      (file) => file && typeof file === "object" && "fieldname" in file,
    ) ?? undefined;

    if (!uploadedFile || !("buffer" in uploadedFile) || !("originalname" in uploadedFile)) {
      throw new ApiError(400, "No image was uploaded");
    }

    const origin = `${req.protocol}://${req.get("host")}`;
    const folder =
      typeof req.body?.folder === "string"
        ? req.body.folder
        : typeof req.body?.hostelId === "string"
          ? req.body.hostelId
          : undefined;

    const url = await saveImage(
      uploadedFile.buffer,
      uploadedFile.originalname,
      uploadedFile.mimetype,
      origin,
      folder,
    );

    res.status(201).json({ url });
  }),
);

export default router;
