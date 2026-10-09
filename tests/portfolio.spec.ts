import { test, expect } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { Pool } from "pg";
test.describe.configure({ mode: "serial" });

process.loadEnvFile(".env.local");
const database = new Pool({ connectionString: process.env.DATABASE_URL });
const password = readFileSync(".local/admin-access.txt", "utf8").match(
  /^Password: (.+)$/m,
)![1];
const email = process.env.ADMIN_EMAIL!;
const slug = `test-${randomUUID()}`;
const title = "A test of thoughtful software";
let postId: string;
const origin = { Origin: "http://localhost:3000" };
const localLoginKey = createHash("sha256")
  .update(`login:${createHash("sha256").update("local").digest("hex")}`)
  .digest("hex");
test.beforeAll(async () => {
  if (
    process.env.SITE_URL !== "http://localhost:3000" ||
    new URL(process.env.DATABASE_URL!).hostname !== "127.0.0.1"
  )
    throw new Error(
      "These integration tests must run only against the local installation.",
    );
  await database.query("DELETE FROM rate_limits WHERE key = $1", [
    localLoginKey,
  ]);
});
const content =
  "## A useful discovery\n\nThis is **Markdown**, rendered safely.\n\n| Tool | Purpose |\n| --- | --- |\n| TypeScript | Useful types |\n\n```typescript\nconst message = 'hello';\n```\n\n<script>window.__unsafe = true</script>\n\n[Unsafe link](javascript:alert(1))";

test.afterAll(async () => {
  await database.query("DELETE FROM posts WHERE slug = $1", [slug]);
  await database.query("DELETE FROM contact_messages WHERE email = $1", [
    "portfolio-test@example.com",
  ]);
  await database.query("DELETE FROM rate_limits WHERE key = $1", [
    localLoginKey,
  ]);
  await database.end();
});

test("portfolio links, original CV, and mobile layout", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "I build things",
  );
  await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute(
    "download",
    "",
  );
  await expect(
    page.locator("a[href='https://wa.me/8801959793534']"),
  ).toContainText("@musfiquerrhman");
  await expect(
    page.locator("a[href='mailto:musfiquerrhman@gmail.com']"),
  ).toBeVisible();
  const cv = await request.get("/musfiquer-rhman-cv.pdf");
  expect(cv.status()).toBe(200);
  expect(
    createHash("sha256")
      .update(await cv.body())
      .digest("hex"),
  ).toBe(
    createHash("sha256")
      .update(readFileSync("public/musfiquer-rhman-cv.pdf"))
      .digest("hex"),
  );
  mkdirSync(".verification", { recursive: true });
  await page.screenshot({ path: ".verification/desktop.png", fullPage: true });
  await page.screenshot({ path: ".verification/desktop-hero.png" });
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page.screenshot({ path: ".verification/mobile.png", fullPage: true });
});

test("admin mutations require authentication and the correct origin", async ({
  request,
}) => {
  const unauthorized = await request.post("/api/admin/posts", {
    headers: origin,
    data: { title: "Unauthorized" },
  });
  expect(unauthorized.status()).toBe(401);
  const crossSite = await request.post("/api/admin/login", {
    headers: { Origin: "https://untrusted.example" },
    data: { email, password },
  });
  expect(crossSite.status()).toBe(403);
  const protectedPage = await request.get("/admin/new", { maxRedirects: 0 });
  expect(protectedPage.status()).toBe(307);
  expect(protectedPage.headers().location).toContain("/admin/login");
});

