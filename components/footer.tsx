import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer container">
      <span>
        <span className="green">&lt;/&gt;</span> Built with curiosity. Based in
        Dhaka.
      </span>
      <div>
        <Link href="/blog">
          Writing <ArrowUpRight size={12} />
        </Link>
        <Link href="/#top">Back to top ↑</Link>
      </div>
    </footer>
  );
}
