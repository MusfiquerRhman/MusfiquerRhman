import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
import { Editor } from "@/components/admin/editor";
import { blogTags } from "@/lib/tags";
export const dynamic = "force-dynamic";
export default async function NewPost() {
  if (!(await isAdmin())) redirect("/musfiq97/login");
  return (
    <AdminShell>
      <Editor availableTags={await blogTags()} />
    </AdminShell>
  );
}
