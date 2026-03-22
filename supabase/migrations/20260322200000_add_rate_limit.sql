-- Rate limit 버킷 테이블 (서버리스 환경에서도 영속적으로 동작)
CREATE TABLE rate_limit_buckets (
  key       TEXT        PRIMARY KEY,
  count     INTEGER     NOT NULL DEFAULT 1,
  reset_at  TIMESTAMPTZ NOT NULL
);

-- 공개 접근 차단 (service role만 사용)
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- 원자적 카운터 증가 및 한도 초과 여부 반환
-- 반환값: 현재 count (호출자가 maxRequests와 비교)
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key        TEXT,
  p_max        INTEGER,
  p_window_ms  BIGINT
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 만료된 항목 삭제
  DELETE FROM rate_limit_buckets WHERE key = p_key AND reset_at < NOW();

  -- 원자적 upsert: 새 항목은 count=1, 기존 항목은 count+1
  INSERT INTO rate_limit_buckets (key, count, reset_at)
    VALUES (p_key, 1, NOW() + (p_window_ms || ' milliseconds')::INTERVAL)
  ON CONFLICT (key)
    DO UPDATE SET count = rate_limit_buckets.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;
