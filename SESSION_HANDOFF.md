# Session Handoff

## Current hosted auth/database direction (2026-05-20)
- **Active handoff**: [`docs/HOSTED_AUTH_DATABASE_HANDOFF.md`](docs/HOSTED_AUTH_DATABASE_HANDOFF.md).
- **Decision**: keep Netlify Identity as the authentication provider, but stop treating the old `netlify-identity-widget` iframe/modal as the primary UX path. Use Netlify Database only for application records (`user_profiles`, `usage_events`, later rollups/audit logs), not for custom password/session management.
- **Reason**: Identity is enabled for the Netlify project and the endpoint exists, but raw Vite local dev (`127.0.0.1:5173`) cannot reliably test remote Identity because cross-origin settings requests can fail in-browser. The old widget path also produced silent-click UX on production when the latest local diagnostics were not deployed.
- **Local verification requirement before GitHub/Netlify push**:
  - use `VITE_DEV_SKIP_IDENTITY=1` + `npm.cmd run web:dev` only for local hosted-shell/UI/parser checks
  - use `netlify dev` for real same-origin Identity + Functions + Database testing; it now runs `npm run web:preview` so the local parity check serves the production Vite build
  - then use a Netlify Deploy Preview before production
- **Local Netlify link**: this workspace is linked to Netlify site id `1b710186-07cb-4f14-a4ad-a3228b0fe93b` (`invoice-extractor-tool`), so `netlify dev` can proxy real `/.netlify/identity/settings` locally.
- **Current local smoke**: `netlify dev` at `http://localhost:8888/` loads the built hosted app, `/.netlify/identity/settings` returns JSON, and an invalid login attempt shows a visible form error instead of a silent click.
- **Latest hosted fix (2026-05-20)**:
  - removed the stale signup success copy that said "If confirmation is required..." after Identity was configured with email confirmation not required
  - fixed hosted PDF upload/runtime parsing by executing `src/core/core.js`, `src/parsers/parsers.js`, and `src/ui/ui.js` in one shared scope from `web/src/main.js`; this preserves the offline single-file global-state contract (`eid`, `fileEntries`, `analysisResults`, parser helpers) under Vite
  - normalized hosted auth email input to lowercase before signup/login to avoid mixed-case login failures
  - hosted telemetry requests now send the Netlify Identity JWT via `Authorization: Bearer <token>` while still using same-origin cookies
  - `netlify/functions/usage-ingest.mjs` now writes `user_profiles` + `usage_events`, preserves `(user_sub, client_event_id)` idempotency, and applies baseline per-user/per-IP rate limits backed by `ingest_rate_limits`
  - hosted telemetry now exposes a lightweight in-page monitor (`window.__LIV_USAGE_MONITOR`) and retries failed sends up to 3 times with the same client event payload
  - added repo-level hosted telemetry coverage via `tests/usage_ingest.mjs`
  - added `tests/hosted_telemetry_e2e.mjs` to validate hosted login + sample PDF upload + verification + telemetry DB write end-to-end
  - added `netlify/functions/admin-stats.mjs` with server-side admin-role enforcement and aggregate usage queries for summary, top users, monthly rows, and recent events
  - hosted UI now renders a read-only admin stats panel for Identity users whose roles include `admin` / `Administrator`
  - added `tests/admin_stats.mjs` to verify non-admin rejection and admin aggregate response shape
  - verified locally with `npm run check`, `npm run test:hosted`, `npm run web:build`, `npm run build`, and `npm run regression`
  - verified locally with `netlify dev` + `HOSTED_E2E_BASE_URL=http://localhost:8888 npm run test:hosted-e2e`: new account signup, sample PDF upload, telemetry success event, and matching `usage_events` row all passed
  - verified locally for M4 with `npm run test:admin`, `npm run test:hosted`, and `npm run web:build`
- **Historical note**: [`docs/IDENTITY_LOGIN_HANDOFF.md`](docs/IDENTITY_LOGIN_HANDOFF.md) is now superseded as implementation direction and kept only as old-widget debugging context.

