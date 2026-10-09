import { redirect } from "next/navigation";
import { Mail, ArrowUpRight } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/posts";
import { mailConfigured } from "@/lib/mail";
import { AdminShell } from "@/components/admin/shell";
import { RetryMessage } from "@/components/admin/retry-message";
export const dynamic = "force-dynamic";
type Message = {
  id: string;
  title: string;
  email: string;
  message: string;
  delivery_status: string;
  created_at: Date;
};
export default async function Messages() {
  if (!(await isAdmin())) redirect("/musfiq97/login");
  const { rows } = await db().query<Message>(
    "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200",
  );
  return (
    <AdminShell>
      <div className="admin-page-heading">
        <div>
          <span className="section-index">WORKSPACE / INBOX</span>
          <h1>
            Good conversations start here<span className="green">.</span>
          </h1>
          <p>Contact form messages are stored here and sent to your email.</p>
        </div>
      </div>
      {!mailConfigured() && (
        <p className="alert-info">
          Connect your email service in the private configuration file to enable
          the contact form.
        </p>
      )}
      {rows.length ? (
        <div className="message-list">
          {rows.map((message) => (
            <article className="message-card" key={message.id}>
              <header>
                <div>
                  <h2>{message.title}</h2>
                  <a className="text-link" href={`mailto:${message.email}`}>
                    {message.email}
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                <span
                  className={`status-badge ${message.delivery_status === "sent" ? "published" : "draft"}`}
                >
                  {message.delivery_status === "sent"
                    ? "Email sent"
                    : message.delivery_status === "sending"
                      ? "Sending"
                      : "Email pending"}
                </span>
              </header>
              <p className="message-body">{message.message}</p>
              <footer>
                <span>{formatDate(message.created_at)}</span>
                {message.delivery_status !== "sent" && (
                  <RetryMessage id={message.id} />
                )}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <Mail size={40} className="green" />
          <h2>Your inbox is quiet.</h2>
          <p>New messages from the contact form will appear here.</p>
        </div>
      )}
    </AdminShell>
  );
}
