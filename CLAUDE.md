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
  not in the repo. Same for `SIGHTENGINE_USER` and `SIGHTENGINE_SECRET` (AI image detection).

## Claimant invitation links

Brokers can generate a secure public link to send to a claimant so the claimant
submits their own claim without needing an account. Replaces (or supplements)
the broker typing the claim in themselves.

- Broker-facing view: `public/js/views/invitations.js` + "Send Link" nav item
- Broker store: `store/invitations.js` — tokens persisted in `data/invitations.json` (gitignored)
- Broker API: `POST /api/invitations` (create), `GET /api/invitations` (list)
- Public routes (exempt from auth via the `/public/` path prefix):
  - `GET /api/public/invitations/:token` — returns prefilled name/policy/type, nothing else
  - `POST /api/public/claims/:token` — submits a claim using the token
- Claimant page: `public/claim.html` + `public/js/claim-public.js`, served at `/claim/:token`
- Tokens are 32-char hex, expire after 30 days, one-shot (status flips to `submitted` after use)
- Claims submitted via a link carry `source: 'claimant-link'` and `invitationToken: <token>`
- Claim `owner` is set to the broker who generated the link — so it lands in their dashboard
- The claimant only sees a thank-you + reference number; they never see the fraud analysis
- Auth middleware in `modules/auth/routes.js` skips any path starting with `/public/`

## AI image detection

Uploaded claim photos are checked against Sightengine's `genai` model to flag
AI-generated images (fraudsters submitting fake "damage" photos).

- Module: `modules/analysis/ai-detection.js`
- Runs in parallel with the main fraud analysis during claim submission
- Requires env vars `SIGHTENGINE_USER` + `SIGHTENGINE_SECRET` (sign up at sightengine.com — free tier)
- Silently skipped if env vars aren't set — the claim still submits normally
- Result stored on `claim.aiImageCheck` as `{ summary: { verdict, maxScore, worstImage }, perImage: [...] }`
- Verdict tiers: `likely` (≥70% AI), `possible` (40–69%), `unlikely` (<40%)
- "Likely" verdicts append a flag to the audit trail automatically
- Rendered via `renderAiImageCheck()` in `public/js/app.js` — shown on both the result and detail views

## Recent work log

Add a dated bullet every time we ship something so future-me has context.

- **2026-04-23** — Added EN/FR language toggle (new `public/js/i18n.js`, tagged all views,
  mounted switcher in navbar/login/sidebar). Shipped in commit `e062074`.
- **2026-04-23** — Added `user1` / `password1` account.
- **2026-04-23** — Added AI-generated image detection via Sightengine (`modules/analysis/ai-detection.js`,
  wired into claim submission, shown on result + detail views with EN/FR labels).
- **2026-04-23** — Added claimant invitation links: brokers generate a public URL, claimants submit
  without an account, claim lands in the broker's dashboard. New module
  `modules/invitations/`, new page `public/claim.html`, new view `js/views/invitations.js`.
- **2026-04-23** — Analysis now respects the user's language. Forms (broker submit + public claim)
  send `claimData.lang` ('en' | 'fr'); `modules/analysis/claude.js` includes a FR directive
  when `lang === 'fr'`. Enum fields (`risk_level`, `severity`) stay English — used by code.
  Heuristic fallback remains English-only (only runs if ANTHROPIC_API_KEY is unset).
- **2026-04-29** — Sightengine env vars (`SIGHTENGINE_USER` + `SIGHTENGINE_SECRET`) finally
  added in Railway, so the AI image detection that shipped on the 23rd is now live. Confirmed
  working — flagged a Higgsfield test image at 98% AI probability.
- **2026-04-29** — Police report PDF upload + cross-claim duplicate detection. New separate
  upload slot on both the broker form (`public/js/views/submit.js`) and the public claimant
  form (`public/claim.html` + `public/js/claim-public.js`) — multer now uses `.fields()`
  to accept `documents` (5 max, photos+PDFs) and a dedicated `policeReport` (1 PDF). The
  police-report PDF is passed to Claude with a targeted prompt block asking it to verify
  date/location/parties/forgery. New `findByPoliceReference()` helper in `store/claims.js`
  normalises references (strips whitespace/punctuation/case) and looks for matches across
  every existing claim — if found, a "Cross-Claim Duplicate" indicator is added at 90%
  confidence, fraud_score is floored at 75, and an audit-trail entry is added. New
  `renderCrossClaimMatch()` and `renderPoliceReport()` blocks on the result + detail views.
  Full EN/FR i18n.
