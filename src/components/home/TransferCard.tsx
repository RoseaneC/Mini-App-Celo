"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/home/StatusMessage";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ACTIVE_SEND_TOKEN_ID, WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TransferStatus, WalletConnectionState } from "@/types/transfer";

type DestinationMethod = "phone" | "wallet";

type TransferCardProps = {
  wallet: WalletConnectionState;
  amount: string;
  recipient: string;
  status: TransferStatus;
  message: string | null;
  txHash: `0x${string}` | null;
  txExplorerUrl: string | null;
  mounted: boolean;
  walletAvailable: boolean;
  isSending: boolean;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onConnect: () => void;
  onSend: () => void;
  onResetStatus: () => void;
};

function statusLabel(status: TransferStatus, message: string | null): string | null {
  if (message) return message;
  if (status === "loading") return "Processando…";
  return null;
}

export function TransferCard({
  wallet,
  amount,
  recipient,
  status,
  message,
  txHash,
  txExplorerUrl,
  mounted,
  walletAvailable,
  isSending,
  onAmountChange,
  onRecipientChange,
  onConnect,
  onSend,
  onResetStatus,
}: TransferCardProps) {
  const [destinationMethod, setDestinationMethod] =
    useState<DestinationMethod>("wallet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const displayMessage = statusLabel(status, message);
  const isBusy = isSending;
  const isPhoneDestination = destinationMethod === "phone";
  const showRealBalance =
    wallet.isConnected && !wallet.isDemo && Boolean(wallet.address);

  const { balances } = useTokenBalances({
    address: wallet.address,
    enabled: showRealBalance,
  });

  return (
    <section className="overflow-hidden rounded-3xl border border-celo-white/10 bg-celo-white/[0.04] shadow-2xl shadow-celo-black/60">
      <div className="h-1 bg-gradient-to-r from-celo-yellow via-celo-green to-celo-yellow" aria-hidden />
      <div className="p-5 sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-celo-white">
            Enviar
          </h2>
          <p className="text-sm text-celo-white/55">
            Transferências rápidas, simples e digitais.
          </p>
          <p className="text-[11px] text-celo-white/35">Rede de teste</p>
        </div>

        {mounted && !walletAvailable && !wallet.isConnected ? (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-celo-yellow/30 bg-celo-yellow/10 px-4 py-3 text-sm text-celo-yellow"
          >
            Não encontramos uma carteira neste navegador. Toque em
            &quot;Conectar&quot; para experimentar no modo demo.
          </div>
        ) : null}

        {wallet.isConnected ? (
          <div className="mb-4 space-y-3">
            <div className="rounded-2xl border border-celo-green/25 bg-celo-green/10 px-4 py-3 text-sm text-celo-green">
              Carteira conectada:{" "}
              <span className="font-mono font-semibold">
                {wallet.address?.slice(0, 10)}…{wallet.address?.slice(-8)}
              </span>
              {wallet.isDemo ? (
                <span className="mt-1 block text-xs text-celo-yellow/90">
                  Modo demo — sem extensão Web3
                </span>
              ) : null}
            </div>

            {showRealBalance ? (
              <div className="rounded-2xl border border-celo-white/10 bg-celo-white/[0.04] px-4 py-3">
                <p className="text-xs font-medium text-celo-white/50">
                  Saldo disponível
                </p>
                <div className="mt-2 space-y-2">
                  {balances.map((balance) => (
                    <div
                      key={balance.token.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-celo-white">
                        {balance.token.symbol}
                        {balance.badgeLabel ? (
                          <span className="rounded-full border border-celo-white/10 bg-celo-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-celo-white/40">
                            {balance.badgeLabel}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-celo-white">
                        {balance.amountLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <StatusMessage status={status} message={displayMessage} />

        {txHash && txExplorerUrl ? (
          <p className="mt-3 break-all text-xs text-celo-white/60">
            <span className="font-medium text-celo-white/80">
              Comprovante da transação:{" "}
            </span>
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-celo-green underline-offset-2 hover:underline"
            >
              {txHash}
            </a>
          </p>
        ) : null}

        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isPhoneDestination) return;
            onSend();
          }}
        >
          {!wallet.isConnected ? (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              isLoading={isBusy}
              onClick={onConnect}
            >
              {walletAvailable ? "Entrar" : "Conectar (demo)"}
            </Button>
          ) : null}

          <fieldset
            className="flex flex-col gap-2 border-0 p-0"
            disabled={!wallet.isConnected || isBusy}
          >
            <legend className="mb-0 text-sm font-semibold text-celo-white">
              Moeda de envio
            </legend>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label="Moeda de envio"
            >
              {WEB3_TOKENS.map((token) => {
                const isSelected = token.id === ACTIVE_SEND_TOKEN_ID;

                if (!token.available) {
                  return (
                    <div
                      key={token.id}
                      aria-disabled="true"
                      className="flex items-center justify-between rounded-2xl border border-celo-white/8 bg-celo-white/[0.02] px-4 py-3 opacity-50"
                    >
                      <span className="text-sm font-medium text-celo-white/45">
                        {token.symbol}
                      </span>
                      <span className="rounded-full border border-celo-white/10 bg-celo-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-celo-white/40">
                        Em breve
                      </span>
                    </div>
                  );
                }

                return (
                  <label
                    key={token.id}
                    className={[
                      "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition-colors",
                      isSelected
                        ? "border-celo-yellow/45 bg-celo-yellow/10"
                        : "border-celo-white/12 bg-celo-white/[0.04]",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={[
                          "flex size-4 items-center justify-center rounded-full border-2",
                          isSelected
                            ? "border-celo-yellow bg-celo-yellow"
                            : "border-celo-white/30",
                        ].join(" ")}
                        aria-hidden
                      >
                        {isSelected ? (
                          <span className="size-1.5 rounded-full bg-celo-black" />
                        ) : null}
                      </span>
                      <span className="text-sm font-semibold text-celo-white">
                        {token.symbol}
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-celo-green">
                      Ativo agora
                    </span>
                    <input
                      type="radio"
                      name="send-token"
                      value={token.id}
                      checked={isSelected}
                      readOnly
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Input
            label="Quanto deseja enviar?"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => {
              onResetStatus();
              onAmountChange(e.target.value);
            }}
            disabled={!wallet.isConnected || isBusy}
            hint="Informe o valor que deseja enviar"
          />

          <fieldset
            className="flex flex-col gap-2 border-0 p-0"
            disabled={!wallet.isConnected || isBusy}
          >
            <legend className="mb-0 text-sm font-semibold text-celo-white">
              Como deseja enviar?
            </legend>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Como deseja enviar?"
            >
              <button
                type="button"
                role="radio"
                aria-checked={destinationMethod === "phone"}
                onClick={() => {
                  onResetStatus();
                  setDestinationMethod("phone");
                }}
                className={[
                  "flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
                  destinationMethod === "phone"
                    ? "border-celo-white/20 bg-celo-white/[0.04] text-celo-white/75"
                    : "border-celo-white/8 bg-celo-white/[0.02] text-celo-white/40 opacity-70",
                ].join(" ")}
              >
                Telefone
                <span className="rounded-full border border-celo-white/10 bg-celo-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-celo-white/40">
                  Em breve
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={destinationMethod === "wallet"}
                onClick={() => {
                  onResetStatus();
                  setDestinationMethod("wallet");
                }}
                className={[
                  "flex min-h-12 items-center justify-center rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
                  destinationMethod === "wallet"
                    ? "border-celo-yellow/45 bg-celo-yellow/10 text-celo-white"
                    : "border-celo-white/12 bg-celo-white/[0.04] text-celo-white/70",
                ].join(" ")}
              >
                Carteira
              </button>
            </div>
          </fieldset>

          {isPhoneDestination ? (
            <>
              <Input
                label="Número de telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={(e) => {
                  onResetStatus();
                  setPhoneNumber(e.target.value);
                }}
                disabled={!wallet.isConnected || isBusy}
              />
              <p className="rounded-2xl border border-celo-white/10 bg-celo-white/[0.04] px-4 py-3 text-xs leading-relaxed text-celo-white/50">
                Em breve será possível enviar usando número de telefone no
                MiniPay.
              </p>
            </>
          ) : (
            <Input
              label="Para qual carteira?"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="0x…"
              value={recipient}
              onChange={(e) => {
                onResetStatus();
                onRecipientChange(e.target.value);
              }}
              disabled={!wallet.isConnected || isBusy}
              hint="Cole o endereço completo do destinatário."
            />
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isBusy}
            disabled={!wallet.isConnected || isPhoneDestination}
          >
            {isPhoneDestination ? "Disponível em breve" : "Enviar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-celo-white/30">
          No MiniPay, futuramente poderemos permitir envio por contato/telefone,
          quando o usuário estiver cadastrado.
        </p>

        {wallet.isConnected ? (
          <p className="mt-2 text-center text-xs text-celo-white/35">
            {wallet.isDemo
              ? "Modo demo — envio simulado. Conecte uma carteira real para transferir de verdade."
              : "Transferência real na rede de teste."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
