# Handoff: Hosted Auth + Usage Database Direction

Status: **Active direction**  
Last updated: **2026-05-21**

This handoff supersedes the earlier "make `netlify-identity-widget.open()` work" track. Keep the old Identity login notes for historical debugging context, but do not continue investing in the iframe/widget modal as the long-term hosted login UX.

## Executive decision

Use **Netlify Identity for authentication** and **Netlify Database for application data**.

Do **not** build a custom password/login system in Netlify Database. It adds security and maintenance risk for little product benefit. The project only needs user identity, access control, admin roles, and usage reporting; Identity already owns the hard parts: signup, login, JWT/session, password reset, and roles.

Build our own database tables only for business/application records:

- `user_profiles`: Identity user id (`sub`), optional display name, first/last seen timestamps, admin-facing metadata if needed.
- `usage_events`: metadata-only usage facts from validator runs.
- optional later tables: `monthly_usage_rollups`, `admin_audit_logs`.

## Why the old widget path is being replaced

Current findings:

- The Netlify Identity endpoint exists for `invoice-extractor-tool.netlify.app`.
- Production currently appears to run an older bundle; clicking **Sign in** can still be silent because the latest local fail-open diagnostics are not deployed.
- Raw Vite local dev at `http://127.0.0.1:5173` cannot reliably test hosted Identity login by calling `https://invoice-extractor-tool.netlify.app/.netlify/identity/settings`; browser CORS/credential behavior can block the request even when Identity is enabled.
- The old `netlify-identity-widget` iframe/modal makes local diagnosis harder and has already produced "click does nothing" UX.

New direction:

- Replace modal-widget login with an explicit hosted auth screen.
- Prefer Netlify's current Identity client package (`@netlify/identity`) for new work.
- Keep all auth failures visible in the page; no silent click paths.

## Local-first verification requirement

The owner wants a version that can be verified locally before pushing to GitHub/Netlify.

Use this test ladder:

1. **Offline validator safety check**
   - `npm.cmd run check`
   - `npm.cmd run regression`
   - `npm.cmd run build`
   - Confirms parser/offline behavior still works.

2. **Raw Vite UI check without auth**
   - Enable `VITE_DEV_SKIP_IDENTITY=1` in untracked `web/.env.local`.
   - Run `npm.cmd run web:dev`.
   - Verify the hosted shell and validator UI using local-only bypass.
   - This does **not** validate Identity.

3. **Netlify-parity local check**
   - Use `netlify dev` against the linked Netlify site.
   - Open the URL printed by Netlify CLI, not bare `127.0.0.1:5173`.
   - This repo intentionally runs `npm run web:preview` under `netlify dev`, so the local parity check serves the production Vite build instead of hot-dev `/src/*` modules.
   - Validate signup/login and Function calls through same-origin `/.netlify/*` paths.
   - If Windows Deno setup blocks `netlify dev`, fix that environment issue before claiming auth is locally verified.

4. **Deploy Preview check before production**
   - Push a branch only after local checks pass.
   - Use Netlify Deploy Preview to test real hosted auth and database writes before merging/deploying production.

## Target hosted auth UX

Unauthenticated users see a login/register panel. Authenticated users see the validator workspace.

Required states:

- Loading: checking existing Identity session.
- Signed out: show email/password login and signup affordance.
- Auth error: show a clear message with the failing action.
- Signed in: show validator workspace and user indicator.
- Sign out: returns to signed-out panel.

Avoid relying on hidden iframe modal state as the primary UX signal.

## Database boundaries

Telemetry remains metadata-only.

Allowed in `usage_events`:

- Identity `sub` or opaque user id.
- `client_event_id` for idempotency.
- `session_id`.
- timestamp.
- counts: PDFs processed, pages processed, success/error/issue outcome.
- schema version.

Do not store:

- PDF bytes.
- filenames.
- customer names.
- statement/invoice numbers.
- line items.
- monetary amounts.
- free-text snippets from invoices.

## Minimal M2 implementation shape

1. Auth client replacement
   - Add explicit login/signup/logout flow.
   - Store current authenticated user state in `web/src/main.js`.
   - Remove dependency on the old modal widget path for the primary UX.

2. Function auth contract
   - `POST /.netlify/functions/usage-ingest`
   - Requires `Authorization: Bearer <Identity JWT>`.
   - Verifies user identity server-side.
   - Enforces payload max size and rate limits.
   - No-op success on duplicate `client_event_id`.

3. Database schema
   - Migration for `user_profiles`.
   - Migration for `usage_events`.
   - Migration for hashed ingest rate-limit buckets.
   - Unique key for `(user_sub, client_event_id)`.

