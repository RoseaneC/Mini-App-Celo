"use client";

import { Header } from "@/components/layout/Header";
import { TransferCard } from "@/components/home/TransferCard";
import {
  disabledInapayEmbeddedWallet,
  useInapayEmbeddedWallet,
} from "@/hooks/useInapayEmbeddedWallet";
import { useTransfer } from "@/hooks/useTransfer";
import type { InapayEmbeddedWalletState } from "@/hooks/useInapayEmbeddedWallet";

const privyEnabled = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

function ManifestoStrip() {
  return (
    <section className="border-y-2 border-celo-white py-5">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <p className="text-4xl font-black uppercase leading-none text-celo-white">
          stablecoins
          <span className="block text-editorial-lilac">para pessoas</span>
          <span className="block text-celo-yellow">reais.</span>
        </p>
        <div className="flex flex-col justify-between border-l-2 border-celo-white pl-3 font-mono text-[10px] font-bold uppercase text-warm-gray">
          <span>CELO</span>
          <span>USDC</span>
          <span>USDT val</span>
        </div>
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

  const handleConnect = () => {
    if (embeddedWallet.isEnabled) {
      embeddedWallet.loginWithGoogle();
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

    if (embeddedWallet.isEnabled && embeddedWallet.isAuthenticated) {
      void embeddedWallet.logout();
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-celo-black text-celo-white">
      <div className="editorial-texture pointer-events-none fixed inset-0 opacity-65" aria-hidden />
      <div className="editorial-noise pointer-events-none fixed inset-0 opacity-45" aria-hidden />

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

      <main className="relative mx-auto flex w-full max-w-[480px] flex-col px-4 pb-10">
        <section className="pt-7">
          <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-b-2 border-celo-white pb-4">
            <p className="font-mono text-[11px] font-bold uppercase leading-relaxed text-warm-gray">
              Mini app Web3
              <span className="block text-celo-yellow">Celo Mainnet</span>
            </p>
            <p className="max-w-28 text-right font-mono text-[10px] font-bold uppercase leading-relaxed text-celo-white">
              LATAM digital money
            </p>
          </div>

          <h1 className="mt-7 text-6xl font-black uppercase leading-[0.84] text-celo-white">
            dinheiro
            <span className="block text-celo-yellow">em</span>
            <span className="block italic text-editorial-lilac">
              movimento.
            </span>
          </h1>

          <div className="mt-6 overflow-hidden border-y-2 border-celo-yellow bg-celo-yellow py-2 text-celo-black">
            <div className="motion-ticker flex w-max gap-6 font-mono text-[11px] font-black uppercase">
              <span>envie.</span>
              <span>receba.</span>
              <span>instantaneamente.</span>
              <span>stablecoins sem teatro.</span>
              <span>envie.</span>
              <span>receba.</span>
              <span>instantaneamente.</span>
              <span>stablecoins sem teatro.</span>
            </div>
          </div>

          <div className="mt-4 border-2 border-celo-white bg-celo-black px-3 py-3">
            <p className="font-mono text-[11px] font-black uppercase leading-relaxed text-celo-yellow">
              Rede principal: transações usam valor real.
            </p>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
              Revise moeda, valor e destino antes de confirmar.
            </p>
          </div>
        </section>

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
        />

        <ManifestoStrip />

        <footer className="grid grid-cols-[1fr_auto] items-end gap-4 py-5 font-mono text-[10px] font-bold uppercase text-warm-gray">
          <span>{"In\u00e1Pay / powered by Celo"}</span>
          <span className="text-right text-celo-white">mobile-first MVP</span>
        </footer>
      </main>
    </div>
  );
}

export function HomePage() {
  if (privyEnabled) {
    return <HomePageWithPrivy />;
  }

  return <HomePageContent embeddedWallet={disabledInapayEmbeddedWallet} />;
}
