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

- migration to `/Users/duruo/Studio/02_PROJECTS/codex_invoice_extractor_tool` is complete
- current shipped version in source: `v3.12.38`
- project functionality has been verified after migration

## Daily Commands

```bash
npm run build
npm run release:sync
npm run regression
npm run version:bump
node --check src/core/core.js
node --check src/parsers/parsers.js
node --check src/ui/ui.js
```

## Standard Working Flow

1. Read `SESSION_HANDOFF.md` before continuing active work.
2. Reproduce against one concrete PDF.
3. Fix as narrowly as possible.
4. Run `npm run check`, `npm run regression`, and `npm run build`.
5. Run `npm run release:sync` only after the release is intentionally ready.
6. Update `SESSION_HANDOFF.md` if the current state materially changed.

## Build Output

`npm run build` generates:

- `release/lenovo_invoice_validator.html`: primary release artifact

`npm run release:sync` also:

- copies the latest release to OneDrive as `lenovo_invoice_validator_latest.html`
- archives the previous synced file under the sibling `history/` directory using its version number
- fails if the release HTML changed but `VERSION` was not bumped first

## Release Versioning

The shipped tool version lives in [`src/core/core.js`](/Users/duruo/Studio/02_PROJECTS/codex_invoice_extractor_tool/src/core/core.js) as:

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
3. Run `npm run release:sync`.

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

The repository does not currently include the approved PDF samples. By default, regression looks for them at:

`/Users/duruo/Studio/03_WORK/Attachments/invoice-regression/Approved_Preview`

It will still fall back to the legacy path if needed:

`/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview`

You can override that with `INVOICE_SAMPLE_DIR`.

See `tests/README.md` for the sample-data convention.

## Notes

- Keep parser changes small and regression-driven.
- Treat files under `archive/` as historical utilities unless they are deliberately promoted back into the active workflow.
- Git post-commit sync uses `.githooks/post-commit` on Unix-like systems and `.githooks/post-commit.cmd` on Windows.
- Project-specific design and workflow rules belong in `DECISIONS.md`, not in the handoff file unless they are part of the current state.
