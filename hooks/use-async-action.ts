"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type ActionResult = { error?: string } | void | undefined;

interface AsyncActionOptions<T extends ActionResult> {
  successMessage?: string | ((result: T) => string);
  errorMessage?: string;
  onSuccess?: (result: T) => void;
}

/**
 * Wraps any async action (typically a Server Action) with pending state and
 * automatic success/error toast feedback. Understands two failure shapes:
 * a thrown Error, or a resolved `{ error: string }` object.
 */
export function useAsyncAction<T extends ActionResult>(
  action: () => Promise<T>,
  options: AsyncActionOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const result = await action();

        if (result && typeof result === "object" && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }

        if (options.successMessage) {
          const message =
            typeof options.successMessage === "function"
              ? options.successMessage(result as T)
              : options.successMessage;
          toast.success(message);
        }

        options.onSuccess?.(result as T);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : options.errorMessage ?? "요청 처리 중 오류가 발생했습니다."
        );
      }
    });
  }

  return { run, isPending };
}
