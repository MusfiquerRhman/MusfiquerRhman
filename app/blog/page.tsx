import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PostCard } from "@/components/post-card";
import { publishedPosts } from "@/lib/posts";
import { blogTags } from "@/lib/tags";
import { Terminal } from "lucide-react";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ tag?: string | string[] }> };
async function tagFilter(searchParams: Props["searchParams"]) {
  const query = (await searchParams).tag;
  const requested = Array.isArray(query) ? query[0] : query;
  const tags = await blogTags(true);
  const selected = tags.find(
    (tag) => tag.name.toLowerCase() === requested?.toLowerCase(),
  );
  return { tags, selected, filtering: Boolean(requested) };
}
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { selected, filtering } = await tagFilter(searchParams);
  const title = selected ? `${selected.name} — Writing` : "Writing";
  const description = selected
    ? `Posts by Musfiquer Rhman about ${selected.name}. Ideas, experiments, and things learned.`
    : "Notes from Musfiquer Rhman on full-stack development, data science, and building software. Ideas, experiments, and things learned.";
  const url = selected
    ? `/blog?tag=${encodeURIComponent(selected.name)}`
    : "/blog";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    ...(filtering && !selected
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
export default async function Blog({ searchParams }: Props) {
  const { tags, selected, filtering } = await tagFilter(searchParams);
  const posts =
    filtering && !selected ? [] : await publishedPosts(100, selected?.name);
  return (
    <>
      <Header />
      <main id="main" className="container blog-page">
        <div className="blog-heading">
          <span className="section-index">~/WRITING</span>
          <h1>
            Field notes<span className="green">.</span>
          </h1>
          <p>
            Ideas, experiments, and the occasional rabbit hole.
            <br />A running log of what I’m building and learning.
          </p>
          <span className="blog-count">
            {posts.length.toString().padStart(2, "0")} ENTRIES / ALWAYS LEARNING
          </span>
        </div>
        {(tags.length > 0 || filtering) && (
          <nav className="blog-tag-filter" aria-label="Filter posts by tag">
            <span className="mono">FILTER BY TAG</span>
            <div className="tag-filter-options">
              <Link
                href="/blog"
                className={`tag-filter ${!filtering ? "active" : ""}`}
                aria-current={!filtering ? "page" : undefined}
              >
                All posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                  className={`tag-filter ${selected?.id === tag.id ? "active" : ""}`}
                  aria-current={selected?.id === tag.id ? "page" : undefined}
                >
                  {tag.name}
                  <span>{tag.post_count}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
        {selected && (
          <p className="blog-filter-summary" role="status">
            {posts.length} {posts.length === 1 ? "post" : "posts"} tagged{" "}
            <strong>{selected.name}</strong>
            <Link className="text-link" href="/blog">
              Clear filter ↗
            </Link>
          </p>
        )}
        {posts.length ? (
          <div className="post-grid">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <Terminal size={42} className="green" />
            <span className="mono green">$ ls ./notes</span>
            <h2>
              {filtering
                ? "No posts match this tag yet."
                : "The first chapter is on its way."}
            </h2>
            <p>
              {filtering
                ? "Try another topic, or browse all of the field notes."
                : "No posts published yet. Check back for notes on code, systems, and data science."}
            </p>
            {filtering && (
              <Link className="text-link" href="/blog">
                Browse all posts ↗
              </Link>
            )}
            <span className="empty-prompt">
              ❯ <span className="terminal-cursor">▍</span>
            </span>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
