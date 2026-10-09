"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, LoaderCircle } from "lucide-react";
import type { BlogTag } from "@/lib/tags";

export function TagManager({ initial }: { initial: BlogTag[] }) {
  const [tags, setTags] = useState(initial);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy("create");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setTags((current) =>
        [...current, data.tag].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setNotice(`“${data.tag.name}” is ready to use in your posts.`);
    } catch {
      setError("Could not create the tag. Please try again.");
    } finally {
      setBusy("");
    }
  }
  async function remove(tag: BlogTag) {
    setBusy(tag.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setTags((current) => current.filter((item) => item.id !== tag.id));
      setConfirm("");
      setNotice(`“${tag.name}” was removed from your library and posts.`);
    } catch {
      setError("Could not remove the tag. Please try again.");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
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
      <form className="tag-create-panel" onSubmit={create}>
        <label htmlFor="new-tag-name">New tag name</label>
        <div className="inline-tag-create">
          <input
            id="new-tag-name"
            required
            maxLength={30}
            value={name}
            disabled={!!busy}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. TypeScript, Data science"
          />
          <button
            className="button button-primary"
            disabled={!!busy || !name.trim()}
          >
            {busy === "create" ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Plus size={16} />
            )}{" "}
            Create tag
          </button>
        </div>
        <p className="form-note">
          Up to 30 characters. Each post can have up to eight tags.
        </p>
      </form>
      <div className="tag-library-heading">
        <span className="section-index">YOUR TAG LIBRARY</span>
        <span className="mono">{tags.length} tags</span>
      </div>
      <div className="tag-library">
        {tags.map((tag) => (
          <div className="tag-library-row" key={tag.id}>
            <div className="tag-library-name">
              <Tag size={17} className="green" />
              <div>
                <strong>{tag.name}</strong>
                <span>
                  {tag.post_count} {tag.post_count === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>
            {confirm === tag.id ? (
              <div className="tag-delete-confirm">
                <p>
                  Remove from all {tag.post_count}{" "}
                  {tag.post_count === 1 ? "post" : "posts"}?
                </p>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={!!busy}
                  onClick={() => setConfirm("")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-secondary danger-button"
                  disabled={!!busy}
                  onClick={() => remove(tag)}
                >
                  Remove tag
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="icon-button danger-button"
                disabled={!!busy}
                aria-label={`Delete tag ${tag.name}`}
                onClick={() => setConfirm(tag.id)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {!tags.length && (
          <div className="admin-empty">
            <Tag size={36} className="green" />
            <h2>Give your ideas a topic.</h2>
            <p>
              Create tags to organize your posts and help readers find what
              interests them.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
