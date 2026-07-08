import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";
  const errorMessage = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg border border-gray-100 w-full max-w-md">
        <h1 className="text-xl font-bold text-navy mb-2">로그인</h1>
        <p className="text-sm text-muted-foreground mb-6">
          일산안양 계정으로 로그인하세요
        </p>
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}
        <form action={login} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="hello@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-navy hover:bg-navy-light text-white"
          >
            로그인
          </Button>
        </form>
        <p className="text-sm text-center mt-4 text-muted-foreground">
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
