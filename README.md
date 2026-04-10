# Chronan

A Chrome extension that adds recipe ingredients to your [Krónan](https://www.kronan.is) shopping note while you browse. Open the side panel on any recipe page, let AI extract the ingredients, review the matched products, and add them to Krónan with one click.

## Features

- Extracts ingredients from recipe pages automatically (uses schema.org JSON-LD when available, falls back to AI)
- Searches Krónan's product catalog for each ingredient
- Per-ingredient product picker — choose between alternatives, adjust quantities
- Adds items to your Krónan **shopping note** (or cart)
- Saves recipe links locally for later reference
- Supports **OpenAI** (via API key or ChatGPT Plus/Pro OAuth), **Anthropic**, and **Google Gemini**

## Requirements

- Chrome 114+ (for Side Panel API support)
- Node.js 18+
- A [Krónan](https://snjallverslun.kronan.is) account with an access token
- An AI provider (OpenAI, Anthropic, or Gemini)

## Development setup

```bash
git clone <repo>
cd Chronan
npm install
npm run dev
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

The side panel hot-reloads when you change files. The service worker restarts automatically on changes (Chrome reloads the extension).

## Building for production

```bash
npm run build
```

Output goes to `dist/`. To distribute, zip the contents of `dist/` and upload to the Chrome Web Store.

## Configuration

Open the extension's **Options page** (right-click the toolbar icon → Options, or via `chrome://extensions`).

### 1. Krónan access token

1. Log in to [Krónan Snjallverslun](https://snjallverslun.kronan.is) (requires Audkenni)
2. Go to **Account settings → API access**
3. Generate a token (starts with `act_`)
4. Paste it into the Options page and click **Test connection**

### 2. AI provider

**Option A — ChatGPT subscription (OpenAI OAuth)**
Click **Connect with OpenAI** in the Options page. A browser tab will open for sign-in. Once authenticated, the tab closes automatically and your session is stored. Tokens refresh automatically — you only need to do this once.

Requires an active **ChatGPT Plus or Pro** subscription.

**Option B — API key**
Paste an API key for OpenAI (`sk-...`), Anthropic (`sk-ant-...`), or Gemini (`AIza...`). Keys are stored locally in Chrome's synced storage.

## How it works

```
Recipe page
    │
    ▼  (content script)
schema.org JSON-LD? ──yes──► structured ingredients
    │ no
    ▼
page text ──► background service worker ──► AI API
                                               │
                                               ▼
                                        Ingredient list
                                               │
                                               ▼
                                    Krónan product search
                                    (parallel, rate-limited)
                                               │
                                               ▼
                                    Side panel: review & confirm
                                               │
                                               ▼
                                    POST to Krónan shopping note
```

All API calls (Krónan + AI) go through the background service worker — no proxy server needed.

## Project structure

```
src/
├── background/          # Service worker: message dispatcher + API handlers
├── content/             # Content script: extracts recipe data from the page
├── lib/
│   ├── ai/              # AI adapters (OpenAI, Anthropic, Gemini) + OAuth flow
│   └── kronan/          # Krónan API client + rate limiter
├── sidepanel/           # Side panel UI (React)
├── options/             # Options page (React)
├── types/               # Shared TypeScript types
└── manifest.config.ts   # Chrome extension manifest
```

## API rate limits

Krónan allows 200 requests per 200 seconds per user. The extension uses a token-bucket rate limiter that queues requests automatically.

## Notes on OpenAI OAuth

The OAuth flow uses OpenAI's public Codex CLI client ID. It redirects to `localhost:1455` (OpenAI's registered callback URI) — the extension intercepts this navigation before the browser shows a connection error, so you won't see any error page.

This is the same approach used by other tools (OpenClaw, opencode) that support ChatGPT subscription auth.
