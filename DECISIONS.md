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
