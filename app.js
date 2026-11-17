(function(){
"use strict";

/* ============ HELPERS ============ */
const $ = id => document.getElementById(id);
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const uniq = a => [...new Set(a)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm = s => s.toLowerCase().replace(/[.,!?¡¿;:"()]/g,"").replace(/\s+/g," ").trim();
const noAcc = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"");
const stripArt = s => s.replace(/^(el|la|los|las|un|una) /,"");
const dkey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const today0 = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
function check(input, answers){
  const a = norm(input); if(!a) return null;
  const ans = answers.map(norm);
  if(ans.includes(a)) return "exact";
  if(ans.map(noAcc).includes(noAcc(a))) return "accent";
  return "wrong";
}
let toastT;
function toast(msg){ const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800); }

/* ============ STORAGE ============ */
const KEY = "vamos-cdm-v2", GOAL = 30;
let S = {done:{}, xp:0, xpDays:{}, first:{r:0,t:0}, missed:[], testDate:"2027-01-11", unlockAll:false, bestSpeed:0};
try { const raw = localStorage.getItem(KEY); if(raw) S = Object.assign(S, JSON.parse(raw)); } catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
const todayXP = () => S.xpDays[dkey(new Date())] || 0;
function addXP(n){ if(n <= 0) return; const k = dkey(new Date()); const before = todayXP(); S.xpDays[k] = before + n; S.xp += n; save(); drawTop(); if(before < GOAL && before + n >= GOAL) setTimeout(() => toast("🎉 Daily goal reached!"), 400); }
function streak(){ let s = 0; const d = today0(); if((S.xpDays[dkey(d)]||0) < 10) d.setDate(d.getDate()-1); while((S.xpDays[dkey(d)]||0) >= 10){ s++; d.setDate(d.getDate()-1); } return s; }
function daysLeft(){ const td = S.testDate ? new Date(S.testDate + "T00:00:00") : null; return td && !isNaN(td) ? Math.max(0, Math.round((td - today0())/864e5)) : "–"; }
function drawTop(){ $("tStreak").textContent = streak(); $("tXp").textContent = todayXP(); $("tDays").textContent = daysLeft(); }

/* ============ SPEECH ============ */
function say(text, rate){
  try{
    const ss = window.speechSynthesis; if(!ss) throw 0;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/___/g, ""));
    const vs = ss.getVoices();
    const v = vs.find(v => /^es(-|_)(MX|US|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang));
    if(v) u.voice = v; u.lang = v ? v.lang : "es-MX"; u.rate = (rate || 1) * 0.9;
    ss.speak(u);
  }catch(e){}
}
try{ window.speechSynthesis && window.speechSynthesis.getVoices(); }catch(e){}

/* ============ VERBS ============ */
const P6 = ["yo","tú","él / ella","nosotros","vosotros","ellos / ellas"];
const TN = {pres:"Present", pret:"Past (preterite)", impf:"Used to (imperfect)"};
const END = {
  pres:{ar:["o","as","a","amos","áis","an"],er:["o","es","e","emos","éis","en"],ir:["o","es","e","imos","ís","en"]},
  pret:{ar:["é","aste","ó","amos","asteis","aron"],er:["í","iste","ió","imos","isteis","ieron"],ir:["í","iste","ió","imos","isteis","ieron"]},
  impf:{ar:["aba","abas","aba","ábamos","abais","aban"],er:["ía","ías","ía","íamos","íais","ían"],ir:["ía","ías","ía","íamos","íais","ían"]}
};
const V = {
  hablar:{en:"to speak"},estudiar:{en:"to study"},trabajar:{en:"to work"},escuchar:{en:"to listen"},bailar:{en:"to dance"},caminar:{en:"to walk"},comprar:{en:"to buy"},viajar:{en:"to travel"},
  comer:{en:"to eat"},beber:{en:"to drink"},aprender:{en:"to learn"},correr:{en:"to run"},vivir:{en:"to live"},escribir:{en:"to write"},abrir:{en:"to open"},
  buscar:{en:"to look for"},tocar:{en:"to play (instrument)"},llegar:{en:"to arrive"},leer:{en:"to read"},
  ser:{en:"to be (what/who)",f:{pres:["soy","eres","es","somos","sois","son"],pret:["fui","fuiste","fue","fuimos","fuisteis","fueron"],impf:["era","eras","era","éramos","erais","eran"]}},
  estar:{en:"to be (feeling/place)",f:{pres:["estoy","estás","está","estamos","estáis","están"],pret:["estuve","estuviste","estuvo","estuvimos","estuvisteis","estuvieron"]}},
  tener:{en:"to have",f:{pres:["tengo","tienes","tiene","tenemos","tenéis","tienen"],pret:["tuve","tuviste","tuvo","tuvimos","tuvisteis","tuvieron"]}},
  ir:{en:"to go",f:{pres:["voy","vas","va","vamos","vais","van"],pret:["fui","fuiste","fue","fuimos","fuisteis","fueron"],impf:["iba","ibas","iba","íbamos","ibais","iban"]}},
  hacer:{en:"to do / make",f:{pres:["hago","haces","hace","hacemos","hacéis","hacen"],pret:["hice","hiciste","hizo","hicimos","hicisteis","hicieron"]}},
  ver:{en:"to see / watch",f:{pres:["veo","ves","ve","vemos","veis","ven"],pret:["vi","viste","vio","vimos","visteis","vieron"],impf:["veía","veías","veía","veíamos","veíais","veían"]}},
  salir:{en:"to go out",f:{pres:["salgo","sales","sale","salimos","salís","salen"]}},
  poner:{en:"to put",f:{pres:["pongo","pones","pone","ponemos","ponéis","ponen"],pret:["puse","pusiste","puso","pusimos","pusisteis","pusieron"]}},
  venir:{en:"to come",f:{pres:["vengo","vienes","viene","venimos","venís","vienen"],pret:["vine","viniste","vino","vinimos","vinisteis","vinieron"]}},
  decir:{en:"to say",f:{pres:["digo","dices","dice","decimos","decís","dicen"],pret:["dije","dijiste","dijo","dijimos","dijisteis","dijeron"]}},
  querer:{en:"to want",ch:["e","ie"],f:{pret:["quise","quisiste","quiso","quisimos","quisisteis","quisieron"]}},
  poder:{en:"to be able to",ch:["o","ue"],f:{pret:["pude","pudiste","pudo","pudimos","pudisteis","pudieron"]}},
  preferir:{en:"to prefer",ch:["e","ie"]},pensar:{en:"to think",ch:["e","ie"]},empezar:{en:"to start",ch:["e","ie"]},
  dormir:{en:"to sleep",ch:["o","ue"]},almorzar:{en:"to eat lunch",ch:["o","ue"]},volver:{en:"to return",ch:["o","ue"]},
  jugar:{en:"to play (sport)",ch:["u","ue"]},pedir:{en:"to order",ch:["e","i"]},
  levantarse:{en:"to get up"},ducharse:{en:"to shower"},acostarse:{en:"to go to bed",ch:["o","ue"]},despertarse:{en:"to wake up",ch:["e","ie"]},vestirse:{en:"to get dressed",ch:["e","i"]}
};
const RPRON = ["me","te","se","nos","os","se"];
function replLast(s, a, b){ const k = s.lastIndexOf(a); return k < 0 ? s : s.slice(0,k) + b + s.slice(k + a.length); }
function forms(inf, t){
  const v = V[inf] || {};
  if(v.f && v.f[t]) return v.f[t].slice();
  const refl = inf.endsWith("se") && inf.length > 4;
  const base = refl ? inf.slice(0,-2) : inf;
  const e = base.slice(-2), st = base.slice(0,-2);
  const out = END[t][e].map((x,i) => {
    let s = st;
    if(v.ch && t === "pres" && i !== 3 && i !== 4) s = replLast(st, v.ch[0], v.ch[1]);
    if(v.ch && t === "pret" && e === "ir" && (i === 2 || i === 5)) s = replLast(st, v.ch[0], v.ch[0] === "e" ? "i" : "u");
    return s + x;
  });
  if(t === "pret"){
    if(e === "ar"){
      if(st.endsWith("c")) out[0] = st.slice(0,-1) + "qué";
      else if(st.endsWith("g")) out[0] = st + "ué";
      else if(st.endsWith("z")) out[0] = st.slice(0,-1) + "cé";
    } else if(/[aeo]$/.test(st)){
      out.splice(0, 6, st+"í", st+"íste", st+"yó", st+"ímos", st+"ísteis", st+"yeron");
    }
  }
  return refl ? out.map((x,i) => RPRON[i] + " " + x) : out;
}

/* ============ COURSE INDEX ============ */
const UNITS = window.COURSE;
const ALL = [];
UNITS.forEach((u,ui) => u.lessons.forEach((L,li) => { L.unit = ui; L.idx = ALL.length; L.li = li; ALL.push(L); }));
const isDone = L => !!S.done[L.id];
const isOpen = L => S.unlockAll || L.idx === 0 || isDone(ALL[L.idx-1]) || isDone(L);
function current(){ return ALL.find(L => !isDone(L)) || ALL[ALL.length-1]; }
function unitVars(u){ return `--u:${u.color};--ud:${u.dark};--us:${u.soft}`; }
const starsTxt = n => "★".repeat(n) + "☆".repeat(3-n);

/* ============ LEARN (path) ============ */
function renderLearn(){
  const xp = todayXP(), pct = Math.min(1, xp / GOAL);
  $("goalNum").textContent = xp; $("goalArc").setAttribute("stroke-dashoffset", String(213.6 * (1 - pct)));
  $("dailyMsg").textContent = xp >= GOAL ? "Daily goal done! Keep going or try Practice." : `Daily goal: ${GOAL} XP. About ${Math.max(1, Math.ceil((GOAL - xp)/15))} more lesson${GOAL - xp > 15 ? "s" : ""}.`;
  const cur = current();
  const offs = [0, 56, 84, 56, 0, -56, -84, -56];
  const path = $("path"); path.innerHTML = "";
  UNITS.forEach((u, ui) => {
    const done = u.lessons.filter(isDone).length;
    const head = document.createElement("div"); head.className = "unit"; head.style.cssText = unitVars(u);
    head.innerHTML = `<div><div class="k">Unit ${ui+1} · ${done}/${u.lessons.length} done</div><h2>${esc(u.title)}</h2></div><button class="btn sm" type="button">📒 Notes</button>`;
    head.querySelector("button").addEventListener("click", () => openUnitNotes(ui));
    path.appendChild(head);
    const p = document.createElement("div"); p.className = "path";
    u.lessons.forEach((L, li) => {
      const b = document.createElement("button"); b.type = "button";
      const open = isOpen(L), d = isDone(L), isCur = L === cur && !d;
      b.className = "node" + (d ? " done" : "") + (!open ? " locked" : "") + (isCur ? " cur" : "");
      b.style.cssText = unitVars(u) + `;transform:translateX(${offs[li % offs.length]}px)`;
      b.setAttribute("aria-label", `${L.title}${d ? ", done" : !open ? ", locked" : ""}`);
      const icon = L.review ? "🏆" : d ? "★" : !open ? "🔒" : (li + 1);
      b.innerHTML = `${isCur ? `<span class="bubble">START</span>` : ""}<span class="circ">${icon}</span><span class="nm">${esc(L.title)}</span><span class="stars">${d ? starsTxt(S.done[L.id].stars) : ""}</span>`;
      b.addEventListener("click", () => openLessonSheet(L));
      p.appendChild(b);
    });
    path.appendChild(p);
  });
  $("contBtn").textContent = isDone(cur) ? "Review a lesson" : `Continue: ${cur.title}`;
}
$("contBtn").addEventListener("click", () => openLessonSheet(current()));

/* ============ SHEETS ============ */
function openSheet(html){ $("sheet").innerHTML = html; $("scrim").hidden = false; }
function closeSheet(){ $("scrim").hidden = true; }
$("scrim").addEventListener("click", e => { if(e.target === $("scrim")) closeSheet(); });
document.addEventListener("keydown", e => { if(e.key === "Escape" && !$("scrim").hidden) closeSheet(); });
function noteCardHTML(card){
  const [t, b, ex] = card;
  return `<div class="notecard"><h3>${esc(t)}</h3><p>${esc(b)}</p>${(ex||[]).length ? `<div class="ex">${ex.map(([es,en]) => `<button class="say" type="button" data-say="${esc(es)}" aria-label="Hear it">🔊</button><span class="es">${esc(es)}</span><span class="en">${esc(en)}</span>`).join("")}</div>` : ""}</div>`;
}
function chartHTML(inf, t){
  const f = forms(inf, t);
  return `<div class="notecard"><h3>${esc(inf)} · ${esc(TN[t])}</h3><p class="small muted">${esc((V[inf]||{}).en || "")}</p><table class="conj">${P6.map((p,i) => `<tr><td>${esc(p)}</td><td><b>${esc(f[i])}</b></td></tr>`).join("")}</table></div>`;
}
function lessonNotesHTML(L){
  let h = L.teach.map(noteCardHTML).join("");
  if(L.verbs) h += chartHTML(L.verbs.v[0], L.verbs.t);
  return h;
}
function wireSay(root){ root.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => say(b.dataset.say, 0.9))); }
function openLessonSheet(L){
  const u = UNITS[L.unit], open = isOpen(L), d = S.done[L.id];
  const tips = L.teach.map(c => c[0]);
  openSheet(`<div class="stack" style="${unitVars(u)}">
    <div class="row between"><span class="pill" style="color:${u.dark}">Unit ${L.unit+1} · Lesson ${L.li+1} of ${u.lessons.length}</span>${d ? `<span class="pill" style="color:var(--gold-d)">${starsTxt(d.stars)}</span>` : ""}</div>
    <h2>${esc(L.title)}</h2>
    ${L.review ? `<p class="muted">A mixed review of everything in the course. Great to do the week before the test.</p>` : `<p class="muted">You'll learn: ${esc(tips.join(" · "))}</p>`}
    ${open ? `<button class="btn pink wide" id="shStart">${d ? "Practice again (+XP)" : "Start lesson"}</button>${L.teach.length ? `<button class="btn wide" id="shTips">📒 Read the tips first</button>` : ""}`
           : `<div class="result bad">🔒 Finish the lesson before this one to unlock it.</div><button class="btn wide" id="shUnlock">Unlock everything instead</button>`}
  </div>`);
  if(open){
    $("shStart").addEventListener("click", () => { closeSheet(); startLesson(L); });
    $("shTips") && $("shTips").addEventListener("click", () => { openSheet(`<div class="stack"><h2>${esc(L.title)}</h2>${lessonNotesHTML(L)}<button class="btn pink wide" id="shStart2">Start lesson</button></div>`); wireSay($("sheet")); $("shStart2").addEventListener("click", () => { closeSheet(); startLesson(L); }); });
  } else {
    $("shUnlock").addEventListener("click", () => { S.unlockAll = true; save(); closeSheet(); renderLearn(); toast("All lessons unlocked"); });
  }
}
function openUnitNotes(ui){
  const u = UNITS[ui];
  openSheet(`<div class="stack"><h2>Unit ${ui+1}: ${esc(u.title)}</h2>${u.lessons.filter(L => !L.review).map(L => `<h3 style="margin-top:6px">${esc(L.title)}</h3>${lessonNotesHTML(L)}`).join("")}<button class="btn wide" id="shClose">Close</button></div>`);
  wireSay($("sheet")); $("shClose").addEventListener("click", closeSheet);
}

/* ============ EXERCISE BUILDERS ============ */
function exVocabMC(w, pool, dir){
  const others = shuffle(pool.filter(x => x[0] !== w[0])).slice(0,3);
  if(dir === "es") return {k:"mc", kind:"What does this mean?", q:w[0], speak:w[0], opts:[w[1], ...others.map(x => x[1])], ans:w[1], es:w[0], key:"v:"+w[0]};
  return {k:"mc", kind:"Pick the Spanish", q:w[1], opts:[w[0], ...others.map(x => x[0])], ans:w[0], es:w[0], key:"v2:"+w[0]};
}
function exVocabType(w){ return {k:"type", kind:"Type it in Spanish", q:w[1], answers:w[0].split(" / ").flatMap(x => [x, stripArt(x)]), show:w[0], es:w[0], key:"vt:"+w[0]}; }
function exMC(m){ return {k:"mc", kind:"Fill in the blank", q:m[0], opts:m[1].slice(), ans:m[1][m[2]], why:m[3], es:m[0].replace("___", m[1][m[2]]).replace(/\(.*?\)/g,""), key:"m:"+m[0]}; }
function cleanTok(t, i){ t = t.replace(/[¿?¡!.,;:]/g,""); return i === 0 && !/^(Ana|Raleigh|México|Madrid|Carlos|Sofía)$/.test(t) ? t.toLowerCase() : t; }
function exBank(s, pool){
  const toks = s[0].split(" ").map(cleanTok).filter(Boolean);
  const mine = new Set(toks.map(t => noAcc(t.toLowerCase())));
  const extra = shuffle(uniq(pool.filter(x => x !== s).flatMap(x => x[0].split(" ").map((t,i) => cleanTok(t, i)))).filter(t => t && !mine.has(noAcc(t.toLowerCase())))).slice(0,3);
  return {k:"bank", kind:"Write this in Spanish", q:s[1], tiles:shuffle(toks.concat(extra)), es:s[0], key:"b:"+s[0]};
}
function exListen(s, pool){
  if(Math.random() < 0.5 && pool.length >= 3){
    const others = shuffle(pool.filter(x => x !== s)).slice(0,2);
    return {k:"lpick", kind:"What did you hear?", opts:[s[1], ...others.map(x => x[1])], ans:s[1], es:s[0], key:"lp:"+s[0]};
  }
  return {k:"ltype", kind:"Type what you hear", es:s[0], en:s[1], key:"lt:"+s[0]};
}
function exConj(verbs){
  const inf = pick(verbs.v), i = verbs.p != null ? verbs.p : rnd(6), f = forms(inf, verbs.t)[i];
  return {k:"type", kind:"Conjugate", q:`${P6[i]} · ${inf}`, sub:`${TN[verbs.t]} · ${(V[inf]||{}).en || ""}`, answers:[f], show:f, es:f, key:"c:"+inf+verbs.t+i};
}
function exMatch(pool){ return {k:"match", kind:"Match the pairs", pairs:shuffle(pool).slice(0,5)}; }

function buildLesson(L){
  let src = L;
  if(L.review){
    const ls = ALL.filter(x => !x.review);
    src = {vocab: ls.flatMap(x => x.vocab), sent: ls.flatMap(x => x.sent), mc: ls.flatMap(x => x.mc), verbs: pick(ls.filter(x => x.verbs)).verbs};
  }
  const vocab = shuffle(src.vocab), sent = shuffle(src.sent), mc = shuffle(src.mc);
  const ex = [];
  if(vocab.length >= 4){ ex.push(exVocabMC(vocab[0], src.vocab, "es")); ex.push(exVocabMC(vocab[1], src.vocab, "en")); }
  if(vocab[2]) ex.push(exVocabType(vocab[2]));
  mc.slice(0, 3).forEach(m => ex.push(exMC(m)));
  sent.slice(0, 2).forEach(s => ex.push(exBank(s, src.sent)));
  if(sent[2]) ex.push(exListen(sent[2], src.sent));
  if(src.verbs){ ex.push(exConj(src.verbs)); ex.push(exConj(src.verbs)); }
  if(L.review){ mc.slice(3,5).forEach(m => ex.push(exMC(m))); if(sent[3]) ex.push(exListen(sent[3], src.sent)); }
  let out = shuffle(ex);
  if(src.vocab.length >= 5) out.splice(Math.min(3, out.length), 0, exMatch(src.vocab));
  const teach = [];
  if(!isDone(L) && !L.review){
    L.teach.forEach(c => teach.push({k:"teach", card:c}));
    if(L.verbs) teach.push({k:"teach", chart:[L.verbs.v[0], L.verbs.t]});
  }
  return teach.concat(out);
}

/* ============ PLAYER ============ */
let P = null;
function startLesson(L, custom){
  const items = custom || buildLesson(L);
  items.forEach(it => it.tries = 0);
  P = {L, queue: items.slice(), total: items.filter(i => i.k !== "teach").length, correct:0, firstRight:0, firstTotal:0, combo:0, state:"answer", cur:null, mistakesMode: !!custom, startedAt: Date.now()};
  $("player").hidden = false; document.body.style.overflow = "hidden";
  nextItem();
}
function setBar(){ $("pBar").style.width = (P.total ? P.correct / P.total * 100 : 0) + "%"; }
function footer(state, html, label, enabled){
  const f = $("pFoot"); f.className = "p-foot" + (state ? " " + state : "");
  $("pFb").innerHTML = html || "";
  const b = $("pBtn"); b.textContent = label; b.disabled = !enabled;
  b.className = "btn " + (state === "no" ? "red" : "green");
}
function nextItem(){
  setBar();
  if(!P.queue.length) return finishLesson();
  const it = P.queue.shift(); P.cur = it; P.state = "answer"; P.answer = null;
  const body = $("pBody"); body.innerHTML = ""; body.scrollTop = 0;
  RENDER[it.k](it, body);
  wireSay(body);
}
function ready(v){ P.answer = v; $("pBtn").disabled = v == null || v === "" || (Array.isArray(v) && !v.length); }
const RENDER = {
  teach(it, body){
    body.innerHTML = `<div class="p-kind">New tip</div>${it.chart ? chartHTML(it.chart[0], it.chart[1]) : noteCardHTML(it.card)}`;
    footer("", "", "Got it", true);
  },
  mc(it, body){
    const qh = esc(it.q).replace("___", `<span class="blank"></span>`);
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="row" style="align-items:center">${it.speak ? `<button class="speaker sm" type="button" data-say="${esc(it.speak)}" aria-label="Hear it">🔊</button>` : ""}<div class="p-q">${qh}</div></div><div class="opts"></div>`;
    const box = body.querySelector(".opts");
    shuffle(uniq(it.opts)).forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = o;
      b.addEventListener("click", () => { if(P.state !== "answer") return; box.querySelectorAll(".opt").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); ready(o); });
      box.appendChild(b); });
    if(it.speak) say(it.speak, 0.9);
    footer("", "", "Check", false);
    it.grade = () => { const ok = P.answer === it.ans; box.querySelectorAll(".opt").forEach(x => { if(x.textContent === it.ans) x.classList.add("right"); else if(x.classList.contains("sel")) x.classList.add("wrong"); }); return {ok, show:it.ans, why:it.why}; };
  },
  lpick(it, body){
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="row center"><button class="speaker" type="button" data-say="${esc(it.es)}" aria-label="Play">🔊</button><button class="speaker sm" type="button" id="slow" aria-label="Play slowly">🐢</button></div><div class="opts"></div>`;
    $("slow").addEventListener("click", () => say(it.es, 0.65));
    const box = body.querySelector(".opts");
    shuffle(it.opts).forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = o;
      b.addEventListener("click", () => { if(P.state !== "answer") return; box.querySelectorAll(".opt").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); ready(o); });
      box.appendChild(b); });
    setTimeout(() => say(it.es, 0.9), 250);
    footer("", "", "Check", false);
    it.grade = () => { const ok = P.answer === it.ans; box.querySelectorAll(".opt").forEach(x => { if(x.textContent === it.ans) x.classList.add("right"); else if(x.classList.contains("sel")) x.classList.add("wrong"); }); return {ok, show:`${it.es} = ${it.ans}`}; };
  },
  type(it, body){
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="p-q">${esc(it.q)}</div>${it.sub ? `<div class="pill" style="align-self:flex-start">${esc(it.sub)}</div>` : ""}<input class="answer" id="ans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type in Spanish"><div class="accents" data-for="ans"></div>`;
    wireAccents(body.querySelector(".accents"));
    const inp = $("ans"); inp.addEventListener("input", () => ready(inp.value.trim())); setTimeout(() => inp.focus(), 50);
    footer("", "", "Check", false);
    it.grade = () => { let r = check(stripArt(norm(inp.value)), it.answers); if(r === "wrong") r = check(inp.value, it.answers) || "wrong"; inp.disabled = true;
      return {ok: r !== "wrong", show: it.show, why: r === "accent" ? `Watch the accent: ${it.show}` : null, accent: r === "accent"}; };
  },
  ltype(it, body){
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="row center"><button class="speaker" type="button" data-say="${esc(it.es)}" aria-label="Play">🔊</button><button class="speaker sm" type="button" id="slow" aria-label="Play slowly">🐢</button></div><textarea class="answer" id="ans" placeholder="Type the Spanish you hear" spellcheck="false" style="min-height:90px"></textarea><div class="accents" data-for="ans"></div>`;
    $("slow").addEventListener("click", () => say(it.es, 0.65));
    wireAccents(body.querySelector(".accents"));
    const inp = $("ans"); inp.addEventListener("input", () => ready(inp.value.trim()));
    setTimeout(() => say(it.es, 0.9), 250);
    footer("", "", "Check", false);
    it.grade = () => { const a = noAcc(norm(inp.value)), b = noAcc(norm(it.es)); inp.disabled = true; return {ok: a === b, show:`${it.es} (${it.en})`, why: a === b && norm(inp.value) !== norm(it.es) ? "Watch the accents." : null}; };
  },
  bank(it, body){
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="p-q">${esc(it.q)}</div><div class="tiles" id="build" aria-label="Your answer"></div><div class="tiles bank" id="bank" aria-label="Word bank"></div>`;
    const build = $("build"), bank = $("bank");
    it.tiles.forEach(t => { const b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.textContent = t;
      b.addEventListener("click", () => { if(P.state !== "answer") return; (b.parentElement === bank ? build : bank).appendChild(b); ready([...build.children].map(x => x.textContent)); });
      bank.appendChild(b); });
    footer("", "", "Check", false);
    it.grade = () => { const ok = noAcc(norm(P.answer.join(" "))) === noAcc(norm(it.es)); return {ok, show:it.es}; };
  },
  match(it, body){
    body.innerHTML = `<div class="p-kind">${esc(it.kind)}</div><div class="p-q">Tap the matching pairs</div><div class="match" id="mg"></div>`;
    const L = shuffle(it.pairs.map(w => ({w, s:"es"}))), R = shuffle(it.pairs.map(w => ({w, s:"en"})));
    let sel = null, left = it.pairs.length;
    const g = $("mg");
    for(let i = 0; i < it.pairs.length; i++) [L[i], R[i]].forEach(o => {
      const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.style.textAlign = "center"; b.textContent = o.s === "es" ? o.w[0] : o.w[1]; o.b = b;
      b.addEventListener("click", () => {
        if(o.s === "es") say(o.w[0], 0.9);
        if(!sel || sel.s === o.s){ if(sel) sel.b.classList.remove("sel"); sel = o; b.classList.add("sel"); return; }
        if(sel.w === o.w){ [sel.b, b].forEach(x => { x.classList.remove("sel"); x.classList.add("right"); setTimeout(() => x.classList.add("gone"), 300); }); sel = null; left--;
          if(left === 0){ P.correct++; P.firstRight++; P.firstTotal++; setBar(); P.state = "feedback"; footer("ok", `<h3>All matched!</h3>`, "Continue", true); } }
        else { const s = sel; [s.b, b].forEach(x => { x.classList.remove("sel"); x.classList.add("wrong"); setTimeout(() => x.classList.remove("wrong"), 450); }); sel = null; }
      });
      g.appendChild(b);
    });
    footer("", `<span class="muted small">Match all ${it.pairs.length} pairs</span>`, "Check", false);
  }
};
$("pBtn").addEventListener("click", () => {
  if(!P) return;
  const it = P.cur;
  if(it.k === "teach" || P.state === "feedback") return nextItem();
  if($("pBtn").disabled) return;
  const r = it.grade(); P.state = "feedback";
  const first = it.tries === 0;
  if(first) P.firstTotal++;
  if(r.ok){
    P.correct++; if(first) P.firstRight++; P.combo++;
    if(P.mistakesMode) S.missed = S.missed.filter(m => m.key !== it.key);
    const cheers = ["Nice!","¡Excelente!","¡Muy bien!","Great job!","¡Perfecto!"];
    footer("ok", `<h3>${r.accent ? "Almost perfect!" : pick(cheers)}</h3>${r.why ? `<div class="small">${esc(r.why)}</div>` : ""}`, "Continue", true);
    if(it.es && it.k !== "ltype" && it.k !== "lpick") say(it.es, 0.95);
  } else {
    it.tries++; P.combo = 0;
    if(it.tries < 3) P.queue.push(it);
    if(it.key && it.k !== "match"){ const copy = Object.assign({}, it); delete copy.grade; delete copy.tries; S.missed = S.missed.filter(m => m.key !== it.key).concat([copy]).slice(-60); save(); }
    footer("no", `<h3>Correct answer:</h3><div>${esc(r.show)}</div>${r.why ? `<div class="small">${esc(r.why)}</div>` : ""}`, "Got it", true);
  }
  $("pCombo").hidden = P.combo < 3; $("pCombo").textContent = `🔥 ${P.combo} in a row`;
  setBar();
});
document.addEventListener("keydown", e => {
  if($("player").hidden || e.key !== "Enter" || e.shiftKey) return;
  if(e.target.tagName === "TEXTAREA" && P && P.state === "answer"){ e.preventDefault(); }
  if(!$("pBtn").disabled){ e.preventDefault(); $("pBtn").click(); }
});
function closePlayer(){ $("player").hidden = true; document.body.style.overflow = ""; P = null; try{ speechSynthesis.cancel(); }catch(e){} route(); }
$("pX").addEventListener("click", () => {
  if(!P || P.done) return closePlayer();
  if(P.state === "quitask") return;
  footer("no", `<h3>Quit this lesson?</h3><div class="small">You'll lose this lesson's progress.</div>`, "Keep going", true);
  const b = $("pBtn"); const saved = P.state; P.state = "quitask";
  const q = document.createElement("button"); q.className = "btn sm"; q.textContent = "Quit"; q.id = "quitBtn";
  q.addEventListener("click", closePlayer);
  $("pFb").appendChild(q);
  const once = () => { b.removeEventListener("click", once, true); if(P && P.state === "quitask"){ if(saved !== "feedback" && P.cur.k !== "teach") P.queue.unshift(P.cur); P.state = "feedback"; } };
  b.addEventListener("click", once, true);
});
function finishLesson(){
  const acc = P.firstTotal ? P.firstRight / P.firstTotal : 1;
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const xp = P.mistakesMode ? 5 + P.firstRight : 10 + P.firstRight;
  const mins = Math.max(1, Math.round((Date.now() - P.startedAt)/60000));
  S.first.r += P.firstRight; S.first.t += P.firstTotal;
  if(!P.mistakesMode && P.L){ const prev = S.done[P.L.id]; S.done[P.L.id] = {stars: Math.max(stars, prev ? prev.stars : 0), times: (prev ? prev.times : 0) + 1, last: dkey(new Date())}; }
  addXP(xp); save(); P.done = true;
  $("pBody").innerHTML = `<div class="done-screen">
    <div class="bigstars">${starsTxt(stars)}</div>
    <h1>${P.mistakesMode ? "Mistakes fixed!" : "Lesson complete!"}</h1>
    <p class="muted">${stars === 3 ? "Perfect, or close to it. ¡Increíble!" : stars === 2 ? "Nice work. Replay it later for 3 stars." : "Good start. Replay this one tomorrow to lock it in."}</p>
    <div class="statbox"><div><b>+${xp}</b><span>XP</span></div><div><b>${Math.round(acc*100)}%</b><span>first try</span></div><div><b>${mins}</b><span>min</span></div></div>
  </div>`;
  $("pBar").style.width = "100%"; $("pCombo").hidden = true;
  footer("ok", "", "Continue", true);
  P.cur = {k:"teach"}; P.queue = [];
  $("pBtn").onclick = null;
  const b = $("pBtn"); const fin = () => { b.removeEventListener("click", fin, true); closePlayer(); };
  b.addEventListener("click", fin, true);
}

