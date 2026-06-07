# InáPay

InáPay é um Mini App construído na Celo Mainnet focado em pagamentos digitais rápidos, simples e acessíveis usando CELO e stablecoins.

O projeto é um MVP mobile-first inspirado na simplicidade de experiências como Pix e MiniPay: conectar uma carteira, escolher uma moeda, informar valor e destino, e acompanhar a transação com hash/comprovante on-chain.

> Aviso de segurança: esta versão opera na Celo Mainnet. Transações usam valor real. Revise moeda, valor e endereço de destino antes de confirmar na carteira.

## Funcionalidades atuais

- Envio real de CELO na Celo Mainnet.
- Envio real de USDC via ERC20 `transfer`.
- USDT visível na arquitetura, mas desabilitado enquanto passa por validação mainnet.
- Detecção automática de ambiente MiniPay.
- Compatível com MetaMask mobile e desktop por provedores injetados.
- Modo demo sem wallet para navegação e demonstração da interface.
- Transferências com comprovante/hash no Celoscan.
- Registro opcional de comprovante no contrato `InapayRegistry` após confirmação do pagamento.
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
- Celo Mainnet
- ERC20
- Vercel

## Tokens suportados

| Token | Status |
|---|---|
| CELO | Funcional |
| USDC | Funcional |
| USDT | Em validação |

USDC mainnet:

```text
0xcebA9300f2b948710d2653dD7B07f33A8B32118C
```

USDT não está habilitado para envio mainnet nesta versão. Ele permanece desabilitado até validação oficial de contrato, `decimals`, `symbol`, bytecode, `balanceOf` e compatibilidade ERC20.

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

O fluxo de CELO usa transação nativa na Celo Mainnet. O fluxo de USDC usa chamada ERC20 `transfer(address,uint256)` com `decimals` 6.

## Rede utilizada

A rede ativa do app é **Celo Mainnet**.

Configuração atual:

- Chain ID: `42220`
- RPC: `https://forno.celo.org`
- Explorer: `https://celoscan.io`
- Explorer TX URL: `https://celoscan.io/tx/`
- Native currency: `CELO`

Comportamento atual:

- CELO é enviado como moeda nativa da rede.
- USDC usa contrato ERC20 oficial na Celo Mainnet.
- O app tenta alternar para Celo Mainnet quando necessário.
- Os comprovantes apontam para o Celoscan.

## MiniPay

InáPay inclui suporte inicial ao contexto MiniPay por detecção do provider injetado.

Estado atual:

- Detecta MiniPay quando o provider expõe a flag correspondente.
- Exibe mensagens de conexão específicas para MiniPay.
- Mantém compatibilidade com MetaMask desktop e mobile.
- Mantém modo demo quando nenhuma wallet é detectada.

O app ainda não implementa SDKs específicos do MiniPay, ODIS, SocialConnect ou resolução de telefone para carteira.

## Embedded Wallet / Google and Phone Login

InáPay inclui suporte inicial a Privy Embedded Wallet para onboarding com experiência de conta digital.

Estado atual:

- Login com Google via Privy.
- Login com telefone/SMS via Privy.
- Criação ou recuperação automática de embedded wallet quando o usuário entra com Google ou telefone.
- A embedded wallet é exibida na interface como `Conta InáPay`.
- MetaMask e MiniPay continuam disponíveis como opção avançada de wallet existente.
- O fluxo de envio CELO, envio USDC e registro no `InapayRegistry` continua usando wagmi/viem.

Variável pública necessária:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=seu_privy_app_id
```

Checklist no Privy Dashboard:

- Habilitar Google como método de login.
- Habilitar SMS/Phone como método de login.
- Habilitar Wallet como método de login.
- Adicionar o domínio de produção da Vercel nas URLs permitidas.
- Adicionar `http://localhost:3000` para testes locais.
- Configurar `NEXT_PUBLIC_PRIVY_APP_ID` no ambiente da Vercel.

Se `NEXT_PUBLIC_PRIVY_APP_ID` não estiver configurada, o app mantém o fluxo atual de MetaMask/MiniPay e modo demo, sem ativar o onboarding Privy.

