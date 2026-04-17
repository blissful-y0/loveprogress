-- booth_likes: 부스 좋아요 (로그인 회원만)
CREATE TABLE IF NOT EXISTS booth_likes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booth_id  UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booth_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_booth_likes_booth ON booth_likes (booth_id);
CREATE INDEX IF NOT EXISTS idx_booth_likes_user ON booth_likes (user_id);

ALTER TABLE booth_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booth_likes_select_all" ON booth_likes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "booth_likes_insert_auth" ON booth_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "booth_likes_delete_own" ON booth_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
