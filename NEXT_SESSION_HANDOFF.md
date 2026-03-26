# Next Session Handoff

## Current State
- Product name: `Lenovo EaaS Invoice Validator`
- Current version: `v3.12.36`
- Main deliverable:
  - `release/lenovo_invoice_validator.html`
- Release sync target:
  - OneDrive `.../Claude_invoice_extractor_tool/Releases/lenovo_invoice_validator_latest.html`
- Working directory:
  - `/Users/duruo/WorkStation/codex_invoice_extractor_tool`

## Project Purpose
- Single-file HTML tool for validating Lenovo EaaS invoice PDFs.
- Parses multi-sales-org statement PDFs.
- Compares `Billing Summary` vs `Detail Line Items`.
- Detects mismatches, missing mappings, and price-gap anomalies.
- Exports validation output to Excel.

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

## Parser Strategy
- Do not split every country into a dedicated parser by default.
- Preferred structure:
  - dedicated parser for language-heavy or structurally unique orgs
  - file-specific parser for special sales-org variants
  - family parser for similar EMEA-style layouts
  - generic fallback only where stable

### Dedicated / specialized parsers already active
- `JP`
- `US`
- `CH`
- `KR`
- `TH`
- `AU`
- `MY`
- `IN`
- File-specific:
  - `AT01`
  - `GB11`
  - `NL01`
  - `NL11`
- Dedicated handling also exists for:
  - `ES`
  - `GR`
    - `GR` is special: detail lines do not require tranche IDs; tranche summary comes from billing summary rows

## Key Behaviors Already Implemented
- Versioning:
  - semantic-ish rule in practice:
    - patch for parser fixes / UI fixes / validation fixes
    - minor for new capabilities
    - major for breaking shifts
  - release flow now expects version bumps before meaningful release changes
- Release:
  - `npm run release:sync` builds and syncs latest to OneDrive
  - old latest is archived to history with versioned naming
- Regression:
  - external PDF sample root:
    - `/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview`
- Validation/UI:
  - batch status banner
  - statement cards with clearer separation
  - statement-level collapse/expand
  - clicking error badge jumps to validation errors
  - validation list sorted `ERR -> WARN -> OK`
- Export:
  - Excel sheets aligned with UI hierarchy:
    - `Summary`
    - `Billing Summary`
    - `Tranche Summary`
    - `Detail Line Items`
  - export filename logic:
    - single statement: `Statement_Country_Invoice_Validator_Export_YYYYMMDD.xlsx`
    - multi statement / multi country uses batch naming
  - export numeric normalization removes floating point residue like `7.105e-15`
- Billing Summary:
  - `Payment Term` extraction supported for:
    - `CH AT NL AU TH US HK SG CA NZ PT PH GR ES IT`
- Detail checks:
  - price-gap validation implemented
  - India special handling uses taxable value logic where needed

## Important UI / Product Decisions
- Tool name must stay `Lenovo EaaS Invoice Validator`
- Coverage copy now says:
  - `Supports 31 Sales Orgs across 25 countries ...`
- `Validation` should surface problems first.
- `Detail Line Items` invoice filter should show `All` first.
- `Payment Term` is highlighted as non-price information.
- `Arithmetic` currently remains visible in UI and Excel.

## Known Special Cases
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

## Recommended Workflow For New Fixes
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
   - `npm run release:sync`
6. Commit after verification.

## Useful Commands
```bash
npm run check
npm run regression
npm run build
npm run release:sync
npm run version:bump
```

## Current Open Direction
- Continue only if new PDFs reveal:
  - genuinely new sales-org layouts
  - metadata gaps
  - export/readability issues
- Prefer not to refactor broadly unless there is a clear maintenance or correctness payoff.
