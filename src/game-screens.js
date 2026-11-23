/* 図鑑（左） */
let zkTab = 'rare';
const CAT_NAME = {rare:'レア', good:'ふつう', bad:'わる'};
function renderZukan(){
  const fc = foundCount();
  $('zkCount').textContent = `${fc}/${ORDER.length}`; $('zkBonus').textContent = Math.round(fc*D.zkp*100); $('zkFill').style.width = (fc/ORDER.length*100) + '%';
  document.querySelectorAll('#zkTabs button').forEach(b => {
    const ks = ORDER.filter(k => KINDS[k].cat === b.dataset.c), n = ks.filter(k => S.found[k] > 0).length;
    b.innerHTML = `<span>${CAT_NAME[b.dataset.c]}</span> <span>${n}/${ks.length}</span>${b.dataset.c !== zkTab && ks.some(k => S.znew.includes(k)) ? '<span class="tdot"></span>' : ''}`; b.setAttribute('aria-pressed', String(b.dataset.c === zkTab));
  });
  const lv = farmLv();
  $('zkGrid').innerHTML = ORDER.filter(k => KINDS[k].cat === zkTab).sort((a, b) => KINDS[a].farm - KINDS[b].farm || (KINDS[a].star || 0) - (KINDS[b].star || 0)).map(k => {
    const kk = KINDS[k], f = S.found[k] > 0;
    const sub = f ? `みつけた ${S.found[k]}` : kk.farm > lv ? `${FARMS[kk.farm]}で` : 'みつけてない';
    return `<button type="button" class="zcell pix fine${f ? '' : ' unk'}" data-k="${k}" data-r="${kk.star || 0}"${f ? '' : ' aria-disabled="true"'}>${S.znew.includes(k) ? '<span class="znw">NEW</span>' : ''}
      <span class="zimg">${(sc => f ? img('p:' + k + sc, () => ART.potatoPB(k), sc) : img('s:' + k + sc, () => ART.silPB(k), sc))(Math.max(...ART.size(k)) > 19 ? 3 : 4)}</span>
      <span class="zn fit">${f ? kk.name : '？？？'}</span><span class="zs">${kk.star ? '★'.repeat(kk.star) : ''}</span><span class="zc fit">${sub}</span></button>`;
  }).join('');
  fitText($('zkGrid'));
  if (S.znew.length){ S.znew = S.znew.filter(k => KINDS[k].cat !== zkTab); renderDock(); }
}
$('zkTabs').addEventListener('click', e => { const b = e.target.closest('button[data-c]'); if (!b) return; zkTab = b.dataset.c; SFX.sel(); renderZukan(); });
$('zkGrid').addEventListener('click', e => { const c = e.target.closest('.zcell'); if (c && S.found[c.dataset.k] > 0){ ensureAudio(); openCard(c.dataset.k, false); } });

