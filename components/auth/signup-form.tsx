"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { signup } from "@/lib/actions/auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (isPending) return;
    setError(null);

    // Sent along so the server action can merge the guest cart into the
    // account in the same request as the redirect, instead of a separate
    // client-side call afterward (which raced the navigation — see auth.ts).
    const { mode, items, clearCart } = useCart.getState();
    const guestSnapshot = mode === "guest" ? items : [];
    if (guestSnapshot.length > 0) {
      formData.set(
        "guestCart",
        JSON.stringify(
          guestSnapshot.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
        )
      );
      // Optimistically clear so a later account-mode sync doesn't merge
      // these same items in again on top of the server-side merge above.
      // Restored below if signup didn't end up redirecting (error, or
      // needs-confirmation with no session yet).
      clearCart();
    }

    startTransition(async () => {
      // signup() redirects when it creates a session immediately, so
      // reaching this line means either an error or needs-confirmation.
      const result = await signup(formData);

      if (!result.success) {
        if (guestSnapshot.length > 0) useCart.setState({ items: guestSnapshot });
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if (guestSnapshot.length > 0) useCart.setState({ items: guestSnapshot });
      setNeedsConfirmation(true);
      toast.success("가입 신청이 완료되었습니다.");
    });
  }

  if (needsConfirmation) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <p className="text-navy font-medium">가입 신청이 완료되었습니다.</p>
        <p className="text-sm text-muted-foreground">
          이메일로 발송된 인증 링크를 클릭하면 로그인할 수 있어요.
        </p>
      </div>
    );
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
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="8자 이상"
          minLength={8}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gold hover:bg-gold-light text-white"
      >
        {isPending ? "가입 처리 중..." : "가입하기"}
      </Button>
    </form>
  );
}
