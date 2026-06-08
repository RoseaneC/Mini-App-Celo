"use client";

import { useState } from "react";
import { AuthEntry } from "@/components/home/AuthEntry";
import { PaymentReceipt } from "@/components/home/PaymentReceipt";
import { ReceivePanel } from "@/components/home/ReceivePanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/home/StatusMessage";
import type { InapayEmbeddedWalletState } from "@/hooks/useInapayEmbeddedWallet";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TokenId } from "@/lib/web3/tokens";
import type {
  PaymentReceiptData,
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
  registryStatus: RegistryStatus;
  registryTxHash: `0x${string}` | null;
  registryExplorerUrl: string | null;
  paymentReceipt: PaymentReceiptData | null;
  mounted: boolean;
  walletAvailable: boolean;
  isMiniPay: boolean;
  isMobileWithoutWallet: boolean;
  metamaskDeepLink: string;
  needsMainnetSwitch: boolean;
  currentChainId: number;
  isSending: boolean;
  isSwitchingNetwork: boolean;
  embeddedWallet: InapayEmbeddedWalletState;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onTokenChange: (value: TokenId) => void;
  onConnect: () => void;
  onUseExistingWallet: () => void;
  onSwitchNetwork: () => void;
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

export function TransferCard({
  wallet,
  amount,
  recipient,
  selectedTokenId,
  status,
  message,
  registryStatus,
  registryTxHash,
  registryExplorerUrl,
  paymentReceipt,
  mounted,
  walletAvailable,
  isMiniPay,
  isMobileWithoutWallet,
  metamaskDeepLink,
  needsMainnetSwitch,
  currentChainId,
  isSending,
  isSwitchingNetwork,
  embeddedWallet,
  onAmountChange,
  onRecipientChange,
  onTokenChange,
  onConnect,
  onUseExistingWallet,
  onSwitchNetwork,
  onSend,
  onResetStatus,
}: TransferCardProps) {
  const [destinationMethod, setDestinationMethod] =
    useState<DestinationMethod>("wallet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const displayMessage = statusLabel(status, message);
  const showStatusMessage = Boolean(displayMessage) && !paymentReceipt;
  const isBusy = isSending;
  const isPhoneDestination = destinationMethod === "phone";
  const showRealBalance =
    wallet.isConnected && !wallet.isDemo && Boolean(wallet.address);
  const isEmbeddedAccount = embeddedWallet.isEmbeddedActive && !wallet.isDemo;
  const connectionLabel = wallet.isDemo
    ? "Modo demonstração"
    : isEmbeddedAccount
      ? "Conta In\u00e1Pay"
      : isMiniPay
      ? "MiniPay"
      : "Wallet existente";
  const connectionValue = wallet.isDemo
    ? "sem wallet real"
    : isEmbeddedAccount
      ? embeddedWallet.accountDetail
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

        {isMobileWithoutWallet && !wallet.isConnected && !embeddedWallet.isEnabled ? (
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
        ) : mounted &&
          !walletAvailable &&
          !isMiniPay &&
          !wallet.isConnected &&
          !embeddedWallet.isEnabled ? (
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

        {needsMainnetSwitch ? (
          <div
            role="alert"
            className="space-y-3 border-2 border-celo-yellow bg-celo-black px-3 py-3 text-celo-yellow"
          >
            <p className="font-mono text-[11px] font-black uppercase leading-relaxed">
              Sua carteira está em outra rede. Troque para Celo Mainnet para
              continuar.
            </p>
            <p className="font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
              Rede atual: chainId {currentChainId}
            </p>
            <Button
              type="button"
              variant="primary"
              fullWidth
              isLoading={isSwitchingNetwork}
              onClick={onSwitchNetwork}
            >
              Trocar para Celo Mainnet
            </Button>
          </div>
        ) : null}

        {showStatusMessage ? (
          <StatusMessage status={status} message={displayMessage} />
        ) : null}

        {paymentReceipt ? (
          <PaymentReceipt
            receipt={paymentReceipt}
            registryStatus={registryStatus}
            registryTxHash={registryTxHash}
            registryExplorerUrl={registryExplorerUrl}
          />
        ) : null}

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (isPhoneDestination || needsMainnetSwitch) return;
            onSend();
          }}
        >
          {!wallet.isConnected ? (
            embeddedWallet.isEnabled ? (
              <AuthEntry
                embeddedWallet={embeddedWallet}
                walletAvailable={walletAvailable}
                isMiniPay={isMiniPay}
                isMobileWithoutWallet={isMobileWithoutWallet}
                metamaskDeepLink={metamaskDeepLink}
                isBusy={isBusy}
                onUseExistingWallet={onUseExistingWallet}
              />
            ) : (
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
            )
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
            disabled={
              !wallet.isConnected || isPhoneDestination || needsMainnetSwitch
            }
          >
            {isPhoneDestination
              ? "Disponível em breve"
              : `Enviar ${selectedToken.symbol}`}
          </Button>
        </form>

        <ReceivePanel
          wallet={wallet}
          isEmbeddedAccount={isEmbeddedAccount}
        />
      </div>
    </section>
  );
}
