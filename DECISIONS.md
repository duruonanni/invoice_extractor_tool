# Decisions

Record long-lived project decisions here so they do not keep expanding the session handoff.

## 2026-04-01 - Keep The Deliverable As A Single Offline HTML File

- Status: Active
- Context:
  - The tool is used by business users who need a low-friction local workflow.
- Decision:
  - Keep the final deliverable as one `lenovo_invoice_validator.html` file that runs locally in a browser without a server.
- Consequence:
  - Build and release steps must preserve the single-file offline model.

## 2026-04-01 - Prefer Targeted Parser Specialization Over Full Per-Country Split

- Status: Active
- Context:
  - Sales org layouts differ, but not every difference justifies a dedicated parser.
- Decision:
  - Use dedicated parsers for structurally unique or language-heavy layouts, file-specific handling for exceptional variants, parser families where layouts are similar, and a generic fallback only where stable.
- Consequence:
  - Avoid broad refactors that split every country by default.
  - Current specialized handling includes `JP`, `US`, `CH`, `KR`, `TH`, `AU`, `MY`, `IN`, plus file-specific handling for `AT01`, `GB11`, `NL01`, and `NL11`.
  - Dedicated handling also exists for `ES` and `GR`.

## 2026-04-01 - Regression Is A Release Gate

- Status: Active
- Context:
  - Parser changes can easily fix one layout while breaking others.
- Decision:
  - Treat regression validation as mandatory before meaningful release changes.
- Consequence:
  - Changes should be reproduced on a concrete PDF, validated against known-good samples, and verified with `npm run check`, `npm run regression`, and `npm run build` before release sync.

## 2026-04-01 - Preserve The Existing Business Review UX

- Status: Active
- Context:
  - The current tool is meant for business and operations users, not a developer-only debug workflow.
- Decision:
  - Keep the UI compact, hierarchy-based, and review-oriented.
  - Validation should surface issues first, `Detail Line Items` should show `All` first in the invoice filter, `Payment Term` remains visible as non-price information, and `Arithmetic` remains visible in UI and Excel.
- Consequence:
  - UI simplification should not remove familiar review behavior without a clear product reason.

## 2026-04-01 - Treat Known Fixture Exceptions As Approved Baselines

- Status: Active
- Context:
  - Some approved PDFs intentionally retain non-zero failed checks in fixtures.
- Decision:
  - Continue to treat these files as accepted baselines rather than accidental regressions:
  - `JP01_STMT_BRIM_STATEMENT_EPREJPP0000568_JA.PDF`
  - `NL11_STMT_BRIM_STATEMENT_EPRENLP0000515_EN.PDF`
  - `PT01_STMT_BRIM_STATEMENT_EPREPTP0000122_EN.PDF`
  - `AU04_STMT_BRIM_STATEMENT_EPREAUP0000931.PDF`
- Consequence:
  - Regression interpretation should account for these known exceptions.

## 2026-04-28 - Canonical OneDrive Publish Directory For Latest HTML

- Status: Active
- Context:
  - `npm run release:sync` copies the built single-file release to a Lenovo OneDrive tree for sharing.
  - The default target must stay stable so hooks and docs refer to one folder.
  - Non-macOS machines need an explicit sink path because OneDrive layout differs per OS.
- Decision:
  - Publish the latest build to `All_In_AI_Projects/Claude_invoice_extractor_tool/Releases/lenovo_invoice_validator_latest.html` (history under sibling `history/`).
  - Implement resolution in [`scripts/release_sync.mjs`](./scripts/release_sync.mjs): **macOS** defaults under `~/Library/CloudStorage/…/Claude_invoice_extractor_tool/Releases`; **Windows** defaults to workstation path `C:\OD\OneDrive - Lenovo\…\Claude_invoice_extractor_tool\Releases` unless **`INVOICE_RELEASE_LATEST`** or **`INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR`** is set.
- Consequence:
  - If the sink moves on any machine, set env vars or extend the resolver; cross-repo notes live in [`WINDOWS_MIGRATION.md`](../../WINDOWS_MIGRATION.md).

## 2026-05-04 - Regression Sample Root Is Studio-Portable

- Status: Active
- Context:
  - `tests/regression.mjs` prioritized machine-specific absolute directories before bundled fixtures.
- Decision:
  - Probe `<Studio>/03_WORK/Attachments/invoice-regression/Approved_Preview` derived from project layout immediately after `INVOICE_SAMPLE_DIR`.
- Consequence:
  - Regression runs on Windows once the Studio tree contains samples under `03_WORK/` without editing the runner.

## 2026-04-09 - Default OneDrive Release Should Follow The Commit Path

- Status: Active
- Context:
  - The project already has a post-commit hook that runs `scripts/release_sync.mjs`.
  - Running `release:sync` manually before commit duplicates work and creates unnecessary workflow branching.
- Decision:
  - Unless the user explicitly asks for a pre-commit release action, treat the normal commit flow as the default OneDrive release path.
  - In normal operation: verify, commit, let the post-commit hook build and sync the release.
- Consequence:
  - Do not manually run `npm run release:sync` before commit by default.
  - Manual pre-commit release remains allowed only when the user explicitly requests it.

## 2026-04-13 - Multi-Country Review Defaults To Issue-Focused Country Visibility

- Status: Active
- Context:
  - Large multi-country batches can overwhelm reviewers when many countries have no issues.
  - Users need a faster way to focus on countries that require action while keeping a one-click way to inspect all countries.
- Decision:
  - When multiple countries are present, default the country-level UI scope to countries with `failed checks` only.
  - Provide a dedicated toggle button to switch between issue-focused view and all-countries view.
  - Keep this filter in the country summary cards, country tabs, and hierarchy table, and visually highlight the country filter strip.
