# ClaimLens AI — Project Context for Claude

> Read this at the start of every session so Billy doesn't have to re-explain things.

## What this is

**ClaimLens AI** — an AI-powered insurance fraud detection platform for UK insurance brokers.
Users submit claims (auto or property), Claude analyses them for fraud indicators, and
risky claims are escalated to a human review queue.

- Live site: Railway-hosted, auto-deploys from `main` on GitHub
- Repo: `aistartup36-stack/claimguard-ai`
- Owner: Billy (mrbcw92@icloud.com)

## Stack

- **Backend:** Node.js + Express (`server.js` is the entry point)
- **AI:** `@anthropic-ai/sdk` (Claude Opus) — active when `ANTHROPIC_API_KEY` env var is set; falls back to heuristic analysis otherwise
- **Frontend:** Vanilla JS, no build step. Single-page `app.html` + marketing `index.html`
- **Storage:** Local JSON files in `data/` (claims, settings, users). ⚠️ Railway's filesystem is ephemeral, so submitted claims don't persist across redeploys — fine for demos, not for real production
- **Auth:** SHA-256 hashed passwords in `data/users.json`, session cookies

## File layout

```
server.js              ← Express entry point
modules/               ← backend routers (auth, claims, analysis, queue, dashboard, reports, settings)
public/
  index.html           ← marketing landing page (navbar, hero, features, CTA)
  app.html             ← logged-in app shell (login screen + sidebar + content area)
  js/
    i18n.js            ← EN/FR dictionary + runtime (see i18n section)
    app.js             ← router, badges, result/detail renderers
    auth.js            ← login form logic, sidebar populate
    api.js             ← fetch wrapper for backend APIs
    utils.js
    views/             ← dashboard, submit, queue, history, settings (each is a render module)
    components/toast.js
  css/                 ← main.css, components.css
store/                 ← JSON file I/O helpers
data/                  ← runtime data (users.json tracked; claims/settings gitignored)
```

## Deployment workflow

Billy's preferred rhythm: **he tells me what he wants, I give him terminal commands to paste.** He doesn't want to dig around in dashboards.

Standard "ship it" flow:
```bash
cd ~/Desktop/insurance-fraud-detector
git add <files>
git commit -m "…"
git push origin main    # triggers Railway auto-deploy, live in ~1–3 min
```

## Internationalisation (EN/FR)

Full EN/FR toggle across the marketing site and the logged-in app. Added because a
French-speaking client wanted to test it.

- Dictionary and runtime live in `public/js/i18n.js`
- Static HTML tagged with `data-i18n="key"` (also `data-i18n-placeholder`, `data-i18n-title`)
- Dynamic JS strings use `i18n.t('key', { vars })` — `app.js` defines a short alias `T()`
- Switcher mounted in three spots: homepage navbar, login card footer, sidebar footer
- Selection persisted in `localStorage` under `claimlens.lang`
- Language change fires `i18n.onChange()` so views re-render in the new language

To add a new phrase: add matching entries to both `en:` and `fr:` blocks in `i18n.js`,
then reference with `data-i18n="your.key"` or `T('your.key')`.

## Auth / users

Users in `data/users.json`. Passwords are SHA-256 hashed (no salt) — simple but fine for
this demo-stage app. Default accounts created on first boot if file is empty:

| Username | Password        | Role  |
|----------|-----------------|-------|
| admin    | claimlens2026   | admin |
| demo1    | demo2026        | user  |
| demo2    | demo2026        | user  |

Additional accounts shipped: `Roberts`, `user1` (password `password1`, role `user`).

To add a new user: use the Node one-liner pattern that hashes the password and
pushes. Roles: `admin` (sees Settings) or `user` (hidden from Settings).

## Known quirks / things to watch

- **Ephemeral storage on Railway** — any claims submitted after deploy are wiped on next
  redeploy. If Billy wants persistence, move claims/settings to a real DB (Postgres add-on
  on Railway is the easiest upgrade).
- **`data/users.json` IS committed** (only `claims.json` and `settings.json` are gitignored),
  so new users ship with a `git push`.
- **`.env` is gitignored** — ANTHROPIC_API_KEY must be set in Railway's dashboard env vars,
  not in the repo.

## Recent work log

Add a dated bullet every time we ship something so future-me has context.

- **2026-04-23** — Added EN/FR language toggle (new `public/js/i18n.js`, tagged all views,
  mounted switcher in navbar/login/sidebar). Shipped in commit `e062074`.
- **2026-04-23** — Added `user1` / `password1` account.

## How Billy likes to work

- Quick, direct. No fluff, no over-explaining.
- Wants terminal commands to paste, not clicks in dashboards.
- If something is ambiguous, ask — don't guess on big scope.
- Confirm when things are live/shipped; move on to the next thing.
