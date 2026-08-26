import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import { env } from "./config";
import hostelRoutes from "./routes/hostelRoutes";
import ownerRoutes from "./routes/ownerRoutes";
import enquiryRoutes from "./routes/enquiryRoutes";
import tenancyRoutes from "./routes/tenancyRoutes";
import dealRoutes from "./routes/dealRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import facilityRoutes from "./routes/facilityRoutes";
import authRoutes from "./routes/authRoutes";
import { requireAuth } from "./middleware/requireAuth";
import { errorHandler } from "./middleware/errorHandler";
import { seedIfEmpty } from "./prisma/seed";
import { clearCache } from "./utils/cache";

// GET endpoints consumed by the public site stay open; everything else under
// /api requires a valid admin token.
const PUBLIC_GET = [/^\/hostels(\/[^/]+)?$/, /^\/facilities(\/[^/]+)?$/];

// Public mutations that don't need an admin token — the enquiry form on the
// public site is a lead-capture flow, so anonymous visitors must be able to POST.
const PUBLIC_POST = [/^\/enquiries$/];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../uploads");

const app: Express = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Dabi API" });
});

// Lightweight liveness probe for uptime pingers (keeps the service awake on
// Render's free tier, which spins down after 15 min of inactivity).
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

app.use("/uploads", express.static(uploadDir));

app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/auth")) return next();
  if (req.method === "GET" && PUBLIC_GET.some((re) => re.test(req.path))) {
    return next();
  }
  if (req.method === "POST" && PUBLIC_POST.some((re) => re.test(req.path))) {
    return next();
  }
  if (req.method !== "GET") {
    // Any mutation invalidates the read cache so list/dashboard views stay fresh.
    clearCache();
  }
  return requireAuth(req, res, next);
});

app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/tenancies", tenancyRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/facilities", facilityRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Dabi backend listening on port ${env.PORT}`);
});

// Idempotently seed sample data + admin on first boot (only if the DB is empty).
seedIfEmpty().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Auto-seed failed:", err);
});
