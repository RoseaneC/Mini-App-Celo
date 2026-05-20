"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { isAddress, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useConnectors,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import {
  CELO_DECIMALS,
  CELO_SEPOLIA_CHAIN_ID,
  CELO_SEPOLIA_EXPLORER_TX_URL,
} from "@/lib/web3/constants";
import type { TransferStatus, WalletConnectionState } from "@/types/transfer";

const DEMO_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
const CONNECTION_TIMEOUT_MS = 25_000;

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum);
}

function hasMiniPayProvider(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum?.isMiniPay);
}

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function parseAmountToUnits(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");

  try {
    const units = parseUnits(normalized, CELO_DECIMALS);
    if (units <= BigInt(0)) return null;
    return units;
  } catch {
    return null;
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

async function withConnectionTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          "Não foi possível concluir a conexão. Tente novamente pela carteira.",
        ),
      );
    }, CONNECTION_TIMEOUT_MS);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      },
    );
  });
}

export function useTransfer() {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const walletAvailable = mounted && hasInjectedProvider();
  const isMiniPay = mounted && hasMiniPayProvider();

  const [demoConnected, setDemoConnected] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const miniPayAutoConnectAttempted = useRef(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending: isSendPending } =
    useSendTransaction();
  const publicClient = usePublicClient({ chainId: CELO_SEPOLIA_CHAIN_ID });
  const connectors = useConnectors();

  const wallet: WalletConnectionState = useMemo(() => {
    if (!mounted) {
      return { isConnected: false, address: null, isDemo: false };
    }

    if (isConnected && address) {
      return { isConnected: true, address, isDemo: false };
    }

    if (demoConnected) {
      return { isConnected: true, address: DEMO_ADDRESS, isDemo: true };
    }

    return { isConnected: false, address: null, isDemo: false };
  }, [mounted, isConnected, address, demoConnected]);

  const injectedConnector = useMemo(
    () => connectors.find((c) => c.type === "injected") ?? connectors[0],
    [connectors],
  );

  const clearTransferFeedback = useCallback(() => {
    if (status !== "loading") {
      setStatus("idle");
      setMessage(null);
      setTxHash(null);
    }
  }, [status]);

  const connectWallet = useCallback(async () => {
    setMessage(null);
    setTxHash(null);

    if (!walletAvailable) {
      setStatus("loading");
      setMessage("Modo demo: conectando carteira simulada...");
      await new Promise((r) => setTimeout(r, 600));
      setDemoConnected(true);
      setStatus("idle");
      setMessage(null);
      return;
    }

    if (!injectedConnector) {
      setStatus("error");
      setMessage(
        "MetaMask ou outra carteira injetada não foi encontrada. Instale uma extensão ou use o modo demo.",
      );
      return;
    }

    setStatus("loading");
    setMessage(
      isMiniPay
        ? "Conectando MiniPay..."
        : "Conectando carteira na rede Celo Sepolia...",
    );

    try {
      await withConnectionTimeout(connectAsync({
        connector: injectedConnector,
      }));
      setDemoConnected(false);
      setStatus("idle");
      setMessage(null);
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err));
    }
  }, [walletAvailable, injectedConnector, connectAsync, isMiniPay]);

  useEffect(() => {
    if (
      !isMiniPay ||
      !walletAvailable ||
      isConnected ||
      demoConnected ||
      !injectedConnector ||
      miniPayAutoConnectAttempted.current
    ) {
      return;
    }

    miniPayAutoConnectAttempted.current = true;
    void connectWallet();
  }, [
    isMiniPay,
    walletAvailable,
    isConnected,
    demoConnected,
    injectedConnector,
    connectWallet,
  ]);

  const disconnectWallet = useCallback(() => {
    if (isConnected) {
      disconnect();
    }
    setDemoConnected(false);
    setStatus("idle");
    setMessage(null);
    setTxHash(null);
  }, [disconnect, isConnected]);

  const sendDemoCELO = useCallback(async () => {
    setStatus("loading");
    setMessage("Enviando CELO (modo demo)...");
    setTxHash(null);

    await new Promise((r) => setTimeout(r, 1500));

    setStatus("success");
    setMessage(
      `Envio simulado de ${amount.trim()} CELO concluído (modo demo).`,
    );
    setAmount("");
    setRecipient("");
  }, [amount]);

  const ensureSepoliaNetwork = useCallback(async (): Promise<boolean> => {
    if (chainId === CELO_SEPOLIA_CHAIN_ID) return true;

    setMessage("Alternando para a rede Celo Sepolia...");

    try {
      await switchChainAsync({ chainId: CELO_SEPOLIA_CHAIN_ID });
      return true;
    } catch (err) {
      setStatus("error");
      setMessage(
        `Rede incorreta. Selecione Celo Sepolia (chainId ${CELO_SEPOLIA_CHAIN_ID}) na carteira. ${getErrorMessage(err)}`,
      );
      return false;
    }
  }, [chainId, switchChainAsync]);

  const sendCELO = useCallback(async () => {
    setTxHash(null);

    if (!wallet.isConnected) {
      setStatus("error");
      setMessage("Conecte sua carteira antes de enviar.");
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      setStatus("error");
      setMessage("Informe um valor válido.");
      return;
    }

    const amountUnits = parseAmountToUnits(trimmedAmount);
    if (amountUnits === null) {
      setStatus("error");
      setMessage("Informe um valor válido.");
      return;
    }

    const trimmedRecipient = recipient.trim();
    if (!isAddress(trimmedRecipient)) {
      setStatus("error");
      setMessage("Endereço inválido. Verifique o endereço do destinatário.");
      return;
    }

    if (wallet.isDemo) {
      await sendDemoCELO();
      return;
    }

    setStatus("loading");
    setMessage("Enviando CELO na Celo Sepolia...");

    const onSepolia = await ensureSepoliaNetwork();
    if (!onSepolia) return;

    try {
      const hash = await sendTransactionAsync({
        to: trimmedRecipient as `0x${string}`,
        value: amountUnits,
        chainId: CELO_SEPOLIA_CHAIN_ID,
      });

      setTxHash(hash);
      setMessage("Transação enviada. Aguardando confirmação na rede...");

      if (!publicClient) {
        throw new Error("Cliente da rede Celo Sepolia indisponível.");
      }

      await publicClient.waitForTransactionReceipt({ hash });

      setStatus("success");
      setMessage(
        `Envio de ${trimmedAmount} CELO concluído com sucesso na Celo Sepolia.`,
      );
      setAmount("");
      setRecipient("");
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err));
    }
  }, [
    wallet.isConnected,
    wallet.isDemo,
    amount,
    recipient,
    sendDemoCELO,
    ensureSepoliaNetwork,
    sendTransactionAsync,
    publicClient,
  ]);

  const isConnecting = status === "loading" && !wallet.isConnected;

  const isSending = status === "loading" && wallet.isConnected;

  return {
    wallet,
    amount,
    recipient,
    status,
    message,
    txHash,
    txExplorerUrl: txHash
      ? `${CELO_SEPOLIA_EXPLORER_TX_URL}${txHash}`
      : null,
    mounted,
    walletAvailable,
    isMiniPay,
    isConnecting,
    isSending: isSending || isSendPending,
    setAmount,
    setRecipient,
    connectWallet,
    disconnectWallet,
    sendCELO,
    resetStatus: clearTransferFeedback,
  };
}
