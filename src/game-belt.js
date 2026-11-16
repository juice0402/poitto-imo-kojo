/* ---------- ベルトの上 ---------- */
let pots = [], flies = [], parts = [], coinsFly = [], texts = [], ripples = [];
let T = 0, beltOff = 0, spawnT = .3, feverT = 0, shake = 0, flashBad = 0, lampT = 0, lampGood = true, streamT = 0, goalT = 0, saveT = 0, achT = 0, bumpT = -1;
const walletEl = $('wallet');
const ST = {part:{t:0, anim:0, tx:0, ty:0, who:0}, air:{t:0, anim:0, tx:0, ty:0, who:0}, robo:{t:0, anim:0, tx:0, ty:0, who:0}};
/* 施設の人や機械は、やとった数だけ通路にならぶ（cap まで）。1人目がいつもの場所、あとは上下に交互 */
function stYs(b){ const s = STN_OF[b], n = Math.min(S.bld[b] || 0, s.cap), ys = []; for (let i = 0; i < n; i++){ const k = i ? (i % 2 ? -1 : 1)*Math.ceil(i/2) : 0; ys.push(G.st[b] + k*s.sp); } return ys; }
let titleOn = true;

function pickW(table){
  let tot = 0; const list = []; const lv = farmLv();
  for (const k in table) if (KINDS[k].farm <= lv){ tot += table[k]; list.push([k, table[k]]); }
  let r = Math.random()*tot; for (const [k, w] of list){ if ((r -= w) <= 0) return k; }
  return list[list.length - 1][0];
}
function pickKind(){
  if (Math.random() < D.rareChance) return pickW(RARE_W);
  if (Math.random() < BAD_RATE) return pickW(BAD_W);
  return pickW(GOOD_W);
}
function newPot(kind, x, y){ const [w, h] = ART.size(kind); return {kind, x, y, w, h, bo:Math.random()*5, bp:2.4 + Math.random()*2.8}; }
let tutPot = null, tutSpawnN = 0;
/* はじめのゆっくり：かせいだ合計が1000円になるまで、ベルトはゆっくり・芋は少なめ（0→1でいつもの速さ） */
function warm(){ return Math.min(1, Math.sqrt(Math.max(0, S.stats.earned)/1000)); }
function spawn(){
  let kind = pickKind();
  /* チュートリアル：はじめは ふつう芋2つ → 3つ目にわる芋（ポイッの練習）。それが済むまで、レア芋やほかのわる芋は出さない（ver 2.7：初手にレア芋が出て、レアの説明が先になることがあった） */
  if (!titleOn && !(S.tut & 1)){ if (!tutPot && ++tutSpawnN >= 3) kind = 'me'; else if (KINDS[kind].cat !== 'good') kind = pickW(GOOD_W); }
  const p = newPot(kind, 0, 0), cat = KINDS[kind].cat;
  if (!titleOn && !tutPot && ((cat === 'bad' && !(S.tut & 1)) || (cat === 'rare' && !(S.tut & 2)))){ p.tut = cat; tutPot = p; }
  p.y = -p.h/2 - 1;
  const lo = G.ix0 + p.w/2 + 2, hi = G.ix1 - p.w/2 - 2;
  let best = (lo + hi)/2, bestGap = -1;
  for (let i = 0; i < 8; i++){
    const x = lo + Math.random()*(hi - lo); let gap = 1e9;
    for (const q of pots){ if (q.y > 40) continue; gap = Math.min(gap, Math.hypot(q.x - x, (q.y - p.y)*.9) - (q.w + p.w)/2); }
    if (gap > bestGap){ bestGap = gap; best = x; }
    if (gap > 6) break;
  }
  p.x = best; pots.push(p);
  if (KINDS[kind].cat === 'rare' && !titleOn) SFX.rareIn();
}
function register(kind){
  const first = !(S.found[kind] > 0);
  S.found[kind] = (S.found[kind] || 0) + 1;
  if (first){ recalc(); renderDock(); }
  return first;
}
function addText(x, y, s, col, big){ texts.push({x, y, s, col, big, life:0, max:big ? 1.3 : .9}); }
function puff(x, y, col, n){ for (let i = 0; i < n; i++){ const a = Math.random()*Math.PI*2, sp = 20 + Math.random()*40; parts.push({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 12, life:0, max:.3 + Math.random()*.2, col, s:Math.random() < .4 ? 2 : 1}); } }
function sparkBurst(x, y){ for (let i = 0; i < 8; i++){ const a = i/8*Math.PI*2, sp = 34 + Math.random()*20; parts.push({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:0, max:.55, col:i % 2 ? '#ffe066' : '#ffffff', s:2, spark:true}); } }
function flyOff(p, side){ flies.push({kind:p.kind, x0:p.x, y0:p.y, tx:side < 0 ? -p.w : AW + p.w, ty:p.y - 14 - Math.random()*22, t:0, d:.45, arc:16, spin:10 + Math.random()*6}); }
function flyTo(p, tx, ty, d, done){ flies.push({kind:p.kind, x0:p.x, y0:p.y, tx, ty, t:0, d, arc:26, spin:8, done}); }

