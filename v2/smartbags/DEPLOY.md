# Deploying SmartBags to Vercel

This turns the store from a local demo (data saved per-browser) into a
real site where everyone sees the same products, prices and orders.

## 1. Push this folder to a GitHub repo

Vercel deploys from a Git repository. Create a new repo, put everything
in this `smartbags` folder at the repo root, and push it.

## 2. Import the project into Vercel

1. Go to vercel.com → **Add New → Project** → import your repo.
2. Framework preset: choose **Other** (this isn't a framework project —
   it's static HTML/CSS/JS plus a few serverless functions in `/api`).
   Leave the build command empty and the output directory as the
   project root.
3. Don't click Deploy yet — first add the KV database (next step),
   otherwise the first deploy will fail with a missing `@vercel/kv`
   connection.

## 3. Add a KV database

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database → KV** (Vercel's Redis-compatible store).
   The free tier is enough for a store this size.
3. When it's created, click **Connect Project** and connect it to this
   project. This automatically adds the `KV_REST_API_URL`,
   `KV_REST_API_TOKEN` etc. environment variables — you don't type
   these in yourself.

## 4. Set your admin password

1. Project → **Settings → Environment Variables**.
2. Add `ADMIN_PASSWORD` = whatever password you want to use to sign
   into `/admin.html`. Pick something only you know.
3. Apply it to all environments (Production, Preview, Development).

## 5. Deploy

Trigger a deploy (Vercel does this automatically on push, or click
**Deploy** in the dashboard). Once it's live:

- Visit `your-site.vercel.app/home.html` — the storefront.
- Visit `your-site.vercel.app/admin.html` — enter the `ADMIN_PASSWORD`
  you set, and you're in.

## How it works

- `/api/data` — GET is public (the storefront reads products/fees from
  here); POST is admin-only and overwrites the store data.
- `/api/orders` — GET (list) is admin-only; POST (place an order) is
  public, since customers use it from the checkout form.
- `/api/orders/:id` — PATCH (change status) is admin-only.
- Admin auth is intentionally simple: the password you set as
  `ADMIN_PASSWORD` is sent as a Bearer token on every admin request.
  There's no separate user database — this is a single-admin store.

## Notes

- The first time `/api/data` is called with nothing in KV yet, it
  returns the built-in default catalog (same one this demo ships
  with). Your first save in Admin is what actually writes to KV.
- Because product images you upload in Admin get stored as base64 data
  URLs inside the data blob, keep uploaded images reasonably small
  (a few hundred KB, not multi-MB originals) — KV values have a size
  limit.
- Want to point a real domain at it? Project → Settings → Domains in
  Vercel, same as any other project.
