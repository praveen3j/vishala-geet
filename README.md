# Vishala Geet

A phone-friendly web app for finding page numbers in Vishala Javvaji's devotional song collection.

## What it does

- Search a song name and see the book and page number, such as `Book 1, Page 20`.
- Search across Book 1 and Book 2 with alternate spellings and first-line hints.
- Keep the song list in a shared Supabase backend when configured.
- Let normal users search only.
- Let admin users add, edit, and delete shared songs after email OTP sign-in.
- Work as an installable web app from the hosted GitHub Pages URL.

## Admins

The app treats these emails as admins:

- `praveenjav@outlook.com` - Praveen
- `vishala1966@gmail.com` - Vishala

The frontend checks these emails for showing admin controls. Supabase row-level security also checks the same emails through `public.admin_users`, so non-admins cannot write to the shared song table.

## Project Structure

- `src/` contains the React app.
- `src/components/` contains reusable UI pieces.
- `src/lib/` contains storage, search, auth, backend, and export helpers.
- `src/styles.css` contains the app styling.
- `public/assets/app-icon.svg` is the app icon.
- `public/assets/book1.json` and `public/assets/book2.json` are the static fallback song lists.
- `public/manifest.webmanifest` makes it installable.
- `public/sw.js` is copied by Vite to `/sw.js` in the hosted build.
- `supabase/schema.sql` creates the shared backend tables and security rules.
- `supabase/seed-songs.sql` imports the current Book 1 and Book 2 data into Supabase.
- `scripts/generate-supabase-seed.mjs` regenerates the seed file from the JSON assets.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase/schema.sql`.
3. In SQL Editor, run `supabase/seed-songs.sql` to load the current 340 songs.
4. In Supabase Auth settings, add the site URL and redirect URL:
   `https://praveen3j.github.io/vishala-geet/`
5. Copy `.env.example` to `.env.local` for local development and fill in. Use the base Supabase URL, not the `/rest/v1/` API path. For the key, use the browser-safe publishable key from Supabase API Keys:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

6. In GitHub repo settings, add GitHub Actions variables with the same names:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The key variable can contain the Supabase publishable key.

Without these variables, the app still builds and runs from the JSON fallback files. Admin login and shared Add/Edit/Delete are enabled only after Supabase is configured.

## Admin OTP Email

The admin login flow uses Supabase email OTP. In Supabase, go to **Authentication → Emails → Templates → Magic Link** and make sure the email body includes `{{ .Token }}` so admins receive a 6-digit code. A simple template can say:

```html
<h2>Vishala Geet admin code</h2>
<p>Your one-time login code is: {{ .Token }}</p>
```

Supabase allows one OTP request about every 60 seconds by default. If an email does not arrive, check spam/junk first and then check the Supabase Auth email logs or SMTP settings.

## Maintaining Songs

After Supabase is configured, use the app as an admin to add, edit, or delete songs. The changes are saved in the backend and will be visible to everyone using the hosted app.

The JSON files in `public/assets/` are now fallback data and a seed source. If you edit those files directly, regenerate the seed SQL:

```bash
npm run seed:sql
```

Then run the updated `supabase/seed-songs.sql` in Supabase only if you want to replace the backend song table with the JSON data.

## Pixel Install

Open the hosted link in Chrome on your Pixel:

`https://praveen3j.github.io/vishala-geet/`

Then:

1. Tap Chrome's three-dot menu.
2. Tap **Add to Home screen** or **Install app**.
3. Open **Vishala Geet** from your home screen.

## Development

Install dependencies once:

```bash
npm install
```

Local `.npmrc` files are ignored by git and should not be committed.

Run locally:

```bash
npm run dev
```

Build for hosting:

```bash
npm run build
```

Push or merge to `release` to deploy through GitHub Pages. Keep `main` for development work, then promote stable changes to `release` when ready. The workflow in `.github/workflows/deploy.yml` builds the app and publishes `dist/`.