/* 横から出る画面 */
let openDr = null;
const DR = {shop:[$('shopDrawer'), $('shopBtn')], zukan:[$('zukanDrawer'), $('zukanBtn')]};
function openDrawer(name){
  closeDrawers(true);
  $('toast').classList.remove('show'); holdAchPop(); $('achPop').classList.remove('show'); hideRarePop();
  const [dr, btn] = DR[name];
  openDr = name;
  if (name === 'shop') setShopTab(shopTab); else { if (S.znew.length && !S.znew.some(k => KINDS[k].cat === zkTab)) zkTab = KINDS[S.znew[0]].cat; renderZukan(); }
  dr.inert = false; dr.setAttribute('aria-hidden', 'false'); dr.classList.add('open');
  $('scrim').classList.add('on'); btn.setAttribute('aria-expanded', 'true'); SFX.open();
  setTimeout(() => { dr.focus({preventScroll:true}); }, 60);
}
function closeDrawers(silent){
  const was = openDr;
  for (const n in DR){ const [dr, btn] = DR[n]; dr.classList.remove('open'); dr.inert = true; dr.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); }
  $('scrim').classList.remove('on'); openDr = null;
  if (was && !silent) DR[was][1].focus({preventScroll:true});
  /* 引き出しの中で出ていたお知らせは、閉じたらいったん消す。大事なもの（new・gold）は画面でもう一度ちゃんと出す */
  if (was && !silent && toastOn()){
    $('toast').classList.remove('show'); clearTimeout(toastTimer);
    const lt = lastToast; if (lt && (lt.kind === 'new' || lt.kind === 'gold')) toastTimer = setTimeout(() => { if (!openDr) toast(lt.msg, lt.kind); }, 350);
  }
}
$('shopBtn').addEventListener('click', () => { ensureAudio(); openDrawer('shop'); });
$('zukanBtn').addEventListener('click', () => { ensureAudio(); openDrawer('zukan'); });
$('shopClose').addEventListener('click', () => closeDrawers());
$('zukanClose').addEventListener('click', () => closeDrawers());
$('scrim').addEventListener('click', () => closeDrawers());
for (const [dr, dir] of [[$('shopDrawer'), 1], [$('zukanDrawer'), -1]]){
  let sx = 0, sy = 0, on = false;
  dr.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; on = true; });
  dr.addEventListener('pointerup', e => { if (!on) return; on = false; const dx = (e.clientX - sx)*dir, dy = Math.abs(e.clientY - sy); if (dx > 70 && dx > dy*1.5) closeDrawers(); });
  dr.addEventListener('pointercancel', () => { on = false; });
}

