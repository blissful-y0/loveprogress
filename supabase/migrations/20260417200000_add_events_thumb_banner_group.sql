-- banner_group enum에 'events_thumb' 추가.
-- 메인페이지 학사 안내 섹션의 featured 썸네일을 어드민 배너 관리에서 교체할 수 있도록.

ALTER TYPE banner_group ADD VALUE IF NOT EXISTS 'events_thumb';
