"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";

/**
 * Mounted once at the root. Bridges Supabase auth state into the cart
 * store: when a session appears, merges the local guest cart into the
 * account's DB cart and switches to account mode; when the session ends,
 * drops back to an empty guest cart so it doesn't leak between accounts
 * sharing a browser.
 */
export default function CartAuthSync() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const { mode, syncToAccount, resetToGuest } = useCart.getState();
      if (session?.user) {
        // Deferred: this Server Action can fire mid-navigation (e.g. right
        // after a login redirect) and racing it with a pending router
        // transition can cancel that transition. See login-form.tsx.
        if (mode !== "account") setTimeout(() => syncToAccount(), 0);
      } else if (mode !== "guest") {
        resetToGuest();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
