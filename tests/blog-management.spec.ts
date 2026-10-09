import { test, expect } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";

process.loadEnvFile(".env.local");
const database = new Pool({ connectionString: process.env.DATABASE_URL });
const password = readFileSync(".local/admin-access.txt", "utf8").match(
  /^Password: (.+)$/m,
)![1];
const email = process.env.ADMIN_EMAIL!;
const suffix = randomUUID().slice(0, 8);
const prefix = `blog-tools-${suffix}`;
const topic = `C++ & systems ${suffix}`;
const draftTopic = `Private ${suffix}`;
const origin = { Origin: "http://localhost:3000" };
const loginKey = createHash("sha256")
  .update(`login:${createHash("sha256").update("local").digest("hex")}`)
  .digest("hex");
let previousFeatures: { slot: number; post_id: string }[] = [];

test.beforeAll(async () => {
  if (
    process.env.SITE_URL !== "http://localhost:3000" ||
    new URL(process.env.DATABASE_URL!).hostname !== "127.0.0.1"
  )
    throw new Error(
      "Blog management tests only run against the local installation.",
    );
  previousFeatures = (
    await database.query(
      "SELECT slot, post_id FROM featured_posts ORDER BY slot",
    )
  ).rows;
  await database.query("DELETE FROM rate_limits WHERE key = $1", [loginKey]);
});
test.afterAll(async () => {
  await database.query("DELETE FROM posts WHERE slug LIKE $1", [`${prefix}%`]);
  await database.query("DELETE FROM blog_tags WHERE name = ANY($1::text[])", [
    [topic, draftTopic, `Inline ${suffix}`],
  ]);
  await database.query("DELETE FROM featured_posts");
  for (const selection of previousFeatures)
    await database.query(
      "INSERT INTO featured_posts (slot, post_id) SELECT $1, id FROM posts WHERE id = $2 AND published = true ON CONFLICT DO NOTHING",
      [selection.slot, selection.post_id],
    );
  await database.query("DELETE FROM rate_limits WHERE key = $1", [loginKey]);
  await database.end();
});

