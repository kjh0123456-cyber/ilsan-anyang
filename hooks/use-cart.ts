import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { CartItem, Product } from "@/lib/types";
import {
  getCartItems,
  addToCartDB,
  updateCartItemQuantityDB,
  removeFromCartDB,
  clearCartDB,
  mergeGuestCartIntoAccount,
} from "@/lib/actions/cart";

type CartMode = "guest" | "account";

// Supabase can emit more than one auth event for the same sign-in (e.g. two
// INITIAL_SESSION events from a double-invoked effect in dev). Without this,
// two concurrent syncToAccount() calls would both read the pre-merge guest
// cart and each upsert their own +quantity, doubling item counts.
let syncInFlight: Promise<void> | null = null;

interface CartStore {
  items: CartItem[];
  mode: CartMode;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  /** Called once by CartAuthSync when a session is found: loads the DB
   *  cart, merging in whatever was in the local guest cart at that moment. */
  syncToAccount: () => Promise<void>;
  /** Called by CartAuthSync on sign-out: cart doesn't carry over to
   *  whoever uses the browser next. */
  resetToGuest: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      mode: "guest",

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + quantity,
                        product.stock
                      ),
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });

        if (get().mode === "account") {
          addToCartDB(product.id, quantity).catch(() => {
            toast.error("장바구니 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.");
          });
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));

        if (get().mode === "account") {
          removeFromCartDB(productId).catch(() => {
            toast.error("장바구니 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.");
          });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));

        if (get().mode === "account") {
          updateCartItemQuantityDB(productId, quantity).catch(() => {
            toast.error("장바구니 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.");
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
        if (get().mode === "account") {
          clearCartDB().catch(() => {
            toast.error("장바구니 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.");
          });
        }
      },

      total: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      syncToAccount: () => {
        if (syncInFlight) return syncInFlight;
        syncInFlight = (async () => {
          const guestItems = get().items;
          try {
            if (guestItems.length > 0) {
              await mergeGuestCartIntoAccount(
                guestItems.map((i) => ({
                  productId: i.product.id,
                  quantity: i.quantity,
                }))
              );
            }
            const accountItems = await getCartItems();
            set({ items: accountItems, mode: "account" });
          } catch {
            toast.error("장바구니를 불러오지 못했습니다.");
            set({ mode: "account" });
          } finally {
            syncInFlight = null;
          }
        })();
        return syncInFlight;
      },

      resetToGuest: () => {
        set({ items: [], mode: "guest" });
      },
    }),
    {
      name: "ilsan-anyang-cart",
      // Only the guest cart needs to survive a reload from localStorage —
      // once synced to an account, the DB is the source of truth and
      // `mode`/account `items` are re-derived fresh on every load anyway.
      partialize: (state) =>
        state.mode === "guest" ? { items: state.items } : { items: [] },
    }
  )
);
