import { CELO_DECIMALS, CELO_MAINNET_CHAIN_ID } from "./constants";

export type TokenId = "CELO" | "USDC" | "USDT";

export type TokenType = "native" | "erc20";

export type TokenMetadata = {
  id: TokenId;
  symbol: TokenId;
  name: string;
  decimals: number;
  type: TokenType;
  chainId: number;
  contractAddress?: `0x${string}`;
  available: boolean;
};

export const ACTIVE_SEND_TOKEN_ID: TokenId = "CELO";

export const WEB3_TOKENS = [
  {
    id: "CELO",
    symbol: "CELO",
    name: "Celo",
    decimals: CELO_DECIMALS,
    type: "native",
    chainId: CELO_MAINNET_CHAIN_ID,
    available: true,
  },
  {
    id: "USDC",
    symbol: "USDC",
    name: "USDC",
    decimals: 6,
    type: "erc20",
    chainId: CELO_MAINNET_CHAIN_ID,
    contractAddress: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    available: true,
  },
  {
    id: "USDT",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    type: "erc20",
    chainId: CELO_MAINNET_CHAIN_ID,
    available: false,
  },
] as const satisfies readonly TokenMetadata[];
