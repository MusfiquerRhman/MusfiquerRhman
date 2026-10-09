import "server-only";
import type { PoolClient } from "pg";
import { cache } from "react";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";

export type BlogTag = { id: string; name: string; post_count: number };

export const blogTags = cache(async (publishedOnly = false) => {
  if (!process.env.DATABASE_URL) return [];
  const { rows } = await db().query<BlogTag>(
    `SELECT t.id, t.name, count(p.id)::int AS post_count FROM blog_tags t
     LEFT JOIN posts p ON p.tags @> ARRAY[t.name]::text[] AND ($1 = false OR p.published = true)
     GROUP BY t.id HAVING ($1 = false OR count(p.id) > 0) ORDER BY lower(t.name)`,
    [publishedOnly],
  );
  return rows;
});

export async function resolvePostTags(client: PoolClient, names: string[]) {
  if (!names.length) return [];
  const normalized = [...new Set(names.map((name) => name.toLowerCase()))];
  const { rows } = await client.query<{ name: string }>(
    "SELECT name FROM blog_tags WHERE lower(name) = ANY($1::text[]) ORDER BY id FOR SHARE",
    [normalized],
  );
  if (rows.length !== normalized.length)
    throw new HttpError(
      400,
      "A selected tag no longer exists. Refresh the editor and choose your tags again.",
    );
  const canonical = new Map(rows.map(({ name }) => [name.toLowerCase(), name]));
  return normalized.map((name) => canonical.get(name)!);
}
