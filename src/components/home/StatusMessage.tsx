import type { TransferStatus } from "@/types/transfer";

type StatusMessageProps = {
  status: TransferStatus;
  message: string | null;
};

const styles: Record<Exclude<TransferStatus, "idle">, string> = {
  loading: "border-celo-yellow bg-celo-black text-celo-yellow",
  success: "border-celo-green bg-celo-green text-celo-black",
  error: "border-red-300 bg-red-300 text-celo-black",
};

export function StatusMessage({ status, message }: StatusMessageProps) {
  if (status === "idle" || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`border-2 px-3 py-3 font-mono text-[11px] font-bold uppercase leading-relaxed ${styles[status]}`}
    >
      {status === "loading" ? (
        <span className="flex items-center gap-2">
          <span className="size-2 animate-pulse bg-current" aria-hidden />
          {message}
        </span>
      ) : (
        message
      )}
    </div>
  );
}
