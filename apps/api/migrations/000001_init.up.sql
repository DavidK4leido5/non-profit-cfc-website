-- +migrate Up
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE cloudinary_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id         TEXT NOT NULL UNIQUE,
  url               TEXT NOT NULL,
  secure_url        TEXT NOT NULL,
  resource_type     TEXT NOT NULL DEFAULT 'image',
  format            TEXT,
  width             INT,
  height            INT,
  bytes             INT,
  folder            TEXT,
  original_filename TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE articles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  excerpt        TEXT NOT NULL DEFAULT '',
  cover_asset_id UUID REFERENCES cloudinary_assets(id) ON DELETE SET NULL,
  cover_url      TEXT NOT NULL DEFAULT '',
  body_html      TEXT NOT NULL DEFAULT '',
  body_gjs       JSONB,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'published')),
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_settings (
  id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO board_settings (id, hero) VALUES (1, '{
  "eyebrow": "What''s new at CFC",
  "title": "See what''s on the board.",
  "subtitle": "Big updates from each ministry.",
  "background": {"src": "", "alt": ""}
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE board_ministries (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   TEXT NOT NULL UNIQUE,
  title                  TEXT NOT NULL,
  tagline                TEXT NOT NULL DEFAULT '',
  image_src              TEXT NOT NULL DEFAULT '',
  image_alt              TEXT NOT NULL DEFAULT '',
  image_object_position  TEXT NOT NULL DEFAULT '',
  sort_order             INT NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_posts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id            UUID NOT NULL REFERENCES board_ministries(id) ON DELETE CASCADE,
  slug                   TEXT NOT NULL,
  title                  TEXT NOT NULL,
  body                   TEXT NOT NULL DEFAULT '',
  body_html              TEXT NOT NULL DEFAULT '',
  body_gjs               JSONB,
  date_label             TEXT NOT NULL DEFAULT '',
  tag                    TEXT,
  pinned                 BOOLEAN NOT NULL DEFAULT false,
  image_src              TEXT,
  image_alt              TEXT,
  image_object_position  TEXT,
  variant                TEXT CHECK (variant IS NULL OR variant IN ('image', 'brand')),
  palette                TEXT CHECK (palette IS NULL OR palette IN
                           ('brand', 'sunset', 'gold', 'mint', 'violet')),
  align_text             TEXT CHECK (align_text IS NULL OR align_text IN ('left', 'center', 'right')),
  sort_order             INT NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'published'
                           CHECK (status IN ('draft', 'published')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ministry_id, slug)
);

CREATE INDEX board_posts_ministry_idx ON board_posts (ministry_id, sort_order);

CREATE TABLE upcoming_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  date_label     TEXT NOT NULL DEFAULT '',
  href           TEXT NOT NULL DEFAULT '',
  cta            TEXT NOT NULL DEFAULT '',
  image_src      TEXT NOT NULL DEFAULT '',
  image_alt      TEXT NOT NULL DEFAULT '',
  icon           TEXT NOT NULL DEFAULT 'calendar'
                   CHECK (icon IN ('camp', 'retreat', 'calendar', 'fellowship', 'service')),
  class_name     TEXT NOT NULL DEFAULT '',
  body_html      TEXT NOT NULL DEFAULT '',
  body_gjs       JSONB,
  sort_order     INT NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'published'
                   CHECK (status IN ('draft', 'published')),
  starts_on      DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX upcoming_activities_status_sort_idx
  ON upcoming_activities (status, sort_order);
