/* ¡Vamos! Verbos: rigorous conjugation drills with per-form mastery tracking (no AI, no credits) */
(function(){
"use strict";
const A = window.APP;
const {esc, say, toast, wireAccents, noAcc, dkey, $} = A;

/* ============ VERB ENGINE ============ */
const P = ["yo","tú","él / ella / usted","nosotros","vosotros","ellos / ustedes"];
const PS = ["yo","tú","él","nosotros","vosotros","ellos"];
const TENSES = {
  pres:{n:"Present", d:"what you do / are doing"},
  pret:{n:"Preterite", d:"finished past: ayer, anoche"},
  impf:{n:"Imperfect", d:"used to / was …ing"},
  prog:{n:"Present progressive", d:"estar + -ando / -iendo"},
  ira:{n:"Ir a + verb", d:"going to (plans)"},
  fut:{n:"Future", d:"will (hablaré)"},
  cond:{n:"Conditional", d:"would (hablaría)"}
};
const END = {
  pres:{ar:["o","as","a","amos","áis","an"],er:["o","es","e","emos","éis","en"],ir:["o","es","e","imos","ís","en"]},
  pret:{ar:["é","aste","ó","amos","asteis","aron"],er:["í","iste","ió","imos","isteis","ieron"],ir:["í","iste","ió","imos","isteis","ieron"]},
  impf:{ar:["aba","abas","aba","ábamos","abais","aban"],er:["ía","ías","ía","íamos","íais","ían"],ir:["ía","ías","ía","íamos","íais","ían"]},
  fut:["é","ás","á","emos","éis","án"],
  cond:["ía","ías","ía","íamos","íais","ían"]
};
const RP = ["me","te","se","nos","os","se"];
const ESTAR = ["estoy","estás","está","estamos","estáis","están"];
const IR = ["voy","vas","va","vamos","vais","van"];
const strong = (st, j) => [st+"e", st+"iste", st+"o", st+"imos", st+"isteis", st+(j ? "eron" : "ieron")];
const yoOnly = (inf, yo) => { const e = inf.slice(-2), st = inf.slice(0,-2); const f = END.pres[e].map(x => st + x); f[0] = yo; return f; };

// g: group · ch: stem change · f: overrides by tense · fs: future stem · ger: gerund · c: context complement
const VERBS = [
 // regular -ar
 {i:"hablar",en:"to speak",g:"ar",c:"con mi abuela"},{i:"estudiar",en:"to study",g:"ar",c:"para el examen"},{i:"trabajar",en:"to work",g:"ar",c:"en una tienda"},
 {i:"escuchar",en:"to listen",g:"ar",c:"música"},{i:"bailar",en:"to dance",g:"ar",c:"en la fiesta"},{i:"caminar",en:"to walk",g:"ar",c:"al parque"},
 {i:"comprar",en:"to buy",g:"ar",c:"ropa nueva"},{i:"cocinar",en:"to cook",g:"ar",c:"la cena"},{i:"viajar",en:"to travel",g:"ar",c:"a México"},
 {i:"ayudar",en:"to help",g:"ar",c:"a mi mamá"},{i:"cantar",en:"to sing",g:"ar",c:"en el coro"},{i:"nadar",en:"to swim",g:"ar",c:"en la piscina"},
 {i:"tomar",en:"to take / drink",g:"ar",c:"agua"},{i:"mirar",en:"to watch",g:"ar",c:"la tele"},{i:"necesitar",en:"to need",g:"ar",c:"ayuda"},
 {i:"llamar",en:"to call",g:"ar",c:"a mi amiga"},{i:"limpiar",en:"to clean",g:"ar",c:"mi cuarto"},{i:"preparar",en:"to prepare",g:"ar",c:"el desayuno"},
 {i:"descansar",en:"to rest",g:"ar",c:"en casa"},{i:"esperar",en:"to wait",g:"ar",c:"el autobús"},{i:"enseñar",en:"to teach",g:"ar",c:"inglés"},
 {i:"terminar",en:"to finish",g:"ar",c:"la tarea"},{i:"visitar",en:"to visit",g:"ar",c:"a mis abuelos"},{i:"dibujar",en:"to draw",g:"ar",c:"un perro"},
 {i:"manejar",en:"to drive",g:"ar",c:"a la escuela"},{i:"lavar",en:"to wash",g:"ar",c:"los platos"},{i:"usar",en:"to use",g:"ar",c:"el teléfono"},
 // regular -er
 {i:"comer",en:"to eat",g:"er",c:"tacos"},{i:"beber",en:"to drink",g:"er",c:"jugo"},{i:"aprender",en:"to learn",g:"er",c:"español"},
 {i:"correr",en:"to run",g:"er",c:"en el parque"},{i:"comprender",en:"to understand",g:"er",c:"la lección"},{i:"vender",en:"to sell",g:"er",c:"galletas"},
 {i:"deber",en:"should / must",g:"er",c:"estudiar más"},
 // regular -ir
 {i:"vivir",en:"to live",g:"ir",c:"en Raleigh"},{i:"escribir",en:"to write",g:"ir",c:"en mi diario"},{i:"abrir",en:"to open",g:"ir",c:"la ventana"},
 {i:"compartir",en:"to share",g:"ir",c:"la comida"},{i:"recibir",en:"to receive",g:"ir",c:"un regalo"},{i:"decidir",en:"to decide",g:"ir",c:"qué hacer"},
 {i:"subir",en:"to go up",g:"ir",c:"las escaleras"},{i:"asistir",en:"to attend",g:"ir",c:"a clase"},
 // preterite spelling changes
 {i:"buscar",en:"to look for",g:"spell",c:"mis llaves"},{i:"tocar",en:"to play (instrument)",g:"spell",c:"el piano"},{i:"sacar",en:"to get / take out",g:"spell",c:"una buena nota"},
 {i:"practicar",en:"to practice",g:"spell",c:"el violín"},{i:"llegar",en:"to arrive",g:"spell",c:"tarde"},{i:"pagar",en:"to pay",g:"spell",c:"la cuenta"},
 {i:"leer",en:"to read",g:"spell",c:"un libro",ger:"leyendo"},{i:"creer",en:"to believe",g:"spell",c:"en mí",ger:"creyendo"},
 // stem e → ie
 {i:"pensar",en:"to think",g:"e-ie",ch:["e","ie"],c:"en el examen"},{i:"empezar",en:"to start",g:"e-ie",ch:["e","ie"],c:"la tarea"},{i:"cerrar",en:"to close",g:"e-ie",ch:["e","ie"],c:"la puerta"},
 {i:"entender",en:"to understand",g:"e-ie",ch:["e","ie"],c:"la pregunta"},{i:"perder",en:"to lose",g:"e-ie",ch:["e","ie"],c:"el partido"},{i:"comenzar",en:"to begin",g:"e-ie",ch:["e","ie"],c:"el proyecto"},
 {i:"preferir",en:"to prefer",g:"e-ie",ch:["e","ie"],c:"la pizza"},{i:"sentir",en:"to feel",g:"e-ie",ch:["e","ie"],c:"frío"},
 {i:"querer",en:"to want",g:"e-ie",ch:["e","ie"],c:"un perro",f:{pret:strong("quis")},fs:"querr"},
 // stem o → ue
 {i:"dormir",en:"to sleep",g:"o-ue",ch:["o","ue"],c:"ocho horas"},{i:"volver",en:"to return",g:"o-ue",ch:["o","ue"],c:"a casa"},{i:"encontrar",en:"to find",g:"o-ue",ch:["o","ue"],c:"mi libro"},
 {i:"contar",en:"to count / tell",g:"o-ue",ch:["o","ue"],c:"un chiste"},{i:"recordar",en:"to remember",g:"o-ue",ch:["o","ue"],c:"su nombre"},{i:"almorzar",en:"to eat lunch",g:"o-ue",ch:["o","ue"],c:"en la cafetería"},
 {i:"poder",en:"to be able to",g:"o-ue",ch:["o","ue"],c:"ir al cine",f:{pret:strong("pud")},fs:"podr",ger:"pudiendo"},
 // stem e → i, u → ue
 {i:"pedir",en:"to order / ask for",g:"e-i",ch:["e","i"],c:"una pizza"},{i:"servir",en:"to serve",g:"e-i",ch:["e","i"],c:"la comida"},{i:"repetir",en:"to repeat",g:"e-i",ch:["e","i"],c:"la pregunta"},
 {i:"seguir",en:"to follow / keep going",g:"e-i",ch:["e","i"],c:"las reglas",f:{pres:["sigo","sigues","sigue","seguimos","seguís","siguen"]}},
 {i:"jugar",en:"to play (sport)",g:"u-ue",ch:["u","ue"],c:"al fútbol"},
 // irregular yo
 {i:"hacer",en:"to do / make",g:"yo",c:"la tarea",f:{pres:yoOnly("hacer","hago"),pret:["hice","hiciste","hizo","hicimos","hicisteis","hicieron"]},fs:"har"},
 {i:"poner",en:"to put",g:"yo",c:"la mesa",f:{pres:yoOnly("poner","pongo"),pret:strong("pus")},fs:"pondr"},
 {i:"salir",en:"to go out / leave",g:"yo",c:"con mis amigos",f:{pres:yoOnly("salir","salgo")},fs:"saldr"},
 {i:"traer",en:"to bring",g:"yo",c:"mi almuerzo",f:{pres:yoOnly("traer","traigo"),pret:strong("traj",1)},ger:"trayendo"},
 {i:"conocer",en:"to know (people/places)",g:"yo",c:"a la nueva estudiante",f:{pres:yoOnly("conocer","conozco")}},
 {i:"saber",en:"to know (facts)",g:"yo",c:"la respuesta",f:{pres:yoOnly("saber","sé"),pret:strong("sup")},fs:"sabr"},
 {i:"ver",en:"to see / watch",g:"yo",c:"una película",f:{pres:["veo","ves","ve","vemos","veis","ven"],pret:["vi","viste","vio","vimos","visteis","vieron"],impf:["veía","veías","veía","veíamos","veíais","veían"]}},
 {i:"dar",en:"to give",g:"yo",c:"un regalo",f:{pres:["doy","das","da","damos","dais","dan"],pret:["di","diste","dio","dimos","disteis","dieron"]}},
 // fully irregular
 {i:"ser",en:"to be (who/what)",g:"irr",c:"muy simpática",f:{pres:["soy","eres","es","somos","sois","son"],pret:["fui","fuiste","fue","fuimos","fuisteis","fueron"],impf:["era","eras","era","éramos","erais","eran"]}},
 {i:"estar",en:"to be (feeling/place)",g:"irr",c:"en casa",f:{pres:ESTAR.slice(),pret:strong("estuv")}},
 {i:"ir",en:"to go",g:"irr",c:"a la playa",f:{pres:IR.slice(),pret:["fui","fuiste","fue","fuimos","fuisteis","fueron"],impf:["iba","ibas","iba","íbamos","ibais","iban"]},ger:"yendo"},
 {i:"tener",en:"to have",g:"irr",c:"mucha tarea",f:{pres:["tengo","tienes","tiene","tenemos","tenéis","tienen"],pret:strong("tuv")},fs:"tendr"},
 {i:"venir",en:"to come",g:"irr",c:"a la fiesta",f:{pres:["vengo","vienes","viene","venimos","venís","vienen"],pret:strong("vin")},fs:"vendr",ger:"viniendo"},
 {i:"decir",en:"to say / tell",g:"irr",c:"la verdad",f:{pres:["digo","dices","dice","decimos","decís","dicen"],pret:strong("dij",1)},fs:"dir",ger:"diciendo"},
 // reflexive
 {i:"levantarse",en:"to get up",g:"refl",c:"temprano"},{i:"ducharse",en:"to shower",g:"refl",c:"por la mañana"},{i:"llamarse",en:"to be called",g:"refl",c:"Ana"},
 {i:"lavarse",en:"to wash (oneself)",g:"refl",c:"las manos"},{i:"quedarse",en:"to stay",g:"refl",c:"en casa"},{i:"prepararse",en:"to get ready",g:"refl",c:"para la escuela"},
 {i:"acostarse",en:"to go to bed",g:"refl",ch:["o","ue"],c:"tarde"},{i:"despertarse",en:"to wake up",g:"refl",ch:["e","ie"],c:"a las seis"},{i:"vestirse",en:"to get dressed",g:"refl",ch:["e","i"],c:"rápido"},
 {i:"divertirse",en:"to have fun",g:"refl",ch:["e","ie"],c:"en la fiesta"},{i:"sentarse",en:"to sit down",g:"refl",ch:["e","ie"],c:"en el sofá"}
];
const GROUPS = {ar:"Regular -ar", er:"Regular -er", ir:"Regular -ir", spell:"Spelling change", "e-ie":"e → ie", "o-ue":"o → ue", "e-i":"e → i", "u-ue":"u → ue", yo:"Irregular yo", irr:"Totally irregular", refl:"Reflexive"};
const V = {}; VERBS.forEach(v => V[v.i] = v);

function replLast(s, a, b){ const k = s.lastIndexOf(a); return k < 0 ? s : s.slice(0,k) + b + s.slice(k + a.length); }
const isRefl = v => v.g === "refl" || (v.i.endsWith("se") && v.i.length > 4 && v.i !== "ser");
const baseInf = v => isRefl(v) ? v.i.slice(0,-2) : v.i;
function simple(v, t){
  if(v.f && v.f[t]) return v.f[t].slice();
  const inf = baseInf(v), e = inf.slice(-2), st = inf.slice(0,-2);
  if(t === "fut" || t === "cond"){ const s = v.fs || inf; return END[t].map(x => s + x); }
  const out = END[t][e].map((x,i) => {
    let s = st;
    if(v.ch && t === "pres" && i !== 3 && i !== 4) s = replLast(st, v.ch[0], v.ch[1]);
    if(v.ch && t === "pret" && e === "ir" && (i === 2 || i === 5)) s = replLast(st, v.ch[0], v.ch[0] === "e" ? "i" : "u");
    return s + x;
  });
  if(t === "pret"){
    if(e === "ar"){ if(st.endsWith("c")) out[0] = st.slice(0,-1) + "qué"; else if(st.endsWith("g")) out[0] = st + "ué"; else if(st.endsWith("z")) out[0] = st.slice(0,-1) + "cé"; }
    else if(/[aeo]$/.test(st)) out.splice(0, 6, st+"í", st+"íste", st+"yó", st+"ímos", st+"ísteis", st+"yeron");
  }
  return out;
}
function gerund(v){
  if(v.ger) return v.ger;
  const inf = baseInf(v), e = inf.slice(-2); let st = inf.slice(0,-2);
  if(e === "ar") return st + "ando";
  if(e === "ir" && v.ch) st = replLast(st, v.ch[0], v.ch[0] === "e" ? "i" : "u");
  return st + "iendo";
}
function attachPron(word, i){ return word + RP[i]; }
/* returns [primary answer, ...also accepted] for one cell */
function answers(v, t, i){
  const refl = isRefl(v), inf = baseInf(v);
  if(t === "prog"){
    const g = gerund(v);
    if(!refl) return [`${ESTAR[i]} ${g}`];
    const acc = g.replace(/ando$/, "ándo").replace(/iendo$/, "iéndo").replace(/yendo$/, "yéndo");
    return [`${RP[i]} ${ESTAR[i]} ${g}`, `${ESTAR[i]} ${acc}${RP[i]}`];
  }
  if(t === "ira"){
    if(!refl) return [`${IR[i]} a ${inf}`];
    return [`${RP[i]} ${IR[i]} a ${inf}`, `${IR[i]} a ${attachPron(inf, i)}`];
  }
  const f = simple(v, t)[i];
  return [refl ? `${RP[i]} ${f}` : f];
}
const table = (v, t) => P.map((_, i) => answers(v, t, i)[0]);

/* why-explanations after a miss */
function explain(v, t, i){
  const tips = [], inf = baseInf(v), e = inf.slice(-2);
  if(isRefl(v)) tips.push(`Reflexive: put <b>${RP[i]}</b> first.`);
  if(t === "prog") return tips.concat([`estar (${ESTAR[i]}) + gerund <b>${gerund(v)}</b>. ${/iendo$/.test(gerund(v)) && v.ch && e === "ir" ? "-ir stem-changers change in the gerund too." : ""}`]).join(" ");
  if(t === "ira") return tips.concat([`ir (${IR[i]}) + <b>a</b> + the infinitive.`]).join(" ");
  if(v.f && v.f[t]) tips.push(`<b>${esc(v.i)}</b> is irregular in the ${TENSES[t].n.toLowerCase()}. Memorize all 6.`);
  else if(t === "fut" || t === "cond"){ tips.push(v.fs ? `Irregular stem <b>${v.fs}-</b> + ${t === "fut" ? "é, ás, á, emos, éis, án" : "ía, ías, ía, íamos, íais, ían"}.` : `Keep the whole infinitive and add ${t === "fut" ? "é, ás, á, emos, éis, án" : "ía, ías, ía, íamos, íais, ían"}.`); }
  else {
    tips.push(`${TENSES[t].n} -${e} ending for ${PS[i]}: <b>-${END[t][e][i]}</b>.`);
    if(v.ch && t === "pres") tips.push(i === 3 || i === 4 ? `No stem change for nosotros/vosotros.` : `Stem change ${v.ch[0]} → ${v.ch[1]}.`);
    if(v.ch && t === "pret" && e === "ir" && (i === 2 || i === 5)) tips.push(`-ir stem-changers change ${v.ch[0]} → ${v.ch[0] === "e" ? "i" : "u"} in él / ellos in the preterite.`);
    if(t === "pret" && i === 0 && e === "ar" && /[cgz]$/.test(inf.slice(0,-2))) tips.push(`Spelling change in yo: -car → qué, -gar → gué, -zar → cé.`);
    if(t === "pret" && /[aeo]$/.test(inf.slice(0,-2)) && e !== "ar") tips.push(`Vowel + -er: i becomes y in él / ellos (leyó, leyeron), and í gets an accent.`);
    if(v.f && Object.keys(v.f).length && !v.f[t]) tips.push(`(This tense is regular for ${v.i}, even though other tenses aren't.)`);
  }
  return tips.join(" ");
}

/* ============ CONTEXT SENTENCES ============ */
const CUES = {pres:["Todos los días","Normalmente","Hoy","Los lunes"], pret:["Ayer","Anoche","El sábado pasado","La semana pasada","Hace dos días"], impf:["Cuando era niña,","Siempre","De pequeños,","Antes, todos los veranos"], prog:["Ahora mismo","En este momento"], ira:["Mañana","Este fin de semana","Esta noche"], fut:["El año que viene","En el futuro","Algún día"], cond:["Con más tiempo,","En un mundo perfecto,","Si pudiera,"]};
const SUBJ = [["yo",0],["tú",1],["mi hermana",2],["mi papá",2],["la profesora",2],["nosotros",3],["mi familia y yo",3],["vosotros",4],["mis amigos",5],["mis padres",5]];

/* ============ STORAGE ============ */
const KEY = "vamos-verbos-v1";
let M = {stats:{}, settings:{tenses:["pres","pret","impf"], groups:Object.keys(GROUPS), accents:true, vos:true, retype:true}, days:{}, best:0};
try{ const r = JSON.parse(localStorage.getItem(KEY) || "null"); if(r) M = Object.assign(M, r, {settings: Object.assign(M.settings, r.settings || {})}); }catch(e){}
let DB = null, syncT = null;
function persist(){
  try{ localStorage.setItem(KEY, JSON.stringify(M)); }catch(e){}
  if(!DB) return; clearTimeout(syncT);
  syncT = setTimeout(() => { DB.doc("verbos_meta/state").set(JSON.parse(JSON.stringify(M))).catch(() => {}); }, 1500);
}
if(window.claude && typeof window.claude.use === "function"){
  window.claude.use("db").then(async db => {
    if(!db) return; DB = db;
    try{ const s = await db.doc("verbos_meta/state").get();
      if(s.exists){ const r = JSON.parse(JSON.stringify(s.data())); const n = o => Object.keys(o.stats || {}).length; if(n(r) >= n(M)){ M = Object.assign(M, r, {settings: Object.assign(M.settings, r.settings || {})}); try{ localStorage.setItem(KEY, JSON.stringify(M)); }catch(e){} if(location.hash === "#verbos") render(); } else persist(); }
      else if(Object.keys(M.stats).length) persist();
    }catch(e){}
  }).catch(() => {});
}
const key = (v, t, i) => `${v.i}|${t}|${i}`;
const today = () => dkey(new Date());
function record(k, ok){
  const s = M.stats[k] || {b:0, r:0, w:0};
  if(ok){ s.r++; s.b = Math.min(5, s.b + 1); } else { s.w++; s.b = 0; }
  s.t = Date.now(); M.stats[k] = s;
  const d = M.days[today()] || {n:0, r:0}; d.n++; if(ok) d.r++; M.days[today()] = d;
  persist();
}
const cellMastery = k => { const s = M.stats[k]; return s ? Math.min(s.b, 4) / 4 : 0; };
function vtMastery(v, t){ let m = 0; for(let i = 0; i < 6; i++) m += cellMastery(key(v, t, i)); return m / 6; }

/* ============ PICKING (weakest first) ============ */
const persons = () => M.settings.vos ? [0,1,2,3,4,5] : [0,1,2,3,5];
function pool(){ const out = []; VERBS.filter(v => M.settings.groups.includes(v.g)).forEach(v => M.settings.tenses.forEach(t => persons().forEach(i => out.push([v,t,i])))); return out; }
const W = [9, 6, 3.5, 2, 0.8, 0.3];
let lastVerb = null;
function pickCell(){
  const pl = pool(); if(!pl.length) return null;
  let tot = 0; const w = pl.map(([v,t,i]) => { const s = M.stats[key(v,t,i)]; let x = s ? W[s.b] : 4; if(v.i === lastVerb) x *= 0.15; tot += x; return x; });
  let r = Math.random() * tot; for(let n = 0; n < pl.length; n++){ r -= w[n]; if(r <= 0){ lastVerb = pl[n][0].i; return pl[n]; } }
  return pl[pl.length - 1];
}

/* ============ CHECKING ============ */
const clean = s => s.toLowerCase().replace(/[.,!?¡¿;:"()]/g,"").replace(/\s+/g," ").trim();
const SUBJ_STRIP = /^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes) /;
function judge(input, ans){
  let a = clean(input).replace(SUBJ_STRIP, ""); if(!a) return null;
  const list = ans.map(clean);
  if(list.includes(a)) return "ok";
  if(list.map(noAcc).includes(noAcc(a))) return M.settings.accents ? "accent" : "ok";
  return "no";
}

/* ============ UI ============ */
let mode = "drill", q = null, st = {streak:0}, speed = null;
const MODES = [["drill","Smart drill"],["table","Full tables"],["context","In a sentence"],["speed","Speed round"],["map","My mastery"]];
function header(){
  const d = M.days[today()] || {n:0, r:0}, pl = pool();
  const mastered = pl.filter(([v,t,i]) => (M.stats[key(v,t,i)] || {}).b >= 4).length;
  return `<div class="card stack">
    <div class="row between" style="flex-wrap:nowrap"><div><h1>Verbos</h1><p class="muted small">Your weakest forms come up most.</p></div>
      <div class="bigscore sm" style="--c:var(--pink)"><b>${pl.length ? Math.round(mastered / pl.length * 100) : 0}%</b></div></div>
    <div class="vstats"><div><b>${d.n}</b><span>today (goal 100)</span></div><div><b>${d.n ? Math.round(d.r / d.n * 100) : 0}%</b><span>right today</span></div><div><b>${mastered}</b><span>of ${pl.length} mastered</span></div><div><b>${st.streak}</b><span>in a row</span></div></div>
    <div class="ubar"><i style="width:${Math.min(100, d.n)}%;background:var(--pink)"></i></div>
  </div>
  <div class="tabs vtabs" id="vModes">${MODES.map(([k,l]) => `<button type="button" data-m="${k}" aria-pressed="${mode === k}">${l}</button>`).join("")}</div>
  <details class="card" id="vSet"><summary style="cursor:pointer"><b>What to practice</b> <span class="small muted">· ${M.settings.tenses.map(t => TENSES[t].n).join(", ")} · ${M.settings.groups.length === Object.keys(GROUPS).length ? "all verb types" : M.settings.groups.length + " verb types"}${M.settings.accents ? " · accents count" : ""}</span></summary>
    <div class="stack" style="margin-top:12px">
      <div><div class="eyebrow">Tenses</div><div class="seg" id="vTen">${Object.entries(TENSES).map(([k,o]) => `<button type="button" data-t="${k}" aria-pressed="${M.settings.tenses.includes(k)}">${o.n}</button>`).join("")}</div><p class="small muted" style="margin-top:4px">Present, preterite and imperfect are on the test. The rest are extra.</p></div>
      <div><div class="eyebrow">Verb types</div><div class="seg" id="vGrp">${Object.entries(GROUPS).map(([k,l]) => `<button type="button" data-g="${k}" aria-pressed="${M.settings.groups.includes(k)}">${l}</button>`).join("")}</div></div>
      <label class="row small"><input type="checkbox" id="vAcc" ${M.settings.accents ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--pink)"> Missing accents count as wrong (strict, like the test)</label>
      <label class="row small"><input type="checkbox" id="vVos" ${M.settings.vos ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--pink)"> Include vosotros</label>
      <label class="row small"><input type="checkbox" id="vRe" ${M.settings.retype ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--pink)"> After a mistake, make me type the right answer before moving on</label>
    </div></details>`;
}
function render(){
  const root = $("verbosArea"); if(!root) return;
  stopSpeed();
  root.innerHTML = `<div class="stack">${header()}<div id="vBody" class="stack"></div></div>`;
  root.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; q = null; render(); }));
  const keepOpen = () => { const o = $("vSet").open; return () => { render(); if(o) $("vSet").open = true; }; };
  root.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { const r = keepOpen(), s = M.settings.tenses, k = b.dataset.t; if(s.includes(k)){ if(s.length > 1) s.splice(s.indexOf(k), 1); } else s.push(k); persist(); q = null; r(); }));
  root.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { const r = keepOpen(), s = M.settings.groups, k = b.dataset.g; if(s.includes(k)){ if(s.length > 1) s.splice(s.indexOf(k), 1); } else s.push(k); persist(); q = null; r(); }));
  $("vAcc").addEventListener("change", e => { M.settings.accents = e.target.checked; persist(); });
  $("vVos").addEventListener("change", e => { M.settings.vos = e.target.checked; persist(); q = null; });
  $("vRe").addEventListener("change", e => { M.settings.retype = e.target.checked; persist(); });
  ({drill:mDrill, table:mTable, context:mContext, speed:mSpeed, map:mMap})[mode]($("vBody"));
}
function refreshHeader(){ const root = $("verbosArea"); if(!root) return; const d = M.days[today()] || {n:0,r:0}; const vs = root.querySelectorAll(".vstats b"); if(vs.length){ vs[0].textContent = d.n; vs[1].textContent = (d.n ? Math.round(d.r/d.n*100) : 0) + "%"; vs[3].textContent = st.streak; } const bar = root.querySelector(".ubar i"); if(bar) bar.style.width = Math.min(100, d.n) + "%"; }
function tableHTML(v, t, hi){
  return `<table class="conj">${table(v, t).map((f,i) => `<tr${i === hi ? ` class="hi"` : ""}><td>${esc(P[i])}</td><td><b>${esc(f)}</b></td></tr>`).join("")}</table>`;
}

