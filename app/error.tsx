"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container not-found">
      <span className="section-index">CONNECTION / INTERRUPTED</span>
      <h1>
        Let’s try that again<span className="green">.</span>
      </h1>
      <p>This page is temporarily unavailable.</p>
      <button className="button button-primary" onClick={reset}>
        Try again ↗
      </button>
      <Link className="text-link" href="/">
        Return home
      </Link>
    </main>
  );
}
