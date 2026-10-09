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

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL CHECK (length(trim(name)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_name_idx ON blog_tags (lower(name));

-- Import existing post tags and use one spelling for each shared tag.
INSERT INTO blog_tags (name)
SELECT DISTINCT ON (lower(trim(tag))) trim(tag)
FROM posts CROSS JOIN LATERAL unnest(tags) AS tag
WHERE length(trim(tag)) BETWEEN 1 AND 30
ORDER BY lower(trim(tag)), trim(tag)
ON CONFLICT DO NOTHING;

UPDATE posts p SET tags = ARRAY(
  SELECT t.name::text FROM unnest(p.tags) WITH ORDINALITY AS original(name, position)
  JOIN blog_tags t ON lower(t.name) = lower(trim(original.name))
  GROUP BY t.name ORDER BY min(original.position)
)
WHERE tags IS DISTINCT FROM ARRAY(
  SELECT t.name::text FROM unnest(p.tags) WITH ORDINALITY AS original(name, position)
  JOIN blog_tags t ON lower(t.name) = lower(trim(original.name))
  GROUP BY t.name ORDER BY min(original.position)
);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);

CREATE TABLE IF NOT EXISTS featured_posts (
  slot SMALLINT PRIMARY KEY CHECK (slot BETWEEN 1 AND 3),
  post_id UUID UNIQUE NOT NULL REFERENCES posts(id) ON DELETE CASCADE
);

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