/* ============ ACCENTS ============ */
function wireAccents(box){
  box.innerHTML = "";
  ["á","é","í","ó","ú","ñ","ü","¿","¡"].forEach(ch => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = ch; b.setAttribute("aria-label","Type " + ch);
    b.addEventListener("mousedown", e => e.preventDefault());
    b.addEventListener("click", () => { const t = $(box.dataset.for); if(!t || t.disabled) return; const s = t.selectionStart ?? t.value.length, en = t.selectionEnd ?? s; t.value = t.value.slice(0,s) + ch + t.value.slice(en); t.focus(); t.setSelectionRange(s+1,s+1); t.dispatchEvent(new Event("input")); });
    box.appendChild(b);
  });
}

/* ============ PROGRESS ============ */
function renderProgress(){
  const nDone = ALL.filter(isDone).length;
  const words = uniq(ALL.filter(isDone).flatMap(L => L.vocab.map(w => w[0]))).length;
  $("sStreak").textContent = streak(); $("sXp").textContent = S.xp; $("sLessons").textContent = `${nDone}/${ALL.length}`;
  $("sWords").textContent = words; $("sAcc").textContent = S.first.t ? Math.round(S.first.r / S.first.t * 100) + "%" : "–"; $("sDays").textContent = daysLeft();
  // chart
  const days = []; for(let i = 13; i >= 0; i--){ const d = today0(); d.setDate(d.getDate() - i); days.push(d); }
  const vals = days.map(d => S.xpDays[dkey(d)] || 0), max = Math.max(GOAL * 1.5, ...vals);
  const W = 560, H = 150, bw = 26, gap = (W - 20 - bw*14) / 13, y = v => H - 22 - (v / max) * (H - 40);
  let svg = `<line x1="0" x2="${W}" y1="${y(GOAL)}" y2="${y(GOAL)}" stroke="#ffb3d1" stroke-width="2" stroke-dasharray="6 5"/><text x="${W-2}" y="${y(GOAL)-5}" text-anchor="end" font-size="11" fill="#e0438a" font-weight="800">goal</text>`;
  days.forEach((d,i) => { const x = 10 + i*(bw+gap), v = vals[i], top = y(v);
    svg += `<rect x="${x}" y="${top}" width="${bw}" height="${Math.max(0, H - 22 - top)}" rx="7" fill="${v >= GOAL ? "#ff5fa2" : "#5cc2ff"}"><title>${d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}: ${v} XP</title></rect>`;
    if(v) svg += `<text x="${x + bw/2}" y="${top - 4}" text-anchor="middle" font-size="10" fill="#4a3550" font-weight="800">${v}</text>`;
    svg += `<text x="${x + bw/2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#9a879f" font-weight="700">${"SMTWTFS"[d.getDay()]}</text>`; });
  $("xpChart").innerHTML = svg;
  // units
  $("unitBars").innerHTML = UNITS.map((u,ui) => { const d = u.lessons.filter(isDone).length, n = u.lessons.length;
    return `<div class="stack" style="gap:5px"><div class="row between small"><b>Unit ${ui+1}: ${esc(u.title)}</b><span class="muted">${d}/${n}</span></div><div class="ubar"><i style="width:${d/n*100}%;background:${u.color}"></i></div></div>`; }).join("");
  // grammar list
  $("gramList").innerHTML = "";
  ALL.filter(L => !L.review).forEach(L => { const d = S.done[L.id];
    const row = document.createElement("button"); row.type = "button"; row.className = "gl"; row.style.cssText = "width:100%;background:none;border:0;border-bottom:2px solid var(--line);text-align:left;cursor:pointer;font:inherit;color:inherit";
    row.innerHTML = `<span class="m ${d ? "y" : ""}">${d ? "✓" : ""}</span><span>${esc(L.title)} <span class="small muted">· Unit ${L.unit+1}</span></span><span style="color:var(--gold-d)">${d ? starsTxt(d.stars) : ""}</span>`;
    row.addEventListener("click", () => openLessonSheet(L));
    $("gramList").appendChild(row); });
  const g = (S.grades || []).slice(-8).reverse();
  $("gradeList").innerHTML = g.length ? g.map(x => `<div class="gl"><span class="m ${/High|Intermediate/.test(x.lv) ? "y" : ""}">${/High|Intermediate/.test(x.lv) ? "✓" : ""}</span><span>${x.k === "write" ? "✏️ Writing" : x.k === "interview" ? "🎤 Interview" : "⏱️ Talk"} · ${esc(x.lv)} <span class="small muted">· ${esc(x.d)}</span></span><b>${x.sc}</b></div>`).join("") : `<p class="small muted">No teacher grades yet. Do a mock interview, one-minute talk or writing in Practice.</p>`;
  $("testDate").value = S.testDate || ""; $("unlockAll").checked = !!S.unlockAll;
}
$("testDate").addEventListener("change", e => { S.testDate = e.target.value; save(); drawTop(); renderProgress(); });
$("unlockAll").addEventListener("change", e => { S.unlockAll = e.target.checked; save(); });

