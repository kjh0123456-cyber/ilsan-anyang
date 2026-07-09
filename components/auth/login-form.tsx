"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Some browsers silently pre-fill the password field with a
    // previously-saved value on page load, without selecting the text the
    // way an explicit autofill-dropdown pick does. That leaves stray content
    // sitting in the field, so the next keystroke lands wherever the cursor
    // happens to be instead of replacing it. Force the field back to
    // genuinely empty right after mount; a deliberate autofill selection
    // made later by the user (via the browser's suggestion dropdown) still
    // works normally since it happens after this runs.
    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
  }, []);

  function handleSubmit(formData: FormData) {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await login(formData);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("로그인되었습니다.");
      router.push(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="hello@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-navy hover:bg-navy-light text-white"
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
