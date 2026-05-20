"use client";

import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/home/StatusMessage";
import { CELO_SEPOLIA_CHAIN_ID } from "@/lib/web3/constants";
import { ACTIVE_SEND_TOKEN_ID, WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TransferStatus, WalletConnectionState } from "@/types/transfer";

function formatCeloBalance(value: bigint, decimals: number): string {
  const raw = formatUnits(value, decimals);
  const [whole, fraction = ""] = raw.split(".");
  if (!fraction || /^0*$/.test(fraction)) return whole;
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${whole},${trimmed}` : whole;
}

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
  const displayMessage = statusLabel(status, message);
  const isBusy = isSending;
  const showRealBalance =
    wallet.isConnected && !wallet.isDemo && Boolean(wallet.address);

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: wallet.address ?? undefined,
    chainId: CELO_SEPOLIA_CHAIN_ID,
    query: { enabled: showRealBalance },
  });

  const balanceLabel = (() => {
    if (!showRealBalance) return null;
    if (isBalanceLoading) return "Carregando…";
    if (!balance) return "—";
    return `${formatCeloBalance(balance.value, balance.decimals)} CELO`;
  })();

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
                <p className="mt-0.5 text-lg font-bold tabular-nums text-celo-white">
                  {balanceLabel}
                </p>
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isBusy}
            disabled={!wallet.isConnected}
          >
            Enviar
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
