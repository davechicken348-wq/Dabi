import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../utils/errors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads");

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const bucket = (process.env.SUPABASE_BUCKET ?? "hostels").trim();

const client: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (!client || bucketReady) return;
  const { error } = await client.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  // A 409 ("already exists") is fine — the bucket was created out of band.
  if (error && !/already exists/i.test(error.message)) {
    throw new ApiError(500, `Storage bucket error: ${error.message}`);
  }
  bucketReady = true;
}

/**
 * Persists an uploaded image. When Supabase is configured (SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY) the file is stored in the Supabase bucket and a
 * public URL is returned; otherwise it falls back to the local /uploads dir
 * so local development keeps working without any cloud setup.
 */
export async function saveImage(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  origin?: string,
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase().slice(0, 12) || ".jpg";
  const filename = `${randomUUID()}${ext}`;

  if (client) {
    await ensureBucket();
    const { error } = await client.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: mimetype, upsert: true });
    if (error) throw new ApiError(500, `Upload failed: ${error.message}`);
    const { data } = client.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  // Return an absolute URL so the image resolves from any frontend origin
  // (the Vite dev server can't serve /uploads itself).
  return origin ? `${origin}/uploads/${filename}` : `/uploads/${filename}`;
}
