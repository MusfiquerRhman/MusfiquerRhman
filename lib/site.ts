export const profile = {
  name: "Musfiquer Rhman",
  email: "musfiquerrhman@gmail.com",
  whatsapp: "@musfiquerrhman",
  whatsappUrl: "https://wa.me/@musfiquerrhman",
  location: "Dhaka, Bangladesh",
  role: "Full-stack developer",
  cv: "/musfiquer-rhman-cv.pdf",
};

export function siteUrl() {
  const deploymentHost =
    process.env.VERCEL === "1"
      ? process.env.VERCEL_ENV === "preview"
        ? process.env.VERCEL_URL
        : process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      : undefined;
  return new URL(
    process.env.SITE_URL ||
      (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000"),
  );
}

export function allowedOrigins() {
  const origins = new Set([siteUrl().origin]);
  // Explicit aliases keep existing bookmarks usable during a domain change.
  for (const origin of (process.env.SITE_ALLOWED_ORIGINS || "").split(",")) {
    if (origin.trim()) origins.add(new URL(origin.trim()).origin);
  }
  if (process.env.VERCEL === "1") {
    // Vercel supplies these hosts. Never accept an arbitrary *.vercel.app origin.
    for (const host of [
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ]) {
      if (host) origins.add(new URL(`https://${host}`).origin);
    }
  }
  return origins;
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString();
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
