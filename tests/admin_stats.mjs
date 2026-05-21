import assert from 'node:assert/strict';

import {
  __resetTestOverrides,
  __setDatabaseForTests,
  handler,
} from '../netlify/functions/admin-stats.mjs';

await run();

async function run() {
  await testRequiresUser();
  await testRejectsNonAdmin();
  await testHandlesMissingDatabase();
  await testReturnsStatsForAdmin();
  console.log('admin-stats tests PASS');
}

async function testRequiresUser() {
  const response = await handler({ httpMethod: 'GET', queryStringParameters: {} }, {});
  assert.equal(response.statusCode, 401);
}

async function testRejectsNonAdmin() {
  const response = await handler(
    { httpMethod: 'GET', queryStringParameters: {} },
    { clientContext: { user: { sub: 'u-1', roles: ['viewer'] } } },
  );
  assert.equal(response.statusCode, 403);
}

async function testHandlesMissingDatabase() {
  __resetTestOverrides();
  const response = await handler(
    { httpMethod: 'GET', queryStringParameters: {} },
    { clientContext: { user: { sub: 'admin-1', roles: ['admin'] } } },
  );
  assert.equal(response.statusCode, 500);
  assert.deepEqual(JSON.parse(response.body), { error: 'database_unavailable' });
}

async function testReturnsStatsForAdmin() {
  const db = createMockDb();
  __setDatabaseForTests(db);
  const response = await handler(
    {
      httpMethod: 'GET',
      queryStringParameters: {
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-06-01T00:00:00.000Z',
      },
    },
    {
      clientContext: {
        user: {
          sub: 'admin-1',
          roles: ['admin'],
          app_metadata: { roles: ['admin'] },
        },
      },
    },
  );
  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.equal(body.summary.event_count, 2);
  assert.equal(body.summary.pdf_count, 3);
  assert.equal(body.summary.issues_count, 1);
  assert.equal(body.topUsers.length, 2);
  assert.equal(body.monthlyUsers[0].month, '2026-05');
  assert.equal(body.recentEvents.length, 2);
  __resetTestOverrides();
}

function createMockDb() {
  return {
    pool: {
      query: async (sql) => {
        const normalized = sql.replace(/\s+/g, ' ').trim();
        if (normalized.includes('COUNT(DISTINCT user_sub)::int AS user_count')) {
          return {
            rows: [{
              event_count: 2,
              user_count: 2,
              session_count: 2,
              pdf_count: 3,
              total_pages: 8,
              statement_count: 2,
              invoice_count: 6,
              line_item_count: 12,
              failed_checks: 1,
              warning_checks: 0,
              success_count: 1,
              warnings_count: 0,
              issues_count: 1,
              error_count: 0,
            }],
          };
        }
        if (normalized.includes('GROUP BY user_sub')) {
          return {
            rows: [
              {
                user_sub: 'user-a',
                event_count: 1,
                pdf_count: 2,
                total_pages: 5,
                last_seen_at: '2026-05-20T15:22:23.228Z',
              },
              {
                user_sub: 'user-b',
                event_count: 1,
                pdf_count: 1,
                total_pages: 3,
                last_seen_at: '2026-05-20T15:52:40.689Z',
              },
            ],
          };
        }
        if (normalized.includes("TO_CHAR(DATE_TRUNC('month', received_at), 'YYYY-MM') AS month")) {
          return {
            rows: [
              {
                month: '2026-05',
                user_sub: 'user-a',
                event_count: 1,
                pdf_count: 2,
                total_pages: 5,
                success_count: 0,
                warnings_count: 0,
                issues_count: 1,
                error_count: 0,
              },
              {
                month: '2026-05',
                user_sub: 'user-b',
                event_count: 1,
                pdf_count: 1,
                total_pages: 3,
                success_count: 1,
                warnings_count: 0,
                issues_count: 0,
                error_count: 0,
              },
            ],
          };
        }
        if (normalized.includes('ORDER BY received_at DESC')) {
          return {
            rows: [
              {
                user_sub: 'user-b',
                client_event_id: 'evt-2',
                pdf_count: 1,
                total_pages: 3,
                failed_checks: 0,
                warning_checks: 0,
                outcome: 'success',
                received_at: '2026-05-20T15:52:40.689Z',
              },
              {
                user_sub: 'user-a',
                client_event_id: 'evt-1',
                pdf_count: 2,
                total_pages: 5,
                failed_checks: 1,
                warning_checks: 0,
                outcome: 'issues',
                received_at: '2026-05-20T15:22:23.228Z',
              },
            ],
          };
        }
        throw new Error(`Unhandled SQL in admin-stats test mock: ${normalized}`);
      },
    },
  };
}
