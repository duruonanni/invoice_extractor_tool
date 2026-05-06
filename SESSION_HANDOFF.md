# Session Handoff

## Current State
- Product name: `Lenovo EaaS Invoice Validator`
- Current version: `v3.12.42`
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
- Continue only if new PDFs reveal:
  - genuinely new sales-org layouts
  - metadata gaps
  - export/readability issues
- Prefer not to refactor broadly unless there is a clear maintenance or correctness payoff.

## Read Next Time
- Start with `README.md` for project entry.
- Use `DECISIONS.md` for long-lived design and workflow rules.
- Use this file for current state and next-step continuity.
