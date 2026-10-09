import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { blogTags } from "@/lib/tags";
import { AdminShell } from "@/components/admin/shell";
import { TagManager } from "@/components/admin/tag-manager";

export const dynamic = "force-dynamic";
export default async function TagsPage() {
  if (!(await isAdmin())) redirect("/musfiq97/login");
  const tags = await blogTags();
  return (
    <AdminShell>
      <div className="admin-page-heading">
        <div>
          <span className="section-index">WORKSPACE / TAGS</span>
          <h1>
            Organize your ideas<span className="green">.</span>
          </h1>
          <p>Create reusable tags, then choose them while writing a post.</p>
        </div>
      </div>
      <TagManager initial={tags} />
    </AdminShell>
  );
}
