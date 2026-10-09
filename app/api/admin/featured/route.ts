import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, readJson, responseError, HttpError } from "@/lib/http";
import { featuredSchema } from "@/lib/validation";

export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const { slots } = featuredSchema.parse(await readJson(request));
    const ids = slots.filter((id) => id !== null);
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      // Serialize complete slot replacements so two editors cannot mix selections.
      await client.query("SELECT pg_advisory_xact_lock(80642, 1)");
      const { rows } = await client.query<{ id: string; published: boolean }>(
        "SELECT id, published FROM posts WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [ids],
      );
      if (rows.length !== ids.length || rows.some((post) => !post.published))
        throw new HttpError(
          400,
          "Only published posts can be featured. Refresh your selections and try again.",
        );
      await client.query("DELETE FROM featured_posts");
      for (const [index, id] of slots.entries()) {
        if (id)
          await client.query(
            "INSERT INTO featured_posts (slot, post_id) VALUES ($1, $2)",
            [index + 1, id],
          );
      }
      await client.query("COMMIT");
      return Response.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return responseError(error);
  }
}
