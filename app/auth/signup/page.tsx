import SignupForm from "@/components/auth/signup-form";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";
  const loginHref =
    redirectTo === "/"
      ? "/auth/login"
      : `/auth/login?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg border border-gray-100 w-full max-w-md">
        <h1 className="text-xl font-bold text-navy mb-2">회원가입</h1>
        <p className="text-sm text-muted-foreground mb-6">
          일산안양 스마트홈 멤버가 되어보세요
        </p>

        <SignupForm redirectTo={redirectTo} />

        <p className="text-sm text-center mt-4 text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link href={loginHref} className="text-navy font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
