import { checkPassword, createSession } from "@/lib/auth";
import {
  checkOrigin,
  fingerprint,
  HttpError,
  rateLimit,
  readJson,
  responseError,
} from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { profile } from "@/lib/site";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const data = loginSchema.parse(await readJson(request, 2000));
    await rateLimit(`login:${fingerprint(request)}`, 10, 900);
    const valid = await checkPassword(data.password);
    if (
      !valid ||
      data.email.toLowerCase() !==
        (process.env.ADMIN_EMAIL || profile.email).toLowerCase()
    )
      throw new HttpError(401, "The email or password is incorrect.");
    await createSession();
    return Response.json({ ok: true });
  } catch (error) {
    return responseError(error);
  }
}
