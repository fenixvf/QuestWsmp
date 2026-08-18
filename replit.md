# WSMP

Mini site do WSMP para acompanhar missões diárias, saúde e felicidade dos ovos, com painel administrativo local.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret: `SUPABASE_DATABASE_URL` — PostgreSQL connection string do Supabase (o projeto mantém `DATABASE_URL` como fallback)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/wsmp` — frontend React/Vite e armazenamento local do quadro
- `artifacts/api-server` — API Express e endpoint de saúde
- `lib/db` — conexão PostgreSQL/Drizzle e schema
- `lib/api-spec` — contrato OpenAPI; os pacotes `api-client-react` e `api-zod` são gerados a partir dele

## Architecture decisions

- O Supabase é usado como PostgreSQL externo via `SUPABASE_DATABASE_URL`; a integração REST do Supabase não é necessária para o fluxo atual.
- O frontend usa `localStorage` para persistir as configurações do painel administrativo.

## Product

O site apresenta missões diárias e uma coleção de ovos com indicadores de vida e alegria. O painel administrativo permite editar configurações, missões e ovos.

## User preferences

Nenhuma preferência adicional registrada.

## Gotchas

- Para iniciar a API, `SUPABASE_DATABASE_URL` precisa estar configurado; o frontend pode ser executado separadamente.
- Depois de alterar o contrato OpenAPI, rode o codegen antes de usar os tipos atualizados.

## Pointers

- Consulte a skill `pnpm-workspace` para a estrutura do monorepo, TypeScript e detalhes dos pacotes.
