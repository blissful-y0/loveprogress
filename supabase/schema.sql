-- ============================================================
-- 사랑의 진도 (Love Progress) — Supabase Schema
-- 인증은 Supabase Auth를 사용하며, public.users 테이블은
-- 프로필 정보와 역할(role) 저장 용도로만 사용합니다.
-- RLS 활성화: 읽기 정책은 아래 정의, 관리자 쓰기는 service-role(supabaseAdmin)으로 RLS 우회
-- ============================================================

-- ─── Custom enum types ──────────────────────────────────────────

CREATE TYPE user_role      AS ENUM ('member', 'booth_member', 'admin');
CREATE TYPE board_type     AS ENUM ('notice', 'event', 'booth_private');
CREATE TYPE booth_age_type AS ENUM ('general', 'adult');
CREATE TYPE banner_group   AS ENUM ('top_carousel', 'middle_carousel', 'fixed_banner');
CREATE TYPE booth_keyword  AS ENUM ('그림회지', '글회지', '팬시굿즈', '수공예품', '무료나눔');

-- ─── users ────────────────────────────────────────────────

CREATE TABLE users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname       TEXT        NOT NULL,
  email          TEXT        NOT NULL UNIQUE,
  booth_name     TEXT,
  phone_last4    TEXT,
  role           user_role   NOT NULL DEFAULT 'member',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (id = auth.uid());

-- ─── board_posts ──────────────────────────────────────────

CREATE TABLE board_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type          board_type  NOT NULL,
  title               TEXT        NOT NULL,
  content             TEXT        NOT NULL,
  author_user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  author_display_name TEXT        NOT NULL,
  is_pinned           BOOLEAN     NOT NULL DEFAULT false,
  is_secret           BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_posts_type_created ON board_posts (board_type, created_at DESC);
CREATE INDEX idx_board_posts_author       ON board_posts (author_user_id);

ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_posts_select_all" ON board_posts FOR SELECT TO authenticated, anon USING (true);

-- ─── board_comments ─────────────────────────────────────────

CREATE TABLE board_comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             UUID        NOT NULL REFERENCES board_posts (id) ON DELETE CASCADE,
  author_user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  author_display_name TEXT        NOT NULL,
  content             TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_comments_post ON board_comments (post_id, created_at);

ALTER TABLE board_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_comments_select_all" ON board_comments FOR SELECT TO authenticated, anon USING (true);

-- ─── qna_posts ───────────────────────────────────────────

CREATE TABLE qna_posts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_name        TEXT    NOT NULL,
  password_hash      TEXT,
  is_secret          BOOLEAN NOT NULL DEFAULT false,
  image_key          TEXT,
  content            TEXT    NOT NULL,
  consent_to_privacy BOOLEAN NOT NULL DEFAULT false,
  created_ip         INET    NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qna_posts_created ON qna_posts (created_at DESC);

ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qna_posts_select_public" ON qna_posts FOR SELECT TO authenticated, anon USING (is_secret = false);
CREATE POLICY "qna_posts_insert_all" ON qna_posts FOR INSERT TO authenticated, anon WITH CHECK (true);

-- ─── qna_answers ──────────────────────────────────────────

CREATE TABLE qna_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qna_post_id   UUID        NOT NULL REFERENCES qna_posts (id) ON DELETE CASCADE,
  admin_user_id UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_qna_answers_post ON qna_answers (qna_post_id);

ALTER TABLE qna_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qna_answers_select_all" ON qna_answers FOR SELECT TO authenticated, anon USING (true);

-- ─── booths ───────────────────────────────────────────────

CREATE TABLE booths (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT           NOT NULL,
  password_last4      TEXT,
  thumbnail_image_key TEXT           NOT NULL,
  hover_image_key     TEXT,
  age_type            booth_age_type NOT NULL DEFAULT 'general',
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE booths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booths_select_all" ON booths FOR SELECT TO authenticated, anon USING (true);

-- ─── booth_keywords ─────────────────────────────────────────

CREATE TABLE booth_keywords (
  id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booth_id UUID          NOT NULL REFERENCES booths (id) ON DELETE CASCADE,
  keyword  booth_keyword NOT NULL
);

CREATE INDEX idx_booth_keywords_booth ON booth_keywords (booth_id);

ALTER TABLE booth_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booth_keywords_select_all" ON booth_keywords FOR SELECT TO authenticated, anon USING (true);

-- ─── booth_participants ───────────────────────────────────────

CREATE TABLE booth_participants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booth_id   UUID    NOT NULL REFERENCES booths (id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  sns_url    TEXT,
  role_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_booth_participants_booth ON booth_participants (booth_id, role_order);

ALTER TABLE booth_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booth_participants_select_all" ON booth_participants FOR SELECT TO authenticated, anon USING (true);

-- ─── main_banners ───────────────────────────────────────────

CREATE TABLE main_banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type banner_group NOT NULL,
  image_key  TEXT         NOT NULL,
  bg_color   TEXT,
  link_url   TEXT,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT true
);

CREATE INDEX idx_main_banners_group ON main_banners (group_type, sort_order);

ALTER TABLE main_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "main_banners_select_active" ON main_banners FOR SELECT TO authenticated, anon USING (is_active = true);

-- ─── updated_at 자동 갱신 트리거 ────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_board_posts_updated_at
  BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_board_comments_updated_at
  BEFORE UPDATE ON board_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_qna_answers_updated_at
  BEFORE UPDATE ON qna_answers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_booths_updated_at
  BEFORE UPDATE ON booths
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
