# Session Handoff

## Current State
- Product name: `Lenovo EaaS Invoice Validator`
- Current version: `v3.12.38`
- Main deliverable:
  - `release/lenovo_invoice_validator.html`
- Release sync target:
  - OneDrive `.../Claude_invoice_extractor_tool/Releases/lenovo_invoice_validator_latest.html`
- Working directory:
  - `/Users/duruo/Studio/02_PROJECTS/codex_invoice_extractor_tool`

## Current Focus
- Workspace migration into `Studio` is complete.
- Project functionality has been validated after migration.
- Future work should stay incremental and regression-driven.
- Error-review UI now supports an error-focused detail mode:
  - root-level error invoice chips for statements with row-level issues
  - `Detail Line Items` defaults to `Errors only` when row-level issues exist
  - `Show all` restores full invoice chips and full detail rows

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
  - old latest is archived to history with versioned naming
- Regression:
  - external PDF sample root:
    - `/Users/duruo/Studio/03_WORK/Attachments/invoice-regression/Approved_Preview`
  - legacy fallback still supported:
    - `/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview`
- Local workspace migration:
  - active project path:
    - `/Users/duruo/Studio/02_PROJECTS/codex_invoice_extractor_tool`
  - regression / sample asset path:
    - `/Users/duruo/Studio/03_WORK/Attachments/invoice-regression`
  - old `WorkStation` / `PersonalStation` roots have been removed after migration validation

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
