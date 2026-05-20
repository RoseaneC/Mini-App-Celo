export type TransferStatus = "idle" | "loading" | "success" | "error";

export type WalletConnectionState = {
  isConnected: boolean;
  address: string | null;
  isDemo: boolean;
};
