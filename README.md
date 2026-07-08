# ilsan-anyang

Supabase와 토스페이먼츠를 연동한 Next.js 커머스 애플리케이션입니다.

## 주요 기능

- 회원가입 / 로그인 (Supabase Auth)
- 상품 목록 및 상세 페이지 (이미지 갤러리, 스펙, 리뷰)
- 장바구니 (수량 조절, 주문 요약)
- 토스페이먼츠 결제 연동 (주문 생성, 성공/실패 처리)
- 주문 내역 페이지
- 관리자 대시보드 (상품/주문 관리)
- 홈 페이지 및 회사소개 페이지

## 기술 스택

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Auth, DB)
- [TossPayments SDK](https://docs.tosspayments.com)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs) (장바구니 상태 관리)
- Jest + Testing Library

## 시작하기

### 1. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스페이먼츠 클라이언트 키 |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 |
| `NEXT_PUBLIC_BASE_URL` | 배포/개발 base URL |

DB 스키마는 `supabase/migrations`에 있습니다.

### 2. 의존성 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 서버 실행
- `npm run lint` — ESLint 검사
- `npx jest` — 테스트 실행

## 배포

[Vercel](https://vercel.com)에 배포하도록 구성되어 있습니다. `master` 브랜치에 push하면 자동으로 Production에 배포되고, 그 외 브랜치에 push하면 Preview 환경에 배포됩니다.

Production: https://ilsan-anyang.vercel.app
