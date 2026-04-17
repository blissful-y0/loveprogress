-- fixed_banner 그룹 내에서 sort_order(슬롯 위치)가 중복되지 않도록 partial unique index 추가.
-- 다른 그룹(top_carousel, middle_carousel)은 같은 sort_order 허용.
-- 기존에 중복된 fixed_banner row가 있으면 sort_order별로 created_at이 가장 큰(최신) 한 건만 남기고 삭제.
-- main_banners.created_at 컬럼이 없으면 id(UUID) 순으로 최신 추정은 불가하므로 id 기준 임의 dedupe.

DELETE FROM main_banners a
USING main_banners b
WHERE a.group_type = 'fixed_banner'
  AND b.group_type = 'fixed_banner'
  AND a.sort_order = b.sort_order
  AND a.id < b.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_main_banners_fixed_slot_unique
  ON main_banners (sort_order)
  WHERE group_type = 'fixed_banner';
