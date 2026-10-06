# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo root with two independent projects — there is no root `package.json`, so all commands below must be run from inside `server/` (or `client/` once it has content):

- `server/` — NestJS backend.
- `client/` — Vite + React frontend (`npm run dev`, `npm run build`, `npm run lint`).
- Deployment (Neon + Render + Vercel) is described in `DEPLOY.md`; `render.yaml` (root) and `client/vercel.json` are the platform configs.

## Commands (run from `server/`)

```bash
npm run start:dev       # watch-mode dev server
npm run build            # nest build (tsc)
npm run lint              # eslint --fix over src/apps/libs/test
npm run format            # prettier --write

npm test                  # jest unit tests (rootDir: src, matches *.spec.ts)
npm test -- app.controller   # run a single test file/pattern
npm run test:watch
npm run test:cov
npm run test:e2e          # uses test/jest-e2e.json

# migrations (see Database section below)
npm run migration:generate -- src/database/migrations/<Name>
npm run migration:run
npm run migration:revert
npm run migration:create -- src/database/migrations/<Name>   # empty migration, no DB connection needed
```

Type-check only (no emit): `npx tsc --noEmit -p tsconfig.json`.

## Architecture

### Configuration (`src/config/`)
- `env.validation.ts` — a class-validator `EnvironmentVariables` class validated via `ConfigModule.forRoot({ validate })`. The app **fails fast on boot** if any required `.env` var (DB_*, JWT_*, PORT, NODE_ENV) is missing or malformed. When adding a new required env var, add it here too or boot will not catch a missing value.
- `app.config.ts`, `database.config.ts` — registered with `registerAs()` and loaded via `ConfigModule.forRoot({ load: [...] })`. Access via `ConfigService.get('app.port')` / `ConfigService.getOrThrow('database')`.
- `database.config.ts` exports `buildDataSourceOptions()` — a plain function (not DI-bound) that reads `process.env` directly. This is intentionally shared by **both** `AppModule`'s `TypeOrmModule.forRootAsync` and the standalone CLI `DataSource` in `src/database/data-source.ts`, so connection options never drift between runtime and migration CLI.

### Database / migrations (`src/database/`)
- `synchronize: false` always — schema changes must go through migrations.
- `data-source.ts` is the entry point for the `typeorm-ts-node-commonjs` CLI (loads `.env` itself via `import 'dotenv/config'` since it runs outside Nest's bootstrap).
- Migrations live in `src/database/migrations/` and are picked up via glob (`*.{ts,js}`) by both the CLI data source and the runtime TypeORM config.
- Entity glob path (`src/modules/**/*.entity{.ts,.js}`) is already wired in `database.config.ts` even though no modules/entities exist yet — new feature modules should place entities as `*.entity.ts` files for them to be auto-discovered.

### App bootstrap (`src/main.ts`)
All routes are under the global `/api` prefix (client `VITE_API_URL` must end in `/api`). Global `ValidationPipe` (whitelist + transform), global `HttpExceptionFilter` (`src/common/filters/`, uniform JSON error shape `{ statusCode, timestamp, path, message }`, logs 5xx with stack), and Swagger mounted at `/api/docs`. Any new controller gets validation/error-shape/docs for free — no per-module wiring needed.

### Modules (`src/modules/`)
Feature modules: `auth`, `users`, `sohalar`, `tasks`, `comments`, `delegation`, `notifications`, `audit`. New ones go in `src/modules/<name>/` following standard Nest module/controller/service/entity conventions.

### Production
`npm run migration:run:prod` / `npm run seed:superadmin:prod` run against compiled `dist/` (no ts-node). `DB_SSL=true` is needed for cloud Postgres (Neon).

## UI conventions (`client/`)
- The client (mijoz) prefers larger, touch-friendly UI elements: buttons, interface text, and icons should lean toward bigger sizes rather than compact/dense defaults, so they're easy to tap/click. Keep this in mind for any new or edited screens, not just the dashboard.

## Notable/non-obvious details
- `typeorm` is pinned to `^1.0.0` (TypeORM's actual current major as of this repo's creation) — **not** the older `0.3.x` line most tutorials/docs online reference. The core `DataSource`/`Repository` API is unchanged, but don't assume outdated 0.2.x syntax.
- `.env` is gitignored; `.env.example` documents the expected keys with safe local-dev defaults (`localhost:5432`, `postgres/postgres`, db `ijro_tizimi`).
- ESLint uses `typescript-eslint` `recommendedTypeChecked` (type-aware linting) — comparisons between plain `number` and NestJS enums like `HttpStatus` can trip `@typescript-eslint/no-unsafe-enum-comparison`; prefer numeric literals or explicit `number`-typed locals in those cases.
