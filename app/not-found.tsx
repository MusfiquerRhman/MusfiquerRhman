import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container not-found">
        <span className="section-index">ERROR / 404</span>
        <h1>
          Wrong turn<span className="green">.</span>
        </h1>
        <p>This page doesn’t exist, or the post hasn’t been published.</p>
        <Link className="button button-primary" href="/">
          Back to home ↗
        </Link>
      </main>
      <Footer />
    </>
  );
}
