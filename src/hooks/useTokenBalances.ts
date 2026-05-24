"use client";

import { useEffect, useMemo } from "react";
import { erc20Abi, formatUnits, zeroAddress } from "viem";
import type { Address } from "viem";
import { useBalance, useReadContracts } from "wagmi";
import { WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TokenId, TokenMetadata } from "@/lib/web3/tokens";

type TokenBalanceStatus = "loading" | "ready" | "placeholder" | "error";
type Web3Token = (typeof WEB3_TOKENS)[number];
type AvailableErc20Token = Extract<
  Web3Token,
  { type: "erc20"; available: true }
>;

export type TokenBalance = {
  token: TokenMetadata;
  amountLabel: string;
  status: TokenBalanceStatus;
  badgeLabel?: string;
};

type UseTokenBalancesParams = {
  address: string | null;
  enabled: boolean;
};

function maskAddress(address: string | null): string | null {
  if (!address) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTokenBalance(
  value: bigint,
  decimals: number,
  maxFractionDigits = 4,
): string {
  const raw = formatUnits(value, decimals);
  const [whole, fraction = ""] = raw.split(".");
  if (!fraction || /^0*$/.test(fraction)) return whole;
  const trimmed = fraction
    .slice(0, Math.min(decimals, maxFractionDigits))
    .replace(/0+$/, "");
  return trimmed ? `${whole},${trimmed}` : whole;
}

export function useTokenBalances({ address, enabled }: UseTokenBalancesParams) {
  const nativeToken = WEB3_TOKENS.find((token) => token.type === "native");
  const erc20Tokens = useMemo(
    () =>
      WEB3_TOKENS.filter(
        (token): token is AvailableErc20Token =>
          token.type === "erc20" &&
          token.available &&
          Boolean(token.contractAddress),
      ),
    [],
  );

  const { data: nativeBalance, isLoading: isNativeBalanceLoading } = useBalance({
    address: address ? (address as `0x${string}`) : undefined,
    chainId: nativeToken?.chainId,
    query: { enabled: enabled && Boolean(address) && Boolean(nativeToken) },
  });

  const erc20BalanceContracts = useMemo(
    () =>
      erc20Tokens.map((token) => ({
        address: token.contractAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address ? (address as Address) : zeroAddress],
        chainId: token.chainId,
      })),
    [address, erc20Tokens],
  );
  const shouldReadErc20Balances =
    enabled && Boolean(address) && erc20BalanceContracts.length > 0;

  const { data: erc20Balances, isLoading: isErc20BalancesLoading } =
    useReadContracts({
      contracts: erc20BalanceContracts,
      query: {
        enabled: shouldReadErc20Balances,
        refetchInterval: shouldReadErc20Balances ? 10_000 : false,
        refetchOnWindowFocus: true,
        staleTime: 0,
      },
    });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const usdcIndex = erc20Tokens.findIndex((token) => token.id === "USDC");
    const usdcToken = erc20Tokens[usdcIndex];
    const usdcBalance = erc20Balances?.[usdcIndex];
    const usdcRawBalance =
      usdcBalance?.status === "success" &&
      typeof usdcBalance.result === "bigint"
        ? usdcBalance.result
        : null;

    console.debug("[InáPay] USDC balanceOf debug", {
      enabled: shouldReadErc20Balances,
      wallet: maskAddress(address),
      contract: usdcToken?.contractAddress,
      chainId: usdcToken?.chainId,
      decimals: usdcToken?.decimals,
      status: usdcBalance?.status ?? "idle",
      rawBalance: usdcRawBalance?.toString() ?? null,
      formattedBalance:
        usdcRawBalance && usdcToken
          ? `${formatTokenBalance(
              usdcRawBalance,
              usdcToken.decimals,
              usdcToken.decimals,
            )} ${usdcToken.symbol}`
          : null,
    });
  }, [address, erc20Balances, erc20Tokens, shouldReadErc20Balances]);

  const erc20BalanceByTokenId = useMemo(() => {
    const balancesByTokenId = new Map<
      TokenId,
      { isError?: boolean; value?: bigint }
    >();

    erc20Tokens.forEach((token, index) => {
      const balance = erc20Balances?.[index];

      if (balance?.status === "success" && typeof balance.result === "bigint") {
        balancesByTokenId.set(token.id, { value: balance.result });
      } else if (balance?.status === "failure") {
        balancesByTokenId.set(token.id, { isError: true });
      }
    });

    return balancesByTokenId;
  }, [erc20Balances, erc20Tokens]);

  const balances = useMemo<TokenBalance[]>(
    () =>
      WEB3_TOKENS.map((token) => {
        if (token.type === "native") {
          if (isNativeBalanceLoading) {
            return {
              token,
              amountLabel: "Carregando...",
              status: "loading",
            };
          }

          return {
            token,
            amountLabel: nativeBalance
              ? `${formatTokenBalance(nativeBalance.value, nativeBalance.decimals)} ${token.symbol}`
              : `— ${token.symbol}`,
            status: "ready",
          };
        }

        if (token.available && token.contractAddress) {
          if (isErc20BalancesLoading) {
            return {
              token,
              amountLabel: "Carregando...",
              status: "loading",
            };
          }

          const erc20Balance = erc20BalanceByTokenId.get(token.id);

          if (erc20Balance?.isError) {
            return {
              token,
              amountLabel: `Erro ${token.symbol}`,
              status: "error",
            };
          }

          return {
            token,
            amountLabel:
              erc20Balance?.value !== undefined
                ? `${formatTokenBalance(
                    erc20Balance.value,
                    token.decimals,
                    token.decimals,
                  )} ${token.symbol}`
                : `— ${token.symbol}`,
            status: "ready",
          };
        }

        return {
          token,
          amountLabel: `— ${token.symbol}`,
          status: "placeholder",
          badgeLabel: "Em breve",
        };
      }),
    [
      erc20BalanceByTokenId,
      isErc20BalancesLoading,
      isNativeBalanceLoading,
      nativeBalance,
    ],
  );

  const activeBalance = balances.find(
    (balance) => balance.token.id === ("CELO" satisfies TokenId),
  );

  return {
    balances,
    activeBalance,
  };
}
