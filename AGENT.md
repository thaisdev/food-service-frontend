# AGENT.md

Este arquivo define as regras que agentes de IA devem seguir ao implementar, revisar ou alterar código neste projeto.

## Princípios gerais

- Utilizar sempre as melhores práticas de React, Next.js e TypeScript.
- Reutilizar componentes, funções, estilos e tipos sempre que possível.
- Evitar componentes muito grandes. Separar blocos de UI, comportamento ou composição em componentes menores quando isso melhorar a leitura.
- Evitar programação defensiva com condições desnecessárias, mantendo a complexidade cognitiva baixa.

## React e Next.js

- Dar preferência a Server Components sempre que o componente não precisar de estado no cliente, efeitos, eventos de interação ou APIs exclusivas do navegador.
- Usar Client Components apenas quando houver necessidade real de interatividade no cliente.
- Manter componentes com pouca lógica. Extrair regras de negócio, transformações, handlers complexos e integrações para hooks, utils ou helpers.
- Preservar os padrões nativos do Next.js para rotas, layouts, carregamento de dados, metadata e composição de páginas.

## UI e estilos

- Dar preferência aos componentes do shadcn/ui antes de criar componentes de interface do zero.
- Utilizar as cores e tokens definidos em `app/globals.css` como fonte principal para estilos.
- Evitar estilos duplicados. Quando um padrão visual se repetir, extrair para componente, variante ou helper de classe.
- Manter a interface consistente com os componentes e convenções já existentes no projeto.

## TypeScript

- Nunca utilizar `any`.
- Tipar explicitamente contratos relevantes, como props, retornos de hooks, parâmetros de helpers e payloads de APIs.
- Utilizar `enum` do TypeScript para tipos que possuem um conjunto previsto de strings.
- Reutilizar tipos existentes antes de criar novos tipos equivalentes.
- Preferir tipos simples e legíveis, evitando abstrações genéricas quando elas não reduzem complexidade real.

## Organização de arquivos

- Utilizar vertical slice para arquivos exclusivos de um contexto, página ou fluxo específico.
- Organizar arquivos reutilizáveis na pasta `shared`.
- Manter componentes, hooks, utils/helpers, tipos e constantes próximos do contexto que os utiliza quando forem específicos dele.
- Promover para `shared` apenas o que tiver uso real ou clara intenção de reutilização entre contextos.

## Hooks, utils e helpers

- Extrair lógica de estado e comportamento reutilizável para hooks.
- Extrair funções puras, formatadores, mapeamentos e transformações para utils/helpers.
- Evitar que hooks e helpers conheçam detalhes de UI quando puderem ser independentes.
- Nomear funções de forma clara, refletindo a regra ou transformação que executam.

## Idioma e nomenclatura

- Utilizar língua portuguesa apenas para textos que aparecem para o usuário.
- Textos em português exibidos para o usuário devem seguir as normas da língua portuguesa e incluir acentos ortográficos.
- Não escapar acentos e caracteres especiais em textos que aparecem para o usuário.
- Usar sempre nomes em inglês para arquivos, componentes, variáveis, funções, hooks, helpers, tipos, enums e constantes.

## Revisão antes de finalizar

- Verificar se o componente poderia continuar como Server Component.
- Verificar se foi criado algo reutilizável que deveria estar em `shared`.
- Verificar se existe componente shadcn/ui ou padrão local que substitui uma implementação nova.
- Verificar se não foi introduzido `any`.
- Verificar se strings com valores previstos deveriam ser representadas por `enum`.
- Verificar se há condições desnecessárias aumentando a complexidade cognitiva.
- Verificar se textos exibidos para o usuário estão em português correto, com acentos e sem caracteres escapados.
- Verificar se nomes de arquivos, componentes, variáveis e funções estão em inglês.
