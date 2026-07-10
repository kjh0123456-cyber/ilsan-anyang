"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { AnimationEvent, FocusEvent } from "react";
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

// Defense in depth: the animationstart trick above only fires for the one
// browser-internal transition it's watching for. Any other route stray text
// reaches the field — most notably the page being restored from the
// browser's back/forward cache, which resumes the DOM exactly as it was
// frozen without re-running mount effects or a fresh autofill — slips past
// it, and the field is left with unselected leftover text. Selecting
// on focus fixes the actual symptom directly (whatever is in the field
// gets highlighted the moment the user clicks in, so typing replaces it)
// without needing to know why it was there.
function selectAllOnFocus(e: FocusEvent<HTMLInputElement>) {
  e.currentTarget.select();
}

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";

    // Restoring from the back/forward cache resumes the page exactly as it
    // was frozen, without re-running mount effects — so a value left in the
    // fields before navigating away would otherwise survive a bfcache
    // restore untouched.
    function handlePageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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
      // Restored below if login turns out to have failed.
      clearCart();
    }

    startTransition(async () => {
      // login() redirects on success, so reaching this line means it failed.
      const result = await login(formData);
      if (guestSnapshot.length > 0) {
        useCart.setState({ items: guestSnapshot });
      }
      setError(result.error);
      toast.error(result.error);
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
          onFocus={selectAllOnFocus}
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
          onFocus={selectAllOnFocus}
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
