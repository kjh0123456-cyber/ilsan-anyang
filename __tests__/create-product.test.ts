jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
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

// select().eq().eq().eq().gte().limit().maybeSingle() — every intermediate
// call just returns the same chain object, only maybeSingle() resolves.
function makeQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  for (const method of ["select", "eq", "gte", "limit"]) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
  chain.maybeSingle = jest.fn().mockResolvedValue(result);
  return chain;
}

function mockSupabase({
  duplicate = null,
  insertResult,
}: {
  duplicate?: { id: string } | null;
  insertResult: { error: unknown };
}) {
  const queryChain = makeQueryChain({ data: duplicate, error: null });
  const insert = jest.fn().mockResolvedValue(insertResult);
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({ ...queryChain, insert }),
  });
  return { insert, queryChain };
}

describe("createProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("상품명이 비어있으면 에러를 반환한다", async () => {
    mockSupabase({ insertResult: { error: null } });
    const result = await createProduct(buildFormData({ name: "" }));
    expect(result).toEqual({ error: "상품명을 입력해주세요." });
  });

  it("가격이 올바르지 않으면 에러를 반환한다", async () => {
    mockSupabase({ insertResult: { error: null } });
    const result = await createProduct(buildFormData({ price: "-100" }));
    expect(result).toEqual({ error: "가격을 올바르게 입력해주세요." });
  });

  it("재고가 올바르지 않으면 에러를 반환한다", async () => {
    mockSupabase({ insertResult: { error: null } });
    const result = await createProduct(buildFormData({ stock: "abc" }));
    expect(result).toEqual({ error: "재고를 올바르게 입력해주세요." });
  });

  it("카테고리가 유효하지 않으면 에러를 반환한다", async () => {
    mockSupabase({ insertResult: { error: null } });
    const result = await createProduct(buildFormData({ category: "invalid" }));
    expect(result).toEqual({ error: "카테고리를 선택해주세요." });
  });

  it("짧은 시간 내 동일한 상품(이름/가격/카테고리)이 이미 등록됐으면 중복 등록을 막는다", async () => {
    const { insert } = mockSupabase({
      duplicate: { id: "existing-id" },
      insertResult: { error: null },
    });

    const result = await createProduct(buildFormData());

    expect(result).toEqual({
      error: "방금 동일한 상품이 등록되었습니다. 중복 등록을 방지했습니다.",
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("DB 저장이 실패하면 에러를 반환한다", async () => {
    mockSupabase({ insertResult: { error: { message: "db error" } } });
    const result = await createProduct(buildFormData());
    expect(result).toEqual({ error: "상품 등록에 실패했습니다." });
  });

  it("유효한 입력이면 상품을 저장하고 성공을 반환한다", async () => {
    const { insert } = mockSupabase({ insertResult: { error: null } });

    const result = await createProduct(buildFormData());

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
    expect(result).toEqual({ success: true });
  });
});
