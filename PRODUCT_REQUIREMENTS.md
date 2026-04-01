# Lenovo EaaS Invoice Validator Product Requirements

## Product Goal
Build a single-file, offline-capable HTML tool that validates Lenovo EaaS invoice statement PDFs across multiple Sales Orgs.

The tool should:
- accept one or multiple PDF files via click upload or drag-and-drop
- parse billing summary and detail line items from invoice statement PDFs
- compare summary totals against detail totals
- highlight mismatches, missing sections, and suspicious parsing results
- provide a user-friendly review UI for business users
- export validation results to Excel
- remain usable as a standalone offline HTML release

## Target Users
Primary users are business and operations users who need to verify invoice PDFs quickly without technical setup.

The UI should feel:
- trustworthy
- compact but readable
- business-friendly
- low-friction for batch review

---

## Product Principles

- offline first
- accuracy before coverage expansion
- regression-driven parser changes
- preserve working business UX
- keep source and release files UTF-8 clean

## Functional Requirements

### File Intake
- support drag-and-drop and click-to-select
- support multiple PDFs in one run
- show file chips/list before processing
- identify country / Sales Org from filename when possible

### Parsing
Extract:
- statement number
- statement date
- customer number
- customer name if available
- billing summary per invoice
- detail line items per invoice
- tranche ID
- product ID
- product description
- quantity
- unit price
- charges
- tax
- total
- source page / file reference when useful

### Validation
Flag:
- summary vs detail total mismatch
- detail pages missing
- summary missing
- detail-only invoices
- unreadable / unsupported PDF content
- suspicious duplicate detail ingestion
- arithmetic inconsistency inside invoice rows
- non-standard / unmapped product rows

### Result Presentation
Show:
- country / region summary cards
- hierarchy navigation
- invoice comparison table
- billing summary section
- detail line items section
- validation section
- issue counts and status coloring

### Export
Excel export should include:
- comparison result
- billing summary data
- detail line items
- validation findings
- source file references where available

## Architecture Requirements

### Layering
Recommended code organization:
- `core`: PDF reading, normalization, shared helpers, header parsing, utility functions
- `parsers`: Sales Org specific parsing logic
- `ui`: rendering, interactions, filtering, export triggers
- `build`: combine sources into final single-file release HTML

### Parser Routing
Use a dispatch model:
- generic parser for stable common formats
- org-specific parser for known divergent layouts
- customer-specific refinement when one Sales Org contains multiple templates

### Safe Parsing Strategy
Prefer:
- block-based parsing for complex layouts
- explicit section boundaries
- controlled look-ahead / look-back
- dedupe guards for repeated lines
- stop conditions to avoid cross-item contamination

Avoid:
- over-broad regex that merges neighboring products
- global heuristics that affect all orgs without regression checks
- silent fallback that hides parsing failure

## AT01-Specific Requirement
AT01 is currently treated as a baseline stabilization sample.

For AT01:
- preserve original tranche text from PDF where valid
- prioritize correct product description reconstruction
- prevent duplicate detail ingestion
- ensure all known-good AT01 invoices end in zero mismatches
- treat AT01 as a release gate sample

Expected AT01 quality bar:
- invoices parsed correctly
- line items parsed correctly
- `failedChecks = 0`
- `mismatches = 0`
- visible UI remains usable

---

## Validation And Regression Requirements

### Must-Have Baseline Samples
Use known-good baseline samples such as:
- JP
- US
- CH
- KR
- AT01

### Regression Gate
A change should not be considered complete unless:
- target sample improves or remains correct
- baseline samples still pass expected thresholds
- no visible UI regression is introduced
- release HTML still builds and opens locally

### Bugfix Rule
After each bug fix:
- run targeted self-checks for that bug
- rebuild release
- confirm no parser syntax break
- confirm no obvious UI regression

## UI Requirements
The UI should remain close to the prior working business layout, not become a developer-only debug screen.

Desired characteristics:
- clean corporate style
- clear section hierarchy
- expandable review flow
- invoice-focused detail inspection
- error states easy to spot
- compact enough for large-batch review

Do not sacrifice familiar workflow just to simplify rendering code.

## Release Requirements
The final user-facing artifact remains:
- `lenovo_invoice_validator.html`

Release rules:
- single-file HTML
- offline usable
- no sync to external release folders until validated
- do not publish unstable intermediate versions

## Success Definition
The tool is successful when:
- business users can open one HTML file locally
- upload one or more Lenovo invoice PDFs
- review summary/detail comparison confidently
- see clear issues when PDFs are incomplete or inconsistent
- export a useful Excel result
- trust that known-good PDFs pass cleanly
