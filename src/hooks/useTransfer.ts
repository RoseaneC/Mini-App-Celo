"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  encodePacked,
  erc20Abi,
  isAddress,
  keccak256,
  parseUnits,
  zeroAddress,
} from "viem";
import type { Address, Hash } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useConnectors,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  CELO_DECIMALS,
  CELO_MAINNET_CHAIN_HEX_ID,
  CELO_MAINNET_CHAIN_ID,
  CELO_MAINNET_EXPLORER_URL,
  CELO_MAINNET_EXPLORER_TX_URL,
  CELO_MAINNET_RPC_URL,
  NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS,
} from "@/lib/web3/constants";
import { INAPAY_REGISTRY_ABI } from "@/lib/web3/inapayRegistry";
import { ACTIVE_SEND_TOKEN_ID, WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TokenId } from "@/lib/web3/tokens";
import type {
  PaymentReceiptData,
  RegistryStatus,
  TransferStatus,
  WalletConnectionState,
} from "@/types/transfer";

const DEMO_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
const CONNECTION_TIMEOUT_MS = 25_000;

type RegistryPaymentInput = {
  receiver: Address;
  tokenAddress: Address;
  amountUnits: bigint;
  paymentTxHash: Hash;
};

type WalletError = Error & {
  code?: number;
};

type SwitchToMainnetOptions = {
  updateTransferStatus?: boolean;
};

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum);
}

function hasMiniPayProvider(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum?.isMiniPay);
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );
}

