CREATE TABLE IF NOT EXISTS user_profiles (
  user_sub TEXT PRIMARY KEY,
  email_hash TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_sub TEXT NOT NULL REFERENCES user_profiles(user_sub) ON DELETE CASCADE,
  client_event_id UUID NOT NULL,
  session_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  schema_version INTEGER NOT NULL DEFAULT 1,
  pdf_count INTEGER NOT NULL,
  total_pages INTEGER NOT NULL,
  country_count INTEGER NOT NULL,
  statement_count INTEGER NOT NULL,
  invoice_count INTEGER NOT NULL,
  line_item_count INTEGER NOT NULL,
  failed_checks INTEGER NOT NULL,
  warning_checks INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'warnings', 'issues', 'error')),
  UNIQUE (user_sub, client_event_id)
);

CREATE INDEX IF NOT EXISTS usage_events_user_received_idx
  ON usage_events (user_sub, received_at DESC);

CREATE INDEX IF NOT EXISTS usage_events_received_idx
  ON usage_events (received_at DESC);
