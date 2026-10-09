import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText, ArrowUpRight, Pencil, Star } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, type Post } from "@/lib/posts";
import { AdminShell } from "@/components/admin/shell";
import { DeletePost } from "@/components/admin/delete-post";
export const dynamic = "force-dynamic";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  if (!(await isAdmin())) redirect("/musfiq97/login");
  const { rows: posts } = await db().query<
    Post & { featured_slot: number | null }
  >(
    "SELECT p.*, f.slot AS featured_slot FROM posts p LEFT JOIN featured_posts f ON f.post_id = p.id ORDER BY p.updated_at DESC",
  );
  const notice = (await searchParams).notice;
  return (
    <AdminShell>
      <div className="admin-page-heading">
        <div>
          <span className="section-index">WORKSPACE / WRITING</span>
          <h1>
            Your field notes<span className="green">.</span>
          </h1>
          <p>A home for your ideas, from first draft to published post.</p>
        </div>
        <Link className="button button-primary" href="/musfiq97/new">
          <Plus size={18} />
          New post
        </Link>
      </div>
      {(notice === "published" || notice === "saved") && (
        <p role="status" className="alert-success">
          {notice === "published"
            ? "Your post is published and visible on the website."
            : "Your draft is saved. Only you can see it."}
        </p>
      )}
      <div className="admin-stat-grid">
        <div>
          <span>ALL POSTS</span>
          <strong>{posts.length.toString().padStart(2, "0")}</strong>
        </div>
        <div>
          <span>PUBLISHED</span>
          <strong className="green">
            {posts
              .filter((p) => p.published)
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>DRAFTS</span>
          <strong>
            {posts
              .filter((p) => !p.published)
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
      </div>
      {posts.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>POST</th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/musfiq97/edit/${post.id}`}>{post.title}</Link>
                    <span className="table-slug">/blog/{post.slug}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${post.published ? "published" : "draft"}`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                    {post.featured_slot && (
                      <span className="featured-badge">
                        <Star size={11} /> Featured {post.featured_slot}
                      </span>
                    )}
                  </td>
                  <td className="date-cell">{formatDate(post.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      {post.published && (
                        <Link
                          className="icon-button"
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          aria-label={`View ${post.title}`}
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      )}
                      <Link
                        className="icon-button"
                        href={`/musfiq97/edit/${post.id}`}
                        aria-label={`Edit ${post.title}`}
                      >
                        <Pencil size={17} />
                      </Link>
                      <DeletePost id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty">
          <FileText size={40} className="green" />
          <h2>Your next idea belongs here.</h2>
          <p>
            Create your first post. Save it as a draft, or share it with the
            world.
          </p>
          <Link className="button button-primary" href="/musfiq97/new">
            <Plus size={17} />
            Write your first post
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
