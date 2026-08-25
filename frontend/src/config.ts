// Centralized environment configuration.
//
// The app runs in two environments: local dev (Vite on :5173 + backend on
// :4000) and production (Vercel frontend + Render backend). This module is the
// single source of truth for environment-dependent URLs so the rest of the
// codebase never hardcodes localhost or the live URL.
//
//   - API_BASE: prefers VITE_API_URL (set per environment, e.g. on Vercel),
//     and falls back to the local backend when running in dev.
//   - Image URLs returned by the backend are always absolute, so they resolve
//     correctly from any frontend origin.

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

function env(name: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  return value?.trim() ?? "";
}

export const IS_DEV = isDev;
export const IS_PROD = isProd;

export const API_BASE = (() => {
  const configured = env("VITE_API_URL").replace(/\/$/, "");
  if (configured) return configured;
  return isDev ? "http://localhost:4000" : "";
})();

export const GOOGLE_MAPS_API_KEY = env("VITE_GOOGLE_MAPS_API_KEY");

if (IS_PROD && !env("VITE_API_URL")) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_URL is not set — API calls will target the current origin, which has no backend on Vercel.",
  );
}
