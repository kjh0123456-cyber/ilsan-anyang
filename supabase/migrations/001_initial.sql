-- products 테이블
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text NOT NULL CHECK (category IN ('vacuum','air','speaker','light','hub')),
  images text[] NOT NULL DEFAULT '{}',
  specs jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- orders 테이블
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','shipping','delivered','cancelled')),
  toss_payment_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- order_items 테이블
CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0)
);

-- reviews 테이블
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- admin_users 테이블
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- products: 모든 사용자 읽기 가능, 관리자만 쓰기
CREATE POLICY "products_select" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- orders: 본인 주문만 조회/생성
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_admin_all" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- order_items: 본인 주문 아이템만 조회/생성
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));

-- reviews: 모든 사용자 읽기 가능, 본인만 작성
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE USING (user_id = auth.uid());

-- 샘플 데이터
INSERT INTO products (name, description, price, stock, category, images, specs) VALUES
('루미봇 X1 로봇청소기', '강력한 흡입력과 AI 장애물 회피 기능을 갖춘 프리미엄 로봇청소기', 890000, 50, 'vacuum',
 ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
 '{"흡입력": "3000Pa", "배터리": "5200mAh", "청소면적": "최대 200㎡", "소음": "62dB"}'::jsonb),
('에어킹 Pro 공기청정기', 'HEPA 13 필터와 실시간 공기질 모니터링으로 깨끗한 공기를 유지', 450000, 30, 'air',
 ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
 '{"적용면적": "60㎡", "필터": "HEPA 13", "CADR": "400 m³/h", "소음": "22dB"}'::jsonb),
('사운드큐브 미니 스마트스피커', '360도 사운드와 AI 음성인식으로 스마트홈을 컨트롤', 220000, 100, 'speaker',
 ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
 '{"출력": "20W", "연결": "Wi-Fi 6, Bluetooth 5.0", "마이크": "6개 어레이", "호환": "구글홈, 네이버클로바"}'::jsonb),
('루미라이트 스마트조명 세트', '1600만 컬러 조절 가능한 스마트 LED 조명 4개 세트', 180000, 200, 'light',
 ARRAY['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800'],
 '{"밝기": "최대 1100lm", "색온도": "2700K-6500K", "컬러": "1600만 색상", "수명": "25,000시간"}'::jsonb),
('홈허브 센터 IoT 허브', '모든 스마트홈 기기를 하나로 연결하는 중앙 허브', 350000, 40, 'hub',
 ARRAY['https://images.unsplash.com/photo-1558002038-1055907df827?w=800'],
 '{"프로토콜": "Zigbee, Z-Wave, Wi-Fi, Bluetooth", "연결기기": "최대 200대", "반응속도": "0.1초", "로컬처리": "지원"}'::jsonb);
