CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  excerpt VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published_at DESC) WHERE published = TRUE;

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message TEXT NOT NULL,
  delivery_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  password_version CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key CHAR(64) PRIMARY KEY,
  hits INTEGER NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL
);
