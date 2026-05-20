import { createConfig, fallback, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celoSepolia } from "viem/chains";
import { CELO_SEPOLIA_CHAIN_ID, CELO_SEPOLIA_RPC_URL } from "./constants";

export const wagmiConfig = createConfig({
  chains: [celoSepolia],
  connectors: [injected()],
  transports: {
    [celoSepolia.id]: fallback([http(CELO_SEPOLIA_RPC_URL)]),
  },
  ssr: true,
});

/**
 * Metadados estáticos da app (UI, validações).
 * Transações usam `wagmiConfig` + viem.
 */
export const web3Config = {
  chain: celoSepolia,
  chainId: CELO_SEPOLIA_CHAIN_ID,
  chainName: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  connectors: ["injected"] as const,
} as const;
