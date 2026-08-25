import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

interface EnvConfig {
  NODE_ENV: NodeEnv;
  PORT: number;
  DATABASE_URL: string;
  CLIENT_URL: string;
  JWT_SECRET: string;
}

function fail(name: string, reason: string): never {
  throw new Error(`Invalid environment variable ${name}: ${reason}`);
}

function asString(name: string, raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") {
    fail(name, "is required and must be a non-empty string");
  }
  return raw.trim();
}

function asPort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return 4000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail("PORT", `"${raw}" is not a valid port (1-65535)`);
  }
  return port;
}

function asNodeEnv(raw: string | undefined): NodeEnv {
  const value = (raw ?? "development").trim().toLowerCase();
  if (value === "development" || value === "production" || value === "test") {
    return value;
  }
  fail("NODE_ENV", `"${raw}" must be development, production or test`);
}

const isProd = (process.env.NODE_ENV ?? "development").toLowerCase() === "production";

const DATABASE_URL = asString("DATABASE_URL", process.env.DATABASE_URL);
if (!/^postgresql:\/\//i.test(DATABASE_URL)) {
  fail("DATABASE_URL", "must be a postgresql:// connection string");
}

const CLIENT_URL = asString("CLIENT_URL", process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
try {
  // eslint-disable-next-line no-new
  new URL(CLIENT_URL);
} catch {
  fail("CLIENT_URL", `"${CLIENT_URL}" is not a valid URL`);
}

// Required in production; generated fallback in dev/test (not for real use).
let JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET) {
  if (isProd) fail("JWT_SECRET", "is required in production");
  JWT_SECRET =
    "dev-insecure-secret-change-me-" + Math.random().toString(36).slice(2);
}

export const env: EnvConfig = {
  NODE_ENV: asNodeEnv(process.env.NODE_ENV),
  PORT: asPort(process.env.PORT),
  DATABASE_URL,
  CLIENT_URL,
  JWT_SECRET,
};
