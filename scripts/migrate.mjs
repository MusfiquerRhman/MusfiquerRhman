import { existsSync, readFileSync } from "node:fs";
import pg from "pg";
if (process.env.DEPLOYMENT_ENV_FILE) {
  process.loadEnvFile(process.env.DEPLOYMENT_ENV_FILE);
} else if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before running migrations.");
const connectionUrl = new URL(
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
);
if (connectionUrl.searchParams.get("sslmode") === "require")
  connectionUrl.searchParams.set("sslmode", "verify-full");
const client = new pg.Client({ connectionString: connectionUrl.toString() });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query(readFileSync("database/schema.sql", "utf8"));
  await client.query("COMMIT");
  console.log("Portfolio database schema is ready.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
