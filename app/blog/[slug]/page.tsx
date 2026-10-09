import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Markdown } from "@/components/markdown";
import { postBySlug, formatDate, readingTime } from "@/lib/posts";
import { absoluteUrl, jsonLd, profile } from "@/lib/site";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await postBySlug((await params).slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: (post.published_at || post.created_at).toISOString(),
      modifiedTime: post.updated_at.toISOString(),
      authors: [profile.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}
export default async function BlogPost({ params }: Props) {
  const post = await postBySlug((await params).slug);
  if (!post) notFound();
  return (
    <>
      <Header />
      <main id="main" className="article-page container">
        <Link className="text-link" href="/blog">
          <ArrowLeft size={16} /> All field notes
        </Link>
        <article>
          <header className="article-header">
            <div className="tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h1>{post.title}</h1>
            <p className="article-excerpt">{post.excerpt}</p>
            <div className="article-meta">
              <span>{profile.name}</span>
              <span> / </span>
              <time
                dateTime={(post.published_at || post.created_at).toISOString()}
              >
                {formatDate(post.published_at || post.created_at)}
              </time>
              <span>
                <Clock3 size={14} /> {readingTime(post.content)} min read
              </span>
            </div>
          </header>
          <Markdown content={post.content} />
        </article>
        <div className="article-bottom">
          <span className="green">{"// thanks for reading"}</span>
          <Link className="text-link" href="/#contact">
            Continue the conversation ↗
          </Link>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: (post.published_at || post.created_at).toISOString(),
            dateModified: post.updated_at.toISOString(),
            author: {
              "@type": "Person",
              name: profile.name,
              url: absoluteUrl("/"),
            },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
            image: absoluteUrl("/opengraph-image"),
          }),
        }}
      />
    </>
  );
}
