import { createHash } from 'node:crypto';
import { getDatabase } from '@netlify/database';

const MAX_BYTES = Math.min(
  Number(process.env.USAGE_INGEST_MAX_BYTES || 65536),
  512 * 1024,
);

const INT_FIELDS = [
  'schemaVersion',
  'pdfCount',
  'totalPages',
  'countryCount',
  'statementCount',
  'invoiceCount',
  'lineItemCount',
  'failedChecks',
  'warningChecks',
];

const OUTCOMES = new Set(['success', 'warnings', 'issues', 'error']);

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  const raw = event.body || '';
  const enc = event.isBase64Encoded
    ? Buffer.from(raw, 'base64').byteLength
    : Buffer.byteLength(raw, 'utf8');
  if (enc > MAX_BYTES) {
    return json(413, { error: 'payload_too_large', maxBytes: MAX_BYTES });
  }

  const user = getIdentityUser(context);
  if (!user) {
    return json(401, { error: 'unauthorized' });
  }

  let payload;
  try {
    payload = JSON.parse(raw || '{}');
  } catch (_) {
    return json(400, { error: 'invalid_json' });
  }

  const validated = validateUsagePayload(payload);
  if (!validated.ok) {
    return json(400, { error: 'invalid_payload', detail: validated.error });
  }

  try {
    const db = getDatabase();
    await db.pool.query('BEGIN');
    await db.pool.query(
      `
        INSERT INTO user_profiles (user_sub, email_hash, first_seen_at, last_seen_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (user_sub)
        DO UPDATE SET last_seen_at = NOW()
      `,
      [user.sub, user.emailHash],
    );
    const result = await db.pool.query(
      `
        INSERT INTO usage_events (
          user_sub,
          client_event_id,
          session_id,
          occurred_at,
          schema_version,
          pdf_count,
          total_pages,
          country_count,
          statement_count,
          invoice_count,
          line_item_count,
          failed_checks,
          warning_checks,
          outcome
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (user_sub, client_event_id) DO NOTHING
      `,
      [
        user.sub,
        validated.value.clientEventId,
        validated.value.sessionId,
        validated.value.occurredAt,
        validated.value.schemaVersion,
        validated.value.pdfCount,
        validated.value.totalPages,
        validated.value.countryCount,
        validated.value.statementCount,
        validated.value.invoiceCount,
        validated.value.lineItemCount,
        validated.value.failedChecks,
        validated.value.warningChecks,
        validated.value.outcome,
      ],
    );
    await db.pool.query('COMMIT');
    return json(200, { ok: true, inserted: result.rowCount === 1 });
  } catch (err) {
    try {
      const db = getDatabase();
      await db.pool.query('ROLLBACK');
    } catch (_) {
      // Ignore rollback errors; the original DB failure is the useful one.
    }
    console.error('[usage-ingest] database write failed', err);
    return json(500, { error: 'database_write_failed' });
  }
};

function getIdentityUser(context) {
  const user = context?.clientContext?.user;
  const sub = user?.sub || user?.id || user?.user_id;
  if (!sub) return null;
  return {
    sub: String(sub),
    emailHash: user.email ? hashEmail(user.email) : null,
  };
}

function hashEmail(email) {
  return createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex');
}

function validateUsagePayload(payload) {
  const value = {
    clientEventId: payload.clientEventId,
    sessionId: payload.sessionId || null,
    occurredAt: payload.occurredAt,
    outcome: payload.outcome,
  };

  if (!isUuid(value.clientEventId)) return invalid('clientEventId must be a UUID');
  if (value.sessionId !== null && !isUuid(value.sessionId)) return invalid('sessionId must be a UUID');
  if (!isIsoDate(value.occurredAt)) return invalid('occurredAt must be an ISO timestamp');
  if (!OUTCOMES.has(value.outcome)) return invalid('outcome is invalid');

  for (const field of INT_FIELDS) {
    const number = Number(payload[field]);
    if (!Number.isInteger(number) || number < 0) return invalid(`${field} must be a non-negative integer`);
    value[field] = number;
  }

  if (value.schemaVersion !== 1) return invalid('schemaVersion is unsupported');
  if (value.pdfCount < 1) return invalid('pdfCount must be at least 1');
  if (value.totalPages < 1) return invalid('totalPages must be at least 1');

  return { ok: true, value };
}

function invalid(error) {
  return { ok: false, error };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function isIsoDate(value) {
  const time = Date.parse(value);
  return typeof value === 'string' && Number.isFinite(time);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
