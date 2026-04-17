-- 고정배너(fixed_banner) 슬롯 강제 리셋.
-- 기존 fixed_banner row에 잘못된 이미지가 들어가 있는 경우가 있어
-- 6개 슬롯을 정확한 sort_order/이미지/링크로 재세팅한다.
-- 이후 어드민에서 링크/이미지 수정 가능.

DELETE FROM main_banners WHERE group_type = 'fixed_banner';

INSERT INTO main_banners (group_type, image_key, link_url, sort_order, is_active) VALUES
  ('fixed_banner', '/img/main/topcarousel/academic-calendar.png',
   'https://loveprogress.vercel.app/info/notices/4a73b5b4-feb4-48b9-870e-9adbb2cd759b',
   0, true),
  ('fixed_banner', '/img/main/topcarousel/freshmen-guide.png',
   'https://loveprogress.vercel.app/info/notices/7adfe9f6-cb0a-4f80-8d6c-762dac73e6d8',
   1, true),
  ('fixed_banner', '/img/main/topcarousel/arts-education.png',
   'https://phainaxa.com/game/',
   2, true),
  ('fixed_banner', '/img/main/topcarousel/graduation.png',
   'https://phnxgame.com/',
   3, true),
  ('fixed_banner', '/img/main/topcarousel/graduate-program.png',
   NULL, 4, true),
  ('fixed_banner', '/img/main/topcarousel/industry-collab.png',
   NULL, 5, true);
