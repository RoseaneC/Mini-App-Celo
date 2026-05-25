export type TransferStatus = "idle" | "loading" | "success" | "error";

export type RegistryStatus = "idle" | "loading" | "success" | "error";

export type PaymentReceiptData = {
  amount: string;
  tokenSymbol: "CELO" | "USDC";
  recipient: `0x${string}`;
  createdAt: string;
  paymentHash: `0x${string}`;
  paymentExplorerUrl: string;
};

export type WalletConnectionState = {
  isConnected: boolean;
  address: string | null;
  isDemo: boolean;
};
