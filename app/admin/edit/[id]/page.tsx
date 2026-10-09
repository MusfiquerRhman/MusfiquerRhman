import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Post } from "@/lib/posts";
import { AdminShell } from "@/components/admin/shell";
import { Editor } from "@/components/admin/editor";
export const dynamic = "force-dynamic";
export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound();
  const { rows } = await db().query<Post>("SELECT * FROM posts WHERE id=$1", [
    id,
  ]);
  const p = rows[0];
  if (!p) notFound();
  return (
    <AdminShell>
      <Editor
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          tags: p.tags,
          published: p.published,
        }}
      />
    </AdminShell>
  );
}
