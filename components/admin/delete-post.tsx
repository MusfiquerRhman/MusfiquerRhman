"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
export function DeletePost({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete the post.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="icon-button danger-button"
        aria-label={`Delete ${title}`}
        onClick={remove}
        disabled={busy}
      >
        <Trash2 size={17} />
      </button>
      {error && (
        <span className="error-text" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
