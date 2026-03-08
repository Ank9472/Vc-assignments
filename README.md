# VC Intelligence Interface + Live Enrichment

A thesis-first sourcing MVP for VC teams.

This project ships a functional "precision AI scout" workflow:
`discover -> profile -> enrich -> take action`.

## What is built

- App shell with sidebar navigation and global search.
- `/companies`: fast search + faceted filters + sortable table + pagination.
- `/companies/[id]`: company profile with overview, signal timeline, explainable thesis score, notes, save-to-list, and live enrichment.
- `/lists`: create lists, add/remove companies, export list in CSV/JSON.
- `/saved`: save and re-run filtered searches.
- Persistence in `localStorage` for notes, lists, saved searches, and thesis profile.
- Server-side live enrichment via `/api/enrich` with cache and source transparency.
- Power-user touches: bulk select + bulk add-to-list, keyboard shortcuts, and inline thesis editor.

## Tech stack

- Next.js App Router + TypeScript
- React 19
- CSS (custom design system variables)
- Optional Firecrawl integration for AI scraping

## Live enrichment behavior

The enrichment flow is triggered on company profile with an `Enrich` button.

The backend route (`/api/enrich`) does the following:

1. Selects public URLs (homepage + about + product + careers + blog).
2. Scrapes content server-side.
3. Extracts:
	 - `summary` (1-2 sentences)
	 - `whatTheyDo` bullets
	 - `keywords`
	 - `derivedSignals`
4. Returns full source list with timestamp and status per URL.
5. Caches results in-memory for 6 hours per company URL.

## Power-user shortcuts

- Press `/` anywhere outside inputs to focus global search.
- Press `S` on the companies page (outside inputs) to save current search.
- Press `Shift+A` on the companies page (outside inputs) to select all filtered rows.
- Export selected companies directly from the companies page as CSV or JSON.

### Source mode selection

- If `FIRECRAWL_API_KEY` is present, API route uses Firecrawl scrape endpoint.
- If not present, API route falls back to direct server-side `fetch` + HTML text extraction.

## Environment variables

Create `.env.local`:

```bash
# Optional but recommended for richer scrape rendering
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

No API keys are exposed to the browser.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

### Vercel (preferred)

1. Import repo in Vercel.
2. Add environment variable `FIRECRAWL_API_KEY` (optional).
3. Deploy.

### Netlify (acceptable)

- Works as a Next.js app with server routes.
- Ensure environment variables are set in site config.

## Project structure

```text
app/
	api/enrich/route.ts
	companies/page.tsx
	companies/[id]/page.tsx
	lists/page.tsx
	saved/page.tsx
	globals.css
components/
	app-shell.tsx
	score-pill.tsx
lib/
	mockCompanies.ts
	filters.ts
	thesis.ts
	scoring.ts
	enrichment.ts
	storage.ts
	types.ts
```

## Notes and guardrails

- Uses public pages only.
- Does not attempt to evade access controls.
- Enrichment is explainable by showing scraped source URLs and extraction outputs.

## Stretch ideas

- Queue + retry + rate limiting for bulk enrichment jobs.
- Per-fund thesis editor UI with weighted factors.
- Vector similarity search + lookalike discovery.
- CRM/Slack integrations.