import type { CartItem } from "@/lib/types";

jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn(),
  sendAdminOrderNotificationEmail: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
} from "@/lib/email";
import { createOrder } from "@/lib/actions/orders";

const mockItems: CartItem[] = [
  {
    product: {
      id: "p1",
      name: "무선 청소기",
      description: "",
      price: 100000,
      stock: 10,
      category: "vacuum",
      images: [],
      specs: {},
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
    },
    quantity: 2,
  },
];

function buildSupabaseMock({
  user,
  orderInsertResult,
  itemsInsertResult,
}: {
  user: { id: string; email: string } | null;
  orderInsertResult: { data: { id: string } | null; error: unknown };
  itemsInsertResult: { error: unknown };
}) {
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    from: jest.fn((table: string) => {
      if (table === "orders") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue(orderInsertResult),
            }),
          }),
        };
      }
      if (table === "order_items") {
        return { insert: jest.fn().mockResolvedValue(itemsInsertResult) };
      }
      throw new Error(`unexpected table ${table}`);
    }),
  };
}

const payment = { tossOrderId: "toss-order-1", paymentKey: "payment-key-1" };

describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;
  });

  it("토스 결제 승인을 먼저 확인한 뒤 주문을 생성하고 구매자와 관리자에게 이메일을 발송한다", async () => {
    const supabaseMock = buildSupabaseMock({
      user: { id: "u1", email: "buyer@test.com" },
      orderInsertResult: { data: { id: "order-1" }, error: null },
      itemsInsertResult: { error: null },
    });
    (createClient as jest.Mock).mockResolvedValue(supabaseMock);

    const orderId = await createOrder(mockItems, 200000, payment);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.tosspayments.com/v1/payments/confirm",
      expect.objectContaining({ method: "POST" })
    );

    expect(orderId).toBe("order-1");
    expect(sendOrderConfirmationEmail).toHaveBeenCalledWith(
      "buyer@test.com",
      expect.objectContaining({ orderId: "order-1", totalAmount: 200000 })
    );
    expect(sendAdminOrderNotificationEmail).toHaveBeenCalledWith(
      "buyer@test.com",
      expect.objectContaining({ orderId: "order-1", totalAmount: 200000 })
    );
  });

  it("이메일 발송이 실패해도 주문 생성 자체는 성공한다", async () => {
    const supabaseMock = buildSupabaseMock({
      user: { id: "u1", email: "buyer@test.com" },
      orderInsertResult: { data: { id: "order-2" }, error: null },
      itemsInsertResult: { error: null },
    });
    (createClient as jest.Mock).mockResolvedValue(supabaseMock);
    (sendOrderConfirmationEmail as jest.Mock).mockRejectedValue(
      new Error("send fail")
    );
    (sendAdminOrderNotificationEmail as jest.Mock).mockRejectedValue(
      new Error("send fail")
    );
    jest.spyOn(console, "error").mockImplementation(() => {});

    const orderId = await createOrder(mockItems, 200000, payment);

    expect(orderId).toBe("order-2");
  });

  it("토스 결제 승인이 실패하면 주문을 생성하지 않고 에러를 던진다", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "카드 승인 거절" }),
    }) as unknown as typeof fetch;
    const supabaseMock = buildSupabaseMock({
      user: { id: "u1", email: "buyer@test.com" },
      orderInsertResult: { data: { id: "order-3" }, error: null },
      itemsInsertResult: { error: null },
    });
    (createClient as jest.Mock).mockResolvedValue(supabaseMock);

    await expect(createOrder(mockItems, 200000, payment)).rejects.toThrow(
      "카드 승인 거절"
    );
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});
