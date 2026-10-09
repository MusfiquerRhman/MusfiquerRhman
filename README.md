# Musfiquer Rhman’s portfolio

A responsive portfolio based on the supplied CV, with a dark terminal aesthetic, downloadable original CV, WhatsApp and email links, a contact form, and a PostgreSQL-backed Markdown blog.

## Open the website

Your local setup has already been generated. Start the database in one terminal and keep it running:

```powershell
npm run db:start
```

Start the website in another terminal:

```powershell
npm run dev
```

- Portfolio: [localhost:3000](http://localhost:3000)
- Blog: [localhost:3000/blog](http://localhost:3000/blog)
- Admin: [localhost:3000/musfiq97](http://localhost:3000/musfiq97)
- Private admin email and password: `.local/admin-access.txt`

The database runs on `127.0.0.1:15432`; data is stored in `.local/postgres` and survives restarts. Stop the website and database with Ctrl+C in their respective terminals. The database binds only to loopback and uses SCRAM password authentication.

For a fresh checkout, run `npm install` and `npm run setup:local` first. Setup creates a private `.env.local`, a random database password, and a random admin password. It preserves existing configuration. Node.js 22.16 or newer is recommended. Local PostgreSQL binaries are installed by `embedded-postgres`; Docker is not required. If Windows reserves port 15432 on your machine, change the port in the private `DATABASE_URL` before starting the database.

## Connect email delivery

Contact messages include the visitor’s **title, message body, and email address**. The website saves them in PostgreSQL and emails them to `musfiquerrhman@gmail.com`. Replying to the notification addresses the visitor.

For Gmail:

1. Enable 2-Step Verification on your Google account and create an app password using [Google’s instructions](https://support.google.com/accounts/answer/185833). Some account types do not offer app passwords; use another SMTP provider in that case.
2. Open `.env.local` privately and put the app password in `SMTP_PASSWORD`. Do not use your ordinary Google account password.
3. Leave the prefilled Gmail settings in place:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=musfiquerrhman@gmail.com
SMTP_PASSWORD=YOUR_APP_PASSWORD
SMTP_FROM="Musfiquer Rhman <musfiquerrhman@gmail.com>"
CONTACT_TO=musfiquerrhman@gmail.com
```

4. Restart the website, submit a message, and check your inbox and spam folder.

You can also enter another provider’s SMTP settings. For STARTTLS on port 587, set `SMTP_SECURE=false`; Nodemailer upgrades the connection when the provider offers STARTTLS. See [Nodemailer’s SMTP documentation](https://nodemailer.com/smtp).

Messages are saved even when SMTP is missing or fails. Visitors receive a truthful “saved, email delivery delayed” response. After connecting SMTP, sign in to **Admin → Messages** and choose **Retry email** on pending messages. Resending is explicit; there is no background job or automatic delivery worker. A successful response means the SMTP server accepted the email; final inbox delivery is controlled by the mail provider.

`.env.local`, `.local/`, and test captures are ignored by Git. Credentials are never sent to the browser or displayed in the admin panel.

## Write and publish

1. Open `/musfiq97` and sign in with the email and password in `.local/admin-access.txt`.
2. Choose **New post**. Add a title, URL slug, description, and optional tags from your tag library. Create a tag directly in the editor with **Add tag**, or manage the library in **Admin → Tags**. Each post can have up to eight tags; names have up to 30 characters and are unique regardless of capitalization. Existing post tags are imported into the library by the database migration.
3. Write Markdown. Use **Write**, **Preview**, or **Split** to inspect headings, lists, code blocks, links, tables, and task lists.
4. **Save draft** keeps a post private. **Publish post** makes it appear in the blog and sitemap immediately. To show it on the homepage, choose it in **Admin → Featured posts**.
5. Use the dashboard to edit or delete posts. **Save as draft** on a published post removes it from public pages.

In **Admin → Featured posts**, choose up to three published posts and their order, then click **Save featured posts**. Only these selections appear in the homepage’s Field notes section. Empty slots are allowed. Unpublishing or deleting a featured post clears its slot; republishing does not silently feature it again.

Readers can filter `/blog` by tag. Filters have shareable URLs such as `/blog?tag=TypeScript`; clicking an article’s tag opens that filtered list. Only tags used by published posts appear publicly, and filtered pages have their own titles, descriptions, and canonical URLs. **All posts** or **Clear filter** returns to the full list. Removing a tag in **Admin → Tags** also removes it from posts, while preserving the posts themselves.

Raw HTML is skipped and unsafe URL schemes are removed when rendering Markdown. Images referenced in Markdown are hosted at the URLs you provide; an image uploader is not included. Slugs are unique and collisions produce a useful error.

To rotate the admin password:

```powershell
npm run admin:password
```

This generates a new random password and updates `.local/admin-access.txt`. Restart the website to apply it. To use a specific password, set `ADMIN_NEW_PASSWORD` privately in your terminal before running the command; it must be 16–256 characters. Passwords are stored as salted scrypt hashes, sessions use random opaque tokens with an 8-hour expiration, and rotating the hash invalidates existing sessions after restart.

## SEO and content

Public pages are rendered on the server. The blog includes unique titles and descriptions, canonical URLs, Open Graph and Twitter metadata, article structured data, reading time, an automatically generated sitemap, and a social preview image. Admin routes have `noindex` metadata and are excluded in `robots.txt`; drafts return 404 publicly. Set `SITE_URL` to the website’s actual public origin before deployment so canonical URLs, sitemap URLs, and form origin checks match your domain.

The biography, employment, education, project descriptions, research, and skill list come from the supplied CV. Project artwork is illustrative. The downloadable PDF is an unchanged copy of the original. Edit portfolio content in `app/page.tsx`, contact information in `lib/site.ts`, and appearance in `app/globals.css`.

## Production

Use a Node.js-compatible Next.js host and a persistent PostgreSQL service. A static-only host cannot run the admin panel, database, or contact endpoint.

### Vercel deployment

This checkout is linked to the `musfiquer-rhman` project in `musfiquer-rhmans-projects`. Its hosted database is `musfiquer-rhman-db` on the Neon free plan in Singapore; the Vercel functions use the same region. Local PostgreSQL remains separate. The live admin credentials are in `.local/production-admin-access.txt` and differ from the local login.

Vercel is connected to `MusfiquerRhman/MusfiquerRhman` on GitHub. Commits pushed to `main` build and update the production site automatically after a successful build; other branches get preview deployments. Changes to posts, tags, and homepage selections are saved directly in PostgreSQL and do not need a Git push or redeployment. Before deploying code that changes `database/schema.sql`, apply the migration to the hosted database using the private environment file instructions below.

The custom domain is `musfiquer.dev`, with `www.musfiquer.dev` configured to redirect to it. DNS stays with Namecheap. In **Domain List → Manage → Advanced DNS → Host Records**, use an **A Record** for host `@` pointing to `216.198.79.1`, and a **CNAME Record** for `www` pointing to `4d9e099da58be138.vercel-dns-017.com`. Use Automatic TTL and replace only the root parking/URL Redirect record and the `www` parking CNAME. Keep the existing nameservers and email records. These targets were retrieved from Vercel for this project; inspect the domain again if Vercel requests a future DNS change.

Production `SITE_URL` is `https://musfiquer.dev`. The previous `https://musfiquer-rhman.vercel.app` address is explicitly allowed through `SITE_ALLOWED_ORIGINS` so existing bookmarks can still submit contact and admin forms. Domain DNS and HTTPS must be verified before treating the custom address as live.

The custom domain and its HTTPS certificate have been verified. Both the admin and contact form were checked at the new address. Some networks may briefly retain the previous Namecheap parking DNS records until their caches refresh.

If Vercel blocks a future deployment because it cannot identify the Git commit author, connect your Git provider in Vercel’s account settings and make sure future commits use a verified email for that account. See [Vercel’s commit attribution guidance](https://vercel.com/docs/deployments/troubleshoot-project-collaboration#resolving-git-provider-commit-attribution-issues). The custom-domain update was deployed as a source snapshot by the authenticated project owner.

Vercel sign-in for this checkout is stored privately in `.local/vercel-cli`. To deploy later changes:

```powershell
vercel deploy --prod --yes --global-config '.local\vercel-cli'
```

The app derives production SEO links from Vercel’s production domain unless `SITE_URL` is explicitly configured. If you add a custom domain, set its full HTTPS origin as `SITE_URL` in production. Contact and admin endpoints also accept the exact deployment domains supplied by Vercel. Database pools use Vercel’s connection lifecycle helper.

The hosted contact form saves messages in PostgreSQL while email setup is pending. Add `SMTP_PASSWORD` in **Vercel → Project → Settings → Environment Variables → Production** and redeploy to enable email delivery. Existing pending messages can then be resent from **Admin → Messages**. To copy locally configured SMTP settings and refresh the production admin hash securely, run `node scripts/configure-vercel.mjs` and redeploy; this preserves the generated production password and invalidates existing production sessions after the new hash is deployed.

`.vercelignore` excludes local credentials, databases, screenshots, and test captures from deployment uploads. Hosted migrations can use a private downloaded environment file without replacing local settings:

```powershell
vercel env pull '.local\.env.production.vercel' --environment production --yes --global-config '.local\vercel-cli'
$env:DEPLOYMENT_ENV_FILE = '.local\.env.production.vercel'
npm run db:migrate
Remove-Item Env:DEPLOYMENT_ENV_FILE
```

The generic production instructions below also apply to other Node.js hosts.

1. Configure production secrets from `.env.example` in the host’s environment. Use your public HTTPS URL for `SITE_URL`, a production PostgreSQL connection string with the provider’s required TLS settings, and real SMTP credentials. Set a fresh `ADMIN_PASSWORD_HASH` generated by the password script. Use a database role limited to the portfolio database.
2. Apply the schema with `npm run db:migrate` against the production `DATABASE_URL` before receiving traffic. If `.env.local` exists, the migration script loads it; an explicitly set process environment value takes precedence.
3. Build and start:

```powershell
npm run build
npm run start
```

4. Verify the domain, admin login, CV download, and a real email submission. Configure persistent database backups through your database provider.

Keep `TRUST_PROXY=false` unless the hosting proxy overwrites `X-Forwarded-For` before requests reach the app. With a trusted proxy, setting it to `true` enables per-IP limits. Without one, the fallback limit is shared: 10 contact attempts per 10 minutes and 10 login attempts per 15 minutes. Contact submissions additionally allow 3 attempts per email per 10 minutes. These limits are stored in PostgreSQL, so restarting the app does not reset them.

## Verification

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

The integration suite checks the original CV download, responsive layouts, admin authentication and origin protection, Markdown preview, draft privacy, publication metadata, database persistence, local email delivery, slug collisions, unpublishing, deletion, and logout. It creates temporary test posts and deletes them afterward. It requires the generated local setup and Microsoft Edge; change `launchOptions` in `playwright.config.ts` if you use another installed browser.

To test email without sending external messages, run `node scripts/smtp-preview.mjs` in one terminal. Stop the normal website server and start a separate test server with these temporary PowerShell environment settings:

```powershell
$env:SMTP_HOST = '127.0.0.1'
$env:SMTP_PORT = '1025'
$env:SMTP_SECURE = 'false'
$env:SMTP_USER = ''
$env:SMTP_ALLOW_LOCAL = 'true'
npm run start
```

With the database, local SMTP inbox, and website running, run `npm run test:e2e` in another terminal. Screenshots and local mail captures are written to `.verification/`. Stop the test website server and use a fresh terminal for the normal website; the SMTP overrides apply only to that test terminal and do not change `.env.local`. Do not enable `SMTP_ALLOW_LOCAL` in a public deployment.

The dependency audit currently reports a high-severity `braces` advisory in the inherited ESLint development dependency chain; npm offers only an incompatible Next.js ESLint downgrade, so the framework version is preserved. `npm audit --omit=dev` checks the production dependency set separately.
