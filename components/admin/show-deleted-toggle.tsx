"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ShowDeletedToggle({ checked }: { checked: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("showDeleted", "1");
    } else {
      params.delete("showDeleted");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4"
      />
      삭제된 상품 보기
    </label>
  );
}
