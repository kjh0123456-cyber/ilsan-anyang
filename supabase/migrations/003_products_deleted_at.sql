-- 상품 소프트 삭제를 위한 컬럼. NULL이면 삭제되지 않은 상태.
-- is_active와는 별개 개념: is_active는 "판매중/중단" 토글, deleted_at은
-- "삭제됨" 여부. 삭제 시 is_active도 false로 같이 내려서, 기존
-- products_select RLS 정책(is_active = true)만으로 고객 화면에서
-- 자동으로 숨겨지도록 한다(별도 정책 변경 불필요).
ALTER TABLE products ADD COLUMN deleted_at timestamptz;
