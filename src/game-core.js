/* ---------- 状態 ---------- */
const DEF = () => ({coins:0, bld:Object.fromEntries(BLD.map(b => [b.id, 0])), upg:{}, found:{}, ach:{}, achNew:0, goal:0, buy:1, lastSeen:0,
  perk:{}, seeds:0, seedsUsed:0, prestiges:0, kiseki:0, presNotified:false, bgm:true,
  stats:{shipped:0, flicked:0, auto:0, rares:0, complaints:0, misses:0, upgs:0, blds:0, fevers:0, superFevers:0, earned:0, earnedRun:0, play:0, away:0, awayEarned:0, goldFevers:0, diaFevers:0}, sound:true, seenHelp:false, tut:0, znew:[]});
let S = DEF();
function merge(o){
  const d = DEF(); if (!o || typeof o !== 'object') return d;
  d.coins = +o.coins || 0;
  for (const k in d.bld) d.bld[k] = Math.max(0, (o.bld && +o.bld[k]) || 0);
  Object.assign(d.upg, o.upg || {}); Object.assign(d.found, o.found || {}); Object.assign(d.ach, o.ach || {});
  d.achNew = Math.max(0, o.achNew | 0); d.lastSeen = +o.lastSeen || 0;
  Object.assign(d.perk, o.perk || {}); d.seeds = Math.max(0, +o.seeds || 0); d.seedsUsed = Math.max(0, +o.seedsUsed || 0); d.prestiges = Math.max(0, o.prestiges | 0); d.kiseki = Math.max(0, o.kiseki | 0);
  d.presNotified = !!o.presNotified; d.bgm = o.bgm !== false;
  for (const k in d.stats) d.stats[k] = (o.stats && +o.stats[k]) || 0;
  if (!o.stats || o.stats.earnedRun == null) d.stats.earnedRun = d.stats.earned;
  d.goal = o.goal | 0; d.buy = [1, 10, 100].includes(o.buy) ? o.buy : 1; d.sound = o.sound !== false; d.seenHelp = !!o.seenHelp;
  d.znew = Array.isArray(o.znew) ? o.znew.filter(k => KINDS[k] && d.found[k] > 0) : [];
  d.tut = o.tut == null ? ((o.stats && (+o.stats.shipped || +o.stats.flicked)) ? 7 : 0) : (o.tut | 0);
  return d;
}
function load(){
  try{
    const raw = localStorage.getItem(KEY); if (raw) return merge(JSON.parse(raw));
    const old = localStorage.getItem(OLD);
    if (old){ const v = JSON.parse(old), d = DEF(); Object.assign(d.found, v.found || {}); const st = v.stats || {};
      for (const k of ['shipped','flicked','rares','complaints','misses']) d.stats[k] = +st[k] || 0;
      d.sound = v.sound !== false; return d; }
  }catch(e){}
  return null;
}
function save(){ if (SHOT) return; S.lastSeen = Date.now(); try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
const foundCount = () => ORDER.filter(k => S.found[k] > 0).length;
const farmLv = () => { let n = 0; for (const f of FARM_IDS){ if (!S.upg[f]) break; n++; } return n; };

/* ---------- 計算 ---------- */
const D = {mult:{}, bcps:{}};
function recalc(){
  let cps = 0;
  for (const b of BLD){ let m = 1; for (let i = 1; i <= TIER_NEED.length; i++) if (S.upg[b.id + i]) m *= 2; D.mult[b.id] = m; D.bcps[b.id] = b.cps*S.bld[b.id]*m; cps += D.bcps[b.id]; }
  D.zkp = S.upg.zk2 ? .04 : S.upg.zk1 ? .03 : .02; D.achp = S.upg.boss ? .02 : .01;
  D.seedMul = seedMulOf(S.seeds);
  D.perkMul = Math.pow(10, S.kiseki)*(S.perk.kago1 ? 1.25 : 1)*(S.perk.kago2 ? 1.5 : 1)*(S.perk.kago3 ? 2 : 1)*(S.perk.kago4 ? 3 : 1)*(S.perk.kago5 ? 5 : 1)*(S.perk.kago6 ? 10 : 1)*(S.perk.kago7 ? 20 : 1);
  const ac = achCount(), milk = ac*.04*(S.perk.nekote ? 1.5 : 1);
  D.catMul = CATS.reduce((m, c) => S.upg[c[0]] ? m*(1 + milk*c[4]) : m, 1);
  D.zk = (1 + D.zkp*foundCount())*(1 + D.achp*ac)*D.seedMul*D.perkMul*D.catMul;
  D.cps = cps*D.zk;
  D.linePrice = (S.upg.box1 ? 2 : 1)*(S.upg.box2 ? 2 : 1)*(S.upg.box3 ? 3 : 1)*(S.upg.box4 ? 3 : 1)*D.zk;
  D.flickBase = (S.upg.tap1 ? 2 : 1)*(S.upg.tap2 ? 2 : 1);
  D.flickPct = (S.upg.tap3 ? .01 : 0) + (S.upg.tap4 ? .02 : 0) + (S.upg.tap5 ? .04 : 0) + (S.upg.tap6 ? .08 : 0);
  D.rareChance = Math.min(.2, .025*(S.upg.rare1 ? 1.5 : 1)*(S.upg.rare2 ? 1.5 : 1)*(S.upg.rare4 ? 1.5 : 1)*(S.perk.jouro ? 1.25 : 1)*(S.perk.manako ? 1.5 : 1)*(1 + .02*S.bld.lab));
  D.rareMult = (S.upg.rare3 ? 2 : 1)*(S.upg.rare5 ? 2 : 1);
  D.interval = Math.max(.5, 1.6*Math.pow(.93, S.bld.hatake));
  D.feverDur = 20 + (S.upg.fever1 ? 10 : 0) + (S.perk.matsuri ? 10 : 0) + (S.perk.matsuri2 ? 20 : 0);
  D.feverMul = S.upg.fever2 ? 7 : 5;
  /* ふつう芋の割合は、レアでない（1-レア）× わるでない（1-わる）。芋の決め方 pickKind と同じ（ver 2.7） */
  D.lineRate = (1 - D.rareChance)*(1 - BAD_RATE)/(D.interval*(1.4 - .4*warm()))*D.linePrice;
  D.rate = D.cps + D.lineRate;
}
let feverM = 5;
const F = () => feverT > 0 ? feverM : 1;
const bldCost = (b, n) => Math.ceil(b.cost*Math.pow(GROW, S.bld[b.id])*(Math.pow(GROW, n) - 1)/(GROW - 1));
const stCd = b => Math.max(.3, STN_OF[b].base/Math.sqrt(S.bld[b])/Math.sqrt(D.mult[b])/(S.perk.jidou ? 1.5 : 1));
function earn(v){ S.coins += v; S.stats.earned += v; S.stats.earnedRun += v; }

/* ---------- 数字 ---------- */
function fmt(n){
  n = Math.floor(Math.max(0, n));
  if (n < 1e4) return NF.format(n);
  if (!isFinite(n)) return '∞';
  /* 無量大数の上は「〇万無量大数」まで。1億無量大数（10^76）からは ×10^（企画メモのとおり・ver 2.7） */
  if (n >= 1e76) return n.toExponential(2).replace('e+', '×10^');
  if (n >= 1e72) return fmt(n/1e68) + '無量大数';
  for (const [v, u] of UNITS) if (n >= v){ const x = n/v; let s = x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : NF.format(Math.floor(x)); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s + u; }
  return String(n);
}
function fmtR(n){ if (n < 10){ const s = (Math.round(n*10)/10).toFixed(1); return s.endsWith('.0') ? s.slice(0, -2) : s; } return fmt(n); }
function fmtTime(s){ s = Math.floor(s); const h = Math.floor(s/3600), m = Math.floor(s/60) % 60; return h ? `${h}時間${m}分` : `${m}分`; }

/* ---------- 画面の大きさ ---------- */
let DPR = 1, K = 3, A = 3, AW = 130, AH = 280, SAFE_B = 0, inited = false;
const G = {};
const POS = {wallet:[18, 12], zukan:[16, 250]};
let statCv, topCv, gateCv, redCv;
const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function mk(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; }
function resize(){
  const w = Math.max(240, window.innerWidth), h = Math.max(320, window.innerHeight);
  DPR = Math.min(3, window.devicePixelRatio || 1);
  const per = clamp(Math.floor(Math.min(w/118, h/230)), 2, 4);
  const nk = Math.max(1, Math.round(DPR*per)), scaleChanged = nk !== K || !inited;
  K = nk; A = K/DPR;
  cv.width = Math.round(w*DPR); cv.height = Math.round(h*DPR); cv.style.width = w + 'px'; cv.style.height = h + 'px';
  AW = Math.ceil(cv.width/K); AH = Math.ceil(cv.height/K);
  low.width = AW; low.height = AH; lc.imageSmoothingEnabled = false; ctx.imageSmoothingEnabled = false;
  root.style.setProperty('--px', A + 'px');
  root.style.setProperty('--ux', Math.max(1, Math.round(DPR*A*2/3))/DPR + 'px');
  SAFE_B = Math.ceil(($('probeB').offsetHeight || 0)/A);
  const oldGate = G.gateY;
  layout(); buildStatic();
  /* 画面の大きさが変わったら（スマホのアドレスバー・向き）、ベルトの上の芋も同じ割合で動かす。そのままだと出口より下になった芋が、すぐ出荷（わる芋ならクレーム）になっていた（ver 2.7） */
  if (inited && oldGate > 0 && oldGate !== G.gateY){ const k = G.gateY/oldGate; for (const p of pots){ p.y *= k; p.x = clamp(p.x, G.ix0 + p.w/2 + 1, G.ix1 - p.w/2 - 1); } }
  if (scaleChanged && inited) refreshImages();
  cachePos(); requestAnimationFrame(cachePos);
}
function layout(){
  const RAIL = 8, WALK = 14, inner = Math.min(AW - RAIL*2 - WALK*2, 128);
  G.x0 = Math.floor((AW - inner - RAIL*2)/2); G.ix0 = G.x0 + RAIL; G.ix1 = G.ix0 + inner; G.x1 = G.ix1 + RAIL;
  G.gateH = 26; G.gateY = AH - SAFE_B - G.gateH;
  G.run = G.gateY + 24; G.speed = G.run/9;
  G.st = {part:Math.round(AH*.42), air:Math.round(AH*.57), robo:Math.round(AH*.705)};
}
function cachePos(){
  const a = $('walletCoin').getBoundingClientRect(); if (a.width) POS.wallet = [(a.left + a.width/2)/A, (a.top + a.height/2)/A];
  const b = $('zukanBtn').getBoundingClientRect(); if (b.width) POS.zukan = [(b.left + b.width/2)/A, (b.top + b.height/2)/A];
}
function rail(g, x, mir){
  const cols = ['#15171c','#525a67',null,null,null,'#a3abb7','#666e7b','#20232a'];
  for (let c = 0; c < 8; c++){
    const cx = x + (mir ? 7 - c : c);
    if (cols[c]){ g.fillStyle = cols[c]; g.fillRect(cx, 0, 1, AH); continue; }
    for (let y = 0; y < AH; y++){ g.fillStyle = ((y + (mir ? 6 - c : c)) % 8) < 4 ? '#f0c030' : '#2b2b2b'; g.fillRect(cx, y, 1, 1); }
  }
  const bx = x + (mir ? 6 : 1);
  for (let y = 10; y < AH; y += 28){ g.fillStyle = '#c9cfd8'; g.fillRect(bx, y, 1, 1); g.fillStyle = '#2c3038'; g.fillRect(bx, y + 1, 1, 1); }
}
function buildStatic(){
  let g;
  [statCv, g] = mk(AW, AH);
  if (G.x0 > 0 || G.x1 < AW){
    g.fillStyle = '#1e232a'; g.fillRect(0, 0, AW, AH);
    g.fillStyle = '#272d36';
    for (let y = 0; y < AH; y += 12){ g.fillRect(0, y, AW, 1); for (let x = ((y/12) % 2)*6; x < AW; x += 12) g.fillRect(x, y, 1, 12); }
  }
  rail(g, G.x0, false); rail(g, G.ix1, true);
  [topCv, g] = mk(AW, 26);
  g.fillStyle = '#0c0e12';
  for (let y = 0; y < 26; y++) for (let x = G.ix0; x < G.ix1; x++) if (BAYER[y % 4][x % 4] < (1 - y/26)*17) g.fillRect(x, y, 1, 1);
  g.fillStyle = '#4b5260'; g.fillRect(G.x0, 0, G.x1 - G.x0, 3); g.fillStyle = '#7b8492'; g.fillRect(G.x0, 3, G.x1 - G.x0, 1); g.fillStyle = '#15171c'; g.fillRect(G.x0, 4, G.x1 - G.x0, 1);
  const gh = AH - G.gateY;
  [gateCv, g] = mk(AW, gh);
  g.fillStyle = '#20232a'; g.fillRect(0, 0, AW, 1);
  g.fillStyle = '#7b8390'; g.fillRect(G.ix0, 1, G.ix1 - G.ix0, 1);
  g.fillStyle = '#4a515d'; g.fillRect(G.ix0, 2, G.ix1 - G.ix0, 1);
  for (let y = 3; y < 6; y++) for (let x = 0; x < AW; x++){ g.fillStyle = ((x + y) % 8) < 4 ? '#f0c030' : '#2b2b2b'; g.fillRect(x, y, 1, 1); }
  g.fillStyle = '#15171c'; g.fillRect(0, 6, AW, 1);
  g.fillStyle = '#4b5260'; g.fillRect(0, 7, AW, gh - 7);
  g.fillStyle = '#6f7886'; g.fillRect(0, 7, AW, 1);
  g.fillStyle = '#3c424d'; for (let x = 12; x < AW; x += 24) g.fillRect(x, 8, 1, gh - 8);
  const cx = Math.round(AW/2), ow = Math.min(64, Math.round((G.ix1 - G.ix0)*.5)), ox = cx - (ow >> 1);
  G.openX0 = ox; G.openW = ow;
  g.fillStyle = '#2a2e36'; g.fillRect(ox - 1, 8, ow + 2, 8);
  g.fillStyle = '#0e1014'; g.fillRect(ox, 8, ow, 7);
  g.fillStyle = '#05060a'; g.fillRect(ox, 8, ow, 1);
  const pw = 30, px = cx - pw/2, py = 17;
  G.plateX = cx; G.plateY = py + 4; G.lampL = [px - 6, py + 2]; G.lampR = [px + pw + 3, py + 2];
  g.fillStyle = '#15171c'; g.fillRect(px - 1, py - 1, pw + 2, 10);
  g.fillStyle = '#efe3c3'; g.fillRect(px, py, pw, 8);
  g.fillStyle = '#ffffff'; g.fillRect(px, py, pw, 1);
  g.fillStyle = '#cdbb92'; g.fillRect(px, py + 7, pw, 1);
  for (const [lx, ly] of [G.lampL, G.lampR]){ g.fillStyle = '#15171c'; g.fillRect(lx - 1, ly - 1, 5, 5); }
  [redCv, g] = mk(AW, 64);
  g.fillStyle = '#e2553f';
  for (let y = 0; y < 64; y++) for (let x = 0; x < AW; x++) if (BAYER[y % 4][x % 4] < (y/64)*11) g.fillRect(x, y, 1, 1);
}

/* ---------- ドット絵を画面の部品に ---------- */
const urlCache = {};
function pix(key, make, cssPer){
  const ds = Math.max(1, Math.round(DPR*cssPer)), ck = key + '@' + ds;
  let e = urlCache[ck];
  if (!e){ const pb = make(); e = urlCache[ck] = {src:pb.canvas(ds).toDataURL(), w:pb.w*ds/DPR, h:pb.h*ds/DPR}; }
  return e;
}
const icoPB = n => () => ART.iconPB(n);
function img(key, make, cssPer, cls = ''){ const e = pix(key, make, cssPer); return `<img class="pi ${cls}" src="${e.src}" style="width:${e.w}px;height:${e.h}px" alt="">`; }
function setImg(el, key, make, cssPer){ const e = pix(key, make, cssPer); el.src = e.src; el.style.width = e.w + 'px'; el.style.height = e.h + 'px'; }
const coinImg = () => img('i:coin', icoPB('coin'), Math.max(1.5, A*.67), 'ci');
function refreshImages(){
  document.querySelectorAll('img[data-icon]').forEach(el => setImg(el, 'i:' + el.dataset.icon, icoPB(el.dataset.icon), A*(+el.dataset.s || 1)));
  renderTitlePots();
  renderSound();
  if (openDr === 'shop') setShopTab(shopTab);
  if (openDr === 'zukan') renderZukan();
}

/* ---------- 音（コードで作る） ---------- */
let AC = null;
function ensureAudio(){ if (!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ AC = null; } } if (AC && AC.state === 'suspended' && !document.hidden) AC.resume().catch(() => {}); if (AC) BGM.start(); }
function tone(f, dur, type, vol, slide, when){
  if (!S.sound || !AC) return;
  const t0 = AC.currentTime + (when || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
  if (slide && slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(40, f*slide), t0 + dur);
  g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .05, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + dur + .03);
}
let lastTick = 0;
const SFX = {
  pop:   () => tone(880, .07, 'square', .05, .5),
  pop2:  () => tone(700, .05, 'square', .025, .6),
  oops:  () => tone(330, .14, 'triangle', .1, .7),
  bad:   () => { tone(170, .2, 'square', .06, .7); tone(120, .2, 'square', .04, .8, .08); },
  rareIn:() => { tone(1568, .06, 'square', .03); tone(2093, .08, 'square', .025, 1, .06); },
  get:   () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, .09, 'square', .045, 1, i*.05)),
  build: () => { tone(523, .06, 'square', .05); tone(784, .06, 'square', .05, 1, .05); tone(1047, .12, 'square', .05, 1, .1); },
  upg:   () => [659, 880, 1109, 1319].forEach((f, i) => tone(f, .08, 'triangle', .09, 1, i*.06)),
  goal:  () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .1, 'square', .045, 1, i*.07)),
  fever: () => [523, 784, 1047, 784, 1047, 1568].forEach((f, i) => tone(f, .1, 'square', .05, 1, i*.07)),
  air:   () => tone(1200, .12, 'sawtooth', .012, .3),
  open:  () => tone(660, .05, 'square', .025, 1.4),
  sel:   () => tone(1200, .03, 'square', .025),
  no:    () => tone(220, .1, 'square', .04),
  tick:  () => { const n = performance.now(); if (n - lastTick > 90){ lastTick = n; tone(2600, .02, 'square', .008); } },
  seed:  () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .12, 'triangle', .1, 1, i*.07)),
  prestige: () => { [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .14, 'square', .04, 1, i*.09)); [523, 659, 784, 1047].forEach(f => tone(f, .9, 'triangle', .07, 1, .7)); },
  superFever: () => { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .1, 'square', .05, 1, i*.06)); tone(2093, .4, 'triangle', .08, 1, .5); },
};

