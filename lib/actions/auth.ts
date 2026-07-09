"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent("이메일 또는 비밀번호가 올바르지 않습니다.")}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("회원가입에 실패했습니다. 이미 사용 중인 이메일입니다.")}`
    );
  }

  redirect("/");
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

export async function requestPasswordReset(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  if (!email) return { error: "이메일을 입력해주세요." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
    },
  });

  // 존재하지 않는 이메일이어도 성공으로 응답해 이메일 존재 여부가 노출되지 않도록 한다.
  if (error) {
    if (error.code === "user_not_found") return { success: true };
    return { error: "재설정 링크 발송에 실패했습니다." };
  }

  try {
    await sendPasswordResetEmail(email, data.properties.action_link);
  } catch {
    return { error: "재설정 링크 발송에 실패했습니다." };
  }

  return { success: true };
}
