-- 일반공개 전 테스트 흔적 초기화.
-- 대상:
--   1) qna_posts (나무광장) — qna_answers는 FK cascade로 함께 삭제
--   2) board_posts where board_type = 'booth_private' (우애의관) — board_comments cascade
--   3) booth_likes (대학생활 부스 좋아요)
-- 보존:
--   - board_posts(notice, event) 공지/학사안내
--   - booths / booth_keywords / booth_participants 공식 참가부스
--   - users 계정
--   - main_banners

DELETE FROM qna_posts;

DELETE FROM board_posts WHERE board_type = 'booth_private';

DELETE FROM booth_likes;
