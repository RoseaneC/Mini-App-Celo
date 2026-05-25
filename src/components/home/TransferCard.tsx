"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/home/StatusMessage";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TokenId } from "@/lib/web3/tokens";
import type {
  RegistryStatus,
  TransferStatus,
  WalletConnectionState,
} from "@/types/transfer";

type DestinationMethod = "phone" | "wallet";

type TransferCardProps = {
  wallet: WalletConnectionState;
  amount: string;
  recipient: string;
  selectedTokenId: TokenId;
  status: TransferStatus;
  message: string | null;
  txHash: `0x${string}` | null;
  txExplorerUrl: string | null;
  registryStatus: RegistryStatus;
  registryMessage: string | null;
  registryTxHash: `0x${string}` | null;
  registryExplorerUrl: string | null;
  mounted: boolean;
  walletAvailable: boolean;
  isMiniPay: boolean;
  isMobileWithoutWallet: boolean;
  metamaskDeepLink: string;
  isSending: boolean;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onTokenChange: (value: TokenId) => void;
  onConnect: () => void;
  onSend: () => void;
  onResetStatus: () => void;
};

function statusLabel(status: TransferStatus, message: string | null): string | null {
  if (message) return message;
  if (status === "loading") return "Processando...";
  return null;
}

function tokenStateLabel(tokenId: TokenId, selected: boolean): string {
  if (tokenId === "USDT") return selected ? "Em validação" : "Em validação";
  return selected ? "Selecionado" : "Funcional";
}

function registryStatusClass(status: RegistryStatus): string {
  if (status === "success") return "border-celo-green bg-celo-green text-celo-black";
  if (status === "error") return "border-celo-yellow bg-celo-black text-celo-yellow";
  return "border-editorial-lilac bg-celo-black text-editorial-lilac";
}

