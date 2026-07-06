"use server";

import { createClient } from "@/lib/supabase/server";
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
