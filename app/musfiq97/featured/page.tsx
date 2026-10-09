import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/shell";
import { FeaturedEditor } from "@/components/admin/featured-editor";

export const dynamic = "force-dynamic";
export default async function FeaturedPage() {
  if (!(await isAdmin())) redirect("/musfiq97/login");
  const [posts, selections] = await Promise.all([
    db().query<{ id: string; title: string; slug: string; excerpt: string }>(
      "SELECT id, title, slug, excerpt FROM posts WHERE published = true ORDER BY published_at DESC",
    ),
    db().query<{ slot: number; post_id: string }>(
      "SELECT f.* FROM featured_posts f JOIN posts p ON p.id = f.post_id WHERE p.published = true ORDER BY f.slot",
    ),
  ]);
  const initial = Array.from(
    { length: 3 },
    (_, index) =>
      selections.rows.find((row) => row.slot === index + 1)?.post_id ?? null,
  );
  return (
    <AdminShell>
      <div className="admin-page-heading">
        <div>
          <span className="section-index">WORKSPACE / HOMEPAGE</span>
          <h1>
            Your featured writing<span className="green">.</span>
          </h1>
          <p>
            Choose up to three published posts for the homepage’s Field notes
            section. Arrange them in the order you want readers to see.
          </p>
        </div>
      </div>
      <FeaturedEditor posts={posts.rows} initial={initial} />
    </AdminShell>
  );
}
