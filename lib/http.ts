import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { allowedOrigins } from "@/lib/site";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin))
    throw new HttpError(
      403,
      "This request could not be verified. Refresh and try again.",
    );
}

export async function readJson(request: Request, maxBytes = 420000) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Please send JSON.");
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new HttpError(413, "Your message is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Please provide a request body.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Your message is too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "The submitted data could not be read.");
  }
}

export function responseError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError)
    return Response.json(
      { error: error.issues[0]?.message || "Please check the fields." },
      { status: 400 },
    );
  console.error(
    "A request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return Response.json(
    {
      error: "Something went wrong. Please try again, or contact me by email.",
    },
    { status: 503 },
  );
}

export function fingerprint(request: Request) {
  // Never trust a client-supplied IP header unless the deployment proxy sanitizes it.
  const ip =
    process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
      : "local";
  return createHash("sha256").update(ip).digest("hex");
}

export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number,
) {
  const hashed = createHash("sha256").update(key).digest("hex");
  const { rows } = await db().query<{ hits: number }>(
    `INSERT INTO rate_limits (key, hits, reset_at) VALUES ($1, 1, NOW() + $2 * INTERVAL '1 second')
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.hits + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN NOW() + $2 * INTERVAL '1 second' ELSE rate_limits.reset_at END
     RETURNING hits`,
    [hashed, windowSeconds],
  );
  if (rows[0].hits > max)
    throw new HttpError(
      429,
      "Too many attempts. Please try again in a few minutes.",
    );
}
