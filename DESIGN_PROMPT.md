# Lenovo EaaS Invoice Validator - Design Prompt

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

---

## Core Principles

### 1. Offline First
The final deliverable must be a single `lenovo_invoice_validator.html` file that can run locally in a browser without a server.

### 2. Accuracy Before Expansion
Do not add broader support until the current Sales Org / template is validated.
For every parser change:
- first confirm the target PDF behavior
- then validate that existing known-good samples still pass

### 3. Sales Org Aware Parsing
Different Sales Orgs may use different PDF layouts.
The parser strategy should be:
- detect Sales Org from filename and/or document content
- route to a specific parser when layout differences are known
- allow finer specialization by Sold-To / customer template when needed

### 4. Stable Regression-Driven Development
A parser change is not complete unless it is verified against sample PDFs.
Regression checks should cover:
- invoice count
- line item count
- mismatch count
- failed validation count
- key extracted fields such as invoice number, tranche ID, product ID, and product description

### 5. Preserve Working UX
UI changes must not reduce existing usability.
Important interaction patterns include:
- invoice-level detail expansion/filtering
- hierarchy-based browsing
- country / customer grouping
- visible validation summary
- easy Excel export

### 6. No Encoding Corruption
All source files and final HTML must remain UTF-8 clean.
Avoid introducing mojibake, broken punctuation, or damaged JS strings.
If encoding risk appears, stop and fix the source before continuing feature work.

---

## Target Users
Primary users are business and operations users who need to verify invoice PDFs quickly without technical setup.

The UI should feel:
- trustworthy
- compact but readable
- business-friendly
- low-friction for batch review

---

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

---

## Parser Architecture

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

---

## AT01-Specific Design Guidance
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

## Regression Strategy

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

---

## UI Design Direction
The UI should remain close to the prior working business layout, not become a developer-only debug screen.

Desired characteristics:
- clean corporate style
- clear section hierarchy
- expandable review flow
- invoice-focused detail inspection
- error states easy to spot
- compact enough for large-batch review

Do not sacrifice familiar workflow just to simplify rendering code.

---

## Release Policy
The final user-facing artifact remains:
- `lenovo_invoice_validator.html`

Release rules:
- single-file HTML
- offline usable
- no sync to external release folders until validated
- do not publish unstable intermediate versions

---

## Operational Rules
- work only inside the Codex project path unless explicitly approved otherwise
- keep non-destructive workflow
- stop when changes start making behavior worse
- prefer small safe commits over large risky rewrites
- if source baseline is corrupted, stabilize structure before expanding support

---

## Success Definition
The tool is successful when:
- business users can open one HTML file locally
- upload one or more Lenovo invoice PDFs
- review summary/detail comparison confidently
- see clear issues when PDFs are incomplete or inconsistent
- export a useful Excel result
- trust that known-good PDFs pass cleanly
