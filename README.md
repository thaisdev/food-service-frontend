# Food Service Frontend

Este projeto é uma aplicação fictícia de Food Service criada para praticar e consolidar conhecimentos em Next.js, React, TypeScript, shadcn/ui e Tailwind CSS.

A proposta é simular uma aplicação real, com foco em boas práticas de organização, componentização, tipagem, reutilização de código e construção de interfaces modernas.

## Tecnologias

- Next.js
- React
- TypeScript
- shadcn/ui
- Tailwind CSS
- ESLint
- Prettier

## Pré-requisitos

Antes de começar, instale:

- Node.js
- npm

## Configuração

Instale as dependências do projeto:

```bash
npm install
```

Configure as variáveis de ambiente do Firebase Admin para persistir dados no Firestore. Use `.env.example` como referência:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

A aplicação sempre lê e grava os dados no Firestore. Para carregar os dados iniciais a partir dos arquivos em `data/*.example.json`, execute:

```bash
npm run seed:firestore
```

## Rodando em desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois, acesse:

```bash
http://localhost:3000
```

## Scripts disponíveis

```bash
npm run dev
```

Inicia o projeto em modo de desenvolvimento com Turbopack.

```bash
npm run build
```

Gera a versão de produção da aplicação.

```bash
npm run start
```

Executa a aplicação em modo de produção após o build.

```bash
npm run lint
```

Executa a análise de lint do projeto.

```bash
npm run seed:firestore
```

Popula as coleções `categories`, `products` e `orders` do Firestore com os JSON de exemplo.

```bash
npm run typecheck
```

Executa a validação de tipos do TypeScript.

```bash
npm run format
```

Formata os arquivos TypeScript e TSX com Prettier.

## Componentes shadcn/ui

Para adicionar novos componentes do shadcn/ui, use:

```bash
npx shadcn@latest add button
```

Os componentes de UI ficam no diretório `components`.

Exemplo de importação:

```tsx
import { Button } from "@/components/ui/button"
```
