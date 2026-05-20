"use client";

import { Header } from "@/components/layout/Header";
import { TransferCard } from "@/components/home/TransferCard";
import { useTransfer } from "@/hooks/useTransfer";

export function HomePage() {
  const {
    wallet,
    amount,
    recipient,
    status,
    message,
    txHash,
    txExplorerUrl,
    mounted,
    walletAvailable,
    isMiniPay,
    isConnecting,
    isSending,
    setAmount,
    setRecipient,
    connectWallet,
    disconnectWallet,
    sendCELO,
    resetStatus,
  } = useTransfer();

  return (
    <div className="flex min-h-dvh flex-col bg-celo-black">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-celo-yellow/15 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-celo-green/12 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-celo-black to-transparent" />
      </div>

      <Header
        isConnected={wallet.isConnected}
        address={wallet.address}
        isDemo={wallet.isDemo}
        onConnect={() => void connectWallet()}
        onDisconnect={disconnectWallet}
        isConnecting={isConnecting}
      />

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6 pb-10">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-celo-yellow/25 bg-celo-yellow/10 px-3 py-1 text-xs font-semibold text-celo-yellow">
            <span className="size-1.5 rounded-full bg-celo-green" aria-hidden />
            Pagamentos digitais com energia
          </p>
          <h1 className="text-2xl font-bold leading-tight text-celo-white sm:text-[1.75rem]">
            <span className="text-celo-yellow">InáPay</span> para enviar e
            receber em segundos
          </h1>
          <p className="text-sm leading-relaxed text-celo-white/60">
            Conecte-se com seu celular, informe valor e destino —
            simples como um Pix.
          </p>
          <p className="text-[11px] text-celo-white/35">Rede de teste</p>
        </div>

        <TransferCard
          wallet={wallet}
          amount={amount}
          recipient={recipient}
          status={status}
          message={message}
          txHash={txHash}
          txExplorerUrl={txExplorerUrl}
          mounted={mounted}
          walletAvailable={walletAvailable}
          isMiniPay={isMiniPay}
          isSending={isSending}
          onAmountChange={setAmount}
          onRecipientChange={setRecipient}
          onConnect={() => void connectWallet()}
          onSend={() => void sendCELO()}
          onResetStatus={resetStatus}
        />

        <footer className="text-center text-xs text-celo-white/30">
          InáPay · Powered by Celo
        </footer>
      </main>
    </div>
  );
}
