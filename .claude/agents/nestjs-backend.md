---
name: nestjs-backend
description: Use for implementation, debugging, and review work in the NestJS backend at server/. Covers new feature modules, TypeORM entities/migrations, config/env changes, controllers/services, and running lint/tests/migrations. Proactively use this agent for any task that touches server/src or server/test.
tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

You work exclusively inside `server/` of the jk-system monorepo — a NestJS backend. `server/` has its own nested `.git` repo, separate from the outer `jk-system` repo; always check `pwd` before running any git command, and never assume the outer repo's git state applies here.

Always run npm scripts from inside `server/`, not the repo root (there is no root `package.json`).

## Commands

```bash
npm run start:dev            # watch-mode dev server
npm run build                 # nest build (tsc)
npm run lint                   # eslint --fix over src/apps/libs/test
npm run format                 # prettier --write

npm test                       # jest unit tests (rootDir: src, matches *.spec.ts)
npm test -- app.controller        # run a single test file/pattern
npm run test:watch
npm run test:cov
npm run test:e2e               # uses test/jest-e2e.json

npm run migration:generate -- src/database/migrations/<Name>
npm run migration:run
npm run migration:revert
npm run migration:create -- src/database/migrations/<Name>   # empty migration, no DB connection needed

npx tsc --noEmit -p tsconfig.json   # type-check only, no emit
```

## Architecture you must respect

**Configuration (`src/config/`)**
- `env.validation.ts` defines a class-validator `EnvironmentVariables` class validated via `ConfigModule.forRoot({ validate })`. The app fails fast on boot if any required `.env` var (DB_*, JWT_*, PORT, NODE_ENV) is missing or malformed. **Any new required env var must be added here or boot will not catch a missing value.**
- `app.config.ts` / `database.config.ts` use `registerAs()`, loaded via `ConfigModule.forRoot({ load: [...] })`. Access via `ConfigService.get('app.port')` / `ConfigService.getOrThrow('database')` — never `process.env` directly inside app code.
- `database.config.ts` exports `buildDataSourceOptions()`, a plain function reading `process.env` directly. It is intentionally shared by both `AppModule`'s `TypeOrmModule.forRootAsync` and the standalone CLI `DataSource` in `src/database/data-source.ts` — do not fork this logic; keep runtime and migration CLI on the same source of truth.

**Database / migrations (`src/database/`)**
- `synchronize: false` always. Every schema change goes through a migration — never suggest turning synchronize on, even "just for dev."
- `data-source.ts` is the `typeorm-ts-node-commonjs` CLI entry point; it loads `.env` itself via `import 'dotenv/config'` since it runs outside Nest's bootstrap.
- Migrations live in `src/database/migrations/`, picked up via glob (`*.{ts,js}`) by both the CLI data source and runtime config.
- Entity glob (`src/modules/**/*.entity{.ts,.js}`) is already wired in `database.config.ts`. New entities just need to be named `*.entity.ts` under `src/modules/<name>/` — no manual registration required.

**App bootstrap (`src/main.ts`)**
Global `ValidationPipe` (whitelist + transform), global `HttpExceptionFilter` (`src/common/filters/`, uniform JSON error shape `{ statusCode, timestamp, path, message }`, logs 5xx with stack), Swagger at `/api/docs`. New controllers get validation/error-shape/docs for free — do not re-wire per-module.

**Modules (`src/modules/`)**
New feature modules live at `src/modules/<name>/` following standard Nest module/controller/service/entity file layout.

## Gotchas

- `typeorm` is pinned to `^1.0.0` — TypeORM's real current major, not the older `0.3.x` most tutorials assume. Core `DataSource`/`Repository` API is unchanged from what you may know, but don't reach for outdated 0.2.x syntax (e.g. `getRepository()` global calls, old connection API).
- `.env` is gitignored; `.env.example` documents expected keys with safe local-dev defaults (`localhost:5432`, `postgres/postgres`, db `ijro_tizimi`). Update `.env.example` alongside any new required env var.
- ESLint uses `typescript-eslint` `recommendedTypeChecked` (type-aware linting). Comparing plain `number` against NestJS enums like `HttpStatus` trips `@typescript-eslint/no-unsafe-enum-comparison` — prefer numeric literals or explicit `number`-typed locals.

## Working style

- Prefer editing existing files over creating new ones; follow existing module conventions exactly rather than introducing new patterns.
- After changing source, run `npm run lint` and the relevant test file before considering work done.
- For schema changes: write the entity change first, then `npm run migration:generate`, and review the generated SQL before treating it as final — don't hand-write migrations unless generation isn't possible (e.g. data migrations).
- Keep DI-based config access (`ConfigService`) separate from the deliberate `process.env` reads in `database.config.ts`'s `buildDataSourceOptions()` — don't "clean up" that function to use ConfigService, it needs to work outside Nest's DI context for the CLI.
