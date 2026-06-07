"use client";

import {
  useCreateWallet,
  useLogin,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import type { ConnectedWallet } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";

export type InapayEmbeddedWalletState = {
  isEnabled: boolean;
  isPrivyReady: boolean;
  isAuthenticated: boolean;
  isCreatingEmbeddedWallet: boolean;
  hasEmbeddedWallet: boolean;
  isEmbeddedActive: boolean;
  embeddedWalletAddress: string | null;
  accountLabel: string;
  accountDetail: string | null;
  error: string | null;
  loginWithGoogle: () => void;
  loginWithPhone: () => void;
  connectExistingWallet: () => void;
  logout: () => Promise<void>;
};

export const disabledInapayEmbeddedWallet: InapayEmbeddedWalletState = {
  isEnabled: false,
  isPrivyReady: true,
  isAuthenticated: false,
  isCreatingEmbeddedWallet: false,
  hasEmbeddedWallet: false,
  isEmbeddedActive: false,
  embeddedWalletAddress: null,
  accountLabel: "Carteira",
  accountDetail: null,
  error: null,
  loginWithGoogle: () => {},
  loginWithPhone: () => {},
  connectExistingWallet: () => {},
  logout: async () => {},
};

function getEmbeddedWallet(wallets: ConnectedWallet[]) {
  return wallets.find((wallet) => wallet.walletClientType === "privy") ?? null;
}

function shortenAddress(address: string | null) {
  if (!address) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "";
}

function getAuthErrorMessage(err: unknown): string | null {
  const message = getErrorMessage(err).toLowerCase();

  if (!message) {
    return "Não conseguimos abrir esse login agora. Tente novamente ou use uma wallet existente.";
  }

  if (
    message.includes("not allowed") ||
    message.includes("not enabled") ||
    message.includes("login with sms not allowed") ||
    message.includes("login with google not allowed") ||
    message.includes("login with wallet not allowed")
  ) {
    return "Esse método ainda precisa ser habilitado no Privy Dashboard.";
  }

  if (
    message.includes("user exited") ||
    message.includes("user rejected") ||
    message.includes("cancel")
  ) {
    return null;
  }

  return "Não conseguimos abrir esse login agora. Tente novamente ou use uma wallet existente.";
}

function getEmbeddedWalletErrorMessage() {
  return "Não conseguimos preparar sua Conta InáPay agora. Você ainda pode usar uma wallet existente.";
}

export function useInapayEmbeddedWallet(): InapayEmbeddedWalletState {
  const [error, setError] = useState<string | null>(null);
  const [isCreatingEmbeddedWallet, setIsCreatingEmbeddedWallet] =
    useState(false);
  const createAttemptedRef = useRef(false);

  const { address } = useAccount();
  const { ready, authenticated, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const { login } = useLogin({
    onComplete: () => setError(null),
    onError: (loginError) => setError(getAuthErrorMessage(loginError)),
  });

  const embeddedWallet = useMemo(() => getEmbeddedWallet(wallets), [wallets]);
  const embeddedWalletAddress = embeddedWallet?.address ?? null;
  const isEmbeddedActive =
    Boolean(address && embeddedWalletAddress) &&
    address?.toLowerCase() === embeddedWalletAddress?.toLowerCase();

  useEffect(() => {
    if (!ready || !walletsReady || !authenticated) return;
    if (embeddedWallet || isCreatingEmbeddedWallet || createAttemptedRef.current) {
      return;
    }

    createAttemptedRef.current = true;
    setIsCreatingEmbeddedWallet(true);
    setError(null);

    createWallet()
      .catch(() => setError(getEmbeddedWalletErrorMessage()))
      .finally(() => setIsCreatingEmbeddedWallet(false));
  }, [
    authenticated,
    createWallet,
    embeddedWallet,
    isCreatingEmbeddedWallet,
    ready,
    walletsReady,
  ]);

  useEffect(() => {
    if (!ready || !walletsReady || !authenticated || !embeddedWallet) return;
    if (isEmbeddedActive) return;

    setActiveWallet(embeddedWallet).catch(() =>
      setError(getEmbeddedWalletErrorMessage()),
    );
  }, [
    authenticated,
    embeddedWallet,
    isEmbeddedActive,
    ready,
    setActiveWallet,
    walletsReady,
  ]);

  const loginWithGoogle = useCallback(() => {
    setError(null);
    login({
      loginMethods: ["google"],
      walletChainType: "ethereum-only",
    });
  }, [login]);

  const loginWithPhone = useCallback(() => {
    setError(null);
    login({
      loginMethods: ["sms"],
      walletChainType: "ethereum-only",
    });
  }, [login]);

  const connectExistingWallet = useCallback(() => {
    setError(null);
    login({
      loginMethods: ["wallet"],
      walletChainType: "ethereum-only",
    });
  }, [login]);

  const logoutAccount = useCallback(async () => {
    setError(null);
    createAttemptedRef.current = false;
    await logout();
  }, [logout]);

  return {
    isEnabled: true,
    isPrivyReady: ready && walletsReady,
    isAuthenticated: authenticated,
    isCreatingEmbeddedWallet,
    hasEmbeddedWallet: Boolean(embeddedWallet),
    isEmbeddedActive,
    embeddedWalletAddress,
    accountLabel: isEmbeddedActive ? "Conta InáPay" : "Carteira",
    accountDetail: shortenAddress(embeddedWalletAddress),
    error,
    loginWithGoogle,
    loginWithPhone,
    connectExistingWallet,
    logout: logoutAccount,
  };
}
