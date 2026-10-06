// Demo/mock data seed via the real API. Usage: node seed-demo.mjs > seed-out.json
// Env: API_URL, ADMIN_LOGIN, ADMIN_PAROL (default: lokal server, superadmin/Admin12345)
const API = process.env.API_URL ?? 'http://localhost:3000/api'
const PAROL = 'Demo12345'

async function req(method, path, token, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}
const login = async (l, p = PAROL) => (await req('POST', '/auth/login', null, { login: l, parol: p })).accessToken

const DAY = 86400000
const at = (days, hour = 18) => {
  const d = new Date(Date.now() + days * DAY)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const admin = await login(process.env.ADMIN_LOGIN ?? 'superadmin', process.env.ADMIN_PAROL ?? 'Admin12345')

const sohalarSpec = [
  ['Молия ва бюджет бўлими', 'MB-01'],
  ['Қурилиш ва коммунал хўжалик', 'QK-02'],
  ['Халқ таълими бўлими', 'XT-03'],
  ['Соғлиқни сақлаш бўлими', 'SS-04'],
  ['Қишлоқ хўжалиги бўлими', 'QX-05'],
  ['Ёшлар сиёсати бўлими', 'YS-06'],
  ['Инвестициялар ва ташқи савдо', 'IT-07'],
]
const soha = {}
for (const [nomi, kodi] of sohalarSpec) soha[kodi] = (await req('POST', '/sohalar', admin, { nomi, kodi })).id

const usersSpec = [
  ['Тошматов Шерзод Алишерович', 'sh.toshmatov', 'MB-01', 'Бўлим бошлиғи'],
  ['Юсупова Дилноза Бахтиёровна', 'd.yusupova', 'MB-01', 'Бош мутахассис'],
  ['Назаров Жасур Равшанович', 'j.nazarov', 'QK-02', 'Бўлим бошлиғи'],
  ['Каримов Отабек Фаррухович', 'o.karimov', 'QK-02', 'Етакчи мутахассис'],
  ['Утемуратов Бердах Жолдасбаевич', 'b.utemuratov', 'QK-02', 'Муҳандис'],
  ['Ахмедова Нигора Илҳомовна', 'n.axmedova', 'XT-03', 'Бўлим бошлиғи'],
  ['Сапаров Аллаяр Кенесбаевич', 'a.saparov', 'XT-03', 'Методист'],
  ['Рахимов Улуғбек Тоҳирович', 'u.raximov', 'SS-04', 'Бўлим бошлиғи'],
  ['Қурбонова Малика Шавкатовна', 'm.qurbonova', 'SS-04', 'Бош мутахассис'],
  ['Есемуратов Айдос Бахтиярович', 'a.esemuratov', 'QX-05', 'Агроном'],
  ['Мирзаев Санжар Ботирович', 's.mirzaev', 'QX-05', 'Бўлим бошлиғи'],
  ['Абдуллаева Феруза Комиловна', 'f.abdullaeva', 'YS-06', 'Бош мутахассис'],
  ['Жуманиязов Азиз Сарсенбаевич', 'a.jumaniyazov', 'IT-07', 'Бўлим бошлиғи'],
  ['Холматов Бобур Эркинович', 'b.xolmatov', 'IT-07', 'Етакчи мутахассис'],
]
const u = {}
for (const [ismFamiliya, l, kodi, lavozim] of usersSpec) {
  u[l] = (await req('POST', '/users', admin, { ismFamiliya, login: l, parol: PAROL, rol: 'BAJARUVCHI', sohaId: soha[kodi], lavozim })).id
}
// one inactive employee
const inactive = await req('POST', '/users', admin, {
  ismFamiliya: 'Исмоилов Рустам Нуриддинович', login: 'r.ismoilov', parol: PAROL, rol: 'BAJARUVCHI',
  sohaId: soha['YS-06'], lavozim: 'Мутахассис', holat: 'NOFAOL',
})

const nazorat1 = (await req('POST', '/users', admin, { ismFamiliya: 'Олимов Фарход Сайдуллаевич', login: 'f.olimov', parol: PAROL, rol: 'NAZORAT', lavozim: 'Ҳоким ўринбосари' })).id
const nazorat2 = (await req('POST', '/users', admin, { ismFamiliya: 'Туребаева Гулнара Аманбаевна', login: 'g.turebaeva', parol: PAROL, rol: 'NAZORAT', lavozim: 'Котибият мудири' })).id

const me = await req('GET', '/auth/me', admin)
await req('POST', '/delegation', admin, {
  nazoratId: nazorat1, beruvchiId: me.id,
  ruxsatEtilganSohalar: [soha['QK-02'], soha['XT-03'], soha['SS-04']],
  maksimalMuhimlik: 'MUHIM', maksimalMuddatKun: 30, obyektTopshiriqRuxsat: true,
})
await req('POST', '/delegation', admin, {
  nazoratId: nazorat2, beruvchiId: me.id,
  ruxsatEtilganSohalar: [soha['MB-01'], soha['YS-06']],
  maksimalMuhimlik: 'ODDIY', maksimalMuddatKun: 14, obyektTopshiriqRuxsat: false,
})

const sohaOf = Object.fromEntries(usersSpec.map(([, l, k]) => [l, k]))
const sub = (...items) => items.map((matn, tartib) => ({ matn, tartib }))

// [creator, title, desc, bajaruvchi, muhimlik, muddat(days), subtasks, flow, pastDeadlineDays?]
// flow: send | tanish | jarayon | tasdiq | qabul | qaytar | bekor
const T = [
  ['admin', '2026 йил 9 ойлик бюджет ижроси бўйича ҳисобот', 'Туман бюджетининг 9 ойлик даромад ва харажатлар ижроси бўйича таҳлилий ҳисоботни тайёрлаш ва ҳокимликка тақдим этиш.', 'sh.toshmatov', 'SHOSHILINCH', 3, sub('Даромадлар бўйича маълумот йиғиш', 'Харажатлар таҳлили', 'Тушунтириш хатини тайёрлаш', 'Ҳокимга тақдим этиш'), 'jarayon', [true, true, false, false]],
  ['admin', 'Маҳаллий бюджет харажатларини оптималлаштириш таклифлари', 'Иқтисод қилинадиган харажат моддалари бўйича асосланган таклифлар киритиш.', 'd.yusupova', 'MUHIM', 9, sub('Харажат моддаларини таҳлил қилиш', 'Таклифлар лойиҳасини тайёрлаш'), 'tanish'],
  ['admin', 'Солиқ тушумлари режасининг бажарилиши мониторинги', 'Ой якуни бўйича солиқ тушумларини режа билан солиштириш.', 'd.yusupova', 'ODDIY', -4, sub('ДСИ маълумотларини олиш', 'Режа билан солиштириш', 'Хулоса тайёрлаш'), 'jarayon', [true, false, false]],
  ['admin', 'Тиббиёт муассасалари учун харажатлар сметаси', 'Туман тиббиёт бирлашмаси учун 2027 йил харажатлар сметасини келишиш.', 'sh.toshmatov', 'MUHIM', 0, sub('Смета лойиҳасини олиш', 'Келишиш'), 'tasdiq', [true, true]],
  ['admin', '“Обод маҳалла” дастури доирасида йўлларни таъмирлаш', 'Навбаҳор, Гулистон ва Тинчлик маҳаллаларидаги ички йўлларни асфальтлаш ишларини назорат қилиш.', 'j.nazarov', 'SHOSHILINCH', -2, sub('Пудратчи билан шартнома', 'Ишлар графигини тасдиқлаш', 'Бажарилган ишлар далолатномаси'), 'jarayon', [true, true, false]],
  ['nazorat1', 'Кўп қаватли уйларни иситиш мавсумига тайёрлаш', 'Туман бўйича 48 та кўп қаватли уйнинг иситиш тизимини куз-қиш мавсумига тайёрлигини текшириш.', 'o.karimov', 'MUHIM', 6, sub('Уйлар рўйхатини шакллантириш', 'Қозонхоналарни кўрикдан ўтказиш', 'Далолатномалар тузиш', 'Ҳисобот'), 'jarayon', [true, true, false, false]],
  ['admin', 'Ичимлик суви тармоғини реконструкция қилиш лойиҳаси', 'Лойиҳа-смета ҳужжатларини экспертизадан ўтказиш.', 'b.utemuratov', 'MUHIM', -6, sub('Ҳужжатларни йиғиш', 'Экспертизага топшириш'), 'tanish'],
  ['nazorat1', 'Кўча ёритгичларини алмаштириш ишлари', 'Марказий кўчалардаги эскирган ёритгичларни LED ёритгичларга алмаштириш.', 'b.utemuratov', 'ODDIY', 12, sub('Кўчалар рўйхати', 'Харид жараёни'), 'send'],
  ['admin', 'Чиқиндиларни олиб чиқиш графиги бўйича назорат', 'Санитар тозалаш корхонаси фаолиятини ҳафталик мониторинг қилиш.', 'o.karimov', 'ODDIY', -12, sub(), 'qabul'],
  ['nazorat1', 'Мактабларни қишки мавсумга тайёрлаш', 'Туман мактабларида иситиш, ойна ва томларни таъмирлаш ҳолатини ўрганиш.', 'n.axmedova', 'MUHIM', 1, sub('Мактаблар рўйхати', 'Жойида ўрганиш', 'Камчиликлар рўйхати'), 'jarayon', [true, true, false]],
  ['admin', 'Олимпиада ғолибларини рағбатлантириш', 'Вилоят фан олимпиадасида ғолиб бўлган ўқувчиларни тақдирлаш тадбирини ташкил этиш.', 'a.saparov', 'ODDIY', 5, sub('Ғолиблар рўйхати', 'Тадбир сценарийси'), 'tasdiq', [true, true]],
  ['admin', 'Мактабгача таълим ташкилотлари қамровини ошириш', 'Нодавлат МТТ очиш бўйича тадбиркорлар билан учрашув ўтказиш.', 'n.axmedova', 'ODDIY', 18, sub(), 'send'],
  ['nazorat1', 'Оилавий поликлиникаларда эмлаш кампанияси', 'Мавсумий грипп эмлаш кампаниясини ташкил этиш ва ҳисоботини юритиш.', 'u.raximov', 'MUHIM', 4, sub('Вакцина захирасини текшириш', 'Эмлаш графиги', 'Ҳафталик ҳисобот'), 'jarayon', [true, false, false]],
  ['admin', 'Тез тиббий ёрдам автопаркини янгилаш', 'Янги автомобиллар харид қилиш бўйича талабномани шакллантириш.', 'm.qurbonova', 'ODDIY', -1, sub(), 'jarayon'],
  ['admin', 'Аҳолини чуқурлаштирилган тиббий кўрикдан ўтказиш', 'Маҳаллалар кесимида тиббий кўрик натижалари базасини шакллантириш.', 'm.qurbonova', 'MUHIM', 0, sub('Маълумотлар базаси', 'Таҳлил'), 'tasdiq', [true, true]],
  ['admin', 'Пахта ва ғалла майдонларини сертификатлаш', 'Кузги ғалла экиш учун ажратилган майдонлар бўйича ҳужжатларни расмийлаштириш.', 's.mirzaev', 'SHOSHILINCH', 2, sub('Майдонларни ўлчаш', 'Ҳужжатлар', 'Келишув'), 'tanish'],
  ['admin', 'Сув тежовчи технологияларни жорий этиш', 'Томчилатиб суғориш тизимини жорий қилган фермерлар рўйхатини тайёрлаш.', 'a.esemuratov', 'ODDIY', 8, sub('Фермерлар рўйхати', 'Субсидия ҳисоб-китоби'), 'jarayon', [true, false]],
  ['admin', 'Кузги экин майдонларини ўрганиш', 'Кузги экинлар униб чиқиш ҳолатини жойида ўрганиш.', 'a.esemuratov', 'MUHIM', -3, sub(), 'tasdiq'],
  ['nazorat2', 'Ёшлар дафтарига киритилганлар бандлиги', 'Ёшлар дафтаридаги ишсиз ёшларни касб-ҳунарга ўқитиш ва ишга жойлаштириш.', 'f.abdullaeva', 'ODDIY', 7, sub('Рўйхатни янгилаш', 'Ўқув курсларига йўналтириш'), 'jarayon', [true, false]],
  ['admin', '“Беш ташаббус” спорт мусобақаларини ўтказиш', 'Маҳаллалараро мини-футбол ва волейбол мусобақаларини ташкил этиш.', 'f.abdullaeva', 'ODDIY', -9, sub(), 'qabul'],
  ['admin', 'Хорижий инвестиция иштирокидаги лойиҳалар мониторинги', 'Чорак якуни бўйича инвестиция лойиҳалари ижроси бўйича маълумотнома тайёрлаш.', 'a.jumaniyazov', 'MUHIM', 10, sub('Лойиҳалар рўйхати', 'Ижро ҳолати', 'Маълумотнома'), 'tanish'],
  ['admin', 'Экспорт ҳажмини ошириш бўйича йўл харитаси', 'Туман корхоналари экспорт салоҳиятини ўрганиш.', 'b.xolmatov', 'ODDIY', 15, sub(), 'send'],
  ['admin', 'Саноат зонасидаги бўш ер майдонлари инвентаризацияси', 'Кичик саноат зонасидаги фойдаланилмаётган ер участкаларини аниқлаш.', 'b.xolmatov', 'MUHIM', -5, sub('Ер участкалари рўйхати', 'Жойида ўрганиш'), 'jarayon', [true, false]],
  ['nazorat2', 'Ҳокимлик сайти учун ойлик ахборот', 'Молия бўлими фаолияти бўйича ойлик ахборот тайёрлаш.', 'd.yusupova', 'ODDIY', 2, sub(), 'qaytar'],
  ['admin', 'Бюджет ташкилотлари иш ҳақи фонди таҳлили', 'Иш ҳақи фондидан самарали фойдаланиш бўйича таҳлил.', 'sh.toshmatov', 'ODDIY', -20, sub(), 'qabul'],
  ['admin', 'Эски транспорт воситаларини ҳисобдан чиқариш', '', 'o.karimov', 'ODDIY', 20, sub(), 'bekor'],
]

const tokens = { admin, nazorat1: await login('f.olimov'), nazorat2: await login('g.turebaeva') }
const userTokens = {}
const ut = async (l) => (userTokens[l] ??= await login(l))

const created = []
for (const [creator, sarlavha, tavsif, bj, muhimlik, days, subtasklar, flow, done = [], ] of T) {
  // NAZORAT's max-days limit — create with a valid future date first, backdate via SQL later
  const muddat = at(Math.max(days, 1))
  const task = await req('POST', '/tasks', tokens[creator], {
    sarlavha, ...(tavsif ? { tavsif } : {}), bajaruvchiId: u[bj], sohaId: soha[sohaOf[bj]], muhimlik, muddat, subtasklar,
  })
  created.push({ id: task.id, days, sarlavha, flow, creator })
  const bt = await ut(bj)
  const full = await req('GET', `/tasks/${task.id}`, bt)
  const subs = [...full.subtasklar].sort((a, b) => a.tartib - b.tartib)

  if (flow === 'bekor') { await req('POST', `/tasks/${task.id}/bekor-qilish`, admin); continue }
  if (flow === 'send') continue
  await req('POST', `/tasks/${task.id}/tanishish`, bt)
  if (flow === 'tanish') continue
  await req('POST', `/tasks/${task.id}/tanishish`, bt)
  const doneFlags = flow === 'jarayon' ? done : subs.map(() => true)
  for (let i = 0; i < subs.length; i++) if (doneFlags[i]) await req('PATCH', `/tasks/${task.id}/subtasks/${subs[i].id}`, bt, { bajarildi: true })
  if (flow === 'jarayon') continue
  await req('POST', `/tasks/${task.id}/bajarildi`, bt)
  if (flow === 'tasdiq') continue
  if (flow === 'qaytar') {
    await req('POST', `/tasks/${task.id}/qaytarish`, admin, { sabab: 'Ахборотда охирги ой кўрсаткичлари акс этмаган. Қайта ишлаб, жадвални тўлдиринг.' })
    continue
  }
  await req('POST', `/tasks/${task.id}/tasdiqlash`, creator === 'admin' ? admin : tokens[creator])
}

// Comments thread on the flagship task
const flagship = created[0].id
await req('POST', `/tasks/${flagship}/izohlar`, admin, { matn: 'Шерзод Алишерович, ҳисоботда маҳаллалар кесимидаги кўрсаткичлар ҳам бўлсин.' })
await req('POST', `/tasks/${flagship}/izohlar`, await ut('sh.toshmatov'), { matn: 'Қабул қилдим. Даромадлар бўйича маълумотлар йиғилди, харажатлар таҳлили якунланмоқда.' })
await req('POST', `/tasks/${flagship}/izohlar`, await ut('sh.toshmatov'), { matn: 'Тушунтириш хати лойиҳасини эртага киритаман.' })
await req('POST', `/tasks/${created[4].id}/izohlar`, admin, { matn: 'Муддат ўтиб кетди! Иш ҳолати бўйича бугун соат 17:00 гача маълумот беринг.' })
await req('POST', `/tasks/${created[4].id}/izohlar`, await ut('j.nazarov'), { matn: 'Асфальт заводидан материал етказиб бериш кечикди. Навбаҳор маҳалласида ишлар 80% бажарилди.' })
await req('POST', `/tasks/${created[5].id}/izohlar`, tokens.nazorat1, { matn: 'Қозонхоналар кўриги натижаларини жадвал шаклида юборинг.' })

console.log(JSON.stringify({ soha, users: u, nazorat1, nazorat2, inactive: inactive.id, tasks: created.map((t) => ({ id: t.id, days: t.days, flow: t.flow })) }, null, 1))
