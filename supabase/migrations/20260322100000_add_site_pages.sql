-- site_pages: 관리자가 직접 HTML을 관리하는 정적 페이지 테이블
CREATE TABLE site_pages (
  slug        TEXT PRIMARY KEY,
  content     TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용
CREATE POLICY "site_pages_public_read" ON site_pages
  FOR SELECT USING (true);

-- 초기 about 행 삽입 (빈 콘텐츠)
INSERT INTO site_pages (slug, content) VALUES ('about', '');
