# Vishala Geet

A simple phone-friendly web app for finding page numbers in Vishala Geet, a favorite songs collection.

## What it does

- Search a song name and see the book and page number.
- Load maintained song lists from `assets/book1.json` and `assets/book2.json`.
- Add or edit entries on the phone when needed.
- Export and import a backup.
- Work offline after it is installed from a hosted web address.

## Project Structure

- `src/` contains the React app.
- `src/components/` contains reusable UI pieces.
- `src/lib/` contains storage, search, and export helpers.
- `src/styles.css` contains the app styling.
- `public/assets/app-icon.svg` is the app icon.
- `public/assets/book1.json` and `public/assets/book2.json` are the maintained song lists.
- `public/manifest.webmanifest` makes it installable.
- `public/sw.js` is copied by Vite to `/sw.js` in the hosted build, so the service worker can control the whole app.

## Maintaining Songs

Add songs to the matching book file in `public/assets/` using this shape:

```json
{
  "version": 2,
  "book": "Book 1",
  "updatedAt": "2026-05-10",
  "entries": [
    {
      "id": "song-001",
      "name": "Song name",
      "book": "Book 1",
      "page": "42",
      "aliases": "Optional alternate name",
      "notes": ""
    }
  ]
}
```

Increase that book file's `version` whenever its list changes. Add a new URL to `BOOK_DATA_URLS` in `src/constants.js` when adding another book. The phone app loads the latest maintained list when it opens, and the **About > Refresh List** button can check again.

The current maintained list comes from the supplied JSON song data. Rows include romanized spellings and extra search words in `aliases`, so searches can match common spelling variations.

## Pixel install

Host these files on a simple HTTPS static host, then open the link in Chrome on your Pixel.

Good simple options:

- Netlify Drop
- GitHub Pages
- Cloudflare Pages

After opening the hosted link on your Pixel:

1. Tap Chrome's three-dot menu.
2. Tap **Add to Home screen** or **Install app**.
3. Open **Vishala Geet** from your home screen.

Your songs are stored on that phone's browser/app storage. Use **About > Export Backup** after adding many songs.

## Development

Install dependencies once:

```bash
npm install
```

On the Oracle laptop, the local `.npmrc` may be needed for the internal npm registry. It is ignored by git and should not be shared outside Oracle.

Run locally:

```bash
npm run dev
```

Build for hosting:

```bash
npm run build
```

Push to `main` to deploy through GitHub Pages. The workflow in `.github/workflows/deploy.yml` builds the app and publishes `dist/`.

After the first workflow run, the public site should be available at:

`https://praveen3j.github.io/vishala-geet/`
