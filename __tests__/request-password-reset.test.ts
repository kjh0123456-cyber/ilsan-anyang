jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { requestPasswordReset } from "@/lib/actions/auth";

function mockSupabase(result: { error: unknown }) {
  const resetPasswordForEmail = jest.fn().mockResolvedValue(result);
  (createClient as jest.Mock).mockResolvedValue({
    auth: { resetPasswordForEmail },
  });
  return resetPasswordForEmail;
}

function buildFormData(email: string) {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("requestPasswordReset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("이메일이 비어있으면 에러를 반환한다", async () => {
    mockSupabase({ error: null });
    const result = await requestPasswordReset(buildFormData(""));
    expect(result).toEqual({ error: "이메일을 입력해주세요." });
  });

  it("이메일이 유효하면 재설정 링크를 요청하고 성공을 반환한다", async () => {
    const resetPasswordForEmail = mockSupabase({ error: null });

    const result = await requestPasswordReset(
      buildFormData("kjh0123456@gmail.com")
    );

    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      "kjh0123456@gmail.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/reset-password"),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it("Supabase 요청이 실패하면 에러를 반환한다", async () => {
    mockSupabase({ error: { message: "fail" } });
    const result = await requestPasswordReset(
      buildFormData("kjh0123456@gmail.com")
    );
    expect(result).toEqual({ error: "재설정 링크 발송에 실패했습니다." });
  });
});
