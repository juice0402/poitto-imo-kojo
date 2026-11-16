/* ---------- 画面の部品 ---------- */
const coinsEl = $('coins'), rateEl = $('rate'), shopCoinsEl = $('shopCoins'), shopRateEl = $('shopRate');
const upgGrid = $('upgGrid'), upgDetail = $('upgDetail'), bldList = $('bldList');
let toastTimer = 0, lastToast = null;
/* calmT：画面にもどってから、お知らせを出しはじめるまでの間（秒）。引き出し・カードなどを開いているあいだは0.5にもどる */
let calmT = 0;
const toastOn = () => $('toast').classList.contains('show');
function toast(msg, kind){
  const el = $('toast'); el.textContent = msg; lastToast = {msg, kind}; el.className = 'toast pix' + (kind === 'gold' ? ' gold' : kind === 'new' ? ' leaf' : '') + (openDr ? ' dr' : '') + ' show';
  if (!openDr){ let y = 0; for (const id of ['questTab', 'quest', 'fever']){ const e = $(id); if (!e.hidden){ const r = e.getBoundingClientRect(); y = Math.max(y, r.bottom); } } if (y) el.style.top = (y + 10) + 'px'; }
  const dur = clamp(1600 + [...msg].length*60, 2000, 3500);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}
function restart(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
/* 1行の名前：はみ出したら 16→14→12px（それでもだめなら …）。枠の高さは変えない */
/* ver 2.5：リストの縦のラインをそろえる。アイコンの列と値段の列を、そのリストでいちばん広いものにそろえる（値段の列は行の4割まで。はみ出した数字は .fit でちぢむ） */
function alignRows(root){
  const rows = root.querySelectorAll(':scope > .brow'); if (!rows.length) return;
  root.style.removeProperty('--iw'); root.style.removeProperty('--cw');
  const w = rows[0].clientWidth; if (!w) return;
  let iw = 0, cw = 0;
  rows.forEach(r => { const i = r.querySelector('.bico'), c = r.querySelector('.bcost'); if (i) iw = Math.max(iw, i.offsetWidth); if (c) cw = Math.max(cw, c.offsetWidth + 1); });
  root.style.setProperty('--iw', iw + 'px'); root.style.setProperty('--cw', Math.min(cw, Math.round(w*.4)) + 'px');
}
function fitText(root){ if (!root) return;
  const fits = root.querySelectorAll('.fit');
  fits.forEach(e => { e.style.fontSize = e.style.lineHeight = ''; });
  alignRows(root);
  fits.forEach(e => { if (!e.clientWidth || e.scrollWidth <= e.clientWidth + 1) return; e.style.lineHeight = getComputedStyle(e).lineHeight; for (const fs of [14, 12]){ e.style.fontSize = fs + 'px'; if (e.scrollWidth <= e.clientWidth + 1) break; } });
  /* 説明（2行ぶんの高さ）：はみ出したら 14→12px */
  root.querySelectorAll('.clamp2').forEach(e => { e.style.fontSize = ''; if (e.clientHeight && e.scrollHeight > e.clientHeight + 1) e.style.fontSize = '12px'; });
}
const fitAll = () => ['bldList', 'perkList', 'upgDetail', 'zkGrid', 'achList'].forEach(id => fitText($(id)));
window.addEventListener('resize', fitAll); if (document.fonts) document.fonts.ready.then(fitAll);

let disp = 0, shownC = -1, shownS = '', shownR = '', rateT = 0, affT = 0;
function hudTick(dt){
  const diff = S.coins - disp; disp = Math.abs(diff) < .5 ? S.coins : disp + diff*Math.min(1, dt*10);
  /* 文字が変わったときだけ書きかえる（「1.23兆」のままなら画面はさわらない・ver 2.7） */
  const c = Math.floor(disp); if (c !== shownC){ shownC = c; const s = fmt(c); if (s !== shownS){ shownS = s; coinsEl.textContent = s; shopCoinsEl.textContent = s; const fs = s.length > 9 ? '20px' : s.length > 7 ? '24px' : ''; if (coinsEl.style.fontSize !== fs){ coinsEl.style.fontSize = fs; shopCoinsEl.style.fontSize = fs; } } }
  rateT += dt;
  if (paused()) calmT = .5; else if (calmT > 0) calmT -= dt;
  if (qDoneQ.length && noticeOk()) checkGoal();
  if (achQ.length) showAchPop();
  if (rpTimer && openDr) hideRarePop();
  if (rateT > .25){ rateT = 0; const r = '毎秒 +' + fmtR(D.rate*F()) + '円'; if (r !== shownR){ shownR = r; rateEl.textContent = r; shopRateEl.textContent = r; } if (feverT > 0) $('feverT').textContent = Math.ceil(feverT); }
  if (questT > 0 && !paused()){ questT -= dt; if (questT <= 0) questHide(); }
  affT += dt; if (affT > .2){ affT = 0; updateAfford();
    if (!(S.tut & 4) && S.bld.part > 0){ S.tut |= 4; save(); }
    const tip = !(S.tut & 4) && !paused() && S.coins >= BLD[0].cost;
    if ($('shopTip').hidden === tip) $('shopTip').hidden = !tip;
  }
}
const qNote = $('questTab');
let questT = 0, qKey = '';
function setQuest(t, prog, rew, pct){
  $('qFill').style.width = $('qTabFill').style.width = pct + '%';
  const k = t + '|' + prog + '|' + rew; if (k === qKey) return; qKey = k;
  $('qText').textContent = t; $('qProg').textContent = prog; $('qRew').textContent = rew; fitQuest();
}
/* 付箋：文字がはみ出すときは14px→12pxに（12pxは320pxの画面の長いめあてだけ）。しまっている時は、のびる部分（qbody）の幅だけ右へずらす */
function fitQuest(){
  const t = $('qText'); t.style.fontSize = ''; for (const fs of ['14px', '12px']) if (t.scrollWidth > t.clientWidth + 1) t.style.fontSize = fs;
  const w = $('quest').offsetWidth; if (!w) return; const bw = w + 'px'; if (qNote.style.getPropertyValue('--bw') === bw && qNote.classList.contains('qready')) return;
  const shut = !qNote.classList.contains('open'); if (shut) qNote.style.transition = 'none';
  qNote.style.setProperty('--bw', bw); void qNote.offsetWidth;
  if (shut) qNote.style.transition = ''; qNote.classList.add('qready');
}
/* めあて達成：ごほうびはすぐ。付箋の「達成！」は、引き出しなどを開いているあいだ・上のお知らせが出ているあいだは qDoneQ で待って、1つずつ */
let qHold = 0;
const qDoneQ = [];
const noticeOk = () => !paused() && calmT <= 0 && !toastOn();
function qDone(t, r){ SFX.goal(); setQuest(t, '達成！', '+' + fmt(r) + '円', 100); restart(qNote, 'done'); questShow(4); qHold = performance.now() + 1800; }
function checkGoal(){
  if (performance.now() < qHold) return;
  if (qDoneQ.length && noticeOk()){ const [t, r] = qDoneQ.shift(); qDone(t, r); return; }
  const g = GOALS[S.goal];
  if (!g){ if (!qDoneQ.length) setQuest('ぜんぶ達成！のんびり工場をそだてよう', '', '', 100); return; }
  const v = Math.min(g.n, g.v());
  if (v >= g.n){ earn(g.r); S.goal++; save(); if (!qDoneQ.length && noticeOk()) qDone(g.t, g.r); else qDoneQ.push([g.t, g.r]); return; }
  setQuest(g.t, `${fmt(v)}/${fmt(g.n)}`, '+' + fmt(g.r) + '円', v/g.n*100);
}
function questShow(sec){ qNote.classList.add('open'); qNote.setAttribute('aria-expanded', 'true'); questT = Math.max(questT, sec); }
function questHide(){ questT = 0; qNote.classList.remove('open', 'done'); qNote.setAttribute('aria-expanded', 'false'); }
qNote.addEventListener('click', () => { ensureAudio(); SFX.sel(); if (qNote.classList.contains('open')) questHide(); else questShow(6); });
window.addEventListener('resize', fitQuest);
if (document.fonts) document.fonts.ready.then(fitQuest);
function renderDock(){ $('zukanNew').hidden = !S.znew.length; }
function zukanNew(k){ if (!S.znew.includes(k)) S.znew.push(k); renderDock(); restart($('zukanNew'), 'hop'); }

/* 実績 */
const achQ = []; let achPopT = 0, achCur = null;
function showAchPop(){
  /* めあての「達成！」・上のお知らせが出ているあいだは待って、1つずつ */
  if (achPopT || rpTimer || !achQ.length || !noticeOk() || qDoneQ.length || performance.now() < qHold) return;
  achCur = achQ.shift(); $('achPopName').textContent = achCur;
  const el = $('achPop'); el.classList.add('show'); SFX.goal();
  achPopT = setTimeout(() => { el.classList.remove('show'); achCur = null; setTimeout(() => { achPopT = 0; showAchPop(); }, 260); }, 3000);
}
/* レア芋の小窓。出ているあいだ、実績のお知らせは待つ（出ていたら引っこめて、あとでもう一度） */
let rpKind = null, rpFirst = false, rpTimer = 0;
function showRarePop(kind, first){
  const k = KINDS[kind], [w, h] = ART.size(kind);
  setImg($('rpImg'), 'p:' + kind, () => ART.potatoPB(kind), clamp(Math.floor(48/Math.max(w, h)), 2, 3));
  $('rpStar').textContent = k.star ? '★'.repeat(k.star) : '';
  $('rpName').textContent = k.name;
  $('rpNew').hidden = !first; $('rpN').textContent = first ? '' : '×' + fmt(S.found[kind] || 0);
  rpKind = kind; rpFirst = first;
  if (achPopT){ clearTimeout(achPopT); achPopT = 0; $('achPop').classList.remove('show'); if (achCur){ achQ.unshift(achCur); achCur = null; } }
  $('rarePop').classList.add('show');
  clearTimeout(rpTimer); rpTimer = setTimeout(hideRarePop, first ? 3500 : 2200);
}
function hideRarePop(){ clearTimeout(rpTimer); rpTimer = 0; $('rarePop').classList.remove('show'); }
$('rarePop').addEventListener('click', () => { if (!rpKind) return; ensureAudio(); SFX.sel(); const k = rpKind, f = rpFirst; hideRarePop(); openCard(k, f); });
function renderAchBadge(){ const b = $('achBadge'); b.textContent = S.achNew > 99 ? '99+' : S.achNew; b.hidden = !S.achNew; }
function checkAch(){
  if (titleOn) return;
  const got = ACH.filter(a => !S.ach[a.id] && a.v() >= a.n);
  if (!got.length) return;
  for (const a of got) S.ach[a.id] = 1;
  S.achNew += got.length; recalc(); renderAchBadge(); restart($('achBadge'), 'pop');
  if (got.length > 2) achQ.push(`${got.length}こ まとめて！`); else for (const a of got) achQ.push(a.name);
  showAchPop(); save();
  if (!$('achModal').hidden) renderAch();
}
let achTab = 'todo';
function renderAch(){
  const n = achCount();
  $('achCount').textContent = `${n}/${ACH.length}`; $('achBonus').textContent = fmt(Math.round(n*D.achp*100));
  $('achCat').textContent = D.catMul > 1 ? `・ねこ ×${D.catMul < 100 ? D.catMul.toFixed(1) : fmt(D.catMul)}` : '';
  document.querySelectorAll('#achTabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.a === achTab)));
  const ti = img('i:trophy', icoPB('trophy'), A), ts = img('is:trophy', () => ART.iconSilPB('trophy'), A);
  const list = ACH.filter(a => achTab === 'all' || (achTab === 'got') === !!S.ach[a.id]);
  $('achList').innerHTML = (list.length ? '' : `<p class="empty">${achTab === 'got' ? 'まだ実績はないよ' : 'ぜんぶとった！すごい！'}</p>`) + list.map(a => {
    const g = !!S.ach[a.id], f = a.f || fmt, v = Math.min(a.n, a.v());
    return `<div class="arow pix fine flat${g ? ' got' : ''}">${g ? ti : ts}<div><b class="fit">${g ? a.name : '？？？'}</b><span class="fit">${a.d}</span><span class="ap">${g ? `生産 +${Math.round(D.achp*100)}%` : `${f(v)} / ${f(a.n)}`}</span></div></div>`;
  }).join('');
  fitText($('achList'));
}
function openAch(){
  renderAch(); S.achNew = 0; renderAchBadge(); save();
  $('achModal').hidden = false; fitText($('achList')); $('achModal').querySelector('.mpanel').focus({preventScroll:true}); SFX.open();
}
$('achBtn').addEventListener('click', () => { ensureAudio(); openAch(); });
$('achTabs').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (!b) return; achTab = b.dataset.a; SFX.sel(); renderAch(); $('achList').scrollTop = 0; });
$('achClose').addEventListener('click', () => { $('achModal').hidden = true; });
$('achModal').addEventListener('click', e => { if (e.target.id === 'achModal') $('achModal').hidden = true; });