- **2026-04-29** — Pass Sightengine verdict into Claude's prompt + hard fraud-score floor
  when the image is flagged. Solves the contradiction where Claude was writing "photo
  appears genuine" positive_factors while Sightengine separately flagged the same image at
  98% AI-generated. Sightengine now runs BEFORE Claude (sequentially, ~1–3s overhead) so
  its verdict is available to Claude's prompt; `formatAiImageCheckBlock()` writes the
  verdict into the prompt with explicit "trust this signal" instructions. After analysis,
  a hard floor enforces fraud_score ≥ 90 for "likely" and ≥ 60 for "possible" verdicts.
- **2026-04-29** — Fixed Claude responses being truncated mid-JSON: bumped `max_tokens`
  2048 → 4096, added `stop_reason === 'max_tokens'` detection (throws clear error instead
  of letting JSON.parse choke on partial output), and added markdown code-fence stripping
  so `\`\`\`json … \`\`\`` wrapped responses still parse.
- **2026-04-29** — Fixed silent Claude failure on phone-camera uploads. Added `sharp` and
  `modules/analysis/image-utils.js` with `compressForClaude()`: any image > 4.5 MB is auto-resized
  to 2000 px wide and re-encoded as JPEG q80 before being sent to Claude. iPhone uploads
  (typically 8–15 MB) used to fail Claude's 5 MB base64 cap and silently fall back to heuristic;
  they now pass through cleanly. Also stripped the misleading "[DEMO MODE — Add ANTHROPIC_API_KEY]"
  fallback text from `heuristic.js` so future genuine analysis errors aren't camouflaged.
- **2026-04-29** — Namecheap account suspension → DNS outage (~90 minutes mid-afternoon).
  Triggered by Namecheap's risk system flagging the account (probable cause: NordVPN was
  on during a recent Namecheap session — VPN exit-node IPs are a classic trigger). Domain
  itself was fine (active until 02-Apr-2027), but Namecheap pulled DNS service while the
  account was locked, so `dig www.claimlens.co.uk` returned empty. Site stayed up at
  `claimguard-ai-production.up.railway.app` throughout. Resolved by submitting unlock
  documents (ID + proof of address) via Namecheap's unlock flow, ticket `NC-XPV-8716`;
  DNS came back automatically once unlocked. **Lesson:** never log into Namecheap from a
  VPN. **Bigger lesson:** registrar lockout = full DNS outage when registrar is also DNS
  host. Cloudflare DNS migration is now urgent (see Open threads).
- **2026-04-29** — Added French test account `fruser2026` / `DFbW5eRrSob5` (role: user,
  display name: "FR User") for the first real test customer (a French insurance company).
  Non-admin → empty dashboard on first login (no seed clutter). Stored in `data/users.json`.
- **2026-04-29** — Marketing copy broadened from "Built for UK insurance brokers" to
  "Built for UK and European insurance brokers" in both EN + FR (hero subtitle, meta
  description). FR: "Conçu pour les courtiers en assurance au Royaume-Uni et en Europe."