4. Local verification
   - `netlify dev` can log in, process a safe test PDF, and write one metadata-only usage event.
   - A repeated submit does not double-count.
   - `npm.cmd run check`, `npm.cmd run regression`, `npm.cmd run build`, and `npm.cmd run web:build` pass.

## Files to update during implementation

- `web/src/main.js`: hosted auth UI state, login/signup/logout, usage event emission.
- `scripts/gen_web_index.mjs`: generated hosted login markup if the form needs structural changes.
- `src/index.template.html`: shared styling and hosted-only auth UI CSS.
- `netlify/functions/usage-ingest.mjs`: JWT verification, validation, database write.
- database migration directory created by Netlify Database tooling.
- `web/.env.example`: document supported local modes.
- `SESSION_HANDOFF.md`: keep the immediate current state aligned.

## 2026-05-19 implementation notes

- Hosted auth now uses `@netlify/identity` with an explicit email/password form.
- Hosted auth normalizes email input to lowercase before signup/login so mixed-case addresses do not create avoidable login mismatches.
- Signup success copy no longer mentions optional email confirmation; the Netlify project is configured with registration open and email confirmation not required.
- `web/src/main.js` imports the core/parser/UI source as raw text and executes them in one shared scope. This is intentional: the offline product depends on a single-file global-state contract, and the hosted Vite bundle must preserve that contract until the core is deliberately refactored into real modules.
- Hosted telemetry now sends the Netlify Identity JWT in the `Authorization` header while keeping same-origin cookie auth.
- `netlify/functions/usage-ingest.mjs` now persists `user_profiles` + `usage_events`, enforces `(user_sub, client_event_id)` idempotency, and applies baseline per-user/per-IP rate limits via the `ingest_rate_limits` migration.
- Added `tests/usage_ingest.mjs` to cover payload validation, idempotent duplicate submits, and rate-limit behavior without needing a live Netlify session.
- Hosted telemetry now exposes `window.__LIV_USAGE_MONITOR` and retries failed sends up to 3 times with the same event payload, which keeps the client UUID retry-safe while making local diagnostics easier.
- Added `tests/hosted_telemetry_e2e.mjs` to exercise the real hosted path: local Netlify dev, signup/login, sample PDF upload, verification completion, telemetry success, and database confirmation.
- Added `netlify/functions/admin-stats.mjs` for read-only aggregate reporting guarded by server-side admin role checks.
- Hosted UI now shows a read-only admin stats panel for authenticated users whose Identity roles include `admin` / `Administrator`.
- Added `tests/admin_stats.mjs` to cover admin authorization, summary aggregates, top-user rows, monthly rows, and recent event payload shape.
- Verified locally with raw Vite + `VITE_DEV_SKIP_IDENTITY=1`: uploading `CA01_STMT_BRIM_STATEMENT_EPRECAP0000073.PDF`, running verification, and showing the export button works without console errors.
- Verified locally with linked `netlify dev`: Identity settings return JSON at `/.netlify/identity/settings`, invalid login shows a visible error, and `usage-ingest` returns `401` when unauthenticated.
- Verified locally at repo level with `npm run check`, `npm run test:hosted`, `npm run web:build`, `npm run build`, and `npm run regression`.
- Verified locally for M3 with `netlify dev` plus `HOSTED_E2E_BASE_URL=http://localhost:8888 npm run test:hosted-e2e`: telemetry success was observed in-browser and confirmed in `usage_events`.
- Verified locally for M4 with `npm run test:admin`, `npm run test:hosted`, and `npm run web:build`.

## 2026-05-21 implementation notes

- Hosted workspace now shows a persistent English privacy banner at the top of `#hostedAppShell` after login. Copy covers local PDF parsing/export, no invoice upload, and metadata-only telemetry after verification.
- Banner markup is injected in `scripts/gen_web_index.mjs`; styling uses a new `.bs.info` variant in `src/index.template.html`; strings live in `src/core/core.js` as `hosted_privacy_*` and `hosted_login_*` keys.
- `usage-ingest` and `admin-stats` wrap `getDatabaseClient()` in try/catch and return `{ error: 'database_unavailable' }` when the database client cannot be initialized.
- Added missing-database handler tests in `tests/usage_ingest.mjs` and `tests/admin_stats.mjs`.
- Verified locally: hosted workspace banner after sign-in; `npm run check`, `npm run test:hosted`, `npm run test:admin`, and `npm run web:build`.

## Historical documents

- `docs/IDENTITY_LOGIN_HANDOFF.md` is now historical context for the old widget-click failure.
- `docs/HOSTED_ROLLOUT_PLAN.md` remains the broad rollout plan, but this file is the current handoff for auth/database implementation details.
