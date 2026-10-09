"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ArrowUpRight,
  LoaderCircle,
  Eye,
  Code2,
  Columns2,
} from "lucide-react";
import { Markdown } from "@/components/markdown";
import { TagPicker } from "@/components/admin/tag-picker";
import type { BlogTag } from "@/lib/tags";
type Initial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
};
export function Editor({
  initial,
  availableTags,
}: {
  initial?: Initial;
  availableTags: BlogTag[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [content, setContent] = useState(initial?.content || "");
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [mode, setMode] = useState("write");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited)
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 180),
      );
  }
  async function save(published: boolean) {
    setError("");
    setPending(true);
    try {
      const response = await fetch(
        initial ? `/api/admin/posts/${initial.id}` : "/api/admin/posts",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            excerpt,
            content,
            tags,
            published,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      router.push(`/musfiq97?notice=${published ? "published" : "saved"}`);
      router.refresh();
    } catch {
      setError(
        "Could not save. Your writing is still in the editor; please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Link className="text-link" href="/musfiq97">
        <ArrowLeft size={15} /> Back to posts
      </Link>
      <div className="admin-page-heading editor-page-heading">
        <div>
          <span className="section-index">
            {initial ? "EDIT / POST" : "CREATE / POST"}
          </span>
          <h1>{initial ? "Keep the ideas flowing." : "Start with an idea."}</h1>
          <p>Write in Markdown. Preview as you go. Publish when it’s ready.</p>
        </div>
        <div className="editor-actions">
          <button
            className="button button-secondary"
            disabled={pending}
            onClick={() => save(false)}
          >
            <Save size={16} />
            {initial?.published ? "Save as draft" : "Save draft"}
          </button>
          <button
            className="button button-primary"
            disabled={pending}
            onClick={() => save(true)}
          >
            {pending ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
            {initial?.published ? "Update post" : "Publish post"}
          </button>
        </div>
      </div>
      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}
      <div className="editor-fields">
        <label htmlFor="post-title">
          Post title
          <input
            id="post-title"
            value={title}
            onChange={(e) => changeTitle(e.target.value)}
            placeholder="Give your idea a title"
            maxLength={150}
          />
        </label>
        <label htmlFor="post-slug">
          URL slug
          <div className="slug-field">
            <span>/blog/</span>
            <input
              id="post-slug"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="your-post-url"
              maxLength={180}
            />
          </div>
        </label>
        <label className="excerpt-field" htmlFor="post-excerpt">
          Short description{" "}
          <span className="field-help">
            Used in previews and search results · {excerpt.length}/300
          </span>
          <textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="What will readers learn?"
            maxLength={300}
            rows={2}
          />
        </label>
        <TagPicker
          available={availableTags}
          selected={tags}
          onChange={setTags}
          disabled={pending}
        />
      </div>
      <div className="markdown-editor">
        <div className="editor-toolbar">
          <span className="mono">content.md</span>
          <div role="tablist" aria-label="Editor view">
            {[
              { name: "write", icon: Code2 },
              { name: "preview", icon: Eye },
              { name: "split", icon: Columns2 },
            ].map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={mode === tab.name}
                className={mode === tab.name ? "active" : ""}
                key={tab.name}
                onClick={() => setMode(tab.name)}
              >
                <tab.icon size={15} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        <div className={`editor-body mode-${mode}`}>
          <textarea
            aria-label="Markdown content"
            spellCheck={false}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              "# Your next idea\n\nTell your story in **Markdown**.\n\n## What I learned\n\n- A useful discovery\n- Something worth sharing\n\n```typescript\nconst idea = 'start here';\n```"
            }
            maxLength={100000}
          />
          <div className="editor-preview">
            {content ? (
              <Markdown content={content} />
            ) : (
              <div className="preview-placeholder">
                <Eye size={28} />
                <p>Your words will take shape here.</p>
              </div>
            )}
          </div>
        </div>
        <div className="editor-status">
          <span>MARKDOWN + GITHUB FLAVORED MARKDOWN</span>
          <span>
            {content.trim() ? content.trim().split(/\s+/).length : 0} words
          </span>
        </div>
      </div>
      <p className="form-note">
        Drafts are private. Publishing makes your post visible on the website.
      </p>
    </>
  );
}
