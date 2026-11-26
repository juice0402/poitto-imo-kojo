/* ---------- Game Center（App Store のアプリだけ・ver 2.9） ----------
   アプリが window.APP_SCORE・APP_ACHIEVE を用意したときだけ送る（Web の工房では何もしない）
   実績は ゲームの実績（ACH）のうち GC_ACH の15こ。Game Center の ID は 'imo_' + ACH の id（docs/kobo/gamecenter.json と同じ）
   ランキング imo_best ＝ これまでに出荷した芋の合計（S.stats.shipped・転生してもへらない） */
const GC_ACH = ['ship1', 'rare1', 'fev1', 'flick2', 'all10', 'earn4', 'sfev', 'pres1', 'zt50', 'play3', 'gfev', 'mabo', 'dfev', 'all20', 'zkr'];
let gcSent = -1, gcT = 0;
function gcAch(id){
  if (SHOT || !window.APP_ACHIEVE || !GC_ACH.includes(id)) return;
  try{ window.APP_ACHIEVE('imo_' + id); }catch(e){}
}
/* 記録は ふえたときだけ・60秒に1回まで（now のときはすぐ） */
function gcScore(now){
  if (SHOT || !window.APP_SCORE || !S) return;
  const n = Math.floor(S.stats.shipped) || 0, t = Date.now();
  if (n <= gcSent || (!now && t - gcT < 60000)) return;
  try{ window.APP_SCORE(n); gcSent = n; gcT = t; }catch(e){}
}
/* 開いたときと、あとから Game Center にサインインしたとき：取ってある実績と記録を全部送りなおす */
function gcSync(){
  if (SHOT || !S) return;
  for (const id of GC_ACH) if (S.ach[id]) gcAch(id);
  gcSent = -1; gcScore(true);
}
window.addEventListener('app-gamecenter', gcSync);
