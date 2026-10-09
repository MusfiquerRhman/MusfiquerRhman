import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { siteUrl } from "@/lib/site";

const deriveKey = promisify(scrypt);
const cookieName = "mr_admin_session";
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const passwordVersion = () => tokenHash(process.env.ADMIN_PASSWORD_HASH || "");

export async function checkPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash))
    throw new HttpError(503, "Admin access has not been configured yet.");
  const [, salt, expected] = hash.split(":");
  const actual = (await deriveKey(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}

export async function createSession() {
  const token = randomBytes(32).toString("hex");
  await db().query("DELETE FROM admin_sessions WHERE expires_at < NOW()");
  await db().query(
    "INSERT INTO admin_sessions (token_hash, password_version, expires_at) VALUES ($1, $2, NOW() + INTERVAL '8 hours')",
    [tokenHash(token), passwordVersion()],
  );
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: siteUrl().protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
}

export async function isAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  if (
    !token ||
    !/^[a-f0-9]{64}$/.test(token) ||
    !process.env.DATABASE_URL ||
    !process.env.ADMIN_PASSWORD_HASH
  )
    return false;
  const { rows } = await db().query(
    "SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND password_version = $2 AND expires_at > NOW()",
    [tokenHash(token), passwordVersion()],
  );
  return rows.length === 1;
}

export async function requireAdmin() {
  if (!(await isAdmin()))
    throw new HttpError(401, "Your session has expired. Please sign in again.");
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token && process.env.DATABASE_URL)
    await db().query("DELETE FROM admin_sessions WHERE token_hash = $1", [
      tokenHash(token),
    ]);
  store.delete(cookieName);
}