/* カード・あそびかた・メニュー */
const BAND = {good:'#9fdc7a', bad:'#d9a68a', 2:'#8fd0f5', 3:'#c3adf5', 4:'#ffd23f', 5:'linear-gradient(90deg,#ff9aa8,#ffe887,#8fd2f4,#b9a2f4)', 6:'linear-gradient(90deg,#fff2a0,#ffcd3c,#d8901a,#ffcd3c)', 7:'linear-gradient(90deg,#e6f8ff,#9fd8f5,#ffffff,#9fd8f5,#e6f8ff)'};
const CAT_LABEL = {good:'ふつう芋・そのまま出荷', bad:'わる芋・タップでポイッ', rare:'レア芋・タップでゲット'};
function openCard(kind, isNew){
  const k = KINDS[kind], [w, h] = ART.size(kind);
  $('cardBand').style.background = BAND[k.star || k.cat];
  $('cardBadge').hidden = !isNew; $('cardImg').parentElement.classList.toggle('solo', !isNew);
  setImg($('cardImg'), 'p:' + kind, () => ART.potatoPB(kind), clamp(Math.floor(150/Math.max(w, h)), 4, 9));
  $('cardName').textContent = k.name;
  $('cardStars').textContent = k.star ? '★'.repeat(k.star) : '';
  $('cardCat').textContent = CAT_LABEL[k.cat];
  $('cardDesc').textContent = k.desc;
  $('cardMeta').textContent = `${FARMS[k.farm]}・みつけた数 ${S.found[kind] || 0}`;
  $('cardClose').textContent = openDr ? 'とじる' : 'つづける';
  $('cardModal').hidden = false; $('cardModal').querySelector('.mpanel').focus({preventScroll:true});
}
function closeCard(){ $('cardModal').hidden = true; if (openDr === 'zukan') renderZukan(); }
$('cardClose').addEventListener('click', closeCard);
$('cardModal').addEventListener('click', e => { if (e.target.id === 'cardModal') closeCard(); });
function openHelp(){
  document.querySelectorAll('#helpModal img[data-pot]').forEach(el => setImg(el, 'p:' + el.dataset.pot, () => ART.potatoPB(el.dataset.pot), A));
  $('helpModal').hidden = false; $('helpModal').querySelector('.mpanel').focus({preventScroll:true});
}
function closeHelp(){ $('helpModal').hidden = true; S.seenHelp = true; save(); }
$('helpClose').addEventListener('click', () => { ensureAudio(); closeHelp(); });
function renderSound(){
  const b = $('sndToggle'); b.setAttribute('aria-pressed', String(S.sound));
  $('sndState').textContent = S.sound ? 'オン' : 'オフ';
  setImg($('sndIco'), 'i:' + (S.sound ? 'sndOn' : 'sndOff'), icoPB(S.sound ? 'sndOn' : 'sndOff'), A);
  $('bgmToggle').setAttribute('aria-pressed', String(S.bgm)); $('bgmState').textContent = S.bgm ? 'オン' : 'オフ';
  setImg($('bgmIco'), 'i:' + (S.bgm ? 'note' : 'noteOff'), icoPB(S.bgm ? 'note' : 'noteOff'), A);
}
function openMenu(){
  const st = S.stats;
  $('mStats').innerHTML = [['遊んだ時間', fmtTime(st.play)], ['かせいだ合計', fmt(st.earned) + '円'], ['出荷', fmt(st.shipped) + 'こ'], ['ポイッ（手）', fmt(st.flicked) + 'こ'], ['自動ではじいた', fmt(st.auto) + 'こ'], ['レア芋', fmt(st.rares) + 'こ'], ['フィーバー', fmt(st.fevers) + '回'], ['クレーム', fmt(st.complaints) + '回'], ['施設', fmt(Object.values(S.bld).reduce((a, b) => a + b, 0))], ['改良', fmt(Object.keys(S.upg).length) + '/' + UPG.length], ['実績', achCount() + '/' + ACH.length], ['留守ボーナス', fmt(st.awayEarned) + '円'], ['転生', S.prestiges + '回'], ['いもの種', fmt(S.seeds) + 'こ'], ['いもの奇跡', 'Lv.' + S.kiseki]]
    .map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('');
  $('resetRow').innerHTML = `<button type="button" class="mrow pix fine danger-t" id="resetBtn">データを消して、さいしょから</button>`;
  renderSound(); $('menuModal').hidden = false; $('menuModal').querySelector('.mpanel').focus({preventScroll:true});
}
$('menuBtn').addEventListener('click', () => { ensureAudio(); openMenu(); });
$('menuClose').addEventListener('click', () => { $('menuModal').hidden = true; });
$('menuModal').addEventListener('click', e => { if (e.target.id === 'menuModal') $('menuModal').hidden = true; });
$('bgmToggle').addEventListener('click', () => { S.bgm = !S.bgm; ensureAudio(); BGM.set(S.bgm); renderSound(); save(); SFX.sel(); });
$('sndToggle').addEventListener('click', () => { S.sound = !S.sound; ensureAudio(); renderSound(); save(); if (S.sound) SFX.sel(); });
$('helpOpen').addEventListener('click', () => { $('menuModal').hidden = true; openHelp(); });
$('resetRow').addEventListener('click', e => {
  if (e.target.closest('#resetBtn')){ $('resetRow').innerHTML = `<p class="warn">お金・施設・改良・図鑑が、ぜんぶ消えるよ</p><div class="two"><button type="button" class="pix fine danger" id="resetYes">消す</button><button type="button" class="pix fine" id="resetNo">やめる</button></div>`; return; }
  if (e.target.closest('#resetNo')){ openMenu(); return; }
  if (e.target.closest('#resetYes')){
    const snd = S.sound, bgm = S.bgm; S = DEF(); S.sound = snd; S.bgm = bgm; S.seenHelp = true; feverM = 5; BGM.fever(false);
    pots = []; flies = []; parts = []; coinsFly = []; texts = []; feverT = 0; tutPot = null; tutSpawnN = 0; $('fever').hidden = true; disp = 0; selUpg = null; lastBadge = -1;
    /* 前のデータのお知らせ（めあて達成・実績・レア芋）がのこらないように（ver 2.7） */
    holdAchPop(); hideRarePop(); qDoneQ.length = 0; qHold = 0; qKey = ''; $('achPop').classList.remove('show');
    awayPend = null; achQ.length = 0; feverLv = 0; upgOpen = false; for (const k in ST) ST[k].t = 0; recalc(); save(); renderDock(); renderAchBadge(); checkGoal(); $('menuModal').hidden = true; toast('さいしょからにしたよ');
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('presModal').hidden) $('presModal').hidden = true;
  else if (!$('awayModal').hidden) takeAway();
  else if (!$('achModal').hidden) $('achModal').hidden = true;
  else if (!$('cardModal').hidden) closeCard();
  else if (!$('helpModal').hidden) closeHelp();
  else if (!$('menuModal').hidden) $('menuModal').hidden = true;
  else if (openDr) closeDrawers();
});
/* 1コマに何回もよぶので、窓の部品は先にさがしておく（ver 2.7） */
const PAUSE_EL = ['cardModal', 'helpModal', 'menuModal', 'achModal', 'awayModal', 'presModal'].map($);
const paused = () => titleOn || !!openDr || PAUSE_EL.some(e => !e.hidden);
cv.addEventListener('pointerdown', e => { ensureAudio(); if (paused()) return; tapAt(e.clientX/A, e.clientY/A); });
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden){ hiddenAt = Date.now(); if (!titleOn) save(); if (AC && AC.state === 'running') AC.suspend().catch(() => {}); return; }
  if (AC && AC.state === 'suspended') AC.resume().then(() => BGM.resync()).catch(() => {});
  if (hiddenAt && !titleOn && !awayPend){ awayPend = calcAway(hiddenAt); if (awayPend) showAway(); }
  hiddenAt = 0; last = 0;
});
window.addEventListener('pagehide', () => { if (!titleOn) save(); });

