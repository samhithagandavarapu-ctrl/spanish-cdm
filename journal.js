/* ¡Vamos! 30-day Spanish journal: daily prompt, built-in lookup, real grading, rewrite, word bank, progress */
(function(){
"use strict";
const A = window.APP;
const {esc, say, toast, wireAccents, noAcc, norm, dkey, $} = A;

/* ============ 30 PROMPTS (original) ============
   [spanish prompt, english, focus, starters [[es,en]], words [[es,en]]] */
const PROMPTS = [
 ["Preséntate. ¿Quién eres?","Introduce yourself. Who are you?","ser · tener · me llamo",[["Me llamo… y tengo… años.","My name is… and I'm… years old."],["Soy de…, pero vivo en…","I'm from…, but I live in…"],["Soy una persona… porque…","I'm a… person because…"],["Me gusta…, pero no me gusta…","I like…, but I don't like…"]],[["el/la estudiante","student"],["la escuela secundaria","high school"],["curioso/a","curious"],["trabajador/a","hardworking"],["el idioma","language"],["el cumpleaños","birthday"],["el sueño","dream"],["la ciudad","city"]]],
 ["Describe a tu familia.","Describe your family.","mi/mis · adjectives that match",[["En mi familia hay… personas.","There are… people in my family."],["Mi madre es… y le gusta…","My mom is… and she likes…"],["Mis hermanos son…","My siblings are…"],["La persona más graciosa de mi familia es… porque…","The funniest person in my family is… because…"]],[["mayor","older"],["menor","younger"],["cariñoso/a","affectionate"],["estricto/a","strict"],["se parece a","looks like"],["juntos","together"],["los parientes","relatives"],["la mascota","pet"]]],
 ["Describe a tu mejor amigo o amiga.","Describe your best friend.","ser vs. estar",[["Mi mejor amiga se llama…","My best friend's name is…"],["La conocí en…","I met her at…"],["Es…, pero a veces está…","She's…, but sometimes she's (feeling)…"],["Juntas nos gusta…","Together we like to…"]],[["leal","loyal"],["divertido/a","fun"],["confiar en","to trust"],["reírse","to laugh"],["compartir","to share"],["apoyar","to support"],["el secreto","secret"],["chismear","to gossip"]]],
 ["Tu rutina en un día de escuela.","Your routine on a school day.","reflexive verbs · time",[["Normalmente me despierto a las…","I usually wake up at…"],["Primero…, luego…, después…","First…, then…, after that…"],["Llego a la escuela a las…","I get to school at…"],["Por la noche… y me acuesto a las…","At night… and I go to bed at…"]],[["me despierto","I wake up"],["me ducho","I shower"],["me visto","I get dressed"],["el autobús","bus"],["el almuerzo","lunch"],["la tarea","homework"],["cansado/a","tired"],["temprano","early"]]],
 ["Tus clases: ¿cuál te gusta más y cuál menos?","Your classes: which do you like most and least?","gustar · más… que",[["Mi clase favorita es… porque…","My favorite class is… because…"],["Mi clase menos favorita es…","My least favorite class is…"],["… es más difícil que…","… is harder than…"],["El profesor de… es…","The… teacher is…"]],[["más… que","more… than"],["menos… que","less… than"],["aprender","to learn"],["el proyecto","project"],["la nota","grade"],["explicar","to explain"],["aburrido/a","boring"],["útil","useful"]]],
 ["Un fin de semana típico.","A typical weekend.","present tense · a veces, nunca, siempre",[["Los sábados normalmente…","On Saturdays I usually…"],["A veces… con…","Sometimes… with…"],["Nunca… porque…","I never… because…"],["Los domingos mi familia y yo…","On Sundays my family and I…"]],[["dormir hasta tarde","to sleep in"],["salir","to go out"],["descansar","to rest"],["ver series","to watch shows"],["hacer ejercicio","to work out"],["limpiar","to clean"],["el centro comercial","mall"],["ir al templo","to go to temple"]]],
 ["¿Qué haces en tu tiempo libre?","What do you do in your free time?","gustar / encantar + verb",[["En mi tiempo libre me encanta…","In my free time I love…"],["Lo hago con… porque…","I do it with… because…"],["Soy bueno/a para…","I'm good at…"],["Quiero aprender a…","I want to learn to…"]],[["el pasatiempo","hobby"],["practicar","to practice"],["dibujar","to draw"],["leer novelas","to read novels"],["cocinar","to cook"],["tocar un instrumento","to play an instrument"],["el voluntariado","volunteering"],["relajarse","to relax"]]],
 ["Tu comida favorita y una comida que odias.","Your favorite food and a food you hate.","gustar · describing food",[["Mi comida favorita es…","My favorite food is…"],["Normalmente la como…","I usually eat it…"],["No soporto…","I can't stand…"],["En mi casa comemos mucho…","At home we eat a lot of…"]],[["picante","spicy"],["dulce","sweet"],["salado/a","salty"],["el sabor","flavor"],["la receta","recipe"],["probar","to try (taste)"],["saludable","healthy"],["asqueroso/a","gross"]]],
 ["Describe tu casa y tu cuarto.","Describe your house and your room.","hay · estar + location",[["Vivo en una casa…","I live in a… house"],["En mi cuarto hay…","In my room there is/are…"],["Mi cama está al lado de…","My bed is next to…"],["Mi lugar favorito de la casa es… porque…","My favorite place in the house is… because…"]],[["la pared","wall"],["el escritorio","desk"],["la ventana","window"],["el armario","closet"],["cómodo/a","comfortable"],["ordenado/a","tidy"],["desordenado/a","messy"],["las luces","lights"]]],
 ["Tu ciudad: ¿qué hay y qué no hay?","Your town: what's there and what isn't?","hay · opinions",[["Vivo en…, que está en Carolina del Norte.","I live in…, which is in North Carolina."],["Cerca de mi casa hay…","Near my house there is…"],["Lo que más me gusta de mi ciudad es…","What I like most about my town is…"],["Lo que no me gusta es…","What I don't like is…"]],[["el barrio","neighborhood"],["el tráfico","traffic"],["tranquilo/a","quiet"],["ruidoso/a","noisy"],["el centro","downtown"],["lejos de","far from"],["cerca de","near"],["no hay nada que hacer","there's nothing to do"]]],
 ["¿Qué hiciste ayer?","What did you do yesterday?","preterite (regular)",[["Ayer me levanté a las…","Yesterday I got up at…"],["Por la mañana…","In the morning…"],["Después de las clases…","After school…"],["Por la noche… y me acosté a las…","At night… and I went to bed at…"]],[["ayer","yesterday"],["anoche","last night"],["estudié","I studied"],["comí","I ate"],["salí","I went out"],["terminé","I finished"],["hablé","I talked"],["trabajé","I worked"]]],
 ["El mejor fin de semana de tu vida.","The best weekend of your life.","preterite (fui, hice, tuve)",[["Una vez fui a…","One time I went to…"],["Fue increíble porque…","It was amazing because…"],["Hicimos…","We did…"],["Al final…","In the end…"]],[["el viaje","trip"],["inolvidable","unforgettable"],["visitamos","we visited"],["nos quedamos","we stayed"],["sacar fotos","to take pictures"],["fue","it was"],["tuvimos","we had"],["hicimos","we did/made"]]],
 ["Cuando eras niña, ¿cómo eras y qué hacías?","When you were little, what were you like and what did you do?","imperfect (era, jugaba, tenía)",[["Cuando era niña, era…","When I was little, I was…"],["Siempre jugaba…","I always used to play…"],["Mi programa favorito era…","My favorite show was…"],["Todos los días…","Every day…"]],[["de pequeña","as a little girl"],["el juguete","toy"],["los dibujos animados","cartoons"],["tenía miedo de","I was afraid of"],["soñaba con","I dreamed of"],["travieso/a","mischievous"],["el columpio","swing"],["la abuela","grandma"]]],
 ["Un día que salió mal.","A day that went wrong.","preterite vs. imperfect",[["Era un día normal cuando…","It was a normal day when…"],["Hacía… y yo estaba…","It was (weather)… and I was…"],["De repente…","Suddenly…"],["Al final aprendí que…","In the end I learned that…"]],[["de repente","suddenly"],["se me olvidó","I forgot"],["perdí","I lost"],["llegué tarde","I arrived late"],["llovía","it was raining"],["estaba nerviosa","I was nervous"],["por suerte","luckily"],["la culpa","fault"]]],
 ["Tus planes para las vacaciones de invierno.","Your plans for winter break.","ir a + verb",[["Durante las vacaciones voy a…","During break I'm going to…"],["Mi familia y yo vamos a…","My family and I are going to…"],["También quiero…","I also want to…"],["No voy a… porque…","I'm not going to… because…"]],[["las vacaciones","break / vacation"],["viajar","to travel"],["visitar","to visit"],["descansar","to rest"],["celebrar","to celebrate"],["regalar","to give (gifts)"],["el Año Nuevo","New Year"],["estudiar para el examen","to study for the test"]]],
 ["Una persona que admiras.","A person you admire.","ser · preterite for what they did",[["La persona que más admiro es…","The person I admire most is…"],["La admiro porque…","I admire her because…"],["Una vez, ella…","One time, she…"],["Quiero ser como ella porque…","I want to be like her because…"]],[["valiente","brave"],["generoso/a","generous"],["ayudar","to help"],["luchar por","to fight for"],["el ejemplo","example"],["la meta","goal"],["lograr","to achieve"],["inspirar","to inspire"]]],
 ["Una causa que te importa.","A cause you care about.","opinions: creo que, es importante + verb",[["Una causa muy importante para mí es…","A cause that's very important to me is…"],["Creo que… porque…","I think that… because…"],["Es importante ayudar a…","It's important to help…"],["Para ayudar, yo…","To help, I…"]],[["la comunidad","community"],["la salud","health"],["la discapacidad","disability"],["apoyar","to support"],["cambiar","to change"],["el/la voluntario/a","volunteer"],["la gente","people"],["merecer","to deserve"]]],
 ["Tu trabajo ideal en el futuro.","Your ideal job in the future.","quiero ser · me gustaría · tengo que",[["En el futuro quiero ser…","In the future I want to be…"],["Me gustaría trabajar en…","I would like to work at…"],["Para eso, tengo que…","For that, I have to…"],["Creo que voy a ser feliz porque…","I think I'm going to be happy because…"]],[["el médico / la médica","doctor"],["la universidad","college"],["estudiar medicina","to study medicine"],["investigar","to research"],["el cerebro","brain"],["los pacientes","patients"],["la carrera","career / major"],["el hospital","hospital"]]],
 ["Compara dos estaciones del año.","Compare two seasons.","weather · más… que",[["En invierno hace…, pero en verano…","In winter it's…, but in summer…"],["Prefiero… porque…","I prefer… because…"],["En… me gusta…","In… I like to…"],["… es más… que…","… is more… than…"]],[["hace frío","it's cold"],["hace calor","it's hot"],["llueve","it rains"],["nieva","it snows"],["la primavera","spring"],["el otoño","fall"],["las hojas","leaves"],["el sol","sun"]]],
 ["Tu celebración favorita.","Your favorite celebration.","present (traditions) + preterite (last time)",[["Mi celebración favorita es…","My favorite celebration is…"],["Normalmente celebramos con…","We usually celebrate with…"],["Comemos… y…","We eat… and…"],["El año pasado…","Last year…"]],[["la fiesta","party"],["la tradición","tradition"],["decorar","to decorate"],["las luces","lights"],["el regalo","gift"],["bailar","to dance"],["rezar","to pray"],["los dulces","sweets"]]],
 ["Un día en la vida de una mascota o un animal.","A day in the life of a pet or animal.","él/ella forms · reflexives",[["Mi perro se despierta a las…","My dog wakes up at…"],["Le gusta…","He likes…"],["Todos los días…","Every day…"],["Por la noche…","At night…"]],[["ladrar","to bark"],["pasear","to walk (a dog)"],["dormir la siesta","to nap"],["juguetón / juguetona","playful"],["la cola","tail"],["perezoso/a","lazy"],["el juguete","toy"],["la comida","food"]]],
 ["¿Cómo usas tu teléfono y las redes sociales?","How do you use your phone and social media?","opinions · frequency",[["Uso mi teléfono para…","I use my phone to…"],["Paso… horas al día en…","I spend… hours a day on…"],["Creo que las redes sociales son… porque…","I think social media is… because…"],["Lo bueno es… y lo malo es…","The good part is… and the bad part is…"]],[["las redes sociales","social media"],["el mensaje","message"],["mandar","to send"],["publicar","to post"],["seguir","to follow"],["peligroso/a","dangerous"],["útil","useful"],["perder el tiempo","to waste time"]]],
 ["Escribe un correo a un estudiante de intercambio.","Write an email to an exchange student coming to your school.","present · questions",[["¡Hola! Me llamo… y voy a ser tu…","Hi! My name is… and I'm going to be your…"],["Nuestra escuela es…","Our school is…"],["Aquí hay…","Here there is/are…"],["¿Te gusta…?","Do you like…?"]],[["bienvenido/a","welcome"],["el horario","schedule"],["la cafetería","cafeteria"],["el club","club"],["conocer","to meet"],["preguntar","to ask"],["¡Nos vemos pronto!","See you soon!"],["el partido","game (sports)"]]],
 ["Describe una foto o un recuerdo especial.","Describe a special photo or memory.","imperfect (description) + preterite (events)",[["En la foto estoy con…","In the photo I'm with…"],["Estábamos en…","We were at…"],["Hacía…","It was (weather)…"],["Ese día nosotros…","That day we…"]],[["el recuerdo","memory"],["sonreír","to smile"],["llevaba","I was wearing"],["detrás de","behind"],["especial","special"],["extrañar","to miss"],["feliz","happy"],["la foto","photo"]]],
 ["¿Qué hiciste el verano pasado?","What did you do last summer?","preterite",[["El verano pasado fui a…","Last summer I went to…"],["Pasé mucho tiempo…","I spent a lot of time…"],["Lo mejor fue…","The best part was…"],["Lo peor fue…","The worst part was…"]],[["el campamento","camp"],["la piscina","pool"],["trabajé","I worked"],["aprendí","I learned"],["conocí","I met"],["el calor","heat"],["los consejeros","counselors"],["divertidísimo","super fun"]]],
 ["Un problema en tu escuela y una solución.","A problem at your school and a solution.","opinions · tener que · hay que",[["Un problema en mi escuela es…","A problem at my school is…"],["Muchos estudiantes…","A lot of students…"],["Creo que la escuela tiene que…","I think the school has to…"],["Si todos ayudamos,…","If we all help,…"]],[["el problema","problem"],["la solución","solution"],["el estrés","stress"],["demasiado","too much"],["mejorar","to improve"],["hay que","you have to / one must"],["el estacionamiento","parking lot"],["proponer","to propose"]]],
 ["Tu día perfecto.","Your perfect day.","present · me gustaría",[["En mi día perfecto, me despierto…","On my perfect day, I wake up…"],["Desayuno… con…","I eat breakfast… with…"],["Por la tarde, vamos a…","In the afternoon, we go to…"],["Termino el día…","I end the day…"]],[["perfecto/a","perfect"],["relajado/a","relaxed"],["sin tarea","without homework"],["el atardecer","sunset"],["la playa","beach"],["la música","music"],["me gustaría","I would like"],["mis amigos","my friends"]]],
 ["Escribe sobre aprender español.","Write about learning Spanish.","preterite + present + ir a",[["Empecé a estudiar español…","I started studying Spanish…"],["Al principio fue…","At first it was…"],["Ahora puedo…","Now I can…"],["En el futuro, voy a…","In the future, I'm going to…"]],[["al principio","at first"],["mejorar","to improve"],["entender","to understand"],["hablar con fluidez","to speak fluently"],["el error","mistake"],["orgulloso/a","proud"],["practicar","to practice"],["la prueba","test"]]],
 ["Una carta a ti misma dentro de un año.","A letter to yourself one year from now.","ir a · mix of tenses",[["Querida yo:","Dear me:"],["Ahora tengo… años y…","Right now I'm… years old and…"],["Este año voy a…","This year I'm going to…"],["Estoy orgullosa de…","I'm proud of…"]],[["querido/a","dear"],["el año que viene","next year"],["la meta","goal"],["recordar","to remember"],["el cambio","change"],["crecer","to grow"],["orgulloso/a","proud"],["no te olvides de","don't forget to"]]],
 ["Tu historia: ¿quién eras, quién eres y quién vas a ser?","Your story: who were you, who are you, and who will you be?","imperfect + present + ir a",[["Cuando era niña,…","When I was little,…"],["Ahora soy…","Now I am…"],["El año pasado…","Last year…"],["En el futuro voy a…","In the future I'm going to…"]],[["antes","before"],["ahora","now"],["en el futuro","in the future"],["cambiar","to change"],["crecer","to grow up"],["soñar","to dream"],["lograr","to achieve"],["la vida","life"]]]
];
const MISTAKE_TYPES = ["verb conjugation","gender / agreement","ser vs. estar","gustar","past tense choice","reflexive verbs","stem-changing verbs","articles","prepositions","word order","missing word","word choice","spelling / accents","English words"];
const MISTAKE_LESSON = {"verb conjugation":"ar","gender / agreement":"genero","ser vs. estar":"serestar","gustar":"gustar","past tense choice":"pretimp","reflexive verbs":"reflex","stem-changing verbs":"stem","articles":"genero","prepositions":"ir"};

/* ============ STORAGE (Claude db when available, browser copy always) ============ */
const LKEY = "vamos-journal-v1";
let DB = null, entries = [], meta = {words:[]}, ready = false, cloud = false;
function localLoad(){ try{ const r = JSON.parse(localStorage.getItem(LKEY) || "null"); if(r){ entries = r.entries || []; meta = r.meta || {words:[]}; } }catch(e){} }
function localSave(){ try{ localStorage.setItem(LKEY, JSON.stringify({entries, meta})); }catch(e){} }
const clone = o => JSON.parse(JSON.stringify(o));
async function init(){
  localLoad();
  if(window.claude && typeof window.claude.use === "function"){
    try{
      DB = await Promise.race([window.claude.use("db"), new Promise(r => setTimeout(() => r(null), 10000))]);
      if(DB){
        const load = (async () => {
          const snap = await DB.collection("journal").get();
          const m = await DB.doc("journal_meta/state").get();
          return {list: snap.docs.map(d => clone(d.data())), meta: m.exists ? clone(m.data()) : null};
        })();
        const r = await Promise.race([load, new Promise((_, rej) => setTimeout(() => rej({code:"timeout"}), 10000))]);
        cloud = true;
        // merge: cloud wins, but keep any local-only entries and push them up
        const byId = {}; r.list.forEach(e => byId[e.id] = e);
        const localOnly = entries.filter(e => !byId[e.id]);
        entries = r.list.concat(localOnly);
        if(r.meta) meta = Object.assign({words:[]}, r.meta); else if(meta.words.length) saveMeta();
        for(const e of localOnly){ try{ await DB.doc("journal/" + e.id).set(e); }catch(err){} }
        localSave();
      }
    }catch(e){ DB = null; cloud = false; toast("Couldn't reach your saved journal. Showing this browser's copy."); }
  }
  entries.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
  ready = true;
  A.route();
}
let saving = Promise.resolve();
function saveEntry(e){
  const i = entries.findIndex(x => x.id === e.id); if(i >= 0) entries[i] = e; else entries.push(e);
  localSave();
  if(DB) saving = saving.then(() => DB.doc("journal/" + e.id).set(clone(e))).catch(err => { if(err && err.code === "quota_exceeded") toast("Your journal storage is full."); else toast("Saved in this browser. Couldn't sync right now."); });
}
let metaTimer = null;
function saveMeta(){
  localSave();
  if(!DB) return;
  clearTimeout(metaTimer);
  metaTimer = setTimeout(() => { saving = saving.then(() => DB.doc("journal_meta/state").set(clone(meta))).catch(() => {}); }, 800);
}

/* ============ HELPERS ============ */
const graded = () => entries.filter(e => e.grade);
const todayKey = () => dkey(new Date());
function dayNumber(){ return graded().length + 1; }
function sentencesOf(t){ return t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 2); }
function countInfo(t){ const w = t.trim() ? t.trim().split(/\s+/).length : 0; return {words: w, sents: sentencesOf(t).length}; }
function addWord(es, en, src){
  es = (es || "").trim(); en = (en || "").trim(); if(!es) return false;
  if(meta.words.some(w => noAcc(w.es.toLowerCase()) === noAcc(es.toLowerCase()))) return false;
  meta.words.push({es, en, src: src || "lookup", added: todayKey(), box: 0, due: todayKey()});
  saveMeta(); return true;
}
function insertAtCursor(t, text){
  const s = t.selectionStart ?? t.value.length, e = t.selectionEnd ?? s;
  const before = t.value.slice(0, s), sep = before && !/\s$/.test(before) ? " " : "";
  t.value = before + sep + text + t.value.slice(e); const pos = (before + sep + text).length;
  t.focus(); t.setSelectionRange(pos, pos); t.dispatchEvent(new Event("input"));
}
function scoreColor(s){ return s >= 80 ? "var(--good)" : s >= 65 ? "#7cc8ff" : s >= 50 ? "var(--gold)" : "var(--bad)"; }
const atTarget = lv => /High|Intermediate/.test(lv || "");

/* ============ TODAY ============ */
let cur = null; // the entry being written
function newCur(promptIdx){
  const d = dayNumber();
  const idx = promptIdx != null ? promptIdx : (d <= 30 ? d - 1 : Math.floor(Math.random() * 30));
  let draft = ""; try{ const dr = JSON.parse(localStorage.getItem("vamos-draft") || "null"); if(dr && dr.p === idx) draft = dr.t; }catch(e){}
  cur = {id: "e" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36), day: d, p: idx, free: false, text: draft, lookups: [], date: todayKey(), createdAt: Date.now()};
}
function renderHoy(){
  const root = $("hoyArea");
  if(!ready){ root.innerHTML = `<div class="card"><p class="muted">Loading your journal…</p></div>`; return; }
  const todays = graded().filter(e => e.date === todayKey());
  if(!cur) newCur();
  if(cur.grade) return renderResult(root, cur, true);
  const P = cur.free ? ["Escribe sobre lo que quieras.","Free write: anything you want.","whatever you're working on",[["Hoy…","Today…"],["Me siento… porque…","I feel… because…"],["Ayer…","Yesterday…"],["Mañana voy a…","Tomorrow I'm going to…"]],[["hoy","today"],["me siento","I feel"],["porque","because"],["pero","but"],["también","also"],["después","after"],["ayer","yesterday"],["mañana","tomorrow"]]] : PROMPTS[cur.p];
  const ci = countInfo(cur.text || "");
  root.innerHTML = `
  ${todays.length ? `<div class="result good" style="margin-bottom:12px">✅ You already wrote ${todays.length > 1 ? todays.length + " entries" : "an entry"} today. This one is extra practice.</div>` : ""}
  <div class="hoy-grid">
    <div class="stack">
      <div class="card stack prompt-card">
        <div class="row between"><span class="pill pinkpill">${cur.free ? "Free write" : `Día ${Math.min(cur.day, 30)} de 30${cur.day > 30 ? " · bonus" : ""}`}</span>
          <div class="row" style="gap:6px"><button class="btn sm" id="hearP" aria-label="Hear the prompt">🔊</button><button class="btn sm" id="pickP">Change prompt</button></div></div>
        <h1 class="jp">${esc(P[0])}</h1>
        <p class="muted">${esc(P[1])}</p>
        <div class="row small"><span class="muted">Try to use:</span><span class="pill bluepill">${esc(P[2])}</span></div>
      </div>
      <div class="card stack">
        <div class="row between"><h3>Your entry</h3><span class="small muted" id="cnt">${ci.sents} sentences · ${ci.words} words</span></div>
        <textarea class="answer journal-box" id="jText" placeholder="Escribe aquí… Aim for 8–12 sentences. If you don't know a word, look it up on the right (or below on your phone).">${esc(cur.text || "")}</textarea>
        <div class="accents" data-for="jText"></div>
        <div class="row between"><div class="row" id="jMic"></div><span class="small muted">Goal: 8–12 sentences · mix in ${esc(P[2])}</span></div>
        <button class="btn pink wide" id="gradeBtn">${A.hasSample() ? "Grade my Spanish" : "Check my entry"}</button>
        ${A.hasSample() ? "" : `<p class="small muted">Full grading on your actual Spanish works when you open this app inside Claude. Here you'll get the automatic checklist.</p>`}
        <div id="gradeOut"></div>
      </div>
    </div>
    <div class="stack side">
      <div class="card stack" id="lookCard">
        <h3>🔎 Look it up</h3>
        <form class="row" id="lookForm" autocomplete="off" style="flex-wrap:nowrap"><input class="answer" id="lookQ" type="text" placeholder="English or Spanish… or “how do I say…”" style="font-size:1rem;padding:11px 13px"><button class="btn blue" type="submit">Go</button></form>
        <div id="lookOut" class="stack" style="gap:8px"><p class="small muted">Type any word or phrase. You'll get instant results from your word list, and ${A.hasSample() ? "Claude can explain anything else." : "links to SpanishDict and WordReference."}</p></div>
      </div>
      <div class="card stack">
        <h3>Sentence starters</h3>
        <div class="stack" style="gap:6px" id="starters">${P[3].map(([es,en],i) => `<button class="starter" type="button" data-i="${i}"><b>${esc(es)}</b><span>${esc(en)}</span></button>`).join("")}</div>
      </div>
      <div class="card stack">
        <h3>Useful words</h3>
        <div class="wordchips" id="wchips">${P[4].map(([es,en],i) => `<button class="wchip" type="button" data-i="${i}"><b>${esc(es)}</b> <span>${esc(en)}</span></button>`).join("")}</div>
        <p class="small muted">Tap to add it to your entry.</p>
      </div>
    </div>
  </div>`;
  wireAccents(root.querySelector(".accents"));
  const t = $("jText");
  let dt = null;
  t.addEventListener("input", () => { cur.text = t.value; const c = countInfo(t.value); $("cnt").textContent = `${c.sents} sentences · ${c.words} words`; clearTimeout(dt); dt = setTimeout(() => { try{ localStorage.setItem("vamos-draft", JSON.stringify({p: cur.p, t: t.value})); }catch(e){} }, 500); });
  const mic = A.micButton("jText"); if(mic) $("jMic").appendChild(mic);
  $("hearP").addEventListener("click", () => say(P[0], 0.9));
  $("pickP").addEventListener("click", openPromptPicker);
  root.querySelectorAll(".starter").forEach(b => b.addEventListener("click", () => { const s = P[3][+b.dataset.i][0].replace(/…\s*$/, " ").replace(/…/g, "… "); insertAtCursor(t, s.trimEnd()); say(P[3][+b.dataset.i][0].replace(/…/g, ""), 0.9); }));
  root.querySelectorAll(".wchip").forEach(b => b.addEventListener("click", () => { const w = P[4][+b.dataset.i][0].replace(/\/.*$/, "").replace(/^(el|la|los|las) /, m => m); insertAtCursor(t, w); say(w, 0.9); }));
  $("lookForm").addEventListener("submit", e => { e.preventDefault(); lookup($("lookQ").value.trim(), $("lookOut")); });
  $("gradeBtn").addEventListener("click", () => gradeEntry());
}
function openPromptPicker(){
  A.openSheet(`<div class="stack"><h2>Pick a prompt</h2><p class="small muted">The 30 days go in order, but you can pick any prompt or free write.</p>
    <button class="btn blue wide" id="pkFree">✍️ Free write: anything you want</button>
    <div class="stack" style="gap:8px">${PROMPTS.map((p,i) => { const done = graded().some(e => e.p === i && !e.free); return `<button class="starter" type="button" data-i="${i}"><b>${done ? "✓ " : ""}Día ${i+1}: ${esc(p[0])}</b><span>${esc(p[1])}</span></button>`; }).join("")}</div></div>`);
  document.querySelectorAll("#sheet .starter").forEach(b => b.addEventListener("click", () => { newCur(+b.dataset.i); A.closeSheet(); renderHoy(); }));
  $("pkFree").addEventListener("click", () => { newCur(); cur.free = true; A.closeSheet(); renderHoy(); });
}

/* ============ LOOKUP ============ */
const LOOKUP_DICT = (() => {
  const pairs = [];
  A.UNITS.forEach(u => u.lessons.forEach(L => L.vocab.forEach(v => pairs.push(v))));
  PROMPTS.forEach(p => p[4].forEach(v => pairs.push(v)));
  meta.words.forEach(w => pairs.push([w.es, w.en]));
  const seen = new Set(); return pairs.filter(([es]) => { const k = es.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; });
})();
async function lookup(q, out){
  if(!q) return;
  if(cur) cur.lookups.push(q);
  const nq = noAcc(q.toLowerCase().replace(/^(how do (i|you) say|what is|what's|como se dice|cómo se dice)\s+/i, "").replace(/[?¿"]/g, "").trim());
  const pool = LOOKUP_DICT.concat(meta.words.map(w => [w.es, w.en]));
  const hits = [];
  pool.forEach(([es,en]) => { const e = noAcc(es.toLowerCase()), n = en.toLowerCase(); let s = 0;
    if(e === nq || n === nq) s = 3; else if(e.split(/[\s/]+/).includes(nq) || n.split(/[\s/(),]+/).includes(nq)) s = 2; else if(nq.length >= 3 && (e.includes(nq) || n.includes(nq))) s = 1;
    if(s) hits.push([s, es, en]); });
  const lw = A.LOCAL[nq];
  hits.sort((a,b) => b[0] - a[0]);
  const top = hits.slice(0, 5);
  const enc = encodeURIComponent(q.replace(/^(how do (i|you) say)\s+/i, ""));
  out.innerHTML = `${lw && !top.some(h => noAcc(h[1].toLowerCase()) === nq) ? `<div class="lk"><div><b>${esc(q)}</b> = ${esc(lw)}</div></div>` : ""}
    ${top.map(([, es, en]) => `<div class="lk"><div><b>${esc(es)}</b> = ${esc(en)}</div><div class="row" style="gap:6px"><button class="btn sm" type="button" data-ins="${esc(es)}">+ Add</button><button class="btn sm" type="button" data-say="${esc(es)}" aria-label="Hear it">🔊</button><button class="btn sm" type="button" data-save="${esc(es)}|${esc(en)}">⭐</button></div></div>`).join("")}
    ${!top.length && !lw ? `<p class="small muted">Not in your word list yet.</p>` : ""}
    ${A.hasSample() ? `<button class="btn blue sm" type="button" id="askClaude">Ask Claude about “${esc(q)}”</button>` : ""}
    <div id="claudeLook"></div>
    <div class="row small" style="gap:8px"><a class="extlink" href="https://www.spanishdict.com/translate/${enc}" target="_blank" rel="noopener">SpanishDict ↗</a><a class="extlink" href="https://www.wordreference.com/es/en/translation.asp?spen=${enc}" target="_blank" rel="noopener">WordReference ↗</a></div>`;
  wireLookButtons(out);
  if($("askClaude")) $("askClaude").addEventListener("click", () => askClaudeLookup(q, $("claudeLook"), $("askClaude")));
  if(!top.length && !lw && A.hasSample()) askClaudeLookup(q, $("claudeLook"), $("askClaude"));
}
function wireLookButtons(out){
  out.querySelectorAll("[data-ins]").forEach(b => b.addEventListener("click", () => { const t = $("jText"); if(t){ insertAtCursor(t, b.dataset.ins.replace(/\s*\/.*$/, "")); } }));
  out.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => say(b.dataset.say, 0.9)));
  out.querySelectorAll("[data-save]").forEach(b => b.addEventListener("click", () => { const [es, en] = b.dataset.save.split("|"); toast(addWord(es, en, "lookup") ? "⭐ Saved to My Words" : "Already in My Words"); }));
}
async function askClaudeLookup(q, box, btn){
  if(btn) btn.disabled = true;
  box.innerHTML = `<p class="small muted">Asking…</p>`;
  const ctx = cur && cur.text ? cur.text.split(/\n|(?<=[.!?])\s+/).filter(Boolean).slice(-1)[0] || "" : "";
  try{
    const r = await A.askJSON(`You are a Spanish dictionary helper for a high school student at about ACTFL Novice Mid, writing a journal entry. Use Latin American Spanish.
Their lookup: "${q}" (could be an English word, a Spanish word, or "how do I say…").
The sentence they're writing right now (may be empty or mixed English/Spanish): "${ctx}"
Return ONLY JSON: {"spanish": the best simple Spanish word or phrase for what they mean (include el/la for nouns), "english": its English meaning, "type": "noun" | "verb" | "adjective" | "phrase" | other, "note": one short plain-English tip they'd need to use it correctly (gender, which form to use in their sentence, a false friend, or ser vs estar), "example": [a short Spanish example sentence at their level, its English], "forms": if it's a verb, "yo …, tú …, él …, nosotros … (present) · yo … (past)", otherwise ""}`, "quick");
    box.innerHTML = `<div class="lk claude"><div><b>${esc(r.spanish || "")}</b> = ${esc(r.english || "")} <span class="small muted">(${esc(r.type || "")})</span></div>
      ${r.note ? `<div class="small">💡 ${esc(r.note)}</div>` : ""}${r.forms ? `<div class="small muted">${esc(r.forms)}</div>` : ""}
      ${r.example && r.example[0] ? `<div class="small"><i>${esc(r.example[0])}</i> · ${esc(r.example[1] || "")}</div>` : ""}
      <div class="row" style="gap:6px"><button class="btn sm" type="button" data-ins="${esc(r.spanish || "")}">+ Add</button><button class="btn sm" type="button" data-say="${esc(r.spanish || "")}" aria-label="Hear it">🔊</button><button class="btn sm" type="button" data-save="${esc(r.spanish || "")}|${esc(r.english || "")}">⭐ Save</button></div></div>`;
    wireLookButtons(box);
  }catch(e){ box.innerHTML = `<p class="small muted">${esc(A.aiErr(e).replace(" Here's the automatic check instead.", ""))} Try the links below.</p>`; }
  finally{ if(btn) btn.disabled = false; }
}

/* ============ GRADING ============ */
function gradePrompt(promptText, text, lookups){
  return `You are an experienced high school Spanish teacher and ACTFL-trained rater. A student (target: ACTFL Novice High on the WCPSS Credit by Demonstrated Mastery test, like Avant STAMP) wrote this journal entry. They were allowed to look up words (${lookups} lookups); that's fine and shouldn't lower the grade.
Prompt: "${promptText}"
Entry:
"""${text}"""

Grade the student's ACTUAL Spanish — not whether they hit a checklist. Score four areas from 0 to 25 each:
- accuracy: conjugation, agreement, ser/estar, tense choice, articles, prepositions. Many errors that still let you understand the meaning = mid scores; errors that block meaning = low.
- vocabulary: range and precision for the level; repeated basic words or English words count against.
- complexity: isolated words → simple sentences → connected sentences (y, pero, porque, cuando) → strings of sentences that hang together, using more than one time frame.
- comprehensibility: how easily a sympathetic native speaker would understand it.
Be honest and calibrated; don't inflate. Use ACTFL levels: Novice Mid = mostly memorized words/phrases; Novice High = can create simple sentences on familiar topics, mostly present tense, errors are common but meaning is usually clear; Intermediate Low = creates with language in strings of sentences with fewer errors; Intermediate Mid = connected sentences across topics and time frames, generally accurate.
Allowed mistake types: ${MISTAKE_TYPES.map(t => `"${t}"`).join(", ")}.

Return ONLY JSON:
{"level": "Novice Low" | "Novice Mid" | "Novice High" | "Intermediate Low" | "Intermediate Mid",
 "score": total 0-100 (sum of the four),
 "sub": {"accuracy": 0-25, "vocabulary": 0-25, "complexity": 0-25, "comprehensibility": 0-25},
 "summary": 2 honest, warm sentences to the student as "you",
 "sentences": [for EVERY sentence in the entry, in order: {"you": the student's sentence exactly, "fixed": corrected natural Spanish (identical if already correct), "ok": true/false, "why": short plain-English explanation of each fix or "", "type": one allowed mistake type or ""}],
 "mistakes": [{"type": allowed type, "count": number}] (only types that occurred, most frequent first),
 "upgrades": [up to 3 {"instead": something basic they wrote, "try": a richer Spanish option at their level, "why": short reason}],
 "strengths": [up to 2 short strings],
 "next_focus": one specific thing to work on in the next entry,
 "corrected": the full entry rewritten with every error fixed, keeping their ideas and level,
 "flashcards": [2-4 {"es": a corrected Spanish phrase from their entry worth memorizing, "en": English}]}`;
}
async function gradeEntry(){
  const text = (cur.text || "").trim(); const ci = countInfo(text);
  if(ci.words < 12 || ci.sents < 3) return toast("Write at least 3 sentences first");
  const out = $("gradeOut"), btn = $("gradeBtn");
  const P = cur.free ? "Free write" : PROMPTS[cur.p][0];
  if(!A.hasSample()){
    const r = A.analyze(text, "write"); out.innerHTML = A.checkHTML(r, "") ; A.wireSay(out);
    cur.grade = {level:"Checklist only", score: Math.round(r.score / 6 * 100), sub:null, summary:"Automatic checklist (open in Claude for full grading).", sentences:[], mistakes:[], checklist:true};
    saveEntry(clone(cur)); A.addXP(10); return;
  }
  btn.disabled = true; btn.textContent = "Grading your Spanish…";
  out.innerHTML = `<div class="card"><p class="muted">Your teacher is reading every sentence. This takes a few seconds.</p></div>`;
  try{
    const g = await A.askJSON(gradePrompt(P, text, cur.lookups.length), "default");
    if(!g || typeof g.score !== "number") throw {};
    g.score = Math.max(0, Math.min(100, Math.round(g.score)));
    cur.grade = g; cur.gradedAt = Date.now(); cur.date = todayKey();
    (g.flashcards || []).forEach(f => addWord(f.es, f.en, "correction"));
    saveEntry(clone(cur));
    try{ localStorage.removeItem("vamos-draft"); }catch(e){}
    A.addXP(20 + Math.round(g.score / 5));
    renderHoy(); window.scrollTo({top: 0, behavior: "smooth"});
  }catch(e){
    btn.disabled = false; btn.textContent = "Grade my Spanish";
    out.innerHTML = `<div class="result bad">${esc(A.aiErr(e))}</div>`;
    const r = A.analyze(text, "write"); out.insertAdjacentHTML("beforeend", A.checkHTML(r, "")); A.wireSay(out);
  }
}

/* ============ RESULT VIEW (today + journal detail) ============ */
function resultHTML(e, live){
  const g = e.grade || {}; const P = e.free ? ["Free write","Anything you want"] : PROMPTS[e.p];
  if(g.checklist) return `<div class="card stack"><h2>${esc(P[0])}</h2><p class="passage">${esc(e.text)}</p><p class="small muted">Checked with the automatic checklist only. Open the app in Claude to get it fully graded.</p></div>`;
  const sub = g.sub || {};
  const subRow = (k, label) => `<div class="stack" style="gap:4px"><div class="row between small"><span>${label}</span><b>${sub[k] ?? "–"}/25</b></div><div class="ubar"><i style="width:${(sub[k]||0)/25*100}%;background:${scoreColor((sub[k]||0)*4)}"></i></div></div>`;
  const sents = g.sentences || [];
  const errs = sents.filter(s => !s.ok).length;
  return `
  <div class="card stack scorecard">
    <div class="row between"><span class="pill pinkpill">${e.free ? "Free write" : `Día ${Math.min(e.day,30)}`} · ${esc(e.date || "")}</span><span class="pill" style="${atTarget(g.level) ? "background:var(--good-s);border-color:var(--good);color:var(--good-d)" : ""}">${esc(g.level || "")}${atTarget(g.level) ? " ✓" : ""}</span></div>
    <div class="row" style="gap:18px;align-items:center;flex-wrap:nowrap">
      <div class="bigscore" style="--c:${scoreColor(g.score)}"><b>${g.score}</b><span>/100</span></div>
      <div class="stack" style="gap:4px"><h2 style="font-size:1.25rem">${esc(P[0])}</h2><p>${esc(g.summary || "")}</p></div>
    </div>
    <div class="grid2">${subRow("accuracy","Accuracy")}${subRow("vocabulary","Vocabulary")}${subRow("complexity","Sentence complexity")}${subRow("comprehensibility","How easy to understand")}</div>
    ${(g.strengths||[]).length ? `<div class="result good">💪 ${g.strengths.map(esc).join(" · ")}</div>` : ""}
    ${g.next_focus ? `<div class="gloss"><b>Next entry, focus on:</b> ${esc(g.next_focus)}</div>` : ""}
  </div>
  <div class="card stack">
    <div class="row between"><h3>Sentence by sentence</h3><span class="small muted">${sents.length - errs} of ${sents.length} correct</span></div>
    ${sents.map(s => s.ok ? `<div class="sent ok"><span class="m">✓</span><span>${esc(s.you)}</span></div>`
      : `<div class="sent no"><span class="m">✏️</span><div class="stack" style="gap:3px"><span class="w">${esc(s.you)}</span><b class="r">${esc(s.fixed)}</b>${s.why ? `<span class="small">${esc(s.why)}</span>` : ""}${s.type ? `<span class="pill tiny">${esc(s.type)}</span>` : ""}</div></div>`).join("")}
  </div>
  ${(g.mistakes||[]).length ? `<div class="card stack"><h3>Your mistake patterns</h3>${g.mistakes.map(m => { const L = MISTAKE_LESSON[m.type]; return `<div class="row between"><span>${esc(m.type)} <b>×${m.count}</b></span>${L ? `<button class="btn sm" type="button" data-lesson="${L}">Practice this</button>` : ""}</div>`; }).join("")}</div>` : ""}
  ${(g.upgrades||[]).length ? `<div class="card stack"><h3>Level up your words</h3>${g.upgrades.map(u => `<div class="fix" style="background:var(--blue-s)"><span>Instead of <i>${esc(u.instead)}</i>, try <b>${esc(u.try)}</b></span><div class="small">${esc(u.why || "")}</div></div>`).join("")}</div>` : ""}
  ${g.corrected ? `<div class="card stack"><div class="row between"><h3>Your entry, corrected</h3><button class="btn sm blue" type="button" data-say="${esc(g.corrected)}">🔊 Hear it</button></div><p class="passage">${esc(g.corrected)}</p><p class="small muted">Read it out loud once. That's speaking practice too.</p></div>` : ""}
  ${live ? rewriteHTML(e) : e.rewrite ? `<div class="card stack"><h3>Your rewrite</h3><p class="passage">${esc(e.rewrite)}</p>${e.rewriteGrade ? `<p><b>${e.rewriteGrade.fixed} fixed</b> · ${esc(e.rewriteGrade.comment || "")}</p>` : ""}</div>` : ""}
  <details class="card"><summary style="cursor:pointer"><b>What you originally wrote</b></summary><p class="passage" style="margin-top:8px">${esc(e.text)}</p></details>`;
}
function rewriteHTML(e){
  if(e.rewriteGrade) return `<div class="card stack"><h3>Step 2: Rewrite ✓</h3><p class="passage">${esc(e.rewrite)}</p><div class="result ${e.rewriteGrade.remaining && e.rewriteGrade.remaining.length ? "bad" : "good"}">${esc(e.rewriteGrade.comment || "")}</div>${(e.rewriteGrade.remaining||[]).map(r => `<div class="fix"><span class="w">${esc(r.you)}</span> → <b class="r">${esc(r.fixed)}</b><div class="small">${esc(r.why || "")}</div></div>`).join("")}<button class="btn pink wide" id="anotherBtn">Write another entry</button></div>`;
  return `<div class="card stack rewrite"><h3>Step 2: Rewrite it from memory</h3><p class="small muted">Close your eyes on the corrections for a second, then rewrite your entry the right way. This is where the learning sticks. It takes about 5 minutes.</p>
    <textarea class="answer" id="rwText" placeholder="Rewrite your entry here…"></textarea><div class="accents" data-for="rwText"></div>
    <div class="row"><button class="btn pink" id="rwBtn">${A.hasSample() ? "Check my rewrite" : "Save my rewrite"}</button><button class="btn ghost" id="skipRw">Skip for today</button></div><div id="rwOut"></div></div>`;
}
function renderResult(root, e, live){
  const todays = graded().filter(x => x.date === todayKey()).length;
  root.innerHTML = `${live ? `<div class="celebrate card"><h2>¡Bien hecho! 🎉</h2><p>Entry ${graded().length} saved${cloud ? "" : " in this browser"}. ${todays === 1 ? "That's your journal for today." : ""}</p></div>` : ""}<div class="stack">${resultHTML(e, live)}</div>`;
  A.wireSay(root);
  root.querySelectorAll("[data-lesson]").forEach(b => b.addEventListener("click", () => A.openLessonById(b.dataset.lesson)));
  if(!live) return;
  if($("rwText")){
    wireAccents(root.querySelector(".rewrite .accents"));
    $("skipRw").addEventListener("click", () => { cur = null; location.hash = "#diario"; });
    $("rwBtn").addEventListener("click", async () => {
      const t = $("rwText").value.trim(); if(countInfo(t).sents < 2) return toast("Rewrite a few sentences first");
      e.rewrite = t;
      if(!A.hasSample()){ e.rewriteGrade = {fixed: 0, remaining: [], comment: "Saved. Compare it with the corrected version above."}; saveEntry(clone(e)); A.addXP(5); return renderResult(root, e, true); }
      $("rwBtn").disabled = true; $("rwBtn").textContent = "Checking…";
      try{
        const r = await A.askJSON(`A high school Spanish student got this journal entry corrected and then rewrote it from memory.
Corrected version: """${e.grade.corrected}"""
Their original mistakes: ${JSON.stringify((e.grade.sentences||[]).filter(s => !s.ok).map(s => ({wrong: s.you, right: s.fixed})))}
Their rewrite: """${t}"""
Return ONLY JSON: {"fixed": how many of the original mistakes they now got right, "remaining": [errors still in the rewrite: {"you": their words, "fixed": correct Spanish, "why": short plain-English reason}], "comment": one encouraging, honest sentence}`, "quick");
        e.rewriteGrade = {fixed: +r.fixed || 0, remaining: r.remaining || [], comment: r.comment || ""};
        saveEntry(clone(e)); A.addXP(10); toast("+10 XP for rewriting");
        renderResult(root, e, true);
      }catch(err){ $("rwBtn").disabled = false; $("rwBtn").textContent = "Check my rewrite"; $("rwOut").innerHTML = `<div class="result bad">${esc(A.aiErr(err).replace(" Here's the automatic check instead.", ""))}</div>`; }
    });
  }
  if($("anotherBtn")) $("anotherBtn").addEventListener("click", () => { cur = null; renderHoy(); window.scrollTo(0,0); });
}

/* ============ DIARIO (journal list) ============ */
function renderDiario(){
  const root = $("diarioArea");
  if(!ready){ root.innerHTML = `<p class="muted">Loading…</p>`; return; }
  const list = graded().slice().reverse();
  root.innerHTML = `<div class="stack">
    <div class="row between"><div><h1>Mi diario</h1><p class="muted">${list.length} entr${list.length === 1 ? "y" : "ies"}${cloud ? " · saved to your account" : " · saved in this browser"}</p></div><a class="btn pink" href="#hoy">✍️ Write</a></div>
    ${list.length ? "" : `<div class="card"><p>No entries yet. Your first one is waiting in <a href="#hoy">Today</a>.</p></div>`}
    ${list.map(e => { const g = e.grade, P = e.free ? ["Free write"] : PROMPTS[e.p]; return `<button class="entry" type="button" data-id="${e.id}">
      <span class="bigscore sm" style="--c:${scoreColor(g.score)}"><b>${g.checklist ? "✓" : g.score}</b></span>
      <span class="stack" style="gap:2px;text-align:left"><b>${esc(P[0])}</b><span class="small muted">${e.free ? "Free write" : `Día ${Math.min(e.day,30)}`} · ${esc(e.date)} · ${esc(g.level || "")}</span><span class="small preview">${esc((e.text || "").slice(0, 110))}${(e.text||"").length > 110 ? "…" : ""}</span></span></button>`; }).join("")}
  </div>`;
  root.querySelectorAll(".entry").forEach(b => b.addEventListener("click", () => {
    const e = entries.find(x => x.id === b.dataset.id); if(!e) return;
    A.openSheet(`<div class="stack">${resultHTML(e, false)}<button class="btn wide" id="shClose">Close</button></div>`);
    A.wireSay($("sheet")); $("shClose").addEventListener("click", A.closeSheet);
    document.querySelectorAll("#sheet [data-lesson]").forEach(x => x.addEventListener("click", () => { A.closeSheet(); A.openLessonById(x.dataset.lesson); }));
  }));
}

/* ============ PALABRAS (word bank) ============ */
let review = null;
const BOX_DAYS = [0, 1, 2, 4, 7, 14];
function dueWords(){ const t = todayKey(); return meta.words.filter(w => (w.due || t) <= t); }
function renderPalabras(){
  const root = $("palabrasArea");
  if(!ready){ root.innerHTML = `<p class="muted">Loading…</p>`; return; }
  if(review) return renderReview(root);
  const due = dueWords();
  root.innerHTML = `<div class="stack">
    <div><h1>My words</h1><p class="muted">Words you looked up and fixes from your grades. Review them so they stick.</p></div>
    <div class="card stack center" style="align-items:center">
      <div class="bigscore" style="--c:var(--pink)"><b>${due.length}</b><span>due</span></div>
      <button class="btn pink" id="startRev" ${due.length ? "" : "disabled"}>${due.length ? `Review ${Math.min(due.length, 20)} words` : "Nothing due. Nice!"}</button>
      <p class="small muted">${meta.words.length} words saved · ${meta.words.filter(w => w.box >= 4).length} mastered</p>
    </div>
    <div class="card stack">
      <h3>Add a word</h3>
      <form class="row" id="addW" autocomplete="off"><input class="answer" id="addEs" placeholder="Spanish" style="flex:1;min-width:120px;font-size:1rem;padding:10px"><input class="answer" id="addEn" placeholder="English" style="flex:1;min-width:120px;font-size:1rem;padding:10px"><button class="btn blue" type="submit">Add</button></form>
    </div>
    <div class="card stack">
      <div class="row between"><h3>All words</h3><input class="answer" id="wFilter" placeholder="Search" style="width:150px;font-size:.95rem;padding:7px 10px"></div>
      <div id="wList"></div>
    </div></div>`;
  const draw = () => { const f = noAcc(($("wFilter").value || "").toLowerCase());
    const ws = meta.words.slice().reverse().filter(w => !f || noAcc((w.es + " " + w.en).toLowerCase()).includes(f));
    $("wList").innerHTML = ws.length ? ws.map(w => `<div class="wrow"><button class="say" type="button" data-say="${esc(w.es)}" aria-label="Hear it">🔊</button><span><b>${esc(w.es)}</b><br><span class="small muted">${esc(w.en)}${w.src === "correction" ? " · from a correction" : ""}</span></span><span class="dots5">${"●".repeat(Math.min(w.box,5))}${"○".repeat(5 - Math.min(w.box,5))}</span><button class="x sm" type="button" data-del="${esc(w.es)}" aria-label="Delete">✕</button></div>`).join("") : `<p class="small muted">No words yet. Look things up while you write, and tap ⭐ to save them.</p>`;
    A.wireSay($("wList"));
    $("wList").querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { meta.words = meta.words.filter(w => w.es !== b.dataset.del); saveMeta(); draw(); }));
  };
  $("wFilter").addEventListener("input", draw); draw();
  $("addW").addEventListener("submit", e => { e.preventDefault(); if(addWord($("addEs").value, $("addEn").value, "manual")){ $("addEs").value = ""; $("addEn").value = ""; draw(); toast("Added"); } });
  if(due.length) $("startRev").addEventListener("click", () => { review = {list: A.shuffle(due).slice(0, 20), i: 0, right: 0, shown: false}; renderPalabras(); });
}
function renderReview(root){
  const r = review;
  if(r.i >= r.list.length){ root.innerHTML = `<div class="card stack center" style="align-items:center"><h1>Done! 🎉</h1><p>${r.right} of ${r.list.length} remembered.</p><button class="btn pink" id="revBack">Back to my words</button></div>`; A.addXP(r.right); saveMeta(); $("revBack").addEventListener("click", () => { review = null; renderPalabras(); }); return; }
  const w = r.list[r.i];
  root.innerHTML = `<div class="stack"><div class="row between"><button class="btn sm" id="revQuit">← Stop</button><span class="pill">${r.i + 1} / ${r.list.length}</span></div>
    <div class="card stack center" style="align-items:center;min-height:220px;justify-content:center"><p class="muted">How do you say…</p><h1>${esc(w.en)}</h1>
      ${r.shown ? `<h2 style="color:var(--pink)">${esc(w.es)}</h2>` : `<input class="answer" id="revIn" placeholder="Type it in Spanish (optional)" style="max-width:360px" autocomplete="off" spellcheck="false">`}</div>
    ${r.shown ? `<div class="row" style="justify-content:center"><button class="btn red" id="revNo">Didn't know it</button><button class="btn green" id="revYes">Knew it</button></div>` : `<button class="btn blue wide" id="revShow">Show answer</button>`}</div>`;
  $("revQuit").addEventListener("click", () => { review = null; saveMeta(); renderPalabras(); });
  if(!r.shown){ const go = () => { r.typed = $("revIn").value; r.shown = true; say(w.es, 0.9); renderReview(root); }; $("revShow").addEventListener("click", go); $("revIn").addEventListener("keydown", e => { if(e.key === "Enter") go(); }); setTimeout(() => $("revIn") && $("revIn").focus(), 50); return; }
  const grade = ok => { const word = meta.words.find(x => x.es === w.es); if(word){ word.box = ok ? Math.min(5, (word.box || 0) + 1) : 0; const d = new Date(); d.setDate(d.getDate() + BOX_DAYS[word.box]); word.due = dkey(d); } if(ok) r.right++; r.i++; r.shown = false; renderReview(root); };
  $("revYes").addEventListener("click", () => grade(true)); $("revNo").addEventListener("click", () => grade(false));
}

/* ============ PROGRESS (journal part) ============ */
function renderJournalProgress(){
  const root = $("jProg"); if(!root) return;
  const g = graded(), real = g.filter(e => !e.grade.checklist);
  const days = new Set(g.map(e => e.free ? null : e.p).filter(x => x != null));
  const avg = k => real.length ? Math.round(real.reduce((s,e) => s + ((e.grade.sub || {})[k] || 0), 0) / real.length) : 0;
  const tally = {}; real.forEach(e => (e.grade.mistakes || []).forEach(m => tally[m.type] = (tally[m.type] || 0) + (+m.count || 0)));
  const top = Object.entries(tally).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const last = real.slice(-12);
  const W = 560, H = 160, x = i => 30 + i * ((W - 50) / Math.max(1, last.length - 1)), y = v => H - 24 - v / 100 * (H - 40);
  let chart = `<line x1="30" x2="${W-10}" y1="${y(70)}" y2="${y(70)}" stroke="#a6e3c1" stroke-width="2" stroke-dasharray="6 5"/><text x="${W-10}" y="${y(70)-5}" text-anchor="end" font-size="11" fill="#2ea763" font-weight="800">Novice High ≈ 70</text>`;
  [0,50,100].forEach(v => chart += `<text x="22" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#9a879f">${v}</text>`);
  if(last.length > 1) chart += `<polyline points="${last.map((e,i) => `${x(i)},${y(e.grade.score)}`).join(" ")}" fill="none" stroke="#ff5fa2" stroke-width="3" stroke-linejoin="round"/>`;
  last.forEach((e,i) => chart += `<circle cx="${x(i)}" cy="${y(e.grade.score)}" r="${i === last.length - 1 ? 6 : 4}" fill="#ff5fa2"><title>${e.date}: ${e.grade.score}</title></circle>`);
  if(last.length) chart += `<text x="${x(last.length-1)}" y="${y(last[last.length-1].grade.score) - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#4a3550">${last[last.length-1].grade.score}</text>`;
  root.innerHTML = `
  <div class="card stack">
    <div class="row between"><h3>30-day journal</h3><span class="pill pinkpill">${days.size} / 30 days</span></div>
    <div class="grid30">${Array.from({length:30}, (_,i) => { const e = g.filter(x => !x.free && x.p === i).slice(-1)[0]; return `<span class="cell ${e ? "on" : ""}" style="${e && !e.grade.checklist ? `background:${scoreColor(e.grade.score)}` : ""}" title="Día ${i+1}${e ? `: ${e.grade.score}` : ""}">${e ? (e.grade.checklist ? "✓" : e.grade.score) : i + 1}</span>`; }).join("")}</div>
    ${days.size >= 30 ? `<div class="result good">🏆 You finished all 30 days. ¡Felicidades!</div>` : ""}
  </div>
  <div class="card stack"><div class="row between"><h3>Your writing score</h3><span class="small muted">last ${last.length} graded entries</span></div>
    ${last.length ? `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Writing scores over time">${chart}</svg>` : `<p class="small muted">Your scores show up here after your first graded entry.</p>`}</div>
  ${real.length ? `<div class="card stack"><h3>Average by skill</h3><div class="grid2">${[["accuracy","Accuracy"],["vocabulary","Vocabulary"],["complexity","Sentence complexity"],["comprehensibility","How easy to understand"]].map(([k,l]) => `<div class="stack" style="gap:4px"><div class="row between small"><span>${l}</span><b>${avg(k)}/25</b></div><div class="ubar"><i style="width:${avg(k)/25*100}%;background:${scoreColor(avg(k)*4)}"></i></div></div>`).join("")}</div>
    <p class="small muted">Your lowest bar is the one to work on.</p></div>` : ""}
  ${top.length ? `<div class="card stack"><h3>Mistakes you make most</h3>${top.map(([t,c]) => { const L = MISTAKE_LESSON[t]; return `<div class="row between"><span>${esc(t)} <b>×${c}</b></span>${L ? `<button class="btn sm" type="button" data-lesson="${L}">Practice</button>` : ""}</div>`; }).join("")}</div>` : ""}`;
  root.querySelectorAll("[data-lesson]").forEach(b => b.addEventListener("click", () => A.openLessonById(b.dataset.lesson)));
}

window.J = {renderHoy, renderDiario, renderPalabras, renderJournalProgress, isReady: () => ready, todayDone: () => graded().some(e => e.date === todayKey())};
init();
})();
