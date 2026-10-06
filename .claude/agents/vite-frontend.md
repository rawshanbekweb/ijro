---
name: vite-frontend
description: Use for implementation, debugging, and review work in the Vite + React + TypeScript frontend at client/. Covers pages/components, routing (react-router-dom), state (zustand), data fetching (@tanstack/react-query, axios), forms/validation (react-hook-form, zod), and Tailwind styling. Proactively use this agent for any task that touches client/src.
tools: Read, Edit, Write, Bash, Grep, Glob
---

You work in the `client/` directory of this monorepo — a Vite + React + TypeScript frontend. Run all npm commands from inside `client/`.

## Stack and conventions

- **Routing**: `react-router-dom`. Routes are defined in `src/routes/router.tsx`; auth/role gating lives in `src/routes/ProtectedRoute.tsx`, with the role→dashboard-path map in `src/routes/dashboard-paths.ts` (kept separate from the component file so Vite's fast-refresh ESLint rule doesn't flag mixed component/constant exports).
- **State**: `zustand`. Auth state (`user`, `accessToken`, `login()`, `logout()`) lives in `src/store/auth.store.ts`.
- **Data fetching**: `@tanstack/react-query` for server state, wired up via `QueryClientProvider` in `src/main.tsx`. HTTP calls go through the shared `src/api/axios-instance.ts` — it reads `VITE_API_URL` from env, attaches `accessToken` to outgoing requests, and on a 401 transparently calls `/auth/refresh` (cookie-based, `withCredentials: true`), updates the auth store, retries the original request, and queues concurrent requests during an in-flight refresh. Do not bypass this instance with raw `axios` or `fetch` calls for authenticated endpoints.
- **Forms/validation**: `react-hook-form` + `zod` (typically via `@hookform/resolvers/zod` if/when schema-bound forms are added).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`. Custom config lives in `tailwind.config.js` and is pulled into `src/index.css` via `@config '../tailwind.config.js'` (Tailwind v4's default is CSS-first config, but this project intentionally keeps a JS config for the custom color palette). The palette: `blue #0B5CD6`, `blue-deep #083F96`, `green #12A17B`, `purple #7C5CD6`, `amber #E9A23B`, `red #E4483C`, `ink #10233D`, `muted #6B7C93` — prefer these tokens (`bg-blue`, `text-ink`, etc.) over ad-hoc hex values in new UI.
- **Env**: `VITE_API_URL` is required (see `.env.example`); typed in `src/vite-env.d.ts`. Add any new required `VITE_*` var to both `.env.example` and the `ImportMetaEnv` interface there.
- **i18n**: the app must support 3 languages via `i18next` (with `react-i18next`) — Qoraqalpoq lotin (Karakalpak Latin), Qoraqalpoq krill (Karakalpak Cyrillic), and O'zbek krill (Uzbek Cyrillic). Do not hardcode user-facing strings in components — route them through translation keys/resources so all three locales stay in sync.

## Commands (run from `client/`)

```bash
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # preview a production build
npx tsc -b --noEmit   # type-check only, no build output
```

## Notes

- No page content has been built out yet beyond placeholders (`LoginPage`, `SuperadminDashboard`, `BajaruvchiDashboard`, `NotFoundPage`) — when filling these in, keep following the routing/auth/data-fetching conventions above rather than introducing new patterns.
- Two roles currently modeled: `SUPERADMIN` and `BAJARUVCHI` (see `Role` type in `auth.store.ts`). If the backend adds more roles, extend that union and `dashboardPathByRole` together.
- After any non-trivial change, run `npx tsc -b --noEmit` and `npm run lint` before considering the task done — the ESLint config here is fast-refresh-aware (react-refresh/only-export-components), so files that mix component and non-component exports will fail lint.
