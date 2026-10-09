import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, HttpError, readJson, responseError } from "@/lib/http";
import { postSchema } from "@/lib/validation";
import { resolvePostTags } from "@/lib/tags";

type Context = { params: Promise<{ id: string }> };
async function authorize(request: Request, context: Context) {
  checkOrigin(request);
  await requireAdmin();
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new HttpError(400, "Invalid post.");
  return id;
}

export async function PUT(request: Request, context: Context) {
  try {
    const id = await authorize(request, context);
    const p = postSchema.parse(await readJson(request));
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      const tags = await resolvePostTags(client, p.tags);
      const result = await client.query(
        `UPDATE posts SET title=$1, slug=$2, excerpt=$3, content=$4, tags=$5, published=$6,
         published_at=CASE WHEN $6 THEN COALESCE(published_at, NOW()) ELSE published_at END,
         updated_at=NOW() WHERE id=$7 RETURNING id`,
        [p.title, p.slug, p.excerpt, p.content, tags, p.published, id],
      );
      if (!result.rowCount) throw new HttpError(404, "Post not found.");
      if (!p.published)
        await client.query("DELETE FROM featured_posts WHERE post_id = $1", [
          id,
        ]);
      await client.query("COMMIT");
      return Response.json({ id });
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

export async function DELETE(request: Request, context: Context) {
  try {
    const id = await authorize(request, context);
    const result = await db().query("DELETE FROM posts WHERE id=$1", [id]);
    if (!result.rowCount) throw new HttpError(404, "Post not found.");
    return Response.json({ ok: true });
  } catch (error) {
    return responseError(error);
  }
}
