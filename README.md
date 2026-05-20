# Lenovo EaaS Invoice Validator

Single-file HTML tool for validating Lenovo EaaS invoice PDFs locally in the browser.

## Project Role

This repository is the active project workspace for the shipped validator.

Use the project documents like this:

- `README.md`
  - project entry, layout, commands, and operating notes
- `PRODUCT_REQUIREMENTS.md`
  - product scope, parsing requirements, regression expectations, and release requirements
- `DECISIONS.md`
  - long-lived project decisions and rationale
- `SESSION_HANDOFF.md`
  - current state, current coverage, and next-session continuity

## Project Layout

- `src/`: source of truth for the shipped tool
- `src/core/`: PDF loading, header parsing, country detection, shared utilities
- `src/parsers/`: invoice parsing logic by region/layout
- `src/ui/`: file input, rendering, export, interactions
- `scripts/`: active day-to-day project scripts
- `tests/`: regression runner, fixture definitions, test notes
- `release/`: generated deliverable
- `docs/`: user manual and manual assets
- `archive/`: legacy or one-off scripts kept for reference, not part of the main workflow

## Current Status

- migration into `02_PROJECTS/codex_invoice_extractor_tool` within Studio is complete
- current shipped version in source: `v3.12.43`
- project functionality has been verified after migration

## Daily Commands

```bash
npm run build
npm run release:sync
npm run regression
npm run test:hosted
npm run test:hosted-e2e
npm run version:bump
node --check src/core/core.js
node --check src/parsers/parsers.js
node --check src/ui/ui.js
```

## Standard Working Flow

1. Read `SESSION_HANDOFF.md` before continuing active work.
2. Reproduce against one concrete PDF.
3. Fix as narrowly as possible.
4. Run `npm run check`, `npm run regression`, `npm run test:hosted`, `npm run test:hosted-e2e`, and `npm run build`.
5. If the release is intentionally ready, commit the change set.
6. Let the git post-commit hook run `release:sync` by default.
7. Update `SESSION_HANDOFF.md` if the current state materially changed.

## Build Output

`npm run build` generates:

- `release/lenovo_invoice_validator.html`: primary release artifact

`npm run release:sync` also:

- copies the latest release to OneDrive as `lenovo_invoice_validator_latest.html`
- archives the previous synced file under the sibling `history/` directory using its version number
- fails if the release HTML changed but `VERSION` was not bumped first

## Release Versioning

The shipped tool version lives in [`src/core/core.js`](src/core/core.js) as:

`const VERSION='major.minor.patch'`

Use the version numbers like this:

- `patch` for parser fixes, validation fixes, regression-only improvements, small UI polish, and release corrections
- `minor` for user-visible new capabilities, meaningful workflow changes, or added parsing coverage that expands the tool
- `major` for breaking changes, incompatible output changes, or a new generation of the tool

Examples:

- `3.12.4 -> 3.12.5`: JP parser fix, footer filtering fix, validation fix
- `3.12.4 -> 3.13.0`: new export/reporting feature, new parser family, significant UI capability
- `3.12.4 -> 4.0.0`: incompatible release or major product redesign

Before a real release:

1. Bump the release version.
2. Run regression and any targeted validation for the changed invoices.
3. Commit the intended release by default so the post-commit hook runs `release:sync`.

Run `npm run release:sync` manually only when an explicit pre-commit release step is required.

You can bump the patch version automatically with:

```bash
npm run version:bump
```

Or set an exact version:

```bash
node scripts/bump_release_version.mjs 3.13.0
```

## Testing

Regression fixtures are defined in `tests/fixtures.json`.

Hosted telemetry checks:

- `npm run test:hosted`
  - validates the `usage-ingest` Function logic in-process
- `npm run test:hosted-e2e`
  - validates hosted login + PDF upload + verification + telemetry write end-to-end
  - on Windows, the most reliable flow is:
    1. start `netlify dev` in one terminal
    2. run `HOSTED_E2E_BASE_URL=http://localhost:8888` plus `HOSTED_E2E_DB_URL=<postgres://localhost:PORT/postgres>` when you want the E2E to reuse that running local stack
  - without env overrides, the script will try to start its own local `netlify dev`

The repository does not currently include the approved PDF samples. By default, regression looks for them under Studio:

`03_WORK/Attachments/invoice-regression/Approved_Preview`

(and still checks legacy Mac-only paths and `INVOICE_SAMPLE_DIR`; see `tests/regression.mjs`).

See `tests/README.md` for the sample-data convention.

## Notes

- Keep parser changes small and regression-driven.
- Treat files under `archive/` as historical utilities unless they are deliberately promoted back into the active workflow.
- Git post-commit sync uses `.githooks/post-commit` on Unix-like systems and `.githooks/post-commit.cmd` on Windows.
- Default OneDrive publishing should follow the commit path; do not manually pre-run `release:sync` unless explicitly requested.
- Project-specific design and workflow rules belong in `DECISIONS.md`, not in the handoff file unless they are part of the current state.
