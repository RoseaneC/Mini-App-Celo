"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ConnectedWallet, User } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider as LegacyWagmiProvider } from "wagmi";
import { celo } from "viem/chains";
import { privyWagmiConfig, wagmiConfig } from "@/lib/web3/config";
import { CELO_MAINNET_RPC_URL } from "@/lib/web3/constants";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyEnabled = Boolean(privyAppId);

function selectActiveWalletForWagmi({
  wallets,
}: {
  wallets: ConnectedWallet[];
  user: User | null;
}) {
  return (
    wallets.find((wallet) => wallet.walletClientType === "privy") ?? wallets[0]
  );
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      }),
  );

  if (!privyEnabled || !privyAppId) {
    return (
      <LegacyWagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </LegacyWagmiProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["google", "sms", "wallet"],
        defaultChain: celo,
        supportedChains: [
          {
            ...celo,
            rpcUrls: {
              ...celo.rpcUrls,
              default: { http: [CELO_MAINNET_RPC_URL] },
              public: { http: [CELO_MAINNET_RPC_URL] },
            },
          },
        ],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          theme: "dark",
          accentColor: "#FCFF52",
        },
        intl: {
          defaultCountry: "BR",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider
          config={privyWagmiConfig}
          setActiveWalletForWagmi={selectActiveWalletForWagmi}
        >
          {children}
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
