interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isMiniPay?: boolean;
    request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}
