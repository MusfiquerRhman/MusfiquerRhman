"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, CheckCircle2 } from "lucide-react";
export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const result = await response.json();
      setFeedback({ text: result.error || result.message, ok: response.ok });
      if (response.ok) form.reset();
    } catch {
      setFeedback({
        text: "Could not connect. Please try again or send me an email.",
        ok: false,
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-topline">
        <span className="green">~/new-message</span>
        <span>01 → 03</span>
      </div>
      <label htmlFor="contact-email">
        Your email <span>*</span>
      </label>
      <input
        id="contact-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        maxLength={254}
        required
      />
      <label htmlFor="contact-title">
        What’s on your mind? <span>*</span>
      </label>
      <input
        id="contact-title"
        name="title"
        placeholder="A project, an idea, or just hello"
        minLength={3}
        maxLength={150}
        required
      />
      <label htmlFor="contact-message">
        Your message <span>*</span>
      </label>
      <textarea
        id="contact-message"
        name="message"
        placeholder="Tell me a little more…"
        rows={4}
        minLength={10}
        maxLength={10000}
        required
      />
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <button
        className="button button-primary"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            Sending <LoaderCircle size={17} className="spin" />
          </>
        ) : (
          <>
            Send message <ArrowUpRight size={18} />
          </>
        )}
      </button>
      {feedback && (
        <p
          className={`form-feedback ${feedback.ok ? "success" : "error-text"}`}
          role="status"
        >
          {feedback.ok && <CheckCircle2 size={16} />}
          {feedback.text}
        </p>
      )}
      <p className="form-note">Your message comes straight to my inbox.</p>
    </form>
  );
}
