"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, LoaderCircle, ArrowUpRight, Star } from "lucide-react";

type Choice = { id: string; title: string; slug: string; excerpt: string };
export function FeaturedEditor({
  posts,
  initial,
}: {
  posts: Choice[];
  initial: (string | null)[];
}) {
  const [slots, setSlots] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function select(index: number, value: string) {
    setSlots((current) =>
      current.map((id, i) => (i === index ? value || null : id)),
    );
    setNotice("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setNotice(
        "Your homepage selection is saved. Visitors will see these posts in this order.",
      );
    } catch {
      setError("Could not save the selection. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save}>
      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="alert-success" role="status">
          {notice}
        </p>
      )}
      {!posts.length && (
        <p className="alert-info">
          Publish a post first, then choose it for the homepage.{" "}
          <Link href="/musfiq97/new" className="text-link">
            Write a post <ArrowUpRight size={15} />
          </Link>
        </p>
      )}
      <div className="featured-slot-grid">
        {slots.map((id, index) => {
          const post = posts.find((post) => post.id === id);
          return (
            <div className="featured-slot" key={index}>
              <span className="section-index">
                <Star size={14} /> HOMEPAGE / 0{index + 1}
              </span>
              <label htmlFor={`featured-slot-${index}`}>
                Featured post {index + 1}
              </label>
              <select
                id={`featured-slot-${index}`}
                value={id ?? ""}
                disabled={busy}
                onChange={(event) => select(index, event.target.value)}
              >
                <option value="">Leave this slot empty</option>
                {posts.map((post) => (
                  <option
                    key={post.id}
                    value={post.id}
                    disabled={slots.includes(post.id) && post.id !== id}
                  >
                    {post.title}
                  </option>
                ))}
              </select>
              {post ? (
                <div className="featured-slot-preview">
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-link"
                  >
                    Read post <ArrowUpRight size={15} />
                  </Link>
                </div>
              ) : (
                <p className="featured-slot-placeholder">
                  Choose a published post to feature here.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="featured-save-row">
        <p className="form-note">
          {slots.filter(Boolean).length}/3 selected. Unpublishing or deleting a
          featured post removes it from the homepage.
        </p>
        <button className="button button-primary" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Save size={16} />
          )}{" "}
          Save featured posts
        </button>
      </div>
    </form>
  );
}
