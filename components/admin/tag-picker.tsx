"use client";

import { useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";
import type { BlogTag } from "@/lib/tags";

export function TagPicker({
  available,
  selected,
  onChange,
  disabled,
}: {
  available: BlogTag[];
  selected: string[];
  onChange: (tags: string[]) => void;
  disabled: boolean;
}) {
  const [tags, setTags] = useState(available);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  async function createTag() {
    setError("");
    setCreating(true);
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
      if (selected.length < 8) onChange([...selected, data.tag.name]);
      setName("");
    } catch {
      setError("Could not create the tag. Please try again.");
    } finally {
      setCreating(false);
    }
  }
  return (
    <fieldset className="tag-picker" disabled={disabled || creating}>
      <legend>
        Tags <span className="field-help">{selected.length}/8 selected</span>
      </legend>
      <div className="tag-options">
        {tags.map((tag) => (
          <label
            className={`tag-option ${selected.includes(tag.name) ? "selected" : ""}`}
            key={tag.id}
          >
            <input
              type="checkbox"
              checked={selected.includes(tag.name)}
              disabled={!selected.includes(tag.name) && selected.length >= 8}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, tag.name]
                    : selected.filter((name) => name !== tag.name),
                )
              }
            />
            <span>{tag.name}</span>
          </label>
        ))}
        {!tags.length && (
          <p className="form-note">
            Create your first tag below, then choose it for this post.
          </p>
        )}
      </div>
      <div className="inline-tag-create">
        <label htmlFor="editor-new-tag" className="sr-only">
          New tag name
        </label>
        <input
          id="editor-new-tag"
          value={name}
          maxLength={30}
          onChange={(event) => setName(event.target.value)}
          placeholder="Create a new tag"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (name.trim()) void createTag();
            }
          }}
        />
        <button
          className="button button-secondary"
          type="button"
          disabled={!name.trim() || creating}
          onClick={createTag}
        >
          {creating ? (
            <LoaderCircle size={15} className="spin" />
          ) : (
            <Plus size={15} />
          )}{" "}
          Add tag
        </button>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
