import { createRequire } from 'node:module'
import fs from 'node:fs'
const require = createRequire('/opt/node-tools/node_modules/')
const { chromium } = require('playwright')

const OUT = process.argv[2]
const ONLY = process.argv[3] // optional filter
const seed = JSON.parse(fs.readFileSync(new URL('./seed-out.json', import.meta.url), 'utf8'))
const T = seed.tasks
const BASE = 'http://localhost:5173'
fs.mkdirSync(OUT, { recursive: true })

// ---- name lookup: API returns ids only for related users/soha; the client already
// renders these relations when present, so fill them in for the screenshots.
const API = 'http://localhost:3000/api'
const tok = (await (await fetch(API + '/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ login: 'superadmin', parol: 'Admin12345' }) })).json()).accessToken
const H = { authorization: 'Bearer ' + tok }
const USERS = Object.fromEntries((await (await fetch(API + '/users', { headers: H })).json()).map((u) => [u.id, u]))
const SOHA = Object.fromEntries((await (await fetch(API + '/sohalar', { headers: H })).json()).map((x) => [x.id, x]))
const ref = (id) => { const u = USERS[id]; return u ? { id, ismFamiliya: u.ismFamiliya, ism: u.ismFamiliya, lavozim: u.lavozim } : undefined }
function enrich(o) {
  if (Array.isArray(o)) return o.map(enrich)
  if (!o || typeof o !== 'object') return o
  if ('sarlavha' in o) {
    o.soha ??= SOHA[o.sohaId] && { id: o.sohaId, nomi: SOHA[o.sohaId].nomi, kodi: SOHA[o.sohaId].kodi }
    o.bajaruvchi ??= ref(o.bajaruvchiId); o.muallif ??= ref(o.muallifId); o.yaratuvchi ??= ref(o.yaratuvchiId)
  } else if ('userId' in o && !o.user) o.user = ref(o.userId)
  return o
}
async function attachEnricher(ctx) {
  await ctx.route(/localhost:3000\/api\/(tasks|auth\/me)/, async (route) => {
    const res = await route.fetch()
    let body = await res.text()
    try {
      let data = JSON.parse(body)
      if (route.request().url().endsWith('/auth/me')) data.ism = (data.ismFamiliya || '').split(' ')[1] || data.ismFamiliya
      else data = enrich(data)
      body = JSON.stringify(data)
    } catch {}
    await route.fulfill({ response: res, body })
  })
}

const browser = await chromium.launch()
const vp = { width: 1440, height: 900 }

async function newCtx(extra = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, timezoneId: 'Asia/Tashkent', locale: 'uz-UZ', ...extra })
  await attachEnricher(ctx)
  return ctx
}
async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(600)
}
async function shot(page, name, opts = {}) {
  if (ONLY && !name.includes(ONLY)) return
  await settle(page)
  const { fullPage, ...rest } = opts
  const orig = page.viewportSize()
  if (fullPage) {
    // content scrolls inside <main>, so grow the viewport to fit it
    const extra = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollHeight - m.clientHeight : 0 })
    if (extra > 0) { await page.setViewportSize({ width: orig.width, height: orig.height + extra }); await page.waitForTimeout(400) }
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, ...rest })
  if (fullPage) await page.setViewportSize(orig)
  console.log('saved', name)
}
async function loginAs(ctx, login, parol = 'Demo12345') {
  const page = await ctx.newPage()
  await page.goto(BASE + '/login')
  await page.locator('input').nth(0).fill(login)
  await page.locator('input[type=password]').fill(parol)
  await page.locator('button[type=submit]').click()
  await page.waitForURL((u) => !u.pathname.startsWith('/login'))
  await settle(page)
  return page
}

// 01 — login
{
  const ctx = await newCtx()
  const page = await ctx.newPage()
  await page.goto(BASE + '/login')
  await page.locator('input').nth(0).fill('superadmin')
  await shot(page, '01-login')
  await ctx.close()
}

