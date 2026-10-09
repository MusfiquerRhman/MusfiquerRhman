import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

if (!existsSync(".vercel/project.json"))
  throw new Error("Link the Vercel project before configuring it.");
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const cli =
  process.env.VERCEL_CLI_FILE ||
  join(process.env.APPDATA, "npm/node_modules/vercel/dist/vc.js");
if (!existsSync(cli))
  throw new Error(
    "Set VERCEL_CLI_FILE to the installed Vercel CLI entry point.",
  );
const config = resolve(".local/vercel-cli");
mkdirSync(".local", { recursive: true });

const accessFile = ".local/production-admin-access.txt";
const existing = existsSync(accessFile)
  ? readFileSync(accessFile, "utf8").match(/^Password: (.+)$/m)?.[1]
  : undefined;
const password = existing || randomBytes(18).toString("base64url");
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const email = process.env.ADMIN_EMAIL || "musfiquerrhman@gmail.com";
if (!existing)
  writeFileSync(
    accessFile,
    `Private production admin access\n\nURL: deployment pending\nEmail: ${email}\nPassword: ${password}\n\nThis password is separate from your local admin password. Never share or commit this file.\n`,
    { mode: 0o600, flag: "wx" },
  );

const values = {
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD_HASH: hash,
  CONTACT_TO: process.env.CONTACT_TO || "musfiquerrhman@gmail.com",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT || "465",
  SMTP_SECURE: process.env.SMTP_SECURE || "true",
  SMTP_USER: process.env.SMTP_USER || email,
  SMTP_FROM: process.env.SMTP_FROM || `Musfiquer Rhman <${email}>`,
  TRUST_PROXY: "true",
};
if (process.env.SMTP_PASSWORD) values.SMTP_PASSWORD = process.env.SMTP_PASSWORD;

for (const [name, value] of Object.entries(values)) {
  // Send secrets over stdin. Never put credential values in shell commands or arguments.
  const args = [
    cli,
    "env",
    "add",
    name,
    "production",
    "--yes",
    "--force",
    "--global-config",
    config,
  ];
  args.push(/PASSWORD/.test(name) ? "--sensitive" : "--no-sensitive");
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    child.stdout.on("data", () => {});
    child.stderr.on("data", () => {});
    child.on("error", () => reject(new Error(`Could not configure ${name}.`)));
    child.on("close", (code) =>
      code === 0
        ? accept()
        : reject(
            new Error(`Vercel did not accept ${name}. No values were logged.`),
          ),
    );
    child.stdin.end(value);
  });
  console.log(`Configured ${name}.`);
}
console.log(
  "Production admin credentials are saved privately in .local/production-admin-access.txt.",
);
console.log(
  process.env.SMTP_PASSWORD
    ? "SMTP credentials are configured."
    : "SMTP password is pending. Contact messages will be saved for later delivery.",
);
