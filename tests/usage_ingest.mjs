import assert from 'node:assert/strict';

import {
  __resetTestOverrides,
  __setDatabaseForTests,
  __setNowForTests,
  handler,
  validateUsagePayload,
} from '../netlify/functions/usage-ingest.mjs';

const VALID_PAYLOAD = {
  schemaVersion: 1,
  clientEventId: '3de078a3-90d4-46f7-b757-fd7acdff9e54',
  sessionId: '91e2d768-d7b0-4f3b-a14b-6ef9b1c82f1c',
  occurredAt: '2026-05-20T09:00:00.000Z',
  pdfCount: 2,
  totalPages: 5,
  countryCount: 2,
  statementCount: 2,
  invoiceCount: 8,
  lineItemCount: 42,
  failedChecks: 1,
  warningChecks: 2,
  outcome: 'issues',
};

await run();

async function run() {
  testValidateUsagePayload();
  await testHandlesMissingDatabase();
  await testSuccessfulInsertAndDedup();
  await testRateLimit();
  console.log('usage-ingest tests PASS');
}

function testValidateUsagePayload() {
  const ok = validateUsagePayload(VALID_PAYLOAD);
  assert.equal(ok.ok, true);

  const bad = validateUsagePayload({ ...VALID_PAYLOAD, clientEventId: 'not-a-uuid' });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /clientEventId/);
}

async function testHandlesMissingDatabase() {
  __resetTestOverrides();
  const response = await handler(createEvent(VALID_PAYLOAD), createContext());
  assert.equal(response.statusCode, 500);
  assert.deepEqual(JSON.parse(response.body), { error: 'database_unavailable' });
}

async function testSuccessfulInsertAndDedup() {
  const db = createMockDb();
  __setDatabaseForTests(db);
  __setNowForTests(new Date('2026-05-20T09:01:05.000Z'));

  const first = await handler(createEvent(VALID_PAYLOAD), createContext());
  assert.equal(first.statusCode, 200);
  assert.deepEqual(JSON.parse(first.body), { ok: true, inserted: true });
  assert.equal(db.state.userProfiles.size, 1);
  assert.equal(db.state.usageEvents.size, 1);

  const second = await handler(createEvent(VALID_PAYLOAD), createContext());
  assert.equal(second.statusCode, 200);
  assert.deepEqual(JSON.parse(second.body), { ok: true, inserted: false });
  assert.equal(db.state.usageEvents.size, 1);

  __resetTestOverrides();
}

async function testRateLimit() {
  const db = createMockDb();
  __setDatabaseForTests(db);
  __setNowForTests(new Date('2026-05-20T09:02:10.000Z'));

  for (let index = 0; index < 24; index += 1) {
    const payload = { ...VALID_PAYLOAD, clientEventId: makeUuid(index + 1) };
    const response = await handler(createEvent(payload), createContext());
    assert.equal(response.statusCode, 200);
  }

  const blocked = await handler(
    createEvent({ ...VALID_PAYLOAD, clientEventId: makeUuid(99) }),
    createContext(),
  );
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers['Retry-After'], '50');
  assert.deepEqual(JSON.parse(blocked.body), {
    error: 'rate_limited',
    scope: 'user',
    retryAfterSeconds: 50,
  });

  __resetTestOverrides();
}

function createEvent(payload) {
  return {
    httpMethod: 'POST',
    headers: {
      authorization: 'Bearer fake-token',
      'x-nf-client-connection-ip': '203.0.113.17',
    },
    body: JSON.stringify(payload),
    isBase64Encoded: false,
  };
}

function createContext() {
  return {
    clientContext: {
      user: {
        sub: 'user-123',
        email: 'Test.User@Lenovo.com',
      },
    },
  };
}

function createMockDb() {
  const state = {
    userProfiles: new Map(),
    usageEvents: new Map(),
    rateLimits: new Map(),
  };

  return {
    state,
    pool: {
      query: async (sql, params = []) => {
        const normalized = sql.replace(/\s+/g, ' ').trim();
        if (normalized === 'BEGIN' || normalized === 'COMMIT' || normalized === 'ROLLBACK') {
          return { rowCount: 0, rows: [] };
        }
        if (normalized.includes('INSERT INTO ingest_rate_limits')) {
          const [scope, scopeKeyHash, bucketStart] = params;
          const key = `${scope}:${scopeKeyHash}:${bucketStart}`;
          const nextCount = (state.rateLimits.get(key) || 0) + 1;
          state.rateLimits.set(key, nextCount);
          return { rowCount: 1, rows: [{ request_count: nextCount }] };
        }
        if (normalized.includes('INSERT INTO user_profiles')) {
          const [userSub, emailHash] = params;
          const existing = state.userProfiles.get(userSub);
          state.userProfiles.set(userSub, {
            userSub,
            emailHash,
            firstSeenAt: existing?.firstSeenAt || 'first',
            lastSeenAt: 'last',
          });
          return { rowCount: 1, rows: [] };
        }
        if (normalized.includes('INSERT INTO usage_events')) {
          const [userSub, clientEventId, sessionId, occurredAt, ...rest] = params;
          const key = `${userSub}:${clientEventId}`;
          if (state.usageEvents.has(key)) {
            return { rowCount: 0, rows: [] };
          }
          state.usageEvents.set(key, {
            userSub,
            clientEventId,
            sessionId,
            occurredAt,
            rest,
          });
          return { rowCount: 1, rows: [] };
        }
        throw new Error(`Unhandled SQL in test mock: ${normalized}`);
      },
    },
  };
}

function makeUuid(seed) {
  const part = String(seed).padStart(12, '0');
  return `00000000-0000-4000-8000-${part}`;
}
