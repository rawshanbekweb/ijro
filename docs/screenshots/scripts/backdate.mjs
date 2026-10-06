import fs from 'node:fs'
const out = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const lines = ["UPDATE users SET \"ismFamiliya\"='Абдураҳмонов Илҳом Шукурович', lavozim='Туман ҳокими' WHERE login='superadmin';"]
let seed = 7
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
for (const t of out.tasks) {
  lines.push(`UPDATE tasks SET muddat = (date_trunc('day', now()) + interval '${t.days} days' + interval '18 hours') WHERE id='${t.id}';`)
  const startDays = Math.max(3, -t.days + 3) + Math.floor(rnd() * 5)
  lines.push(`WITH s AS (SELECT id, row_number() OVER (ORDER BY "createdAt") rn, count(*) OVER () c FROM audit_logs WHERE "obyektId"='${t.id}')
UPDATE audit_logs a SET "createdAt" = now() - interval '${startDays} days' + (interval '${startDays} days' - interval '2 hours') * ((s.rn - 1)::float / greatest(s.c, 2)) FROM s WHERE a.id = s.id;`)
  lines.push(`UPDATE tasks SET "tanishildiAt" = now() - interval '${startDays} days' + interval '3 hours' WHERE id='${t.id}' AND "tanishildiAt" IS NOT NULL;`)
}
lines.push(`WITH s AS (SELECT id, row_number() OVER (PARTITION BY "taskId" ORDER BY "createdAt" DESC) rn FROM comments)
UPDATE comments c SET "createdAt" = now() - interval '50 minutes' * s.rn * 2 FROM s WHERE c.id = s.id;`)
console.log(lines.join('\n'))
