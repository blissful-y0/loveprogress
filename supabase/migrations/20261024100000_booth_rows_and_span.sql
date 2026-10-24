-- 부스홍보게시판: 행 이름 변경(거→오, 위→리), 관리자 구역이 여러 칸을 차지하도록 col_end 추가
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

ALTER TABLE booths
  DROP CONSTRAINT booths_position_check,
  DROP CONSTRAINT booths_position_unique,
  ADD COLUMN IF NOT EXISTS col_end INTEGER;

UPDATE booths
SET row_label = CASE row_label WHEN '거' THEN '오' WHEN '위' THEN '리' END
WHERE row_label IN ('거', '위');

ALTER TABLE booths
  ADD CONSTRAINT booths_position_check CHECK (
    (row_label IS NULL AND col_no IS NULL AND col_end IS NULL)
    OR (
      col_no >= 1
      AND (col_end IS NULL OR col_end > col_no)
      AND COALESCE(col_end, col_no) <= CASE row_label
        WHEN '오' THEN 11 WHEN '리' THEN 11 WHEN '와' THEN 7 WHEN '토' THEN 3 WHEN '끼' THEN 8 ELSE 0
      END
    )
  ),
  -- 같은 행에서 차지한 열 범위가 겹치면 거부 (예: 끼-1~2가 있으면 끼-2 등록 불가)
  ADD CONSTRAINT booths_position_no_overlap EXCLUDE USING gist (
    row_label WITH =,
    int4range(col_no, COALESCE(col_end, col_no), '[]') WITH &&
  );
