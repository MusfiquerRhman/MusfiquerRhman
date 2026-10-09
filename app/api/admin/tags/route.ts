import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, readJson, responseError, HttpError } from "@/lib/http";
import { tagSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const { name } = tagSchema.parse(await readJson(request));
    const { rows } = await db().query(
      "INSERT INTO blog_tags (name) VALUES ($1) RETURNING id, name",
      [name],
    );
    return Response.json(
      { tag: { ...rows[0], post_count: 0 } },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: string }).code === "23505")
      return responseError(
        new HttpError(
          409,
          "That tag already exists. Choose it from your tag library.",
        ),
      );
    return responseError(error);
  }
}
