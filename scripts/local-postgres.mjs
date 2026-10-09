import EmbeddedPostgres from "embedded-postgres";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

if (!existsSync(".env.local"))
  throw new Error("Run npm run setup:local first.");
process.loadEnvFile(".env.local");
const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== "127.0.0.1" || url.pathname !== "/portfolio")
  throw new Error(
    "db:start manages only the local portfolio database. Use db:migrate for an external database.",
  );
const dataDir = resolve(".local/postgres");
const server = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port),
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
});
if (!existsSync(resolve(dataDir, "PG_VERSION"))) await server.initialise();
await server.start();
const client = server.getPgClient("postgres", "127.0.0.1");
await client.connect();
try {
  const { rows } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'portfolio'",
  );
  if (!rows.length) await client.query('CREATE DATABASE "portfolio"');
} finally {
  await client.end();
}
const portfolio = server.getPgClient("portfolio", "127.0.0.1");
await portfolio.connect();
try {
  await portfolio.query("BEGIN");
  await portfolio.query(readFileSync("database/schema.sql", "utf8"));
  await portfolio.query("COMMIT");
} catch (error) {
  await portfolio.query("ROLLBACK");
  throw error;
} finally {
  await portfolio.end();
}
console.log(
  `Portfolio PostgreSQL is ready on 127.0.0.1:${url.port}. Your data is saved in .local/postgres.`,
);
console.log(
  "Keep this terminal running. Stop with Ctrl+C; your data will be preserved.",
);
const keepAlive = setInterval(() => {}, 60000);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  clearInterval(keepAlive);
  await server.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
