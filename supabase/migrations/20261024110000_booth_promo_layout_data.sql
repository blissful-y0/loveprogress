-- 부스홍보게시판: 주최 측 부스배치도(2026-10) 반영
-- 1) 이미 등록된 부스 30개를 배치도 위치로 옮긴다 (이름으로 찾음, 썸네일·키워드·담당 계정은 그대로)
-- 2) 관리자 구역 8개를 대표자·키워드 없이 추가한다. 썸네일은 임시 이미지라 관리자가 바꾼다
-- 부스 이름이 하나라도 안 맞으면 전체를 되돌린다.
DO $$
DECLARE
  matched int;
BEGIN
  CREATE TEMP TABLE booth_moves (row_label text, col_no int, name text) ON COMMIT DROP;
  INSERT INTO booth_moves VALUES
    ('오', 1, '335회차 밀밭에서'),
    ('오', 2, '사제간거리유지실패'),
    ('오', 3, '밀밭의 파수꾼'),
    ('오', 4, '드로마스는 사랑을 싣고'),
    ('오', 5, '선생님 불씨 주세요 많이주세요 그래 불씨 많이 무쳐주마'),
    ('오', 6, '모든 사람이 파낙에서 다시 만날 수 있도록 맹세할게요'),
    ('오', 7, '3천만번의 재수강에도 결국엔 떠오를 B+이로다'),
    ('오', 8, '선생님 드로마스 말고 저도 예뻐해주세요!'),
    ('오', 9, '나무정원 제자스승 지지모임'),
    ('오', 10, '『12시간 』파낙전공'),
    ('오', 11, '저희 선생님도 반성하고 있으시니 부디 이번 일은 용서를'),
    ('리', 1, '파낙은 첫데뷔와 동의어'),
    ('리', 2, '꽁꽁 얼어붙은 나무 정원 위로 사모예드가 걸어다닙니다'),
    ('리', 3, '불행과학자조합콤플렉스'),
    ('리', 4, '~제자육성시뮬레이션: 당신의 파이논을 선택하세요!~'),
    ('리', 5, '슈뢰딩거의 사제관'),
    ('리', 6, '한 번 선생은 영원한 선생님'),
    ('리', 7, '파이논한달식비오백만원'),
    ('리', 8, '멍냥심화연구'),
    ('리', 9, '강아지 고양이 손 잡고 밀밭라라로'),
    ('리', 10, '결국 모든 것을 알고 싶다'),
    ('리', 11, '파이낙사 배포전 :: 사랑의 진도 2 - 주최부스'),
    ('와', 1, '≪제자스승 연애 가이드≫'),
    ('와', 2, '그 사제가 사랑하는 법'),
    ('와', 3, '제자스승 밀밭 신혼집'),
    ('와', 4, '파이낙사 행복공방'),
    ('와', 5, '선생님 좋아해요! 예? 이미 아신다고요?'),
    ('와', 6, '파이논네 메이드로마스'),
    ('토', 1, '이롭고 상서로운 커플 파이낙사 간호홍보부'),
    ('토', 2, 'neimma');

  SELECT count(DISTINCT b.id) INTO matched FROM booths b JOIN booth_moves m ON m.name = b.name;
  IF matched <> 30 OR (SELECT count(*) FROM booths b JOIN booth_moves m ON m.name = b.name) <> 30 THEN
    RAISE EXCEPTION '부스 이름 매칭 실패: % / 30', matched;
  END IF;

  -- 자리 바꾸기 중 겹침 제약에 걸리지 않게 먼저 비운다
  UPDATE booths SET row_label = NULL, col_no = NULL, col_end = NULL
  WHERE name IN (SELECT name FROM booth_moves);

  UPDATE booths b SET row_label = m.row_label, col_no = m.col_no
  FROM booth_moves m WHERE m.name = b.name;
END $$;

INSERT INTO booths (name, thumbnail_image_key, row_label, col_no, col_end) VALUES
  ('본부석', '/img/booth/booth-placeholder-1.svg', '와', 7, NULL),
  ('입장확인', '/img/booth/booth-placeholder-2.svg', '토', 3, NULL),
  ('무료나눔존', '/img/booth/booth-placeholder-3.svg', '끼', 1, 2),
  ('트레카교환존', '/img/booth/booth-placeholder-4.svg', '끼', 3, 4),
  ('트레카판매존', '/img/booth/booth-placeholder-5.svg', '끼', 5, NULL),
  ('이벤트존', '/img/booth/booth-placeholder-6.svg', '끼', 6, NULL),
  ('이벤트존', '/img/booth/booth-placeholder-1.svg', '끼', 7, NULL),
  ('출입구관리', '/img/booth/booth-placeholder-2.svg', '끼', 8, NULL);
