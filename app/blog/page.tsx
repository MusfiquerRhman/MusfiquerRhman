import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PostCard } from "@/components/post-card";
import { publishedPosts } from "@/lib/posts";
import { Terminal } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from Musfiquer Rhman on full-stack development, data science, and building software. Ideas, experiments, and things learned.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Writing | Musfiquer Rhman",
    description: "Ideas, experiments, and things learned.",
    url: "/blog",
  },
};
export default async function Blog() {
  const posts = await publishedPosts();
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
            <h2>The first chapter is on its way.</h2>
            <p>
              No posts published yet. Check back for notes on code, systems, and
              data science.
            </p>
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
