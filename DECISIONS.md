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
