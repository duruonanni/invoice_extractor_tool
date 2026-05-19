# Handoff: Historical Netlify Identity Widget Login Issue

Status: **Superseded as implementation direction**  
Last updated: **2026-05-19**

This document is historical context for the old `netlify-identity-widget` modal path. The active auth/database direction is now [`HOSTED_AUTH_DATABASE_HANDOFF.md`](./HOSTED_AUTH_DATABASE_HANDOFF.md): use Netlify Identity for authentication, Netlify Database for app/usage records, and replace the widget modal dependency with an explicit local-testable auth flow.

## Original symptom

On the deployed site `https://invoice-extractor-tool.netlify.app`, clicking **Sign in** appeared to do nothing. Microsoft Edge showed tracking-prevention warnings, but no obvious red Identity error was visible to the product owner.

## Findings

- Netlify Identity is enabled for the project and exposes this API endpoint:
  - `https://invoice-extractor-tool.netlify.app/.netlify/identity`
- Production appeared to run an older hosted bundle, so the latest local fail-open diagnostics were not visible on the live site.
- Raw Vite local dev (`http://127.0.0.1:5173`) is not a reliable way to verify real Identity login against the remote Netlify endpoint. Browser CORS/credential behavior can block `/.netlify/identity/settings` even when the endpoint itself responds.
- The old iframe/modal widget path made failures hard to diagnose and created silent-click UX.

## What was already fixed before superseding

- Removed duplicate `data-netlify-identity-button` usage.
- Added a dedicated hosted login screen and hidden validator shell until auth state exists.
- Added fail-open click behavior and visible timeout/error notices in `web/src/main.js`.
- Moved SPA fallback out of `netlify.toml` into `web/public/_redirects` so local Netlify/Vite module requests are not rewritten to `/index.html`.

## Historical local-debug notes

- `npm.cmd run web:dev` is useful for UI/parser work.
- With `VITE_DEV_SKIP_IDENTITY=1`, raw Vite can bypass Identity and open the validator workspace.
- Real hosted Identity verification should use `netlify dev` or a Netlify Deploy Preview, not bare `127.0.0.1:5173`.
- On Windows, `netlify dev` can be blocked by Netlify CLI/Deno setup issues; fix that environment before claiming local auth has passed.

## Current next step

Follow [`HOSTED_AUTH_DATABASE_HANDOFF.md`](./HOSTED_AUTH_DATABASE_HANDOFF.md). Do not spend more time trying to make the old `netlify-identity-widget.open()` iframe modal the primary hosted login UX.
