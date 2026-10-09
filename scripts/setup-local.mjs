import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";

if (existsSync(".env.local")) {
  console.log(
    "Your existing .env.local is preserved. Run npm run db:start to start the local database.",
  );
  process.exit(0);
}
mkdirSync(".local", { recursive: true });
const databasePassword = randomBytes(24).toString("hex");
const adminPassword = randomBytes(18).toString("base64url");
const salt = randomBytes(16).toString("hex");
const passwordHash = `scrypt:${salt}:${scryptSync(adminPassword, salt, 64).toString("hex")}`;
writeFileSync(
  ".env.local",
  `# Private local configuration. Never commit this file.\nDATABASE_URL=postgresql://portfolio:${databasePassword}@127.0.0.1:15432/portfolio\nSITE_URL=http://localhost:3000\nADMIN_EMAIL=musfiquerrhman@gmail.com\nADMIN_PASSWORD_HASH=${passwordHash}\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\nSMTP_SECURE=true\nSMTP_USER=musfiquerrhman@gmail.com\nSMTP_PASSWORD=\nSMTP_FROM=\"Musfiquer Rhman <musfiquerrhman@gmail.com>\"\nCONTACT_TO=musfiquerrhman@gmail.com\nTRUST_PROXY=false\n`,
  { mode: 0o600, flag: "wx" },
);
writeFileSync(
  ".local/admin-access.txt",
  `Private admin access\n\nURL: http://localhost:3000/musfiq97\nEmail: musfiquerrhman@gmail.com\nPassword: ${adminPassword}\n\nThis password is generated for your local installation. Rotate it with npm run admin:password.\nNever share or commit this file.\n`,
  { mode: 0o600 },
);
console.log(
  "Local configuration created. Your admin password is saved privately in .local/admin-access.txt.",
);
console.log(
  "Next: npm run db:start (keep it running), then npm run dev in another terminal.",
);
