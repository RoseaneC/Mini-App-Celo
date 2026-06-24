"use client";

import { useState } from "react";
import { AuthEntry } from "@/components/home/AuthEntry";
import { ReceivePanel } from "@/components/home/ReceivePanel";
import { Header } from "@/components/layout/Header";
import { TransferCard } from "@/components/home/TransferCard";
import { Button } from "@/components/ui/Button";
import {
  disabledInapayEmbeddedWallet,
  useInapayEmbeddedWallet,
} from "@/hooks/useInapayEmbeddedWallet";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTransfer } from "@/hooks/useTransfer";
import type { InapayEmbeddedWalletState } from "@/hooks/useInapayEmbeddedWallet";
import type { TokenBalance } from "@/hooks/useTokenBalances";
import type { WalletConnectionState } from "@/types/transfer";

const privyEnabled = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

type AppTab = "home" | "send" | "receive" | "history" | "profile";

const tabs: { id: AppTab; label: string }[] = [
  { id: "home", label: "Inicio" },
  { id: "send", label: "Enviar" },
  { id: "receive", label: "Receber" },
  { id: "history", label: "Historico" },
  { id: "profile", label: "Perfil" },
];

const shortcuts: { id: Exclude<AppTab, "home">; label: string }[] = [
  { id: "send", label: "Enviar" },
  { id: "receive", label: "Receber" },
  { id: "history", label: "Historico" },
  { id: "profile", label: "Perfil" },
];

