import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, HttpError, responseError } from "@/lib/http";
import { z } from "zod";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const id = z.uuid().parse((await params).id);
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{ name: string }>(
        "SELECT name FROM blog_tags WHERE id = $1 FOR UPDATE",
        [id],
      );
      if (!rows.length) throw new HttpError(404, "Tag not found.");
      await client.query(
        "UPDATE posts SET tags = array_remove(tags, $1), updated_at = NOW() WHERE tags @> ARRAY[$1]::text[]",
        [rows[0].name],
      );
      await client.query("DELETE FROM blog_tags WHERE id = $1", [id]);
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