/* 留守ボーナス */
let awayPend = null;
function calcAway(fromMs){
  const sec = Math.min(S.perk.toki ? 24*3600 : S.perk.rusuban ? 12*3600 : AWAY_MAX, Math.max(0, (Date.now() - fromMs)/1000));
  if (!fromMs || sec < 60 || D.cps <= 0) return null;
  return {sec, amt:D.cps*(S.perk.toki ? .5 : S.perk.rusuban ? .25 : AWAY_RATE)*sec};
}
function showAway(){
  if (!awayPend) return;
  $('awayAmt').textContent = '+' + fmt(awayPend.amt) + '円';
  $('awayModal').hidden = false; $('awayModal').querySelector('.mpanel').focus({preventScroll:true}); SFX.upg();
}
function takeAway(){
  if (!awayPend) return;
  earn(awayPend.amt); S.stats.away++; S.stats.awayEarned += awayPend.amt; awayPend = null;
  $('awayModal').hidden = true; SFX.get(); restart($('wallet'), 'bump'); checkAch(); save();
}
$('awayOk').addEventListener('click', () => { ensureAudio(); takeAway(); });

/* 工場（右） */
let selUpg = null, shopSig = '', lastBadge = -1, upgOpen = false;
const availUpgs = () => UPG.filter(u => !S.upg[u.id] && u.unlock()).sort((a, b) => a.cost - b.cost);
function visibleBlds(){
  const out = []; let mys = false;
  for (const b of BLD){
    if (S.bld[b.id] > 0 || S.stats.earnedRun >= b.cost*.3 || b.id === 'part') out.push({b, mys:false});
    else if (!mys){ out.push({b, mys:true}); mys = true; }
  }
  return out;
}
/* 施設の行：左に名前と「いま何人（何台）」（まだ0なら何をするかの一言）、右に値段だけ（ver 1.9。毎秒いくらは上の所持金に出ているので書かない。×10などは上のボタンでわかる） */
function bldRow(b){
  const n = S.buy, cost = bldCost(b, n);
  return `<button type="button" class="brow pix fine" id="b-${b.id}" data-b="${b.id}">
    ${img('i:' + b.id, icoPB(b.id), A, 'bico')}
    <span class="bmain"><span class="bname fit">${b.name}</span>${!S.bld[b.id] && b.tag ? `<em class="btag">${b.tag}</em>` : `<span class="bnum">${fmt(S.bld[b.id])}${b.unit}</span>`}</span>
    <span class="bcost">${coinImg()}<span class="fit">${fmt(cost)}円</span></span></button>`;
}
function mysRow(b){
  return `<div class="brow pix fine mys" aria-disabled="true">${img('is:' + b.id, () => ART.iconSilPB(b.id), A, 'bico')}
    <span class="bmain"><span class="bname fit">？？？</span></span><span class="bcost">${coinImg()}<span class="fit">${fmt(b.cost)}円</span></span></div>`;
}
function renderUpgDetail(){
  const u = selUpg && UI[selUpg];
  if (!u){ upgDetail.hidden = true; return; }
  upgDetail.hidden = false;
  upgDetail.innerHTML = `<span class="ud-ico">${img('i:' + u.icon, icoPB(u.icon), A)}</span>
    <span class="ud-main"><b class="fit">${u.name}</b><span class="clamp2">${u.desc}</span></span>
    <button type="button" class="pix gold ud-buy" id="udBuy" data-u="${u.id}">${coinImg()}<span>${fmt(u.cost)}円</span></button>`;
  fitText(upgDetail);
}
function renderShop(){
  const list = availUpgs();
  $('upgCount').textContent = list.length ? `${list.length}こ` : '';
  if (selUpg && !list.find(u => u.id === selUpg)) selUpg = null;
  if (!selUpg && list.length) selUpg = list[0].id;
  const shown = upgOpen ? list : list.slice(0, 10);
  if (selUpg && !shown.find(u => u.id === selUpg)) selUpg = shown.length ? shown[0].id : null;
  $('upgMore').hidden = list.length <= 10; $('upgMore').textContent = upgOpen ? 'とじる' : `もっと見る（あと${list.length - 10}こ）`;
  upgGrid.innerHTML = list.length ? shown.map(u => `<button type="button" class="ucell pix fine${selUpg === u.id ? ' sel' : ''}" data-u="${u.id}" aria-label="${u.name}">${img('i:' + u.icon, icoPB(u.icon), A)}<span class="tier">${'<i></i>'.repeat(Math.min(6, u.tier))}</span></button>`).join('')
    : `<p class="empty">いま買える改良はないよ。施設をふやしたり、芋をさばいたりすると出てくる</p>`;
  renderUpgDetail();
  const vis = visibleBlds();
  bldList.innerHTML = vis.map(({b, mys}) => mys ? mysRow(b) : bldRow(b)).join('');
  document.querySelectorAll('#buySeg button').forEach(bt => bt.setAttribute('aria-pressed', String(+bt.dataset.n === S.buy)));
  const st = S.stats;
  $('stats').innerHTML = [['出荷', fmt(st.shipped) + 'こ'], ['ポイッ', fmt(st.flicked) + 'こ'], ['自動ではじいた', fmt(st.auto) + 'こ'], ['レア芋', fmt(st.rares) + 'こ'], ['クレーム', fmt(st.complaints) + '回'], ['かせいだ合計', fmt(st.earned) + '円']]
    .map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('');
  shopSig = list.map(u => u.id).join(',') + '|' + vis.length + '|' + vis.filter(v => v.mys).map(v => v.b.id).join('');
  fitText(bldList); updateAfford(true);
}
function updateAfford(){
  let n = 0;
  const vis = visibleBlds();
  for (const {b, mys} of vis){
    if (mys) continue;
    if (S.coins >= bldCost(b, 1)) n++;
    const el = openDr === 'shop' && document.getElementById('b-' + b.id); if (el) el.classList.toggle('ng', S.coins < bldCost(b, S.buy));
  }
  const list = availUpgs();
  for (const u of list){ if (S.coins >= u.cost) n++; if (openDr === 'shop'){ const el = upgGrid.querySelector(`[data-u="${u.id}"]`); if (el) el.classList.toggle('ng', S.coins < u.cost); } }
  const ub = $('udBuy'); if (ub && UI[ub.dataset.u]) setAttr(ub, 'aria-disabled', String(S.coins < UI[ub.dataset.u].cost));
  if (openDr === 'shop' && shopTab === 'f'){ const sig = list.map(u => u.id).join(',') + '|' + vis.length + '|' + vis.filter(v => v.mys).map(v => v.b.id).join(''); if (sig !== shopSig) renderShop(); }
  const sr = seedReady(); if (sr) n++; $('seedDot').hidden = !sr; seedTick();
  if (n !== lastBadge){
    const b = $('shopBadge');
    if (n > lastBadge && lastBadge >= 0) restart(b, 'hop');
    lastBadge = n; b.textContent = n; b.hidden = n === 0;
  }
  { const b = $('shopBadge'), pr = canPres(); b.classList.toggle('pr', pr); if (pr){ if (b.textContent !== '転生') b.textContent = '転生'; b.hidden = false; } else if (b.textContent === '転生'){ b.textContent = lastBadge; b.hidden = lastBadge === 0; }
    $('shopBtn').classList.toggle('ready', n > 0);
    setAttr($('shopBtn'), 'aria-label', n ? `工場（${n}つ買える）` : '工場');
  }
}
/* 0.2秒ごとの見直しで、同じ中身を書きなおさない（ver 2.7） */
function setAttr(el, k, v){ if (el.getAttribute(k) !== v) el.setAttribute(k, v); }
function buyBld(id){
  const b = BI[id], cost = bldCost(b, S.buy);
  if (S.coins < cost){ toast(`あと ${fmt(cost - S.coins)}円 たりない`); SFX.no(); return; }
  const first = S.bld[id] === 0;
  S.coins -= cost; disp = S.coins; S.bld[id] += S.buy; S.stats.blds += S.buy;
  if (STN_OF[id]) ST[id].t = 99;
  recalc(); SFX.build();
  if (first) toast(({part:'パートさんが来てくれた！\nわる芋をポイッとしてくれるよ', air:'エアはじき機を置いた！\nシュッとはじくよ', hatake:'いも畑ができた！\n芋がたくさん流れてくる', robo:'選別ロボが動きだした！'})[id] || `${b.name}ができた！`, 'new');
  renderShop(); const r = document.getElementById('b-' + id); if (r){ restart(r, 'bought'); r.focus({preventScroll:true}); }
  checkGoal(); save();
}
function buyUpg(id){
  const u = UI[id]; if (!u || S.upg[id]) return;
  if (S.coins < u.cost){ toast(`あと ${fmt(u.cost - S.coins)}円 たりない`); SFX.no(); return; }
  S.coins -= u.cost; disp = S.coins; S.upg[id] = true; S.stats.upgs++;
  recalc(); SFX.upg(); toast(id.startsWith('farm') ? `${u.name}！ ${FARMS[farmLv()]}の芋が流れてくるよ` : `${u.name}！ ${u.desc}`, 'gold');
  selUpg = null; renderShop(); checkGoal(); save();
}
bldList.addEventListener('click', e => { const r = e.target.closest('.brow[data-b]'); if (r){ ensureAudio(); buyBld(r.dataset.b); } });
$('upgMore').addEventListener('click', () => { upgOpen = !upgOpen; SFX.sel(); renderShop(); });
upgGrid.addEventListener('click', e => {
  const c = e.target.closest('.ucell'); if (!c) return;
  ensureAudio(); selUpg = c.dataset.u;
  upgGrid.querySelectorAll('.ucell').forEach(x => x.classList.toggle('sel', x === c));
  renderUpgDetail(); updateAfford(); SFX.sel();
  if (!upgDetail.hidden) upgDetail.scrollIntoView({block:'nearest', behavior:'smooth'});
});
upgDetail.addEventListener('click', e => { const b = e.target.closest('#udBuy'); if (b){ ensureAudio(); buyUpg(b.dataset.u); } });
$('buySeg').addEventListener('click', e => { const b = e.target.closest('button[data-n]'); if (!b) return; S.buy = +b.dataset.n; SFX.sel(); renderShop(); save(); });

