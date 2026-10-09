import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
if (!existsSync(".env.local"))
  throw new Error("Run npm run setup:local first.");
process.loadEnvFile(".env.local");
const password =
  process.env.ADMIN_NEW_PASSWORD || randomBytes(18).toString("base64url");
if (password.length < 16 || password.length > 256)
  throw new Error("Use a password between 16 and 256 characters.");
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const current = readFileSync(".env.local", "utf8");
const updated = /^ADMIN_PASSWORD_HASH=.*$/m.test(current)
  ? current.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`)
  : `${current}\nADMIN_PASSWORD_HASH=${hash}\n`;
writeFileSync(".env.local", updated, { mode: 0o600 });
mkdirSync(".local", { recursive: true });
writeFileSync(
  ".local/admin-access.txt",
  `Private admin access\n\nURL: ${process.env.SITE_URL || "http://localhost:3000"}/musfiq97\nEmail: ${process.env.ADMIN_EMAIL || "musfiquerrhman@gmail.com"}\nPassword: ${password}\n\nNever share or commit this file.\n`,
  { mode: 0o600 },
);
console.log(
  "Password rotated. Read .local/admin-access.txt privately. Restart the website to apply the change; existing sessions will be invalidated.",
);
