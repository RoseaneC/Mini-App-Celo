# InáPay

InáPay é um Mini App construído na Celo Sepolia focado em pagamentos digitais rápidos, simples e acessíveis usando CELO e stablecoins.

O projeto nasceu como um MVP inspirado na simplicidade de experiências como Pix e MiniPay: conectar uma carteira, escolher uma moeda, informar valor e destino, e acompanhar a transação com hash/comprovante na rede.

## Funcionalidades atuais

- Envio real de CELO na Celo Sepolia.
- Envio real de USDC via ERC20 `transfer`.
- Suporte experimental a USDT via ERC20.
- Detecção automática de ambiente MiniPay.
- Compatível com MetaMask mobile e desktop por provedores injetados.
- Modo demo sem wallet para navegação e demonstração da interface.
- Transferências com comprovante/hash no explorer da Celo Sepolia.
- Arquitetura multi-token com CELO, USDC e USDT.
- Leitura de saldo real para CELO e tokens ERC20 habilitados.
- Entrada por telefone exibida apenas como funcionalidade futura.

## Stack

- Next.js
- React
- TypeScript
- Wagmi
- Viem
- TailwindCSS
- TanStack React Query
- Celo Sepolia
- ERC20
- Vercel

## Tokens suportados

| Token | Status |
|---|---|
| CELO | Funcional |
| USDC | Funcional |
| USDT | Experimental |

USDT está habilitado em caráter experimental na Celo Sepolia. O contrato, `decimals` e bytecode foram validados on-chain, mas o envio ponta a ponta ainda deve ser validado com fundos reais de teste antes de ser tratado como funcional no mesmo nível de CELO e USDC.

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```bash
http://localhost:3000
```

Gere o build de produção:

```bash
npm run build
```

Opcionalmente, rode o lint:

```bash
npm run lint
```

## Deploy

Deploy previsto via Vercel.

Link do Vercel:

```text
Adicionar link aqui
```

## Arquitetura

O projeto está organizado em camadas pequenas e diretas:

- `src/app`: entradas do Next.js App Router e layout global.
- `src/components`: componentes de UI, layout e fluxo de pagamento.
- `src/hooks`: hooks de conexão, envio e leitura de saldos.
- `src/lib/web3`: configuração da rede Celo, metadata de tokens e constantes Web3.
- `src/providers`: providers globais de Wagmi e React Query.
- `src/types`: tipos compartilhados da aplicação.

O fluxo de CELO usa transação nativa na Celo Sepolia. Os fluxos de USDC e USDT usam chamadas ERC20 `transfer(address,uint256)` com `decimals` específicos de cada token.

## Rede utilizada

A rede ativa do app é **Celo Sepolia**.

Comportamento atual:

- CELO é enviado como moeda nativa da rede.
- USDC e USDT usam contratos ERC20 na Celo Sepolia.
- O app tenta alternar para Celo Sepolia quando necessário.
- Os comprovantes apontam para o explorer da Celo Sepolia.
- Mainnet não está habilitada nesta versão.

## MiniPay

InáPay inclui suporte inicial ao contexto MiniPay por detecção do provider injetado.

Estado atual:

- Detecta MiniPay quando o provider expõe a flag correspondente.
- Exibe mensagens de conexão específicas para MiniPay.
- Mantém compatibilidade com MetaMask desktop e mobile.
- Mantém modo demo quando nenhuma wallet é detectada.

O app ainda não implementa SDKs específicos do MiniPay, ODIS, SocialConnect ou resolução de telefone para carteira.

## Screenshots

![Tela inicial](./docs/screenshots/home-placeholder.png)

![Carteira conectada](./docs/screenshots/wallet-connected-placeholder.png)

![Seleção de token](./docs/screenshots/token-selection-placeholder.png)

![Comprovante de transação](./docs/screenshots/transaction-receipt-placeholder.png)

## Roadmap

- SocialConnect / telefone.
- USDm.
- Fee abstraction.
- Integração MiniPay avançada.
- QR Code payments.
- Histórico de transações.
- Estados de transação mais detalhados.
- Checklist de prontidão para mainnet.

## Sobre o projeto

O objetivo do InáPay é tornar pagamentos digitais mais simples e acessíveis usando a infraestrutura da Celo e stablecoins. O MVP prioriza uma experiência curta e compreensível: conectar carteira, escolher ativo, enviar para outro endereço e receber um comprovante verificável on-chain.

Nesta fase, o foco está em pagamentos por endereço de carteira na Celo Sepolia. Pagamentos por telefone, SocialConnect, ODIS, USDm, QR Code e histórico de transações fazem parte do roadmap e ainda não estão ativos no produto.
