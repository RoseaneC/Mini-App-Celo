# InáPay

**Powered by Celo**

InáPay is a mobile-first Web3 payment application inspired by the usability of Pix and MiniPay. The app enables fast digital payments using the Celo blockchain, with a simple interface designed for mobile wallets, MiniPay contexts, and future stablecoin payments.

## Visão geral

InáPay is currently focused on a clear payment flow: connect a wallet, enter an amount, choose a destination wallet, and send funds on Celo Sepolia.

The current version already supports real CELO transfers on testnet. It also includes a demo mode for browsers without an injected wallet, allowing users and reviewers to explore the interface without needing MetaMask, MiniPay, or test funds.

## Funcionalidades atuais

- Real CELO transfers on Celo Sepolia.
- Wallet connection through injected providers such as MetaMask.
- Automatic MiniPay environment detection through the injected provider.
- Demo mode when no wallet provider is available.
- Mobile-first payment interface.
- Brazilian decimal input support, including values such as `0,01`.
- Visual multi-token structure for CELO, USDC, and USDT.
- Token balance area prepared for future ERC20 balance reads.
- Future phone-based payment entry point shown as a disabled roadmap feature.

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- wagmi
- viem
- TanStack React Query
- Vercel
- Celo Sepolia

## Arquitetura

The project is organized around a small set of focused layers:

- `src/app`: Next.js App Router entry points and global layout.
- `src/components`: UI, layout, and home/payment components.
- `src/hooks`: client-side payment and balance hooks.
- `src/lib/web3`: Celo network configuration, token metadata, and Web3 constants.
- `src/providers`: global Web3 and React Query providers.
- `src/types`: shared TypeScript types.

The current transaction flow is intentionally conservative: CELO transfers use the existing native transaction path, while ERC20 token support is being prepared separately and is not enabled yet.

## Rede utilizada (Celo Sepolia)

The app currently uses **Celo Sepolia** as its active blockchain network.

Current network behavior:

- Native CELO transfers are enabled on Celo Sepolia.
- Transaction receipts link to the Celo Sepolia block explorer.
- Network switching is handled during the send flow when needed.
- Mainnet is not enabled in the current version.

## MiniPay support

InáPay includes initial MiniPay support through environment detection.

Current MiniPay-related behavior:

- Detects MiniPay when the injected provider exposes the MiniPay flag.
- Shows MiniPay-specific connection messaging.
- Keeps MetaMask desktop and MetaMask mobile connection flows available.
- Keeps demo mode available when no wallet is detected.

The app does not yet implement MiniPay-specific SDK features, ODIS, SocialConnect, or phone lookup.

## Stablecoins roadmap (USDC, USDT, USDm)

Stablecoin support is part of the product roadmap.

Current status:

- CELO is active and functional.
- USDC and USDT are represented in the token architecture and UI as upcoming assets.
- ERC20 sending is not enabled yet.
- ERC20 `balanceOf` reads are prepared architecturally but not activated for production use.

Planned stablecoin steps:

1. Enable real USDC balance reads.
2. Add safe ERC20 transfer support for USDC.
3. Validate fee behavior in MiniPay and mobile wallets.
4. Extend the same pattern to USDT.
5. Evaluate USDm support based on ecosystem requirements and availability.

## SocialConnect / telefone roadmap

InáPay includes a visual entry point for phone-based payments, but phone lookup is not active yet.

Current status:

- Wallet-address payments are active.
- Phone payments are visible as a future feature.
- The phone input is disabled for real sending and clearly marked as upcoming.

Planned SocialConnect path:

1. Normalize phone numbers safely.
2. Integrate SocialConnect / ODIS lookup.
3. Resolve phone numbers to wallet addresses.
4. Add explicit user confirmation before sending.
5. Add privacy, quota, and error-handling safeguards before production release.

## Como rodar localmente

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

Run lint:

```bash
npm run lint
```

## Deploy Vercel

The project is designed to run on Vercel with the standard Next.js deployment flow.

Recommended deployment flow:

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Use the default Next.js build settings.
4. Deploy to a preview environment first.
5. Validate wallet connection, MiniPay detection, demo mode, and CELO transfer behavior.
6. Promote to production after testnet validation.

## Estrutura do projeto

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    home/
    layout/
    ui/
  hooks/
    useTransfer.ts
    useTokenBalances.ts
  lib/
    web3/
      config.ts
      constants.ts
      tokens.ts
      types.ts
  providers/
    Web3Provider.tsx
  types/
    transfer.ts
    window.d.ts
```

## Screenshots

Placeholder for product screenshots:

- Home / payment flow
- Wallet connected state
- MiniPay detected state
- Demo mode state

## Roadmap futuro

- Improve MiniPay-specific mobile experience.
- Enable USDC balance reads.
- Implement safe USDC transfers through ERC20 contracts.
- Add USDT after USDC validation.
- Evaluate USDm support.
- Integrate SocialConnect / ODIS for phone-to-wallet resolution.
- Add stronger transaction status states and retry guidance.
- Prepare a mainnet readiness checklist.
- Expand product analytics and error monitoring.
