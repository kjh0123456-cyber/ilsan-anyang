import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제가 취소되었습니다.",
  PAY_PROCESS_ABORTED: "결제가 중단되었습니다.",
  REJECT_CARD_COMPANY:
    "카드사에서 결제를 거부했습니다. 다른 카드를 사용해주세요.",
};

export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const params = await searchParams;
  const message =
    (params.code && ERROR_MESSAGES[params.code]) ||
    params.message ||
    "결제 중 오류가 발생했습니다.";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-navy">결제에 실패했습니다</h1>
        <p className="text-muted-foreground">{message}</p>
        <Link href="/cart">
          <Button className="bg-navy hover:bg-navy-light text-white">
            장바구니로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
