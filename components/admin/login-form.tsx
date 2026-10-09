"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      router.push("/musfiq97");
      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="login-form">
      <label htmlFor="admin-email">Email address</label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        placeholder="you@example.com"
      />
      <label htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={256}
        placeholder="Your admin password"
      />
      <button
        type="submit"
        className="button button-primary"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="spin" size={17} />
        ) : (
          <LockKeyhole size={17} />
        )}{" "}
        {pending ? "Signing in…" : "Sign in"}
        <ArrowRight size={17} />
      </button>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
