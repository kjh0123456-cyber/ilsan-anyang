"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { AnimationEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/actions/auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Chrome (and some other browsers) can silently pre-fill a saved
// email/password on page load without selecting the text the way an
// explicit autofill-dropdown pick does. That leaves stray content sitting
// in the field, so the next keystroke lands wherever the cursor happens to
// be instead of replacing it. `animationstart` (paired with the
// `.autofill-detect` CSS in globals.css) fires the instant the browser
// autofills a field, no matter when that happens — so we select the
// autofilled text right then, guaranteeing the next keystroke replaces it
// instead of appending. Clearing on mount only catches the earliest,
// synchronous case; this catches autofill at any point.
function selectOnAutofill(e: AnimationEvent<HTMLInputElement>) {
  if (e.animationName === "onAutoFill") {
    e.currentTarget.select();
  }
}

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
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
      // Deferred: calling this Server Action synchronously alongside
      // router.push() races with (and can cancel) the pending navigation,
      // stranding the user on the login page. Firing it next tick lets the
      // push commit first.
      setTimeout(() => useCart.getState().syncToAccount(), 0);
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
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="hello@example.com"
          className="autofill-detect"
          onAnimationStart={selectOnAutofill}
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
          className="autofill-detect"
          onAnimationStart={selectOnAutofill}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gold hover:bg-gold-light text-white"
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