export function TransferCard({
  wallet,
  amount,
  recipient,
  selectedTokenId,
  status,
  message,
  txHash,
  txExplorerUrl,
  registryStatus,
  registryMessage,
  registryTxHash,
  registryExplorerUrl,
  mounted,
  walletAvailable,
  isMiniPay,
  isMobileWithoutWallet,
  metamaskDeepLink,
  isSending,
  onAmountChange,
  onRecipientChange,
  onTokenChange,
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
  const connectionLabel = wallet.isDemo
    ? "Modo demonstração"
    : isMiniPay
      ? "MiniPay"
      : "Carteira";
  const connectionValue = wallet.isDemo
    ? "sem wallet real"
    : `${wallet.address?.slice(0, 8)}...${wallet.address?.slice(-6)}`;
  const selectedToken =
    WEB3_TOKENS.find((token) => token.id === selectedTokenId) ??
    WEB3_TOKENS[0];

  const { balances } = useTokenBalances({
    address: wallet.address,
    enabled: showRealBalance,
  });

  return (
    <section className="my-8 border-2 border-celo-white bg-celo-black">
      <div className="grid grid-cols-[1fr_auto] border-b-2 border-celo-white">
        <div className="bg-celo-white px-4 py-3 text-celo-black">
          <h2 className="text-3xl font-black uppercase leading-none">Enviar</h2>
        </div>
        <div className="flex items-center border-l-2 border-celo-white px-3 font-mono text-[10px] font-bold uppercase text-celo-yellow">
          02/pay
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-celo-white/25 pb-4">
          <p className="text-xl font-black uppercase leading-none text-celo-white">
            envie.
            <span className="block text-editorial-lilac">receba.</span>
          </p>
          <div className="text-right font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
            <span className="block text-celo-yellow">mainnet</span>
            <span>{isMiniPay ? "MiniPay" : "wallet"}</span>
          </div>
        </div>

        {isMobileWithoutWallet && !wallet.isConnected ? (
          <div
            role="alert"
            className="space-y-3 border-2 border-editorial-lilac bg-editorial-lilac px-3 py-3 font-mono text-[11px] font-bold uppercase leading-relaxed text-celo-black"
          >
            <p>
              Para conectar sua carteira no celular, abra este link dentro do
              navegador da MetaMask ou do MiniPay.
            </p>
            <a
              href={metamaskDeepLink}
              className="block border-2 border-celo-black bg-celo-black px-3 py-3 text-center text-celo-yellow transition-colors hover:bg-editorial-lilac hover:text-celo-black"
            >
              Abrir na MetaMask
            </a>
            <p>Modo demonstração — nenhuma transação real será enviada.</p>
          </div>
        ) : mounted && !walletAvailable && !isMiniPay && !wallet.isConnected ? (
          <div
            role="alert"
            className="border-2 border-editorial-lilac bg-editorial-lilac px-3 py-3 font-mono text-[11px] font-bold uppercase leading-relaxed text-celo-black"
          >
            Sem wallet detectada. Modo demonstração — nenhuma transação real será enviada.
          </div>
        ) : null}

        {wallet.isConnected ? (
          <div className="border-y border-celo-white/25 py-3">
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] font-bold uppercase text-warm-gray">
                {connectionLabel}
              </span>
              <span className="break-all text-right font-mono text-[11px] font-bold text-celo-green">
                {connectionValue}
              </span>
            </div>
            {wallet.isDemo && !isMiniPay ? (
              <p className="mt-2 font-mono text-[10px] font-bold uppercase text-celo-yellow">
                Modo demonstração — nenhuma transação real será enviada.
              </p>
            ) : null}

            {showRealBalance ? (
              <div className="mt-4 border-t border-celo-white/25">
                <p className="py-2 font-mono text-[10px] font-bold uppercase text-warm-gray">
                  Saldos
                </p>
                <div className="divide-y divide-celo-white/20 border-y border-celo-white/20">
                  {balances.map((balance) => (
                    <div
                      key={balance.token.id}
                      className="grid grid-cols-[auto_1fr] items-center gap-3 py-2"
                    >
                      <span className="font-mono text-xs font-black uppercase text-celo-white">
                        {balance.token.symbol}
                      </span>
                      <span className="min-w-0 truncate text-right font-mono text-xs font-bold text-celo-white">
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
          <div className="border-2 border-celo-green bg-celo-green px-3 py-3 text-celo-black">
            <p className="font-mono text-[10px] font-black uppercase">
              pagamento confirmado
            </p>
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-mono text-[11px] font-bold underline"
            >
              {txHash}
            </a>
          </div>
        ) : null}

        {registryMessage ? (
          <div
            className={[
              "border-2 px-3 py-3",
              registryStatusClass(registryStatus),
            ].join(" ")}
          >
            <p className="font-mono text-[10px] font-black uppercase">
              registro do comprovante
            </p>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase leading-relaxed">
              {registryMessage}
            </p>
            {registryTxHash && registryExplorerUrl ? (
              <a
                href={registryExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-mono text-[11px] font-bold underline"
              >
                {registryTxHash}
              </a>
            ) : null}
          </div>
        ) : null}

        <form
          className="space-y-5"
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
              {walletAvailable || isMiniPay
                ? "Entrar"
                : "Entrar no modo demonstração"}
            </Button>
          ) : null}

          <fieldset
            className="border-0 p-0"
            disabled={!wallet.isConnected || isBusy}
          >
            <legend className="mb-2 font-mono text-[11px] font-bold uppercase text-warm-gray">
              01 / moeda de envio
            </legend>
            <div
              className="grid grid-cols-3 border-2 border-celo-white"
              role="radiogroup"
              aria-label="Moeda de envio"
            >
              {WEB3_TOKENS.map((token, index) => {
                const isSelected = token.id === selectedTokenId;
                const isLast = index === WEB3_TOKENS.length - 1;

                if (!token.available) {
                  return (
                    <div
                      key={token.id}
                      aria-disabled="true"
                      className={[
                        "min-h-20 px-2 py-3 opacity-45",
                        !isLast && "border-r-2 border-celo-white",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="block text-lg font-black uppercase text-celo-white">
                        {token.symbol}
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase text-warm-gray">
                        em validação
                      </span>
                    </div>
                  );
                }

                return (
                  <label
                    key={token.id}
                    className={[
                      "flex min-h-20 cursor-pointer flex-col justify-between px-2 py-3 transition-colors",
                      !isLast && "border-r-2 border-celo-white",
                      isSelected
                        ? "bg-celo-yellow text-celo-black"
                        : "bg-celo-black text-celo-white hover:bg-celo-white hover:text-celo-black",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="text-lg font-black uppercase leading-none">
                      {token.symbol}
                    </span>
                    <span className="font-mono text-[9px] font-bold uppercase">
                      {tokenStateLabel(token.id, isSelected)}
                    </span>
                    <input
                      type="radio"
                      name="send-token"
                      value={token.id}
                      checked={isSelected}
                      onChange={() => {
                        onResetStatus();
                        onTokenChange(token.id);
                      }}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Input
            label="02 / valor"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0,00"
            value={amount}
            onChange={(e) => {
              onResetStatus();
              onAmountChange(e.target.value);
            }}
            disabled={!wallet.isConnected || isBusy}
            hint={`ativo selecionado: ${selectedToken.symbol}`}
          />

          <fieldset
            className="border-0 p-0"
            disabled={!wallet.isConnected || isBusy}
          >
            <legend className="mb-2 font-mono text-[11px] font-bold uppercase text-warm-gray">
              03 / destino
            </legend>
            <div
              className="grid grid-cols-2 border-2 border-celo-white"
              role="radiogroup"
              aria-label="Como deseja enviar?"
            >
              <button
                type="button"
                role="radio"
                aria-checked={destinationMethod === "wallet"}
                onClick={() => {
                  onResetStatus();
                  setDestinationMethod("wallet");
                }}
                className={[
                  "min-h-14 border-r-2 border-celo-white px-3 py-3 text-sm font-black uppercase transition-colors",
                  destinationMethod === "wallet"
                    ? "bg-celo-white text-celo-black"
                    : "bg-celo-black text-celo-white hover:bg-celo-yellow hover:text-celo-black",
                ].join(" ")}
              >
                Carteira
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={destinationMethod === "phone"}
                onClick={() => {
                  onResetStatus();
                  setDestinationMethod("phone");
                }}
                className={[
                  "min-h-14 px-3 py-3 text-sm font-black uppercase transition-colors",
                  destinationMethod === "phone"
                    ? "bg-editorial-lilac text-celo-black"
                    : "bg-celo-black text-warm-gray hover:bg-editorial-lilac hover:text-celo-black",
                ].join(" ")}
              >
                Telefone / breve
              </button>
            </div>
          </fieldset>

          {isPhoneDestination ? (
            <div className="space-y-3">
              <Input
                label="telefone / em breve"
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
              <p className="border border-celo-white/30 px-3 py-3 font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
                SocialConnect / ODIS ainda não está ativo.
              </p>
            </div>
          ) : (
            <Input
              label="carteira destino"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                onResetStatus();
                onRecipientChange(e.target.value);
              }}
              disabled={!wallet.isConnected || isBusy}
              hint="cole o endereço completo"
            />
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isBusy}
            disabled={!wallet.isConnected || isPhoneDestination}
          >
            {isPhoneDestination
              ? "Disponível em breve"
              : `Enviar ${selectedToken.symbol}`}
          </Button>
        </form>
      </div>
    </section>
  );
}
