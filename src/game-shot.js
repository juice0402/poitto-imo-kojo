/* ---------- スクショの場面（App Store 用・ver 2.8） ----------
   URL のうしろに #shot=〇〇 をつけると、きまった場面を出す（このときはセーブしない＝遊んでいるデータはそのまま）
   belt：工場がそだったころのベルト／fever：スーパーフィーバー／zukan：図鑑（レア芋）／card:<芋の名前>：芋のカード（ふつうは niko）
   shop：工場（施設）／icon：アプリのアイコン（1024×1024 の画面で撮る）
   badge:<実績の id>：Game Center の実績のバッジ（1024×1024・tools/badges.py がぜんぶ撮って docs/kobo/achievements/ に入れる）
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
  if (SHOT === 'badge'){ shotBadge(m[2]); return; }
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
  shotShow(pb, Z, '#8fd96a');
}
/* ドットの板を Z 倍にして、1024×1024 のまん中を画面いっぱいに出す */
function shotShow(pb, Z, bg){
  const big = pb.canvas(Z), cv2 = document.createElement('canvas'); cv2.width = cv2.height = 1024;
  const g = cv2.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(big, -(pb.w*Z - 1024)/2, -(pb.h*Z - 1024)/2);
  let ov = $('shotIcon'); if (!ov){ ov = document.createElement('div'); ov.id = 'shotIcon'; document.body.appendChild(ov); }
  ov.style.cssText = `position:fixed;left:0;top:0;width:1024px;height:1024px;z-index:99;background:${bg}`;
  ov.innerHTML = `<img alt="" src="${cv2.toDataURL()}" style="display:block;width:1024px;height:1024px">`;
}
/* Game Center の実績のバッジ：メダルのまん中に、その実績らしい絵（ゲームのアイコンか芋）。点でメダルの色が変わる（10 銅・25 銀・50 金・100 ダイヤ） */
const BADGE = {
  ship1:['i', 'box', 10], rare1:['p', 'hoshi', 10], fev1:['i', 'star', 10],
  flick2:['i', 'glove', 25], all10:['i', 'factory', 25], earn4:['c', 'coin', 25], sfev:['i', 'bang', 25],
  pres1:['i', 'seed', 50], zt50:['i', 'book', 50], play3:['i', 'time', 50], gfev:['p', 'kin', 50], mabo:['p', 'maboroshi', 50],
  dfev:['p', 'diamond', 100], all20:['i', 'trophy', 100], zkr:['p', 'niji', 100],
};
/* うしろの明るい色・暗い色／メダルのふちの暗い・ふつう・明るい／メダルの面の明るい・暗い */
const BADGE_TIER = {
  10: ['#f7e6d2', '#ecd0b2', '#8a5230', '#c8814a', '#eab182', '#f8dfc4', '#eccaa5'],
  25: ['#eef2f6', '#d8e0e8', '#66717f', '#a7b1bd', '#e2e7ee', '#f3f6f9', '#dde3ea'],
  50: ['#fdf3cf', '#f6e09a', '#a87412', '#ecb526', '#ffe27a', '#fff5d2', '#fbe7a6'],
  100:['#e3f7fd', '#bfeaf7', '#2f7fa8', '#5cc4ea', '#bff0ff', '#f0fcff', '#d2f1fb'],
};
function shotBadge(id){
  const b = BADGE[id] || BADGE.ship1, T = BADGE_TIER[b[2]], N = 32, c = N/2, pb = new ART.PB(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
    const r = Math.hypot(x + .5 - c, y + .5 - c)/(N*.6);
    pb.set(x, y, (r - .5)*3 + BAYER[y % 4][x % 4]/16*.9 > 0 ? T[1] : T[0]);
  }
  /* メダル：外の線・ふち（左上が明るく、右下が暗い）・面 */
  pb.disc(c, c, 13.6, '#3b2a20');
  pb.fill((x, y) => (x-c)**2 + (y-c)**2 <= 12.7**2, T[3]);
  pb.fill((x, y) => (x-c)**2 + (y-c)**2 <= 12.7**2 && (x-c) + (y-c) < -9, T[4]);
  pb.fill((x, y) => (x-c)**2 + (y-c)**2 <= 12.7**2 && (x-c) + (y-c) > 9, T[2]);
  pb.disc(c, c, 10.8, T[2]);
  pb.disc(c, c, 10, T[5]);
  pb.fill((x, y) => (x-c)**2 + (y-c)**2 <= 100 && (x-c) + (y-c) > 6.5, T[6]);
  /* まん中の絵 */
  const sp = b[0] === 'p' ? ART.potatoPB(b[1]) : ART.iconPB(b[1]);
  const put = (dx, dy) => {
    const ox = Math.round((N - sp.w)/2) + dx, oy = Math.round((N - sp.h)/2) + dy;
    for (let y = 0; y < sp.h; y++) for (let x = 0; x < sp.w; x++){ const col = sp.get(x, y); if (col) pb.set(ox + x, oy + y, col); }
  };
  /* 'c' はコインの山（コインは小さいので3まい） */
  if (b[0] === 'c'){ put(0, -4); put(-5, 3); put(5, 3); } else put(0, 0);
  /* キラキラ：金とダイヤだけ（ダイヤは3つ） */
  const kira = (big, cx, cy) => {
    for (let d = 1; d <= (big ? 2 : 1); d++) for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) pb.set(cx + dx*d, cy + dy*d, big && d < 2 ? '#ffffff' : '#ffe066');
    pb.set(cx, cy, '#ffffff');
  };
  if (b[2] >= 50){ kira(true, 26, 4); kira(false, 4, 26); }
  if (b[2] >= 100) kira(false, 28, 22);
  shotShow(pb, 32, T[1]);
}
