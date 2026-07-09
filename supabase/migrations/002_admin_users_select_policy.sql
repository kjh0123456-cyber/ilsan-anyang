-- admin_users에 RLS만 켜져 있고 정책이 없어서, 로그인한 사용자가 자신의
-- 관리자 여부를 조회할 수 없었다 (다른 테이블의 관리자 체크도 이 테이블을
-- 참조하므로 함께 막혀 있었다). 본인 행만 조회 가능하도록 허용한다.
CREATE POLICY "admin_users_select_own" ON admin_users FOR SELECT
  USING (user_id = auth.uid());
