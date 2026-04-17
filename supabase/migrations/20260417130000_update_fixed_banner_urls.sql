-- 고정배너 링크를 새 도메인(www.groveofepiphany.com)으로 갱신.
-- 이전 마이그레이션(20260417120000)이 이미 적용된 환경에서도 URL 교체가 일어나도록 UPDATE로 처리.

UPDATE main_banners
SET link_url = replace(link_url, 'https://loveprogress.vercel.app/', 'https://www.groveofepiphany.com/')
WHERE group_type = 'fixed_banner'
  AND link_url LIKE 'https://loveprogress.vercel.app/%';
