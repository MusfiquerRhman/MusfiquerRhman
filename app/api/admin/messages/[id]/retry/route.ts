import { requireAdmin } from "@/lib/auth";
import { checkOrigin, HttpError, responseError } from "@/lib/http";
import { deliverMessage } from "@/lib/mail";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/i.test(id))
      throw new HttpError(400, "Invalid message.");
    await deliverMessage(id);
    return Response.json({ ok: true });
  } catch (error) {
    return responseError(error);
  }
}
