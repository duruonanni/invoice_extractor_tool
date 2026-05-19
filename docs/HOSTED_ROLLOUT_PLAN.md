# Hosted Rollout Plan (Netlify)

Status: **M1 repo scaffolding complete; auth/database direction updated for M2**  
Last updated: 2026-05-19  

> **Current implementation handoff:** use [`HOSTED_AUTH_DATABASE_HANDOFF.md`](./HOSTED_AUTH_DATABASE_HANDOFF.md) for the active auth/database plan. In short: Netlify Identity remains the authentication provider, Netlify Database stores only app/usage records, and the old `netlify-identity-widget` iframe/modal path is superseded as the primary login UX.

This document captures agreed product intent and engineering execution notes for adding a **Netlify-hosted** web shell with **authentication and usage telemetry**, while **preserving** the existing **offline single-file** release pipeline.

---

## 1. Goals

- **Dual distribution**: keep shipping `npm run build` → `release/lenovo_invoice_validator.html` for fully offline/local use with no behavior regression for that artifact as the canonical business deliverable (see [`README.md`](../README.md)).
- **Public web access**: users can reach a Netlify-hosted site, **register**, and **use** the validator after login.
- **Offline processing preserved**: parsing, validation, and Excel generation remain **browser-local** — **no PDF file or parsed business payload** is uploaded to Netlify Functions or databases.
- **Usage statistics**: after local processing completes, the client MAY send **minimal metadata-only events** so operators can aggregate activity (counts, outcomes, pagination counts). **Administrators only** MAY view aggregated dashboards or reports backed by relational storage.
- **Repository & deployment**: source in a **GitHub public** repository; **Netlify** runs builds and hosts the site/functions. Secrets exist **only** in Netlify environment variables (never committed).

### 1.1 Public repository — conscious scope

The team **affirmatively keeps the repo public** (demo / distribution intent). Implications:

- All **source, commit history, comments, and fixtures metadata** in the tree are world-readable — avoid embedding **customer-specific PDFs**, licensing-restricted binaries, or confidential strings in tracked files.
- Treat **Netlify / third-party secrets** as strictly out-of-repo (`env` only).
- If future **policy** forbids public tooling source, fork to a private repo without changing the architectural split described here.

---

## 2. Non-goals (initial phases)

- Server-side PDF storage, OCR, or re-parsing invoice content in the cloud.
- Storing **filenames**, customer names, statement numbers, line items, or other **identifying or business fields** in telemetry tables (unless explicitly re-scoped later with legal review).
- A **custom parallel login system** (abandoned); **Netlify Identity** is the single auth provider.
- Replacing the OneDrive **commit-driven** release path for the offline HTML (it remains primary for field distribution).

---

## 3. Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Offline artifact (unchanged contract)                      │
│  release/lenovo_invoice_validator.html                      │
│  — single file, optional air-gapped use                      │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ shared core from `src/` (single SSOT)
                           │
┌─────────────────────────────────────────────────────────────┐
│  Hosted shell (Netlify)                                     │
│  — static SPA bundling the SAME core modules as offline     │
│  — Netlify Identity (sign up / log in / JWT)                │
│  — Netlify Functions (verify JWT + write/read telemetry)    │
│  — Netlify Database (managed Postgres + repo migrations)      │
└─────────────────────────────────────────────────────────────┘
```

**Core principle**: **`src/`** remains the behavioral source of truth for validation logic; the hosted build **must** consume that core through a **shared bundling path** so parser fixes ship **once** and apply to **both** offline and hosted skins (no long-lived parser forks).

---

## 4. Identity (Netlify Identity)

- **Registration**: **Open** — any visitor may self-register (`Site configuration → Identity → Registration`).
- **Email confirmation**: disabled for **all** users (`Identity → Emails → Confirmation template → allow signup **without verifying email**). This matches “注册即使用”.
- **Identifier model**: Identity is **email + password**. There is **no bespoke username/password API**. **Display names** in the UI MAY show a short alias, but the credential identifier remains an email-shaped value.
- **Roles**: ordinary users lack admin privileges by default.
- **Admin**: created/managed inside **Identity** (invite or manual provisioning in the Netlify UI), assigned **Administrator**/`admin` role per official RBAC docs. Administrators access stats-only UI/API surfaces.

