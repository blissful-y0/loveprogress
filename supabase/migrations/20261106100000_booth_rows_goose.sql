-- 부스홍보게시판: 행 이름을 다시 거·위로 (오리와 토끼 → 거위와 토끼)
ALTER TABLE booths DROP CONSTRAINT booths_position_check;

UPDATE booths
SET row_label = CASE row_label WHEN '오' THEN '거' WHEN '리' THEN '위' END
WHERE row_label IN ('오', '리');

ALTER TABLE booths
  ADD CONSTRAINT booths_position_check CHECK (
    (row_label IS NULL AND col_no IS NULL AND col_end IS NULL)
    OR (
      col_no >= 1
      AND (col_end IS NULL OR col_end > col_no)
      AND COALESCE(col_end, col_no) <= CASE row_label
        WHEN '거' THEN 11 WHEN '위' THEN 11 WHEN '와' THEN 7 WHEN '토' THEN 3 WHEN '끼' THEN 8 ELSE 0
      END
    )
  );
