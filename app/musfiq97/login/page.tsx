import Link from "next/link";
import { redirect } from "next/navigation";
import { Terminal, ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await isAdmin()) redirect("/musfiq97");
  return (
    <main id="main" className="login-page">
      <Link className="login-home text-link" href="/">
        <ArrowLeft size={15} />
        Back to website
      </Link>
      <div className="login-card">
        <span className="logo-mark">
          m<span>.</span>
        </span>
        <span className="section-index">PRIVATE / WORKSPACE</span>
        <h1>
          Welcome back<span className="green">.</span>
        </h1>
        <p>Your ideas. Your words. Your control room.</p>
        <LoginForm />
        <div className="login-footer">
          <Terminal size={14} />
          musfiquer@admin: ~
        </div>
      </div>
    </main>
  );
}
