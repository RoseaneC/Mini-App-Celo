"use client";

import { useMemo, useState } from "react";
import type { RegistryStatus, PaymentReceiptData } from "@/types/transfer";

type PaymentReceiptProps = {
  receipt: PaymentReceiptData;
  registryStatus: RegistryStatus;
  registryTxHash: `0x${string}` | null;
  registryExplorerUrl: string | null;
};

function shortenAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenHash(hash: `0x${string}`): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function receiptIdFromHash(hash: `0x${string}`): string {
  return `INAPAY-${hash.slice(2, 7).toUpperCase()}`;
}

function formatReceiptDate(value: string): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return formatted.replace(", ", " às ");
}

export function PaymentReceipt({
  receipt,
  registryStatus,
  registryTxHash,
  registryExplorerUrl,
}: PaymentReceiptProps) {
  const [copyLabel, setCopyLabel] = useState("Copiar comprovante");
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const receiptId = receiptIdFromHash(registryTxHash ?? receipt.paymentHash);
  const registryRegistered = registryStatus === "success" && registryTxHash;
  const registryFailed = registryStatus === "error";
  const registryPending = registryStatus === "loading";
  const statusText = registryRegistered
    ? "Pagamento confirmado e comprovante registrado."
    : registryFailed
      ? "Pagamento confirmado. Registro on-chain do comprovante não foi salvo."
      : registryPending
        ? "Pagamento confirmado. Registrando comprovante on-chain..."
        : "Pagamento confirmado na Celo Mainnet.";

  const shareText = useMemo(
    () =>
      [
        "Pagamento realizado via In\u00e1Pay",
        `Valor: ${receipt.amount} ${receipt.tokenSymbol}`,
        `Destino: ${receipt.recipient}`,
        "Rede: Celo Mainnet",
        `Comprovante: ${receiptId}`,
        `Pagamento: ${receipt.paymentExplorerUrl}`,
        `Registro: ${registryExplorerUrl ?? "não registrado"}`,
      ].join("\n"),
    [receipt, receiptId, registryExplorerUrl],
  );

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyLabel("Comprovante copiado");
      window.setTimeout(() => setCopyLabel("Copiar comprovante"), 1800);
    } catch {
      setCopyLabel("Não foi possível copiar");
      window.setTimeout(() => setCopyLabel("Copiar comprovante"), 1800);
    }
  }

  async function shareReceipt() {
    if (!canShare || !navigator.share) return;

    try {
      await navigator.share({
        title: "Comprovante In\u00e1Pay",
        text: shareText,
      });
    } catch {
      return;
    }
  }

  return (
    <section className="border-2 border-celo-green bg-celo-white text-celo-black">
      <div className="grid grid-cols-[1fr_auto] border-b-2 border-celo-black">
        <div className="px-3 py-3">
          <p className="font-mono text-[10px] font-black uppercase text-celo-black/60">
            comprovante visual
          </p>
          <h3 className="mt-1 text-3xl font-black uppercase leading-none">
            Pagamento realizado
          </h3>
        </div>
        <div className="flex items-center border-l-2 border-celo-black bg-celo-yellow px-3 font-mono text-[10px] font-black uppercase">
          {receiptId}
        </div>
      </div>

      <div className="space-y-4 px-3 py-4">
        <div className="border-b border-celo-black/20 pb-4">
          <p className="font-mono text-[10px] font-black uppercase text-celo-black/60">
            Status
          </p>
          <p className="mt-1 text-lg font-black uppercase leading-tight">
            Confirmado na Celo Mainnet
          </p>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase leading-relaxed text-celo-black/70">
            {statusText}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[10px] font-black uppercase text-celo-black/55">
              Valor
            </p>
            <p className="mt-1 text-2xl font-black uppercase leading-none">
              {receipt.amount} {receipt.tokenSymbol}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-black uppercase text-celo-black/55">
              Destinatário
            </p>
            <p className="mt-1 font-mono text-sm font-black">
              {shortenAddress(receipt.recipient)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-celo-black/20 py-3">
          <div>
            <p className="font-mono text-[10px] font-black uppercase text-celo-black/55">
              Data
            </p>
            <p className="mt-1 font-mono text-xs font-bold">
              {formatReceiptDate(receipt.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-black uppercase text-celo-black/55">
              Registro on-chain
            </p>
            <p className="mt-1 font-mono text-xs font-bold">
              {registryRegistered
                ? "Comprovante registrado on-chain"
                : registryPending
                  ? "Registro em andamento"
                  : registryFailed
                    ? "Registro não salvo"
                    : "Aguardando registro"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void copyReceipt()}
            className="border-2 border-celo-black bg-celo-black px-3 py-3 text-sm font-black uppercase text-celo-white transition-colors hover:bg-celo-yellow hover:text-celo-black"
          >
            {copyLabel}
          </button>
          {canShare ? (
            <button
              type="button"
              onClick={() => void shareReceipt()}
              className="border-2 border-celo-black bg-celo-white px-3 py-3 text-sm font-black uppercase text-celo-black transition-colors hover:bg-celo-black hover:text-celo-white"
            >
              Compartilhar
            </button>
          ) : null}
        </div>

        <details className="border-t-2 border-celo-black pt-3">
          <summary className="cursor-pointer font-mono text-[10px] font-black uppercase">
            Detalhes blockchain
          </summary>
          <div className="mt-3 space-y-3 font-mono text-[11px] font-bold">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <span className="uppercase text-celo-black/55">Pagamento</span>
              <span className="min-w-0 text-right">
                {shortenHash(receipt.paymentHash)}
              </span>
            </div>
            <a
              href={receipt.paymentExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-right underline"
            >
              Ver pagamento no Celoscan
            </a>

            {registryTxHash && registryExplorerUrl ? (
              <>
                <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-celo-black/20 pt-3">
                  <span className="uppercase text-celo-black/55">
                    Registro
                  </span>
                  <span className="min-w-0 text-right">
                    {shortenHash(registryTxHash)}
                  </span>
                </div>
                <a
                  href={registryExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-right underline"
                >
                  Ver comprovante no Celoscan
                </a>
              </>
            ) : (
              <p className="border-t border-celo-black/20 pt-3 text-right uppercase text-celo-black/60">
                Comprovante ainda sem hash de registro.
              </p>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