function tapAt(ax, ay){
  ripples.push({x:Math.round(ax), y:Math.round(ay), t:0});
  let best = null, bd = 1e9;
  for (const p of pots){ const r = Math.max(p.w, p.h)/2 + 4, d = Math.hypot(p.x - ax, p.y - ay); if (d < r && d < bd){ bd = d; best = p; } }
  if (!best) return;
  pots.splice(pots.indexOf(best), 1);
  if (best === tutPot){ S.tut |= best.tut === 'bad' ? 1 : 2; tutPot = null; save(); }
  const k = KINDS[best.kind], side = best.x < (G.ix0 + G.ix1)/2 ? -1 : 1;
  if (k.cat === 'bad'){
    const v = (D.flickBase + D.flickPct*D.rate)*F(); earn(v); S.stats.flicked++;
    const first = register(best.kind);
    flyOff(best, side); puff(best.x, best.y, '#ffffff', 6);
    addText(best.x, best.y - best.h/2, 'ポイッ +' + fmtR(v), '#ffffff');
    SFX.pop(); shake = Math.max(shake, .06);
    if (first) zukanNew(best.kind);
  } else if (k.cat === 'rare'){
    const v = Math.max(RARE_MIN[k.star], D.rate*F()*RARE_SEC[k.star])*D.rareMult; earn(v); S.stats.rares++;
    const kind = best.kind, first = register(kind);
    sparkBurst(best.x, best.y); SFX.get();
    addText(best.x, best.y - best.h/2 - 2, '+' + fmt(v) + '円', '#ffe27a', true);
    flyTo(best, POS.zukan[0], POS.zukan[1], .6, () => {
      sparkBurst(POS.zukan[0], POS.zukan[1]); restart($('zukanBtn'), 'got');
      if (first) zukanNew(kind); showRarePop(kind, first);
    });
    if (k.star >= 4) startFever(k.star);
  } else {
    S.stats.misses++;
    flyOff(best, side); addText(best.x, best.y - best.h/2, 'あっ、いい芋…', '#dfe7e1'); SFX.oops();
  }
  checkGoal();
}
function ship(p, demo){
  if (demo) return;
  const k = KINDS[p.kind], x = clamp(p.x, G.ix0 + 14, G.ix1 - 14), y = G.gateY;
  if (k.cat === 'bad'){
    const pen = Math.max(2, Math.round(D.linePrice*3 + D.rate));
    S.coins = Math.max(0, S.coins - pen); S.stats.complaints++;
    addText(x, y - 4, 'クレーム -' + fmt(pen), '#ff8a75');
    SFX.bad(); shake = Math.max(shake, .25); flashBad = .6; lampT = .4; lampGood = false; restart($('wallet'), 'hurt');
  } else {
    const v = D.linePrice*F(); earn(v); S.stats.shipped++;
    if (coinsFly.length < 28) coinsFly.push({x0:x, y0:y + 4, t:0, d:.55 + Math.random()*.2, dir:Math.random() < .5 ? -1 : 1, ph:Math.random()*4});
    lampT = .2; lampGood = true;
    if (k.cat === 'good'){ if (register(p.kind)) zukanNew(p.kind); }
    else { toast(`${k.name}が出荷されちゃった…`); addText(x, y - 14, 'のがした…', '#dfe7e1'); }
  }
}
const FEV_NAME = ['フィーバー！', 'スーパーフィーバー！', '黄金フィーバー！', 'ダイヤモンドフィーバー！'];
let feverLv = 0;
function startFever(star){
  const lv = star >= 7 ? 3 : star === 6 ? 2 : star === 5 ? 1 : 0;
  const mul = [D.feverMul, D.feverMul*2, 77, 777][lv], dur = [D.feverDur, D.feverDur + 10, D.feverDur + 10, 15 + Math.max(0, D.feverDur - 20)/2][lv];
  if (feverT <= 0 || mul >= feverM){ feverT = mul > feverM ? dur : Math.max(feverT, dur); feverM = mul; feverLv = lv; }
  S.stats.fevers++;
  if (lv === 1) S.stats.superFevers++; if (lv === 2) S.stats.goldFevers++; if (lv === 3) S.stats.diaFevers++;
  (lv ? SFX.superFever : SFX.fever)(); if (lv >= 2) SFX.get();
  $('fever').hidden = false; $('feverName').textContent = FEV_NAME[feverLv]; $('feverM').textContent = feverM;
  toast(`${FEV_NAME[feverLv]} ${Math.ceil(feverT)}秒間、なにもかも${feverM}倍！`, 'gold');
  if (lv >= 2) restart($('flash'), 'go');
  BGM.fever(true);
}
function beltTick(dt){
  const demo = titleOn;
  if (tutPot && !pots.includes(tutPot)) tutPot = null;
  if (tutPot && tutPot.y >= tutStopY()) return;
  const w = warm(); G.speed = G.run/(12 - 3*w);
  beltOff += G.speed*dt;
  spawnT -= dt;
  if (spawnT <= 0){ spawn(); spawnT += D.interval*(1.4 - .4*w)*(feverT > 0 ? .65 : 1)*(.7 + Math.random()*.6); if (spawnT < .05) spawnT = .05; }
  for (const p of pots){
    p.y += G.speed*dt;
    if (p.kind === 'maru'){ p.x = clamp(p.x + Math.sin(T*2.1 + p.bo*6)*4*dt, G.ix0 + p.w/2 + 1, G.ix1 - p.w/2 - 1); }
    if (p.y - p.h/2 > G.gateY + 1){ p.dead = true; ship(p, demo); }
  }
  for (const s of STN){
    if (!S.bld[s.b]) continue;
    const st = ST[s.b];
    if (st.anim > 0) st.anim -= dt;
    st.t = Math.min(st.t + dt, 60);
    if (st.t < stCd(s.b)) continue;
    const ys = stYs(s.b); let best = null, bd = 1e9, who = 0;
    for (const p of pots){ if (p.dead || p.tut || KINDS[p.kind].cat !== 'bad') continue; for (let i = 0; i < ys.length; i++){ const d = Math.abs(p.y - ys[i]); if (d < s.reach && d < bd){ bd = d; best = p; who = i; } } }
    if (!best) continue;
    st.who = who; st.t = 0; st.anim = s.b === 'robo' ? .36 : .3; st.tx = best.x; st.ty = best.y; best.dead = true;
    flyOff(best, s.side); puff(best.x, best.y, '#ffffff', 4);
    if (!demo){
      const v = D.flickBase*F(); earn(v); S.stats.auto++;
      addText(best.x, best.y - best.h/2, s.speak + ' +' + fmtR(v), '#dff6ff');
      if (register(best.kind)) zukanNew(best.kind);
      if (s.b === 'air') SFX.air(); else SFX.pop2();
    }
  }
  pots = pots.filter(p => !p.dead);
}
function tutStopY(){ return Math.round(AH*.46); }
function fxTick(dt){
  for (const f of flies){ f.t += dt; if (f.t >= f.d){ f.dead = true; if (f.done) f.done(); } }
  flies = flies.filter(f => !f.dead);
  for (const p of parts){ p.life += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += (p.spark ? 30 : 110)*dt; }
  parts = parts.filter(p => p.life < p.max);
  let bump = false;
  for (const c of coinsFly){ c.t += dt; if (c.t >= c.d){ c.dead = true; bump = true; if (!c.quiet) SFX.tick(); } }
  /* お金のコインのぽよん：コインが続けて着いても、0.16秒（ぽよんの長さ）に1回だけ。着くたびにやると、そのたびに画面の計算がやり直しになって重い（ver 2.7） */
  if (bump && T - bumpT >= .16){ bumpT = T; restart(walletEl, 'bump'); }
  coinsFly = coinsFly.filter(c => !c.dead);
  for (const t of texts) t.life += dt;
  texts = texts.filter(t => t.life < t.max);
  for (const r of ripples) r.t += dt;
  ripples = ripples.filter(r => r.t < .22);
  shake = Math.max(0, shake - dt); flashBad = Math.max(0, flashBad - dt); lampT = Math.max(0, lampT - dt);
}
function econTick(dt){
  if (titleOn) return;
  if (feverT > 0){ feverT -= dt; if (feverT <= 0){ feverT = 0; $('fever').hidden = true; toast('フィーバーおわり。おつかれさま！'); BGM.fever(false); } }
  const f = F(), inc = D.cps*f*dt; if (inc > 0) earn(inc);
  S.stats.play += dt;
  if (D.cps > 0 && !paused()){
    streamT += dt*Math.min(4, .5 + Math.log10(1 + D.cps*f)*.7);
    while (streamT >= 1){ streamT -= 1; if (coinsFly.length < 30) coinsFly.push({x0:G.openX0 + Math.random()*G.openW, y0:G.gateY + 11, t:0, d:.7 + Math.random()*.3, dir:Math.random() < .5 ? -1 : 1, ph:Math.random()*4, quiet:true}); }
  }
  goalT += dt; if (goalT > .3){ goalT = 0; checkGoal(); }
  achT += dt; if (achT > .5){ achT = 0; checkAch(); if (canPres() && !S.presNotified){ S.presNotified = true; toast('転生できるよ！ 工場 →「転生」へ', 'gold'); SFX.goal(); save(); } }
  saveT += dt; if (saveT > 5){ saveT = 0; save(); }
}

