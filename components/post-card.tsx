import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { formatDate, readingTime, type Post } from "@/lib/posts";
export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <Link className="post-card" href={`/blog/${post.slug}`}>
      <div className={`post-art art-${index % 3}`} aria-hidden="true">
        <span>
          {["{ curiosity }", "< build />", "[ experiment ]"][index % 3]}
        </span>
        <div className="art-grid" />
      </div>
      <div className="post-card-content">
        <div className="post-meta">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span>
            <Clock3 size={12} /> {readingTime(post.content)} min read
          </span>
        </div>
        <h3>
          {post.title}
          <ArrowUpRight size={20} />
        </h3>
        <p>{post.excerpt}</p>
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
