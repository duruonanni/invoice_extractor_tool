import { getDatabase } from '@netlify/database';

const DEFAULT_LOOKBACK_DAYS = 31;
const MAX_LOOKBACK_DAYS = 366;
const MAX_RECENT_EVENTS = 25;
let injectedDatabase = null;

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, { ok: true });
  }
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'method_not_allowed' });
  }

  const auth = getAdminUser(context);
  if (!auth.user) {
    return json(401, { error: 'unauthorized' });
  }
  if (!auth.isAdmin) {
    return json(403, { error: 'forbidden' });
  }

  const range = parseRange(event.queryStringParameters || {});
  if (!range.ok) {
    return json(400, { error: 'invalid_query', detail: range.error });
  }

  const db = getDatabaseClient();
  try {
    const [summaryRes, topUsersRes, monthlyRes, recentRes] = await Promise.all([
      db.pool.query(
        `
          SELECT
            COUNT(*)::int AS event_count,
            COUNT(DISTINCT user_sub)::int AS user_count,
            COUNT(DISTINCT session_id)::int AS session_count,
            COALESCE(SUM(pdf_count), 0)::int AS pdf_count,
            COALESCE(SUM(total_pages), 0)::int AS total_pages,
            COALESCE(SUM(statement_count), 0)::int AS statement_count,
            COALESCE(SUM(invoice_count), 0)::int AS invoice_count,
            COALESCE(SUM(line_item_count), 0)::int AS line_item_count,
            COALESCE(SUM(failed_checks), 0)::int AS failed_checks,
            COALESCE(SUM(warning_checks), 0)::int AS warning_checks,
            COALESCE(SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END), 0)::int AS success_count,
            COALESCE(SUM(CASE WHEN outcome = 'warnings' THEN 1 ELSE 0 END), 0)::int AS warnings_count,
            COALESCE(SUM(CASE WHEN outcome = 'issues' THEN 1 ELSE 0 END), 0)::int AS issues_count,
            COALESCE(SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END), 0)::int AS error_count
          FROM usage_events
          WHERE received_at >= $1 AND received_at < $2
        `,
        [range.value.from, range.value.to],
      ),
      db.pool.query(
        `
          SELECT
            user_sub,
            COUNT(*)::int AS event_count,
            COALESCE(SUM(pdf_count), 0)::int AS pdf_count,
            COALESCE(SUM(total_pages), 0)::int AS total_pages,
            MAX(received_at) AS last_seen_at
          FROM usage_events
          WHERE received_at >= $1 AND received_at < $2
          GROUP BY user_sub
          ORDER BY event_count DESC, last_seen_at DESC
          LIMIT 10
        `,
        [range.value.from, range.value.to],
      ),
      db.pool.query(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('month', received_at), 'YYYY-MM') AS month,
            user_sub,
            COUNT(*)::int AS event_count,
            COALESCE(SUM(pdf_count), 0)::int AS pdf_count,
            COALESCE(SUM(total_pages), 0)::int AS total_pages,
            COALESCE(SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END), 0)::int AS success_count,
            COALESCE(SUM(CASE WHEN outcome = 'warnings' THEN 1 ELSE 0 END), 0)::int AS warnings_count,
            COALESCE(SUM(CASE WHEN outcome = 'issues' THEN 1 ELSE 0 END), 0)::int AS issues_count,
            COALESCE(SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END), 0)::int AS error_count
          FROM usage_events
          WHERE received_at >= $1 AND received_at < $2
          GROUP BY DATE_TRUNC('month', received_at), user_sub
          ORDER BY month DESC, event_count DESC, user_sub ASC
          LIMIT 36
        `,
        [range.value.from, range.value.to],
      ),
      db.pool.query(
        `
          SELECT
            user_sub,
            client_event_id,
            pdf_count,
            total_pages,
            failed_checks,
            warning_checks,
            outcome,
            received_at
          FROM usage_events
          WHERE received_at >= $1 AND received_at < $2
          ORDER BY received_at DESC
          LIMIT $3
        `,
        [range.value.from, range.value.to, MAX_RECENT_EVENTS],
      ),
    ]);

    return json(200, {
      ok: true,
      range: range.value,
      summary: summaryRes.rows[0] || emptySummary(),
      topUsers: topUsersRes.rows,
      monthlyUsers: monthlyRes.rows,
      recentEvents: recentRes.rows,
    });
  } catch (err) {
    console.error('[admin-stats] query failed', err);
    return json(500, { error: 'query_failed' });
  }
};

export function __setDatabaseForTests(db) {
  injectedDatabase = db;
}

export function __resetTestOverrides() {
  injectedDatabase = null;
}

function getDatabaseClient() {
  return injectedDatabase || getDatabase();
}

function getAdminUser(context) {
  const user = context?.clientContext?.user || null;
  if (!user) return { user: null, isAdmin: false };

  const appMeta = user.app_metadata || user.appMetadata || {};
  const roleList = []
    .concat(Array.isArray(user.roles) ? user.roles : [])
    .concat(Array.isArray(appMeta.roles) ? appMeta.roles : [])
    .concat(typeof user.role === 'string' ? [user.role] : []);
  const normalized = roleList.map(role => String(role).trim().toLowerCase());
  const isAdmin = normalized.includes('admin') || normalized.includes('administrator');
  return { user, isAdmin };
}

function parseRange(params) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : now;
  if (!Number.isFinite(from.getTime())) return invalid('from must be a valid ISO timestamp');
  if (!Number.isFinite(to.getTime())) return invalid('to must be a valid ISO timestamp');
  if (from >= to) return invalid('from must be earlier than to');
  const lookbackDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
  if (lookbackDays > MAX_LOOKBACK_DAYS) return invalid(`range must be ${MAX_LOOKBACK_DAYS} days or less`);
  return {
    ok: true,
    value: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  };
}

function invalid(error) {
  return { ok: false, error };
}

function emptySummary() {
  return {
    event_count: 0,
    user_count: 0,
    session_count: 0,
    pdf_count: 0,
    total_pages: 0,
    statement_count: 0,
    invoice_count: 0,
    line_item_count: 0,
    failed_checks: 0,
    warning_checks: 0,
    success_count: 0,
    warnings_count: 0,
    issues_count: 0,
    error_count: 0,
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
