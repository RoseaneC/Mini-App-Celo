"use client";

import { Button } from "@/components/ui/Button";
import type { InapayEmbeddedWalletState } from "@/hooks/useInapayEmbeddedWallet";

type AuthEntryProps = {
  embeddedWallet: InapayEmbeddedWalletState;
  walletAvailable: boolean;
  isMiniPay: boolean;
  isMobileWithoutWallet: boolean;
  metamaskDeepLink: string;
  isBusy: boolean;
  onUseExistingWallet: () => void;
};

export function AuthEntry({
  embeddedWallet,
  walletAvailable,
  isMiniPay,
  isMobileWithoutWallet,
  metamaskDeepLink,
  isBusy,
  onUseExistingWallet,
}: AuthEntryProps) {
  const isPreparingAccount =
    embeddedWallet.isAuthenticated &&
    (!embeddedWallet.hasEmbeddedWallet ||
      embeddedWallet.isCreatingEmbeddedWallet ||
      !embeddedWallet.isEmbeddedActive);
  const authDisabled =
    !embeddedWallet.isPrivyReady ||
    embeddedWallet.isCreatingEmbeddedWallet ||
    isBusy;

  return (
    <div className="space-y-3 border-2 border-celo-white bg-celo-black p-3">
      <div className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-celo-white/25 pb-3">
        <div>
          <p className="text-2xl font-black uppercase leading-none text-celo-white">
            Conta
            <span className="block text-celo-yellow">InÃ¡Pay</span>
          </p>
        </div>
        <span className="font-mono text-[9px] font-black uppercase text-editorial-lilac">
          login
        </span>
      </div>

      {isPreparingAccount ? (
        <div className="border border-celo-yellow px-3 py-3 font-mono text-[10px] font-bold uppercase leading-relaxed text-celo-yellow">
          Preparando sua Conta InÃ¡Pay...
        </div>
      ) : null}

      {embeddedWallet.error ? (
        <div
          role="alert"
          className="border border-editorial-lilac bg-editorial-lilac px-3 py-3 font-mono text-[10px] font-bold uppercase leading-relaxed text-celo-black"
        >
          {embeddedWallet.error}
        </div>
      ) : null}

      {!embeddedWallet.isAuthenticated ? (
        <div className="space-y-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={authDisabled}
            onClick={embeddedWallet.loginWithGoogle}
          >
            Continuar com Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={authDisabled}
            onClick={embeddedWallet.loginWithPhone}
          >
            Continuar com telefone
          </Button>
        </div>
      ) : null}

      <div className="space-y-2 border-t border-celo-white/25 pt-3">
        <button
          type="button"
          disabled={authDisabled}
          onClick={onUseExistingWallet}
          className="w-full border-2 border-celo-white bg-celo-black px-3 py-3 text-sm font-black uppercase text-celo-white transition-colors hover:bg-celo-white hover:text-celo-black disabled:opacity-50"
        >
          Usar wallet existente
        </button>

        {isMobileWithoutWallet && !walletAvailable && !isMiniPay ? (
          <div className="space-y-2 font-mono text-[10px] font-bold uppercase leading-relaxed text-warm-gray">
            <p>
              Para MetaMask no celular, abra este app dentro do navegador da
              MetaMask ou do MiniPay.
            </p>
            <a
              href={metamaskDeepLink}
              className="block border border-editorial-lilac px-3 py-2 text-center text-editorial-lilac transition-colors hover:bg-editorial-lilac hover:text-celo-black"
            >
              Abrir na MetaMask
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