// SUPERADMIN
{
  const ctx = await newCtx()
  const page = await loginAs(ctx, 'superadmin', 'Admin12345')
  await shot(page, '02-admin-dashboard', { fullPage: true })
  await page.getByRole('button', { name: 'Қайтариш' }).first().click()
  await page.locator('textarea').first().fill('Ҳисоботда маҳаллалар кесимидаги маълумотлар тўлиқ эмас, қайта кўриб чиқинг.')
  await shot(page, '15-qaytarish-oynasi')
  await page.keyboard.press('Escape')

  await page.goto(BASE + '/tasks')
  await shot(page, '03-admin-topshiriqlar')

  await page.goto(BASE + '/tasks/' + T[0].id)
  await shot(page, '04-topshiriq-tafsilotlari', { fullPage: true })

  await page.goto(BASE + '/tasks/' + T[4].id)
  await shot(page, '05-topshiriq-muddati-otgan', { fullPage: true })

  await page.goto(BASE + '/tasks/yangi')
  await settle(page)
  try {
    await page.getByPlaceholder('Sohani qidiring...').click()
    await page.getByRole('option').filter({ hasText: 'Қурилиш' }).first().click()
    await page.waitForTimeout(500)
    const xodim = page.getByPlaceholder('Xodimni qidiring...')
    if (await xodim.count()) { await xodim.click(); await page.getByRole('option').filter({ hasText: 'Назаров' }).first().click() }
  } catch (e) { console.warn('combobox', e.message) }
  await page.getByPlaceholder('Topshiriq sarlavhasi').fill('Марказий бозор атрофидаги пиёда йўлакларини таъмирлаш')
  await page.getByPlaceholder('Topshiriq tavsifi (ixtiyoriy)').fill('Бозор атрофидаги 1,2 км пиёда йўлагини таъмирлаш, ногиронлар учун пандуслар ўрнатиш ва ёритишни тиклаш.')
  await page.locator('input[type=date]').fill('2026-10-20')
  await page.getByRole('button', { name: 'Muhim', exact: true }).click()
  for (const m of ['Жойида ўрганиш ва далолатнома тузиш', 'Смета ҳисоб-китобини тайёрлаш', 'Пудратчи билан шартнома имзолаш']) {
    await page.getByRole('button', { name: /Band qo/ }).click()
    await page.getByPlaceholder('Band matni').last().fill(m)
  }
  await page.locator('body').click({ position: { x: 5, y: 890 } })
  await shot(page, '06-yangi-topshiriq', { fullPage: true })

  await page.goto(BASE + '/sohalar')
  await shot(page, '07-sohalar', { fullPage: true })
  const card = page.getByText('Қурилиш ва коммунал хўжалик').first()
  if (await card.count()) {
    await card.click()
    await shot(page, '08-soha-xodimlari', { fullPage: true })
  }

  await page.getByRole('button', { name: /Yangi xodim/ }).click()
  await shot(page, '16-yangi-xodim-oynasi')
  await page.keyboard.press('Escape')

  await page.goto(BASE + '/nazorat-huquqlari')
  await shot(page, '09-nazorat-huquqlari', { fullPage: true })
  await page.getByRole('button', { name: 'Таҳрирлаш' }).first().click()
  await shot(page, '17-nazorat-huquqi-tahrirlash')
  await ctx.close()
}

// Karakalpak UI
{
  const ctx = await newCtx()
  await ctx.addInitScript(() => localStorage.setItem('locale-storage', JSON.stringify({ state: { locale: 'qq-latn' }, version: 0 })))
  const page = await loginAs(ctx, 'superadmin', 'Admin12345')
  await shot(page, '18-qoraqalpoq-tili-dashboard', { fullPage: true })
  await ctx.close()
}

// BAJARUVCHI
{
  const ctx = await newCtx()
  const page = await loginAs(ctx, 'sh.toshmatov')
  await shot(page, '10-bajaruvchi-dashboard', { fullPage: true })
  await page.goto(BASE + '/tasks/' + T[0].id)
  await shot(page, '11-bajaruvchi-topshiriq', { fullPage: true })
  await page.goto(BASE + '/tasks')
  await shot(page, '14-bajaruvchi-topshiriqlarim', { fullPage: true })
  await ctx.close()
}

// NAZORAT
{
  const ctx = await newCtx()
  const page = await loginAs(ctx, 'f.olimov')
  await shot(page, '12-nazorat-dashboard', { fullPage: true })
  await page.goto(BASE + '/tasks/yangi')
  await shot(page, '19-nazorat-yangi-topshiriq', { fullPage: true })
  await ctx.close()
}

// Mobile
{
  const ctx = await newCtx({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  const page = await loginAs(ctx, 'sh.toshmatov')
  await shot(page, '13-mobil-bajaruvchi')
  await ctx.close()
}

await browser.close()
