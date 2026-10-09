import type { Metadata, Viewport } from "next";
import { siteUrl, profile } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Musfiquer Rhman — Full-stack Developer",
    template: "%s | Musfiquer Rhman",
  },
  description:
    "Full-stack developer in Dhaka building web and mobile applications with TypeScript, Next.js, Node.js, and PostgreSQL. Explore my work, writing, and research.",
  authors: [{ name: profile.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Musfiquer Rhman",
    title: "Musfiquer Rhman — Full-stack Developer",
    description:
      "Thoughtful code. Real-world impact. Explore my work, writing, and research.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#101210",
  colorScheme: "dark",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
