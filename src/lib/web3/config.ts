import { createConfig as createPrivyConfig } from "@privy-io/wagmi";
import { createConfig, fallback, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "viem/chains";
import { CELO_MAINNET_CHAIN_ID, CELO_MAINNET_RPC_URL } from "./constants";

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: {
    [celo.id]: fallback([http(CELO_MAINNET_RPC_URL)]),
  },
  ssr: true,
});

export const privyWagmiConfig = createPrivyConfig({
  chains: [celo],
  transports: {
    [celo.id]: fallback([http(CELO_MAINNET_RPC_URL)]),
  },
});

/**
 * Metadados estáticos da app (UI, validações).
 * Transações usam `wagmiConfig` + viem.
 */
export const web3Config = {
  chain: celo,
  chainId: CELO_MAINNET_CHAIN_ID,
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  connectors: ["injected"] as const,
} as const;
