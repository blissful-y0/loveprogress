-- 신입생안내(sort_order=1) 고정배너 이미지를 기본 아이콘으로 롤백.
-- 링크는 유지하고 image_key만 교체.

UPDATE main_banners
SET image_key = '/img/main/topcarousel/freshmen-guide.png'
WHERE group_type = 'fixed_banner'
  AND sort_order = 1;
