# Next Session Handoff

## Current Release
- Local release only, not synced to OneDrive
- File:
  - `release/lenovo_invoice_validator.html`
- Latest related commit:
  - `8ea3772` `Fix IN statement header extraction for hierarchy grouping`

## Working Rules
- Work only in:
  - `C:\Users\kate_\Documents\Codex_WorkStation\codex_invoice_extractor_tool`
- Do not modify Claude path
- Do not sync to OneDrive until user confirms stability
- Prefer small parser fixes + targeted regression + commit

## Stable / Recently Verified
- `AT01_STMT_BRIM_STATEMENT_EPREATP0000192_EN.PDF`
  - pass
  - mismatches `0`
- `NL01_STMT_BRIM_STATEMENT_EPRENLP0000517_EN.PDF`
  - pass
- `NL11_STMT_BRIM_STATEMENT_EPRENLP0000515_EN.PDF`
  - expected summary-missing warning
  - mismatches `0`
- `NL11_STMT_BRIM_STATEMENT_EPRENLP0000528_EN.PDF`
  - pass
- `TH01_STMT_BRIM_STATEMENT_EPRETHP0000463.PDF`
  - pass
- `MY01_STMT_BRIM_STATEMENT_EPREMYP0001022.PDF`
  - pass
- `IN01_STMT_BRIM_STATEMENT_EPREINP0000732.PDF`
  - pass
- `IN03_STMT_BRIM_STATEMENT_EPREINP0000737.PDF`
  - pass
- `IN03_STMT_BRIM_STATEMENT_EPREINP0000738.PDF`
  - pass
- `GB11_STMT_BRIM_STATEMENT_EPREGBP0000557_EN.PDF`
  - pass
- Smoke regression also includes:
  - JP
  - US
  - CH
  - KR

## Important Recent Fix
- IN hierarchy was showing `Unknown`
- Root cause:
  - `parseHeader()` did not understand IN header layout
  - missing fields: `stmtNum`, `custName`, `date`
- Fixed in:
  - `src/core/core.js`
- Now recognizes:
  - `Statement No.`
  - `Date of Statement`
  - `Name: ...`

## Parser Strategy
- Primary split by Sales Org
- Only add customer-specific handling when same Sales Org has a genuinely different layout
- Existing special handling already added for:
  - AT01
  - NL01
  - NL11
  - TH
  - MY
  - IN
  - GB11

## Key Files
- `src/core/core.js`
- `src/parsers/parsers.js`
- `src/ui/ui.js`
- `src/index.template.html`
- `scripts/build_release.mjs`
- `tests/regression.mjs`
- `tests/fixtures.json`
- `DESIGN_PROMPT.md`

## Useful Commands
- Rebuild release:
```powershell
node .\scripts\build_release.mjs
```

- Syntax checks:
```powershell
node --check src\core\core.js
node --check src\parsers\parsers.js
node --check src\ui\ui.js
```

- Full regression:
```powershell
node tests\regression.mjs
```

## Likely Next Targets
- `PH02`
- `AU04`
- EMEA orgs with possible billing-summary false positives:
  - `BE`
  - `DE`
  - `ES`
  - `FR`
  - `IE`
  - `IT`
  - `PT`

## Notes
- Current source still contains some non-functional comment mojibake in places, but active UI/runtime paths are now usable
- Avoid large UI refactors unless user explicitly asks
- When user reports an issue, prefer:
  - reproduce on one sample
  - fix parser/header logic narrowly
  - rebuild release
  - run targeted regression
  - commit immediately
