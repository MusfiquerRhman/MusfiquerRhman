import type { MetadataRoute } from "next";
import { publishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await publishedPosts(10000);
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
