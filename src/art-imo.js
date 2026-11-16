/* ===== 絵の表（ART） =====
   この表の絵は、ぜんぶ C（コードで描いたドット絵・2026-11-15 ぽぽち）。
   アプリ版は、この表を差しかえれば絵が変わる。文字は絵に入れず、ゲーム側で書く。 */
const ART = (() => {
'use strict';
const RGB = {};
function rgb(h){
  if (RGB[h]) return RGB[h];
  const s = h.replace('#','');
  return (RGB[h] = [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16), s.length >= 8 ? parseInt(s.slice(6,8),16) : 255]);
}
function mix(a, b, t){ const A = rgb(a), B = rgb(b); return '#' + [0,1,2].map(i => Math.round(A[i] + (B[i]-A[i])*t).toString(16).padStart(2,'0')).join(''); }
function pip(pts, x, y){
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi)*(y - yi)/(yj - yi) + xi)) ins = !ins;
  }
  return ins;
}
const N4 = [[1,0],[-1,0],[0,1],[0,-1]];
class PB {
  constructor(w, h){ this.w = w; this.h = h; this.c = new Array(w*h).fill(null); this.m = new Array(w*h).fill(null); }
  ok(x, y){ return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, col, mat){ x = Math.floor(x); y = Math.floor(y); if (!this.ok(x, y)) return; const i = y*this.w + x; this.c[i] = col; this.m[i] = mat || 'x'; }
  get(x, y){ return this.ok(x, y) ? this.c[y*this.w + x] : null; }
  mat(x, y){ return this.ok(x, y) ? this.m[y*this.w + x] : null; }
  del(x, y){ if (!this.ok(x, y)) return; const i = y*this.w + x; this.c[i] = null; this.m[i] = null; }
  rect(x, y, w, h, col, mat){ for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col, mat); }
  fill(fn, col, mat){ for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (fn(x + .5, y + .5)) this.set(x, y, typeof col === 'function' ? col(x, y) : col, mat); }
  erase(fn){ for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (fn(x + .5, y + .5)) this.del(x, y); }
  disc(cx, cy, r, col, mat){ this.fill((x, y) => (x-cx)**2 + (y-cy)**2 <= r*r, col, mat); }
  ell(cx, cy, rx, ry, col, mat){ this.fill((x, y) => ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1, col, mat); }
  poly(pts, col, mat){ this.fill((x, y) => pip(pts, x, y), col, mat); }
  line(x0, y0, x1, y1, col, mat){
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1-x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1-y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;){ this.set(x0, y0, col, mat); if (x0 === x1 && y0 === y1) break; const e2 = 2*e; if (e2 >= dy){ e += dy; x0 += sx; } if (e2 <= dx){ e += dx; y0 += sy; } }
  }
  recolor(from, fn){ for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.c[y*this.w + x] === from){ const c = fn(x, y); if (c) this.c[y*this.w + x] = c; } }
  outline(colFn){
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++){
      if (this.c[y*this.w + x]) continue;
      for (const [dx, dy] of N4){
        const nx = x + dx, ny = y + dy; if (!this.ok(nx, ny)) continue;
        const i = ny*this.w + nx;
        if (this.c[i] && this.m[i] !== 'fx'){ add.push([x, y, typeof colFn === 'function' ? colFn(this.m[i], this.c[i]) : colFn]); break; }
      }
    }
    for (const [x, y, c] of add) this.set(x, y, c, 'ol');
    return this;
  }
  map(fn){ const p = new PB(this.w, this.h); for (let i = 0; i < this.c.length; i++) if (this.c[i]){ p.c[i] = fn(this.c[i], this.m[i]); p.m[i] = this.m[i]; } return p; }
  canvas(s = 1){
    const cv = document.createElement('canvas'); cv.width = this.w*s; cv.height = this.h*s;
    const g = cv.getContext('2d'), id = g.createImageData(cv.width, cv.height), d = id.data;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++){
      const col = this.c[y*this.w + x]; if (!col) continue;
      const [r, gg, b, a] = rgb(col);
      for (let j = 0; j < s; j++) for (let i = 0; i < s; i++){ const k = ((y*s + j)*cv.width + (x*s + i))*4; d[k] = r; d[k+1] = gg; d[k+2] = b; d[k+3] = a; }
    }
    g.putImageData(id, 0, 0);
    return cv;
  }
}
const INK = '#3b2414', EYE = '#2b1810', PINK = '#f48c8c', MOUTH = '#7a2f1f', WHITE = '#ffffff';
function shadeCol(p, base, cx, cy, r, light, dark, lt = .42, dt = -.42){
  p.recolor(base, (x, y) => { const L = -((x + .5 - cx)*.6 + (y + .5 - cy)*.8)/r; return L > lt ? light : L < dt ? dark : null; });
}

