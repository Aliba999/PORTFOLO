(function(){const{sb,SEED,norm,esc,$}=APP,AB=$("#ab"),OWN=CFG.OWNER;let list=[],ed=null;
const sh=f=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1400/i.width),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);c.toBlob(r,"image/jpeg",.82)};i.src=URL.createObjectURL(f)});
const row=p=>({title:p.title,tags:p.tags,url:p.url,repo:p.repo,imgs:p.imgs,desc_ru:p.d.ru,desc_en:p.d.en,desc_kk:p.d.kk});
async function get(){const{data}=await sb.from("projects").select("*").order("position");list=(data||[]).map(norm)}
async function ui(){
if(!sb){AB.innerHTML='<h2>Admin</h2><p class="note">Supabase не подключён: впишите SUPABASE_URL и SUPABASE_KEY в config.js.</p>';return}
const{data:{session}}=await sb.auth.getSession();
if(!session){AB.innerHTML='<h2 style="margin-bottom:20px">Вход</h2><label>Email</label><input id="em" type="email"><label>Пароль</label><input id="pw" type="password"><button class="btn p" id="go">Войти</button><p id="er" style="margin-top:12px;color:#f87171"></p>';
$("#go").onclick=async()=>{const{data,error}=await sb.auth.signInWithPassword({email:$("#em").value.trim(),password:$("#pw").value});if(error)return $("#er").textContent="Ошибка входа: "+error.message;ui()};return}
if((session.user.email||"").toLowerCase()!==OWN.toLowerCase()){await sb.auth.signOut();AB.innerHTML='<p class="note">Этот аккаунт не имеет доступа.</p>';return}
await get();const p=ed||{title:"",tags:[],url:"",repo:"",imgs:[],d:{ru:"",en:"",kk:""}};
AB.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2>Проекты</h2><button class="btn g" id="lo">Выйти</button></div>`+
(list.length?list.map((q,i)=>`<div class="row"><span>${esc(q.title)}</span><button data-e="${i}">Изменить</button><button data-u="${i}">↑</button><button data-x="${i}">Удалить</button></div>`).join(""):`<p class="note">Список пуст. <button class="btn p" id="sd" style="margin-left:10px;padding:6px 14px">Загрузить стандартные проекты</button></p>`)+
`<h3 style="margin:30px 0 14px;font-size:22px">${ed?"Изменить проект":"Новый проект"}</h3><label>Название</label><input id="f1" value="${esc(p.title)}">
<label>Описание RU</label><textarea id="f2" rows="2">${esc(p.d.ru)}</textarea><label>Описание EN</label><textarea id="f3" rows="2">${esc(p.d.en)}</textarea><label>Описание KZ</label><textarea id="f4" rows="2">${esc(p.d.kk)}</textarea>
<label>Ссылка на проект</label><input id="f5" value="${esc(p.url)}"><label>Ссылка на код</label><input id="f6" value="${esc(p.repo)}"><label>Теги через запятую</label><input id="f7" value="${esc(p.tags.join(", "))}">
<label>Скриншоты (можно несколько; пусто = оставить прежние)</label><input id="f8" type="file" accept="image/*" multiple><button class="btn p" id="sv">Сохранить</button>${ed?'<button class="btn g" id="cn" style="margin-left:8px">Отмена</button>':""}<p id="er" style="margin-top:12px;color:#f87171"></p>`;
$("#lo").onclick=async()=>{await sb.auth.signOut();ui()};if($("#sd"))$("#sd").onclick=async()=>{const{error}=await sb.from("projects").insert(SEED.map((s,i)=>({...row(s),position:i})));if(error)$("#er").textContent=error.message;ui()};
if($("#cn"))$("#cn").onclick=()=>{ed=null;ui()};
AB.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ed=list[b.dataset.e];ui()});
AB.querySelectorAll("[data-x]").forEach(b=>b.onclick=async()=>{if(confirm("Удалить проект?")){await sb.from("projects").delete().eq("id",list[b.dataset.x].id);ui()}});
AB.querySelectorAll("[data-u]").forEach(b=>b.onclick=async()=>{const i=+b.dataset.u;if(i>0){const a=list[i],c=list[i-1];await sb.from("projects").update({position:i-1}).eq("id",a.id);await sb.from("projects").update({position:i}).eq("id",c.id);ui()}});
$("#sv").onclick=async()=>{const er=$("#er");er.textContent="";const title=$("#f1").value.trim();if(!title)return er.textContent="Укажите название";
let imgs=p.imgs;const fl=[...$("#f8").files];if(fl.length){imgs=[];for(const f of fl){const b=await sh(f),path=Date.now()+"-"+Math.random().toString(36).slice(2,7)+".jpg",{error}=await sb.storage.from("shots").upload(path,b,{contentType:"image/jpeg"});if(error)return er.textContent="Не удалось загрузить файл: "+error.message;imgs.push(sb.storage.from("shots").getPublicUrl(path).data.publicUrl)}}
if(!imgs.length)return er.textContent="Добавьте хотя бы один скриншот";
const r={title,desc_ru:$("#f2").value.trim(),desc_en:$("#f3").value.trim(),desc_kk:$("#f4").value.trim(),url:$("#f5").value.trim(),repo:$("#f6").value.trim(),tags:$("#f7").value.split(",").map(s=>s.trim()).filter(Boolean),imgs};
const q=ed?await sb.from("projects").update(r).eq("id",ed.id):await sb.from("projects").insert({...r,position:list.length});if(q.error)return er.textContent="Не удалось сохранить: "+q.error.message;ed=null;ui()}}
ui()})();