function getMetaMaskDeepLink(): string {
  if (typeof window === "undefined") return "https://metamask.app.link/dapp/";

  const dappUrl = window.location.href.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${dappUrl}`;
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

function parseAmountToUnits(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");

  try {
    const units = parseUnits(normalized, decimals);
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

function getFriendlyTransactionError(err: unknown): string {
  const message = getErrorMessage(err);

  if (
    message.includes("does not match the target chain") ||
    message.includes("current chain") ||
    message.includes("Chain mismatch")
  ) {
    return "Abra sua wallet e confirme a troca para Celo Mainnet.";
  }

  return message;
}

function shouldAddCeloMainnet(err: unknown): boolean {
  const walletError = err as WalletError;
  const message = getErrorMessage(err).toLowerCase();

  return (
    walletError.code === 4902 ||
    message.includes("unrecognized chain") ||
    message.includes("not been added") ||
    message.includes("unknown chain")
  );
}

async function addCeloMainnetToWallet() {
  if (!window.ethereum?.request) {
    throw new Error("Carteira indisponível para adicionar a Celo Mainnet.");
  }

  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: CELO_MAINNET_CHAIN_HEX_ID,
        chainName: "Celo Mainnet",
        nativeCurrency: {
          name: "CELO",
          symbol: "CELO",
          decimals: CELO_DECIMALS,
        },
        rpcUrls: [CELO_MAINNET_RPC_URL],
        blockExplorerUrls: [CELO_MAINNET_EXPLORER_URL],
      },
    ],
  });
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
  const isMobileWithoutWallet =
    mounted && isMobileBrowser() && !walletAvailable && !isMiniPay;

  const [demoConnected, setDemoConnected] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedTokenId, setSelectedTokenId] =
    useState<TokenId>(ACTIVE_SEND_TOKEN_ID);
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [registryStatus, setRegistryStatus] =
    useState<RegistryStatus>("idle");
  const [registryMessage, setRegistryMessage] = useState<string | null>(null);
  const [registryTxHash, setRegistryTxHash] = useState<Hash | null>(null);
  const [paymentReceipt, setPaymentReceipt] =
    useState<PaymentReceiptData | null>(null);
  const miniPayAutoConnectAttempted = useRef(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchChainPending } =
    useSwitchChain();
  const { sendTransactionAsync, isPending: isSendPending } =
    useSendTransaction();
  const { writeContractAsync, isPending: isWriteContractPending } =
    useWriteContract();
  const publicClient = usePublicClient({ chainId: CELO_MAINNET_CHAIN_ID });
  const connectors = useConnectors();

  const selectedToken = useMemo(
    () =>
      WEB3_TOKENS.find((token) => token.id === selectedTokenId) ??
      WEB3_TOKENS[0],
    [selectedTokenId],
  );
  const usdcToken = useMemo(
    () => WEB3_TOKENS.find((token) => token.id === "USDC"),
    [],
  );
  const metamaskDeepLink = useMemo(
    () => (mounted ? getMetaMaskDeepLink() : "https://metamask.app.link/dapp/"),
    [mounted],
  );
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
  const needsMainnetSwitch =
    wallet.isConnected && !wallet.isDemo && chainId !== CELO_MAINNET_CHAIN_ID;

  const injectedConnector = useMemo(
    () => connectors.find((c) => c.type === "injected") ?? connectors[0],
    [connectors],
  );

  const clearRegistryFeedback = useCallback(() => {
    setRegistryStatus("idle");
    setRegistryMessage(null);
    setRegistryTxHash(null);
  }, []);

  const clearTransferFeedback = useCallback(() => {
    if (status !== "loading" && registryStatus !== "loading") {
      setStatus("idle");
      setMessage(null);
      setTxHash(null);
      setPaymentReceipt(null);
      clearRegistryFeedback();
    }
  }, [clearRegistryFeedback, registryStatus, status]);

  const connectWallet = useCallback(async () => {
    setMessage(null);
    setTxHash(null);
    setPaymentReceipt(null);
    clearRegistryFeedback();

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
        : "Conectando carteira na Celo Mainnet...",
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
  }, [
    walletAvailable,
    injectedConnector,
    connectAsync,
    isMiniPay,
    clearRegistryFeedback,
  ]);

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
    setPaymentReceipt(null);
    clearRegistryFeedback();
  }, [clearRegistryFeedback, disconnect, isConnected]);

  const sendDemoCELO = useCallback(async () => {
    setStatus("loading");
    setMessage("Enviando CELO (modo demo)...");
    setTxHash(null);
    setPaymentReceipt(null);

    await new Promise((r) => setTimeout(r, 1500));

    setStatus("success");
    setMessage(
      `Envio simulado de ${amount.trim()} CELO concluído (modo demo).`,
    );
    setAmount("");
    setRecipient("");
  }, [amount]);

  const switchToMainnet = useCallback(
    async (
      options: SwitchToMainnetOptions = {},
    ): Promise<boolean> => {
      if (chainId === CELO_MAINNET_CHAIN_ID) return true;

      const updateTransferStatus = options.updateTransferStatus ?? true;

      if (updateTransferStatus) {
        setStatus("loading");
        setMessage("Abra sua wallet e confirme a troca para Celo Mainnet.");
      }

      try {
        await switchChainAsync({ chainId: CELO_MAINNET_CHAIN_ID });

        if (updateTransferStatus) {
          setStatus("idle");
          setMessage(null);
        }

        return true;
      } catch (err) {
        if (shouldAddCeloMainnet(err)) {
          try {
            if (updateTransferStatus) {
              setMessage("Adicione a Celo Mainnet na sua wallet para continuar.");
            }

            await addCeloMainnetToWallet();
            await switchChainAsync({ chainId: CELO_MAINNET_CHAIN_ID });

            if (updateTransferStatus) {
              setStatus("idle");
              setMessage(null);
            }

            return true;
          } catch {
            if (updateTransferStatus) {
              setStatus("error");
              setMessage("Abra sua wallet e confirme a troca para Celo Mainnet.");
            }

            return false;
          }
        }

        if (updateTransferStatus) {
          setStatus("error");
          setMessage("Abra sua wallet e confirme a troca para Celo Mainnet.");
        }

        return false;
      }
    },
    [chainId, switchChainAsync],
  );

  const ensureMainnetNetwork = useCallback(async (): Promise<boolean> => {
    if (chainId === CELO_MAINNET_CHAIN_ID) return true;

    setStatus("error");
    setMessage(
      "Sua carteira está em outra rede. Troque para Celo Mainnet para continuar.",
    );
    return false;
  }, [chainId]);

  const recordPaymentOnRegistry = useCallback(
    async ({
      receiver,
      tokenAddress,
      amountUnits,
      paymentTxHash,
    }: RegistryPaymentInput) => {
      setRegistryTxHash(null);

      if (!address || !isAddress(address)) {
        setRegistryStatus("error");
        setRegistryMessage(
          "Pagamento confirmado. Aviso: carteira do pagador indisponível para registrar o comprovante.",
        );
        return null;
      }

      if (
        !NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS ||
        !isAddress(NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS)
      ) {
        setRegistryStatus("error");
        setRegistryMessage(
          "Pagamento confirmado. Aviso: registry on-chain não configurado.",
        );
        return null;
      }

      if (!publicClient) {
        setRegistryStatus("error");
        setRegistryMessage(
          "Pagamento confirmado. Aviso: cliente da Celo Mainnet indisponível para registrar o comprovante.",
        );
        return null;
      }

      const sender = address as Address;
      const registryAddress = NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS as Address;
      const timestamp = BigInt(Date.now());
      const paymentRef = keccak256(
        encodePacked(
          ["address", "address", "address", "uint256", "bytes32", "uint256"],
          [sender, receiver, tokenAddress, amountUnits, paymentTxHash, timestamp],
        ),
      );

      try {
        if (chainId !== CELO_MAINNET_CHAIN_ID) {
          setRegistryStatus("loading");
          setRegistryMessage("Abra sua wallet e confirme a troca para Celo Mainnet.");

          const onMainnet = await switchToMainnet({
            updateTransferStatus: false,
          });

          if (!onMainnet) {
            setRegistryStatus("error");
            setRegistryMessage(
              "Pagamento confirmado. Registro on-chain do comprovante não foi salvo.",
            );
            return null;
          }
        }

        setRegistryStatus("loading");
        setRegistryMessage("Registrando comprovante on-chain...");

        const registryHash = await writeContractAsync({
          address: registryAddress,
          abi: INAPAY_REGISTRY_ABI,
          functionName: "recordPayment",
          args: [receiver, tokenAddress, amountUnits, paymentRef],
          chainId: CELO_MAINNET_CHAIN_ID,
        });

        setRegistryTxHash(registryHash);
        setRegistryMessage(
          "Comprovante enviado. Aguardando confirmação on-chain...",
        );

        await publicClient.waitForTransactionReceipt({ hash: registryHash });

        setRegistryStatus("success");
        setRegistryMessage("Comprovante registrado on-chain.");

        return { registryHash, paymentRef };
      } catch (err) {
        setRegistryStatus("error");
        setRegistryMessage(
          `Pagamento confirmado. Aviso: comprovante não registrado on-chain. ${getErrorMessage(err)}`,
        );
        return null;
      }
    },
    [address, chainId, publicClient, switchToMainnet, writeContractAsync],
  );

  const sendCELO = useCallback(async () => {
    setTxHash(null);
    setPaymentReceipt(null);
    clearRegistryFeedback();

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

    const amountUnits = parseAmountToUnits(trimmedAmount, CELO_DECIMALS);
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
    setMessage("Enviando CELO na Celo Mainnet...");

    const onMainnet = await ensureMainnetNetwork();
    if (!onMainnet) return;

    try {
      const hash = await sendTransactionAsync({
        to: trimmedRecipient as `0x${string}`,
        value: amountUnits,
        chainId: CELO_MAINNET_CHAIN_ID,
      });

      setTxHash(hash);
      setMessage("Transação enviada. Aguardando confirmação na rede...");

      if (!publicClient) {
        throw new Error("Cliente da Celo Mainnet indisponível.");
      }

      await publicClient.waitForTransactionReceipt({ hash });

      setStatus("success");
      setMessage(`Pagamento confirmado: ${trimmedAmount} CELO enviado.`);
      setPaymentReceipt({
        amount: trimmedAmount,
        tokenSymbol: "CELO",
        recipient: trimmedRecipient as Address,
        createdAt: new Date().toISOString(),
        paymentHash: hash,
        paymentExplorerUrl: `${CELO_MAINNET_EXPLORER_TX_URL}${hash}`,
      });

      await recordPaymentOnRegistry({
        receiver: trimmedRecipient as Address,
        tokenAddress: zeroAddress,
        amountUnits,
        paymentTxHash: hash,
      });

      setAmount("");
      setRecipient("");
    } catch (err) {
      setStatus("error");
      setMessage(getFriendlyTransactionError(err));
    }
  }, [
    wallet.isConnected,
    wallet.isDemo,
    amount,
    recipient,
    clearRegistryFeedback,
    sendDemoCELO,
    ensureMainnetNetwork,
    sendTransactionAsync,
    publicClient,
    recordPaymentOnRegistry,
  ]);

  const sendUSDC = useCallback(async () => {
    setTxHash(null);
    setPaymentReceipt(null);
    clearRegistryFeedback();

    if (!wallet.isConnected) {
      setStatus("error");
      setMessage("Conecte sua carteira antes de enviar.");
      return;
    }

    if (wallet.isDemo) {
      setStatus("error");
      setMessage("Envio real de USDC requer uma carteira conectada.");
      return;
    }

    if (!usdcToken?.available || !usdcToken.contractAddress) {
      setStatus("error");
      setMessage("USDC não está disponível para envio neste momento.");
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      setStatus("error");
      setMessage("Informe um valor válido.");
      return;
    }

    const amountUnits = parseAmountToUnits(trimmedAmount, usdcToken.decimals);
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

    setStatus("loading");
    setMessage("Enviando USDC na Celo Mainnet...");

    const onMainnet = await ensureMainnetNetwork();
    if (!onMainnet) return;

    try {
      const hash = await writeContractAsync({
        address: usdcToken.contractAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [trimmedRecipient as Address, amountUnits],
        chainId: CELO_MAINNET_CHAIN_ID,
      });

      setTxHash(hash);
      setMessage("Transação de USDC enviada. Aguardando confirmação na rede...");

      if (!publicClient) {
        throw new Error("Cliente da Celo Mainnet indisponível.");
      }

      await publicClient.waitForTransactionReceipt({ hash });

      setStatus("success");
      setMessage(`Pagamento confirmado: ${trimmedAmount} USDC enviado.`);
      setPaymentReceipt({
        amount: trimmedAmount,
        tokenSymbol: "USDC",
        recipient: trimmedRecipient as Address,
        createdAt: new Date().toISOString(),
        paymentHash: hash,
        paymentExplorerUrl: `${CELO_MAINNET_EXPLORER_TX_URL}${hash}`,
      });

      await recordPaymentOnRegistry({
        receiver: trimmedRecipient as Address,
        tokenAddress: usdcToken.contractAddress,
        amountUnits,
        paymentTxHash: hash,
      });

      setAmount("");
      setRecipient("");
    } catch (err) {
      setStatus("error");
      setMessage(getFriendlyTransactionError(err));
    }
  }, [
    wallet.isConnected,
    wallet.isDemo,
    usdcToken,
    amount,
    recipient,
    clearRegistryFeedback,
    ensureMainnetNetwork,
    writeContractAsync,
    publicClient,
    recordPaymentOnRegistry,
  ]);

  const sendSelectedToken = useCallback(async () => {
    if (!selectedToken.available) {
      setStatus("error");
      setMessage(`${selectedToken.symbol} está em validação para mainnet.`);
      return;
    }

    if (selectedTokenId === "CELO") {
      await sendCELO();
      return;
    }

    if (selectedTokenId === "USDC") {
      await sendUSDC();
      return;
    }

    setStatus("error");
    setMessage("Token indisponível para envio na Celo Mainnet.");
  }, [selectedToken, selectedTokenId, sendCELO, sendUSDC]);

  const isConnecting = status === "loading" && !wallet.isConnected;

  const isSending = status === "loading" && wallet.isConnected;
  const isRegistryRecording = registryStatus === "loading";

  return {
    wallet,
    amount,
    recipient,
    selectedToken,
    selectedTokenId,
    status,
    message,
    txHash,
    txExplorerUrl: txHash
      ? `${CELO_MAINNET_EXPLORER_TX_URL}${txHash}`
      : null,
    registryStatus,
    registryMessage,
    registryTxHash,
    registryExplorerUrl: registryTxHash
      ? `${CELO_MAINNET_EXPLORER_TX_URL}${registryTxHash}`
      : null,
    paymentReceipt,
    mounted,
    walletAvailable,
    isMiniPay,
    isMobileWithoutWallet,
    metamaskDeepLink,
    needsMainnetSwitch,
    currentChainId: chainId,
    isConnecting,
    isSending:
      isSending ||
      isRegistryRecording ||
      isSwitchChainPending ||
      isSendPending ||
      isWriteContractPending,
    isSwitchingNetwork: isSwitchChainPending,
    setAmount,
    setRecipient,
    setSelectedTokenId,
    connectWallet,
    disconnectWallet,
    switchToMainnet,
    sendSelectedToken,
    sendCELO,
    resetStatus: clearTransferFeedback,
  };
}
