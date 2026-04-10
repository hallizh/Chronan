# Chronan — Claude Code Guide

## What this is

A Chrome Manifest V3 extension. React + TypeScript + Vite, built with `@crxjs/vite-plugin`. The extension has three entry points: a **side panel** (main UI), an **options page**, and a **content script**. All cross-origin API calls go through the **background service worker**.

## Commands

```bash
npm run dev      # Dev build with HMR (load dist/ as unpacked extension)
npm run build    # Production build (tsc -b && vite build)
npm run lint     # ESLint
```

After `npm run dev`, load `dist/` in Chrome via `chrome://extensions → Load unpacked`. The side panel and options page hot-reload; the service worker restarts on change (Chrome reloads the extension automatically).

## Architecture

```
chrome.tabs (recipe page)
    └── content/index.ts          ← reads DOM, sends recipe data to side panel

chrome.sidePanel
    └── sidepanel/                ← React UI, user interaction
        └── sends messages to ──► background/index.ts

background/index.ts               ← service worker, message dispatcher
    ├── handlers/recipe.ts        ← calls AI to extract ingredients
    ├── handlers/search.ts        ← calls Krónan product search
    ├── handlers/cart.ts          ← adds to Krónan shopping note / cart
    └── handlers/storage.ts       ← read/write saved recipes

lib/kronan/client.ts              ← Krónan REST API client
lib/kronan/rate-limiter.ts        ← token bucket (200 req/200s), persisted in chrome.storage.session
lib/ai/index.ts                   ← provider factory (reads settings, returns adapter)
lib/ai/openai.ts                  ← OpenAI adapter + PKCE OAuth flow
lib/ai/anthropic.ts               ← Anthropic adapter
lib/ai/gemini.ts                  ← Gemini adapter
```

## Message passing

All side panel → background communication uses `chrome.runtime.sendMessage`. Types are in `src/types/messages.ts`. The background listener always `return true` to keep the async channel open.

```ts
// Sending from side panel
const result = await chrome.runtime.sendMessage({ type: "SEARCH_PRODUCTS", payload: { query, ingredientId } });

// Receiving in background
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch(e => sendResponse({ error: e.message }));
  return true; // keep channel open for async
});
```

## Key types

- `src/types/recipe.ts` — `Ingredient`, `MatchedIngredient`, `SavedRecipe`
- `src/types/kronan.ts` — `KronanProduct`, `CartLine`
- `src/types/ai.ts` — `AISettings`, `AIProviderName`, `MODEL_OPTIONS`
- `src/types/messages.ts` — discriminated union of all message types

## Krónan API

Base URL: `https://api.kronan.is/api/v1/`
Auth: `Authorization: AccessToken act_xxxxx`

Key endpoints used:
- `POST /products/search/` — `{query, pageSize}` → `{results: KronanProduct[]}`
- `GET /checkout/` — current cart
- `POST /checkout/lines/` — add to cart `{lines: [{sku, quantity}]}`
- `POST /shopping-notes/add-line/` — add to shopping note (default)
- `GET /me/` — verify token

Rate limit: 200 req / 200s. Handled by `lib/kronan/rate-limiter.ts`.

## AI providers

All three adapters implement `AIProvider` from `lib/ai/types.ts`:

```ts
interface AIProvider {
  extractIngredients(pageText: string, url: string): Promise<Ingredient[]>;
}
```

The AI is prompted to return a JSON array of ingredients with Icelandic search terms (for better Krónan matches). See `lib/ai/prompt.ts`.

## OpenAI OAuth

Uses OpenAI's public Codex CLI client (`app_EMoamEEZ73f0CkXaXp7hrann`) with PKCE/S256.

Flow (`lib/ai/openai.ts`):
1. Generate PKCE code verifier + S256 challenge
2. `chrome.tabs.create()` opens `https://auth.openai.com/oauth/authorize?...`
3. `chrome.tabs.onUpdated` watches for navigation to `http://localhost:1455/auth/callback`
4. Tab is closed immediately on detection (before browser shows connection error)
5. Auth code exchanged for access + refresh tokens via `https://auth.openai.com/oauth/token`
6. Tokens stored in `chrome.storage.sync`; auto-refreshed 5 min before expiry

Requires `tabs` permission in manifest.

## Service worker gotchas (MV3)

- SW is terminated after ~30s of inactivity. State is NOT in module scope — use `chrome.storage.session` for ephemeral state (rate limiter counters).
- `background/alarm.ts` sets up a `chrome.alarms` keepalive to prevent termination during long operations (searching 15+ ingredients).
- Never rely on module-level variables surviving across SW restarts.

## Storage keys

All defined in `src/constants/index.ts` as `STORAGE_KEYS`:
- `AI_SETTINGS` → `chrome.storage.sync` — AI provider config + OAuth tokens
- `KRONAN_TOKEN` → `chrome.storage.sync` — Krónan access token
- `SAVED_RECIPES` → `chrome.storage.local` — array of `SavedRecipe`
- `RATE_LIMITER` → `chrome.storage.session` — rate limiter state

## Adding a new AI provider

1. Add adapter in `src/lib/ai/<name>.ts` implementing `AIProvider`
2. Add provider name to `AIProviderName` union in `src/types/ai.ts`
3. Add model options to `MODEL_OPTIONS` in `src/types/ai.ts`
4. Add case to the factory in `src/lib/ai/index.ts`
5. Add API base URL to `host_permissions` in `src/manifest.config.ts`

## Build output

`@crxjs/vite-plugin` handles everything — manifest injection, asset URL rewriting, HMR. Do not edit `dist/` directly. The manifest in `dist/manifest.json` is generated from `src/manifest.config.ts`.