/* ---------- BGM（コードで作る・ほのぼの） ---------- */
const BGM = (() => {
  const NN = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
  const midi = t => { const m = /^([A-G])(b|#)?(\d)$/.exec(t); return 12*(+m[3] + 1) + NN[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0); };
  const hz = m => 440*Math.pow(2, (m - 69)/12);
  const seq = str => str.trim().split(/\s+/).map(t => t === '.' ? 0 : t === '-' ? -1 : midi(t));
  const CH = {F:['F3','A3','C4'], C:['C3','E3','G3'], CE:['E3','G3','C4'], Dm:['D3','F3','A3'], Bb:['Bb2','D3','F3'], Am:['A2','C3','E3'], Gm:['G2','Bb2','D3'], C7:['C3','E3','Bb3']};
  const mk = (bpm, style, chords, lead) => ({bpm, style, chords:chords.split(' ').map(c => CH[c].map(midi)), lead:seq(lead)});
  const TR = {
    main: mk(92, 'calm', 'F CE Dm Bb F Bb C C7 Bb C Am Dm Gm C F F', `
      A4 - C5 - A4 G4 F4 -   G4 - - - E4 . C4 .   F4 - A4 - D5 - C5 A4   Bb4 - A4 G4 F4 - D4 .
      C4 F4 A4 - G4 F4 A4 -  Bb4 - D5 - C5 Bb4 A4 G4  A4 - G4 - E4 - G4 -   C5 - - - - - . .
      D5 - C5 Bb4 A4 - Bb4 - C5 - Bb4 A4 G4 - E4 -  A4 - G4 F4 E4 - C4 -   D4 - F4 - A4 - D5 -
      Bb4 - A4 - G4 - D4 -   E4 - G4 - C5 - Bb4 -   A4 - - G4 F4 - C4 -    F4 - - - - - . .`),
    fever: mk(138, 'fever', 'F Bb C F Dm Bb C C', `
      C5 A4 C5 F5 E5 C5 A4 C5   D5 Bb4 D5 F5 E5 D5 C5 Bb4   C5 - E5 - G5 - E5 C5   F5 - C5 - A4 - F4 -
      D5 F5 A5 F5 D5 A4 F4 A4   Bb4 D5 F5 D5 Bb4 F4 D4 F4   E5 - G5 - C6 - Bb5 -   A5 - G5 - E5 - C5 -`),
  };
  const VOL = .42;
  let out = null, nb = null, timer = 0, cur = 'main', pend = null, swAt = 0, step = 0, next = 0;
  function env(o, g, t, a, v, d){ g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .05); }
  function osc(type, f, t, d, v, a = .01){ const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); env(o, g, t, a, v, d); return o; }
  function noise(t, d, v, f, type){ const n = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); n.buffer = nb; fl.type = type; fl.frequency.value = f; n.connect(fl); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); fl.connect(g); g.connect(out); n.start(t); n.stop(t + d + .02); }
  function kick(t, v){ const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12); env(o, g, t, .004, v, .16); }
  function play(tr, i, t, sd){
    const bar = Math.floor(i/8), b = i % 8, ch = tr.chords[bar % tr.chords.length], m = tr.lead[i];
    if (m > 0){ let n = 1; while (tr.lead[(i + n) % tr.lead.length] === -1 && n < 16) n++;
      const d = n*sd*.92;
      if (tr.style === 'calm'){ osc('triangle', hz(m), t, d, .2, .012); osc('square', hz(m + 12), t, Math.min(d, .18), .012); }
      else { osc('square', hz(m), t, d, .045, .006); osc('triangle', hz(m - 12), t, d, .07, .006); } }
    if (tr.style === 'calm'){
      if (b === 0) osc('triangle', hz(ch[0] - 12), t, sd*1.8, .22);
      if (b === 4) osc('triangle', hz(ch[2] - 12), t, sd*1.8, .18);
      if (b % 2) osc('square', hz(ch[b % 4 === 1 ? 1 : 2] + 12), t, .09, .016);
      if (b === 0 || b === 4) kick(t, .22);
      if (b === 2 || b === 6) noise(t, .04, .03, 7000, 'highpass');
    } else {
      osc('triangle', hz(ch[0] - (b % 2 ? 0 : 12)), t, sd*.8, .2);
      osc('square', hz(ch[b % 3] + 24), t, .06, .012);
      if (b % 2 === 0) kick(t, .26);
      if (b % 2) noise(t, .04, .035, 7000, 'highpass');
      if (b === 2 || b === 6) noise(t, .1, .06, 1800, 'bandpass');
    }
  }
  function tick(){
    if (!AC || !out || AC.state !== 'running') return;
    const now = AC.currentTime;
    if (pend && now >= swAt){ cur = pend; pend = null; step = 0; next = now + .05; out.gain.cancelScheduledValues(now); out.gain.setValueAtTime(.0001, now); out.gain.exponentialRampToValueAtTime(S.bgm ? VOL : .0001, now + .4); }
    if (next < now - .3) next = now + .05;
    const tr = TR[pend ? cur : cur], sd = 60/tr.bpm/2;
    while (next < now + .15){ if (S.bgm && !pend) play(tr, step, next, sd); next += sd; step = (step + 1) % tr.lead.length; }
  }
  return {
    start(){
      if (!AC || out) return;
      out = AC.createGain(); out.gain.value = .0001;
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400; out.connect(lp); lp.connect(AC.destination);
      nb = AC.createBuffer(1, AC.sampleRate*.5, AC.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
      next = AC.currentTime + .1; out.gain.exponentialRampToValueAtTime(S.bgm ? VOL : .0001, AC.currentTime + 1.2);
      timer = setInterval(tick, 30);
    },
    fever(on){ const want = on ? 'fever' : 'main'; if (!AC || !out){ cur = want; return; } if (want === (pend || cur)) return; pend = want; swAt = AC.currentTime + .35; out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(Math.max(.0001, out.gain.value), AC.currentTime); out.gain.exponentialRampToValueAtTime(.0001, swAt); },
    set(on){ if (!AC || !out) return; const t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(.0001, out.gain.value), t); out.gain.exponentialRampToValueAtTime(on ? VOL : .0001, t + .5); },
    resync(){ if (AC) next = AC.currentTime + .08; },
  };
})();