- **2026-04-29** — White-labelled all user-facing references to Claude / Anthropic:
  hero badge ("Powered by Claude AI" → "AI-Powered Fraud Detection"), How It Works step 2,
  settings status panel ("Claude AI Connected" → "AI Engine Connected"), settings model
  name ("Claude Opus 4.6 (Anthropic)" → "ClaimLens AI Engine"), and the three error
  messages in `claude.js` that bubble up into the user-facing "Analysis error" banner
  ("Claude API error" → "AI service error" etc.). All internal code, comments, function
  names (`compressForClaude`, `claude.js` filename, etc.) **left intact** — they're dev-side
  only. Reasoning: avoid French regulatory questions ("where does Claude run? Is data
  going to the US?") during demos and decouple brand from a single vendor. Anthropic still
  needs to be disclosed as sub-processor when the privacy policy gets written.
- **2026-04-29** — Removed the misleading "demo-notice" banner from the submit form
  ("Claude AI analysis is enabled when ANTHROPIC_API_KEY is set in .env. Without it,
  heuristic analysis is used."). Looked unprofessional and exposed internal env-var names
  to end users. Banner div removed from `submit.js`; `submit.demoNotice` i18n key kept
  (now reads "AI analysis is active." / "Analyse IA active.") — harmless dead key, kept
  for backward compatibility.
- **2026-04-29** — French postcode lookup. Detects format on the fly: 5 digits → French
  BAN API (`api-adresse.data.gouv.fr`, official French gov, free, no API key); anything
  else → existing UK postcodes.io. Initial implementation used `?type=municipality` filter
  which broke for Paris arrondissements (75001–75020 are indexed by name not postcode).
  **Fix:** drop the filter, take all results, filter to those whose `postcode` field
  exactly matches input, dedupe by `city + postcode`. Verified working for `75001` (Paris),
  `06000` (Nice), `13001` (Marseille), `69001` (Lyon). Placeholder updated to
  `e.g. SW1A 1AA (UK) or 75001 (FR)` and FR equivalent.
- **2026-04-29** — Cal.com booking flow on the marketing page. Both demo CTAs (hero
  "Request a Demo" and bottom "Book a Demo") now open a Cal.com modal instead of
  redirecting to /login. Bound to `cal.com/claimlens/30min` with `billy@claimlens.co.uk`
  as organiser email (set up via Namecheap email forwarding to gmail). Themed in brand
  blue `#1E6FD9`. Schedule timezone in Cal.com is set to Europe/London regardless of
  Billy's physical location. Default video provider is Cal Video (browser-based, no
  install required for prospects, supports screensharing).
- **2026-04-29** — Upgraded Railway to Hobby plan (£5/mo). Trial credit timer is gone;
  site no longer at risk of dropping if usage spikes. Includes $5/mo of usage credit so
  net spend is roughly nil at current scale.
- **2026-04-23** — Audit trail entries now translate on the fly. System-generated notes are
  stored as structured objects `{ key: 'audit.note.xxx', vars: {...} }`; the renderer
  translates via i18n based on the ACTIVE language, so flipping EN↔FR re-translates old
  entries live. Plain-string notes (seed claims, reviewer free-text) still render as-is
  for backward compatibility. Shipped in commit `dc4f2e8`.

## Marketing & sales status

### First test customer
A French insurance company is the first real test of the platform. They get the
`fruser2026` account (credentials above). Account is intentionally on a clean dashboard
(no seed claims) so they only see what they themselves submit. They were the trigger
for white-labelling Claude references and broadening marketing copy from UK-only.

### Pricing strategy (agreed, not yet published anywhere on the site)
- **Pilot tier (first 5 customers)**: €300/month flat, unlimited claims, 6-month
  commitment. Required exchange: written testimonial, logo permission, reference call
  rights. The French company is on this tier — propose it to them in writing rather
  than verbally so the deal sticks.
- **Standard pricing (after 3–5 paying customers + case studies)**:
  - Starter — £500/month — up to 150 claims/mo
  - Professional — £1,500/month — up to 750 claims/mo, priority support, SSO
  - Enterprise — "Talk to us" — bespoke
- **Annual billing**: 20% discount.
- **Principles**: anchor high (never lower list price, only discount tactically); never
  publish enterprise prices; don't undercharge — £100/mo signals "side project" to
  insurance buyers, £500/mo signals "real software".

### Marketing channels (priority order, agreed not yet executed)
1. Make the French test successful → turn it into a case study (single biggest lever).
2. Direct LinkedIn outreach to UK brokers + MGAs. Target 10 sends/day, expect 1–2
   replies. Reference recent fraud news, link to Cal booker.
3. BIBA conference (May annually, ~9k UK brokers). Buy delegate ticket (~£500),
   skip the £10k+ booth.
4. Guest articles for Insurance Times, Post Magazine, Insurance Insider,
   Reinsurance News.
5. Get listed on InsurTech UK directory + F6S + Crunchbase.

**Don't spend money on**: paid ads, PR firm, growth marketing hire, conference booths,
explainer videos.

### Marketing surface gaps still open
- **Case study / customer logos** — empty until the French pilot completes (~6 months).
- **Public pricing page** — keep "contact us for a quote" until 5+ customers; gives
  freedom to read each prospect.
- **Security / compliance page** — insurance buyers immediately ask about GDPR/SOC 2.
  Tied to the Tier 1 hardening plan in Open threads.
- **Email capture / lead magnet** — even a "Download: 5 fraud patterns AI catches"
  PDF would build a list to nurture.
- **Demo script** — defer until the first actual booking lands; tailor to that
  specific prospect.

## Open threads (pick up here next session)

### Cloudflare DNS migration (NOW URGENT after today's outage)

The 29 Apr Namecheap suspension showed the failure mode: registrar = DNS host = single
point of failure. When Namecheap locked the account, DNS service went with it and the
custom domain went dead, even though the Railway app was healthy throughout.

**Plan:** keep registration at Namecheap (don't fight that battle), but move DNS hosting
to Cloudflare. Cloudflare is free, supports apex ALIAS records (so `claimlens.co.uk`
works without a www), faster propagation, DDoS protection, and means a future Namecheap
account issue can't take the site down on its own.

**Steps when Billy is ready (~10 min):**
1. Sign up at cloudflare.com (free), add `claimlens.co.uk` as a zone.
2. Cloudflare scans existing DNS records — verify the CNAME for `www` → Railway target
   is captured. Add an A or CNAME for the apex pointing at Railway too if you want
   `claimlens.co.uk` (no www) to also work.
3. Cloudflare gives two nameservers (e.g. `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`).
4. Log into Namecheap → Domain List → Manage `claimlens.co.uk` → Nameservers → switch
   from "Namecheap BasicDNS" to "Custom DNS" → paste Cloudflare's two nameservers → save.
5. Propagation: 5–60 minutes. Test with `dig +short www.claimlens.co.uk`.

After migration, all DNS edits happen in Cloudflare's panel. Namecheap is just the
registrar now — they hold the contract for the domain name itself, nothing else.

### Pre-existing items (still relevant)

### French insurance client — production hardening plan

Billy has a French client interested in using the platform. They're worried about data
breach. We agreed on a tiered hardening roadmap but haven't started it yet. Stack ranking:

**Tier 1 (next day or two — biggest client credibility win):**
- Move Railway deployment to EU West region (Amsterdam) — data residency. Quick dashboard job.
- Swap SHA-256 password hashing for bcrypt + quiet migration on next login.
- Add `express-rate-limit` to the login endpoint (brute-force protection).
- Add security headers via `helmet` (HSTS, CSP, X-Frame-Options).
- Enforce HTTPS redirects.
- Write a bilingual (EN/FR) Security & Data Handling page, linked from the footer.

**Tier 2 (week or two — real production readiness):**
- Migrate `data/*.json` to Postgres (Railway add-on). Solves the ephemeral filesystem
  problem AND gives encryption at rest + backups.
- Add login/access audit logs (separate from the per-claim audit trail).
- Add 2FA (optional but great trust signal).
- Add GDPR data-export + right-to-erasure endpoints.
- Draft a DPA in French (template, then a lawyer review before signing).

**Tier 3 (if the client is big/regulated):**
- Independent security audit / pen-test.
- SOC 2 or ISO 27001 path.
- Formal Data Processing Agreement.

French regulatory landscape notes: CNIL enforces GDPR strictly; ACPR supervises insurance;
DORA (in force Jan 2025) applies if client is a financial/insurance firm. Sightengine is
already Paris-based (plus). Anthropic has an EU data processing addendum.

### Ephemeral storage — known bug/feature

Every `git push` → Railway redeploy → `data/claims.json`, `data/settings.json`,
`data/invitations.json` get wiped. Committed demo claims in `store/claims.js` repopulate.
**Fix:** Postgres migration (in Tier 2). Until then, don't put real claims on the live site.

### Nice-to-have follow-ups (not urgent)

- Translate the 12 seed claims' audit trail notes (currently plain English strings).
- Set a proper git committer identity (`git config --global user.email "…"`) so commits
  don't show `bcw@Billys-MacBook-Air.local`.
- Offer brokers a QR-code version of the claim link for in-person handoffs.
- "Resend link" / "Revoke link" actions on pending invitations.

## How Billy likes to work

- Quick, direct. No fluff, no over-explaining.
- Wants terminal commands to paste, not clicks in dashboards.
- If something is ambiguous, ask — don't guess on big scope.
- Confirm when things are live/shipped; move on to the next thing.
