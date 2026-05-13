# AGENT.md

Este arquivo define as regras que agentes de IA devem seguir ao implementar, revisar ou alterar código neste projeto.

## Princípios gerais

- Utilizar sempre as melhores práticas de React, Next.js e TypeScript.
- Reutilizar componentes, funções, estilos e tipos sempre que possível.
- Evitar componentes muito grandes. Separar blocos de UI, comportamento ou composição em componentes menores quando isso melhorar a leitura.
- Evitar programação defensiva com condições desnecessárias, mantendo a complexidade cognitiva baixa.
- Remover types, funções, constantes, componentes, imports e arquivos que não estejam sendo utilizados.

## Stack e comandos do projeto

- O projeto utiliza Next.js com App Router, React, TypeScript em modo strict, Tailwind CSS, shadcn/ui, ESLint e Prettier.
- Utilizar `npm` como gerenciador de pacotes, preservando o `package-lock.json`.
- Usar imports absolutos com o alias `@/*` quando isso melhorar a leitura e estiver alinhado ao padrão existente.
- Antes de finalizar alterações de código, executar `npm run lint` e `npm run typecheck` sempre que a mudança tocar TypeScript, React, rotas ou contratos.
- Quando alterar arquivos `.ts` ou `.tsx`, manter a formatação compatível com o Prettier do projeto.

## React e Next.js

- Dar preferência a Server Components sempre que o componente não precisar de estado no cliente, efeitos, eventos de interação ou APIs exclusivas do navegador.
- Usar Client Components apenas quando houver necessidade real de interatividade no cliente.
- Manter componentes com pouca lógica. Extrair regras de negócio, transformações, handlers complexos e integrações para hooks, utils ou helpers.
- Preservar os padrões nativos do Next.js para rotas, layouts, carregamento de dados, metadata e composição de páginas.
- Toda rota que realiza requisição ao backend deve ter um arquivo `loading.tsx` correspondente para exibir um skeleton enquanto os dados carregam.

## Dados e contratos

- Tipos de dados relacionados devem ter o relacionamento fixado por chaves, preferencialmente IDs, como em um banco de dados relacional.
- Campos devem ser salvos com tipos puros, como `datetime`, `number`, `boolean` e IDs, sem formatação de exibição embutida no dado.
- Formatações devem acontecer apenas no momento de exibir o dado ao usuário. Exemplo: preço e total devem ser numéricos no JSON/API, e a formatação de moeda deve ser aplicada somente na UI.
- Datas e horários devem ser persistidos em formato de datetime consistente e parseável, evitando strings formatadas apenas para leitura humana.
- Requisições mockadas que leem ou gravam JSON devem incluir delay artificial para simular latência real e permitir validar estados de loading/skeleton.

## UI e estilos

- Dar preferência aos componentes do shadcn/ui antes de criar componentes de interface do zero.
- Utilizar as cores e tokens definidos em `app/globals.css` como fonte principal para estilos.
- Utilizar Tailwind CSS e tokens semânticos do tema antes de cores soltas ou estilos inline.
- Utilizar ícones de `@remixicon/react`, conforme configurado no `components.json`.
- Evitar estilos duplicados. Quando um padrão visual se repetir, extrair para componente, variante ou helper de classe.
- Manter a interface consistente com os componentes e convenções já existentes no projeto.
- Manter consistência visual entre componentes equivalentes, preservando padrões de espaçamento, bordas, cores, tipografia, estados, ícones e ações para fluxos semelhantes.

## TypeScript

- Nunca utilizar `any`.
- Tipar explicitamente contratos relevantes, como props, retornos de hooks, parâmetros de helpers e payloads de APIs.
- Utilizar `enum` do TypeScript para tipos que possuem um conjunto previsto de strings.
- Reutilizar tipos existentes antes de criar novos tipos equivalentes.
- Preferir tipos simples e legíveis, evitando abstrações genéricas quando elas não reduzem complexidade real.

## Organização de arquivos

- Utilizar vertical slice para arquivos exclusivos de um contexto, página ou fluxo específico.
- A arquitetura de pastas deve seguir vertical slice: helpers, hooks, components, tipos e constantes específicos de uma página ou fluxo devem ficar junto à pasta da página que os utiliza.
- Utilizar pastas privadas com prefixo underline, como `_components`, `_hooks`, `_helpers` e `_types`, para arquivos internos ao slice que devem ser ignorados pelo roteamento.
- Promover arquivos para pastas na raiz do projeto apenas quando forem compartilhados por mais de uma página, módulo ou contexto.
- Evitar criar abstrações globais antes de existir uso real compartilhado.
- Manter componentes base do shadcn/ui em `components/ui` e componentes compartilhados de aplicação em `components`.
- Manter helpers compartilhados em `helpers` ou `lib` conforme a responsabilidade já existente: helpers puros de domínio em `helpers`, integrações e infraestrutura em `lib`.

## Hooks, utils e helpers

- Extrair lógica de estado e comportamento reutilizável para hooks.
- Extrair funções puras, formatadores, mapeamentos e transformações para utils/helpers.
- Funções de transformação de objeto, formatação de texto, cálculos e regras auxiliares devem ser extraídas para uma pasta de helpers.
- Separar helpers por contexto e responsabilidade, com arquivos como `datetime.ts`, `calc.ts`, `format.ts`, `mapper.ts` ou equivalentes.
- Evitar que hooks e helpers conheçam detalhes de UI quando puderem ser independentes.
- Nomear funções de forma clara, refletindo a regra ou transformação que executam.

## Idioma e nomenclatura

- Utilizar língua portuguesa apenas para textos que aparecem para o usuário.
- Textos em português exibidos para o usuário devem seguir as normas da língua portuguesa e incluir acentos ortográficos.
- Não escapar acentos e caracteres especiais em textos que aparecem para o usuário.
- Usar sempre nomes em inglês para arquivos, componentes, variáveis, funções, hooks, helpers, tipos, enums e constantes.

## Revisão antes de finalizar

- Executar `npm run lint` e `npm run typecheck` quando aplicável, relatando qualquer falha que não puder ser corrigida no momento.
- Verificar se não ficaram types, funções, constantes, componentes, imports ou arquivos sem uso.
- Verificar se o componente poderia continuar como Server Component.
- Verificar se toda rota com requisição ao backend possui `loading.tsx` com skeleton.
- Verificar se relacionamentos entre dados usam chaves/IDs em vez de cópias desnecessárias de objetos relacionados.
- Verificar se dados persistidos usam tipos puros e se as formatações estão restritas à exibição para o usuário.
- Verificar se APIs mockadas com JSON aplicam delay artificial antes de responder.
- Verificar se helpers de transformação, cálculo e formatação foram extraídos e organizados por contexto/responsabilidade.
- Verificar se foi criado algo reutilizável que deveria ser promovido para uma pasta na raiz do projeto.
- Verificar se arquivos específicos de uma página/fluxo estão próximos do slice e em pastas privadas com prefixo underline quando apropriado.
- Verificar se existe componente shadcn/ui ou padrão local que substitui uma implementação nova.
- Verificar se não foi introduzido `any`.
- Verificar se strings com valores previstos deveriam ser representadas por `enum`.
- Verificar se há condições desnecessárias aumentando a complexidade cognitiva.
- Verificar se os componentes novos ou alterados mantêm consistência visual com componentes equivalentes já existentes.
- Verificar se textos exibidos para o usuário estão em português correto, com acentos e sem caracteres escapados.
- Verificar se nomes de arquivos, componentes, variáveis e funções estão em inglês.