### 4.1 Official integration surface (normative for implementers)

Implementations SHOULD follow **Netlify’s published patterns** rather than ad-hoc JWT parsing:

| Concern | Official reference |
| ------- | ------------------ |
| Registration / login UX, `signup` / `login` / logout | [Identity: Registration and login](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/registration-login/) |
| Embedding Identity in the app (package + widget flow) | [Get started with Identity in your code](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started) — use supported client packages (e.g. **`@netlify/identity`**, underlying **GoTrue**/`gotrue-js` as per current template guidance). |
| Verifying users in Functions / reading JWT claims & roles | [Use Identity in Functions](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions) |
| Gating `/admin` routes or static paths by role | [Role-based access control (redirect rules)](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/role-based-access-control) |

**Server-side rule**: privileged operations (ingest validation may be user-scoped; admin-stats **must** check **role** using the recommended Function helper pattern from the docs above — do not trust client-only checks.

**Hosted UI**: open the Identity modal only via **`netlifyIdentity.open()`** on explicit buttons. **Do not** put `data-netlify-identity-button` on the same visible control as a hand-written login link (the widget injects a second control and duplicates “Log in / Sign up”). **Unauthenticated** users should see a **login landing panel** (`#hostedLoginScreen`); the validator workspace (`#hostedAppShell`) stays **hidden** until `init`/`login` provides a user — see `scripts/gen_web_index.mjs` and `web/src/main.js`.

Operational checklist (Netlify dashboard):

1. Enable Identity.
2. Set registration to Open.
3. Disable mandatory email confirmation as above.
4. Create bootstrap admin Identity user(s) + assign Admin role before announcing the site.

---

## 4A. Anti-abuse design (open registration + skipped email verification)

Skipping email verification lowers account-creation cost — plan for **layered** controls (enable incrementally; document which are required before “soft launch”):

| Layer | Purpose |
| ----- | ------- |
| **Bot / spam friction** | Prefer a low-friction CAPTCHA on **signup** (e.g. Cloudflare Turnstile or hCaptcha); keep keys in env vars only. |
| **Registration rate limits** | Throttle new signups **per IP / per fingerprint heuristic** at the edge or in a Function (exact mechanism TBD — must not block legitimate corporate NAT without tuning). |
| **Login abuse** | Rely on Identity + platform limits; monitor failed auth spikes; reserve the option to tighten password policy later. |
| **Telemetry ingest abuse** | Per-`sub` and per-IP **rate limits**, max body size, sane timeouts, optional **daily event cap** per user (see §6–§7). |
| **Operational kill switch** | Ability to flip Identity registration to **Invite only** during an incident (`Registration preferences` — see [Registration and login](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/registration-login/)). |

**Milestone placement**: wire at least **baseline** ingest rate limits and payload caps in **M2**; add CAPTCHA + registration throttles before any public announcement (can land in **late M1 / M2**).

---

## 5. Database (Netlify Database)

According to [`Netlify Database` documentation](https://docs.netlify.com/build/data-and-storage/netlify-database/):

- Managed **Postgres** with **automatic migrations** from the repository ([migrations docs](https://docs.netlify.com/build/data-and-storage/netlify-database/migrations/)).
- **Database branching**: production deploy targets production database; Deploy Previews isolate schema/data — observe official branching semantics before destructive tests.
- Plan/billing prerequisites may apply (**credit-based** plans per docs as of GA). If Database is unavailable for the target Netlify workspace, contingency is **external Postgres** (Neon / Supabase / etc.) reachable only via environment variables — **schemas and SQL remain portable**.

Recommended local workflow (implement during M2+):

```bash
# prerequisites: Node 20.12.2+, Netlify CLI v26+, linked site (`netlify link`)
netlify database init           # scaffolding + @netlify/database (interactive)
# or non-interactive: netlify database init --yes

netlify database migrations new --description "<purpose>" --scheme sequential
netlify database migrations apply
netlify database connect --query "SELECT 1;"
netlify database status --json

# unified local runner (site + Functions)
netlify dev
```

---

## 6. Telemetry model (metadata only — no PDF upload)

Telemetry records **facts derived client-side**, never raw PDF bytes.

### 6.1 Privacy boundary (what may and may not be persisted)

| Stored in telemetry tables | Not stored (initial phases) |
| -------------------------- | ---------------------------- |
| Identity **`sub`** as opaque user key | PDF bytes, parsed line items, totals, customer identifiers |
| Aggregate counts and outcome enums | Original **filenames**, storage paths, invoice / statement numbers |
| `session_id` / `client_event_id` for deduplication | Monetary amounts, free-text snippets from PDFs |
| `occurred_at` (UTC) | Raw user-agent strings unless later justified + documented |

**Identity email**: avoid duplicating email into telemetry tables unless strictly needed for admin UX; prefer **joining** against Identity admin APIs for display, or hash at rest only if product requires (decision at implementation — default **no copy**).

Align the **user-visible copy** (login / tool page) with §9: local parsing; server only sees access control + **aggregated usage metadata**.

### 6.2 Schema fields (including idempotency)

Each committed ingest SHOULD be uniquely addressable for **at-least-once** client networks:

| Field | Purpose |
| ----- | ------- |
| `client_event_id` | UUID generated **once per logical submit** client-side; PRIMARY KEY or UNIQUE with `user_sub` |
| `user_sub` | Identity JWT `sub` (**required**) |
| `session_id` | Correlates batch UI run (optional secondary index) |
| `occurred_at` | ISO UTC from client (server MAY set `received_at` separately) |
| `pdf_count`, `total_pages_across_pdfs`, per-PDF rows | As in prior plan |
| `schema_version` | Integer for forward evolution |

**Dedup rule**: `INSERT … ON CONFLICT DO NOTHING` (or equivalent) on `(user_sub, client_event_id)` — retries must not double-count.

### 6.3 Retention & deletion

- Define a **default retention window** for raw telemetry rows (e.g. **90d / 180d / 365d** — pick at implementation and document in README admin section).
- Provide a **scheduled prune** (cron Function, `pg_cron`, or external scheduler calling a secured maintenance Function) — specifics depend on Netlify runtime constraints; document the chosen approach.
- Admin **export** MAY be manual SQL dump before prune until automated exports exist.

### 6.4 Rate limits (telemetry-specific)

Server-side **per `sub`** and **per IP** limits on `usage-ingest` (sliding window); return `429` with `Retry-After` when exceeded. Config via env vars (`INGEST_MAX_REQ_PER_MIN`, etc.) — no hard-coded limits in source for production values.

### 6.5 Monthly rollups expected by admins

Administrations need SQL or API-derived aggregates including:

- per **user identity** (`sub` mapped to opaque row key)
- calendar **month slices**
- counts of sessions / PDFs / total pages processed
- success vs “issues flagged” vs hard error counts consistent with validator outcome taxonomy (defined at implementation against existing UI states)

Normalization choice: maintain **facts table** (`usage_events`) with dedup keys in §6.2; derive monthly aggregates in SQL or via scheduled rollups during **M4**.

---

## 7. API sketch (Functions)

Naming is illustrative; align with `_redirects`/`.netlify/functions` conventions at implementation.

### 7.1 `POST /.netlify/functions/usage-ingest`

- **Auth**: `Authorization: Bearer <Identity JWT>`
- Body: `{ clientEventId, sessionId, totals: {...}, pdfs:[{pages, outcome}] }` (subset only) — **`clientEventId` required** for idempotency (see §6.2).
- **Validation**: JWT `sub` matches the ingested user scope; reject mismatched identity; discard oversized payloads (**max JSON bytes** env-configured).
- **Idempotency**: second POST with same `(user_sub, clientEventId)` MUST be a no-op success (HTTP `200`/`204`) without double counting.

### 7.2 `GET /.netlify/functions/admin-stats`

- **Auth**: same JWT bearer; MUST assert **Administrator**/`admin` role via [Functions Identity helper pattern](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions).
- Accepts timeframe query params (`from`,`to`).
- Returns aggregated JSON suited for a minimalist admin dashboard.

---

## 8. Milestones

**Shared core bundling is front-loaded**: the hosted SPA must import the same `src/` core **before** ingest work is considered feature-complete — do **not** defer bundling proof to the final milestone.

| Milestone | Outcome |
| --------- | ------- |
| **M1** | Netlify project linked; **hosted dev site bundles shared `src/` core** (parity smoke: load app + run a no-op or fixture-light path); Identity enabled; **`netlify dev` + signup/login** smoke in local + production; registration hardening **started** (baseline payload limits on any Function stub). |
| **M2** | Netlify Database via CLI; migrations applied locally & on deploy preview; **`usage-ingest` Function** persists rows with **unique `(user_sub, client_event_id)`**; **rate limits + max body** enforced; anti-abuse layers from §4A progressing (CAPTCHA / signup throttle as available). |
| **M3** | Production processing path in hosted UI emits **real** telemetry with **retry-safe** client UUIDs; operational monitoring of ingest error rates. |
| **M4** | `admin-stats` + read-only admin UI; automated checks that **non-admin JWTs** are rejected; monthly aggregates validated against sample data. |
| **M5** | **Operator docs**: extend [`README.md`](../README.md) with Netlify setup, env var matrix, retention policy pointer, and **production cut-over checklist** (domain, Identity URLs, admin bootstrap, backup).

---

## 9. Security & confidentiality

| Topic | Requirement |
| ----- | ----------- |
| Secret storage | `.env`/Netlify dashboard only; NEVER commit credential values in public repo. |
| Telemetry | Minimal metadata schema; audited before widening fields; **idempotency + rate limits** mandatory (§6–§7). |
| Retention | Written policy + automated or scheduled prune (§6.3). |
| Transport | HTTPS (Netlify default). |
| Admin surface | Separate route + **server-side** RBAC enforced in Functions per official Identity docs — **never** expose raw SQL dashboards publicly. |

**User-facing assurance (recommended copy near login/tool):**

- PDF parsing and Excel generation happen entirely in **your browser**; **invoice content is not uploaded** to BRIM-hosted infrastructure.
- Account records and telemetry exist **only to operate access controls and summarized usage**.

---

## 10. Relation to [`README.md`](../README.md) and [`PRODUCT_REQUIREMENTS.md`](../PRODUCT_REQUIREMENTS.md)

### `README.md`

- Today documents **offline-first** workflows (`npm run build`, release HTML, regression gates). Hosting operator instructions land in **M5** (env var matrix, CLI pointers, distinction between **`release/` offline file** vs **`web/` hosted site**).
- **Shared core** is **proven from M1 onward** (see §8) — README update in M5 documents the **release** process, not first-time bundling.
- VERSION sync policy for HTML footer remains anchored in **`src/core/core.js`** SSOT (`README → Release Versioning`); hosted UI SHOULD display the **same semantic version** when feasible.

### `PRODUCT_REQUIREMENTS.md`

- **Still authoritative** for parser accuracy, UX review workflow, regression expectations on the validator itself.
- The hosted rollout **does not change** correctness requirements except adding **privacy / auth / telemetry overlays** summarized here — any conflict should be debated via `PRODUCT_REQUIREMENTS` amendment with explicit versioning note.

---

## 11. Open implementation choices (defer to coding phase)

Exact frontend framework/build tool for `web/` (plain Vite SPA vs incremental adoption). Choice must **not fork** parsers.

Granularity between **per-session** facts vs auxiliary **per-pdf rows** balancing query simplicity vs storage rows.

Specific CAPTCHA vendor, exact IP throttling algorithm, and backup export automation (beyond §6.3 baseline).

---

## 12. Next human / agent reads

Implementers SHOULD read in order:

1. This document (scope & constraints)
2. [`DECISIONS.md`](../DECISIONS.md) (long-lived rulings duplicate summary)
3. [`SESSION_HANDOFF.md`](../SESSION_HANDOFF.md) (immediate next actionable chunk)
4. Existing build scripts under `scripts/` plus current template `src/index.template.html`.

---

_End of Hosted Rollout Plan_
