# Courtside Connections

A daily WNBA puzzle game. Find four groups of four.  
Built to be reskinned for NFL, Golf, or any sport.

---

## Quick Start (Local Development)

You need [Node.js](https://nodejs.org/) installed (v18+).

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Opens at `http://localhost:5173`. Changes auto-reload.

---

## Deploy to Vercel (Make It Live)

### Step 1: Push to GitHub

1. Create a [GitHub](https://github.com) account if you don't have one
2. Create a new repository (name it `courtside-connections` or whatever you want)
3. Push this folder to it:

```bash
cd courtside-connections
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/courtside-connections.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Create a [Vercel](https://vercel.com) account (free tier is fine)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Vite — click "Deploy"
5. Your site is live at `courtside-connections.vercel.app` within ~60 seconds

### Step 3: Connect Your Domain

1. Buy a domain (Namecheap, Google Domains, Cloudflare, etc.)
2. In Vercel → your project → Settings → Domains
3. Add your domain and follow the DNS instructions
4. SSL is automatic

---

## How to Add Puzzles

Open `src/data/puzzles.json` and add a new puzzle object:

```json
{
  "id": "2026-06-15",
  "number": 4,
  "title": "Your Puzzle Title",
  "season": "2026",
  "groups": [
    {
      "label": "The category description",
      "difficulty": 4,
      "hint": "A softer clue that nudges without spoiling (optional)",
      "items": ["Item 1", "Item 2", "Item 3", "Item 4"]
    },
    {
      "label": "Another category",
      "difficulty": 3,
      "hint": "Another accessible clue for casual fans",
      "items": ["Item 5", "Item 6", "Item 7", "Item 8"]
    },
    {
      "label": "Third category",
      "difficulty": 2,
      "hint": "What connects these items in plain language",
      "items": ["Item 9", "Item 10", "Item 11", "Item 12"]
    },
    {
      "label": "Easiest category",
      "difficulty": 1,
      "hint": "The most obvious connection described simply",
      "items": ["Item 13", "Item 14", "Item 15", "Item 16"]
    }
  ]
}
```

**Rules:**
- `id` — Use a date string (YYYY-MM-DD). Newest date shows as today's puzzle.
- `number` — Sequential puzzle number (shows in share results)
- `difficulty` — 1 (easiest/blue) to 4 (hardest/red)
- `hint` — Optional. A softer clue shown when the player taps Hint. Write it in plain language that nudges without giving the answer. If omitted, the hint button highlights one tile from the easiest unsolved group instead.
- **Every item must be unique across all four groups in a puzzle**
- Commit and push to GitHub — Vercel auto-deploys

---

## How to Add Ads

### Google AdSense

1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Paste your AdSense script in `index.html` (see the comment placeholder)
3. In `src/components/AdZone.jsx`, replace the placeholder div with:

```jsx
<ins className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="ca-pub-XXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
  data-full-width-responsive="true" />
```

### Ezoic

1. Sign up at [ezoic.com](https://www.ezoic.com) (no traffic minimum)
2. Follow their integration guide (usually a script in `index.html`)
3. Replace AdZone placeholders with Ezoic placeholder divs

---

## How to Add Analytics

### Google Analytics

1. Create a property at [analytics.google.com](https://analytics.google.com)
2. Paste the tracking snippet in `index.html` (see the comment placeholder)
3. Set up Google Search Console for SEO tracking

---

## How to Create NFL or Golf Versions

1. Duplicate this entire folder
2. Edit `src/config.js`:
   - Change `league`, `siteName`, `tagline`, `description`, `domain`
   - Change `colors` to match the league brand
   - Change `social.hashtag`
3. Edit `index.html`:
   - Update `<title>` and meta description
   - Update Open Graph and Twitter Card tags
4. Replace `src/data/puzzles.json` with league-specific puzzles
5. Deploy to a new Vercel project with a new domain

That's it. Same game engine, different skin.

---

## Project Structure

```
courtside-connections/
├── index.html              ← Entry HTML (SEO tags, ad/analytics scripts)
├── package.json            ← Dependencies
├── vite.config.js          ← Build config
├── vercel.json             ← Vercel routing
├── public/
│   └── favicon.svg         ← Browser tab icon
└── src/
    ├── main.jsx            ← React entry point
    ├── App.jsx             ← Main app (routing, state, layout)
    ├── config.js           ← ★ LEAGUE CONFIG — change this per site
    ├── components/
    │   ├── GameBoard.jsx   ← Core game mechanics
    │   ├── Results.jsx     ← Post-game stats & share
    │   ├── Archive.jsx     ← Past puzzle browser
    │   ├── InfoModal.jsx   ← How to play
    │   └── AdZone.jsx      ← Ad placement slots
    ├── data/
    │   └── puzzles.json    ← ★ PUZZLE DATA — add puzzles here
    ├── utils/
    │   ├── storage.js      ← localStorage for streaks/stats
    │   └── share.js        ← Share result grid generation
    └── styles/
        └── app.css         ← All styles
```

---

## Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool (fast dev server, optimized production builds)
- **Vercel** — Hosting (free tier, auto-deploys from GitHub)
- **localStorage** — Streak and stats persistence (no backend needed)

No database. No server. No backend. Just static files.
