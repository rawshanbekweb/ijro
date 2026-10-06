import fs from 'node:fs'
const API=process.env.API_URL ?? 'http://localhost:3000/api'
const j=async(m,p,t,b)=>{const r=await fetch(API+p,{method:m,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});const x=await r.text();if(!r.ok)throw new Error(p+' '+x);return x?JSON.parse(x):null}
const login=async(l,p='Demo12345')=>(await j('POST','/auth/login',null,{login:l,parol:p})).accessToken
const seed=JSON.parse(fs.readFileSync('seed-out.json','utf8'))
const admin=await login(process.env.ADMIN_LOGIN??'superadmin',process.env.ADMIN_PAROL??'Admin12345')
const sh=await login('sh.toshmatov'), ur=await login('u.raximov')
const fut=new Date(Date.now()+5*864e5).toISOString()
const a=await j('POST','/tasks',admin,{sarlavha:'Давлат харидлари бўйича чораклик ҳисобот',tavsif:'III чорак давомида амалга оширилган давлат харидлари таҳлили.',bajaruvchiId:seed.users['sh.toshmatov'],sohaId:seed.soha['MB-01'],muhimlik:'MUHIM',muddat:fut,subtasklar:[{matn:'Шартномалар реестри',tartib:0},{matn:'Таҳлилий жадвал',tartib:1}]})
await j('POST',`/tasks/${a.id}/tanishish`,sh); await j('POST',`/tasks/${a.id}/tanishish`,sh)
const s=(await j('GET',`/tasks/${a.id}`,sh)).subtasklar.sort((x,y)=>x.tartib-y.tartib)
await j('PATCH',`/tasks/${a.id}/subtasks/${s[0].id}`,sh,{bajarildi:true})
const b=await j('POST','/tasks',admin,{sarlavha:'Маҳаллий бюджет даромадлари прогнози (2027)',tavsif:'Келгуси йил учун даромадлар прогнозини ишлаб чиқиш.',bajaruvchiId:seed.users['sh.toshmatov'],sohaId:seed.soha['MB-01'],muhimlik:'ODDIY',muddat:new Date(Date.now()+20*864e5).toISOString()})
// nazorat1 vaccination -> pending approval
const vac=seed.tasks[12].id
for(const st of (await j('GET',`/tasks/${vac}`,ur)).subtasklar) if(!st.bajarildi) await j('PATCH',`/tasks/${vac}/subtasks/${st.id}`,ur,{bajarildi:true})
await j('POST',`/tasks/${vac}/bajarildi`,ur)
console.log(JSON.stringify({overdueSh:a.id,newSh:b.id,schools:seed.tasks[9].id}))
