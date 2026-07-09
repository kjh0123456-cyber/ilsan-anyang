"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const redirectTo = (formData.get("redirect") as string) || "/";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  return { success: true as const, redirectTo };
}

export async function signup(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const redirectTo = (formData.get("redirect") as string) || "/";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      return {
        error: "요청이 많아 이메일 발송이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
      };
    }
    if (error.code === "user_already_exists") {
      return { error: "이미 사용 중인 이메일입니다." };
    }
    return { error: "회원가입에 실패했습니다." };
  }

  // Supabase 프로젝트에서 이메일 인증이 켜져 있으면 signUp()이 세션 없이
  // 사용자만 생성한다 — 이 경우 곧바로 로그인된 상태가 아니므로 클라이언트가
  // 구분해서 안내할 수 있도록 알려준다.
  return { success: true as const, redirectTo, hasSession: !!data.session };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function requestPasswordReset(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  if (!email) return { error: "이메일을 입력해주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
  });

  if (error) return { error: "재설정 링크 발송에 실패했습니다." };

  return { success: true };
}
