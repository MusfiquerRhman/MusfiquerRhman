import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, readJson, responseError, HttpError } from "@/lib/http";
import { postSchema } from "@/lib/validation";
import { resolvePostTags } from "@/lib/tags";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const p = postSchema.parse(await readJson(request));
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      const tags = await resolvePostTags(client, p.tags);
      const { rows } = await client.query(
        `INSERT INTO posts (title, slug, excerpt, content, tags, published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6 THEN NOW() ELSE NULL END) RETURNING id`,
        [p.title, p.slug, p.excerpt, p.content, tags, p.published],
      );
      await client.query("COMMIT");
      return Response.json({ id: rows[0].id }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505")
      return responseError(
        new HttpError(409, "That URL is already used by another post."),
      );
    return responseError(error);
  }
}