test("managed tags, ordered homepage selections, public filters, and draft privacy", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  for (const path of ["/api/admin/tags", "/api/admin/featured"]) {
    const response = await request.fetch(path, {
      method: path.includes("featured") ? "PUT" : "POST",
      headers: origin,
      data: {},
    });
    expect(response.status()).toBe(401);
  }
  await page.goto("/musfiq97/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/musfiq97$/);
  await page.getByRole("link", { name: "Tags", exact: true }).click();
  await page.getByLabel("New tag name", { exact: true }).fill(topic);
  await page.getByRole("button", { name: "Create tag", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("ready to use");
  const tag = (
    await database.query("SELECT id FROM blog_tags WHERE name = $1", [topic])
  ).rows[0];
  const duplicate = await page.request.post("/api/admin/tags", {
    headers: origin,
    data: { name: topic.toUpperCase() },
  });
  expect(duplicate.status()).toBe(409);
  expect(
    (
      await page.request.post("/api/admin/tags", {
        headers: { Origin: "https://untrusted.example" },
        data: { name: "Cross-site" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/admin/tags", {
        headers: origin,
        data: { name: "x".repeat(31) },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.post("/api/admin/tags", {
        headers: origin,
        data: { name: draftTopic },
      })
    ).status(),
  ).toBe(201);

  const posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    published: boolean;
  }[] = [];
  for (let index = 0; index < 5; index++) {
    const post = {
      title: `Blog tools ${suffix} — ${index}`,
      slug: `${prefix}-${index}`,
      excerpt: `An article about systems and thoughtful software, number ${index}.`,
      content:
        "## Systems worth understanding\n\nA meaningful Markdown article for the blog management tests.",
      tags: index === 4 ? [draftTopic] : index === 3 ? [] : [topic],
      published: index !== 4,
    };
    const response = await page.request.post("/api/admin/posts", {
      headers: origin,
      data: post,
    });
    expect(response.status()).toBe(201);
    posts.push({ ...post, id: (await response.json()).id });
  }
  expect(
    (
      await page.request.post("/api/admin/posts", {
        headers: origin,
        data: {
          ...posts[0],
          slug: `${prefix}-unknown`,
          tags: ["nonexistent-tag"],
        },
      })
    ).status(),
  ).toBe(400);
  const canonicalTags = await page.request.put(
    `/api/admin/posts/${posts[0].id}`,
    {
      headers: origin,
      data: { ...posts[0], tags: [topic.toUpperCase(), topic] },
    },
  );
  expect(canonicalTags.status()).toBe(200);
  expect(
    (
      await database.query("SELECT tags FROM posts WHERE id = $1", [
        posts[0].id,
      ])
    ).rows[0].tags,
  ).toEqual([topic]);

  await page.goto(`/musfiq97/edit/${posts[0].id}`);
  await expect(
    page.getByRole("checkbox", { name: topic, exact: true }),
  ).toBeChecked();
  await page
    .getByLabel("New tag name", { exact: true })
    .fill(`Inline ${suffix}`);
  await page.getByRole("button", { name: "Add tag", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: `Inline ${suffix}`, exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Update post", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("published");
  posts[0].tags.push(`Inline ${suffix}`);

  await page.getByRole("link", { name: "Featured posts", exact: true }).click();
  const order = [posts[2], posts[0], posts[1]];
  for (const [index, post] of order.entries())
    await page
      .getByLabel(`Featured post ${index + 1}`, { exact: true })
      .selectOption(post.id);
  await page
    .getByRole("button", { name: "Save featured posts", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("selection is saved");
  await page.reload();
  for (const [index, post] of order.entries())
    await expect(
      page.getByLabel(`Featured post ${index + 1}`, { exact: true }),
    ).toHaveValue(post.id);
  const saved = (
    await database.query("SELECT post_id FROM featured_posts ORDER BY slot")
  ).rows.map((row) => row.post_id);
  expect(saved).toEqual(order.map((post) => post.id));
  for (const slots of [
    [posts[0].id, posts[0].id, null],
    [posts[4].id, null, null],
    [randomUUID(), null, null],
    posts.slice(0, 4).map((post) => post.id),
  ]) {
    expect(
      (
        await page.request.put("/api/admin/featured", {
          headers: origin,
          data: { slots },
        })
      ).status(),
    ).toBe(400);
  }
  expect(
    (
      await database.query("SELECT post_id FROM featured_posts ORDER BY slot")
    ).rows.map((row) => row.post_id),
  ).toEqual(saved);
  await page.screenshot({
    path: ".verification/featured-admin-desktop.png",
    fullPage: true,
  });
  await page.goto("/#writing");
  await expect(page.locator("#writing .post-card h3")).toHaveText(
    order.map((post) => post.title),
  );
  expect(await page.locator("#writing").innerText()).not.toContain(
    posts[3].title,
  );
  await page
    .locator("#writing")
    .screenshot({ path: ".verification/featured-home-desktop.png" });
  await page.goto("/blog");
  const filters = page.getByRole("navigation", { name: "Filter posts by tag" });
  expect(await filters.innerText()).not.toContain(draftTopic);
  await filters
    .getByRole("link", { name: new RegExp(`^C\\+\\+ & systems ${suffix}`) })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`tag=C%2B%2B(?:%20|\\+)%26(?:%20|\\+)systems`),
  );
  await expect(page.locator(".post-grid .post-card")).toHaveCount(3);
  expect(await page.locator(".post-grid").innerText()).not.toContain(
    posts[3].title,
  );
  await expect(page).toHaveTitle(new RegExp("C\\+\\+ & systems"));
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
    "href",
    `http://localhost:3000/blog?tag=${encodeURIComponent(topic)}`,
  );
  await page.reload();
  await expect(page.locator(".post-grid .post-card")).toHaveCount(3);
  await page.screenshot({
    path: ".verification/blog-filter-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Clear filter" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    page.locator(`.post-card[href='/blog/${posts[3].slug}']`),
  ).toBeVisible();
  await page.goto(`/blog/${posts[0].slug}`);
  await page
    .locator(".article-header .tags")
    .getByRole("link", { name: topic, exact: true })
    .click();
  await expect(page.locator(".post-grid .post-card")).toHaveCount(3);
  await page.goto(`/blog?tag=${encodeURIComponent(draftTopic)}`);
  await expect(
    page.getByRole("heading", { name: "No posts match this tag yet." }),
  ).toBeVisible();
  await expect(page.locator("meta[name='robots']")).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect((await page.request.get(`/blog/${posts[4].slug}`)).status()).toBe(404);

  for (const path of [
    "/musfiq97/featured",
    "/musfiq97/tags",
    `/musfiq97/edit/${posts[0].id}`,
    `/blog?tag=${encodeURIComponent(topic)}`,
    "/#writing",
  ]) {
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/musfiq97/featured");
  await page.screenshot({
    path: ".verification/featured-admin-mobile.png",
    fullPage: true,
  });
  await page.goto(`/blog?tag=${encodeURIComponent(topic)}`);
  await page.screenshot({
    path: ".verification/blog-filter-mobile.png",
    fullPage: true,
  });

  expect(
    (
      await page.request.put(`/api/admin/posts/${posts[2].id}`, {
        headers: origin,
        data: { ...posts[2], published: false },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await database.query("SELECT 1 FROM featured_posts WHERE post_id = $1", [
        posts[2].id,
      ])
    ).rowCount,
  ).toBe(0);
  await page.goto("/#writing");
  await expect(page.locator("#writing .post-card")).toHaveCount(2);
  expect(
    (
      await page.request.delete(`/api/admin/posts/${posts[1].id}`, {
        headers: origin,
      })
    ).status(),
  ).toBe(200);
  await page.goto("/#writing");
  await page.reload();
  await expect(page.locator("#writing .post-card")).toHaveCount(1);
  await page.goto("/musfiq97/tags");
  await page
    .getByRole("button", { name: `Delete tag ${topic}`, exact: true })
    .click();
  await page.getByRole("button", { name: "Remove tag", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("removed");
  expect(
    (await database.query("SELECT id FROM blog_tags WHERE id = $1", [tag.id]))
      .rowCount,
  ).toBe(0);
  expect(
    (
      await database.query(
        "SELECT id FROM posts WHERE tags @> ARRAY[$1]::text[]",
        [topic],
      )
    ).rowCount,
  ).toBe(0);
  expect(
    (
      await database.query("SELECT tags FROM posts WHERE id = $1", [
        posts[0].id,
      ])
    ).rows[0].tags,
  ).toEqual([`Inline ${suffix}`]);
  expect(
    (
      await page.request.put("/api/admin/featured", {
        headers: origin,
        data: { slots: [null, null, null] },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/#writing");
  await expect(page.locator("#writing .post-card")).toHaveCount(0);
});
