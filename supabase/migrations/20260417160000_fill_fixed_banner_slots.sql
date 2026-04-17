-- 고정배너 6개 슬롯 채우기
-- 기존 row는 link_url만 교체(이미지 유지), 없는 슬롯은 기본 아이콘 + 링크로 INSERT
-- 내부 링크는 상대경로, 외부는 절대 URL

DO $$
DECLARE
  slot RECORD;
BEGIN
  FOR slot IN
    SELECT * FROM (VALUES
      (0, '/img/main/topcarousel/academic-calendar.png',
          '/info/notices/4a73b5b4-feb4-48b9-870e-9adbb2cd759b'::text),
      (1, '/img/main/topcarousel/freshmen-guide.png',
          '/info/notices/7adfe9f6-cb0a-4f80-8d6c-762dac73e6d8'::text),
      (2, '/img/main/topcarousel/arts-education.png',
          'https://phainaxa.com/game/'::text),
      (3, '/img/main/topcarousel/graduation.png',
          'https://phnxgame.com/'::text),
      (4, '/img/main/topcarousel/graduate-program.png',
          NULL::text),
      (5, '/img/main/topcarousel/industry-collab.png',
          NULL::text)
    ) AS t(sort_order, image_key, link_url)
  LOOP
    UPDATE main_banners
    SET link_url = slot.link_url
    WHERE group_type = 'fixed_banner'
      AND sort_order = slot.sort_order;

    IF NOT FOUND THEN
      INSERT INTO main_banners (group_type, image_key, link_url, sort_order, is_active)
      VALUES ('fixed_banner', slot.image_key, slot.link_url, slot.sort_order, true);
    END IF;
  END LOOP;
END $$;
