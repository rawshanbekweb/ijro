# Deploy (bepul): Neon + Render + Vercel

| Qism | Platforma | Nima uchun |
|---|---|---|
| PostgreSQL | [Neon](https://neon.tech) | Bepul, muddati tugamaydi |
| Backend (NestJS) | [Render](https://render.com) | Bepul web service, `render.yaml` tayyor |
| Frontend (React) | [Vercel](https://vercel.com) | Bepul, `client/vercel.json` tayyor |

> Render bepul serveri 15 daqiqa so'rov bo'lmasa uxlaydi: birinchi so'rov
> ~30–50 soniya kutadi, soatlik muddat eslatmalari (cron) uxlab turganda
> ishlamaydi. Doimiy ishlashi kerak bo'lsa — pullik tarif yoki VPS.

## 0. GitHub

Render va Vercel kodni GitHub'dan oladi. Loyiha ildizida:

```bash
git init
git add .
git commit -m "Initial commit"
# GitHub'da bo'sh repo yarating, so'ng:
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

`.env` fayllar `.gitignore`da — ular GitHub'ga tushmaydi.

## 1. Neon — ma'lumotlar bazasi

1. Neon'da yangi project yarating (region: Frankfurt — Render bilan bir joyda).
2. **Connection details** bo'limidan quyidagilarni oling:
   `host` (masalan `ep-xxx.eu-central-1.aws.neon.tech`), `user`, `password`, `database`.
   Host'ning **pooler bo'lmagan** (nomida `-pooler` yo'q) variantini oling.

## 2. Render — backend

1. Render → **New → Blueprint** → GitHub repo'ni tanlang. `render.yaml` avtomatik o'qiladi.
2. So'ralgan qiymatlarni kiriting:
   - `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` — Neon'dan.
   - `CORS_URLs` — hozircha `http://localhost:5173`, Vercel manzili chiqqach o'zgartirasiz (4-qadam).
   - `JWT_*_SECRET` avtomatik generatsiya qilinadi.
3. Deploy tugagach manzilni oling, masalan `https://jk-ijro-api.onrender.com`.
   Tekshirish: `https://jk-ijro-api.onrender.com/api` → `Hello World!`,
   Swagger: `/api/docs`.

Har deployda server ishga tushishidan oldin migratsiyalar avtomatik
bajariladi (`npm run migration:run:prod`).

### Birinchi superadmin

Render bepul tarifida shell yo'q, shuning uchun superadminni o'z
kompyuteringizdan Neon bazasiga yaratasiz. `server/.env` faylini vaqtincha
Neon qiymatlari bilan to'ldiring:

```env
DB_HOST=ep-xxx.eu-central-1.aws.neon.tech
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...
DB_SSL=true
SUPERADMIN_LOGIN=superadmin
SUPERADMIN_PASSWORD=<kuchli parol>
```

so'ng `server/` ichida:

```bash
npm run seed:superadmin
```

Keyin `server/.env`ni lokal qiymatlarga qaytaring.

## 3. Vercel — frontend

1. Vercel → **Add New → Project** → repo'ni tanlang.
2. **Root Directory:** `client` (Framework: Vite avtomatik aniqlanadi).
3. **Environment Variables:**
   `VITE_API_URL` = `https://jk-ijro-api.onrender.com/api`
4. Deploy → manzilni oling, masalan `https://jk-ijro.vercel.app`.

## 4. CORS'ni ulash

Render → servis → **Environment** → `CORS_URLs` = Vercel manzili
(oxirida `/` siz, bir nechta bo'lsa vergul bilan). Saqlang — servis qayta ishga tushadi.

## Muammolar

| Belgi | Sabab |
|---|---|
| Brauzerda CORS xatosi | `CORS_URLs` Vercel manziliga aniq mos emas |
| Render log'ida `self-signed certificate` / SSL xatosi | `DB_SSL=true` emas yoki host noto'g'ri |
| Sahifa yangilanganda 404 | `client/vercel.json` deploy qilinmagan yoki Root Directory `client` emas |
| Boot'da `Error: ... should not be empty` | Render'da majburiy env o'zgaruvchi to'ldirilmagan |
