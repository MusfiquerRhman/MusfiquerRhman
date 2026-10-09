"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
export function RetryMessage({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function retry() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/messages/${id}/retry`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not resend. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        className="button button-secondary button-small"
        onClick={retry}
        disabled={busy}
      >
        <RotateCw size={14} />
        {busy ? "Sending…" : "Retry email"}
      </button>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