function shortenAddress(address: string | null) {
  if (!address) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getConnectionLabel({
  wallet,
  embeddedWallet,
  isMiniPay,
}: {
  wallet: WalletConnectionState;
  embeddedWallet: InapayEmbeddedWalletState;
  isMiniPay: boolean;
}) {
  if (wallet.isDemo) return "Modo demonstracao";
  if (embeddedWallet.isEmbeddedActive) return "Conta Inapay";
  if (isMiniPay) return "MiniPay";
  return "Wallet conectada";
}

function getSummaryBalance(wallet: WalletConnectionState, balances: TokenBalance[]) {
  if (wallet.isDemo) return "Saldo simulado";

  const readableBalances = balances
    .filter((balance) => balance.token.id === "CELO" || balance.token.id === "USDC")
    .map((balance) => balance.amountLabel)
    .filter((label) => !label.startsWith("—") && !label.startsWith("â€”"));

  if (readableBalances.length === 0) return "Carregando saldos";
  return readableBalances.join(" + ");
}

function DisconnectedLanding({
  embeddedWallet,
  walletAvailable,
  isMiniPay,
  isMobileWithoutWallet,
  metamaskDeepLink,
  isConnecting,
  onConnect,
  onUseExistingWallet,
}: {
  embeddedWallet: InapayEmbeddedWalletState;
  walletAvailable: boolean;
  isMiniPay: boolean;
  isMobileWithoutWallet: boolean;
  metamaskDeepLink: string;
  isConnecting: boolean;
  onConnect: () => void;
  onUseExistingWallet: () => void;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-4 py-8">
      <section className="space-y-4" aria-labelledby="auth-title">
        <div className="border-b-2 border-celo-white pb-4">
          <p className="font-mono text-[11px] font-bold uppercase text-warm-gray">
            Conta Inapay
          </p>
          <h1
            id="auth-title"
            className="mt-2 text-5xl font-black uppercase leading-[0.88] text-celo-white"
          >
            Carteira
            <span className="block text-celo-yellow">Digital</span>
          </h1>
        </div>

        <div className="border-2 border-celo-white bg-celo-black">
          <div className="border-b-2 border-celo-white bg-celo-yellow px-4 py-3 text-celo-black">
            <h2 className="text-3xl font-black uppercase leading-none">
              Conecte sua conta
            </h2>
          </div>
          <p className="px-4 py-3 font-mono text-[11px] font-bold uppercase leading-relaxed text-warm-gray">
            Entre para enviar, receber e acompanhar sua Conta Inapay na Celo
            Mainnet.
          </p>
        </div>

        {embeddedWallet.isEnabled ? (
          <AuthEntry
            embeddedWallet={embeddedWallet}
            walletAvailable={walletAvailable}
            isMiniPay={isMiniPay}
            isMobileWithoutWallet={isMobileWithoutWallet}
            metamaskDeepLink={metamaskDeepLink}
            isBusy={isConnecting}
            onUseExistingWallet={onUseExistingWallet}
          />
        ) : (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            isLoading={isConnecting}
            onClick={onConnect}
          >
            {walletAvailable || isMiniPay
              ? "Entrar"
              : "Entrar no modo demonstracao"}
          </Button>
        )}
      </section>
    </main>
  );
}

function HomeTab({
  wallet,
  balances,
  embeddedWallet,
  isMiniPay,
  onNavigate,
}: {
  wallet: WalletConnectionState;
  balances: TokenBalance[];
  embeddedWallet: InapayEmbeddedWalletState;
  isMiniPay: boolean;
  onNavigate: (tab: AppTab) => void;
}) {
  const connectionLabel = getConnectionLabel({
    wallet,
    embeddedWallet,
    isMiniPay,
  });
  const addressLabel = wallet.isDemo
    ? "sem wallet real"
    : shortenAddress(wallet.address);

  return (
    <section className="space-y-4" aria-labelledby="home-title">
      <div className="border-b-2 border-celo-white pb-4">
        <p className="font-mono text-[11px] font-bold uppercase text-warm-gray">
          Conta Inapay
        </p>
        <h1
          id="home-title"
          className="mt-2 text-5xl font-black uppercase leading-[0.88] text-celo-white"
        >
          Carteira
          <span className="block text-celo-yellow">Digital</span>
        </h1>
      </div>

      <div className="border-2 border-celo-white bg-celo-black">
        <div className="border-b-2 border-celo-white bg-celo-yellow px-4 py-3 text-celo-black">
          <p className="font-mono text-[10px] font-black uppercase">
            saldo resumido
          </p>
          <p className="mt-1 break-words text-3xl font-black uppercase leading-none">
            {getSummaryBalance(wallet, balances)}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4">
          <div>
            <p className="font-mono text-[10px] font-black uppercase text-warm-gray">
              {connectionLabel}
            </p>
            <p className="mt-1 break-all font-mono text-xs font-bold text-celo-green">
              {addressLabel}
            </p>
          </div>
          <span className="border border-celo-white px-2 py-1 font-mono text-[9px] font-black uppercase text-celo-white">
            mainnet
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            type="button"
            onClick={() => onNavigate(shortcut.id)}
            className="min-h-20 border-2 border-celo-white bg-celo-black px-3 py-3 text-left text-lg font-black uppercase leading-none text-celo-white transition-colors hover:bg-celo-white hover:text-celo-black"
          >
            {shortcut.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PlaceholderTab({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="border-2 border-celo-white bg-celo-black">
      <div className="border-b-2 border-celo-white bg-editorial-lilac px-4 py-3 text-celo-black">
        <h1 className="text-3xl font-black uppercase leading-none">{title}</h1>
      </div>
      <div className="p-4">
        <p className="font-mono text-[11px] font-bold uppercase leading-relaxed text-warm-gray">
          {body}
        </p>
      </div>
    </section>
  );
}

function HomePageWithPrivy() {
  const embeddedWallet = useInapayEmbeddedWallet();

  return <HomePageContent embeddedWallet={embeddedWallet} />;
}

function HomePageContent({
  embeddedWallet,
}: {
  embeddedWallet: InapayEmbeddedWalletState;
}) {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const {
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
    isConnecting,
    isSending,
    isSwitchingNetwork,
    setAmount,
    setRecipient,
    setSelectedTokenId,
    connectWallet,
    disconnectWallet,
    switchToMainnet,
    sendSelectedToken,
    resetStatus,
  } = useTransfer();
  const showRealBalance =
    wallet.isConnected && !wallet.isDemo && Boolean(wallet.address);
  const isEmbeddedAccount = embeddedWallet.isEmbeddedActive && !wallet.isDemo;
  const { balances } = useTokenBalances({
    address: wallet.address,
    enabled: showRealBalance,
  });

  const handleConnect = () => {
    if (embeddedWallet.isEnabled) {
      setActiveTab("home");
      return;
    }

    void connectWallet();
  };

  const handleUseExistingWallet = () => {
    if (embeddedWallet.isEnabled) {
      embeddedWallet.connectExistingWallet();
      return;
    }

    void connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setActiveTab("home");

    if (embeddedWallet.isEnabled && embeddedWallet.isAuthenticated) {
      void embeddedWallet.logout();
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-celo-black text-celo-white">
      <div
        className="editorial-texture pointer-events-none fixed inset-0 opacity-65"
        aria-hidden
      />
      <div
        className="editorial-noise pointer-events-none fixed inset-0 opacity-45"
        aria-hidden
      />

      {!wallet.isConnected ? (
        <DisconnectedLanding
          embeddedWallet={embeddedWallet}
          walletAvailable={walletAvailable}
          isMiniPay={isMiniPay}
          isMobileWithoutWallet={isMobileWithoutWallet}
          metamaskDeepLink={metamaskDeepLink}
          isConnecting={isConnecting}
          onConnect={() => void connectWallet()}
          onUseExistingWallet={handleUseExistingWallet}
        />
      ) : (
        <>
          <Header
            isConnected={wallet.isConnected}
            address={wallet.address}
            isDemo={wallet.isDemo}
            accountLabel={
              embeddedWallet.isEmbeddedActive
                ? embeddedWallet.accountLabel
                : undefined
            }
            accountDetail={
              embeddedWallet.isEmbeddedActive
                ? embeddedWallet.accountDetail
                : undefined
            }
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnecting={isConnecting}
            connectDisabled={isMobileWithoutWallet && !embeddedWallet.isEnabled}
          />

          <main className="relative mx-auto flex w-full max-w-[480px] flex-col px-4 pb-8 pt-4">
            <nav
              className="sticky top-[57px] z-10 -mx-4 border-b-2 border-celo-white bg-celo-black/95 px-4 pb-3 pt-2 backdrop-blur"
              aria-label="Navegacao Inapay"
            >
              <div className="grid grid-cols-5 border-2 border-celo-white">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "min-h-12 border-r-2 border-celo-white px-1 py-2 text-[10px] font-black uppercase leading-tight transition-colors last:border-r-0",
                        isActive
                          ? "bg-celo-yellow text-celo-black"
                          : "bg-celo-black text-celo-white hover:bg-celo-white hover:text-celo-black",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="pt-5">
              {activeTab === "home" ? (
                <HomeTab
                  wallet={wallet}
                  balances={balances}
                  embeddedWallet={embeddedWallet}
                  isMiniPay={isMiniPay}
                  onNavigate={setActiveTab}
                />
              ) : null}

              {activeTab === "send" ? (
                <TransferCard
                  wallet={wallet}
                  amount={amount}
                  recipient={recipient}
                  selectedTokenId={selectedTokenId}
                  status={status}
                  message={message}
                  registryStatus={registryStatus}
                  registryTxHash={registryTxHash}
                  registryExplorerUrl={registryExplorerUrl}
                  paymentReceipt={paymentReceipt}
                  mounted={mounted}
                  walletAvailable={walletAvailable}
                  isMiniPay={isMiniPay}
                  isMobileWithoutWallet={isMobileWithoutWallet}
                  metamaskDeepLink={metamaskDeepLink}
                  needsMainnetSwitch={needsMainnetSwitch}
                  currentChainId={currentChainId}
                  isSending={isSending}
                  isSwitchingNetwork={isSwitchingNetwork}
                  embeddedWallet={embeddedWallet}
                  onAmountChange={setAmount}
                  onRecipientChange={setRecipient}
                  onTokenChange={setSelectedTokenId}
                  onConnect={() => void connectWallet()}
                  onUseExistingWallet={handleUseExistingWallet}
                  onSwitchNetwork={() => void switchToMainnet()}
                  onSend={() => void sendSelectedToken()}
                  onResetStatus={resetStatus}
                  showReceivePanel={false}
                />
              ) : null}

              {activeTab === "receive" ? (
                <ReceivePanel
                  wallet={wallet}
                  isEmbeddedAccount={isEmbeddedAccount}
                />
              ) : null}

              {activeTab === "history" ? (
                <PlaceholderTab
                  title="Historico em construcao"
                  body="Em breve voce vera seus pagamentos e comprovantes aqui."
                />
              ) : null}

              {activeTab === "profile" ? (
                <PlaceholderTab
                  title="Perfil em construcao"
                  body="Conta, seguranca e configuracoes ficarao aqui."
                />
              ) : null}
            </div>

            <footer className="grid grid-cols-[1fr_auto] items-end gap-4 border-t border-celo-white/20 py-5 font-mono text-[10px] font-bold uppercase text-warm-gray">
              <span>{"Inapay / Celo Mainnet"}</span>
              <span className="text-right text-celo-white">valor real</span>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

export function HomePage() {
  if (privyEnabled) {
    return <HomePageWithPrivy />;
  }

  return <HomePageContent embeddedWallet={disabledInapayEmbeddedWallet} />;
}
