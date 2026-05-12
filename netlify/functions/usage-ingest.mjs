/**
 * M1 stub: enforces baseline body size only. M2 adds JWT verification + persistence.
 */
const MAX_BYTES = Math.min(
  Number(process.env.USAGE_INGEST_MAX_BYTES || 65536),
  512 * 1024,
);

export const handler = async (event) => {
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

  return json(200, { ok: true, stub: true, maxBytes: MAX_BYTES });
};

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
