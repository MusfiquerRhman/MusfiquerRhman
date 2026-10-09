import { endSession } from "@/lib/auth";
import { checkOrigin, responseError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await endSession();
    return Response.json({ ok: true });
  } catch (error) {
    return responseError(error);
  }
}
