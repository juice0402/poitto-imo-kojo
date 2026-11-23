/* ---------- スクショの場面（App Store 用・ver 2.8） ----------
   URL のうしろに #shot=〇〇 をつけると、きまった場面を出す（このときはセーブしない＝遊んでいるデータはそのまま）
   belt：工場がそだったころのベルト／fever：スーパーフィーバー／zukan：図鑑（レア芋）／card:<芋の名前>：芋のカード（ふつうは niko）
   shop：工場（施設）／icon：アプリのアイコン（1024×1024 の画面で撮る）
   ios-kobo の apps/<ゲーム>/app.json の screenshots で、js から location.hash を変えて使う */
let SHOT = '';
/* 1周目の後半くらいの工場（施設11しゅるい・畑4つ・レア芋はおよそ半分） */
function shotState(){
  const s = DEF(); s.tut = 7; s.seenHelp = true; s.sound = false; s.bgm = false; s.presNotified = true;
  const nb = [62, 48, 40, 33, 27, 22, 17, 12, 8, 5, 2];
  BLD.forEach((b, i) => { s.bld[b.id] = nb[i] || 0; });
  Object.assign(s.stats, {shipped:24000, flicked:3200, auto:9000, rares:180, fevers:24, superFevers:5, earned:4e11, earnedRun:4e11, play:34000, blds:276});
  S = s;
  ORDER.forEach((k, i) => { const K = KINDS[k]; if (K.farm > 3 || (K.cat === 'rare' && RARE_W[k] < 1)) return; S.found[k] = 1 + (i*7) % 23; });
  for (let r = 0; r < 4; r++) for (const u of UPG) if (!S.upg[u.id] && u.cost <= 2e11 && u.unlock()) S.upg[u.id] = 1;
  S.stats.upgs = Object.keys(S.upg).length; recalc();
  for (const a of ACH) if (a.v() >= a.n) S.ach[a.id] = 1;
  while (GOALS[S.goal] && GOALS[S.goal].v() >= GOALS[S.goal].n) S.goal++;
  S.achNew = 3; S.znew = ['hoshi'].filter(k => S.found[k]);
  recalc(); S.coins = Math.round(D.cps*2400); disp = S.coins;
}
/* ベルトの上を、しばらく動かしたあとの形に（芋がならび、レア芋が3つ見える） */
function shotBelt(rares){
  pots = []; flies = []; parts = []; coinsFly = []; texts = []; ripples = []; tutPot = null;
  feverT = 0; feverM = 5; feverLv = 0; $('fever').hidden = true;
  titleOn = true; for (let i = 0; i < 260; i++){ beltTick(.05); fxTick(.05); } titleOn = false;
  flies = []; parts = []; texts = [];
  rares.forEach((k, i) => {
    const ty = G.gateY*(.22 + i*.17);
    let best = null; for (const p of pots){ if (KINDS[p.kind].cat === 'rare') continue; if (!best || Math.abs(p.y - ty) < Math.abs(best.y - ty)) best = p; }
    if (best){ const q = newPot(k, best.x, best.y); pots[pots.indexOf(best)] = q; }
  });
}
function shotGo(){
  const m = /^#shot=([a-z]+)(?::([a-z0-9]+))?/.exec(location.hash);
  if (!m || !inited) return;
  SHOT = m[1];
  closeDrawers(true); PAUSE_EL.forEach(e => { e.hidden = true; }); hideRarePop(); holdAchPop();
  $('toast').classList.remove('show'); $('achPop').classList.remove('show'); achQ.length = 0; qDoneQ.length = 0;
  awayPend = null; $('title').hidden = true; titleOn = false;
  if (SHOT === 'icon'){ shotIcon(); return; }
  shotState(); renderDock(); renderAchBadge(); checkGoal(); updateAfford();
  shotBelt(['niko', 'hoshi', 'heart']);
  if (SHOT === 'fever') startFever(5);
  else if (SHOT === 'zukan'){ zkTab = 'rare'; openDrawer('zukan'); }
  else if (SHOT === 'shop'){ shopTab = 'f'; openDrawer('shop'); }
  else if (SHOT === 'card') openCard(KINDS[m[2]] ? m[2] : 'niko', true);
}
window.addEventListener('hashchange', shotGo);
/* アプリのアイコン：にこにこいもを大きく。うしろは葉っぱ色のドットのぼかし＋キラキラ */
function shotIcon(){
  const N = 26, Z = 40, pb = new ART.PB(N, N), nk = ART.potatoPB('niko');
  const cols = ['#cdf6a8', '#a9e888', '#8fd96a'];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
    const r = Math.hypot(x + .5 - N/2, y + .5 - N/2)/(N*.62), v = Math.min(1.999, (r - .45)*3 + BAYER[y % 4][x % 4]/16*.9);
    pb.set(x, y, cols[Math.max(0, Math.floor(v))]);
  }
  const ox = Math.round((N - nk.w)/2), oy = Math.round((N - nk.h)/2);
  pb.ell(N/2, oy + nk.h - .4, 6.6, 1.25, '#7cc95a');
  for (let y = 0; y < nk.h; y++) for (let x = 0; x < nk.w; x++){ const c = nk.get(x, y); if (c) pb.set(ox + x, oy + y, c); }
  /* キラキラはゲームの中と同じ形（大：十字の長いの・小：十字） */
  const sp = (big, cx, cy) => {
    const W = '#ffffff', Y = '#ffe066', a = big ? 3 : 1;
    for (let d = 1; d <= a; d++) for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) pb.set(cx + dx*d, cy + dy*d, big && d < 3 ? W : Y);
    pb.set(cx, cy, W);
  };
  sp(true, 21, 4); sp(false, 4, 7); sp(false, 22, 19);
  const big = pb.canvas(Z), cv2 = document.createElement('canvas'); cv2.width = cv2.height = 1024;
  const g = cv2.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(big, -(N*Z - 1024)/2, -(N*Z - 1024)/2);
  let ov = $('shotIcon'); if (!ov){ ov = document.createElement('div'); ov.id = 'shotIcon'; document.body.appendChild(ov); }
  ov.style.cssText = 'position:fixed;left:0;top:0;width:1024px;height:1024px;z-index:99;background:#8fd96a';
  ov.innerHTML = `<img alt="" src="${cv2.toDataURL()}" style="display:block;width:1024px;height:1024px">`;
}
