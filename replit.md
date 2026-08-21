# WSMP

Mini site do WSMP para acompanhar missões diárias, saúde e felicidade dos ovos, com painel administrativo local.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the workspace dependencies after importing the project
- `pnpm --filter @workspace/wsmp run dev` — run the frontend preview (the managed artifact workflow provides `PORT` and `BASE_PATH`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mockup-sandbox run dev` — run the Canvas component preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required API secrets: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — used by the `/api/store` route to read/write `public.wsmp_store` through the Supabase REST API

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/wsmp` — frontend React/Vite, quadro público e painel `/admin`
- `artifacts/api-server` — API Express, endpoint de saúde e autenticação do administrador
- `lib/db` — conexão PostgreSQL/Drizzle e schema
- `lib/api-spec` — contrato OpenAPI; os pacotes `api-client-react` e `api-zod` são gerados a partir dele

## Architecture decisions

- O Supabase é usado como PostgreSQL externo via the `public.wsmp_store` REST endpoint; the API server uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- O frontend usa `localStorage` para persistir as configurações do painel administrativo.
- O administrador usa `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `SESSION_SECRET`; a sessão é um cookie HTTP-only assinado e expira em oito horas.

## Product

O site apresenta missões diárias e uma coleção de ovos com indicadores de vida e alegria. O painel administrativo permite editar configurações, missões e ovos.

## User preferences

Nenhuma preferência adicional registrada.

## Gotchas

- Para consultar os dados reais, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` precisam estar configurados no ambiente de deploy; sem eles, `GET /api/store` retorna os dados iniciais locais e `PUT /api/store` retorna 503.
- A rota `/admin` exige login; credenciais não devem ser colocadas no código ou em mensagens.
- Depois de alterar o contrato OpenAPI, rode o codegen antes de usar os tipos atualizados.

## Pointers

- Consulte a skill `pnpm-workspace` para a estrutura do monorepo, TypeScript e detalhes dos pacotes.
