-- 부스홍보 글 등록 시각. 부스어·관리자가 부스홍보에서 저장해야 채워지며, 비어 있으면 배치도에서 회색(미등록) 칸
ALTER TABLE booths ADD COLUMN IF NOT EXISTS promo_posted_at TIMESTAMPTZ;