/* ============ NOTES ============ */
function renderNotes(){
  const box = $("notesList"); box.innerHTML = "";
  UNITS.forEach((u,ui) => {
    const d = document.createElement("details"); d.className = "card"; d.style.borderColor = u.color;
    d.innerHTML = `<summary style="cursor:pointer"><h2 style="display:inline;color:${u.dark}">Unit ${ui+1}: ${esc(u.title)}</h2></summary><div class="stack" style="margin-top:14px">${u.lessons.filter(L => !L.review).map(L => `<h3>${esc(L.title)}</h3>${lessonNotesHTML(L)}`).join("")}</div>`;
    box.appendChild(d);
  });
  wireSay(box);
}

/* ============ PRACTICE DATA ============ */
const TOPICS = ["Me & my family","School","Free time","Daily routine","Food","Home & town","Weather & plans"];
const INTERVIEW = [
  [["¿Cómo te llamas y cuántos años tienes?","What's your name and how old are you?","Me llamo Ana y tengo quince años.",0],["¿Cómo eres?","What are you like?","Soy simpática y trabajadora, pero a veces soy un poco tímida.",0],["¿Cuántas personas hay en tu familia?","How many people are in your family?","Hay cuatro personas en mi familia: mis padres, mi hermano y yo.",0],["¿Cómo es tu mejor amigo o amiga?","What is your best friend like?","Mi mejor amiga es alta y muy graciosa. Me gusta porque siempre me ayuda.",0],["¿Qué hiciste con tu familia el fin de semana pasado?","What did you do with your family last weekend?","El sábado pasado fuimos al parque y comimos en un restaurante.",1]],
  [["¿Cuál es tu clase favorita? ¿Por qué?","What's your favorite class? Why?","Mi clase favorita es ciencias porque es interesante y la profesora es simpática.",0],["¿A qué hora empiezan tus clases?","What time do your classes start?","Mis clases empiezan a las siete y veinticinco de la mañana.",0],["¿Qué haces durante el almuerzo?","What do you do during lunch?","Durante el almuerzo como con mis amigos y hablamos mucho.",0],["¿Tienes mucha tarea?","Do you have a lot of homework?","Sí, tengo mucha tarea, especialmente en matemáticas.",0],["¿Qué hiciste en la escuela ayer?","What did you do at school yesterday?","Ayer tuve un examen de historia y después estudié en la biblioteca.",1]],
  [["¿Qué te gusta hacer después de las clases?","What do you like to do after school?","Me gusta escuchar música y correr porque me relaja.",0],["¿Practicas algún deporte?","Do you play a sport?","Sí, juego al tenis los sábados con mi hermano.",0],["¿Qué haces los fines de semana?","What do you do on weekends?","Los fines de semana salgo con mis amigos y vemos películas.",0],["¿Qué hiciste el fin de semana pasado?","What did you do last weekend?","El fin de semana pasado fui al centro comercial y compré ropa.",1],["¿Qué vas a hacer este fin de semana?","What are you going to do this weekend?","Este fin de semana voy a visitar a mis abuelos.",0]],
  [["¿A qué hora te levantas?","What time do you get up?","Me levanto a las seis porque las clases empiezan temprano.",0],["¿Qué desayunas normalmente?","What do you usually eat for breakfast?","Normalmente desayuno cereal con leche y fruta.",0],["¿Cómo vas a la escuela?","How do you get to school?","Voy a la escuela en autobús con mi hermano.",0],["¿Qué haces por la noche?","What do you do at night?","Por la noche hago la tarea, ceno con mi familia y leo un poco.",0],["¿Qué hiciste ayer por la mañana?","What did you do yesterday morning?","Ayer me levanté a las seis, me duché y desayuné rápido.",1]],
  [["¿Cuál es tu comida favorita?","What's your favorite food?","Mi comida favorita es la pizza porque es deliciosa.",0],["¿Qué comes en el almuerzo?","What do you eat for lunch?","En el almuerzo como un sándwich y una fruta.",0],["¿Te gusta la comida picante?","Do you like spicy food?","Sí, me encanta la comida picante, pero a mi hermano no le gusta.",0],["Estás en un restaurante. ¿Qué quieres pedir?","You're at a restaurant. What do you want to order?","Quisiera el pollo con arroz y un jugo de naranja, por favor.",0],["¿Qué cenaste anoche?","What did you have for dinner last night?","Anoche cené pasta con verduras con mi familia.",1]],
  [["¿Cómo es tu casa?","What is your house like?","Mi casa es grande y tiene tres dormitorios y un jardín.",0],["¿Cuál es tu cuarto favorito? ¿Por qué?","What's your favorite room? Why?","Mi cuarto favorito es mi dormitorio porque es tranquilo.",0],["¿Qué hay cerca de tu casa?","What is near your house?","Cerca de mi casa hay un parque y un supermercado.",0],["¿Te gusta tu barrio?","Do you like your neighborhood?","Sí, me gusta mi barrio porque es tranquilo y mis amigos viven cerca.",0],["¿Cómo era tu casa cuando eras niña?","What was your house like when you were little?","Cuando era niña, vivía en un apartamento pequeño.",1]],
  [["¿Qué tiempo hace hoy?","What's the weather like today?","Hoy hace frío y está nublado.",0],["¿Cuál es tu estación favorita? ¿Por qué?","What's your favorite season? Why?","Mi estación favorita es el verano porque hace sol y voy a la playa.",0],["¿Qué vas a hacer en las vacaciones de invierno?","What are you going to do over winter break?","En las vacaciones voy a viajar a Nueva York con mi familia.",0],["¿Cómo celebras tu cumpleaños?","How do you celebrate your birthday?","Normalmente celebro mi cumpleaños con una fiesta pequeña y un pastel.",0],["¿Qué hiciste el verano pasado?","What did you do last summer?","El verano pasado fui a la playa y nadé mucho.",1]]
];
const PROMPTS = [
  ["Introduce yourself: name, age, where you live, what you're like.","Describe two people in your family.","Write to a new pen pal about your family."],
  ["Describe your school day from first class to last.","What's your favorite class and why?","What did you do at school yesterday?"],
  ["What do you do after school and on weekends? Why?","Invite a friend to do something this weekend.","What did you do last weekend?"],
  ["Walk through a normal weekday from morning to night.","How is your Saturday different from your Monday?","What did you do yesterday morning?"],
  ["Order a meal and a drink at a restaurant.","Describe your favorite food and when you eat it.","What did you eat yesterday?"],
  ["Describe your house and your favorite room.","Describe your town: what's near your house?","What was your house like when you were little?"],
  ["Describe your favorite season and what you do then.","What are you going to do over winter break?","How did you celebrate your last birthday?"]
];
const MODEL = [
  "Hola, me llamo Ana y tengo quince años. Vivo en Raleigh con mi familia. Soy simpática y trabajadora, pero a veces soy tímida. Mi madre es profesora y mi padre es ingeniero. Tengo un hermano menor que es muy gracioso. El fin de semana pasado fuimos al parque juntos. ¡Me encanta mi familia porque siempre me ayuda!",
  "Mi escuela es grande y moderna. Las clases empiezan a las siete y veinticinco. Primero tengo matemáticas, luego ciencias y después inglés. Mi clase favorita es ciencias porque es interesante. No me gusta la historia porque es un poco aburrida. Ayer tuve un examen difícil, pero saqué una buena nota.",
  "Después de las clases me gusta correr y escuchar música. Los sábados juego al fútbol con mis amigos en el parque. Me encanta porque es divertido y me relaja. A veces vemos películas en mi casa. El fin de semana pasado fui al centro comercial con mi hermana. Este sábado voy a nadar.",
  "Normalmente me despierto a las seis. Primero me ducho y me visto. Luego desayuno cereal con fruta. Voy a la escuela en autobús. Por la tarde hago la tarea y por la noche ceno con mi familia. Me acuesto a las diez y media porque siempre estoy cansada. Ayer me levanté tarde y llegué tarde a la escuela.",
  "Mi comida favorita es la pizza con queso. En casa normalmente comemos arroz, pollo y verduras. Mi madre cocina muy bien. Los domingos comemos en un restaurante mexicano porque los tacos son deliciosos. No me gusta el pescado. Anoche cené sopa de pollo con mi familia.",
  "Vivo en una casa grande en un barrio tranquilo. Mi casa tiene tres dormitorios, una cocina y una sala. Mi cuarto favorito es mi dormitorio porque es cómodo. Cerca de mi casa hay un parque y un supermercado. La escuela está lejos, a quince minutos en carro. Cuando era niña, vivía en un apartamento pequeño.",
  "Mi estación favorita es el verano porque hace sol y calor. En el invierno hace frío y a veces nieva. En las vacaciones de invierno voy a visitar a mis abuelos. También voy a ver películas y descansar. El año pasado celebramos la Navidad en casa con una cena grande. ¡Fue muy divertido!"
];
const PASSAGES = [
  {t:0,title:"Lucía's family",text:"¡Hola! Me llamo Lucía y tengo quince años. Vivo en Raleigh con mi familia. Mi madre se llama Ana y es enfermera. Es muy simpática y trabajadora. Mi padre es profesor de historia. Tengo un hermano menor, Diego. Él tiene diez años y es muy gracioso, pero a veces es perezoso. También tenemos un perro grande que se llama Toby.",qs:[["How old is Lucía?",["10","15","50"],1],["What does her mother do?",["She's a teacher","She's a nurse","She's a doctor"],1],["What is Diego like?",["Funny, but sometimes lazy","Shy and serious","Tall and smart"],0]]},
  {t:1,title:"Yesterday at school",text:"Ayer fue un día muy largo. Las clases empezaron a las siete y veinticinco. Primero tuve un examen de matemáticas. Fue difícil, pero saqué una buena nota. Después almorcé con mis amigos en la cafetería. Comí pizza y bebí jugo. Por la tarde, fuimos a la biblioteca para estudiar. Llegué a casa a las cinco muy cansada.",qs:[["What happened first?",["A math test","Lunch with friends","A trip to the library"],0],["How did the test go?",["It was easy","It was hard, but she got a good grade","She didn't finish it"],1],["When did she get home?",["At 3:00","At 5:00","At 7:25"],1]]},
  {t:1,title:"Library notice",text:"La biblioteca de la escuela está abierta de lunes a viernes, de las siete a las cuatro. Los estudiantes pueden estudiar, leer y usar las computadoras. No se puede comer ni beber en la biblioteca. Los martes hay un club de lectura a las tres. Para sacar libros, necesitas tu tarjeta de estudiante.",qs:[["When is the library open?",["Monday to Friday, 7 to 4","Every day","Only weekends"],0],["What is NOT allowed?",["Using computers","Eating and drinking","Reading"],1],["When is the book club?",["Monday at 3","Tuesday at 3","Friday at 4"],1]]},
  {t:2,title:"Sports club flyer",text:"¡Club de Deportes! ¿Te gusta jugar al fútbol o al básquetbol? ¿Quieres hacer nuevos amigos? Practicamos los martes y los jueves después de las clases, de las tres a las cinco, en el gimnasio. No necesitas experiencia. El club es gratis. Para más información, habla con el señor Ramírez en la oficina.",qs:[["When does the club practice?",["Monday and Wednesday mornings","Tuesday and Thursday after school","On weekends"],1],["How much does it cost?",["It's free","$5","$20"],0],["Who should you talk to?",["The coach in the gym","Mr. Ramírez in the office","Any teacher"],1]]},
  {t:2,title:"Mateo's weekend",text:"El sábado pasado, Mateo se levantó tarde. Por la mañana jugó al básquetbol con sus amigos en el parque. Después, almorzaron hamburguesas en un restaurante. Por la tarde, Mateo fue al cine con su hermana. El domingo descansó en casa y leyó un libro. ¡Fue un fin de semana perfecto!",qs:[["What did he do in the morning?",["Played basketball","Swam","Studied"],0],["What did they eat for lunch?",["Tacos","Hamburgers","Pizza"],1],["What did he do on Sunday?",["Went to the movies","Rested and read a book","Visited his grandparents"],1]]},
  {t:3,title:"When I was little",text:"Cuando era niño, mi rutina era muy diferente. Me despertaba a las ocho porque la escuela estaba cerca. Siempre desayunaba cereal con mi abuela. Después de las clases, jugaba en el parque con mi hermano. Ahora me levanto a las seis, me ducho rápido y tomo el autobús.",qs:[["Why did he wake up at 8 as a kid?",["School was close","He was sick","He had no school"],0],["Who did he eat breakfast with?",["His brother","His grandmother","His friends"],1],["What time does he get up now?",["6:00","7:00","8:00"],0]]},
  {t:4,title:"Restaurante El Sol",text:"Restaurante El Sol. Desayuno: huevos con pan y café, seis dólares. Almuerzo: sopa de pollo, cinco dólares. Arroz con frijoles, cuatro dólares. Cena: pescado con verduras, doce dólares. Postre: flan, tres dólares. Abierto de martes a domingo. El lunes está cerrado.",qs:[["What's the cheapest lunch?",["Chicken soup","Fish","Rice and beans"],2],["What comes with the fish?",["Vegetables","Rice","Bread"],0],["Which day is it closed?",["Sunday","Monday","Tuesday"],1]]},
  {t:5,title:"My neighborhood",text:"Vivo en una casa pequeña en un barrio tranquilo. Mi casa tiene dos dormitorios, una cocina, una sala y un baño. Mi lugar favorito es el jardín porque hay muchas flores. Cerca de mi casa hay un parque y un supermercado. La escuela está un poco lejos. Al lado de mi casa vive mi abuela.",qs:[["How many bedrooms are there?",["One","Two","Three"],1],["What is the writer's favorite place?",["The kitchen","The yard","The park"],1],["Who lives next door?",["An aunt","A best friend","The grandmother"],2]]},
  {t:6,title:"A message from Sofía",text:"Hola, Marcos. ¿Qué tal? Aquí en Boone hace mucho frío y nieva. Ayer esquié con mi primo en las montañas. ¡Fue increíble! El sábado vamos a celebrar el cumpleaños de mi tía con una fiesta grande. La próxima semana voy a regresar a Raleigh. Un abrazo, Sofía.",qs:[["What's the weather like in Boone?",["Hot and sunny","Cold and snowing","Rainy and windy"],1],["What did she do yesterday?",["Skied with her cousin","Went to a party","Went back to Raleigh"],0],["What's happening on Saturday?",["Her cousin's game","Her aunt's birthday party","A trip to the beach"],1]]},
  {t:6,title:"Weekend forecast",text:"El pronóstico del tiempo para este fin de semana. El sábado va a hacer sol y calor. Es un buen día para ir a la playa. El domingo va a llover por la tarde y va a hacer viento. Recomendamos llevar un paraguas. El lunes va a estar nublado y fresco.",qs:[["What will Saturday be like?",["Sunny and hot","Rainy","Snowy"],0],["When will it rain?",["Saturday morning","Sunday afternoon","Monday"],1],["What do they recommend bringing?",["Sunscreen","An umbrella","A coat"],1]]}
];
const CONNECTORS = ["y","pero","también","porque","entonces","primero","después","luego","normalmente","a veces","siempre","nunca","creo que","para mí","además","cuando","por eso"];
const ENGLISH = ["the","and","is","my","i","like","because","with","have","it","you","we","but","very","to","in","of","school","family","go","went","am","are"];