/* 転生（工場の2ページ目） */
let shopTab = 'f', seedSig = '';
const seedImg = () => img('i:seed', icoPB('seed'), Math.max(1.5, A*.67), 'ci');
function setShopTab(t){
  shopTab = t;
  document.querySelectorAll('#shopTabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
  $('shopBody').hidden = t !== 'f'; $('seedBody').hidden = t !== 's';
  if (t === 's') renderSeed(); else renderShop();
}
let perkOpen = false;
function renderSeed(){
  const av = seedsAv(), ok = canPres(), g = presGain();
  $('seedCard').innerHTML = `<div class="flow"><div>${img('i:coin', icoPB('coin'), A)}<span>${fmt(PRES_MIN)}円<br>かせぐ</span></div><i>▶</i><div>${img('i:factory', icoPB('factory'), A)}<span>工場を<br>たたむ</span></div><i>▶</i><div>${img('i:seed', icoPB('seed'), A)}<span>種で<br>生産アップ</span></div></div>`
    + `<div class="sline">${seedImg()}<span>いもの種</span><b>${fmt(S.seeds)}</b><span>こ</span><em>生産 ×${fmtX(D.seedMul)}</em></div>`;
  $('presBox').innerHTML = ok
    ? `<p>いま たたむと</p><b>いもの種 +<span id="presGainNow">${fmt(g)}</span></b><p class="pmul">生産 ×${fmtX(D.seedMul)} → <em id="presPctNow">×${fmtX(seedMulOf(S.seeds + g))}</em></p><button type="button" class="pix gold big" id="presBtn">工場をたたむ</button><p class="pnote">のこる：図鑑・実績・いもの種・種の改良・めあて<br>なくなる：お金・施設・改良</p>`
    : `<span class="qbar"><i id="presFill" style="width:${Math.min(100, S.stats.earnedRun/PRES_MIN*100)}%"></i></span><p id="presNum">${fmt(S.stats.earnedRun)} / ${fmt(PRES_MIN)}円</p><p class="pnote">のこる：図鑑・実績・いもの種・種の改良・めあて<br>なくなる：お金・施設・改良</p>`;
  $('perkCount').textContent = `使える ${fmt(av)}こ`; $('perkNote').hidden = !S.seeds;
  /* 種の改良は「いま買えるもの＋その次の2つ（最低3つ）」だけ見せる。持っているものは下にたたむ（ver 1.8） */
  const kc = kisekiCost();
  const pRow = pk => { const got = !!S.perk[pk.id];
    return `<button type="button" class="brow pix fine${got ? ' got' : av < pk.cost ? ' ng' : ''}" data-p="${pk.id}"${got ? ' aria-disabled="true"' : ''}>${img('i:' + pk.icon, icoPB(pk.icon), A, 'bico')}<span class="bmain"><span class="bname fit">${pk.name}</span><span class="binfo clamp2">${pk.desc}</span></span><span class="bcost">${got ? '<span>済</span>' : `${seedImg()}<span class="fit">${fmt(pk.cost)}</span>`}</span></button>`; };
  const kRow = () => `<button type="button" class="brow pix fine${av < kc ? ' ng' : ''}" data-k="1">${img('i:imo', icoPB('imo'), A, 'bico')}<span class="bmain"><span class="bname fit">いもの奇跡<em>Lv.${S.kiseki}</em></span><span class="binfo clamp2">生産がさらに10倍。何回でも買える</span></span><span class="bcost">${seedImg()}<span class="fit">${fmt(kc)}</span></span></button>`;
  const todo = PERKS.filter(pk => !S.perk[pk.id]).map(pk => ({pk, cost:pk.cost})).concat([{k:1, cost:kc}]).sort((a, b) => a.cost - b.cost);
  const nOk = todo.filter(x => x.cost <= av).length, show = todo.slice(0, Math.max(3, nOk + 2));
  if (S.kiseki > 0 && !show.some(x => x.k)) show.push({k:1});
  const got = PERKS.filter(pk => S.perk[pk.id]).sort((a, b) => a.cost - b.cost);
  $('perkList').innerHTML = show.map(x => x.k ? kRow() : pRow(x.pk)).join('')
    + (got.length ? `<button type="button" class="pix fine flat morebtn" id="perkMore" aria-expanded="${perkOpen}">持っている改良 ${got.length}こ ${perkOpen ? '▲' : '▼'}</button>` + (perkOpen ? got.map(pRow).join('') : '') : '');
  seedSig = `${ok}|${av}|${Object.keys(S.perk).length}|${S.seeds}|${S.kiseki}`;
  fitText($('perkList'));
}
function seedTick(){
  if (openDr !== 'shop' || shopTab !== 's') return;
  const ok = canPres(), g = presGain(), sig = `${ok}|${seedsAv()}|${Object.keys(S.perk).length}|${S.seeds}|${S.kiseki}`;
  if (sig !== seedSig) return renderSeed();
  if (ok){ const a = $('presGainNow'), b = $('presPctNow'); if (a) a.textContent = fmt(g); if (b) b.textContent = '×' + fmtX(seedMulOf(S.seeds + g)); }
  if (!ok){ const f = $('presFill'), n = $('presNum'); if (f) f.style.width = Math.min(100, S.stats.earnedRun/PRES_MIN*100) + '%'; if (n) n.textContent = `${fmt(S.stats.earnedRun)} / ${fmt(PRES_MIN)}円`; }
}
function seedReady(){ return canPres() || seedsAv() >= kisekiCost() || PERKS.some(pk => !S.perk[pk.id] && seedsAv() >= pk.cost); }
function buyKiseki(){
  const c = kisekiCost();
  if (seedsAv() < c){ toast(`いもの種が あと ${fmt(c - seedsAv())}こ たりない`); SFX.no(); return; }
  S.seedsUsed += c; S.kiseki++; recalc(); SFX.seed(); toast(`いもの奇跡 Lv.${S.kiseki}！ 生産がさらに10倍`, 'gold');
  renderSeed(); checkAch(); save();
}
function buyPerk(id){
  const pk = PI_[id]; if (!pk || S.perk[id]) return;
  if (seedsAv() < pk.cost){ toast(`いもの種が あと ${fmt(pk.cost - seedsAv())}こ たりない`); SFX.no(); return; }
  S.perk[id] = 1; S.seedsUsed += pk.cost; applyPerk(id); disp = S.coins;
  recalc(); SFX.seed(); toast(`${pk.name}！ ${pk.desc}`, 'gold');
  renderSeed(); checkGoal(); checkAch(); save();
}
function openPres(){
  if (!canPres()) return;
  const g = presGain();
  $('presAmt').textContent = `いもの種 +${fmt(g)}`;
  $('presMeta').textContent = `種ボーナスが ×${fmtX(D.seedMul)} → ×${fmtX(seedMulOf(S.seeds + g))}（ずっと）`;
  $('presModal').hidden = false; $('presModal').querySelector('.mpanel').focus({preventScroll:true}); SFX.open();
}
function doPrestige(){
  if (!canPres()) return;
  const g = presGain();
  S.seeds += g; S.prestiges++;
  S.coins = 0; for (const k in S.bld) S.bld[k] = 0; S.upg = {}; S.stats.earnedRun = 0; S.presNotified = false;
  for (const id in S.perk) applyPerk(id, true);
  feverT = 0; feverM = 5; feverLv = 0; $('fever').hidden = true; BGM.fever(false);
  pots = []; flies = []; coinsFly = []; texts = []; spawnT = .8; disp = S.coins; selUpg = null; lastBadge = -1;
  for (const k in ST) ST[k].t = 0;
  recalc(); $('presModal').hidden = true; closeDrawers(true);
  restart($('flash'), 'go'); SFX.prestige();
  toast(`新しい土地で、いも工場をはじめよう！ いもの種 +${fmt(g)}`, 'gold');
  checkGoal(); checkAch(); save();
}
$('shopTabs').addEventListener('click', e => { const b = e.target.closest('button[data-t]'); if (!b) return; ensureAudio(); SFX.sel(); setShopTab(b.dataset.t); });
$('seedBody').addEventListener('click', e => {
  if (e.target.closest('#presBtn')){ ensureAudio(); openPres(); return; }
  if (e.target.closest('#perkMore')){ ensureAudio(); SFX.sel(); perkOpen = !perkOpen; renderSeed(); return; }
  if (e.target.closest('.brow[data-k]')){ ensureAudio(); buyKiseki(); return; }
  const r = e.target.closest('.brow[data-p]'); if (r){ ensureAudio(); buyPerk(r.dataset.p); }
});
$('presYes').addEventListener('click', () => { ensureAudio(); doPrestige(); });
$('presNo').addEventListener('click', () => { $('presModal').hidden = true; });
$('presModal').addEventListener('click', e => { if (e.target.id === 'presModal') $('presModal').hidden = true; });

