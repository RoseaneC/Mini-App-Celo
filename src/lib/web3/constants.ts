/** Celo Mainnet — rede principal do app */
export const CELO_MAINNET_CHAIN_ID = 42220;

export const CELO_MAINNET_CHAIN_HEX_ID = "0xa4ec" as const;

export const CELO_DECIMALS = 18;

export const CELO_MAINNET_RPC_URL = "https://forno.celo.org" as const;

export const CELO_MAINNET_EXPLORER_TX_URL =
  "https://celoscan.io/tx/" as const;

export const CELO_MAINNET_EXPLORER_URL = "https://celoscan.io" as const;

export const DEFAULT_INAPAY_REGISTRY_ADDRESS =
  "0x56C5B94f05C0888E9a4106200A69841D25C902Cd" as const;

const configuredInapayRegistryAddress =
  process.env.NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS;

export const NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS = (
  configuredInapayRegistryAddress || DEFAULT_INAPAY_REGISTRY_ADDRESS
) as `0x${string}`;
