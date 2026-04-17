-- 고정배너(fixed_banner) 6개 초기 시드
-- sort_order 순서: 학사일정, 신입생안내, 예술교육원, 졸업수료, 대학원통합과정, 산학협력단
-- 이미 등록된 row가 있으면 skip (멱등성 보장)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM main_banners WHERE group_type = 'fixed_banner') THEN
    INSERT INTO main_banners (group_type, image_key, link_url, sort_order, is_active) VALUES
      ('fixed_banner', '/img/main/topcarousel/academic-calendar.png',
       'https://www.groveofepiphany.com/info/notices/4a73b5b4-feb4-48b9-870e-9adbb2cd759b',
       0, true),
      ('fixed_banner', '/img/main/topcarousel/freshmen-guide.png',
       'https://www.groveofepiphany.com/info/notices/7adfe9f6-cb0a-4f80-8d6c-762dac73e6d8',
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
  END IF;
END $$;
