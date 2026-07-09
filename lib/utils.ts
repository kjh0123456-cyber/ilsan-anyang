import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

const kstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
});

export function toKstDateString(date: Date): string {
  return kstDateFormatter.format(date);
}

export function toKstYearMonth(date: Date): string {
  return toKstDateString(date).slice(0, 7);
}

export function validateNewPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (password !== confirmPassword) return "비밀번호가 일치하지 않습니다.";
  return null;
}
