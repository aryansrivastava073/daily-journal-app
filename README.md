# dusk — your daily ritual

A serene, offline-first personal journaling app. Sage-and-cream theme, serif
titles, mood tracking, habits, a running writing streak, and a full
export/backup system — all stored locally in IndexedDB, installable as a PWA.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The app works fully offline after the first
load (service worker precaches everything) and stores all journal entries,
media, habits, and todos in IndexedDB in your browser — nothing leaves your
device unless you export it.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (`dist/`)
- `npm run preview` — serve the production build locally
- `npm run test` — run the vitest unit tests (streak calculation, Hinglish
  translation matching)

## AI features

"✨ Continue my thought" falls back to a local phrase bank when offline or
when no API key is set. For "Aa Translate Hinglish" the fallback chain is:

1. Your own Claude API key (best quality, understands tone/context) — set
   it in **Settings** (gear icon, top bar); stored only in localStorage,
   never included in exported backups.
2. A free public translation API, used automatically whenever you're online
   and no key is set (tagged "via free translator" in the editor).
3. A small offline word dictionary as the last resort when there's no
   network at all (tagged "offline translation").

## Data & backups

Use the **Export diary** button to:

- Export a date range as a formatted, printable PDF.
- Export a complete portable backup (`.json`, includes all entries, habits,
  todos, settings, and media as embedded base64 blobs) — importable from
  Settings on this or any other device/browser.
