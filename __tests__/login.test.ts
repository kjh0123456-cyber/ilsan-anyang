jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { login } from "@/lib/actions/auth";

function mockSupabase(result: { error: unknown }) {
  const signInWithPassword = jest.fn().mockResolvedValue(result);
  (createClient as jest.Mock).mockResolvedValue({
    auth: { signInWithPassword },
  });
  return signInWithPassword;
}

function buildFormData(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    email: "buyer@test.com",
    password: "password1",
    redirect: "/admin",
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

describe("login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("이메일이 비어있으면 에러를 반환한다", async () => {
    const result = await login(buildFormData({ email: "" }));
    expect(result).toEqual({ error: "이메일과 비밀번호를 입력해주세요." });
  });

  it("비밀번호가 비어있으면 에러를 반환한다", async () => {
    const result = await login(buildFormData({ password: "" }));
    expect(result).toEqual({ error: "이메일과 비밀번호를 입력해주세요." });
  });

  it("인증에 실패하면 에러를 반환한다", async () => {
    mockSupabase({ error: { message: "invalid" } });
    const result = await login(buildFormData());
    expect(result).toEqual({
      error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    });
  });

  it("인증에 성공하면 redirect 파라미터로 이동할 성공 결과를 반환한다", async () => {
    const signInWithPassword = mockSupabase({ error: null });

    const result = await login(buildFormData());

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "buyer@test.com",
      password: "password1",
    });
    expect(result).toEqual({ success: true, redirectTo: "/admin" });
  });

  it("redirect 파라미터가 없으면 기본값 '/'로 이동한다", async () => {
    mockSupabase({ error: null });
    const result = await login(buildFormData({ redirect: "" }));
    expect(result).toEqual({ success: true, redirectTo: "/" });
  });
});