Esta fase não implementa Account Abstraction, smart accounts, gas sponsorship ou paymaster. Usuários ainda precisam de saldo suficiente para o pagamento e para o gas na Celo Mainnet.

## Smart Contract

O projeto inclui um contrato simples chamado `InapayRegistry` para registrar comprovantes de pagamentos on-chain.

Características:

- Não recebe fundos.
- Não guarda fundos.
- Não possui função de saque.
- Não possui owner/admin.
- Registra apenas metadados do comprovante.

Contrato:

```text
contracts/InapayRegistry.sol
```

Contrato deployado e verificado na Celo Mainnet:

```text
0x56C5B94f05C0888E9a4106200A69841D25C902Cd
```

Função principal:

```solidity
recordPayment(address receiver, address token, uint256 amount, bytes32 paymentRef)
```

Campos registrados:

- `id`: identificador incremental.
- `sender`: endereço que chamou o contrato.
- `receiver`: destinatário informado.
- `token`: token do pagamento; `address(0)` representa CELO nativo.
- `amount`: valor em unidades base do token.
- `paymentRef`: referência externa em `bytes32`.
- `timestamp`: horário do bloco.

Evento:

```solidity
PaymentRecorded(uint256 indexed id, address indexed sender, address indexed receiver, address token, uint256 amount, bytes32 paymentRef, uint256 timestamp)
```

## On-chain payment registry

Após a confirmação de um pagamento CELO ou USDC, o frontend tenta registrar automaticamente um comprovante no `InapayRegistry` chamando:

```solidity
recordPayment(address receiver, address token, uint256 amount, bytes32 paymentRef)
```

O `paymentRef` é um `bytes32` gerado a partir de `sender`, `receiver`, `token`, `amount`, hash da transação principal e timestamp local. Para CELO nativo, o campo `token` usa `address(0)`. Para USDC, usa o contrato oficial de USDC na Celo Mainnet.

Variável pública do frontend:

```bash
NEXT_PUBLIC_INAPAY_REGISTRY_ADDRESS=0x56C5B94f05C0888E9a4106200A69841D25C902Cd
```

Se o registro no contrato falhar, o pagamento principal continua válido. O app mostra o hash do pagamento e exibe apenas um aviso leve sobre o registro do comprovante.

Compilar contrato:

```bash
npm run contract:compile
```

Rodar testes:

```bash
npm run contract:test
```

Deploy na Celo Mainnet:

```bash
CELO_MAINNET_PRIVATE_KEY=0x... npm run contract:deploy:celo
```

No PowerShell:

```powershell
$env:CELO_MAINNET_PRIVATE_KEY="0x..."
npm.cmd run contract:deploy:celo
```

Verificação no Celoscan após deploy:

```bash
ETHERSCAN_API_KEY=... npm run contract:verify:celo -- <CONTRACT_ADDRESS>
```

No PowerShell:

```powershell
$env:ETHERSCAN_API_KEY="..."
npm.cmd run contract:verify:celo -- <CONTRACT_ADDRESS>
```

## Segurança

Esta versão usa Celo Mainnet e pode movimentar valor real.

Recomendações de teste:

- Comece com valores mínimos, como `0,01`.
- Confirme se a carteira está na Celo Mainnet.
- Revise o token selecionado antes de enviar.
- Revise o endereço completo de destino.
- Mantenha CELO suficiente para gas.
- Use o hash no Celoscan para conferir a transação.

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
- Validação oficial de USDT na Celo Mainnet.
- Estados de transação mais detalhados.

## Sobre o projeto

O objetivo do InáPay é tornar pagamentos digitais mais simples e acessíveis usando a infraestrutura da Celo e stablecoins. O MVP prioriza uma experiência curta e compreensível: conectar carteira, escolher ativo, enviar para outro endereço e receber um comprovante verificável on-chain.

Nesta fase, o foco está em pagamentos por endereço de carteira na Celo Mainnet. Pagamentos por telefone, SocialConnect, ODIS, USDm, QR Code e histórico de transações fazem parte do roadmap e ainda não estão ativos no produto.