/* ---- single-answer card used by drill + context + speed ---- */
function askCard(box, cell, opts){
  if(!box || !document.body.contains(box) || !cell) return;
  const [v, t, i] = cell, ans = answers(v, t, i);
  const ctx = opts.context;
  let stage = "answer";
  box.innerHTML = `<div class="card stack vcard">
    ${ctx ? `<div class="eyebrow">Fill in the verb</div><div class="p-q">${esc(ctx.before)} <span class="blank"></span> ${esc(ctx.after)}</div><div class="row"><span class="pill bluepill">${esc(v.i)}</span><span class="small muted">${esc(v.en)}</span></div>`
          : `<div class="row between"><span class="pill bluepill">${esc(TENSES[t].n)}</span><span class="small muted">${esc(TENSES[t].d)}</span></div>
             <div class="vq"><span class="vp">${esc(P[i])}</span><span class="vi">${esc(v.i)}</span><span class="small muted">${esc(v.en)}</span></div>`}
    <input class="answer vin" id="vAns" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t === "prog" || t === "ira" || isRefl(v) ? "Type the whole thing (e.g. me levanto)" : "Type the form"}">
    <div class="accents" data-for="vAns"></div>
    <div class="row"><button class="btn pink" id="vGo">Check</button>${opts.speed ? "" : `<button class="btn ghost" id="vIdk">I don't know</button>`}</div>
    <div id="vFb"></div></div>`;
  wireAccents(box.querySelector(".accents"));
  const inp = $("vAns"); setTimeout(() => inp.focus(), 30);
  const fb = $("vFb");
  const finish = ok => { opts.done(ok); };
  const miss = (msg) => {
    record(key(v,t,i), false); st.streak = 0; refreshHeader();
    fb.innerHTML = `<div class="result bad">${msg} <b>${esc(ans[0])}</b>${ans[1] ? ` <span class="small">(or ${esc(ans[1])})</span>` : ""}</div>
      <div class="gloss small">${explain(v, t, i)}</div>${opts.speed ? "" : tableHTML(v, t, i)}`;
    say(ans[0], 0.9);
    if(opts.speed){ stage = "done"; setTimeout(() => finish(false), 1100); return; }
    if(M.settings.retype){ stage = "retype"; inp.value = ""; inp.placeholder = "Now type it correctly"; inp.classList.add("retype"); $("vGo").textContent = "Check"; inp.focus(); }
    else { stage = "done"; $("vGo").textContent = "Next →"; $("vGo").focus(); }
  };
  const go = () => {
    if(stage === "done") return finish(false);
    const r = judge(inp.value, ans); if(!r) return;
    if(stage === "retype"){
      if(r === "ok"){ stage = "done"; inp.classList.remove("retype"); inp.classList.add("okin"); $("vGo").textContent = "Next →"; fb.insertAdjacentHTML("afterbegin", `<div class="result good">Got it. Keep going.</div>`); $("vGo").focus(); }
      else { inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 400); }
      return;
    }
    if(r === "ok"){
      record(key(v,t,i), true); st.streak++; A.addXP(1); refreshHeader();
      inp.classList.add("okin"); stage = "done";
      fb.innerHTML = `<div class="result good">${st.streak >= 5 ? `🔥 ${st.streak} in a row!` : "¡Correcto!"} ${ctx ? `<span class="small">(${esc(TENSES[t].n)})</span>` : ""}</div>`;
      say(ans[0], 1);
      setTimeout(() => finish(true), opts.speed ? 150 : 550);
    } else if(r === "accent") miss("Almost! Accents count. It's");
    else miss(ctx ? `Not quite. This needs the ${TENSES[t].n.toLowerCase()}:` : "Not quite. It's");
  };
  $("vGo").addEventListener("click", go);
  inp.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); go(); } });
  if($("vIdk")) $("vIdk").addEventListener("click", () => { if(stage === "answer") miss("It's"); });
}

function mDrill(box){
  const next = () => { const c = pickCell(); if(!c) return box.innerHTML = `<p>Turn on at least one tense and verb type.</p>`; askCard(box, c, {done: next}); };
  next();
}
function mContext(box){
  const next = () => {
    const c = pickCell(); if(!c) return;
    const [v, t] = c;
    const subs = SUBJ.filter(s => persons().includes(s[1]));
    const s = subs[Math.floor(Math.random() * subs.length)];
    const cue = CUES[t][Math.floor(Math.random() * CUES[t].length)];
    const cell = [v, t, s[1]];
    askCard(box, cell, {context:{before: `${cue} ${s[0]}`, after: `${v.c || ""}.`}, done: next});
  };
  next();
}
function mTable(box){
  const vs = VERBS.filter(v => M.settings.groups.includes(v.g));
  const ts = M.settings.tenses;
  const weakest = () => { let best = null, bm = 2; vs.forEach(v => ts.forEach(t => { const m = vtMastery(v, t) + Math.random() * 0.15; if(m < bm){ bm = m; best = [v, t]; } })); return best; };
  let [v, t] = q && q.table ? q.table : weakest();
  q = {table:[v, t]};
  box.innerHTML = `<div class="card stack">
    <div class="row between"><div class="row"><select id="tVerb" class="answer" style="width:auto;font-size:1rem;padding:8px 10px">${vs.map(x => `<option value="${x.i}" ${x === v ? "selected" : ""}>${esc(x.i)} · ${esc(x.en)}</option>`).join("")}</select>
      <select id="tTen" class="answer" style="width:auto;font-size:1rem;padding:8px 10px">${ts.map(x => `<option value="${x}" ${x === t ? "selected" : ""}>${TENSES[x].n}</option>`).join("")}</select></div>
      <button class="btn sm" id="tWeak">Weakest next</button></div>
    <p class="small muted">Fill all ${persons().length}. Every box has to be right before you move on.</p>
    <div class="accents" id="tAcc"></div>
    <div class="ctable">${persons().map(i => `<label class="small" for="tc${i}">${esc(P[i])}</label><input class="answer" id="tc${i}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" style="font-size:1.05rem;padding:9px 12px">`).join("")}</div>
    <button class="btn pink" id="tCheck">Check table</button><div id="tFb"></div></div>`;
  let lastF = $("tc0");
  box.querySelectorAll(".ctable input").forEach(x => x.addEventListener("focus", () => lastF = x));
  const acc = $("tAcc"); acc.dataset.for = "tc0"; wireAccents(acc);
  acc.querySelectorAll("button").forEach(b => { const n = b.cloneNode(true); b.replaceWith(n); n.addEventListener("mousedown", e => e.preventDefault()); n.addEventListener("click", () => { const f = lastF, s = f.selectionStart ?? f.value.length; f.value = f.value.slice(0, s) + n.textContent + f.value.slice(f.selectionEnd ?? s); f.focus(); f.setSelectionRange(s+1, s+1); }); });
  $("tVerb").addEventListener("change", () => { q = {table:[V[$("tVerb").value], $("tTen").value]}; render(); });
  $("tTen").addEventListener("change", () => { q = {table:[V[$("tVerb").value], $("tTen").value]}; render(); });
  $("tWeak").addEventListener("click", () => { q = null; render(); });
  let first = true;
  $("tCheck").addEventListener("click", () => {
    let wrong = 0;
    persons().forEach(i => { const inp = $("tc"+i), ans = answers(v, t, i), r = judge(inp.value, ans);
      inp.classList.remove("okin","noin");
      if(r === "ok"){ inp.classList.add("okin"); if(first) record(key(v,t,i), true); }
      else { inp.classList.add("noin"); wrong++; if(first) record(key(v,t,i), false); } });
    first = false; refreshHeader();
    if(!wrong){ A.addXP(6); $("tFb").innerHTML = `<div class="result good">Perfect table! 🎉</div><button class="btn pink" id="tNext">Next table →</button>`; say(table(v,t).filter((_,i) => persons().includes(i)).join(", "), 0.95); $("tNext").addEventListener("click", () => { q = null; render(); }); $("tNext").focus(); }
    else $("tFb").innerHTML = `<div class="result bad">${wrong} wrong. Fix the red boxes and check again.</div><div class="gloss small">${explain(v, t, persons().find(i => $("tc"+i).classList.contains("noin")))}</div><details><summary class="small" style="cursor:pointer">Show the answers</summary>${tableHTML(v, t)}</details>`;
  });
  box.querySelectorAll(".ctable input").forEach((x, n, all) => x.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); if(all[n+1]) all[n+1].focus(); else $("tCheck").click(); } }));
  setTimeout(() => $("tc0").focus(), 30);
}
function stopSpeed(){ if(speed && speed.iv) clearInterval(speed.iv); speed = null; }
function mSpeed(box){
  box.innerHTML = `<div class="card stack center" style="align-items:center"><h2>60 seconds. How many can you type?</h2><p class="muted">Best: <b>${M.best || 0}</b> · mistakes still get recorded</p><button class="btn pink" id="sGo">Start</button></div>`;
  $("sGo").addEventListener("click", () => {
    speed = {left:60, n:0};
    box.innerHTML = `<div class="row between"><span class="timer" id="sT">0:60</span><span class="pill">Right: <b id="sN">0</b></span></div><div id="sCard"></div>`;
    const next = () => { if(!speed || !$("sCard")) return; askCard($("sCard"), pickCell(), {speed:true, done: ok => { if(!speed) return; if(ok){ speed.n++; $("sN").textContent = speed.n; } next(); }}); };
    next();
    speed.iv = setInterval(() => { if(!speed) return; speed.left--; $("sT").textContent = `0:${String(speed.left).padStart(2,"0")}`;
      if(speed.left <= 0){ const n = speed.n, best = M.best || 0; stopSpeed(); if(n > best){ M.best = n; persist(); }
        box.innerHTML = `<div class="card stack center" style="align-items:center"><h1>${n} right!</h1><p class="muted">${n > best ? "🎉 New personal best" : `Best: ${best}`}</p><button class="btn pink" id="sAgain">Again</button></div>`;
        $("sAgain").addEventListener("click", () => mSpeed(box)); } }, 1000);
  });
}
function mMap(box){
  const ts = Object.keys(TENSES).filter(t => M.settings.tenses.includes(t));
  const col = m => m >= 0.95 ? "var(--good)" : m >= 0.6 ? "#8fd6a9" : m >= 0.3 ? "var(--gold)" : m > 0 ? "#ffb3c0" : "var(--grey)";
  const groups = Object.keys(GROUPS).filter(g => M.settings.groups.includes(g));
  box.innerHTML = `<div class="card stack"><h3>Mastery map</h3><p class="small muted">Each square is one verb in one tense (all persons). Green = mastered. Tap a square to drill that table.</p>
    <div class="row small"><span class="pill" style="background:var(--grey)">not started</span><span class="pill" style="background:#ffb3c0">learning</span><span class="pill" style="background:var(--gold)">getting there</span><span class="pill" style="background:var(--good);color:#fff">mastered</span></div>
    <div class="tablewrap"><table class="vmap"><tr><th></th>${ts.map(t => `<th>${TENSES[t].n.replace("Present progressive","Prog.").replace("Ir a + verb","Ir a")}</th>`).join("")}</tr>
    ${groups.map(g => `<tr><td colspan="${ts.length + 1}" class="vgrp">${esc(GROUPS[g])}</td></tr>` + VERBS.filter(v => v.g === g).map(v => `<tr><td class="vname">${esc(v.i)}</td>${ts.map(t => { const m = vtMastery(v, t); return `<td><button type="button" class="vcell" data-v="${v.i}" data-t="${t}" style="background:${col(m)}" title="${v.i} · ${TENSES[t].n}: ${Math.round(m*100)}%">${m > 0 ? Math.round(m*100) : ""}</button></td>`; }).join("")}</tr>`).join("")).join("")}
    </table></div></div>`;
  box.querySelectorAll(".vcell").forEach(b => b.addEventListener("click", () => { mode = "table"; q = {table:[V[b.dataset.v], b.dataset.t]}; render(); }));
}

window.VB = {render};
if(location.hash === "#verbos") render();
})();
