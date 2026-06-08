"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { WalletConnectionState } from "@/types/transfer";

type ReceivePanelProps = {
  wallet: WalletConnectionState;
};

const INAPAY_NAME = "In\u00e1Pay";
const ACCOUNT_TITLE = "Sua Conta In\u00e1Pay";
const COPY_LABEL = "Copiar endere\u00e7o";
const COPY_SUCCESS = "Endere\u00e7o copiado.";
const SHARE_UNAVAILABLE = "Texto copiado para compartilhar.";

function shortenAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export function ReceivePanel({ wallet }: ReceivePanelProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const address = wallet.address;
  const shortAddress = address ? shortenAddress(address) : null;
  const shareText = useMemo(() => {
    if (!address) return "";

    return [
      `Minha carteira ${INAPAY_NAME} para receber na Celo Mainnet:`,
      address,
      "Pode enviar CELO ou USDC.",
    ].join("\n");
  }, [address]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  function showFeedback(message: string) {
    setFeedback(message);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, 2200);
  }

  async function handleCopyAddress() {
    if (!address) return;

    await copyText(address);
    showFeedback(COPY_SUCCESS);
  }

  async function handleShareAddress() {
    if (!address) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${INAPAY_NAME} / receber`,
          text: shareText,
        });
        return;
      } catch {
        return;
      }
    }

    await copyText(shareText);
    showFeedback(SHARE_UNAVAILABLE);
  }

  return (
    <section className="border-2 border-celo-white bg-celo-black">
      <div className="grid grid-cols-[1fr_auto] border-b-2 border-celo-white">
        <div className="bg-celo-yellow px-4 py-3 text-celo-black">
          <h3 className="text-3xl font-black uppercase leading-none">
            Receber
          </h3>
        </div>
        <div className="flex items-center border-l-2 border-celo-white px-3 font-mono text-[10px] font-bold uppercase text-editorial-lilac">
          03/in
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!wallet.isConnected ? (
          <p className="border border-editorial-lilac px-3 py-3 font-mono text-[10px] font-bold uppercase leading-relaxed text-editorial-lilac">
            Entre com Google, telefone ou wallet para gerar sua Conta{" "}
            {INAPAY_NAME} e receber pagamentos.
          </p>
        ) : wallet.isDemo ? (
          <p className="border border-celo-yellow px-3 py-3 font-mono text-[10px] font-bold uppercase leading-relaxed text-celo-yellow">
            Modo demonstra\u00e7\u00e3o — entre com uma conta real para receber
            pagamentos.
          </p>
        ) : address && shortAddress ? (
          <>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase text-warm-gray">
                    {ACCOUNT_TITLE}
                  </p>
                  <p className="mt-1 break-all font-mono text-lg font-black text-celo-green">
                    {shortAddress}
                  </p>
                </div>
                <span className="border border-celo-white px-2 py-1 font-mono text-[9px] font-black uppercase text-celo-white">
                  mainnet
                </span>
              </div>

              <p className="font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
                Use este endere\u00e7o para receber CELO ou USDC na Celo
                Mainnet.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => void handleCopyAddress()}
              >
                {COPY_LABEL}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => void handleShareAddress()}
              >
                Compartilhar
              </Button>
            </div>

            {feedback ? (
              <p
                role="status"
                className="border border-celo-green px-3 py-2 font-mono text-[10px] font-black uppercase text-celo-green"
              >
                {feedback}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