test("sign in, preview Markdown, save a private draft, and publish", async ({
  page,
  request,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".login-form [role='alert']")).toContainText(
    "incorrect",
  );
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("meta[name='robots']")).toHaveAttribute(
    "content",
    /noindex/,
  );
  await page
    .getByRole("link", { name: "New post", exact: true })
    .first()
    .click();
  await page.getByLabel("Post title").fill(title);
  await page.getByLabel("URL slug").fill(slug);
  await page
    .getByLabel("Short description", { exact: false })
    .fill(
      "An integration test of publishing, metadata, and safe Markdown rendering.",
    );
  await page.getByLabel("Tags", { exact: false }).fill("TypeScript, Testing");
  await page.getByLabel("Markdown content").fill(content);
  await page.getByRole("tab", { name: "preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A useful discovery" }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => "__unsafe" in window)).toBe(false);
  await page.screenshot({
    path: ".verification/admin-editor.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("draft is saved");
  const { rows } = await database.query(
    "SELECT id, published FROM posts WHERE slug = $1",
    [slug],
  );
  postId = rows[0].id;
  expect(rows[0].published).toBe(false);
  expect((await request.get(`/blog/${slug}`)).status()).toBe(404);
  expect(await (await request.get("/blog")).text()).not.toContain(title);
  await page.getByRole("link", { name: `Edit ${title}`, exact: true }).click();
  await page.getByRole("button", { name: "Publish post", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("published");
  await page.screenshot({
    path: ".verification/admin-dashboard.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.getByRole("link", { name: `Edit ${title}`, exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({
    path: ".verification/admin-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("published posts are server-rendered with SEO metadata and safe Markdown", async ({
  page,
  request,
}) => {
  const response = await request.get(`/blog/${slug}`);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain(title);
  expect(html).toContain("BlogPosting");
  await page.goto(`/blog/${slug}`);
  await expect(page).toHaveTitle(`${title} | Musfiquer Rhman`);
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
    "href",
    `http://localhost:3000/blog/${slug}`,
  );
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute(
    "content",
    title,
  );
  await expect(
    page.getByRole("heading", { name: "A useful discovery" }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => "__unsafe" in window)).toBe(false);
  await expect(
    page.getByRole("link", { name: "Unsafe link", exact: true }),
  ).not.toHaveAttribute("href", /javascript:/);
  await page.screenshot({ path: ".verification/article.png", fullPage: true });
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`/blog/${slug}`);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(
    (await request.get("/opengraph-image")).headers()["content-type"],
  ).toContain("image/png");
  await page.goto("/blog");
  await expect(
    page.getByRole("link", { name: new RegExp(title) }),
  ).toBeVisible();
  await page.screenshot({ path: ".verification/blog.png", fullPage: true });
});

test("contact form stores visitor details and delivers the email to the local inbox", async ({
  page,
  request,
}) => {
  const malformed = await request.post("/api/contact", {
    headers: origin,
    data: { title: "Hi", email: "invalid", message: "short" },
  });
  expect(malformed.status()).toBe(400);
  await page.goto("/#contact");
  await page.getByLabel("Your email").fill("portfolio-test@example.com");
  await page
    .getByLabel("What’s on your mind?")
    .fill("Portfolio integration test");
  await page
    .getByLabel("Your message")
    .fill(
      "This test checks that the visitor email, title, and message arrive together.",
    );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("Message sent");
  const { rows } = await database.query(
    "SELECT title, message, delivery_status FROM contact_messages WHERE email = $1 ORDER BY created_at DESC",
    ["portfolio-test@example.com"],
  );
  expect(rows[0].delivery_status).toBe("sent");
  expect(rows[0].title).toBe("Portfolio integration test");
  expect(existsSync(".verification/mail-capture.jsonl")).toBe(true);
  const capture = readFileSync(".verification/mail-capture.jsonl", "utf8");
  expect(capture).toContain("portfolio-test@example.com");
  expect(capture).toContain("Portfolio integration test");
  expect(capture).toContain("musfiquerrhman@gmail.com");
});

test("slug collisions are reported, publishing can be reversed, and posts can be deleted", async ({
  request,
}) => {
  const login = await request.post("/api/admin/login", {
    headers: origin,
    data: { email, password },
  });
  expect(login.ok()).toBe(true);
  const data = {
    title,
    slug,
    excerpt: "A useful integration test of the complete publishing flow.",
    content,
    tags: ["Testing"],
    published: true,
  };
  const duplicate = await request.post("/api/admin/posts", {
    headers: origin,
    data,
  });
  expect(duplicate.status()).toBe(409);
  const unpublish = await request.put(`/api/admin/posts/${postId}`, {
    headers: origin,
    data: { ...data, published: false },
  });
  expect(unpublish.ok()).toBe(true);
  expect((await request.get(`/blog/${slug}`)).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    `/blog/${slug}`,
  );
  const remove = await request.delete(`/api/admin/posts/${postId}`, {
    headers: origin,
  });
  expect(remove.ok()).toBe(true);
  expect(
    (await database.query("SELECT 1 FROM posts WHERE id = $1", [postId]))
      .rowCount,
  ).toBe(0);
  await request.post("/api/admin/logout", { headers: origin });
  const revoked = await request.post("/api/admin/posts", {
    headers: origin,
    data,
  });
  expect(revoked.status()).toBe(401);
});
