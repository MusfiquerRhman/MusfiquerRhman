import { db } from "@/lib/db";
import {
  checkOrigin,
  fingerprint,
  rateLimit,
  readJson,
  responseError,
} from "@/lib/http";
import { deliverMessage } from "@/lib/mail";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const data = contactSchema.parse(await readJson(request, 45000));
    if (data.website) return Response.json({ message: "Message received." });
    await rateLimit(`contact-ip:${fingerprint(request)}`, 10, 600);
    await rateLimit(`contact-email:${data.email.toLowerCase()}`, 3, 600);
    const { rows } = await db().query<{ id: string }>(
      "INSERT INTO contact_messages (title, email, message) VALUES ($1, $2, $3) RETURNING id",
      [data.title, data.email, data.message],
    );
    try {
      await deliverMessage(rows[0].id);
      return Response.json(
        { message: "Message sent. Thanks for reaching out!" },
        { status: 201 },
      );
    } catch {
      return Response.json(
        {
          message:
            "Your message is saved, but email delivery is delayed. For something urgent, please use email or WhatsApp.",
        },
        { status: 202 },
      );
    }
  } catch (error) {
    return responseError(error);
  }
}
