"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="wordmark" href="/" aria-label="Musfiquer Rhman home">
          <span className="logo-mark">
            m<span>.</span>
          </span>
          <span>
            musfiquer<span className="muted">.dev</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#about">About</Link>
          <Link href="/#work">Work</Link>
          <Link href="/#stack">Stack</Link>
          <Link href="/blog">
            Writing
            <span className="nav-dot" />
          </Link>
        </nav>
        <Link className="header-contact" href="/#contact">
          Let’s talk <ArrowUpRight size={15} />
        </Link>
        <button
          className="mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ["About", "/#about"],
            ["Work", "/#work"],
            ["Stack", "/#stack"],
            ["Writing", "/blog"],
            ["Contact", "/#contact"],
          ].map(([name, href]) => (
            <Link key={name} href={href} onClick={() => setOpen(false)}>
              {name}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