## Hosted roadmap (M2 in progress)
- **Authoritative rollout spec**: [`docs/HOSTED_ROLLOUT_PLAN.md`](docs/HOSTED_ROLLOUT_PLAN.md) (M1 shipped; M2 now covers database-backed ingest, idempotency, and baseline rate limiting).
- **Long-lived decision record**: [`DECISIONS.md`](DECISIONS.md) § “2026-05-12…” and **2026-05-13 - Hosted Web Shell Uses Vite…**.
- **What shipped in-tree for M1**:
  - `vite.config.mjs`, `web/src/main.js` — Vite app imports **`src/core/core.js`**, **`src/parsers/parsers.js`**, **`src/ui/ui.js`** (shared SSOT with offline build).
  - `scripts/gen_web_index.mjs` — generates `web/index.html` from `src/index.template.html` + Identity control strip; run via `npm run web:dev` / `npm run web:build`.
  - `netlify.toml` — build `npm run web:build`, publish `dist-web/`, `netlify dev` proxies to Vite **5173**.
  - `web/public/_redirects` — SPA fallback rule (`/* /index.html 200`) applied at deploy/build output level.
  - `netlify/functions/usage-ingest.mjs` — `POST` handler with payload cap, authenticated user resolution, database persistence, idempotent inserts, and baseline rate limiting.
  - `netlify/database/migrations/0001_create-usage-tables/` — `user_profiles` + `usage_events`.
  - `netlify/database/migrations/0002_add-ingest-rate-limits/` — hashed per-scope request buckets for baseline anti-abuse controls.
  - `tests/usage_ingest.mjs` — local handler coverage for payload validation, idempotency, and rate limiting.
  - `tests/admin_stats.mjs` — local handler coverage for admin authorization and aggregate response shape.
  - Hosted UX: **Netlify Identity** — **single** sign-in entry (`netlifyIdentity.open()`); dedicated **login panel** until session exists; then full validator workspace (`#hostedAppShell`). No `data-netlify-identity-button` on duplicate controls. For **pure Vite** local runs, optional [`web/.env.example`](./web/.env.example) → `web/.env.local` with `VITE_DEV_SKIP_IDENTITY=1` bypasses the gate (**development only**, see **Local debugging** below).
- **Login silent-click mitigation landed (2026-05-13)**: `web/src/main.js` now treats `Sign in` as **fail-open + visible diagnostics** instead of waiting forever for `init`:
  - click attempts `netlifyIdentity.open('login')` immediately
  - if `init` is still pending, a one-shot retry waits on `init` with a 4s timeout
  - timeout/error states now show an in-page notice (Identity disabled / tracking or ad-block interference) instead of no-op UX
  - production still requires Identity enabled and browser storage allowances; see **[`docs/IDENTITY_LOGIN_HANDOFF.md`](docs/IDENTITY_LOGIN_HANDOFF.md)** for dashboard/browser checklist

