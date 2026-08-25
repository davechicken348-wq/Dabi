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

// GET endpoints consumed by the public site stay open; everything else under
// /api requires a valid admin token.
const PUBLIC_GET = [/^\/hostels(\/[^/]+)?$/, /^\/facilities(\/[^/]+)?$/];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../uploads");

const app: Express = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Dabi API" });
});

app.use("/uploads", express.static(uploadDir));

app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/auth")) return next();
  if (req.method === "GET" && PUBLIC_GET.some((re) => re.test(req.path))) {
    return next();
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