/* word lookup + verb form index (for checkers and tap-to-translate) */
const LOCAL = {}, VFORM = {}, PASTF = new Set();
ALL.forEach(L => L.vocab.forEach(([es,en]) => { const k = noAcc(stripArt(es.toLowerCase())); if(!k.includes(" ")) LOCAL[k] = en; }));
Object.keys(V).forEach(inf => ["pres","pret","impf"].forEach(t => { const pr = forms(inf,"pres").map(x => noAcc(x.split(" ").pop())); forms(inf,t).forEach((f,i) => { const k = noAcc(f.split(" ").pop()); VFORM[k] = inf; if(t !== "pres" && !pr.includes(k)) PASTF.add(k); if(!LOCAL[k]) LOCAL[k] = `${V[inf].en.replace(/^to /,"")} (${inf} · ${t === "pres" ? "present" : t === "pret" ? "past" : "used to"} · ${P6[i]})`; }); }));
["gusta","gustan","encanta","encantan","hay"].forEach(k => VFORM[k] = k);
Object.entries({y:"and",pero:"but",con:"with",en:"in / on / at",de:"of / from",del:"of the",la:"the",el:"the",los:"the",las:"the",un:"a",una:"a",que:"that / who",muy:"very",mi:"my",mis:"my",su:"his / her",sus:"his / her",también:"also",porque:"because",para:"for",por:"for / through",a:"to",al:"to the",años:"years",ayer:"yesterday",ahora:"now",mucho:"a lot",muchas:"many",poco:"a little",gratis:"free",dólares:"dollars",abierto:"open",abierta:"open",cerrado:"closed",lugar:"place",flores:"flowers",se:"(reflexive)",llama:"is called",día:"day",largo:"long",cansada:"tired",aquí:"here",tiempo:"weather / time",paraguas:"umbrella",fresco:"cool",esquié:"I skied",increíble:"amazing",abrazo:"hug",pronóstico:"forecast",computadoras:"computers",tarjeta:"card",estudiantes:"students"}).forEach(([k,v]) => { LOCAL[noAcc(k)] = v; });
const looksLikeVerb = w => /^(\w{2,})(o|as|a|amos|an|es|e|emos|en|imos|é|aste|ó|aron|í|iste|ió|ieron|aba|ía)$/.test(w);
const FIXES = [
  [/\byo (es|eres)\b/, "yo soy", "With yo, ser is soy."],[/\byo (esta|estas)\b/, "yo estoy", "With yo, estar is estoy."],
  [/\byo (tiene|tienes)\b/, "yo tengo", "With yo, tener is tengo."],[/\byo (va|vas)\b/, "yo voy", "With yo, ir is voy."],[/\byo (hace|haces)\b/, "yo hago", "With yo, hacer is hago."],
  [/\b(soy|es|estoy|esta) (\d+|trece|catorce|quince|dieciseis|diecisiete|dieciocho) anos\b/, "tengo … años", "Age uses tener."],
  [/\byo gusto\b/, "me gusta", "Say me gusta, not yo gusto."],[/\bme gusta (los|las) /, "me gustan los / las …", "More than one thing → gustan."],
  [/\b(soy|eres|es|somos|son) (cansad[oa]s?|enferm[oa]s?|content[oa]s?|nervios[oa]s?)\b/, "estoy cansado/a …", "Feelings use estar."],
  [/\b(es|son) (en|cerca|lejos|al lado)\b/, "está en / está cerca …", "Location uses estar."],
  [/\b(el) (clase|casa|familia|escuela|tarea|comida|ciudad)\b/, "la …", "That noun is feminine → la."],
  [/\bjuego (futbol|tenis|basquetbol|beisbol)\b/, "juego al …", "jugar al + sport."],[/\bmi (padres|hermanos|amigos|abuelos)\b/, "mis …", "Plural → mis."]
];
function analyze(text, mode){
  const low = noAcc(norm(text)), toks = low.split(" ").filter(Boolean);
  const sents = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length >= 3).length;
  const verbs = new Set(toks.filter(t => VFORM[t]).map(t => VFORM[t]));
  const conns = CONNECTORS.filter(c => (" " + low + " ").includes(" " + noAcc(c) + " "));
  const tf = toks.some(t => PASTF.has(t)) || /\b(voy|vas|va|vamos|van|vais) a \w+r\b/.test(low) || /\b(ayer|anoche|pasado|pasada)\b/.test(low);
  const eng = uniq(toks.filter(t => ENGLISH.includes(t)));
  const checks = [
    mode === "write" ? [sents >= 6, `${sents} sentences (aim for 6+)`, "Add more sentences, each with its own verb."] : [toks.length >= 40, `${toks.length} words (aim for 40+ in a minute)`, "Keep talking the whole minute. Add a detail or a reason."],
    [verbs.size >= 4, `${verbs.size} different verbs`, "Use 4+ different verbs: soy, tengo, me gusta, voy, juego…"],
    [conns.length >= 3, `${conns.length} connecting words`, "Link ideas with y, pero, también, porque, después."],
    [toks.includes("porque"), "A reason with porque", "Add a reason: …porque es divertido."],
    [tf, "Past tense or a plan", "Add one sentence about yesterday (ayer fui…) or a plan (voy a…)."],
    [!eng.length, eng.length ? `English words: ${eng.join(", ")}` : "All in Spanish", "Swap English words for Spanish ones."]
  ];
  const fixes = []; FIXES.forEach(([re, r, w]) => { const m = low.match(re); if(m) fixes.push([m[0], r, w]); });
  return {checks, fixes, score: checks.filter(c => c[0]).length};
}
function checkHTML(res, model){
  const s = res.score, nf = res.fixes.length;
  const v = s >= 5 && nf >= 2 ? ["mid","Almost there","Good detail. Now fix the mistakes below."] : s >= 5 ? ["good","On track for Novice High","This has what Novice High needs."] : s >= 3 ? ["mid","Almost there","Fix the unchecked items and try again."] : ["low","Keep building","Use: answer + detail + reason + extra."];
  return `<div class="verdict ${v[0]}"><span class="n">${s}/6</span><span>${v[1]}<br><span class="small" style="font-weight:700">${v[2]}</span></span></div>
  <div class="card">${res.checks.map(c => `<div class="check"><span class="m ${c[0]?"y":""}">${c[0]?"✓":""}</span><span>${esc(c[1])}${c[0] ? "" : `<br><span class="small muted">${esc(c[2])}</span>`}</span></div>`).join("")}</div>
  ${nf ? `<div class="stack" style="gap:8px"><h3>Possible mistakes</h3>${res.fixes.map(f => `<div class="fix"><span class="w">${esc(f[0])}</span> → <b class="r">${esc(f[1])}</b><div class="small">${esc(f[2])}</div></div>`).join("")}</div>` : ""}
  <details class="card"><summary style="cursor:pointer"><b>See an example answer</b></summary><p class="passage" style="margin-top:8px">${esc(model)}</p><button class="btn sm blue" type="button" data-say="${esc(model)}">🔊 Hear it</button></details>
  <p class="small muted">Automatic checklist, not an official score. It can't hear pronunciation.</p>`;
}

