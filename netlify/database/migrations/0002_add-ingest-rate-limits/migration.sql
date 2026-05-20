CREATE TABLE IF NOT EXISTS ingest_rate_limits (
  scope TEXT NOT NULL,
  scope_key_hash TEXT NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (scope, scope_key_hash, bucket_start)
);

CREATE INDEX IF NOT EXISTS ingest_rate_limits_expires_idx
  ON ingest_rate_limits (expires_at);
