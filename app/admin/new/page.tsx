import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
import { Editor } from "@/components/admin/editor";
export const dynamic = "force-dynamic";
export default async function NewPost() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}
