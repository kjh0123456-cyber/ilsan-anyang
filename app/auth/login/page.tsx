import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg border border-gray-100 w-full max-w-md">
        <h1 className="text-xl font-bold text-navy mb-2">로그인</h1>
        <p className="text-sm text-muted-foreground mb-6">
          일산안양 계정으로 로그인하세요
        </p>

        <LoginForm redirectTo={redirectTo} />

        <p className="text-sm text-center mt-3">
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href="/auth/signup"
            className="text-navy font-medium hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
