/**
 * Tipos compartilhados para integração futura com wagmi / viem.
 * Não importar bibliotecas aqui — apenas contratos da camada Web3.
 */

export type Web3ChainId = number;

export type Web3ConnectorId = "minipay" | "injected" | "walletConnect";

export type SendTokenParams = {
  to: `0x${string}`;
  amount: string;
  token: "CELO";
};

export type SendTokenResult = {
  hash: `0x${string}`;
};