/* タイトル */
function renderTitlePots(){ $('tpots').innerHTML = ['futsu', 'heart', 'me'].map((k, i) => `<span class="tp" style="animation-delay:${i*.18}s">${img('p:' + k, () => ART.potatoPB(k), A*1.34)}</span>`).join(''); }
function startGame(){
  if (!titleOn) return;
  ensureAudio(); titleOn = false; $('title').hidden = true;
  pots = []; spawnT = .4;
  if (awayPend) showAway(); else if (S.stats.play > 30) toast('おかえり！工場は今日も動いてるよ', 'new');
  checkAch();
  SFX.sel(); cachePos();
}
$('title').addEventListener('click', startGame);
$('title').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); startGame(); } });

/* ---------- はじまり ---------- */
let last = 0;
function frame(now){
  const dt = Math.min(.05, (now - (last || now))/1000); last = now;
  T += dt;
  econTick(dt);
  if (!paused()) beltTick(dt);
  fxTick(dt);
  draw(); hudTick(dt);
  requestAnimationFrame(frame);
}
function start(data){
  S = (data && data.S) ? merge(data.S) : (load() || DEF());
  recalc(); disp = S.coins;
  if (!(data && data.S)) awayPend = calcAway(S.lastSeen);
  resize(); inited = true; refreshImages(); renderAchBadge();
  renderDock(); checkGoal(); updateAfford();
  if (data && data.playing){ titleOn = false; $('title').hidden = true; }
  window.addEventListener('resize', resize);
  if (document.fonts && document.fonts.load) document.fonts.load(`16px ${FONT}`).then(() => cachePos()).catch(() => {});
  $('title').focus({preventScroll:true});
  requestAnimationFrame(frame);
  shotGo();
}
const hot = window.claude && window.claude.hot;
if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({S, playing:!titleOn}));
if (hot && typeof hot.ready === 'function') hot.ready(start); else start((hot && hot.data) || {});
})();
