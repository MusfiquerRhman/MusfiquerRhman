"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  Mail,
  LogOut,
  ArrowUpRight,
  Plus,
  Terminal,
  Star,
  Tags,
} from "lucide-react";
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/musfiq97/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="wordmark" href="/">
          <span className="logo-mark">
            m<span>.</span>
          </span>
          <span>
            control<span className="green">_</span>room
          </span>
        </Link>
        <span className="admin-sidebar-label">YOUR WORKSPACE</span>
        <nav aria-label="Admin navigation">
          <Link
            className={
              path === "/musfiq97" || path.startsWith("/musfiq97/edit")
                ? "active"
                : ""
            }
            href="/musfiq97"
          >
            <FileText size={18} /> Blog posts
          </Link>
          <Link
            className={path === "/musfiq97/featured" ? "active" : ""}
            href="/musfiq97/featured"
          >
            <Star size={18} /> Featured posts
          </Link>
          <Link
            className={path === "/musfiq97/tags" ? "active" : ""}
            href="/musfiq97/tags"
          >
            <Tags size={18} /> Tags
          </Link>
          <Link
            className={path.includes("messages") ? "active" : ""}
            href="/musfiq97/messages"
          >
            <Mail size={18} /> Messages
          </Link>
          <Link
            className={path === "/musfiq97/new" ? "active" : ""}
            href="/musfiq97/new"
          >
            <Plus size={18} /> New post
          </Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            View website <ArrowUpRight size={16} />
          </Link>
          <button onClick={logout} disabled={busy}>
            <LogOut size={16} /> {busy ? "Signing out…" : "Sign out"}
          </button>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <span>
            <Terminal size={13} /> PRIVATE WORKSPACE
          </span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            ~/musfiq97
            {path === "/musfiq97" ? "/posts" : path.replace("/musfiq97", "")}
          </span>
          <span className="admin-secure">
            <span className="status-dot" /> AUTHENTICATED
          </span>
        </header>
        <main id="main" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
