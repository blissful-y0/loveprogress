-- 부스홍보게시판: 배치도 위치(행·열), 부스인포 링크, 담당 부스어 계정
ALTER TABLE booths
  ADD COLUMN IF NOT EXISTS row_label TEXT,
  ADD COLUMN IF NOT EXISTS col_no    INTEGER,
  ADD COLUMN IF NOT EXISTS info_url  TEXT,
  ADD COLUMN IF NOT EXISTS user_id   UUID REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE booths
  ADD CONSTRAINT booths_position_check CHECK (
    (row_label IS NULL AND col_no IS NULL)
    OR (row_label IN ('거', '위') AND col_no BETWEEN 1 AND 11)
    OR (row_label = '와' AND col_no BETWEEN 1 AND 7)
    OR (row_label = '토' AND col_no BETWEEN 1 AND 3)
    OR (row_label = '끼' AND col_no BETWEEN 1 AND 8)
  ),
  ADD CONSTRAINT booths_position_unique UNIQUE (row_label, col_no);

CREATE INDEX IF NOT EXISTS idx_booths_user ON booths (user_id);