/* ============ MIC (browser speech-to-text, free) ============ */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function micButton(targetId, onDone){
  if(window.claude && typeof window.claude.use === "function"){
    const b = document.createElement("button"); b.type = "button"; b.className = "btn blue"; b.textContent = "🎤 Talk";
    let on = false, base = "", finals = "";
    window.claude.use("dictation").then(d => {
      if(!d){ b.remove(); return; }
      d.onPartial(({text}) => { if(on){ const t = $(targetId); if(t){ t.value = base + finals + text; } } });
      d.onFinal(({text}) => { if(on){ finals += text + " "; const t = $(targetId); if(t){ t.value = base + finals; t.dispatchEvent(new Event("input")); } } });
      d.onState(({state}) => { const was = on; on = state === "listening"; b.textContent = on ? "■ Stop" : "🎤 Talk"; b.className = on ? "btn red" : "btn blue"; if(was && !on){ const t = $(targetId); if(t) t.value = (base + finals).trim(); onDone && onDone(); } });
      b.addEventListener("click", () => { if(on){ d.stop().catch(()=>{}); return; } const t = $(targetId); base = t && t.value ? t.value.trimEnd() + " " : ""; finals = ""; on = true; d.start().catch(e => { on = false; if(e && e.code === "not_granted"){ b.remove(); toast("Mic is off for this page. Type your answer instead."); } }); });
    }).catch(() => b.remove());
    return b;
  }
  if(!SR) return null;
  const b = document.createElement("button"); b.type = "button"; b.className = "btn blue"; b.textContent = "🎤 Talk";
  let r = null, on = false;
  b.addEventListener("click", () => {
    if(on){ r && r.stop(); return; }
    r = new SR(); r.lang = "es-MX"; r.interimResults = true; r.continuous = true;
    const t = $(targetId); const base = t.value ? t.value.trimEnd() + " " : "";
    let finals = "";
    r.onresult = e => { let interim = ""; for(let i = e.resultIndex; i < e.results.length; i++){ if(e.results[i].isFinal) finals += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript; } t.value = base + finals + interim; t.dispatchEvent(new Event("input")); };
    r.onstart = () => { on = true; b.textContent = "■ Stop"; b.className = "btn red"; };
    r.onend = () => { on = false; b.textContent = "🎤 Talk"; b.className = "btn blue"; t.value = (base + finals).trim(); t.dispatchEvent(new Event("input")); onDone && onDone(); };
    r.onerror = ev => { if(ev.error === "not-allowed") toast("Allow the microphone in your browser to use this."); };
    try { r.start(); } catch(e){}
  });
  return b;
}

