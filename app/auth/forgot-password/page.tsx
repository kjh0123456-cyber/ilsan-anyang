"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await requestPasswordReset(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg border border-gray-100 w-full max-w-md">
        <h1 className="text-xl font-bold text-navy mb-2">비밀번호 찾기</h1>
        <p className="text-sm text-muted-foreground mb-6">
          가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다
        </p>

        {sent ? (
          <p className="text-sm text-navy">
            재설정 링크를 이메일로 발송했습니다. 메일함을 확인해주세요.
          </p>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            <form action={handleSubmit} className="space-y-4">
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
              <Button
                type="submit"
                className="w-full bg-navy hover:bg-navy-light text-white"
              >
                재설정 링크 보내기
              </Button>
            </form>
          </>
        )}

        <p className="text-sm text-center mt-4 text-muted-foreground">
          <Link href="/auth/login" className="text-navy font-medium hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
