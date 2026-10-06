-- 로그인 사용자가 자기 users.role을 admin으로 바꿀 수 있던 정책 제거.
-- users 쓰기는 전부 API(service role)에서 처리하므로 사용자 세션용 UPDATE 정책은 필요 없다.
DROP POLICY IF EXISTS "users_update_own" ON users;