/* ---------- いも（39しゅるい） ---------- */
const PAL = {
  tan:  {o:'#5b3118', d:'#b8763c', b:'#dea45b', l:'#f3ca82', h:'#fff3d0'},
  pale: {o:'#5b3118', d:'#c58b4b', b:'#e9b972', l:'#f8da9b', h:'#fffbe6'},
  red:  {o:'#551b19', d:'#9a3530', b:'#c6554a', l:'#e7856f', h:'#ffd4c2'},
  mud:  {o:'#3a3519', d:'#787035', b:'#9f954f', l:'#c1b86e', h:'#e3dda2'},
  stone:{o:'#2f3139', d:'#686d77', b:'#8d929b', l:'#b5b9c1', h:'#eceef1'},
  dirt: {o:'#28180c', d:'#55351f', b:'#734d2c', l:'#91673d', h:'#b48a59'},
  gold: {o:'#653900', d:'#cb8a10', b:'#f2ba1e', l:'#ffe164', h:'#fffce8'},
  niji: {o:'#553876', d:'#553876', b:'#ffffff', l:'#ffffff', h:'#ffffff'},
  choco:{o:'#2a120a', d:'#6a3416', b:'#9a5226', l:'#c97a42', h:'#f6c27a'},
  purple:{o:'#33183f', d:'#6b3a8c', b:'#9a63c0', l:'#c49be0', h:'#f2e4ff'},
  snow: {o:'#3e4d66', d:'#a8b7cc', b:'#dde6f1', l:'#f2f6fb', h:'#ffffff'},
  silver:{o:'#262b33', d:'#77808c', b:'#a8b0bb', l:'#d5dbe2', h:'#ffffff'},
  blue: {o:'#12324f', d:'#2e6ca3', b:'#4f97d2', l:'#8cc3ee', h:'#e4f5ff'},
  coral:{o:'#5a2111', d:'#c9602e', b:'#f08f54', l:'#ffbd8b', h:'#fff1e2'},
  octo: {o:'#5c1a24', d:'#b8434f', b:'#e06872', l:'#f59aa0', h:'#ffe4e6'},
  crystal:{o:'#245468', d:'#6fbfd9', b:'#ade6f5', l:'#dbf8ff', h:'#ffffff'},
  pearl:{o:'#5a4a66', d:'#d7c3dc', b:'#f3e9f1', l:'#fffafd', h:'#ffffff'},
  night:{o:'#0d1030', d:'#1b2352', b:'#2c3a7c', l:'#4c62b4', h:'#c9d4ff'},
  pink: {o:'#6a2638', d:'#d1708f', b:'#f39fba', l:'#ffc8d8', h:'#fff0f5'},
  lemon:{o:'#5a4808', d:'#c7a51c', b:'#f2d648', l:'#fff088', h:'#fffde2'},
  gal:  {o:'#0b0620', d:'#150c33', b:'#251a52', l:'#3c2f80', h:'#ffffff'},
  koban:{o:'#5e4208', d:'#c49a2c', b:'#e8c654', l:'#f8e48c', h:'#fffbe0'},
  nugget:{o:'#4e2600', d:'#b46a08', b:'#e39a18', l:'#ffcb3c', h:'#fff4b0'},
  ougon:{o:'#5a2a00', d:'#c87608', b:'#ffbf1a', l:'#ffe45a', h:'#ffffff'},
  wood: {o:'#3a1e0c', d:'#7a4520', b:'#a3622c', l:'#c98a4c', h:'#ecc088'},
  lacq: {o:'#4a0a0a', d:'#9a1a1a', b:'#d42e2e', l:'#f26452', h:'#ffd0c0'},
  amber:{o:'#4a2104', d:'#b8580e', b:'#e88a1c', l:'#ffb84a', h:'#fff0c8'},
  turq: {o:'#0f3a3a', d:'#2a9a96', b:'#48c4bc', l:'#86e2d8', h:'#e4fffb'},
  ruby: {o:'#4a0614', d:'#a3102c', b:'#e0244a', l:'#ff6a84', h:'#ffe0e8'},
  sapph:{o:'#0a1a4a', d:'#1a3a9a', b:'#2f62d4', l:'#6c9cf4', h:'#e0ecff'},
  emer: {o:'#05301c', d:'#0e7a44', b:'#1fae64', l:'#5cd890', h:'#d8ffe8'},
  opal: {o:'#3a4a6a', d:'#a8bcd8', b:'#dbe6f4', l:'#f2f7ff', h:'#ffffff'},
  rose: {o:'#5a1838', d:'#d0507e', b:'#f47aa4', l:'#ffb0cc', h:'#ffffff'},
  prism:{o:'#2a3a6a', d:'#b4c8ec', b:'#dde9fb', l:'#f4f9ff', h:'#ffffff'},
  dia:  {o:'#24476e', d:'#8cc4ea', b:'#cfeeff', l:'#effaff', h:'#ffffff'},
  dpink:{o:'#6a2638', d:'#e0809a', b:'#f8a8bc', l:'#ffd0dc', h:'#ffffff'},
  dwhite:{o:'#5a4a3a', d:'#d8ccb8', b:'#f4eee2', l:'#fffcf4', h:'#ffffff'},
  dgreen:{o:'#24461c', d:'#7aa850', b:'#a0cc70', l:'#c8e89c', h:'#f4ffe8'},
  candy:{o:'#6a1a2a', d:'#d04a64', b:'#f47a90', l:'#ffb0bc', h:'#ffffff'},
  purin:{o:'#5a3a08', d:'#e0a830', b:'#f8d060', l:'#ffe898', h:'#fffbe8'},
  caramel:{o:'#3a1a08', d:'#7a3a10', b:'#a8561c', l:'#cc7a34', h:'#f0b070'},
  lilac:{o:'#4a2a5a', d:'#c08ad8', b:'#dcb0ec', l:'#f0d4f8', h:'#ffffff'},
  mint: {o:'#1e5a4a', d:'#5cc0a0', b:'#8ee4c4', l:'#c4f6e2', h:'#ffffff'},
  hotcake:{o:'#5a2e10', d:'#c47a34', b:'#e8aa5c', l:'#f8d08e', h:'#fff2cc'},
  cotton:{o:'#6a3a6a', d:'#e8a0d0', b:'#ffc4e4', l:'#ffe4f2', h:'#ffffff'},
  cream:{o:'#5a4a3a', d:'#e0d4c4', b:'#fdf8ee', l:'#ffffff', h:'#ffffff'},
  frost:{o:'#6a2638', d:'#e87aa0', b:'#ff9cc0', l:'#ffc8dc', h:'#ffffff'},
  frog: {o:'#1f4214', d:'#4c8f2c', b:'#6fb83f', l:'#a2dc6a', h:'#e6ffc8'},
  peng: {o:'#0a1020', d:'#1a2440', b:'#2c3a62', l:'#4a5c8c', h:'#c0ccec'},
  fox:  {o:'#5a2008', d:'#c8581a', b:'#f08a2e', l:'#ffb45e', h:'#fff0d8'},
  mars: {o:'#4a1a0c', d:'#a8452a', b:'#d9693e', l:'#f2955e', h:'#ffd8b8'},
  rock: {o:'#1e1612', d:'#3e342e', b:'#5e524a', l:'#82756a', h:'#b4a89c'},
  saturn:{o:'#4a3a1a', d:'#c8a868', b:'#ecd49a', l:'#fbeac4', h:'#fffaf0'},
  ice:  {o:'#1a3a5a', d:'#7ab8e0', b:'#b4e0f8', l:'#e0f6ff', h:'#ffffff'},
  alien:{o:'#2a3a08', d:'#8ab828', b:'#b8e04a', l:'#dcf48a', h:'#f8ffe0'},
  sun:  {o:'#7a2a00', d:'#ff9a1a', b:'#ffc832', l:'#ffe680', h:'#fffbe0'},
  galaxy:{o:'#14082e', d:'#2a145a', b:'#3e2080', l:'#6a3ab8', h:'#ffffff'},
  abyss:{o:'#000000', d:'#05030c', b:'#0c0818', l:'#1e1438', h:'#5a4a8a'},
  brass:{o:'#3e2808', d:'#8a5c1c', b:'#c08a34', l:'#e6b866', h:'#fff0c4'},
  bulb: {o:'#6a4a08', d:'#f0c030', b:'#ffe468', l:'#fff4b0', h:'#ffffff'},
  steel:{o:'#1e2a3a', d:'#6a7e96', b:'#9cb0c8', l:'#c8d6e6', h:'#ffffff'},
  dial: {o:'#5a4a2a', d:'#e0d4b4', b:'#fbf4e0', l:'#fffcf2', h:'#ffffff'},
  oni:  {o:'#4a1010', d:'#b03028', b:'#e04a3a', l:'#ff7e62', h:'#ffd0c0'},
  spirit:{o:'#1e2468', d:'#7a84e8', b:'#b4bcff', l:'#e0e6ff', h:'#ffffff'},
  dragon:{o:'#0e2e24', d:'#1f6b4f', b:'#2f9a6c', l:'#5cc98f', h:'#d8ffe8'},
  phoenix:{o:'#5a1004', d:'#e8441a', b:'#ff8a1e', l:'#ffd23a', h:'#ffffff'},
  legend:{o:'#6a3a00', d:'#d08a10', b:'#ffc828', l:'#fff08a', h:'#ffffff'},
};
const NIJI = ['#ff9aa8','#ffc38a','#ffe887','#b6e98a','#8fd2f4','#b9a2f4'];
const POT = {
  futsu:  {w:18,h:15, rx:7.6, ry:6.0, wob:.05, ph:.6, pal:'tan', face:'smile', dim:[[-5.4,-1.4],[4.6,2.8],[5.4,-2.6]]},
  maru:   {w:15,h:15, rx:6.4, ry:6.4, pal:'pale', face:'round', dim:[[-4.2,2.6],[4.2,-3.2]]},
  noppo:  {w:13,h:20, rx:5.1, ry:8.7, wob:.04, ph:1.2, pal:'tan', face:'smile', fy:-2.5, dim:[[-2.8,4.4],[2.6,6.2],[2.4,-6.6]]},
  aka:    {w:17,h:15, rx:7.1, ry:6.0, wob:.05, ph:2, pal:'red', face:'shy', dim:[[-5.2,-2.2],[4.8,2.8]]},
  chibi:  {w:12,h:11, rx:4.9, ry:4.3, pal:'tan', face:'tiny', s:1.5, dim:[[3,-2.4]]},
  me:     {w:18,h:19, cy:11.8, rx:7.4, ry:6.0, wob:.05, ph:.3, pal:'tan', face:'worry', dim:[[-5.4,2.2],[5,2.8]], extra:'sprout'},
  kusari: {w:18,h:15, rx:7.5, ry:6.0, wob:.07, ph:1.7, pal:'mud', face:'dizzy', extra:'rot'},
  ishi:   {w:17,h:14, shape:'poly', pal:'stone', face:'poker', extra:'crack', pts:[[1.6,6.2],[4.2,2.0],[10,1.1],[14.6,2.8],[15.6,7.6],[13.2,12.6],[6.2,13.0],[1.4,10.4]]},
  tsuchi: {w:17,h:15, rx:7.0, ry:5.9, wob:.13, ph:.9, pal:'dirt', face:'peek', extra:'specks'},
  heart:  {w:18,h:18, cy:8.4, shape:'heart', pal:'tan', face:'happy', fy:-.4},
  futago: {w:21,h:15, shape:'twin', pal:'tan', face:'twin'},
  niko:   {w:18,h:15, rx:7.6, ry:6.0, wob:.04, ph:2.4, pal:'pale', face:'grin', fy:-1},
  kin:    {w:18,h:15, rx:7.6, ry:6.0, wob:.04, ph:.6, pal:'gold', face:'proud', extra:'glint', dim:[[-5.6,2.2],[5.2,-2.8]]},
  nemuri: {w:20,h:19, cy:11.8, rx:7.8, ry:6.1, wob:.04, ph:1, pal:'tan', face:'sleep', extra:'cap', dim:[[5.6,3.2]]},
  shikaku:{w:16,h:15, shape:'square', pal:'tan', face:'serious', dim:[[-4.6,3.6],[4.4,3.8]]},
  deka:   {w:26,h:21, rx:11.8, ry:9.4, wob:.04, ph:.2, pal:'tan', face:'sweat', s:3.5, dim:[[-8.2,-3],[7.6,4.6],[-6.6,5.2],[8.6,-1.6],[1.6,-7]]},
  hoshi:  {w:21,h:20, shape:'star', pal:'pale', face:'happy', fy:1},
  donut:  {w:20,h:17, shape:'ring', pal:'tan', face:'small', fy:-5},
  niji:   {w:18,h:15, rx:7.6, ry:6.0, wob:.04, ph:1.3, pal:'niji', face:'happy'},
  yaki:   {w:18,h:18, cy:10.8, rx:7.6, ry:6.0, wob:.06, ph:1.1, pal:'choco', face:'happy', extra:'steam', dim:[[-5.2,1.8],[4.8,-2.4]]},
  mitsugo:{w:20,h:15, shape:'triple', pal:'tan', face:'trio'},
  hige:   {w:18,h:15, rx:7.6, ry:6.0, wob:.05, ph:2.8, pal:'tan', face:'stache', dim:[[-5.4,-1.8],[5,2.6]]},
  murasaki:{w:17,h:15, rx:7.1, ry:6.0, wob:.05, ph:.4, pal:'purple', face:'smile', dim:[[-5,2.2],[4.6,-2.4]]},
  yuki:   {w:15,h:15, rx:6.4, ry:6.4, pal:'snow', face:'round', extra:'snow', mouth:'#c4566a'},
  kinoko: {w:18,h:19, cy:12, rx:7.4, ry:5.8, wob:.04, ph:.9, pal:'pale', face:'smile', extra:'mush'},
  onigiri:{w:18,h:16, shape:'tri', pal:'pale', face:'smile', fy:-1, extra:'nori'},
  tsuki:  {w:17,h:17, shape:'moon', pal:'lemon', face:'sleep', fxo:-1, fy:3},
  obake:  {w:17,h:18, shape:'ghost', pal:'snow', face:'oh', fy:-1},
  kagami: {w:18,h:15, rx:7.6, ry:6.0, wob:.03, ph:.6, pal:'silver', face:'smile', extra:'mirror'},
  ouji:   {w:18,h:19, cy:12, rx:7.6, ry:6.0, wob:.04, ph:1.9, pal:'pale', face:'proud', extra:'crown'},
  umi:    {w:18,h:15, rx:7.6, ry:6.0, wob:.05, ph:1.4, pal:'blue', face:'smile', extra:'wave', mouth:'#173a5c'},
  kai:    {w:19,h:16, shape:'shell', pal:'coral', face:'smile', fy:1},
  shizuku:{w:14,h:17, shape:'drop', pal:'crystal', face:'tiny', fy:2, s:1.5},
  tako:   {w:19,h:18, cy:7.6, rx:7.6, ry:6.0, wob:.04, ph:.7, pal:'octo', face:'smile', extra:'legs'},
  shinju: {w:15,h:15, rx:6.4, ry:6.4, pal:'pearl', face:'round', extra:'glint'},
  hoshizora:{w:18,h:15, rx:7.6, ry:6.0, wob:.04, ph:2.2, pal:'night', face:'happy', extra:'stars', eye:'#eef2ff', mouth:'#ffb0c4'},
  sakura: {w:19,h:19, shape:'flower', pal:'pink', face:'happy', fy:.5},
  tenshi: {w:22,h:19, cy:12, rx:7.6, ry:6.0, wob:.04, ph:.3, pal:'pale', face:'happy', extra:'halo'},
  maboroshi:{w:18,h:15, rx:7.6, ry:6.0, wob:.04, ph:2.9, pal:'gal', face:'proud', extra:'glint', eye:'#fff6c8', mouth:'#ff9fc8'},
  mugi:   {w:18,h:22, cy:15.8, rx:7.4, ry:5.6, wob:.05, ph:1.5, pal:'pale', face:'smile', extra:'mugi', dim:[[-5,1.6],[4.8,-2]]},
  kinpaku:{w:18,h:15, rx:7.6, ry:6.0, wob:.05, ph:2.1, pal:'tan', face:'happy', extra:'kinpaku', dim:[[-5.4,2.2]]},
  koban:  {w:15,h:20, rx:6.2, ry:8.6, pal:'koban', face:'small', extra:'koban'},
  kinkai: {w:20,h:16, rx:8.2, ry:6.4, wob:.15, ph:.8, pal:'nugget', col:'rough', face:'grin', spk:[[-4,2,1]]},
  nobebou:{w:22,h:14, shape:'poly', pts:[[5,2.4],[17,2.4],[20.6,12.6],[1.4,12.6]], pal:'gold', face:'smile', fy:1, extra:'ingot'},
  medal:  {w:18,h:21, cy:13.6, rx:7, ry:7, pal:'gold', face:'smile', extra:'medal'},
  takara: {w:20,h:17, shape:'combo', b:[[10,6.2,8.6,4.6]], ps:[[[1.4,6.2],[18.6,6.2],[18.6,15.6],[1.4,15.6]]], S:[10,9,8.6,6.8], pal:'wood', face:'smile', fy:2, extra:'chest'},
  kinran: {w:16,h:20, shape:'egg', rx:6.6, ry:8.6, k:.16, pal:'gold', col:'gloss', face:'round', spk:[[3,4,1],[-3,-5,1]]},
  kozuchi:{w:22,h:21, shape:'combo', b:[[11,7.4,10.5,5.6]], pal:'gold', col:'xband', xb:[7.4,'lacq'], face:'happy', extra:'kozuchi', spk:[[2,1,1],[-3,-4,1]]},
  ougon:  {w:24,h:21, rx:9, ry:7.4, wob:.04, ph:.9, pal:'ougon', col:'ougon', face:'proud', extra:'rays', eye:'#6a2a00', mouth:'#b0400a', spk:[[3,3,2],[-4,-5,2],[-3,3,1],[4,-4,1]]},
  kohaku: {w:17,h:15, rx:7.0, ry:6.0, wob:.03, ph:1.1, pal:'amber', col:'clear', face:'smile', extra:'kohaku'},
  turquoise:{w:18,h:15, rx:7.6, ry:6.0, wob:.07, ph:2.6, pal:'turq', col:'vein', face:'happy', mouth:'#1a4a4a'},
  ruby:   {w:16,h:15, shape:'square', pal:'ruby', col:'facet', n:4, tb:.46, face:'round', eye:'#3a0010', mouth:'#5a0018', spk:[[-4,2,1]]},
  sapphire:{w:19,h:15, rx:8.2, ry:6.0, pal:'sapph', col:'facet', n:8, face:'smile', eye:'#061030', mouth:'#061030', spk:[[-4,2,1]]},
  emerald:{w:16,h:17, shape:'poly', pts:[[4.4,1.4],[11.6,1.4],[14.6,4.4],[14.6,12.6],[11.6,15.6],[4.4,15.6],[1.4,12.6],[1.4,4.4]], pal:'emer', col:'step', face:'smile', eye:'#03200f', mouth:'#03200f', spk:[[-4,2,1]]},
  amethyst:{w:20,h:21, cy:14.4, rx:7.8, ry:5.8, wob:.05, ph:.5, pal:'pale', face:'happy', extra:'ame', spk:[[-3,7,1]]},
  opal:   {w:20,h:17, rx:7.2, ry:5.8, pal:'opal', col:'opal', face:'round', extra:'bezel', mouth:'#8a4a7a', spk:[[-3,2,1],[2,-3,1]]},
  yubiwa: {w:18,h:22, cy:6.8, rx:6.6, ry:5.0, pal:'rose', col:'facet', n:8, face:'happy', extra:'ring', spk:[[-3,3,1],[2,10,1]]},
  prism:  {w:22,h:20, shape:'poly', pts:[[11,1.2],[20.6,18.6],[1.4,18.6]], pal:'prism', col:'prism', face:'happy', fy:3, extra:'beam', eye:'#24345e', mouth:'#e0507a', spk:[[11,1,1],[3,-3,1],[-5,-6,2]]},
  diamond:{w:23,h:21, shape:'poly', pts:[[6.4,1.4],[16.6,1.4],[21.6,7.4],[11.5,19.8],[1.4,7.4]], pal:'dia', col:'dia', face:'kira', fy:-1.5, eye:'#1e3a5c', mouth:'#e0507a', spk:[[2,2,2],[-3,4,1],[3,-6,1],[-2,-8,2]]},
  dango:  {w:14,h:22, shape:'combo', b:[[7,4.3,4.4,3.4],[7,10.6,4.4,3.4],[7,16.9,4.4,3.4]], bp:['dpink','dwhite','dgreen'], S:[7,10.6,4.4,3.4], pal:'dwhite', col:'balls', face:'smile', s:1.5, extra:'kushi'},
  ame:    {w:24,h:14, rx:6.2, ry:5.4, pal:'candy', face:'wink', extra:'wrap'},
  purin:  {w:18,h:17, shape:'poly', pts:[[5,3.4],[13,3.4],[14.6,5],[16,14.2],[2,14.2],[3.4,5]], pal:'purin', col:'band', bands:[[6.4,'caramel',1]], face:'smile', fy:1.5, extra:'plate'},
  macaron:{w:20,h:15, shape:'combo', b:[[10,5,8.4,4],[10,11.2,8.4,3.2]], S:[10,7.5,8.4,6], pal:'lilac', col:'balls', face:'smile', fy:-2, extra:'mac'},
  aisu:   {w:16,h:22, shape:'combo', b:[[8,7.4,6.6,5.6]], pal:'mint', col:'chips', face:'happy', extra:'cone'},
  chocogake:{w:18,h:15, rx:7.6, ry:6.0, wob:.05, ph:.2, pal:'pale', col:'band', bands:[[6.4,'choco',1.2]], face:'smile', fy:1.5, extra:'sprinkle'},
  hotcake:{w:22,h:18, shape:'combo', ps:[[[2.4,5],[19.6,5],[20.6,6],[20.6,9],[20,10],[20.6,10.6],[20.6,12.4],[20,13],[20.6,13.6],[20.6,15.4],[19.6,16.4],[2.4,16.4],[1.4,15.4],[1.4,13.6],[2,13],[1.4,12.4],[1.4,10.6],[2,10],[1.4,9],[1.4,6]]], S:[11,8,9.6,4], pal:'hotcake', face:'happy', extra:'hotcake'},
  wataame:{w:20,h:22, cy:8.6, shape:'bump', rx:8.6, ry:7.4, n:10, k:.13, pal:'cotton', col:'cotton', face:'sleep', extra:'stick'},
  parfait:{w:16,h:22, shape:'combo', b:[[8,6.6,5.4,4.4]], pal:'pale', face:'smile', extra:'parfait', spk:[[-2,4,1]]},
  oiwai:  {w:22,h:22, shape:'combo', ps:[[[5.4,6],[16.6,6],[17.6,7],[17.6,14],[4.4,14],[4.4,7]],[[2.4,13.4],[19.6,13.4],[20.6,14.4],[20.6,20.6],[1.4,20.6],[1.4,14.4]]], S:[11,10,6.6,4], pal:'cream', col:'band', bands:[[7.4,'frost',1],[13.4,'cream'],[15.4,'frost',1]], face:'happy', extra:'oiwai', spk:[[2,7,1],[-3,10,1]]},
  neko:   {w:19,h:17, cy:10, rx:7.6, ry:6.0, wob:.04, ph:.6, pal:'tan', face:'cat', extra:'neko'},
  inu:    {w:20,h:15, rx:7.4, ry:6.0, wob:.04, ph:2, pal:'pale', face:'dog', extra:'inu'},
  hiyoko: {w:16,h:18, cy:10.4, rx:6.6, ry:6.0, pal:'lemon', face:'beak', extra:'hiyoko'},
  usagi:  {w:16,h:22, cy:15.2, rx:6.8, ry:5.6, pal:'snow', face:'smile', extra:'usagi', mouth:'#c4566a'},
  kuma:   {w:18,h:17, cy:10, rx:7.6, ry:6.0, wob:.03, ph:.4, pal:'choco', face:'bear', mz:'#e8b47a', extra:'kuma', eye:'#1a0a04'},
  kaeru:  {w:20,h:16, shape:'combo', b:[[10,9.6,8.4,5.4],[5.6,4.6,2.6,2.6],[14.4,4.6,2.6,2.6]], pal:'frog', col:'balls', face:'frog', mouth:'#1f4214'},
  panda:  {w:18,h:17, cy:10, rx:7.6, ry:6, pal:'snow', face:'panda', extra:'panda'},
  penguin:{w:18,h:18, cy:8.8, rx:6.6, ry:6.8, pal:'peng', col:'belly', face:'beak', extra:'penguin'},
  kitsune:{w:22,h:20, cx:10, cy:12, rx:7.2, ry:5.8, pal:'fox', col:'muzzle', face:'happy', fxo:-1, extra:'kitsune', mouth:'#5a2008'},
  lion:   {w:22,h:22, cy:12.4, rx:6.4, ry:5.6, pal:'pale', face:'bear', mz:'#fff2d0', extra:'mane', spk:[[3,3,1],[-3,5,1]]},
  kasei:  {w:16,h:16, rx:6.6, ry:6.6, pal:'mars', col:'mars', face:'smile', extra:'moonlet'},
  inseki: {w:18,h:15, rx:7.4, ry:5.9, wob:.14, ph:2.2, pal:'rock', col:'rough', face:'smile', eye:'#ffe8c0', mouth:'#ff9a5a', extra:'ember'},
  dosei:  {w:24,h:16, rx:6.4, ry:5.8, pal:'saturn', col:'stripe', face:'smile', fy:-1, extra:'saturn'},
  suisei: {w:24,h:15, cx:17, rx:5.6, ry:5.4, pal:'ice', face:'smile', fxo:5, extra:'tail', mouth:'#2a5a8a'},
  uchujin:{w:18,h:20, cy:12.4, rx:7.4, ry:6.2, wob:.03, ph:1.2, pal:'alien', face:'alien', extra:'antenna', eye:'#101820', mouth:'#2a4a10'},
  ufo:    {w:24,h:17, shape:'combo', b:[[12,7,4.8,4.2]], pal:'pale', face:'tiny', s:1.5, extra:'ufo'},
  eisei:  {w:24,h:18, cy:10.4, rx:5.8, ry:5.6, pal:'pale', face:'smile', extra:'eisei'},
  taiyou: {w:22,h:22, rx:6.6, ry:6.6, pal:'sun', face:'shades', extra:'sunray', mouth:'#a83a00'},
  ginga:  {w:20,h:16, rx:8.6, ry:6.6, pal:'galaxy', col:'spiral', face:'happy', eye:'#3a1a6a', mouth:'#d0307a', spk:[[2,2,1],[-3,-3,1]]},
  blackhole:{w:24,h:18, cy:9.2, rx:6.4, ry:6.2, pal:'abyss', col:'hole', face:'round', eye:'#ffe8a0', mouth:'#ff9a6a', extra:'disk', spk:[[2,2,1],[-3,-3,1]]},
  zenmai: {w:22,h:15, cx:9, rx:7.4, ry:6, wob:.05, ph:.9, pal:'tan', face:'smile', fxo:-2, extra:'key'},
  denchi: {w:14,h:21, shape:'combo', ps:[[[3,4],[11,4],[12.6,5.6],[12.6,18.4],[11,20],[3,20],[1.4,18.4],[1.4,5.6]]], S:[7,12,5.6,8], pal:'pale', face:'smile', fy:-2, extra:'battery'},
  haguruma:{w:20,h:20, shape:'gear', n:8, r:8.8, pal:'brass', face:'smile', extra:'bolt'},
  jishaku:{w:20,h:20, shape:'magnet', pal:'silver', col:'band', bands:[[15.5,'lacq']], face:'happy', mouth:'#4a0a0a'},
  denkyu: {w:18,h:21, shape:'combo', b:[[9,7.6,6.8,6.6]], ps:[[[5.6,12],[12.4,12],[11.4,15.4],[6.6,15.4]]], pal:'bulb', col:'clear', face:'happy', extra:'socket'},
  robot:  {w:20,h:19, shape:'combo', ps:[[[4.4,6],[15.6,6],[17,7.4],[17,16.6],[15.6,18],[4.4,18],[3,16.6],[3,7.4]]], S:[10,12,7,6], pal:'steel', face:'robo', extra:'robot'},
  kikansha:{w:24,h:18, shape:'combo', b:[[10,9,7.8,4.4]], pal:'tan', face:'smile', fxo:-2, extra:'loco'},
  rocket: {w:18,h:22, shape:'combo', b:[[9,10.8,5.6,7.2]], pal:'pale', face:'smile', fy:1, extra:'rocket', spk:[[2,3,1],[-3,8,1]]},
  orgel:  {w:20,h:21, shape:'combo', b:[[10,6.6,5.6,4.8]], pal:'pale', face:'sleep', extra:'orgel'},
  tokitome:{w:22,h:22, cy:12.6, rx:7, ry:7, pal:'dial', face:'proud', extra:'watch', spk:[[2,5,2],[-3,-4,1]]},
  yousei: {w:22,h:18, cy:10.6, rx:5.8, ry:5.4, pal:'pale', face:'happy', s:2, extra:'fairy'},
  oni:    {w:18,h:18, cy:11, rx:7.6, ry:6, wob:.05, ph:1.6, pal:'oni', face:'oni', extra:'tsuno', mouth:'#4a1010'},
  seirei: {w:18,h:19, shape:'combo', b:[[9,12.4,6.4,5.6]], ps:[[[2.8,11.4],[3.2,6.6],[5.4,8],[6.2,3.4],[8.4,6.4],[10,1.2],[11.2,6.2],[13.2,3],[13.6,8],[15.2,6.4],[15.2,11.4]]], pal:'spirit', col:'glow', face:'smile', fy:.5, extra:'orbs', eye:'#2a2a7a', mouth:'#5a4ab8'},
  unicorn:{w:19,h:21, cy:14, rx:7.4, ry:5.8, wob:.03, pal:'snow', face:'happy', extra:'unicorn', mouth:'#c4566a'},
  seiken: {w:18,h:22, cy:16, rx:7.4, ry:5.4, wob:.05, ph:.7, pal:'tan', face:'oh', extra:'sword'},
  mahou:  {w:22,h:22, cy:16, rx:7.6, ry:5.4, pal:'pale', face:'smile', extra:'witch'},
  dragon: {w:24,h:21, cy:13, rx:7.2, ry:6.0, pal:'dragon', col:'scale', face:'fang', extra:'dragon', spk:[[3,3,1],[-3,-3,1]]},
  fushichou:{w:24,h:21, cy:12.4, rx:6.4, ry:5.8, pal:'phoenix', col:'fire', face:'beak', bk:'#fff07a', extra:'phoenix', eye:'#4a0a00', spk:[[3,3,1],[-3,-3,1]]},
  imoou:  {w:24,h:22, cy:14.4, rx:8.6, ry:6.6, wob:.03, ph:1, pal:'pale', face:'kira', extra:'king', spk:[[2,2,1],[-3,3,2]]},
  densetsu:{w:24,h:22, cy:12.6, rx:8.6, ry:7.4, wob:.02, pal:'legend', col:'legend', n:8, tb:.56, face:'kira', extra:'aura', eye:'#5a2a00', mouth:'#c0402a', spk:[[3,3,2],[-4,-5,2],[-3,4,1],[4,-4,1]]},
};
function shapeOf(sp){
  const W = sp.w, H = sp.h, cx = sp.cx ?? W/2, cy = sp.cy ?? H/2;
  switch (sp.shape){
    case 'heart': { const tri = [[cx-7.9, cy-1.2], [cx+7.9, cy-1.2], [cx, cy+7.6]]; return {cx, cy, hx:7.6, hy:7, f:(x, y) => (x-(cx-3.7))**2 + (y-(cy-2.6))**2 <= 4.5*4.5 || (x-(cx+3.7))**2 + (y-(cy-2.6))**2 <= 4.5*4.5 || pip(tri, x, y)}; }
    case 'twin': { const c1 = [cx-4.1, cy+.6, 5.5], c2 = [cx+3.9, cy-.2, 5.9]; return {cx, cy, hx:9.5, hy:6, c1, c2, f:(x, y) => (x-c1[0])**2 + (y-c1[1])**2 <= c1[2]**2 || (x-c2[0])**2 + (y-c2[1])**2 <= c2[2]**2}; }
    case 'star': { const R = (Math.min(W, H)-2)/2, r = R*.56, pts = []; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r : R; pts.push([cx + Math.cos(a)*rr, cy + .7 + Math.sin(a)*rr]); } return {cx, cy, hx:R, hy:R, f:(x, y) => pip(pts, x, y)}; }
    case 'square': { const a = (W-2)/2 - .1, b = (H-2)/2 - .1, rc = 3; return {cx, cy, hx:a, hy:b, f:(x, y) => { const dx = Math.abs(x-cx), dy = Math.abs(y-cy); if (dx > a || dy > b) return false; if (dx <= a-rc || dy <= b-rc) return true; return (dx-(a-rc))**2 + (dy-(b-rc))**2 <= rc*rc; }}; }
    case 'ring': { const rx = (W-2)/2 - .1, ry = (H-2)/2 - .1; return {cx, cy, hx:rx, hy:ry, f:(x, y) => { const o = ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1; const i = ((x-cx)/(rx*.38))**2 + ((y-cy-.8)/(ry*.36))**2 <= 1; return o && !i; }}; }
    case 'poly': return {cx, cy, hx:(W-2)/2, hy:(H-2)/2, f:(x, y) => pip(sp.pts, x, y)};
    case 'triple': { const cs = [[cx-5, cy+2, 3.8], [cx+5, cy+2, 3.8], [cx, cy-2.4, 4.1]]; return {cx, cy, hx:9, hy:6, cs, f:(x, y) => cs.some(([a, b, r]) => (x-a)**2 + (y-b)**2 <= r*r)}; }
    case 'tri': { const pts = [[cx-2.2, 1.4], [cx+2.2, 1.4], [W-1.3, H-4.4], [W-3.4, H-1.3], [3.4, H-1.3], [1.3, H-4.4]]; return {cx, cy, hx:(W-2)/2, hy:(H-2)/2, f:(x, y) => pip(pts, x, y)}; }
    case 'moon': { const r = (Math.min(W, H)-2)/2; return {cx, cy, hx:r, hy:r, f:(x, y) => (x-cx)**2 + (y-cy)**2 <= r*r && (x-(cx+3.6))**2 + (y-(cy-3.2))**2 > 5.7*5.7}; }
    case 'ghost': { const rx = (W-2)/2 - .1, top = 8; return {cx, cy, hx:rx, hy:(H-2)/2, f:(x, y) => { if (y < top) return ((x-cx)/rx)**2 + ((y-top)/7)**2 <= 1; if (Math.abs(x-cx) > rx) return false; return y <= H - 1.4 - (Math.sin((x-cx)*1.35) + 1)*1.1; }}; }
    case 'shell': { const px = cx, py = H - 2, R = 11.6; return {cx, cy:py - 6, hx:7.5, hy:6.5, px, py, f:(x, y) => { if (Math.abs(x-px) <= 4.2 && y >= py - .6 && y <= py + 1.2) return true; const a = Math.atan2(y-py, x-px), d = Math.hypot(x-px, y-py); if (a > -.7 || a < -Math.PI + .7) return false; return d <= R - 1*(.5 - .5*Math.cos((a + Math.PI)*22)); }}; }
    case 'drop': { const tri = [[cx, 1.2], [cx-4.9, cy+1.4], [cx+4.9, cy+1.4]]; return {cx, cy:cy+1, hx:5.5, hy:7, f:(x, y) => (x-cx)**2 + (y-(cy+2.2))**2 <= 5.5*5.5 || pip(tri, x, y)}; }
    case 'combo': { const [x0, y0, rx0, ry0] = sp.S || sp.b[0]; return {cx:x0, cy:y0, hx:rx0, hy:ry0, f:(x, y) => (sp.b || []).some(([a, b, rx, ry]) => ((x-a)/rx)**2 + ((y-b)/ry)**2 <= 1) || (sp.ps || []).some(p => pip(p, x, y))}; }
    case 'egg': { const {rx, ry} = sp, k = sp.k ?? .15; return {cx, cy, hx:rx, hy:ry, f:(x, y) => { const dy = (y-cy)/ry; return ((x-cx)/(rx*(1 + k*dy)))**2 + dy*dy <= 1; }}; }
    case 'gear': { const R = sp.r ?? (Math.min(W, H)-2)/2, n = sp.n || 8; return {cx, cy, hx:R*.85, hy:R*.85, f:(x, y) => Math.hypot(x-cx, y-cy) <= R*(Math.cos(n*Math.atan2(y-cy, x-cx)) > -.15 ? 1 : .78)}; }
    case 'bump': { const {rx, ry} = sp, n = sp.n || 8, k = sp.k ?? .12; return {cx, cy, hx:rx, hy:ry, f:(x, y) => { const dx = (x-cx)/rx, dy = (y-cy)/ry; return Math.hypot(dx, dy) <= 1 - k + k*Math.abs(Math.cos(Math.atan2(dy, dx)*n/2)); }}; }
    case 'magnet': { const R = 8.4, r = 2.6, yc = 9.4; return {cx, cy:yc - 3.6, hx:R, hy:5.5, f:(x, y) => { const dx = x-cx, dy = y-yc, o = dy < 0 ? (dx/R)**2 + (dy/(R*.92))**2 <= 1 : Math.abs(dx) <= R && y <= H - 1.4, i = dy < 0 ? (dx/r)**2 + (dy/r)**2 <= 1 : Math.abs(dx) <= r; return o && !i; }}; }
    case 'flower': { const R = (Math.min(W, H)-2)/2; return {cx, cy, hx:R, hy:R, f:(x, y) => { const a = Math.atan2(y-cy, x-cx), d = Math.hypot(x-cx, y-cy); return d <= R*(.6 + .4*Math.abs(Math.cos(2.5*(a + Math.PI/2)))); }}; }
    default: { const {rx, ry} = sp, wob = sp.wob || 0, ph = sp.ph || 0; return {cx, cy, hx:rx, hy:ry, f:(x, y) => { const dx = (x-cx)/rx, dy = (y-cy)/ry; let r = Math.hypot(dx, dy); if (wob){ const t = Math.atan2(dy, dx); r /= 1 + wob*Math.sin(3*t + ph) + wob*.6*Math.sin(5*t + ph*2.3); } return r <= 1; }}; }
  }
}
function nijiCol(x, y, t){
  const base = NIJI[((Math.floor((x + y*.9)/2.4)) % 6 + 6) % 6];
  if (t === 'h') return WHITE; if (t === 'l') return mix(base, WHITE, .45); if (t === 'd') return mix(base, '#553876', .38); return base;
}
function pearlCol(x, y, t){
  const base = ['#f6e4f0','#e3ecfb','#fbefdf','#e6f6ec'][((Math.floor((x - y*.7)/3)) % 4 + 4) % 4];
  if (t === 'h') return WHITE; if (t === 'l') return mix(base, WHITE, .55); if (t === 'd') return mix(base, '#a993b4', .5); return base;
}