/* ============ CLAUDE TEACHER GRADING (only inside Claude) ============ */
let SAMPLE = null, DICT = null;
if(window.claude && typeof window.claude.use === "function"){
  window.claude.use("sample").then(x => { SAMPLE = x; if(x && ((location.hash || "#hoy") === "#hoy") && window.J && window.J.isReady()) route(); }).catch(() => {});
  window.claude.use("dictation").then(x => { DICT = x; }).catch(() => {});
}
async function askJSON(prompt, tier){
  if(typeof SAMPLE.json === "function") return await SAMPLE.json(prompt, {modelTier: tier || "default", cache:false});
  const r = await SAMPLE(prompt, {modelTier: tier || "default", cache:false});
  return JSON.parse(r.text.slice(r.text.indexOf("{"), r.text.lastIndexOf("}") + 1));
}
const aiErr = e => e && e.code === "rate_limited" ? "Too many requests right now. Wait a minute and try again." : e && e.code === "not_granted" ? "Teacher grading is turned off for this page." : "Teacher grading didn't work this time. Here's the automatic check instead.";
function gradePrompt(kind, task, answer){
  return `You are a warm but honest high school Spanish teacher grading a student practicing for the WCPSS Spanish CDM proficiency test (like Avant STAMP). The student needs ACTFL Novice High.
Kind: ${kind === "speak" ? "spoken answer (speech-to-text transcript: ignore punctuation, capitalization and obvious transcription slips)" : kind === "interview" ? "five spoken interview answers (speech-to-text transcripts)" : "written answer"}.
Task: ${task}
Student's answer:
"""${answer}"""
Grade it. Return ONLY JSON:
{"level": one of "Novice Low","Novice Mid","Novice High","Intermediate Low","Intermediate Mid",
 "score": 0-100 (70 = solid Novice High),
 "summary": 1-2 plain English sentences to the student as "you",
 "sentences": [ for EVERY sentence the student wrote or said, in order: {"you": their sentence, "fixed": the corrected Spanish (same as theirs if already correct), "ok": true if it had no errors, "why": short plain English note on what was fixed, or "" } ],
 "good": [up to 2 short strings on what worked],
 "tip": one concrete thing to do next time to score higher,
 "model": a model Novice High answer in Spanish, 5-7 simple sentences}`;
}
function teacherHTML(fb){
  const lv = fb.level || "?", ok = /High|Intermediate/.test(lv), sc = Math.max(0, Math.min(100, +fb.score || 0));
  const cls = ok ? "good" : /Mid/.test(lv) ? "mid" : "low";
  return `<div class="verdict ${cls}"><span class="n">${sc}</span><span>${esc(lv)} <span class="small" style="font-weight:700">· Teacher grade</span><br><span class="small" style="font-weight:700">${esc(fb.summary || "")}</span></span></div>
  ${(fb.sentences || []).length ? `<div class="card stack" style="gap:10px"><h3>Sentence by sentence</h3>${fb.sentences.map(x => x.ok ? `<div class="check"><span class="m y">✓</span><span>${esc(x.you)}</span></div>` : `<div class="fix"><span class="w">${esc(x.you)}</span><div><b class="r">${esc(x.fixed)}</b></div>${x.why ? `<div class="small">${esc(x.why)}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${(fb.good || []).length ? `<div class="result good">What worked: ${fb.good.map(esc).join(" · ")}</div>` : ""}
  ${fb.tip ? `<div class="gloss"><b>Next time:</b> ${esc(fb.tip)}</div>` : ""}
  ${fb.model ? `<details class="card"><summary style="cursor:pointer"><b>See a Novice High model answer</b></summary><p class="passage" style="margin-top:8px">${esc(fb.model)}</p><button class="btn sm blue" type="button" data-say="${esc(fb.model)}">🔊 Hear it</button></details>` : ""}`;
}
function saveGrade(kind, fb){ S.grades = (S.grades || []).concat([{d: dkey(new Date()), k: kind, lv: fb.level || "?", sc: +fb.score || 0}]).slice(-100); save(); }
async function teacherGrade(kind, task, answer, out, btn, fallbackModel){
  if(!SAMPLE){ const r = analyze(answer, kind === "write" ? "write" : "speak"); out.innerHTML = checkHTML(r, fallbackModel) + `<p class="small muted">Teacher grading works when you open this app inside Claude.</p>`; wireSay(out); addXP(r.score * 2 + 3); return; }
  btn.disabled = true; const old = btn.textContent; btn.textContent = "Grading…"; out.innerHTML = `<p class="muted">Your teacher is reading it…</p>`;
  try{ const fb = await askJSON(gradePrompt(kind, task, answer)); out.innerHTML = teacherHTML(fb); saveGrade(kind, fb); addXP(Math.round((+fb.score || 0) / 10) + 5); toast(`+${Math.round((+fb.score || 0) / 10) + 5} XP`); }
  catch(e){ const r = analyze(answer, kind === "write" ? "write" : "speak"); out.innerHTML = `<div class="result bad">${aiErr(e)}</div>` + checkHTML(r, fallbackModel); }
  finally{ btn.disabled = false; btn.textContent = old; wireSay(out); }
}

/* ============ PRACTICE ============ */
const PANELS = {
  interview:["🎤 Mock interview", pInterview], minute:["⏱️ One-minute talk", pMinute], write:["✏️ Writing", pWrite],
  listen:["🎧 Listening", pListen], verbs:["⚡ Verb speed round", pVerbs]
};
document.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
  const k = b.dataset.p;
  if(k === "mistakes"){
    if(!S.missed.length) return toast("No mistakes saved yet. Do a lesson first!");
    const items = shuffle(S.missed).slice(0, 10).map(x => Object.assign({}, x));
    return startLesson(null, items);
  }
  $("pMenu").hidden = true; $("pPanel").hidden = false; $("pTitle").textContent = PANELS[k][0];
  const area = $("pArea"); area.innerHTML = ""; PANELS[k][1](area); wireSay(area);
}));
$("pBack").addEventListener("click", () => { $("pPanel").hidden = true; $("pMenu").hidden = false; try{ speechSynthesis.cancel(); }catch(e){} });
function topicSelect(id){ return `<select id="${id}" class="answer" style="width:auto;padding:8px 12px;font-size:1rem">${TOPICS.map((t,i) => `<option value="${i}">${i+1}. ${esc(t)}</option>`).join("")}<option value="mix">Mixed</option></select>`; }
const topicVal = id => { const v = $(id).value; return v === "mix" ? rnd(7) : +v; };

function pInterview(area){
  area.innerHTML = `<div class="card stack"><div class="row between">${topicSelect("ivT")}<span class="pill" id="ivN"></span></div>
    <div class="chat" id="chat"></div>
    <div class="stack" id="ivIn" style="gap:10px"><div class="row" id="ivMic"><button class="btn sm" id="ivRep">🔊 Again</button><button class="btn sm" id="ivEn">Show English</button></div>
    <textarea class="answer" id="ivText" style="min-height:80px" placeholder="Answer in Spanish (talk or type)"></textarea><div class="accents" data-for="ivText"></div><button class="btn pink" id="ivSend">Send answer</button></div><div id="ivEnd"></div></div>`;
  wireAccents(area.querySelector(".accents"));
  let c = null;
  const add = (who, html) => { const m = document.createElement("div"); m.className = "msg " + who; m.innerHTML = html; $("chat").appendChild(m); $("chat").scrollTop = 1e6; return m; };
  const ask = silent => { const q = c.qs[c.i]; $("ivN").textContent = `Question ${c.i+1} of 5`; add("them", `${esc(q[0])}<span class="en" ${c.en ? "" : "hidden"}>${esc(q[1])}</span>`); if(!silent) say(q[0], 0.9); };
  const start = silent => { const t = topicVal("ivT"); c = {qs: INTERVIEW[t], i:0, pts:0, en:false, ans:[]}; $("chat").innerHTML = ""; $("ivEnd").innerHTML = ""; $("ivIn").hidden = false; add("them", `¡Hola! Vamos a hablar. Contesta con oraciones completas.<span class="en" hidden>Hi! Let's talk. Answer in full sentences.</span>`); ask(silent); };
  const send = () => {
    const text = $("ivText").value.trim(); if(!text || c.i >= 5) return; $("ivText").value = "";
    const q = c.qs[c.i]; add("me", esc(text)); c.ans.push(`Q: ${q[0]}\nA: ${text}`);
    if(SAMPLE){
      const m = add("them", `<span class="muted">Checking…</span>`); const qi = c.i; c.i++;
      askJSON(`A high school Spanish student (target ACTFL Novice High) answered an interview question out loud (speech-to-text transcript; ignore punctuation and capitalization).\nQuestion: ${q[0]}\nAnswer: ${text}\nReturn ONLY JSON: {"ok": true if the answer has no grammar errors and is a full sentence, "fixed": the corrected answer in Spanish (same as theirs if correct), "why": one short plain English note on what to fix, or "", "better": one short tip to make it stronger (add a reason, a detail, past tense…)}`, "quick")
        .then(r => { m.innerHTML = `${r.ok ? "✅ Correct!" : `✏️ <b>${esc(r.fixed || "")}</b>${r.why ? `<br><span class="small">${esc(r.why)}</span>` : ""}`}${r.better ? `<span class="note">💡 ${esc(r.better)}</span>` : ""}<span class="note">Example: <i>${esc(q[2])}</i></span>`; })
        .catch(() => { m.innerHTML = `<span class="note">Example: <i>${esc(q[2])}</i></span>`; });
      m.addEventListener("click", () => say(q[2], 0.92));
      if(c.i < 5) return setTimeout(() => ask(false), 900);
      $("ivIn").hidden = true; $("ivN").textContent = "Done!";
      $("ivEnd").innerHTML = `<div id="ivG"></div><button class="btn pink" id="ivAgain" style="margin-top:10px">Another interview</button>`;
      $("ivAgain").addEventListener("click", () => { $("ivT").value = String(rnd(7)); start(false); });
      const tmp = document.createElement("button"); teacherGrade("interview", "Answer five interview questions about: " + TOPICS[topicVal("ivT")], c.ans.join("\n\n"), $("ivG"), tmp, MODEL[0]);
      return;
    }
    const low = noAcc(norm(text)), toks = low.split(" ").filter(Boolean);
    const j = [[toks.length >= 6 && toks.some(t => VFORM[t] || looksLikeVerb(t)), "Full sentence"], [/\b(y|pero|porque|tambien|ademas)\b/.test(low), "Added a detail or reason"]];
    if(q[3]) j.push([toks.some(t => PASTF.has(t)), "Used the past tense"]);
    if(toks.some(t => ENGLISH.includes(t))) j.push([false, "Some English slipped in"]);
    c.pts += j.filter(x => x[0]).length / j.length;
    const m = add("them", `${j.map(x => `${x[0] ? "✅" : "⬜"} ${esc(x[1])}`).join("<br>")}<span class="note">Example: <i>${esc(q[2])}</i></span>`);
    m.addEventListener("click", () => say(q[2], 0.92));
    c.i++;
    if(c.i < 5) return setTimeout(() => ask(false), 700);
    const pct = Math.round(c.pts / 5 * 100); $("ivIn").hidden = true; $("ivN").textContent = "Done!";
    const v = pct >= 80 ? ["good","Strong answers!"] : pct >= 55 ? ["mid","Getting there. Add a reason to every answer."] : ["low","Keep practicing: full sentences + a detail."];
    $("ivEnd").innerHTML = `<div class="verdict ${v[0]}"><span class="n">${pct}%</span><span>${v[1]}</span></div><button class="btn pink" id="ivAgain" style="margin-top:10px">Another interview</button>`;
    $("ivAgain").addEventListener("click", () => { $("ivT").value = String(rnd(7)); start(false); });
    addXP(Math.round(pct / 5) + 5); toast(`+${Math.round(pct / 5) + 5} XP`);
  };
  const mic = micButton("ivText", () => {}); if(mic) $("ivMic").prepend(mic);
  $("ivSend").addEventListener("click", send);
  $("ivRep").addEventListener("click", () => c && c.i < 5 && say(c.qs[c.i][0], 0.75));
  $("ivEn").addEventListener("click", () => { c.en = !c.en; $("chat").querySelectorAll(".en").forEach(x => x.hidden = !c.en); $("ivEn").textContent = c.en ? "Hide English" : "Show English"; });
  $("ivT").addEventListener("change", () => start(false));
  start(true);
  $("chat").insertAdjacentHTML("beforebegin", `<p class="small muted">Tap 🔊 Again to hear the question. Tap a feedback bubble to hear the example answer.</p>`);
}
function pMinute(area){
  area.innerHTML = `<div class="card stack"><div class="row between">${topicSelect("mT")}<button class="btn sm" id="mNew">New prompt</button></div>
    <h3 id="mP"></h3><div class="pill" style="align-self:flex-start">Answer → Detail → Reason (porque) → Extra (ayer… / voy a…)</div>
    <div class="row between"><span class="timer" id="mTimer">1:00</span><div class="row" id="mMic"><button class="btn" id="mGo">Start timer</button></div></div>
    <textarea class="answer" id="mText" placeholder="Talk (🎤) or type what you said"></textarea><div class="accents" data-for="mText"></div>
    <button class="btn pink" id="mCheck">${SAMPLE ? "Get teacher grade" : "Check my answer"}</button><div id="mFb" class="stack"></div></div>`;
  wireAccents(area.querySelector(".accents"));
  const np = () => { $("mP").textContent = pick(PROMPTS[topicVal("mT")]); $("mFb").innerHTML = ""; };
  let left = 60, iv = null;
  const draw = () => { $("mTimer").textContent = `${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`; };
  $("mGo").addEventListener("click", () => { if(iv){ clearInterval(iv); iv = null; left = 60; draw(); $("mGo").textContent = "Start timer"; return; } left = 60; $("mGo").textContent = "Reset"; iv = setInterval(() => { left--; draw(); if(left <= 0){ clearInterval(iv); iv = null; $("mTimer").textContent = "Done!"; $("mGo").textContent = "Start timer"; } }, 1000); });
  const mic = micButton("mText"); if(mic){ $("mMic").prepend(mic); mic.addEventListener("click", () => { if(!iv) $("mGo").click(); }); }
  $("mNew").addEventListener("click", np); $("mT").addEventListener("change", np);
  $("mCheck").addEventListener("click", e => { const t = $("mText").value; if(t.trim().split(/\s+/).length < 3) return toast("Say or type your answer first"); teacherGrade("speak", $("mP").textContent, t, $("mFb"), e.currentTarget, MODEL[topicVal("mT")]); });
  np();
}
function pWrite(area){
  area.innerHTML = `<div class="card stack"><div class="row between">${topicSelect("wT")}<button class="btn sm" id="wNew">New prompt</button></div>
    <h3 id="wP"></h3><div class="row" id="wGoals"></div>
    <textarea class="answer" id="wText" placeholder="Write 6–8 sentences. No looking things up!"></textarea><div class="accents" data-for="wText"></div>
    <button class="btn pink" id="wCheck">${SAMPLE ? "Get teacher grade" : "Check my writing"}</button><div id="wFb" class="stack"></div></div>`;
  wireAccents(area.querySelector(".accents"));
  const np = () => { $("wP").textContent = pick(PROMPTS[topicVal("wT")]); $("wFb").innerHTML = ""; };
  const goals = () => { const r = analyze($("wText").value, "write"), lab = ["Sentences","Verbs","Connectors","Reason","Past/plans","All Spanish"]; $("wGoals").innerHTML = r.checks.map((c,i) => `<span class="pill" style="${c[0] ? "background:var(--good-s);border-color:var(--good);color:var(--good-d)" : ""}">${c[0] ? "✓" : "○"} ${lab[i]}</span>`).join(""); };
  $("wText").addEventListener("input", goals);
  $("wNew").addEventListener("click", np); $("wT").addEventListener("change", np);
  $("wCheck").addEventListener("click", e => { const t = $("wText").value; if(t.trim().split(/\s+/).length < 5) return toast("Write a few sentences first"); teacherGrade("write", $("wP").textContent, t, $("wFb"), e.currentTarget, MODEL[topicVal("wT")]); });
  np(); goals();
}
function pListen(area){
  area.innerHTML = `<div class="card stack"><select id="lP" class="answer" style="padding:10px 12px;font-size:1rem">${PASSAGES.map((p,i) => `<option value="${i}">${i+1}. ${esc(p.title)}</option>`).join("")}</select>
    <div class="seg" id="lSeg"></div><div class="row" id="lAud"><button class="btn blue" id="lPlay">🔊 Play</button><button class="btn" id="lSlow">🐢 Slower</button></div><div id="lArea" class="stack"></div></div>`;
  let game = "listen", text = () => cur.text, cur;
  const games = [["listen","Listen & answer"],["read","Read & tap words"],["dict","Dictation"],["scr","Unscramble"]];
  const sentences = t => t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 3);
  const qs = (box, done) => { let a = 0, ok = 0; cur.qs.forEach((q, qi) => { const d = document.createElement("div"); d.className = "stack"; d.style.gap = "8px"; d.innerHTML = `<b>${qi+1}. ${esc(q[0])}</b><div class="opts"></div>`; const o = d.querySelector(".opts");
    q[1].forEach((t, oi) => { const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = t; b.addEventListener("click", () => { if(d.dataset.d) return; d.dataset.d = 1; a++; if(oi === q[2]){ b.classList.add("right"); ok++; } else { b.classList.add("wrong"); o.children[q[2]].classList.add("right"); } if(a === cur.qs.length) done(ok); }); o.appendChild(b); });
    box.appendChild(d); }); };
  const render = () => {
    cur = PASSAGES[+$("lP").value]; text = () => cur.text;
    $("lSeg").innerHTML = ""; games.forEach(([k,l]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", game === k); b.addEventListener("click", () => { game = k; render(); }); $("lSeg").appendChild(b); });
    $("lAud").hidden = game === "scr";
    const A = $("lArea"); A.innerHTML = "";
    if(game === "listen"){ A.innerHTML = `<p class="muted small">Press Play (up to twice), then answer. The text is hidden like on the real test.</p><div class="stack" id="lq"></div><div id="lr"></div>`;
      qs($("lq"), ok => { $("lr").innerHTML = `<div class="result ${ok === 3 ? "good" : "bad"}">${ok} of 3 right</div>`; addXP(ok * 3 + 2); toast(`+${ok*3+2} XP`); }); }
    if(game === "read"){ A.innerHTML = `<div class="passage" id="ps"></div><div class="gloss small" id="gl">Tap any word to see what it means.</div><div class="stack" id="lq"></div><div id="lr"></div>`;
      cur.text.split(/(\s+)/).forEach(tok => { if(/^\s+$/.test(tok)) return $("ps").appendChild(document.createTextNode(" ")); const s = document.createElement("span"); s.className = "w"; s.textContent = tok;
        s.addEventListener("click", () => { $("ps").querySelectorAll(".sel").forEach(x => x.classList.remove("sel")); s.classList.add("sel"); const w = tok.toLowerCase().replace(/[.,!?¡¿;:]/g,""); say(w, 0.85); const m = LOCAL[noAcc(w)]; $("gl").innerHTML = m ? `<b>${esc(w)}</b> = ${esc(m)}` : `<b>${esc(w)}</b>: not in the word list. Guess from context!`; });
        $("ps").appendChild(s); });
      qs($("lq"), ok => { $("lr").innerHTML = `<div class="result ${ok === 3 ? "good" : "bad"}">${ok} of 3 right</div>`; addXP(ok * 2 + 2); }); }
    if(game === "dict"){ const ss = sentences(cur.text); let i = 0, pts = 0, fb = false; text = () => ss[i];
      A.innerHTML = `<div class="row between"><span class="pill" id="dn"></span><span class="pill" id="dp">0 pts</span></div><textarea class="answer" id="dA" style="min-height:80px" placeholder="Type what you hear"></textarea><div class="accents" data-for="dA"></div><button class="btn pink" id="dC">Check</button><div id="dR"></div>`;
      wireAccents(A.querySelector(".accents"));
      const show = () => { $("dn").textContent = `Sentence ${i+1} of ${ss.length}`; $("dA").value = ""; $("dR").innerHTML = ""; fb = false; $("dC").textContent = "Check"; };
      $("dC").addEventListener("click", () => {
        if(fb){ i++; if(i >= ss.length){ $("dR").innerHTML = `<div class="result good">Finished! ${pts} points</div>`; addXP(Math.round(pts/2)); i = ss.length - 1; return; } show(); say(ss[i], 0.9); return; }
        const exp = norm(ss[i]).split(" "), bag = norm($("dA").value).split(" ").filter(Boolean).map(noAcc); if(!bag.length) return;
        let hit = 0; const mk = exp.map(w => { const j = bag.indexOf(noAcc(w)); if(j >= 0){ bag.splice(j,1); hit++; return `<b style="color:var(--good-d)">${esc(w)}</b>`; } return `<b style="color:var(--bad-d);text-decoration:underline">${esc(w)}</b>`; });
        pts += Math.round(hit/exp.length*10); $("dp").textContent = `${pts} pts`;
        $("dR").innerHTML = `<div class="gloss">${mk.join(" ")}<div class="small muted">${hit}/${exp.length} words</div></div>`; fb = true; $("dC").textContent = "Next sentence";
      });
      show(); }
    if(game === "scr"){ const ss = sentences(cur.text).filter(s => s.split(" ").length <= 12); let i = 0, ok = 0;
      A.innerHTML = `<div class="row between"><span class="pill" id="sn"></span><span class="pill" id="so">0 right</span></div><div class="tiles" id="sb"></div><div class="tiles bank" id="sk"></div><div class="row"><button class="btn pink" id="sc">Check</button><button class="btn" id="sh">🔊 Hint</button><button class="btn ghost" id="ss">Skip</button></div><div id="sr"></div>`;
      const load = () => { if(i >= ss.length){ $("sr").innerHTML = `<div class="result good">Done! ${ok} of ${ss.length}</div>`; addXP(ok * 2); return; }
        $("sn").textContent = `Sentence ${i+1} of ${ss.length}`; $("sr").innerHTML = ""; $("sb").innerHTML = ""; $("sk").innerHTML = "";
        const ws = ss[i].split(" "); let sh = shuffle(ws), n = 0; while(sh.join(" ") === ws.join(" ") && n++ < 5) sh = shuffle(ws);
        sh.forEach(w => { const b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.textContent = w; b.addEventListener("click", () => (b.parentElement.id === "sk" ? $("sb") : $("sk")).appendChild(b)); $("sk").appendChild(b); }); };
      $("sc").addEventListener("click", () => { if(i >= ss.length) return; if($("sk").children.length) return toast("Use all the words"); const built = [...$("sb").children].map(b => b.textContent).join(" ");
        if(built === ss[i]){ ok++; $("so").textContent = `${ok} right`; $("sr").innerHTML = `<div class="result good">¡Perfecto!</div>`; say(ss[i]); i++; setTimeout(load, 1100); } else $("sr").innerHTML = `<div class="result bad">Not yet. Tap words to move them back.</div>`; });
      $("sh").addEventListener("click", () => i < ss.length && say(ss[i], 0.85));
      $("ss").addEventListener("click", () => { if(i < ss.length){ $("sr").innerHTML = `<div class="result bad">${esc(ss[i])}</div>`; i++; setTimeout(load, 1800); } });
      load(); }
  };
  $("lPlay").addEventListener("click", () => say(text(), 1)); $("lSlow").addEventListener("click", () => say(text(), 0.7));
  $("lP").addEventListener("change", render); render();
}
function pVerbs(area){
  area.innerHTML = `<div class="card stack"><div class="seg" id="vT"></div>
    <div class="row between"><span class="timer" id="vClock">1:00</span><span class="pill">Best: <b id="vBest">${S.bestSpeed||0}</b></span></div>
    <div class="card center" style="background:var(--blue-s);border-color:transparent"><div class="muted" id="vHint">Pick tenses, then press Start</div><div class="p-q" id="vQ">¿Listo?</div></div>
    <div class="opts" id="vO"></div><button class="btn pink" id="vGo">Start</button></div>`;
  const tens = new Set(["pres"]);
  const drawT = () => { $("vT").innerHTML = ""; [["pres","Present"],["pret","Preterite"],["impf","Imperfect"]].forEach(([k,l]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", tens.has(k)); b.addEventListener("click", () => { if(tens.has(k) && tens.size > 1) tens.delete(k); else tens.add(k); drawT(); }); $("vT").appendChild(b); }); };
  drawT();
  let run = null;
  const next = () => {
    const t = pick([...tens]), inf = pick(Object.keys(V)), i = rnd(6), fs = forms(inf, t), right = fs[i];
    const pool = shuffle(uniq(fs.concat(Object.keys(TN).filter(x => x !== t).map(x => forms(inf, x)[i])).filter(x => x !== right))).slice(0,3);
    $("vHint").textContent = `${V[inf].en} · ${TN[t]}`; $("vQ").textContent = `${P6[i]} · ${inf}`;
    const box = $("vO"); box.innerHTML = ""; let done = false;
    shuffle([right, ...pool]).forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = o;
      b.addEventListener("click", () => { if(done || !run) return; done = true; const ok = o === right; b.classList.add(ok ? "right" : "wrong"); if(!ok) [...box.children].find(x => x.textContent === right).classList.add("right"); if(ok) run.score++; setTimeout(next, ok ? 250 : 900); });
      box.appendChild(b); });
  };
  $("vGo").addEventListener("click", () => {
    if(run) return; run = {left:60, score:0}; $("vGo").hidden = true; next();
    run.iv = setInterval(() => { run.left--; $("vClock").textContent = `0:${String(run.left).padStart(2,"0")}`;
      if(run.left <= 0){ clearInterval(run.iv); const sc = run.score; run = null; const best = S.bestSpeed || 0; if(sc > best){ S.bestSpeed = sc; save(); }
        $("vO").innerHTML = ""; $("vQ").textContent = `${sc} right!`; $("vHint").textContent = sc > best ? "🎉 New personal best!" : `Your best is ${best}`; $("vBest").textContent = S.bestSpeed; $("vClock").textContent = "1:00"; $("vGo").hidden = false; $("vGo").textContent = "Play again"; addXP(sc); } }, 1000);
  });
}

/* ============ ROUTER ============ */
const VIEWS = ["hoy","diario","palabras","learn","practice","progress","notes"];
function route(){
  let v = (location.hash || "#hoy").slice(1); if(!VIEWS.includes(v)) v = "hoy";
  VIEWS.forEach(x => $("v-"+x).classList.toggle("on", x === v));
  const tab = (v === "practice" || v === "notes") ? "learn" : v;
  document.querySelectorAll(".tabbar a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#"+tab ? "page" : "false"));
  document.body.classList.toggle("wide", v === "hoy");
  const J = window.J;
  if(J && v === "hoy") J.renderHoy();
  if(J && v === "diario") J.renderDiario();
  if(J && v === "palabras") J.renderPalabras();
  if(v === "learn") renderLearn();
  if(v === "progress"){ renderProgress(); J && J.renderJournalProgress(); }
  if(v === "notes" && !$("notesList").children.length) renderNotes();
  if(v === "practice") $("mistakeCount").textContent = S.missed.length ? `${S.missed.length} question${S.missed.length === 1 ? "" : "s"} to redo` : "Redo questions you missed";
  drawTop();
}
window.addEventListener("hashchange", () => { route(); window.scrollTo(0,0); });
window.APP = {$, esc, say, toast, wireAccents, wireSay, noAcc, norm, dkey, shuffle, UNITS, LOCAL, micButton, askJSON, aiErr, analyze, checkHTML, addXP, openSheet, closeSheet, route,
  hasSample: () => !!SAMPLE, openLessonById: id => { const L = ALL.find(x => x.id === id); if(L) openLessonSheet(L); }};
route();
})();
