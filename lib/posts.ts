import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export async function publishedPosts(limit = 100, tag?: string) {
  if (!process.env.DATABASE_URL) return [];
  const { rows } = await db().query<Post>(
    `SELECT * FROM posts WHERE published = true
     AND ($2::text IS NULL OR tags @> ARRAY[$2]::text[])
     ORDER BY published_at DESC LIMIT $1`,
    [limit, tag ?? null],
  );
  return rows;
}

export async function featuredPosts() {
  if (!process.env.DATABASE_URL) return [];
  const { rows } = await db().query<Post>(
    `SELECT p.* FROM featured_posts f JOIN posts p ON p.id = f.post_id
     WHERE p.published = true ORDER BY f.slot`,
  );
  return rows;
}

export const postBySlug = cache(async (slug: string) => {
  if (!process.env.DATABASE_URL) return null;
  const { rows } = await db().query<Post>(
    "SELECT * FROM posts WHERE slug = $1 AND published = true",
    [slug],
  );
  return rows[0] || null;
});

export function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}
