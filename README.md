# FTrack ⛽

A tiny, mobile-first web app to track fuel purchases made on a shared credit card.

- **Dashboard (`/`)** — public. Big animated total + the current cycle's entries.
- **History (`/history`)** — public. Past (closed) bills, tap to expand.
- **Admin (`/admin`)** — password-gated. Add / edit / delete entries, mark bills paid, and close the current bill into history.

## Tech

React + Vite + TypeScript · Tailwind CSS · React Router (HashRouter) · Framer Motion · CountUp · lucide-react icons. No backend.

## Getting started

```bash
npm install
cp .env.example .env      # then set VITE_ADMIN_PASSWORD
npm run dev
```

Build / preview:

```bash
npm run build
npm run preview
```

## Data & storage

Data is a single JSON file (`data.json`) in a **public GitHub repo**:

```ts
{ currentBill: Bill, history: Bill[] }
```

- The **dashboard reads** it with no login (public, refreshes on load / tab
  focus / every 60s).
- **You write** it from `/admin` using a GitHub Personal Access Token. The
  token is stored only in your browser — never in the app code.

All access goes through one swappable adapter in
[`src/services/storage.ts`](src/services/storage.ts) (`StorageAdapter`:
`subscribe` + `save`). A `localStorage` adapter is used automatically as a
fallback when the GitHub env vars are absent (e.g. local dev). To use another
backend, implement the interface and point `storage` at it — no UI changes.

### Setup

1. Create a **public** GitHub repo (you can reuse the one you deploy from).
2. Copy `.env.example` → `.env` and set `VITE_GH_OWNER` / `VITE_GH_REPO`
   (+ optional `VITE_GH_BRANCH`, `VITE_GH_PATH`).
3. Create a **Personal Access Token** with write access to that repo's
   contents:
   - Fine-grained token → *Repository access: only your repo* →
     *Permissions → Contents: Read and write*.
4. Open `/admin`, paste the token, and add an entry. The first save creates
   `data.json` automatically.

> The token grants write access to your repo — treat it like a password. Use a
> fine-grained token limited to the single repo, with an expiry. Read access
> needs no token because the repo is public (the data is exactly what the
> public dashboard already shows).
>
> GitHub's unauthenticated read limit is 60 requests/hour per IP — fine for
> normal viewing.

## Project structure

```
src/
  components/   reusable UI (cards, form, dialog, layout, login)
  pages/        Dashboard, History, Admin
  services/     storage adapter + in-memory store
  hooks/        useBills, useAuth, useTheme
  types/        shared TypeScript types
  utils/        formatting + id helpers
```

## Deploy to GitHub Pages

1. Push to a GitHub repo.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Add repo **Variables** (Settings → Secrets and variables → Actions →
   *Variables* tab): `VITE_GH_OWNER`, `VITE_GH_REPO`, `VITE_GH_BRANCH`,
   `VITE_GH_PATH`. These are public, so Variables (not Secrets) are correct.
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and
   deploys. Commits that only touch `data.json` are ignored, so adding fuel
   entries does not trigger a rebuild.
