# Freelancer's Forge

Audit any freelancer page and rewrite it like the top one percent.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** and pick the repo.
3. Framework preset: **Vite** (Vercel auto-detects it).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.

## Important: API key handling

This app calls `https://api.anthropic.com/v1/messages` directly from the browser. That works inside Claude artifacts because the artifact environment proxies the call, but **it will not work in production** without a backend that adds your API key.

Options:

### Option A — Vercel Serverless Function (recommended)

Create `api/claude.js` in this repo:

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  const data = await r.json()
  res.status(r.status).json(data)
}
```

Then in `FreelancersForge.jsx`, change every `fetch("https://api.anthropic.com/v1/messages", ...)` to `fetch("/api/claude", ...)`.

In Vercel project settings, add the environment variable:
- **Name**: `ANTHROPIC_API_KEY`
- **Value**: your key from https://console.anthropic.com/

Redeploy.

### Option B — Run your own backend

Point the fetch calls to your own server, which forwards to Anthropic with the API key.

## Tech

- Vite + React 18
- Tailwind CSS
- Lucide React icons
- Anthropic Messages API (Claude Sonnet 4)
