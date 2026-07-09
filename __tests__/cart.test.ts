jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  getCartItems,
  addToCartDB,
  updateCartItemQuantityDB,
  removeFromCartDB,
  clearCartDB,
  mergeGuestCartIntoAccount,
} from "@/lib/actions/cart";

const USER = { id: "u1" };

function mockAuthedSupabase() {
  const tableMocks: Record<string, unknown> = {};
  const from = jest.fn((table: string) => tableMocks[table]);
  const client = {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
    from,
  };
  (createClient as jest.Mock).mockResolvedValue(client);
  return { client, tableMocks, from };
}

describe("getCartItems", () => {
  beforeEach(() => jest.clearAllMocks());

  it("로그인하지 않았으면 빈 배열을 반환한다", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });
    expect(await getCartItems()).toEqual([]);
  });

  it("cart_items를 상품과 함께 조회해 CartItem 배열로 변환한다", async () => {
    const { tableMocks } = mockAuthedSupabase();
    const order = jest.fn().mockResolvedValue({
      data: [
        { quantity: 2, product: { id: "p1", name: "A" } },
        { quantity: 1, product: null }, // 삭제된 상품 참조는 걸러낸다
      ],
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    tableMocks.cart_items = { select };

    const result = await getCartItems();

    expect(result).toEqual([
      { product: { id: "p1", name: "A" }, quantity: 2 },
    ]);
  });
});

describe("addToCartDB", () => {
  beforeEach(() => jest.clearAllMocks());

  it("기존 수량에 더하되 재고를 넘지 않는다", async () => {
    const { tableMocks } = mockAuthedSupabase();

    const productSingle = jest.fn().mockResolvedValue({ data: { stock: 5 }, error: null });
    const productEq = jest.fn().mockReturnValue({ single: productSingle });
    const productSelect = jest.fn().mockReturnValue({ eq: productEq });

    const existingMaybeSingle = jest.fn().mockResolvedValue({ data: { quantity: 3 } });
    const existingEq2 = jest.fn().mockReturnValue({ maybeSingle: existingMaybeSingle });
    const existingEq1 = jest.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = jest.fn().mockReturnValue({ eq: existingEq1 });

    const upsert = jest.fn().mockResolvedValue({ error: null });

    tableMocks.products = { select: productSelect };
    tableMocks.cart_items = { select: existingSelect, upsert };

    await addToCartDB("p1", 4); // 3 + 4 = 7, capped at stock 5

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", product_id: "p1", quantity: 5 }),
      { onConflict: "user_id,product_id" }
    );
  });

  it("로그인하지 않았으면 에러를 던진다", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });
    await expect(addToCartDB("p1", 1)).rejects.toThrow("로그인이 필요합니다.");
  });
});

describe("updateCartItemQuantityDB", () => {
  beforeEach(() => jest.clearAllMocks());

  it("수량이 1 미만이면 행을 삭제한다", async () => {
    const { tableMocks } = mockAuthedSupabase();
    const deleteEq2 = jest.fn().mockResolvedValue({ error: null });
    const deleteEq1 = jest.fn().mockReturnValue({ eq: deleteEq2 });
    const del = jest.fn().mockReturnValue({ eq: deleteEq1 });
    tableMocks.cart_items = { delete: del };

    await updateCartItemQuantityDB("p1", 0);

    expect(del).toHaveBeenCalled();
    expect(deleteEq1).toHaveBeenCalledWith("user_id", "u1");
    expect(deleteEq2).toHaveBeenCalledWith("product_id", "p1");
  });

  it("재고보다 많이 요청하면 재고만큼만 저장한다", async () => {
    const { tableMocks } = mockAuthedSupabase();
    const productSingle = jest.fn().mockResolvedValue({ data: { stock: 2 } });
    const productEq = jest.fn().mockReturnValue({ single: productSingle });
    const productSelect = jest.fn().mockReturnValue({ eq: productEq });
    const upsert = jest.fn().mockResolvedValue({ error: null });

    tableMocks.products = { select: productSelect };
    tableMocks.cart_items = { upsert };

    await updateCartItemQuantityDB("p1", 10);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 2 }),
      { onConflict: "user_id,product_id" }
    );
  });
});

describe("removeFromCartDB / clearCartDB", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removeFromCartDB는 해당 상품 행만 삭제한다", async () => {
    const { tableMocks } = mockAuthedSupabase();
    const eq2 = jest.fn().mockResolvedValue({ error: null });
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const del = jest.fn().mockReturnValue({ eq: eq1 });
    tableMocks.cart_items = { delete: del };

    await removeFromCartDB("p1");

    expect(eq1).toHaveBeenCalledWith("user_id", "u1");
    expect(eq2).toHaveBeenCalledWith("product_id", "p1");
  });

  it("clearCartDB는 사용자의 모든 장바구니 행을 삭제한다", async () => {
    const { tableMocks } = mockAuthedSupabase();
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    tableMocks.cart_items = { delete: del };

    await clearCartDB();

    expect(eq).toHaveBeenCalledWith("user_id", "u1");
  });
});

describe("mergeGuestCartIntoAccount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("빈 배열이면 아무 것도 하지 않는다", async () => {
    const { from } = mockAuthedSupabase();
    await mergeGuestCartIntoAccount([]);
    expect(from).not.toHaveBeenCalled();
  });

  it("기존 수량과 합치되 재고를 넘지 않게, 삭제된 상품은 건너뛴다", async () => {
    const { tableMocks } = mockAuthedSupabase();

    const productsIn = jest
      .fn()
      .mockResolvedValue({ data: [{ id: "p1", stock: 3 }] }); // p2는 더 이상 존재하지 않음
    const productsSelect = jest.fn().mockReturnValue({ in: productsIn });

    const existingIn = jest.fn().mockResolvedValue({
      data: [{ product_id: "p1", quantity: 1 }],
    });
    const existingEq = jest.fn().mockReturnValue({ in: existingIn });
    const existingSelect = jest.fn().mockReturnValue({ eq: existingEq });

    const upsert = jest.fn().mockResolvedValue({ error: null });

    tableMocks.products = { select: productsSelect };
    tableMocks.cart_items = { select: existingSelect, upsert };

    await mergeGuestCartIntoAccount([
      { productId: "p1", quantity: 5 }, // 1 + 5 = 6, capped at stock 3
      { productId: "p2", quantity: 2 }, // no longer exists — skipped
    ]);

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: "p1", quantity: 3 }),
      { onConflict: "user_id,product_id" }
    );
  });
});
