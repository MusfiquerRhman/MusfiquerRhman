import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { profile } from "@/lib/site";

export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_FROM &&
    (process.env.SMTP_PASSWORD || process.env.SMTP_ALLOW_LOCAL === "true"),
  );
}

export async function deliverMessage(id: string) {
  if (!mailConfigured())
    throw new HttpError(
      503,
      "Email delivery is not available yet. Please use the direct email link.",
    );
  // Claim a message atomically so concurrent retries cannot deliver it twice.
  const { rows } = await db().query<{
    title: string;
    email: string;
    message: string;
  }>(
    `UPDATE contact_messages SET delivery_status = 'sending', updated_at = NOW()
     WHERE id = $1 AND (delivery_status IN ('pending', 'failed') OR (delivery_status = 'sending' AND updated_at < NOW() - INTERVAL '5 minutes'))
     RETURNING title, email, message`,
    [id],
  );
  if (!rows[0]) return;
  const { title, email, message } = rows[0];
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
      connectionTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    const result = await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_TO || profile.email,
      replyTo: email,
      subject: `[Portfolio] ${title.replace(/[\r\n]/g, " ")}`,
      text: `New portfolio message\n\nTitle: ${title}\nVisitor email: ${email}\n\n${message}`,
    });
    if (!result.accepted?.length)
      throw new Error("The mail server did not accept the message.");
    await db().query(
      "UPDATE contact_messages SET delivery_status = 'sent', updated_at = NOW() WHERE id = $1",
      [id],
    );
  } catch (error) {
    await db().query(
      "UPDATE contact_messages SET delivery_status = 'failed', updated_at = NOW() WHERE id = $1",
      [id],
    );
    throw error;
  }
}
