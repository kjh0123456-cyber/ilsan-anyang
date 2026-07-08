import type { CartItem } from "@/lib/types";

jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
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

describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("주문 생성 성공 시 구매자와 관리자에게 이메일을 발송한다", async () => {
    const supabaseMock = buildSupabaseMock({
      user: { id: "u1", email: "buyer@test.com" },
      orderInsertResult: { data: { id: "order-1" }, error: null },
      itemsInsertResult: { error: null },
    });
    (createClient as jest.Mock).mockResolvedValue(supabaseMock);

    const orderId = await createOrder(mockItems, 200000);

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

    const orderId = await createOrder(mockItems, 200000);

    expect(orderId).toBe("order-2");
  });
});
