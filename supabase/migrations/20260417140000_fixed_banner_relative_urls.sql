-- 고정배너 내부 링크를 상대 경로로 정규화.
-- 앞으로 도메인이 바뀌어도 URL 수정 불필요.
-- 이전 마이그레이션에서 absolute URL이 이미 저장된 경우 모두 path-only로 치환.

UPDATE main_banners
SET link_url = regexp_replace(link_url, '^https?://[^/]+', '', 'i')
WHERE group_type = 'fixed_banner'
  AND link_url ~* '^https?://(www\.)?(groveofepiphany\.com|loveprogress\.vercel\.app)/';
