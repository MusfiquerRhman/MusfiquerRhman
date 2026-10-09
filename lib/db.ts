import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const globalDb = globalThis as unknown as { portfolioPool?: Pool };

export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured.");
  if (!globalDb.portfolioPool) {
    const connectionUrl = new URL(process.env.DATABASE_URL);
    // Keep pg's existing certificate and hostname verification explicit.
    if (connectionUrl.searchParams.get("sslmode") === "require") {
      connectionUrl.searchParams.set("sslmode", "verify-full");
    }
    globalDb.portfolioPool = new Pool({
      connectionString: connectionUrl.toString(),
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
    if (process.env.VERCEL === "1") attachDatabasePool(globalDb.portfolioPool);
    globalDb.portfolioPool.on("error", () =>
      console.error("A PostgreSQL connection failed."),
    );
  }
  return globalDb.portfolioPool;
}