### Local debugging (hosted shell — before relying on Identity)
- **Symptom** `Failed to load settings from /.netlify/identity` on **`*.netlify.app`**: Identity is **not enabled** on that Netlify site. Fix: Dashboard → **Site configuration** → **Identity** → enable the service — then reopen the site / clear cache — see also step 4 below for registration/email settings.
- **`npm run web:dev` without Identity**: Copy [`web/.env.example`](./web/.env.example) to **`web/.env.local`** (already gitignored) with **`VITE_DEV_SKIP_IDENTITY=1`**, restart Vite → upload zone works without login. **`vite build`/Netlify** always sets `import.meta.env.DEV === false`, so this bypass cannot ship in production bundles from a normal CI build unless you misuse custom modes env.
- **`npm run web:dev` WITH login** — if the widget opens **“Development Settings”** asking for your Netlify site URL: enter your **site root** (e.g. `https://invoice-extractor-tool.netlify.app`) and *Set site’s URL*, **or** add **`VITE_NETLIFY_IDENTITY_URL=https://<site>.netlify.app/.netlify/identity`** to `web/.env.local` (and comment out **`VITE_DEV_SKIP_IDENTITY`**), restart Vite — `main.js` calls `init({ APIUrl })` in dev only per [netlify-identity-widget § Localhost](https://github.com/netlify/netlify-identity-widget#localhost).
- **`netlify dev` (full parity)**: Use after Identity is enabled and the CLI is **`netlify link`**’d to this site — same widget as production, routed through `/.netlify/identity`.
- **If `Sign in` appears dead and Console shows `Failed to load module script` MIME errors on `localhost`**: `web/src/main.js` was not loaded because a Netlify SPA catch-all rewrote module paths to `/index.html`. Keep SPA fallback in `web/public/_redirects` (deploy artifact) and avoid catch-all redirects in `netlify.toml` during local dev; then restart `netlify dev`.
- **`netlify dev` on Windows fails with Deno (`spawn EBUSY` / `Failed to set up Deno for Edge Functions`)**: Netlify keeps a downloadable binary under **`%AppData%\Roaming\netlify\Config\deno-cli\`** — Defender/antivirus often locks **`deno.exe`** right after download. Try in order:
  1. `Remove-Item -Recurse -Force "$env:APPDATA\netlify\Config\deno-cli"` (and `\config\deno-cli` if it exists — case differs).
  2. Install **global Deno** (`winget install --id DenoLand.Deno -e`), then **open a new terminal** so `deno --version` works on PATH (CLI prefers global Deno when present).
  3. Retry `netlify dev`. If still `EBUSY`, add a **Controlled folder access / Defender exclusion** for the `...\netlify\Config\deno-cli` folder.
  4. If you only need SPA + Node Functions (no Edge Functions) and CLI still breaks, use **`npm run web:dev`** + `VITE_*`/`VITE_DEV_SKIP_IDENTITY` from **`web/.env.example`** for daily UI work ([netlify/cli#7044](https://github.com/netlify/cli/issues/7044) workaround thread).

### Requires human operator verification (not automatable here)
1. **GitHub remote (Netlify expects a published repo for “Connect to Git”)**: On GitHub, create an **empty** repo (no README/license unless you prefer `git pull` first). Then in this folder run:
   `git remote add origin https://github.com/<you>/<repo>.git`
   `git push -u origin master`
   After `origin` exists, rerun `netlify init` and choose **No, I will connect this directory with GitHub first**, or attach the repo in the Netlify site → **Site configuration → Build & deploy → Continuous Deployment**.
   Local-only `.netlify/` is listed in `.gitignore` (Netlify CLI may add it there automatically).
2. **Link the repo to a Netlify site** (install [Netlify CLI](https://docs.netlify.com/cli/get-started/), then `netlify login` and `netlify init` / link to existing site). Commit the resulting `.netlify/state.json` **only if your team policy allows** — many teams keep link state local; either way, CI must use Netlify’s GitHub integration with the same site.
3. **Identity**: In the Netlify site dashboard → **Identity** → enable; **Registration**: *Open*; **Emails** → disable mandatory signup confirmation (per rollout plan “注册即使用”).
4. **Smoke**: From project root, `netlify dev` → open the printed URL → **sign up / log in** → confirm drop zone enables and **offline parity**: run verification on a non-sensitive test PDF locally.
5. **Optional**: Set site env **`USAGE_INGEST_MAX_BYTES`**, **`INGEST_MAX_REQ_PER_MIN_USER`**, **`INGEST_MAX_REQ_PER_MIN_IP`**, and **`INGEST_RATE_LIMIT_WINDOW_SECONDS`** in Netlify UI for production; test `POST /.netlify/functions/usage-ingest` returns `200` with small JSON, **`413`** when body exceeds the cap, and **`429`** when the request window is exceeded.
6. **Raw Vite** (`npm run web:dev` alone) does **not** load `/.netlify/identity`; use **`VITE_DEV_SKIP_IDENTITY`** in `web/.env.local` to debug core parsing/UI, or use **`netlify dev`** once Identity is **enabled** on the linked site — see **Local debugging** above.

- **Next implementation chunk (M3)**: verify real hosted telemetry end-to-end through authenticated `netlify dev` / Deploy Preview browser sessions, then begin `admin-stats` + admin-only reporting surfaces.
- **Next implementation chunk (M5)**: operator docs for Netlify setup/env matrix/retention, plus optional admin UI polish (time filters, empty/error states, and richer rollup views).

## Current State
- Product name: `Lenovo EaaS Invoice Validator`
- Current version: `v3.12.44`
- Main deliverable:
  - `release/lenovo_invoice_validator.html`
- Release sync target (OneDrive — env overrides resolver; see [`scripts/release_sync.mjs`](./scripts/release_sync.mjs)):
  - **Windows default:** `C:\OD\OneDrive - Lenovo\…\Claude_invoice_extractor_tool\Releases\lenovo_invoice_validator_latest.html`
  - **macOS default:** `~/Library/CloudStorage/…/Claude_invoice_extractor_tool/Releases/lenovo_invoice_validator_latest.html`
  - Canonical folder: `.../All_In_AI_Projects/Claude_invoice_extractor_tool/Releases/`
- Working directory: this project folder (`02_PROJECTS/codex_invoice_extractor_tool`).

## Current Focus
- Workspace migration into `Studio` is complete.
- Project functionality has been validated after migration.
- Future work should stay incremental and regression-driven.
- Hosted login troubleshooting status:
  - silent no-feedback `Sign in` path is mitigated in UI logic (`web/src/main.js`)
  - final closure still needs live-site verification on Netlify deploy (`Sign in` must open modal or render actionable notice)
- Error-review UI now supports an error-focused detail mode:
  - root-level error invoice chips for statements with row-level issues
  - `Detail Line Items` defaults to `Errors only` when row-level issues exist
  - `Show all` restores full invoice chips and full detail rows
- Multi-country country-level filter behavior:
  - default view shows only countries with issue signals when multiple countries are present
  - issue signals currently use `failed checks` only
  - `Show all countries` toggles back to the full country list
  - the country tab/filter strip is visually highlighted for discoverability
  - when all countries are shown, countries with issues are visually highlighted in country cards and country tabs
- Lenovo-style UI iteration (v3.12.40 candidate):
  - updated template tokens and typography to a Lenovo-aligned baseline
  - reduced page max width to improve scan readability for dense review tables
  - added keyboard/ARIA support to upload zone and country summary cards
  - added visible focus styles across major interactive controls
  - moved `price gap anomalies` text to i18n key usage
- Excel export robustness:
  - export now normalizes cell values before sheet creation
  - overlong text values are truncated to Excel-safe length (`32767`) with `...[truncated]`
  - this prevents full export failure on malformed or unusually long parsed text
- Excel export robustness:
  - export now normalizes cell values before sheet creation
  - overlong text values are truncated to Excel-safe length (`32767`) with a suffix
  - this prevents full export failure on malformed or unusually long parsed text
- PH detail parsing compatibility:
  - `parseItemsPH` now supports both legacy no-tax PH lines and newer tax-inclusive PH lines
  - PH detail rows with non-`WBD` product IDs (for example `*_AAS` patterns) are now recognized
  - verified against `PH02_STMT_BRIM_STATEMENT_EPHP0000184.PDF` (detail rows restored)
- IN detail product parsing robustness:
  - `parseItemsIN` now handles split product IDs around qty rows (for example `5MS1C3370` + `2_AAS`)
  - prevents suffix-first PID contamination and reuses prior valid name for same PID when needed
  - verified against `IN01_STMT_BRIM_STATEMENT_EINP0000321.PDF` page-17 edge case
- US detail name parsing robustness:
  - `parseItemsUS` fallback now uses strict PID boundaries and filters short suffix/noise fragments (`28`, `S)`, `/US 2328`)
  - picks nearest meaningful name line and only joins continuation when pattern indicates true split text
  - verified against `US22_STMT_BRIM_STATEMENT_EPREUSP0002516.PDF` (product names restored from fragment-only values)

## Current Coverage
- Supported countries shown in UI: `25`
  - `AT/AU/BE/CA/CH/DE/ES/FR/GB/GR/HK/IE/IN/IT/JP/KR/MY/NL/NZ/PH/PT/SE/SG/TH/US`
- Supported sales orgs currently represented in approved samples: `31`
  - `AT01 AU04 BE01 CA01 CH01 DE01 DE05 ES01 FR01 GB01 GB11 GR01 HK01 HK52 IE01 IN01 IN03 IT01 JP01 KR01 KR11 MY01 NL01 NL11 NZ01 PH02 PT01 SE01 SG11 TH01 US22`

## Approved Sample Status
- `Approved_Preview` is fully covered by regression.
- All approved samples currently pass regression.
- Known intentional non-zero failed checks still allowed in fixtures:
  - `JP01_STMT_BRIM_STATEMENT_EPREJPP0000568_JA.PDF`
  - `NL11_STMT_BRIM_STATEMENT_EPRENLP0000515_EN.PDF`
  - `PT01_STMT_BRIM_STATEMENT_EPREPTP0000122_EN.PDF`
  - `AU04_STMT_BRIM_STATEMENT_EPREAUP0000931.PDF`
- These are accepted baselines, not accidental regressions.

## Key Behaviors Already Implemented
- Release:
  - `npm run release:sync` builds and syncs latest to OneDrive
  - **Windows**: default OD sink is wired in `scripts/release_sync.mjs` (`C:\OD\OneDrive - Lenovo\…\Releases\`); override with `INVOICE_RELEASE_LATEST` or `INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR` if needed (see [`WINDOWS_MIGRATION.md`](../../WINDOWS_MIGRATION.md))
  - old latest is archived to history with versioned naming
  - default publish path is commit-driven via `.githooks/post-commit`
  - do not manually pre-run `release:sync` unless explicitly requested
- Regression:
  - external PDF sample root (checked in order): `$INVOICE_SAMPLE_DIR`, Studio-relative `03_WORK/Attachments/invoice-regression/Approved_Preview`, legacy Mac `WorkStation` path if present, then `tests/fixtures.json` bundled dir — see `tests/regression.mjs`.

- Local workspace:
  - project folder: `02_PROJECTS/codex_invoice_extractor_tool`
  - sample assets: `03_WORK/Attachments/invoice-regression`
  - **Windows:** removed stray macOS `._*` AppleDouble sidecars workspace-wide; `.gitignore` now ignores `._*` so they do not re-pollute `git status` after Mac/sync copy.

## Special Cases To Remember
- `GR`
  - no detail-level tranche ID; this is not an error
  - validate at invoice level
  - tranche summary comes from summary page
- `KR`
  - Korean billing summary parsing added to avoid false `Billing Summary missing` errors
  - non-WBD warnings can still be legitimate and should remain
- `JP`
  - footer/page text contamination was fixed
  - tranche and product-name handling is specialized
- `IN`
  - product IDs can wrap across lines
  - taxable value may be the right price basis instead of displayed rate-per-item

## Files That Matter Most
- Core logic:
  - `src/core/core.js`
  - `src/parsers/parsers.js`
  - `src/ui/ui.js`
  - `src/index.template.html`
- Build/release:
  - `scripts/build_release.mjs`
  - `scripts/release_sync.mjs`
  - `scripts/bump_release_version.mjs`
- Tests:
  - `tests/regression.mjs`
  - `tests/fixtures.json`
  - `tests/README.md`

## Workflow For The Next Change
1. Reproduce on one concrete PDF.
2. Determine whether it is:
   - header extraction
   - billing summary extraction
   - detail parser issue
   - UI/export issue
3. Fix as narrowly as possible.
4. Add or tighten regression assertions when appropriate.
5. Run:
   - `npm run check`
   - `npm run regression`
   - `npm run build`
6. Commit after verification.
7. Let post-commit release sync publish to OneDrive unless a manual pre-commit release was explicitly requested.

## Useful Commands
```bash
npm run check
npm run regression
npm run build
npm run release:sync
npm run version:bump
```

## Open Direction
- **Hosted initiative** (parallel track): advance milestones **M1 → M5** per [`docs/HOSTED_ROLLOUT_PLAN.md`](docs/HOSTED_ROLLOUT_PLAN.md); keep parser corrections **regression-first** (`npm run check`, `npm run regression`).
- Offline product track: continue only if new PDFs reveal genuinely new layouts, metadata gaps, or export/readability issues — avoid broad refactors without payoff.

## Read Next Time
- Start with `README.md` for project entry.
- If working on hosted Netlify work, open [`docs/HOSTED_ROLLOUT_PLAN.md`](docs/HOSTED_ROLLOUT_PLAN.md) before coding.
- Use `DECISIONS.md` for long-lived design and workflow rules.
- Use this file for current state and next-step continuity.
