"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAsyncAction } from "@/hooks/use-async-action";
import type { ComponentProps, ReactNode } from "react";

type ActionResult = { error?: string } | void | undefined;

interface AsyncButtonProps<T extends ActionResult>
  extends Omit<ComponentProps<typeof Button>, "onClick" | "children"> {
  action: () => Promise<T>;
  children: ReactNode;
  pendingLabel?: ReactNode;
  successMessage?: string | ((result: T) => string);
  errorMessage?: string;
  onSuccess?: (result: T) => void;
  /** If set, shows a native confirm() dialog before running the action. */
  confirmMessage?: string;
}

/**
 * A Button that runs a server action (or any async function) with automatic
 * pending state (disabled + spinner) and success/error toast feedback.
 * Use this for any button that talks to the server so every such button in
 * the app behaves consistently.
 */
export default function AsyncButton<T extends ActionResult>({
  action,
  children,
  pendingLabel,
  successMessage,
  errorMessage,
  onSuccess,
  confirmMessage,
  disabled,
  ...props
}: AsyncButtonProps<T>) {
  const { run, isPending } = useAsyncAction(action, {
    successMessage,
    errorMessage,
    onSuccess,
  });

  function handleClick() {
    if (confirmMessage && !confirm(confirmMessage)) return;
    run();
  }

  return (
    <Button
      type="button"
      disabled={disabled || isPending}
      onClick={handleClick}
      {...props}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "처리 중..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
