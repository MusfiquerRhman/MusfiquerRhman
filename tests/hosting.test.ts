import { test } from "node:test";
import { strict as assert } from "node:assert";
import { allowedOrigins, absoluteUrl, siteUrl } from "../lib/site";

const keys = [
  "SITE_URL",
  "SITE_ALLOWED_ORIGINS",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
];
function withEnvironment(values: Record<string, string>, run: () => void) {
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  for (const key of keys) {
    delete process.env[key];
    if (values[key]) process.env[key] = values[key];
  }
  try {
    run();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("local links and form origins stay local outside Vercel", () => {
  withEnvironment({ VERCEL_URL: "injected.example" }, () => {
    assert.equal(siteUrl().origin, "http://localhost:3000");
    assert.deepEqual([...allowedOrigins()], ["http://localhost:3000"]);
  });
});
test("production metadata uses the production domain", () => {
  withEnvironment(
    {
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_URL: "portfolio-build.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio.vercel.app",
    },
    () => {
      assert.equal(
        absoluteUrl("/blog/first-post"),
        "https://portfolio.vercel.app/blog/first-post",
      );
      assert(allowedOrigins().has("https://portfolio-build.vercel.app"));
      assert(!allowedOrigins().has("https://attacker.vercel.app"));
    },
  );
});
test("preview links use the preview deployment and allow only exact Vercel hosts", () => {
  withEnvironment(
    {
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_URL: "portfolio-preview.vercel.app",
      VERCEL_BRANCH_URL: "portfolio-git-main.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio.vercel.app",
    },
    () => {
      assert.equal(siteUrl().origin, "https://portfolio-preview.vercel.app");
      assert(allowedOrigins().has("https://portfolio-git-main.vercel.app"));
      assert(
        !allowedOrigins().has(
          "https://portfolio-preview.vercel.app.attacker.example",
        ),
      );
    },
  );
});
test("a configured custom domain remains authoritative", () => {
  withEnvironment(
    {
      SITE_URL: "https://portfolio.example",
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_URL: "portfolio-build.vercel.app",
    },
    () => {
      assert.equal(siteUrl().origin, "https://portfolio.example");
      assert(allowedOrigins().has("https://portfolio.example"));
      assert(!allowedOrigins().has("http://portfolio.example"));
    },
  );
});

test("an explicit previous domain stays usable without trusting other Vercel projects", () => {
  withEnvironment(
    {
      SITE_URL: "https://musfiquer.dev",
      SITE_ALLOWED_ORIGINS: "https://musfiquer-rhman.vercel.app",
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "musfiquer.dev",
    },
    () => {
      assert.equal(absoluteUrl("/blog"), "https://musfiquer.dev/blog");
      assert(allowedOrigins().has("https://musfiquer-rhman.vercel.app"));
      assert(!allowedOrigins().has("https://attacker.vercel.app"));
      assert(!allowedOrigins().has("http://musfiquer-rhman.vercel.app"));
    },
  );
});
