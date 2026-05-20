"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import { WEB3_TOKENS } from "@/lib/web3/tokens";
import type { TokenId, TokenMetadata } from "@/lib/web3/tokens";

type TokenBalanceStatus = "loading" | "ready" | "placeholder";

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

function formatTokenBalance(value: bigint, decimals: number): string {
  const raw = formatUnits(value, decimals);
  const [whole, fraction = ""] = raw.split(".");
  if (!fraction || /^0*$/.test(fraction)) return whole;
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${whole},${trimmed}` : whole;
}

export function useTokenBalances({ address, enabled }: UseTokenBalancesParams) {
  const nativeToken = WEB3_TOKENS.find((token) => token.type === "native");

  const { data: nativeBalance, isLoading: isNativeBalanceLoading } = useBalance({
    address: address ? (address as `0x${string}`) : undefined,
    chainId: nativeToken?.chainId,
    query: { enabled: enabled && Boolean(address) && Boolean(nativeToken) },
  });

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

        return {
          token,
          amountLabel: `— ${token.symbol}`,
          status: "placeholder",
          badgeLabel: "Em breve",
        };
      }),
    [isNativeBalanceLoading, nativeBalance],
  );

  const activeBalance = balances.find(
    (balance) => balance.token.id === ("CELO" satisfies TokenId),
  );

  return {
    balances,
    activeBalance,
  };
}