- Consequence:
  - Reviewers land in a focused default view without losing complete coverage visibility.
  - Single-country batches or all-clear batches continue to show full content without forced filtering.

## 2026-04-13 - Align Validator UI With Lenovo-Inspired Interaction Baseline

- Status: Active
- Context:
  - The validator is a business review tool and now has a Lenovo-style UI interaction baseline in Studio resources.
  - Existing UI behavior was functional but had gaps in keyboard accessibility, focus visibility, and token-level visual consistency.
- Decision:
  - Keep the current information architecture and review workflow, but align visual and interaction primitives incrementally.
  - Adopt a first-pass update covering:
    - Lenovo-aligned color/font token mapping in the HTML template
    - keyboard and ARIA support for upload entry and country cards
    - visible focus rings on primary interactive controls
    - i18n-safe text keys for newly surfaced status labels
- Consequence:
  - UX remains familiar for current users while moving toward a reusable Lenovo-consistent interaction model.
  - Future UI changes should continue this incremental alignment instead of broad visual rewrites.

## 2026-04-16 - Guard Excel Export Cell Length To Prevent Hard Failure

- Status: Active
- Context:
  - Some parsed invoice fields can contain unusually long text and exceed Excel's single-cell text limit (`32767` characters).
  - When that happens, the browser export flow throws and the entire workbook download fails.
- Decision:
  - Apply a centralized export-cell normalization step before writing sheet data.
  - Keep numeric/boolean values unchanged.
  - Truncate over-limit text values to Excel-safe length and append a visible truncation suffix.
- Consequence:
  - Export remains available even when a source PDF includes malformed or overlong extracted text.
  - Very long text fields may be clipped in Excel output, but no longer block user download.

## 2026-05-06 - Ignore And Do Not Commit macOS `._*` AppleDouble Sidecars

- Status: Active
- Context:
  - Copying the repo from macOS or some sync tools drops AppleDouble resource-fork files named `._*` next to real files.
  - They are binary metadata, not source; they clutter `git status` and confuse editors on Windows.
- Decision:
  - Delete `._*` sidecars from the working tree when they appear; keep `._*` in [`.gitignore`](./.gitignore) so Git ignores them.
- Consequence:
  - `git status` stays focused on real changes; open the normal filenames (for example `README.md`), not `._README.md`.

## 2026-05-12 - Hosted Netlify Variant Adds Identity + Telemetry Without Replacing Offline HTML

- Status: Active (M1 engineering scaffolding in repo; DB + ingest hardening in later milestones)
- Context:
  - The shipped single-file release remains valuable for disconnected use and OneDrive distribution.
  - Operators also want authenticated web entry, open self-registration without email friction, administrator-only aggregates, and a SQL-backed store aligned with Netlify’s managed stack.
- Decision:
  - Introduce an additional **hosted** deployment path (**GitHub public** + **Netlify**) layered around the existing core sources.
  - **Parsing, validation, and Excel generation stay client-side**: no PDF payloads or extracted business payloads are persisted in cloud services.
  - **Netlify Identity** is the sole auth provider (open signup; email confirmation skipped for immediate use).
  - **Administrators** are Identity users provisioned via the dashboard with **`admin`/Administrator RBAC**, not separate bespoke username/password backends.
  - Telemetry (if emitted) captures **minimal metadata** aligned with [`docs/HOSTED_ROLLOUT_PLAN.md`](docs/HOSTED_ROLLOUT_PLAN.md).
- Consequence:
  - Bug fixes touching parsing/UI core should continue to converge in `src/` and flow through **`npm run build`** for the offline artifact **and** the hosted bundle (see **2026-05-13**), with **no parser forks**.
  - Hosted functionality must obey env-only secrets; never rely on unpublished credentials embedded in artifacts.

## 2026-05-13 - Hosted Web Shell Uses Vite + Template-Generated Index

- Status: Active
- Context:
  - The offline ship path must stay a single concatenated HTML file; the hosted site needs a modern bundle while proving **the same** `src/core`, `src/parsers`, and `src/ui` modules load correctly.
- Decision:
  - Use **Vite** with `root` set to `web/`, and generate `web/index.html` from [`src/index.template.html`](./src/index.template.html) via [`scripts/gen_web_index.mjs`](./scripts/gen_web_index.mjs) so layout/CSS stay aligned with the offline template.
  - Hosted-only concerns (Netlify Identity widget, login gate copy) live under `web/src/` and **do not** alter the offline build script’s concatenation contract.
  - Netlify publishes `dist-web/`; `netlify/functions/usage-ingest.mjs` ships as an **M1 stub** (payload cap only); JWT + persistence land in **M2** per rollout plan.
- Consequence:
- Always run `npm run web:gen-index` (or `web:dev` / `web:build`, which chain it) after editing the HTML template.
  - Generated markup must expose **one** Identity entry point (`netlifyIdentity.open()` only); **`data-netlify-identity-button`** MUST NOT sit on the same visible control as an extra hand-written link — it duplicates the widget UI.
  - Unauthenticated visitors see **`#hostedLoginScreen` only**; **`#hostedAppShell`** (drop zone + results) remains hidden until Identity reports a user.
- `netlify dev` remains the supported way to exercise Identity against a linked site; raw `vite` alone is useful only for UI wiring smoke tests without auth.
  - **`VITE_DEV_SKIP_IDENTITY=1`** in untracked `web/.env.local` may be used **only with `npm run web:dev`** to bypass Identity while iterating on shared `src/` behavior; production bundles from `vite build` must not rely on `import.meta.env.DEV` skips (already false).
