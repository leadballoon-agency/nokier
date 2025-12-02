# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nokier-2 is a satirical landing page and waitlist system parodying Nokia phones and British politics (specifically the "Two-Tier Keir" Starmer meme). The tone is intentionally absurdist - maintain this humor in all modifications.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **Backend:** Vercel serverless functions (Node.js)
- **Database:** Neon PostgreSQL (serverless)
- **Deployment:** Vercel (auto-deploys on push to main)

## Development Commands

```bash
# Run local development server
vercel dev

# Database check (manual)
node check_database.js

# Run Playwright tests (manual)
node playwright-test.js
```

No build step required - static files served directly from `/public`.

## Architecture

```
├── public/           # Static frontend (index.html, script.js, styles.css)
├── api/              # Vercel serverless functions
│   ├── signup.js     # POST - waitlist registration + GHL webhook
│   └── count.js      # GET - current waitlist count
├── schema.sql        # PostgreSQL schema
└── vercel.json       # Deployment config (outputDirectory: public)
```

## Key Patterns

**7-Step Assessment Modal:**
- Steps are `data-step` divs toggled via `active` class
- `nextStep()` validates before advancing
- Step 4 has "Release The Sausages" mini-game (click sequence 1→2→3)
- Step 5 tracks social shares with queue penalty system

**API Resilience:**
- All API calls have localStorage fallback if server fails
- Queue count polls every 5 seconds via `/api/count`

**Security:**
- CORS whitelist: `nokier.co.uk`, `www.nokier.co.uk`
- Email regex validation on all endpoints
- Input length limits (favoritePolicy: 500, income: 200)
- Duplicate email checking in signup

**CSS:**
- Variables: `--nokia-blue: #124191`, `--red-accent: #dc2626`
- Heavy use of clamp() for responsive typography
- Animations: `slideDown`, `fadeInUp` keyframes

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string (set in Vercel dashboard)

## Deployment

Push to main branch → Vercel auto-deploys. No CI/CD pipeline.

## Content Guidelines

All copy is satirical political commentary. Key themes:
- Government inefficiency and bureaucracy
- "Two-Tier" technology/justice jokes
- Milton Friedman economic satire (payment section)
- Monero cryptocurrency for comedic privacy paranoia
