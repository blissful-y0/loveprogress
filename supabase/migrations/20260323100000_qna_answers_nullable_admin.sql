-- admin_user_id를 nullable로 변경 (서비스 롤로 답변 등록 시 admin_user_id 불필요)
ALTER TABLE qna_answers
  ALTER COLUMN admin_user_id DROP NOT NULL,
  ALTER COLUMN admin_user_id DROP DEFAULT;