/* ---------- 描く ---------- */
const ZG = ['####', '..#.', '.#..', '####'];
function drawBelt(){
  const fev = feverT > 0, w = G.ix1 - G.ix0;
  lc.fillStyle = fev ? '#4a4231' : '#3a3f4b'; lc.fillRect(G.ix0, 0, w, AH);
  const off = Math.floor(beltOff) % 8;
  for (let y = off - 8; y < AH; y += 8){ lc.fillStyle = fev ? '#3a3326' : '#2b2f38'; lc.fillRect(G.ix0, y, w, 1); lc.fillStyle = fev ? '#6e5f3b' : '#4b515e'; lc.fillRect(G.ix0, y + 1, w, 1); }
  lc.fillStyle = 'rgba(0,0,0,.28)'; lc.fillRect(G.ix0, 0, 2, AH); lc.fillRect(G.ix1 - 2, 0, 2, AH);
}
function drawPot(p){
  const k = KINDS[p.kind], x0 = Math.round(p.x - p.w/2); let y0 = Math.round(p.y - p.h/2);
  const rare = k.cat === 'rare';
  if (rare){ if (((T*5 + p.bo) | 0) % 2 === 0) lc.drawImage(ART.glow(p.kind), x0 - 1, y0 - 1); if (((T*3 + p.bo) | 0) % 2) y0 -= 1; }
  const blink = ((T + p.bo) % p.bp) < .14;
  if (p.kind === 'obake'){ y0 += Math.round(Math.sin(T*2.6 + p.bo)*1.5); lc.globalAlpha = .88; }
  if (p.kind === 'maboroshi') lc.globalAlpha = .6 + .4*Math.abs(Math.sin(T*1.7 + p.bo));
  if (p.kind === 'yousei' || p.kind === 'seirei' || p.kind === 'ufo') y0 += Math.round(Math.sin(T*2.6 + p.bo)*1.5);
  lc.drawImage(ART.potato(p.kind, blink), x0, y0);
  lc.globalAlpha = 1;
  if (rare) for (let i = 0; i < 2; i++){
    const a = T*2.2 + p.bo*3 + i*Math.PI, fr = [0, 1, 2, 1][((T*8 + i*2 + p.bo*5) | 0) % 4];
    lc.drawImage(ART.sparkle(fr), Math.round(p.x + Math.cos(a)*(p.w/2 + 3)) - 3, Math.round(p.y + Math.sin(a)*(p.h/2 + 3)) - 3);
  }
  if (p.kind === 'kusari'){
    const f = (T*4) | 0; lc.fillStyle = '#b4c873';
    for (const [cx, ph] of [[x0 + 5, 0], [x0 + 12, 1]]) for (let i = 0; i < 4; i++) lc.fillRect(cx + ((i + f + ph) % 2), y0 - 1 - i, 1, 1);
  }
  if (p.kind === 'nemuri'){
    const t = (T*.8 + p.bo) % 1, zx = x0 + p.w - 2 + Math.round(t*3), zy = y0 - 1 - Math.round(t*8);
    lc.globalAlpha = 1 - t;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (ZG[j][i] === '#'){ lc.fillStyle = '#1b2230'; lc.fillRect(zx + i, zy + j + 1, 1, 1); lc.fillStyle = '#eef4ff'; lc.fillRect(zx + i, zy + j, 1, 1); }
    lc.globalAlpha = 1;
  }
}
function arm(x0, y0, x1, y1){
  const n = Math.max(1, Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0);
  for (const [s, c] of [[3, '#2a1d12'], [1, '#f2c230']]){ lc.fillStyle = c; for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0)*i/n), y = Math.round(y0 + (y1 - y0)*i/n); lc.fillRect(x - (s >> 1), y - (s >> 1), s, s); } }
}
function drawStations(){
  const order = ys => ys.map((y, i) => [y, i]).sort((a, b) => a[0] - b[0]);
  if (S.bld.part){
    const st = ST.part, x = G.x0 - 16;
    for (const [y, i] of order(stYs('part'))){
      const act = st.anim > 0 && st.who === i, bob = ((T*2 + i*.37) | 0) % 2;
      lc.fillStyle = '#15171c'; lc.fillRect(x + 4, y + 3, 12, 4); lc.fillStyle = '#8a93a1'; lc.fillRect(x + 5, y + 3, 10, 1); lc.fillStyle = '#5c6370'; lc.fillRect(x + 5, y + 4, 10, 2);
      lc.drawImage(ART.worker(act ? 1 : 0), x, y - 16 + (act ? 0 : bob));
    }
  }
  if (S.bld.air){
    const st = ST.air, x = G.x1 - 3;
    for (const [y, i] of order(stYs('air'))){
      lc.drawImage(ART.airBox(), x, y - 9);
      if (st.anim > 0 && st.who === i){
        const k = 1 - st.anim/.3, nx = x + 1, len = Math.max(4, (nx - st.tx)*Math.min(1, k*1.6));
        lc.globalAlpha = Math.min(1, st.anim/.15); lc.fillStyle = '#dff6ff';
        for (const dy of [-2, 0, 2]){ const l = Math.round(len*(dy ? .75 : 1)); lc.fillRect(Math.round(nx - l), y + dy, l, 1); }
        lc.globalAlpha = 1;
      }
    }
  }
  if (S.bld.robo){
    const st = ST.robo, x = G.x0 - 15;
    for (const [y, i] of order(stYs('robo'))){
      const pvx = x + 8, pvy = y - 3;
      let ex = pvx + 10, ey = pvy - 3;
      if (st.anim > 0 && st.who === i){ const k = Math.sin(Math.PI*(1 - st.anim/.36)); ex = pvx + 10 + (st.tx - pvx - 10)*k; ey = pvy - 3 + (st.ty - pvy + 3)*k; }
      const mx = (pvx + ex)/2, my = Math.min(pvy, ey) - 7;
      lc.drawImage(ART.roboBase(), x, y - 9);
      arm(pvx, pvy, mx, my); arm(mx, my, ex, ey);
      lc.fillStyle = '#2a1d12'; lc.fillRect(Math.round(ex), Math.round(ey) - 3, 3, 7); lc.fillStyle = '#c9cfd8'; lc.fillRect(Math.round(ex) + 1, Math.round(ey) - 2, 1, 2); lc.fillRect(Math.round(ex) + 1, Math.round(ey) + 1, 1, 2);
      lc.fillStyle = '#4fd8f5'; lc.fillRect(Math.round(mx), Math.round(my), 1, 1);
    }
  }
}
function drawFly(f){
  const k = Math.min(1, f.t/f.d), e = 1 - (1 - k)*(1 - k);
  const x = f.x0 + (f.tx - f.x0)*e, y = f.y0 + (f.ty - f.y0)*e - f.arc*4*k*(1 - k), q = Math.floor(f.t*f.spin) % 4;
  const c = ART.potato(f.kind, false);
  lc.save(); lc.translate(Math.round(x), Math.round(y)); lc.rotate(q*Math.PI/2); lc.drawImage(c, -Math.floor(c.width/2), -Math.floor(c.height/2)); lc.restore();
}
function ring(cx, cy, r){
  let x = r, y = 0, e = 1 - r;
  while (x >= y){ for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) lc.fillRect(cx + a, cy + b, 1, 1); y++; if (e < 0) e += 2*y + 1; else { x--; e += 2*(y - x) + 1; } }
}
function drawScene(){
  lc.drawImage(statCv, 0, 0);
  drawBelt();
  lc.globalAlpha = .42; for (const p of pots) lc.drawImage(ART.shadow(p.kind), Math.round(p.x - p.w/2) + 1, Math.round(p.y - p.h/2) + 2); lc.globalAlpha = 1;
  for (const p of pots) drawPot(p);
  if (tutPot && tutPot.y > 0){
    const q = tutPot, f = ART.finger(), bob = ((T*3) | 0) % 2;
    if (q.y >= tutStopY()){ lc.fillStyle = q.tut === 'rare' ? '#ffe066' : '#ffffff'; ring(Math.round(q.x), Math.round(q.y), Math.round(Math.max(q.w, q.h)/2) + 3 + bob); }
    lc.drawImage(f, Math.round(q.x - f.width/2), Math.round(q.y - q.h/2 - f.height - 1 - bob*2));
  }
  drawStations();
  for (const f of flies) drawFly(f);
  lc.fillStyle = 'rgba(255,255,255,.7)'; for (const r of ripples) ring(r.x, r.y, 2 + Math.round(r.t*40));
  for (const p of parts){ lc.globalAlpha = 1 - p.life/p.max; lc.fillStyle = p.col; lc.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
  lc.globalAlpha = 1;
  lc.drawImage(topCv, 0, 0);
  lc.drawImage(gateCv, 0, G.gateY);
  const lampOn = lampT > 0 && ((lampT*20) | 0) % 2 === 0;
  for (const [lx, ly] of [G.lampL, G.lampR]){ lc.fillStyle = lampOn ? (lampGood ? '#7cf27c' : '#ff6a55') : (lampGood ? '#2f6b2f' : '#6b2f2a'); lc.fillRect(lx, G.gateY + ly, 3, 3); if (lampOn){ lc.fillStyle = '#ffffff'; lc.fillRect(lx, G.gateY + ly, 1, 1); } }
  if (flashBad > 0){ lc.globalAlpha = Math.min(1, flashBad/.4); lc.drawImage(redCv, 0, G.gateY - 64); lc.globalAlpha = 1; }
  for (const c of coinsFly){
    const k = Math.min(1, c.t/c.d), e = k*k*(3 - 2*k);
    const x = c.x0 + (POS.wallet[0] - c.x0)*e + Math.sin(k*Math.PI)*14*c.dir, y = c.y0 + (POS.wallet[1] - c.y0)*e;
    lc.drawImage(ART.coin(((T*12 + c.ph) | 0) % 4), Math.round(x) - 4, Math.round(y) - 4);
  }
  if (feverT > 0){
    lc.fillStyle = ((T*6) | 0) % 2 ? '#ffd23f' : '#fff3a0';
    lc.fillRect(0, 0, AW, 2); lc.fillRect(0, AH - 2, AW, 2); lc.fillRect(0, 0, 2, AH); lc.fillRect(AW - 2, 0, 2, AH);
  }
}
function drawOverlay(){
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.font = `16px ${FONT}`; ctx.fillStyle = '#3b2414';
  ctx.fillText('出荷', Math.round(G.plateX*A), Math.round((G.gateY + G.plateY)*A));
  if (!titleOn){
    const lab = [];
    for (const s0 of STN){ const n = (S.bld[s0.b] || 0) - s0.cap; if (n <= 0) continue; const ys = stYs(s0.b), top = Math.min(...ys), bot = Math.max(...ys);
      lab.push(s0.b === 'part' ? [G.x0 - 7, top - 20, n] : s0.b === 'air' ? [G.x1 + 6, top - 14, n] : [G.x0 - 7, bot + 8, n]); }
    for (const [x0, y, n] of lab){ const s = '+' + fmt(n), hw = (8 + 4*(s.length - 1))/A + 2, x = clamp(x0, hw, AW - hw); ctx.lineWidth = 4; ctx.strokeStyle = '#1a120c'; ctx.strokeText(s, Math.round(x*A), Math.round(y*A)); ctx.fillStyle = '#fff3d0'; ctx.fillText(s, Math.round(x*A), Math.round(y*A)); }
  }
  if (tutPot && tutPot.y > 0 && !titleOn){
    const q = tutPot, s = q.tut === 'bad' ? 'タップでポイッ！' : 'キラキラはタップでゲット！', hw = s.length*8/A + 2;
    const x = clamp(q.x, hw, AW - hw), y = q.y - q.h/2 - 22;
    ctx.font = `16px ${FONT}`; ctx.lineWidth = 5; ctx.strokeStyle = '#1a120c'; ctx.strokeText(s, Math.round(x*A), Math.round(y*A));
    ctx.fillStyle = q.tut === 'rare' ? '#ffe27a' : '#ffffff'; ctx.fillText(s, Math.round(x*A), Math.round(y*A));
  }
  for (const t of texts){
    const k = t.life/t.max, x = Math.round(t.x*A), y = Math.round((t.y - k*14)*A);
    ctx.globalAlpha = k < .7 ? 1 : 1 - (k - .7)/.3;
    ctx.font = `${t.big ? 32 : 16}px ${FONT}`;
    ctx.lineWidth = t.big ? 7 : 4; ctx.strokeStyle = '#1a120c'; ctx.strokeText(t.s, x, y);
    ctx.fillStyle = t.col; ctx.fillText(t.s, x, y);
  }
  ctx.globalAlpha = 1;
}
function draw(){
  drawScene();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ox = shake > 0 ? Math.round((Math.random() - .5)*shake*10)*K : 0, oy = shake > 0 ? Math.round((Math.random() - .5)*shake*10)*K : 0;
  if (ox || oy){ ctx.fillStyle = '#15171c'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.drawImage(low, ox, oy, AW*K, AH*K);
  drawOverlay();
}

