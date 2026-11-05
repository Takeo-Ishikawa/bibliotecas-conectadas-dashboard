# Copilot Instructions - biblioWebapp

## Contexto do projeto
- Frontend SPA com JavaScript vanilla, Web Components e Vite.
- Domínios principais em `src/domains/` (controller/view/service).
- Componentes visuais em `src/components/`.

## Princípios de implementação
- Priorizar legibilidade e consistência sobre abstrações prematuras.
- Evitar criar aliases/proxies de compatibilidade quando houver padrão final definido.
- Preservar APIs públicas existentes sempre que possível.
- Alterações devem ser pequenas, incrementais e testáveis.

## Arquitetura e organização
- Regras de negócio e chamadas HTTP em `service`.
- Orquestração de fluxo em `controller`.
- Renderização e manipulação de DOM em `view`/Web Components.
- Evitar misturar lógica de negócio com renderização no mesmo bloco.

## Integrações externas
- Nunca consumir APIs externas sensíveis diretamente do browser quando houver segredo.
- Preferir backend como fachada para integração externa.
- Tratar timeout, falha de rede e respostas vazias com UX clara.
- Aplicar debounce em buscas automáticas e cache local quando fizer sentido.

## Formulários e UX
- Não sobrescrever campos já preenchidos pelo usuário sem confirmação explícita.
- Exibir estados de carregamento e erro no próprio formulário (evitar somente `alert`).
- Manter validações de entrada no frontend e no backend.
- Garantir textos de interface em pt-BR com acentuação correta.

## Estilo (CSS)
- Utilizar sempre cores via variáveis CSS (`var(--...)`), sem hex/rgb literais em componentes.
- Quando uma cor nova for necessária, primeiro criar token no arquivo global (`src/css/main.css`) e reutilizar.
- Preferir nomes semânticos para tokens (ex.: `--color-feedback-error`) em vez de nomes por tom.

## Variáveis de ambiente
- Usar apenas `import.meta.env.VITE_*` no frontend.
- Nunca incluir secrets/chaves privadas em variáveis `VITE_*`.
- Documentar todas as variáveis novas no `.env.example`.

## Qualidade
- Ao adicionar feature, incluir ao menos:
  - tratamento de estado de loading e erro
  - validação de entrada
  - documentação de comportamento no README quando necessário
- Executar build (`npm run build`) após mudanças relevantes.

## Definition of Done (DoD)
- Feature implementada sem quebrar fluxos existentes.
- Mensagens e labels revisadas em pt-BR.
- Variáveis de ambiente adicionadas e documentadas.
- Erros tratados para falhas de rede/API.
- Build do frontend concluindo sem erro.