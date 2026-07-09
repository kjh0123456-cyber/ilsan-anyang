-- 로그인 계정과 연결된 장바구니. 비로그인 상태에서는 계속 브라우저 로컬에
-- 저장하고, 로그인 시 로컬 장바구니를 이 테이블로 병합한다.
CREATE TABLE cart_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON cart_items FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "cart_items_insert_own" ON cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cart_items_update_own" ON cart_items FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "cart_items_delete_own" ON cart_items FOR DELETE
  USING (user_id = auth.uid());
