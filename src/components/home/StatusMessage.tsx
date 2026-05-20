import type { TransferStatus } from "@/types/transfer";

type StatusMessageProps = {
  status: TransferStatus;
  message: string | null;
};

const styles: Record<Exclude<TransferStatus, "idle">, string> = {
  loading:
    "border-celo-yellow/35 bg-celo-yellow/10 text-celo-yellow",
  success:
    "border-celo-green/35 bg-celo-green/10 text-celo-green",
  error: "border-red-400/35 bg-red-500/10 text-red-200",
};

export function StatusMessage({ status, message }: StatusMessageProps) {
  if (status === "idle" || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3.5 text-sm font-medium ${styles[status]}`}
    >
      {status === "loading" ? (
        <span className="flex items-center gap-2.5">
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          {message}
        </span>
      ) : (
        message
      )}
    </div>
  );
}
