jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct } from "@/lib/actions/products";

function buildFormData(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    name: "루미봇 X2 로봇청소기",
    description: "강력한 흡입력",
    price: "890000",
    stock: "50",
    category: "vacuum",
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

(createAdminClient as jest.Mock).mockReturnValue({
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "" } }),
    }),
  },
});

function mockSupabaseInsert(result: { error: unknown }) {
  const insert = jest.fn().mockResolvedValue(result);
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({ insert }),
  });
  return insert;
}

describe("createProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("상품명이 비어있으면 에러를 반환한다", async () => {
    mockSupabaseInsert({ error: null });
    const result = await createProduct(buildFormData({ name: "" }));
    expect(result).toEqual({ error: "상품명을 입력해주세요." });
  });

  it("가격이 올바르지 않으면 에러를 반환한다", async () => {
    mockSupabaseInsert({ error: null });
    const result = await createProduct(buildFormData({ price: "-100" }));
    expect(result).toEqual({ error: "가격을 올바르게 입력해주세요." });
  });

  it("재고가 올바르지 않으면 에러를 반환한다", async () => {
    mockSupabaseInsert({ error: null });
    const result = await createProduct(buildFormData({ stock: "abc" }));
    expect(result).toEqual({ error: "재고를 올바르게 입력해주세요." });
  });

  it("카테고리가 유효하지 않으면 에러를 반환한다", async () => {
    mockSupabaseInsert({ error: null });
    const result = await createProduct(buildFormData({ category: "invalid" }));
    expect(result).toEqual({ error: "카테고리를 선택해주세요." });
  });

  it("DB 저장이 실패하면 에러를 반환한다", async () => {
    mockSupabaseInsert({ error: { message: "db error" } });
    const result = await createProduct(buildFormData());
    expect(result).toEqual({ error: "상품 등록에 실패했습니다." });
  });

  it("유효한 입력이면 상품을 저장하고 목록 페이지로 리다이렉트한다", async () => {
    const insert = mockSupabaseInsert({ error: null });

    await createProduct(buildFormData());

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "루미봇 X2 로봇청소기",
        description: "강력한 흡입력",
        price: 890000,
        stock: 50,
        category: "vacuum",
        images: [],
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(redirect).toHaveBeenCalledWith("/admin/products");
  });
});
