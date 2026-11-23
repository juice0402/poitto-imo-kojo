/* ---------- 畑5〜11の70しゅるい用（2026-11-15 ぽぽち） ---------- */
const LA = Math.atan2(-.8, -.6);
const inE = (x, y, cx, cy, rx, ry) => ((x - cx)/rx)**2 + ((y - cy)/ry)**2 <= 1;
const inR = (x, y, cx, cy, rx, ry, a) => { const c = Math.cos(a), s = Math.sin(a), u = (x - cx)*c + (y - cy)*s, v = (y - cy)*c - (x - cx)*s; return (u/rx)**2 + (v/ry)**2 <= 1; };
const hsh = (x, y) => (((x*73856093) ^ (y*19349663)) >>> 0);
const nrm = (x, y, S) => [(x + .5 - S.cx)/S.hx, (y + .5 - S.cy)/S.hy];
function spk(pb, x, y, r = 1, c = WHITE, c2 = '#fff3a0'){ pb.set(x, y, c, 'fx'); for (let i = 1; i <= r; i++) for (const [a, b] of N4) pb.set(x + a*i, y + b*i, i < r ? c : c2, 'fx'); }
function tfill(pb, fn, Q, mat, cx, cy, r, back){ pb.fill((x, y) => fn(x, y) && !(back && pb.get(Math.floor(x), Math.floor(y))), (x, y) => { const L = -((x + .5 - cx)*.6 + (y + .5 - cy)*.8)/r; return L > .45 ? Q.l : L < -.4 ? Q.d : Q.b; }, mat); }
const gsh = (x, y, cx, cy, r) => { const L = -((x + .5 - cx)*.6 + (y + .5 - cy)*.8)/r; return L > .55 ? '#fff6b0' : L > .2 ? '#ffe164' : L > -.2 ? '#ffc21e' : L > -.55 ? '#e89a10' : '#b86c06'; };
function stamp(pb, rows, x0, y0, cm, mat){ rows.forEach((r, j) => [...r].forEach((ch, i) => { if (cm[ch]) pb.set(x0 + i, y0 + j, cm[ch], mat); })); }
function xtal(pb, bx, by, ang, len, wd, Q, mat){
  const ux = Math.sin(ang), uy = -Math.cos(ang), px = -uy, py = ux, sh = len - wd*1.1, Pt = (u, v) => [bx + ux*v + px*u, by + uy*v + py*u];
  const pts = [Pt(-wd, 0), Pt(-wd, sh), Pt(0, len), Pt(wd, sh), Pt(wd, 0)];
  pb.fill((x, y) => pip(pts, x, y), (x, y) => { const u = (x + .5 - bx)*px + (y + .5 - by)*py; return u < -wd*.3 ? Q.l : u > wd*.35 ? Q.d : Q.b; }, mat);
}
const FT = {4:'mdbl', 8:'mdmlblbl'};
function facetT(x, y, t, S, sp){
  const [dx, dy] = nrm(x, y, S), n = sp.n || 8;
  if (t === 'h') return ['h', -1];
  if ((n === 4 ? Math.max(Math.abs(dx), Math.abs(dy)) : Math.hypot(dx, dy)) < (sp.tb || .5)) return [t === 'd' ? 'm' : dx + dy < -.5 ? 'l' : 'b', -1];
  const k = (Math.round(Math.atan2(dy, dx)/(2*Math.PI)*n) % n + n) % n, f = FT[n][k];
  return [t === 'd' ? (f === 'l' || f === 'b' ? 'm' : 'd') : f, k];
}
const fc = (P, u) => u === 'm' ? mix(P.b, P.d, .5) : P[u];
const COL = {
  facet: (x, y, t, S, P, sp) => fc(P, facetT(x, y, t, S, sp)[0]),
  legend(x, y, t, S, P, sp){ const [u, k] = facetT(x, y, t, S, sp), [nx, ny] = nrm(x, y, S), h = hsh(x, y) % 13;
    if (Math.abs(nx) > .55 || Math.abs(ny) > .45){ if (h === 0) return WHITE; if (h === 1) return '#ffd8f4'; if (h === 2) return '#c8f4ff'; }
    return fc(k >= 0 && k % 2 ? PAL.dia : P, u); },
  band(x, y, t, S, P, sp){ for (const [yy, pn, dr] of sp.bands) if (y < yy + (dr ? [0, 1, 2, 1, 0, 0, 1, 0][x % 8]*dr : 0)) return PAL[pn][t]; return P[t]; },
  balls(x, y, t, S, P, sp){ const i = sp.b.findIndex(([a, b, rx, ry]) => inE(x + .5, y + .5, a, b, rx, ry)); if (i < 0) return P[t];
    const [a, b, rx, ry] = sp.b[i], Q = PAL[(sp.bp || [])[i]] || P, L = -((x + .5 - a)/rx*.6 + (y + .5 - b)/ry*.8), j = sp.b.findIndex(([a, b, rx, ry]) => inE(x + .5, y + 1.5, a, b, rx, ry));
    if (j >= 0 && j !== i) return mix(Q.d, Q.o, .45);
    return Q[t === 'd' || t === 'h' ? t : L > .5 ? 'l' : L < -.45 ? 'd' : t]; },
  rough: (x, y, t, S, P) => t === 'b' && hsh(x, y) % 7 === 0 ? P.d : t === 'l' && hsh(x, y) % 5 === 0 ? P.h : P[t],
  gloss(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); return t !== 'd' && Math.abs(nx + .5 + ny*.15) < .12 && ny > -.62 && ny < .15 ? P.h : P[t]; },
  xband: (x, y, t, S, P, sp) => Math.abs(x + .5 - S.cx) > sp.xb[0] ? PAL[sp.xb[1]][t] : P[t],
  ougon(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S), L = -(nx*.6 + ny*.8), s = nx - ny*.7;
    if (t === 'h') return P.h; if (t === 'd') return P.d;
    if (Math.abs(s + .42) < .09 || Math.abs(s - .3) < .05) return L > -.2 ? P.h : P.l;
    return L > .45 ? P.l : L > .1 ? '#ffd23a' : L > -.3 ? P.b : '#f0a010'; },
  clear(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); if (t === 'h' || t === 'd') return P[t]; return (nx - .25)**2 + (ny - .3)**2 < .14 ? P.l : t === 'l' ? P.l : nx + ny < -.95 ? P.d : P.b; },
  vein(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); return t !== 'h' && (Math.abs(nx) > .45 || ny < -.5) && Math.abs(Math.sin(x*.9 + y*.5) + Math.cos(y*1.2 - x*.35)) < .2 ? '#7a6040' : P[t]; },
  step(x, y, t, S, P){ if (t === 'h') return P.h; const ax = Math.abs(x + .5 - S.cx), ay = Math.abs(y + .5 - S.cy), dx = S.hx - ax, dy = S.hy - ay, lo = dx < dy ? x + .5 > S.cx : y + .5 > S.cy, de = Math.min(dx, dy);
    if (de < 1.6) return lo ? P.d : P.l; if (de < 3.2) return lo ? P.l : P.b; return t === 'd' ? P.d : P.b; },
  opal(x, y, t, S, P){ if (t === 'h') return P.h; const k = hsh(x >> 1, (y + (x >> 2)) >> 1) % 7; return k < 5 ? mix(P[t], ['#8ee8c8','#8ab8ff','#ff9ad6','#ffd88a','#b4a0ff'][k], t === 'd' ? .4 : .55) : P[t]; },
  prism(x, y, t, S, P){ if (t === 'h') return P.h; const k = Math.floor((y - 13.5) - (x - S.cx)*.3);
    if (k >= 0 && k < 6 && t !== 'd') return mix(NIJI[k], WHITE, .25);
    return x + .5 < S.cx - .5 ? (t === 'd' ? P.d : P.l) : x + .5 < S.cx + .5 ? P.h : t === 'l' ? P.b : P[t]; },
  dia(x, y, t, S, P){ const X = x + .5 - S.cx, Y = y + .5, g = 7.4;
    if (Math.abs(Y - g) < .5) return P.h;
    if (Y < g){ if (Math.abs(X) < 4.6 - (Y - 1.4)*.2 && Y < 4.4) return Y < 2.4 ? P.h : P.l; return (Math.floor((X + 20 + Y*.9*(X < 0 ? -1 : 1))/2.6) % 2) ? P.b : P.l; }
    const k = Math.floor(X/(19.8 - Y + .01)*5 + 5); return ['#9ccae8', P.l, '#bfe2f8', '#ffe0f4', P.l, P.b, '#d8f0ff', '#c8f4ec', P.b, '#9ccae8'][k] || P.b; },
  chips: (x, y, t, S, P) => t !== 'h' && hsh(x, y) % 9 === 0 && (Math.abs(x + .5 - S.cx) > 5 || Math.abs(y + .5 - S.cy) > 2.5) ? '#5a2e1a' : P[t],
  cotton: (x, y, t, S, P) => Math.floor((x*.7 + y)/3.2) % 3 === 0 && t !== 'h' ? mix(P[t], '#a8d8ff', .55) : P[t],
  belly(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); return (nx/.74)**2 + ((ny - .22)/.86)**2 <= 1 ? PAL.snow[t === 'l' ? 'h' : t] : P[t]; },
  muzzle(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); return ny > .2 - Math.abs(nx)*.3 ? PAL.snow[t] : P[t]; },
  mars(x, y, t, S, P){ const [, ny] = nrm(x, y, S); if (ny < -.74 && t !== 'd') return t === 'h' ? WHITE : '#fff4ec'; return t === 'b' && Math.sin(x*.9 + y*.3) + Math.cos(y*1.3 - x*.4) > 1.15 ? P.d : P[t]; },
  stripe: (x, y, t, S, P) => t === 'b' && [0, 1, 0, 0, 1, 1, 0][y % 7] ? mix(P.b, P.d, .55) : P[t],
  spiral(x, y, t, S, P){ const [dx, dy] = nrm(x, y, S), r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    if (r < .24) return '#fff8e4'; if (r < .36) return '#ffe0f4'; if (r < .47) return '#e8b0f8';
    const u = ((a - r*4.6) % Math.PI + 2*Math.PI) % Math.PI; if (u < .75) return r < .66 ? '#d8a0ff' : '#9a6ae0';
    return t === 'h' ? P.h : hsh(x, y) % 13 === 0 ? WHITE : P[t]; },
  hole(x, y, t, S, P){ const r = Math.hypot(...nrm(x, y, S)); return r > .84 ? '#2c1a5a' : r > .7 ? P.l : P.b; },
  glow(x, y, t, S, P){ const r = Math.hypot(...nrm(x, y, S)); return t === 'd' ? P.d : r < .35 ? P.h : r < .65 ? P.l : t === 'l' ? P.l : P.b; },
  scale(x, y, t, S, P){ const [nx, ny] = nrm(x, y, S); if (ny > .15 && Math.abs(nx) < .55 - ny*.2) return y % 2 ? '#f4e2a8' : '#e0c47a'; return t === 'b' && (x + (y % 4 ? 0 : 2)) % 4 === 0 && y % 2 === 0 ? P.d : P[t]; },
  fire(x, y, t, S, P){ const [, ny] = nrm(x, y, S); if (t === 'h') return P.h; const c = ny < -.45 ? '#ffe45a' : ny < .05 ? '#ffb42a' : ny < .5 ? '#ff7a1e' : '#e8441a'; return t === 'd' ? mix(c, '#8a1a0a', .45) : t === 'l' ? mix(c, WHITE, .4) : c; },
};
const BF = (pb, fn) => (x, y) => fn(x, y) && !pb.get(Math.floor(x), Math.floor(y));
const XA = {
  mugi(pb, S){ const x = Math.round(S.cx) - 1, t = Math.round(S.cy - S.hy);
    pb.rect(x, t - 3, 1, 3, '#6aaa3a', 'sprout'); pb.set(x - 1, t - 2, '#a6dc6c', 'sprout'); pb.set(x - 2, t - 3, '#a6dc6c', 'sprout');
    stamp(pb, ['..L..', '.LYY.', '..Y..', '.LYY.', '..Y..', '.LYY.', '..d..'], x - 2, t - 9, {L:'#ffe680', Y:'#f2ba1e', d:'#d89a20'}, 'mugi');
    stamp(pb, ['a...a', '.a.a.'], x - 2, t - 11, {a:'#fff0b0'}, 'fx'); },
  medal(pb, S){ const c = S.cx, t = S.cy - S.hy + 1.5;
    for (const [s, A, B] of [[-1, '#e2553f', '#ff9a86'], [1, '#3f7fe0', '#9cc8ff']]) pb.fill(BF(pb, (x, y) => pip([[c + s*7, 0], [c + s*3.4, 0], [c + s*.2, t], [c + s*3.8, t]], x, y)), (x, y) => (x*s + y*.5) % 3 < 1 ? B : A, 'ribbon'); },
  kozuchi(pb, S, sp, P, ins, W, H){ const x = Math.round(S.cx) - 1, y0 = Math.round(S.cy + S.hy) - 1; pb.rect(x, y0, 2, H - 2 - y0, '#d42e2e', 'lacq'); pb.rect(x, y0, 1, H - 2 - y0, '#f26452', 'lacq');
    pb.rect(x - 1, y0, 4, 1, '#f2ba1e', 'gold'); pb.rect(x - 1, H - 3, 4, 2, '#f2ba1e', 'gold'); pb.rect(x - 1, H - 2, 4, 1, '#cb8a10', 'gold'); pb.set(x - 1, H - 3, '#fff3a0', 'gold'); },
  ame(pb, S){ const t = S.cy - S.hy, Q = {d:'#6a3aa0', b:'#9a64d6', l:'#d4acf8'};
    for (const [dx, a, len, wd] of [[-4, -.55, 6.4, 1.9], [4.2, .5, 6, 1.8], [-.2, .05, 9, 2.3]]) xtal(pb, S.cx + dx, t + 2.6, a, len, wd, Q, 'gem'); },
  bezel(pb, S){ tfill(pb, (x, y) => inE(x, y, S.cx, S.cy, S.hx + 1.7, S.hy + 1.7), {d:'#cb8a10', b:'#f2ba1e', l:'#ffe98a'}, 'gold', S.cx, S.cy, S.hx + 1.7, true); },
  ring(pb, S, sp, P, ins, W, H){ const c = S.cx, y = H - 6.6;
    tfill(pb, (x, b) => inE(x, b, c, y, 6.6, 5.4) && !inE(x, b, c, y - .3, 4.6, 3.6), {d:'#cb8a10', b:'#f2ba1e', l:'#ffe98a'}, 'gold', c, y - 2, 6, true);
    tfill(pb, (x, b) => b > S.cy + 2 && b < S.cy + S.hy + 1.8 && Math.abs(x - c) < 4.6 - (b - S.cy - 2)*.7, {d:'#cb8a10', b:'#f2ba1e', l:'#ffe98a'}, 'gold', c, S.cy, 5, true); },
  kushi(pb, S, sp, P, ins, W, H){ const x = Math.round(S.cx) - 1; pb.rect(x, 0, 2, 1, '#e8c890', 'wood'); pb.rect(x, H - 2, 2, 2, '#e8c890', 'wood'); pb.set(x + 1, H - 1, '#c8a060', 'wood'); },
  wrap(pb, S){ for (const s of [-1, 1]){ const x0 = S.cx + s*(S.hx - .6); pb.fill(BF(pb, (x, y) => { const d = (x - x0)*s; return d > 0 && d < 5.6 && Math.abs(y - S.cy) < .9 + d*.95 - (d > 4.4 && Math.floor(y) % 2 ? 1 : 0); }), (x, y) => Math.abs(x + .5 - x0) < 1.2 ? '#7ab8e8' : (x + y) % 3 ? '#cdeeff' : '#94d0f4', 'wrap'); } },
  plate(pb, S, sp, P, ins, W, H){ tfill(pb, (x, y) => inE(x, y, S.cx, H - 2.6, 8.6, 1.7), {d:'#b8c4d8', b:'#e8eef6', l:'#ffffff'}, 'plate', S.cx, H - 3, 3, true);
    pb.disc(S.cx, 2.2, 1.3, '#e2253f', 'berry'); pb.set(Math.round(S.cx), 0, '#5fa83a', 'sprout'); },
  cone(pb, S, sp, P, ins, W, H){ const pts = [[S.cx - 5.6, S.cy + 3], [S.cx + 5.6, S.cy + 3], [S.cx + .6, H - .8], [S.cx - .6, H - .8]];
    pb.fill(BF(pb, (x, y) => pip(pts, x, y)), (x, y) => (x + y) % 3 === 0 || (x - y + 30) % 3 === 0 ? '#c0782e' : '#eab060', 'cone'); },
  stick(pb, S, sp, P, ins, W, H){ const x = Math.round(S.cx) - 1; pb.fill(BF(pb, (a, b) => a > x && a < x + 2 && b > S.cy + 4 && b < H - 1), (a) => a < x + 1 ? '#fff0c8' : '#e0c080', 'wood'); },
  hotcake(pb, S){ const x = Math.round(S.cx) - 2; pb.rect(x, 2, 4, 3, '#ffe680', 'butter'); pb.rect(x, 2, 4, 1, '#fff8c8', 'butter'); pb.rect(x + 3, 3, 1, 2, '#f0c040', 'butter'); },
  parfait(pb, S, sp, P, ins, W, H){ const c = S.cx;
    pb.fill(BF(pb, (x, y) => pip([[11.4, 1.6], [13.4, .8], [14.6, 8], [12.6, 8.6]], x, y)), (x, y) => (x + y) % 2 ? '#f6d080' : '#d8a040', 'wood');
    tfill(pb, (x, y) => inE(x, y, c, 10.4, 7, 1.9) && y > 9, {d:'#e0d8cc', b:'#fffaf2', l:'#ffffff'}, 'cream', c, 9.6, 4, true);
    const g = [[1.6, 10.4], [14.4, 10.4], [11.4, 16.6], [4.6, 16.6]];
    pb.fill(BF(pb, (x, y) => pip(g, x, y)), (x, y) => y < 12 ? '#fffaf2' : y < 14 ? '#e8384a' : y < 15 ? '#fffaf2' : '#f2c050', 'glass');
    pb.rect(c - 1, 16, 2, 3, '#cdeaf8', 'glass'); pb.fill(BF(pb, (x, y) => inE(x, y, c, 19.8, 4.2, 1.3)), '#cdeaf8', 'glass');
    pb.disc(c - 3.4, 2.6, 1.4, '#e2253f', 'berry'); pb.set(Math.round(c - 3), 0, '#5fa83a', 'sprout'); pb.set(Math.round(c - 3), 1, '#5fa83a', 'sprout'); },
  oiwai(pb, S, sp, P, ins, W, H){ [[6, '#ffb0c8'], [10, '#a8d8ff'], [14, '#ffe680']].forEach(([x, c]) => { pb.rect(x, 2, 2, 4, c, 'candle'); pb.rect(x + 1, 2, 1, 4, mix(c, '#000000', .15), 'candle'); });
    for (const x of [2, 18]){ pb.rect(x, 12, 2, 2, '#e2253f', 'berry'); pb.set(x, 12, '#ff7a8a', 'berry'); pb.set(x + (x < 9 ? 1 : 0), 11, '#5fa83a', 'berry'); } },
  neko(pb, S, sp, P){ const t = S.cy - S.hy; for (const s of [-1, 1]){
    tfill(pb, (x, y) => pip([[S.cx + s*7.2, t + 3], [S.cx + s*6, t - 3.4], [S.cx + s*1.8, t + .8]], x, y), P, 'body', S.cx, S.cy, S.hx);
    pb.fill((x, y) => pip([[S.cx + s*6.2, t + 1.8], [S.cx + s*5.8, t - 1.6], [S.cx + s*3.4, t + 1]], x, y), '#f4a0a0', 'body'); } },
  inu(pb, S){ const Q = {d:'#6a3a1a', b:'#94592c', l:'#b87a44'}; for (const s of [-1, 1]) tfill(pb, (x, y) => pip([[S.cx + s*4.4, S.cy - S.hy + .4], [S.cx + s*7.8, S.cy - S.hy + 1], [S.cx + s*9.2, S.cy + 1.6], [S.cx + s*8, S.cy + 3.4], [S.cx + s*6.2, S.cy + 1]], x, y), Q, 'ear', S.cx + s*7, S.cy - 2, 4); },
  hiyoko(pb, S, sp, P, ins, W, H){ const t = Math.round(S.cy - S.hy), c = Math.round(S.cx);
    for (const [x, y, k] of [[c - 1, t - 1, 'b'], [c, t - 1, 'b'], [c, t - 2, 'l'], [c + 1, t - 3, 'l'], [c - 1, t - 3, 'b']]) pb.set(x, y, P[k], 'body');
    for (const s of [-1, 1]) pb.fill((x, y) => inR(x, y, S.cx + s*(S.hx - .9), S.cy + 1.4, 1.7, 1.1, s*.7), P.d, 'body');
    for (const dx of [-3, 1]) pb.rect(c + dx, Math.round(S.cy + S.hy) - 1, 2, 1, '#ff9a2a', 'beak'); },
  usagi(pb, S, sp, P){ const t = S.cy - S.hy; for (const s of [-1, 1]){ const ex = S.cx + s*2.8, ey = t - 3.6;
    tfill(pb, (x, y) => inE(x + (y - ey)*s*.22, y, ex, ey, 1.9, 4.6), P, 'body', ex, ey, 3);
    pb.fill((x, y) => inE(x + (y - ey)*s*.22, y, ex, ey + .6, .8, 3.2), '#f6a8b8', 'body'); } },
  kuma(pb, S, sp, P){ const t = S.cy - S.hy; for (const s of [-1, 1]){ tfill(pb, (x, y) => inE(x, y, S.cx + s*5.2, t + .9, 2.5, 2.4), P, 'body', S.cx + s*5.2, t + .9, 2.5); pb.disc(S.cx + s*5.2, t + 1.2, 1.1, P.l, 'body'); } },
  panda(pb, S){ const t = S.cy - S.hy, Q = {d:'#16161c', b:'#2a2a34', l:'#4a4a58'}; for (const s of [-1, 1]) tfill(pb, (x, y) => inE(x, y, S.cx + s*5.2, t + .9, 2.5, 2.4), Q, 'ink', S.cx + s*5.2, t + .9, 2.5); },
  penguin(pb, S, sp, P){ for (const s of [-1, 1]){ tfill(pb, (x, y) => pip([[S.cx + s*(S.hx - 1.4), S.cy - .6], [S.cx + s*(S.hx + 1.6), S.cy + 3.6], [S.cx + s*(S.hx - .6), S.cy + 3.8]], x, y), P, 'body', S.cx, S.cy, S.hx);
    pb.rect(Math.round(S.cx + s*2.4) - (s < 0 ? 2 : 0), Math.round(S.cy + S.hy) - 1, 2, 1, '#ff9a2a', 'beak'); } },
  kitsune(pb, S, sp, P, ins, W, H){ const t = S.cy - S.hy, c = S.cx;
    tfill(pb, BF(pb, (x, y) => inR(x, y, c + 8.2, S.cy - 2.8, 2.7, 5.4, .32)), P, 'tail', c + 8, S.cy - 4, 4);
    pb.fill((x, y) => pb.mat(Math.floor(x), Math.floor(y)) === 'tail' && y < S.cy - 6.2, (x, y) => y < S.cy - 7.6 ? WHITE : PAL.snow.b, 'tail');
    for (const s of [-1, 1]){ tfill(pb, (x, y) => pip([[c + s*6.6, t + 2.6], [c + s*5.6, t - 4.4], [c + s*1.8, t + .8]], x, y), P, 'body', c, S.cy, S.hx);
      pb.fill((x, y) => pip([[c + s*6.6, t + 2.6], [c + s*5.6, t - 4.4], [c + s*1.8, t + .8]], x, y) && y < t - 1.8, '#5a2a10', 'body');
      pb.fill((x, y) => pip([[c + s*5.4, t + 1.6], [c + s*5.2, t - 1.2], [c + s*3.4, t + 1]], x, y), '#fff0d8', 'body'); } },
  mane(pb, S, sp, P){ pb.fill(BF(pb, (x, y) => { const dx = x - S.cx, dy = (y - S.cy)*1.05, a = Math.atan2(dy, dx); return Math.hypot(dx, dy) <= 9.2*(.82 + .14*Math.abs(Math.cos(a*6)) + .04*Math.sin(a*11)); }), (x, y) => { const d = Math.hypot(x + .5 - S.cx, y + .5 - S.cy), j = hsh(x, y) % 4 === 0 ? .7 : 0; return d + j > 8 ? '#8a3a12' : d + j > 6.9 ? '#b85a1a' : '#e08a2a'; }, 'mane');
    for (const s of [-1, 1]){ pb.disc(S.cx + s*4.4, S.cy - S.hy + .2, 1.6, P.b, 'body'); pb.set(Math.floor(S.cx + s*4.4), Math.floor(S.cy - S.hy + .2), '#e8a088', 'body'); }
    stamp(pb, ['w..w..w', 'L.YLY.Y', 'LYYrYYD', 'DDDDDDD'], Math.round(S.cx) - 4, 1, {w:'#ffffff', L:'#ffe164', Y:'#f2ba1e', D:'#cb8a10', r:'#e2253f'}, 'gold'); },
  saturn(pb, S){ const cy = S.cy + 1.8, a = -.2, Q = ['#f0e4ff', '#c4aef0', '#9a82d8'];
    pb.fill((x, y) => { if (!inR(x, y, S.cx, cy, 11.2, 2.9, a) || inR(x, y, S.cx, cy, 8, 1.3, a)) return false; const v = (y - cy)*Math.cos(a) - (x - S.cx)*Math.sin(a); return v > 0 || !pb.get(Math.floor(x), Math.floor(y)); },
      (x, y) => { const u = Math.hypot((x + .5 - S.cx)/11.2, (y + .5 - cy)/2.9); return u > .9 ? Q[2] : u > .8 ? Q[0] : Q[1]; }, 'ringm'); },
  tail(pb, S, sp, P, ins, W, H){ for (let x = 1; x < S.cx - 2; x++){ const k = (S.cx - x)/S.cx, hw = 1.6 + k*2.8, yc = S.cy - k*2.6; for (let y = 0; y < H; y++){ if (pb.get(x, y)) continue; const d = Math.abs(y + .5 - yc)/hw; if (d > 1 || (k > .6 && (x + y) % 2) || (k > .8 && (x + y) % 3)) continue; pb.set(x, y, d < .35 ? '#e8faff' : d < .7 ? '#a8dcf8' : '#5aa8e0', 'fx'); } } },
  antenna(pb, S){ const t = S.cy - S.hy; for (const s of [-1, 1]){ pb.line(S.cx + s*2.4 - .5, t + 1, S.cx + s*4.4 - .5, t - 3, PAL.alien.d, 'body'); pb.disc(S.cx + s*4.6 - .5, t - 3.8, 1.3, s < 0 ? '#ff8ad0' : '#ffe45a', 'body'); } },
  ufo(pb, S){ const c = S.cx, y0 = S.cy + 4.4;
    tfill(pb, (x, y) => inE(x, y, c, S.cy + .8, 6.8, 6.2) && y < y0, {d:'#7ab8d8', b:'#a8dcf0', l:'#dcf6ff'}, 'glass', c, S.cy, 7, true);
    tfill(pb, (x, y) => inE(x, y, c, y0 + .4, 11.2, 2.8), {d:'#6a7686', b:'#a8b2c0', l:'#dde3ea'}, 'metal', c, y0 - 1, 6);
    tfill(pb, BF(pb, (x, y) => inE(x, y, c, y0 + 2.6, 5.6, 1.6)), {d:'#4a5260', b:'#6a7686', l:'#8a94a2'}, 'metal', c, y0 + 2, 4); },
  eisei(pb, S, sp, P, ins, W, H){ const y = Math.round(S.cy) - 3; for (const x0 of [1, W - 6]){ for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) pb.set(x0 + i, y + j, (i === 2 || j === 2 || j === 5) ? '#1a2a5a' : (i + j) % 2 ? '#3a5ab8' : '#5a7ad8', 'panel'); }
    pb.rect(6, y + 2, 2, 1, '#a8b0bb', 'metal'); pb.rect(W - 8, y + 2, 2, 1, '#a8b0bb', 'metal');
    const t = Math.round(S.cy - S.hy); pb.rect(Math.round(S.cx) + 1, t - 2, 1, 2, '#a8b0bb', 'metal'); pb.fill((x, yy) => inE(x, yy, S.cx + 1.5, t - 2.6, 2.2, 1), '#dde3ea', 'metal'); },
  sunray(pb, S){ for (let i = 0; i < 12; i++){ const a = i*Math.PI/6 + .26, L = i % 2 ? 8.4 : 9.8, w = .34, r0 = 5.6;
    pb.fill(BF(pb, (x, y) => pip([[S.cx + Math.cos(a - w)*r0, S.cy + Math.sin(a - w)*r0], [S.cx + Math.cos(a)*L, S.cy + Math.sin(a)*L], [S.cx + Math.cos(a + w)*r0, S.cy + Math.sin(a + w)*r0]], x, y)), i % 2 ? '#ffb42a' : '#ff8a1a', 'ray'); } },
  disk(pb, S){ const cy = S.cy + .8, a = -.12, inD = (x, y) => inR(x, y, S.cx, cy, 11.6, 3.4, a) && !inR(x, y, S.cx, cy, 7.4, 1.4, a);
    pb.fill((x, y) => { const d = Math.hypot(x - S.cx, y - S.cy); return y < S.cy + 1 && d > S.hx + .5 && d < S.hx + 1.6 && !pb.get(Math.floor(x), Math.floor(y)); }, '#ffcf7a', 'fx');
    pb.fill((x, y) => inD(x, y) && ((y - cy)*Math.cos(a) - (x - S.cx)*Math.sin(a) > 0 || !pb.get(Math.floor(x), Math.floor(y)) || pb.mat(Math.floor(x), Math.floor(y)) === 'fx'),
      (x, y) => { const u = x + .5 - S.cx, v = Math.abs(y + .5 - cy); return (x + y*3) % 5 === 0 ? WHITE : v < .8 && u < 2 ? '#fffbe8' : u < -3 ? '#fff0b8' : u < 3 ? '#ffd27a' : u < 7 ? '#ff9a3a' : '#e8582a'; }, 'disk'); },
  key(pb, S){ const x = Math.round(S.cx + S.hx) - 1, y = Math.round(S.cy), Q = {d:'#a07020', b:'#d8a83a', l:'#ffe08a'};
    pb.rect(x, y - 1, 3, 2, Q.b, 'brass'); pb.rect(x, y - 1, 3, 1, Q.l, 'brass'); for (const s of [-1, 1]) tfill(pb, (a, b) => inE(a, b, x + 4.4, y + s*2.2, 1.9, 2), Q, 'brass', x + 4, y, 3); },
  battery(pb, S){ tfill(pb, (x, y) => x > S.cx - 2.6 && x < S.cx + 2.6 && y > 1.4 && y < 4.5, {d:'#77808c', b:'#a8b0bb', l:'#e0e6ec'}, 'metal', S.cx, 2, 3); },
  socket(pb, S){ const c = Math.round(S.cx); for (let y = 15; y < 19; y++) for (let x = c - 3; x < c + 3; x++) pb.set(x, y, y % 2 ? '#8a94a2' : '#c8d0da', 'metal'); pb.rect(c - 1, 19, 2, 1, '#4a5260', 'metal'); },
  robot(pb, S){ const c = Math.round(S.cx); pb.rect(c - 1, 3, 2, 3, '#8a94a2', 'metal'); pb.disc(c, 2.2, 1.5, '#ff4a5a', 'red'); pb.set(c - 1, 1, '#ffb0b8', 'red');
    for (const x of [1, 16]){ pb.rect(x, 10, 3, 5, '#8a94a2', 'metal'); pb.rect(x, 10, 3, 1, '#c8d0da', 'metal'); } },
  loco(pb, S){ const M = {d:'#2a2a34', b:'#4a4a58', l:'#7a7a8a'}, R = {d:'#8a1a1a', b:'#d03a2a', l:'#f07a5a'};
    tfill(pb, (x, y) => x > 16 && x < 22.6 && y > 3.4 && y < 13.6, R, 'red', 19.5, 8, 4); pb.rect(15, 2, 8, 2, M.b, 'metal'); pb.rect(15, 2, 8, 1, M.l, 'metal'); pb.rect(18, 5, 3, 3, '#bfe8ff', 'red'); pb.set(18, 5, WHITE, 'red');
    tfill(pb, (x, y) => (x > 4.6 && x < 7.4 && y > 2.6 && y < 6.4) || (x > 3.6 && x < 8.4 && y > 1.6 && y < 2.8), M, 'metal', 6, 3, 3);
    pb.rect(2, 12, 21, 2, '#6a1a1a', 'red'); pb.fill((x, y) => pip([[1.2, 12], [3, 12], [3, 16.6]], x, y), M.b, 'metal');
    for (const x of [6, 11.5, 19]){ tfill(pb, (a, b) => inE(a, b, x, 14.6, 2.4, 2.4), M, 'metal', x, 14.6, 2.4); pb.set(Math.floor(x), 14, '#c8d0da', 'metal'); } },
  rocket(pb, S){ const R = {d:'#a81a2a', b:'#e2384a', l:'#ff8a8a'}, c = S.cx, t = S.cy - S.hy;
    tfill(pb, (x, y) => pip([[c, .6], [c + 5.2, t + 4.4], [c - 5.2, t + 4.4]], x, y) && y < t + 3.4, R, 'red', c, t + 1, 3);
    for (const s of [-1, 1]) tfill(pb, (x, y) => pip([[c + s*(S.hx - .8), S.cy + 1.4], [c + s*(S.hx + 2.6), S.cy + 6.6], [c + s*(S.hx + 2.4), S.cy + 8.4], [c + s*(S.hx - 1.6), S.cy + 6.4]], x, y), R, 'red', c, S.cy + 4, 4);
    pb.rect(Math.round(c) - 2, Math.round(S.cy + S.hy) - 1, 4, 2, '#8a94a2', 'metal'); },
  orgel(pb, S){ const Wd = {d:'#d0709a', b:'#f4a0c0', l:'#ffd0e0'};
    pb.fill(BF(pb, (x, y) => inE(x, y, 10, 11.8, 6.4, 1.3)), (x, y) => y < 12 ? '#ffe164' : '#cb8a10', 'gold');
    tfill(pb, (x, y) => x > 3.4 && x < 16.6 && y > 12.6 && y < 19.6, Wd, 'wood', 10, 15, 6); pb.rect(4, 13, 13, 1, '#ffe164', 'wood'); pb.rect(4, 18, 13, 1, '#e8a818', 'wood'); for (let x = 6; x < 15; x += 2) pb.set(x, 15, '#ffffff', 'wood'); pb.set(10, 16, '#ffe164', 'wood'); pb.set(9, 16, '#ffe164', 'wood');
    pb.rect(17, 15, 1, 1, '#8a94a2', 'metal'); pb.rect(18, 13, 1, 3, '#8a94a2', 'metal'); },
  watch(pb, S){ const R = S.hx + 1.8, c = S.cx;
    pb.fill(BF(pb, (x, y) => inE(x, y, c, S.cy, R, R)), (x, y) => gsh(x, y, c, S.cy, R), 'gold');
    pb.rect(Math.round(c) - 1, Math.round(S.cy - R) - 2, 2, 2, '#ffd23a', 'gold');
    pb.fill((x, y) => inE(x, y, c, 1.9, 2.1, 1.2) && !inE(x, y, c, 1.9, 1, .4), '#ffe164', 'gold');
    for (const [x, y] of [[8, 1], [7, 2], [5, 2], [4, 3], [3, 5]]) pb.set(x, y, '#f2ba1e', 'gold'); },
  fairy(pb, S){ const Q = {d:'#7ac8d8', b:'#b4ecf4', l:'#eafcff'};
    for (const s of [-1, 1]){ tfill(pb, (x, y) => inR(x, y, S.cx + s*6.2, S.cy - 3.2, 3.6, 2.3, s*.55), Q, 'wingf', S.cx + s*6, S.cy - 4, 4, true); tfill(pb, (x, y) => inR(x, y, S.cx + s*5.6, S.cy + 2, 2.6, 1.7, -s*.5), Q, 'wingf', S.cx + s*5, S.cy + 1, 3, true); }
    const t = S.cy - S.hy; pb.disc(S.cx - 2.6, t + .4, 1.4, '#ff9ac0', 'flower'); pb.set(Math.floor(S.cx - 2.6), Math.floor(t + .4), '#ffe45a', 'flower'); },
  tsuno(pb, S){ const t = S.cy - S.hy, Q = {d:'#d8b060', b:'#fff0c0', l:'#ffffff'}; for (const s of [-1, 1]) tfill(pb, (x, y) => pip([[S.cx + s*1.6, t + 1.8], [S.cx + s*5.4, t + 2], [S.cx + s*4.8, t - 3.6]], x, y), Q, 'horn', S.cx + s*3, t - 1, 3);
    for (const [x, y] of [[0, 0], [-1, 1], [1, 1]]) pb.set(Math.floor(S.cx) + x - 1, Math.round(t) + y - 1, '#3a1a1a', 'body'); },
  unicorn(pb, S, sp, P){ const t = S.cy - S.hy, c = S.cx;
    for (const s of [-1, 1]) pb.fill((x, y) => pip([[c + s*2.4, t + 1.8], [c + s*4.4, t - 2.4], [c + s*5.6, t + 1.8]], x, y), P.b, 'body');
    pb.fill((x, y) => { const a = Math.atan2(y - S.cy, x - c); return x > 1.2 && a > -2.95 && a < -1.2 && inE(x, y, c - .8, S.cy - .8, S.hx + 1.4, S.hy + 1.6) && !inE(x, y, c + .4, S.cy + .6, S.hx - .8, S.hy - .6); }, (x, y) => NIJI[Math.max(0, Math.min(5, Math.floor((Math.atan2(y + .5 - S.cy, x + .5 - c) + 2.95)/1.75*6)))], 'mane2');
    pb.fill((x, y) => pip([[c - 1.8, t + 1.4], [c + 1.8, t + 1.4], [c + .5, t - 6.6]], x, y), (x, y) => (x + y) % 3 === 0 ? '#c8860f' : x + .5 < c ? '#fff3a0' : '#f2ba1e', 'gold'); },
  sword(pb, S){ const c = Math.round(S.cx) - 1, t = Math.round(S.cy - S.hy);
    pb.rect(c, 7, 1, t - 5, '#ffffff', 'blade'); pb.rect(c + 1, 7, 1, t - 5, '#b8c4d4', 'blade');
    pb.rect(c - 3, 5, 8, 2, '#f2ba1e', 'gold'); pb.rect(c - 3, 6, 8, 1, '#cb8a10', 'gold'); pb.set(c - 3, 5, '#fff3a0', 'gold');
    for (let y = 2; y < 5; y++) pb.rect(c, y, 2, 1, y % 2 ? '#2a3a90' : '#3a5ad0', 'gold'); pb.rect(c, 1, 2, 1, '#e2253f', 'gold'); },
  witch(pb, S){ const t = S.cy - S.hy, c = S.cx, Q = {d:'#3a2478', b:'#5a3aa8', l:'#8a6ad8'};
    tfill(pb, (x, y) => pip([[c - 4.8, t + 1.2], [c + 4.8, t + 1.2], [c + 2, t - 5.4], [c + 5.6, t - 8.6], [c - .6, t - 6.6]], x, y), Q, 'hat', c, t - 3, 5);
    tfill(pb, (x, y) => inE(x, y, c, t + 1.4, 9.6, 1.7), Q, 'hat', c, t, 6);
    pb.fill((x, y) => pip([[c - 4.8, t + 1.2], [c + 4.8, t + 1.2], [c + 4, t - .6], [c - 4, t - .6]], x, y) && y > t - .6, '#f2ba1e', 'hat'); },
  dragon(pb, S){ const c = S.cx, t = S.cy - S.hy, Q = {d:'#145a40', b:'#1f8a5c', l:'#3cb87c'};
    for (const s of [-1, 1]){ tfill(pb, BF(pb, (x, y) => pip([[c + s*4.6, S.cy - 2.4], [c + s*10.2, t - 3.2], [c + s*11.2, S.cy - 1.2], [c + s*9.4, S.cy - .2], [c + s*8.4, S.cy + 1.8], [c + s*6.8, S.cy + .8]], x, y)), Q, 'wingd', c + s*8, S.cy - 4, 5);
      pb.line(c + s*4.6, S.cy - 2.4, c + s*10, t - 2.8, '#7ad8a0', 'wingd');
      pb.fill((x, y) => pip([[c + s*1.6, t + 1.4], [c + s*3.8, t + 1.6], [c + s*4.8, t - 3.4]], x, y), (x, y) => y < t - 1 ? '#fff3a0' : '#f2ba1e', 'gold'); } },
  phoenix(pb, S, sp, P, ins, W, H){ const c = S.cx, t = S.cy - S.hy, F = ['#e8441a', '#ff8a1e', '#ffd23a'];
    for (const s of [-1, 1]) [[-1.3, 9], [-.9, 8.2], [-.5, 6.4], [-.1, 5.2]].forEach(([a, L]) => { const ang = s > 0 ? a : Math.PI - a, x0 = c + s*4.6, y0 = S.cy, ux = Math.cos(ang), uy = Math.sin(ang), px = -uy*1.5, py = ux*1.5;
      pb.fill(BF(pb, (u, v) => pip([[x0 + px, y0 + py], [x0 + ux*L, y0 + uy*L], [x0 - px, y0 - py]], u, v)), (u, v) => { const d = Math.hypot(u + .5 - x0, v + .5 - y0)/L; return d < .55 ? F[2] : d < .8 ? F[1] : F[0]; }, 'flame'); });
    [[-2.2, -1.4, -.4], [0, -2.6, 0], [2.2, -1.4, .4]].forEach(([dx, dy, a]) => pb.fill((u, v) => inR(u, v, c + dx, t + dy, 1, 2.6, a), (u, v) => v < t + dy - .5 ? F[2] : F[1], 'flame'));
    [[-2.4, .4], [0, 0], [2.4, -.4]].forEach(([dx, a]) => pb.fill(BF(pb, (u, v) => inR(u, v, c + dx, S.cy + S.hy + .4, 1, 1.6, a)), (u, v) => v > S.cy + S.hy + .9 ? F[0] : F[1], 'flame')); },
  king(pb, S, sp, P, ins, W, H){ const c = S.cx, t = S.cy - S.hy;
    tfill(pb, BF(pb, (x, y) => y > S.cy - 3 && y < H - 1.4 && inE(x, y, c, S.cy + 2, 11.2, 7.4)), {d:'#7a0a1a', b:'#b81a2a', l:'#e04a4a'}, 'cape', c, S.cy, 10);
    pb.fill((x, y) => pb.mat(Math.floor(x), Math.floor(y)) === 'cape' && y < S.cy - .6, (x, y) => (x*3 + y) % 5 === 0 ? '#2a2a34' : '#ffffff', 'cape');
    const G = {Y:'#f2ba1e', L:'#ffe164', H:'#fff6c0', D:'#cb8a10', r:'#e2253f', b:'#3f7fe0', g:'#2fb86a', w:'#ffffff'};
    stamp(pb, ['w.....w.....w', 'L..w..L..w..L', 'LY.Y.YLY.Y.YD', 'LYYYYYLYYYYYD', 'LYbYgYrYgYbYD', 'HLLLLLLLLLLLY', 'DDDDDDDDDDDDD'], Math.round(c) - 6, Math.round(t) - 5, G, 'gold'); },
  aura(pb, S){ pb.fill(BF(pb, (x, y) => inE(x, y, S.cx, 2.4, 5.4, 1.8) && !inE(x, y, S.cx, 2.4, 3.4, .8)), (x, y) => y < 2.4 ? '#fff6b0' : '#ffc21e', 'fx'); for (let i = 0; i < 16; i++){ const a = i*Math.PI/8, k = i % 2 ? [1.12, 1.24] : [1.12, 1.26, 1.4]; k.forEach((m, j) => { const x = Math.round(S.cx + Math.cos(a)*S.hx*m - .5), y = Math.round(S.cy + Math.sin(a)*S.hy*m - .5); if (!pb.get(x, y)) pb.set(x, y, j ? '#fff6c0' : '#ffd23a', 'fx'); }); } },
};
const XB = {
  kinpaku(pb, S, sp, P, ins, W, H, at){ for (const [dx, dy] of [[-5.5, -2], [2.5, -4.5], [4.5, 1.5], [-3, 3], [-.5, -4.5], [5.5, -2]]){ at(dx, dy, '#ffd84a', 2, 2); at(dx + 1, dy + 1, '#e8a818'); at(dx, dy, '#fffbe0'); } },
  koban(pb, S, sp, P, ins){ for (let y = 0; y < pb.h; y++) for (let x = 0; x < pb.w; x++){ const r = Math.hypot(...nrm(x, y, S)); if (ins(x, y) && r > .74 && r < .86) pb.set(x, y, mix(pb.get(x, y), P.d, .55), 'body'); }
    for (let y = Math.ceil(S.cy - S.hy) + 3; y < S.cy + S.hy - 2; y += 2){ if (Math.abs(y - S.cy) < 2.5) continue; for (let x = 0; x < pb.w; x++) if (ins(x, y) && Math.hypot(...nrm(x, y, S)) < .72) pb.set(x, y, mix(pb.get(x, y), P.o, .2), 'body'); }
    const c = Math.round(S.cx) - 1; for (const y of [Math.round(S.cy - S.hy) + 2, Math.round(S.cy + S.hy) - 4]){ pb.rect(c, y, 2, 2, mix(P.d, P.o, .35), 'body'); pb.set(c, y, P.l, 'body'); } },
  ingot(pb, S, sp, P, ins){ for (let x = 0; x < pb.w; x++) if (ins(x, 3) && ins(x, 2)) pb.set(x, 3, P.h, 'body'); for (let y = 4; y < 12; y++) if (ins(4 + Math.floor((y - 4)*.4), y)) pb.set(5 + Math.floor((12 - y)*.35), y, P.l, 'body'); },
  medal(pb, S, sp, P, ins){ for (let y = 0; y < pb.h; y++) for (let x = 0; x < pb.w; x++) if (ins(x, y) && Math.abs(Math.hypot(x + .5 - S.cx, y + .5 - S.cy) - S.hx + 1.7) < .5) pb.set(x, y, mix(pb.get(x, y), P.d, .6), 'body'); },
  chest(pb, S, sp, P, ins, W){ for (let y = 0; y < pb.h; y++) for (let x = 0; x < W; x++){ if (!ins(x, y)) continue; if (y === 6) pb.set(x, y, '#ffd23a', 'body'); else if (x === 3 || x === W - 4) pb.set(x, y, y < 6 ? '#ffe164' : '#e8a818', 'body'); }
    pb.rect(9, 5, 2, 3, '#f2ba1e', 'body'); pb.set(9, 5, '#fff3a0', 'body'); pb.set(10, 6, '#3a1e0c', 'body'); },
  kozuchi(pb, S, sp, P, ins, W, H){ for (const [x, y] of [[3, H - 6], [W - 5, H - 4]]){ pb.set(x, y - 1, '#ffe164', 'fx'); pb.set(x - 1, y, '#f2ba1e', 'fx'); pb.set(x, y, '#fff6c0', 'fx'); pb.set(x + 1, y, '#f2ba1e', 'fx'); pb.set(x, y + 1, '#cb8a10', 'fx'); } },
  rays(pb, S, sp, P, ins, W, H){ for (let i = 0; i < 8; i++){ const a = i*Math.PI/4 + Math.PI/8; (i % 2 ? [1.14, 1.26] : [1.14, 1.26, 1.38]).forEach((m, j) => { const x = Math.round(S.cx + Math.cos(a)*S.hx*m - .5), y = Math.round(S.cy + Math.sin(a)*S.hy*m - .5); if (!pb.get(x, y)) pb.set(x, y, j ? '#fffbe0' : '#ffe98a', 'fx'); }); } },
  kohaku(pb, S, sp, P, ins, W, H, at){ at(-5, -1, WHITE); at(-4, -2, WHITE); at(-3, -3, P.h); at(-5, 0, P.h); at(3, 1, '#4a6a10'); at(3, 2, '#4a6a10'); at(2, 0, '#7aa828'); at(4, 0, '#7aa828'); at(4, -1, '#9ac840'); },
  beam(pb, S, sp, P, ins, W){ for (let x = 0; x < 6; x++) if (!pb.get(x, 9)) pb.set(x, 9, '#fffbe0', 'fx');
    NIJI.forEach((c, i) => { for (let x = 15; x < W; x++){ const y = Math.round(9 + i*.5 + (x - 15)*(i - 2)*.22); if (y >= 0 && y < pb.h && !pb.get(x, y)) pb.set(x, y, c, 'fx'); } }); },
  mac(pb, S, sp, P, ins, W){ for (let x = 0; x < W; x++){ if (ins(x, 9)) pb.set(x, 9, x % 2 ? '#fffaf0' : '#f6ece0', 'body'); if (ins(x, 8) && x % 2 && ins(x, 7)) pb.set(x, 8, P.d, 'body'); if (ins(x, 10) && x % 2 === 0 && ins(x, 11)) pb.set(x, 10, P.l, 'body'); } },
  sprinkle(pb, S, sp, P, ins, W, H, at){ for (const [dx, dy, c, w, h] of [[-5, -2.5, '#ff8ab0', 2, 1], [-1.5, -4.5, '#8ae0ff', 1, 2], [2, -3.2, '#ffe27a', 2, 1], [5, -1.8, '#a0f08a', 1, 2], [-3, -.8, '#ffffff', 1, 1], [.5, -1.2, '#ff8ab0', 1, 1]]) at(dx, dy, c, w, h); },
  hotcake(pb, S, sp, P, ins, W){ for (let x = 0; x < W; x++){ for (const y of [10, 13]) if (ins(x, y)){ pb.set(x, y, P.d, 'body'); if (ins(x, y + 1)) pb.set(x, y + 1, P.l, 'body'); }
    if (ins(x, 5)) pb.set(x, 5, x % 5 === 2 ? '#e08a3a' : '#b8601e', 'body'); if (ins(x, 6) && x % 4 === 1) pb.set(x, 6, '#b8601e', 'body'); }
    for (const [x, h] of [[2, 4], [19, 3], [6, 1], [15, 2]]) for (let j = 0; j < h; j++) if (ins(x, 6 + j)) pb.set(x, 6 + j, j === h - 1 ? '#8a4010' : '#b8601e', 'body'); },
  parfait(pb){ pb.set(3, 12, WHITE, 'fx'); pb.set(4, 14, WHITE, 'fx'); pb.set(4, 2, '#ffb0b8', 'fx'); },
  oiwai(pb, S, sp, P, ins, W){ for (const x of [6, 10, 14]){ pb.set(x, 0, '#fff6c8', 'fx'); pb.set(x, 1, '#ffd23a', 'fx'); pb.set(x + 1, 1, '#ff8a2a', 'fx'); }
    for (let x = 0; x < W; x++) if (ins(x, 17) && x % 2) pb.set(x, 17, '#ffd23a', 'body'); },
  neko(pb, S, sp, P, ins, W, H, at){ at(-1, -5.4, P.d, 1, 2); at(1, -5.4, P.d, 1, 2); at(-3, -4.4, P.d); at(3, -4.4, P.d); },
  panda(pb, S, sp, P, ins, W, H){ pb.line(W - 3, H - 2, W - 4, H - 8, '#4a9a3a', 'fx'); pb.set(W - 3, H - 8, '#8ad86a', 'fx'); pb.set(W - 2, H - 7, '#8ad86a', 'fx'); pb.set(W - 5, H - 6, '#8ad86a', 'fx'); },
  kitsune(pb){ for (const [x, y, c] of [[2, 3, '#bfeeff'], [2, 4, '#8ad0ff'], [3, 4, '#e8faff'], [1, 5, '#8ad0ff'], [2, 5, '#ffffff'], [3, 5, '#bfeeff'], [2, 6, '#8ad0ff'], [3, 2, '#8ad0ff']]) pb.set(x, y, c, 'fx'); },
  moonlet(pb, S, sp, P, ins, W){ for (const [x, y, c] of [[W - 3, 1, '#e0dad4'], [W - 2, 1, '#b8b0a8'], [W - 3, 2, '#b8b0a8'], [W - 2, 2, '#8a827a']]) pb.set(x, y, c, 'fx'); },
  ember(pb, S, sp, P, ins, W, H, at){ for (const [dx, dy, c] of [[-6, -1, '#ff8a2a'], [-5, 0, '#ffd04a'], [-5, 1, '#ff8a2a'], [4, 3, '#ff6a1a'], [5, 2, '#ffb43a'], [1, -4, '#ff8a2a'], [2, -4, '#ffd04a'], [-2, 4, '#ff6a1a']]) at(dx, dy, c);
    for (const [x, y, c] of [[W - 2, 0, '#ff6a1a'], [W - 3, 1, '#ffb43a'], [W - 2, 1, '#ff8a2a'], [W - 4, 2, '#fff0a0'], [W - 3, 2, '#ffd04a'], [W - 1, 0, '#e8441a']]) if (!pb.get(x, y)) pb.set(x, y, c, 'fx'); },
  ufo(pb, S){ const y = Math.round(S.cy + 4.6); [-8, -4, 0, 4, 8].forEach((dx, i) => pb.set(Math.round(S.cx + dx) - (dx > 0 ? 1 : 0), y, ['#ff6a8a', '#ffe45a', '#6aff9a', '#6ac8ff', '#ff6a8a'][i], 'fx')); pb.set(Math.round(S.cx) - 4, Math.round(S.cy) - 3, WHITE, 'fx'); },
  bolt(pb, S, sp, P, ins, W, H, at){ for (const [dx, dy] of [[-5, -5], [4, -5], [-5, 4], [4, 4]]) { at(dx, dy, P.d); at(dx, dy - 1, P.l); } },
  battery(pb, S, sp, P, ins, W){ for (let x = 0; x < W; x++){ for (const y of [4, 5, 18, 19]) if (ins(x, y)) pb.set(x, y, y === 4 || y === 18 ? '#d5dbe2' : '#a8b0bb', 'body'); }
    pb.rect(4, 13, 6, 4, '#2a3a2a', 'body'); for (let i = 0; i < 3; i++) pb.rect(5 + i*1.4, 14, 1, 2, '#6aff6a', 'body'); },
  socket(pb){ for (const [x, y] of [[1, 3], [0, 7], [16, 3], [17, 7], [8, 0], [3, 0], [14, 0]]) pb.set(x, y, '#fff3a0', 'fx'); },
  robot(pb, S, sp, P, ins, W, H, at){ for (const [dx, dy] of [[-5, -4.5], [4, -4.5], [-5, 4.5], [4, 4.5]]) at(dx, dy, P.l); },
  loco(pb){ for (const [x, y, c] of [[1, 0, '#ffffff'], [2, 0, '#ffffff'], [0, 1, '#d8e0ea'], [1, 1, '#eef2f8'], [2, 1, '#eef2f8'], [3, 1, '#d8e0ea']]) pb.set(x, y, c, 'fx'); },
  rocket(pb, S, sp, P, ins, W, H){ const c = Math.round(S.cx) - 1, y = Math.round(S.cy + S.hy) + 1; for (const [dx, dy, col] of [[0, 0, '#fff6c8'], [1, 0, '#fff6c8'], [-1, 0, '#ffd04a'], [2, 0, '#ffd04a'], [0, 1, '#ffd04a'], [1, 1, '#ff8a2a'], [0, 2, '#ff8a2a'], [1, 2, '#e8441a'], [-1, 1, '#ff8a2a'], [2, 1, '#e8441a']]) if (y + dy < H) pb.set(c + dx, y + dy, col, 'fx'); },
  orgel(pb){ for (const [x0, y0] of [[1, 2], [16, 0]]) for (const [x, y] of [[1, 0], [1, 1], [1, 2], [0, 3], [1, 3], [2, 1]]) pb.set(x0 + x, y0 + y, '#ffe164', 'fx'); },
  watch(pb, S){ const c = S.cx, cy = S.cy; for (let i = 0; i < 12; i++){ const a = i*Math.PI/6, x = Math.round(c + Math.sin(a)*6.1 - .5), y = Math.round(cy - Math.cos(a)*6.1 - .5); pb.set(x, y, i % 3 ? '#c8b890' : '#5a4a2a', 'body'); } },
  fairy(pb){ for (const [x, y, c] of [[2, 15, '#ffd0e8'], [4, 16, '#ffffff'], [1, 12, '#ffffff'], [20, 15, '#ffd0e8'], [18, 16, '#ffffff']]) pb.set(x, y, c, 'fx'); },
  orbs(pb){ for (const [x, y] of [[2, 3], [15, 15], [1, 16]]){ pb.set(x, y, WHITE, 'fx'); pb.set(x + 1, y, '#c8ccff', 'fx'); pb.set(x, y + 1, '#c8ccff', 'fx'); pb.set(x + 1, y + 1, '#8a90f0', 'fx'); } },
  sword(pb){ pb.set(8, 8, WHITE, 'fx'); },
  witch(pb, S, sp, P, ins, W){ pb.line(W - 4, Math.round(S.cy) + 2, W - 2, Math.round(S.cy) - 2, '#8a5a2a', 'fx'); spk(pb, W - 2, Math.round(S.cy) - 4, 1, WHITE, '#ffe45a'); for (const [x, y] of [[9, 9], [12, 6], [10, 4]]) pb.set(x, y, '#ffe164', 'body'); },
};
function galCol(x, y, t){
  if (t !== 'd' && (x*7 + y*13) % 11 === 0) return NIJI[(x + y) % 6];
  return PAL.gal[t];
}
function sprouts(pb, ins, S){
  for (const [dx, h, lean] of [[-4.5, 3, -1], [0, 4, 0], [4.5, 3, 1]]){
    const x = Math.floor(S.cx + dx); let top = 0; while (top < pb.h && !ins(x, top)) top++;
    let px = x, py = top - 1;
    for (let i = 0; i < h; i++){ pb.set(px, py, '#6aaa3a', 'sprout'); if (i === Math.floor(h/2) - (h > 3 ? 0 : 1) && lean) px += lean; py--; }
    pb.set(px, py + 1, '#a6dc6c', 'sprout');
    pb.set(px + (lean > 0 ? 1 : -1), py + 1, '#a6dc6c', 'sprout');
    if (!lean) pb.set(px + 1, py + 2, '#a6dc6c', 'sprout');
  }
}
function cap(pb, S){
  const th = x => 8.0 - (x - S.cx)*.2;
  pb.fill((x, y) => ((x-S.cx)/8.4)**2 + ((y-S.cy)/6.8)**2 <= 1 && y < th(x), (x, y) => (y + .5 >= th(x + .5) - 1.7 ? '#f2f5fb' : x < S.cx - 2 ? '#86a6f2' : '#4f74d6'), 'cap');
  pb.poly([[S.cx + 1, 6.4], [S.cx + 6.6, 6.2], [S.cx + 7.4, 2.6]], '#4f74d6', 'cap');
  pb.disc(S.cx + 7.6, 2.4, 1.5, '#ffffff', 'pom');
}
function crown(pb, S){
  const x0 = Math.round(S.cx - 4.5), top = Math.round(S.cy - S.hy) - 4, G0 = '#f2ba1e';
  pb.rect(x0, top + 2, 9, 2, G0, 'crown');
  for (const dx of [0, 4, 8]){ pb.set(x0 + dx, top, G0, 'crown'); pb.set(x0 + dx, top + 1, G0, 'crown'); }
  pb.set(x0 + 2, top + 1, G0, 'crown'); pb.set(x0 + 6, top + 1, G0, 'crown');
  pb.rect(x0, top + 3, 9, 1, '#cb8a10', 'crown'); pb.set(x0 + 4, top + 2, '#e2553f', 'crown'); pb.set(x0, top, '#fff3a0', 'crown'); pb.set(x0 + 4, top, '#fff3a0', 'crown');
}
function mush(pb, S){
  const cy = S.cy - S.hy + .8;
  pb.fill((x, y) => ((x-S.cx)/8.6)**2 + ((y-cy)/5.4)**2 <= 1 && y < cy + 1.4, (x, y) => (x < S.cx - 3 && y < cy - 1) ? '#f07a66' : y > cy ? '#b8352c' : '#d9453a', 'mush');
  for (const [dx, dy] of [[-4, -2], [1, -3.5], [4, -1], [-1, -.5]]){ const x = Math.floor(S.cx + dx), y = Math.floor(cy + dy); if (pb.mat(x, y) === 'mush'){ pb.set(x, y, '#fff6ec', 'mush'); if (pb.mat(x + 1, y) === 'mush') pb.set(x + 1, y, '#fff6ec', 'mush'); } }
}
function halo(pb, S, W){
  const hy = Math.round(S.cy - S.hy) - 3.5;
  pb.fill((x, y) => ((x-S.cx)/4.8)**2 + ((y-hy)/1.7)**2 <= 1 && ((x-S.cx)/3.1)**2 + ((y-hy)/.7)**2 > 1, (x, y) => y < hy ? '#ffe27a' : '#d9a520', 'fx');
  for (const wx of [2.4, W - 2.4]) pb.fill((x, y) => ((x-wx)/1.9)**2 + ((y-(S.cy - 1.6))/2.5)**2 <= 1 && !pb.get(Math.floor(x), Math.floor(y)), (x, y) => y > S.cy ? '#dfe6f2' : '#ffffff', 'wing');
}
function face(pb, sp, S, blink){
  const E_ = sp.eye || EYE, M_ = sp.mouth || MOUTH, OX = sp.fxo || 0;
  const W = sp.w, s = sp.s ?? (W % 2 === 0 ? 2.5 : 2);
  const eL = Math.round(W/2 - .5 - s), ey = Math.floor(S.cy + (sp.fy || 0)) - 1;
  const set = (x, y, c) => pb.set(x + OX, y, c, 'face');
  const mir = (x, y, c) => { set(x, y, c); set(W - 1 - x, y, c); };
  const even = W % 2 === 0, c0 = even ? W/2 : (W - 1)/2;
  const mouth = (y, c, wide) => { if (even){ set(c0-1, y, c); set(c0, y, c); if (wide){ set(c0-2, y, c); set(c0+1, y, c); } } else { set(c0, y, c); if (wide){ set(c0-1, y, c); set(c0+1, y, c); } } };
  const closed = () => { mir(eL-1, ey+1, E_); mir(eL, ey+1, E_); };
  const eyes = () => { if (blink) closed(); else { mir(eL, ey, E_); mir(eL, ey+1, E_); } };
  const big = () => { if (blink) return closed(); mir(eL-1, ey, E_); mir(eL, ey, E_); mir(eL-1, ey+1, E_); mir(eL, ey+1, E_); set(eL-1, ey, WHITE); set(W - 1 - eL, ey, WHITE); };
  const blush = (y = ey + 2, c = PINK) => { mir(eL-2, y, c); mir(eL-1, y, c); };
  const happy = () => { mir(eL-1, ey+1, E_); mir(eL, ey, E_); mir(eL+1, ey+1, E_); };
  switch (sp.face){
    case 'smile': eyes(); blush(); mouth(ey+2, M_); break;
    case 'round': big(); blush(); mouth(ey+3, M_); break;
    case 'tiny': if (blink) closed(); else mir(eL, ey+1, E_); mir(eL-1, ey+2, PINK); break;
    case 'shy': eyes(); mir(eL-2, ey+2, '#ffb3a3'); mir(eL-1, ey+2, '#ffb3a3'); mir(eL, ey+2, '#ffb3a3'); mouth(ey+3, M_); break;
    case 'worry': eyes(); mir(eL-1, ey-1, E_); mir(eL, ey-2, E_); if (even){ set(c0-2, ey+3, M_); set(c0-1, ey+2, M_); set(c0, ey+2, M_); set(c0+1, ey+3, M_); } break;
    case 'dizzy': mir(eL-1, ey, E_); mir(eL+1, ey, E_); mir(eL, ey+1, E_); mir(eL-1, ey+2, E_); mir(eL+1, ey+2, E_);
      if (even){ set(c0-2, ey+4, M_); set(c0-1, ey+3, M_); set(c0, ey+4, M_); set(c0+1, ey+3, M_); } break;
    case 'poker': if (blink) closed(); else mir(eL, ey+1, E_); mouth(ey+3, E_, true); break;
    case 'peek': if (!blink) mir(eL, ey+1, WHITE); break;
    case 'happy': happy(); blush(); mouth(ey+2, M_); break;
    case 'grin': happy(); blush();
      if (even){ for (let x = c0-2; x <= c0+1; x++) set(x, ey+2, E_); set(c0-2, ey+3, E_); set(c0-1, ey+3, '#ff7f8f'); set(c0, ey+3, '#ff7f8f'); set(c0+1, ey+3, E_); set(c0-1, ey+4, E_); set(c0, ey+4, E_); } break;
    case 'proud': big(); blush(); mouth(ey+3, M_); break;
    case 'sleep': closed(); blush(); mouth(ey+3, M_); break;
    case 'serious': eyes(); mir(eL-1, ey-2, E_); mir(eL, ey-2, E_); mouth(ey+3, E_); break;
    case 'sweat': { eyes(); blush(); mouth(ey+2, M_); const x = W - 7, y = ey - 5; set(x, y, '#7cc8f0'); set(x-1, y+1, '#e8f8ff'); set(x, y+1, '#7cc8f0'); set(x-1, y+2, '#7cc8f0'); set(x, y+2, '#4f9fd6'); break; }
    case 'small': if (blink) closed(); else mir(eL, ey+1, E_); mouth(ey+2, M_); break;
    case 'cat': { eyes(); blush(); const y = ey + 2; if (even){ set(c0-2, y, M_); set(c0-1, y+1, M_); set(c0, y+1, M_); set(c0+1, y, M_); } else { set(c0-2, y, M_); set(c0-1, y+1, M_); set(c0, y, M_); set(c0+1, y+1, M_); set(c0+2, y, M_); }
      const k = '#8a5a3a'; mir(eL-4, ey+1, k); mir(eL-3, ey+1, k); mir(eL-4, ey+3, k); mir(eL-3, ey+3, k); break; }
    case 'dog': eyes(); blush(); if (even){ set(c0-1, ey+2, EYE); set(c0, ey+2, EYE); set(c0-1, ey+3, '#ff7f8f'); set(c0, ey+3, '#ff7f8f'); } else { set(c0-1, ey+2, EYE); set(c0, ey+2, EYE); set(c0+1, ey+2, EYE); set(c0, ey+3, '#ff7f8f'); } break;
    case 'beak': { eyes(); blush(); const B = sp.bk || '#ff9a2a', B2 = '#d86a10'; if (even){ set(c0-1, ey+2, B); set(c0, ey+2, B); set(c0-1, ey+3, B2); set(c0, ey+3, B2); } else { set(c0-1, ey+2, B); set(c0, ey+2, B); set(c0+1, ey+2, B); set(c0, ey+3, B2); } break; }
    case 'bear': { eyes(); blush(); const Z = sp.mz || '#f6d8a8'; for (let x = c0-2; x <= c0+1; x++) for (let y = ey+1; y <= ey+3; y++) if (!((x === c0-2 || x === c0+1) && (y === ey+1 || y === ey+3))) set(x, y, Z); set(c0-1, ey+1, EYE); set(c0, ey+1, EYE); set(c0-1, ey+2, M_); set(c0, ey+3, M_); set(c0-1, ey+3, M_); break; }
    case 'frog': { for (const [bx, by] of [sp.b[1], sp.b[2]]){ const x = Math.floor(bx), y = Math.floor(by); if (blink){ set(x-1, y, E_); set(x, y, E_); } else { set(x-1, y-1, WHITE); set(x-1, y, WHITE); set(x, y-1, E_); set(x, y, E_); } }
      for (let x = c0-3; x <= c0+2; x++) set(x, ey+2, M_); set(c0-4, ey+1, M_); set(c0+3, ey+1, M_); blush(ey+1); break; }
    case 'panda': { const K = '#22222a'; for (const [dx, dy] of [[0,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1],[-1,2],[0,2]]) mir(eL+dx, ey+dy, K); if (!blink){ mir(eL, ey, WHITE); } set(c0-1, ey+2, K); set(c0, ey+2, K); set(c0-1, ey+3, M_); set(c0, ey+3, M_); blush(ey+3); break; }
    case 'alien': if (blink) closed(); else { for (const [dx, dy] of [[-1,-1],[0,-1],[-1,0],[0,0],[1,0],[0,1],[1,1]]) mir(eL+dx, ey+dy, E_); mir(eL-1, ey-1, WHITE); } mouth(ey+3, M_); break;
    case 'robo': { const C = '#5ff0ff', K = '#1e2a3a'; for (let x = eL-2; x <= W-1-eL+2; x++){ set(x, ey, K); set(x, ey+1, K); } if (blink){ mir(eL-1, ey+1, C); mir(eL, ey+1, C); } else { mir(eL-1, ey, WHITE); mir(eL, ey, C); mir(eL-1, ey+1, C); mir(eL, ey+1, C); }
      for (let x = c0-2; x <= c0+1; x++) set(x, ey+3, x % 2 ? '#3a4656' : '#d8e4f0'); break; }
    case 'oni': eyes(); blush(); mir(eL-1, ey-2, E_); mir(eL, ey-2, E_); mir(eL+1, ey-1, E_); mouth(ey+2, M_, true); if (even){ set(c0-2, ey+3, WHITE); set(c0+1, ey+3, WHITE); } break;
    case 'shades': { const K = '#1a1a2a'; for (let i = -1; i <= 1; i++){ mir(eL+i, ey, K); mir(eL+i, ey+1, K); } for (let x = eL+2; x <= W-1-eL-2; x++) set(x, ey, K); mir(eL-2, ey, K); mir(eL-1, ey, '#8a9ac8'); blush(ey+2);
      if (even){ set(c0-2, ey+2, M_); set(c0-1, ey+3, M_); set(c0, ey+3, M_); set(c0+1, ey+2, M_); } break; }
    case 'kira': if (blink) closed(); else { for (let dy = -1; dy <= 1; dy++){ mir(eL-1, ey+dy, E_); mir(eL, ey+dy, E_); } mir(eL-1, ey-1, WHITE); mir(eL, ey+1, '#bfe8ff'); } blush(ey+2); mouth(ey+3, M_); break;
    case 'wink': { if (blink){ set(eL-1, ey+1, E_); set(eL, ey+1, E_); } else { set(eL, ey, E_); set(eL, ey+1, E_); } const r = W-1-eL; set(r-1, ey+1, E_); set(r, ey, E_); set(r+1, ey+1, E_); blush(); mouth(ey+2, M_); set(c0, ey+3, '#ff7f8f'); break; }
    case 'fang': big(); blush(); mouth(ey+3, M_, true); if (even){ set(c0-2, ey+4, WHITE); set(c0+1, ey+4, WHITE); } break;
    case 'trio':
      for (const [lx, ly] of S.cs){
        const m = Math.floor(lx), y = Math.floor(ly) - 1;
        if (blink){ set(m-2, y+1, E_); set(m-1, y+1, E_); set(m+1, y+1, E_); set(m+2, y+1, E_); } else { set(m-1, y, E_); set(m-1, y+1, E_); set(m+1, y, E_); set(m+1, y+1, E_); }
        set(m, y+2, M_); set(m-2, y+2, PINK); set(m+2, y+2, PINK);
      }
      break;
    case 'stache': { eyes(); const H_ = '#4a2a14'; if (even){ for (let x = c0-3; x <= c0+2; x++) set(x, ey+2, H_); set(c0-4, ey+1, H_); set(c0+3, ey+1, H_); set(c0-1, ey+3, H_); set(c0, ey+3, H_); } break; }
    case 'oh': eyes(); blush(); if (even){ set(c0-1, ey+2, M_); set(c0, ey+2, M_); set(c0-1, ey+3, M_); set(c0, ey+3, M_); } else { set(c0, ey+2, M_); set(c0, ey+3, M_); set(c0-1, ey+3, M_); set(c0+1, ey+3, M_); } break;
    case 'twin':
      for (const [lx, ly] of [S.c1, S.c2]){
        const a = Math.floor(lx - 1.6), b = Math.floor(lx + 1.6), y = Math.floor(ly) - 1;
        if (blink){ set(a-1, y+1, E_); set(a, y+1, E_); set(b, y+1, E_); set(b+1, y+1, E_); } else { set(a, y, E_); set(a, y+1, E_); set(b, y, E_); set(b, y+1, E_); }
        set(Math.floor(lx), y+2, M_); set(a-1, y+2, PINK); set(b+1, y+2, PINK);
      }
      break;
  }
}
const potCache = {};
function potatoPB(kind, blink){
  const key = kind + (blink ? '~' : '');
  if (potCache[key]) return potCache[key];
  const sp = POT[kind], P = PAL[sp.pal], W = sp.w, H = sp.h, S = shapeOf(sp);
  const pb = new PB(W, H), body = new Uint8Array(W*H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (S.f(x + .5, y + .5)) body[y*W + x] = 1;
  /* 1ドットだけ飛び出す所（楕円のはしなど）をけずる（v1.2・しょーくん「にこにこいもの左にドット抜けみたいな飛び出し」）。とがらせたい形（sharp：星・月・おばけのすそ・プリズム・ダイヤ・ホットケーキ・精霊の炎）はそのまま */
  if (!sp.sharp) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ const i = y*W + x; if (body[i] && body[i-1] + body[i+1] + body[i-W] + body[i+W] <= 1) body[i] = 0; }
  const ins = (x, y) => x >= 0 && y >= 0 && x < W && y < H && body[y*W + x] === 1;
  const tone = new Array(W*H).fill(null);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    if (!ins(x, y)) continue;
    const nx = (x + .5 - S.cx)/S.hx, ny = (y + .5 - S.cy)/S.hy, L = -(nx*.6 + ny*.8);
    let t = 'b';
    if (L > .48) t = 'l';
    if (L < -.5) t = 'd';
    if ((!ins(x, y-1) || !ins(x-1, y)) && L > 0) t = 'l';
    if (!ins(x, y+1) || (!ins(x+1, y) && ny > -.2) || (!ins(x, y+2) && L < .2)) t = 'd';
    tone[y*W + x] = t;
  }
  const hx = Math.floor(S.cx - S.hx*.42), hy = Math.floor(S.cy - S.hy*.5);
  for (const [x, y] of [[hx, hy], [hx+1, hy], [hx, hy+1]]) if (ins(x, y) && tone[y*W + x] !== 'd') tone[y*W + x] = 'h';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const t = tone[y*W + x]; if (!t) continue;
    pb.set(x, y, sp.pal === 'niji' ? nijiCol(x, y, t) : sp.pal === 'pearl' ? pearlCol(x, y, t) : sp.pal === 'gal' ? galCol(x, y, t) : sp.col ? COL[sp.col](x, y, t, S, P, sp) : P[t], 'body');
  }
  for (const [dx, dy] of (sp.dim || [])){
    const x = Math.floor(S.cx + dx), y = Math.floor(S.cy + dy);
    if (ins(x, y) && ins(x, y+1) && tone[y*W + x] !== 'h'){ pb.set(x, y, P.d, 'body'); if (tone[(y+1)*W + x] !== 'd') pb.set(x, y+1, P.l, 'body'); }
  }
  if (sp.extra === 'sprout') sprouts(pb, ins, S);
  if (sp.extra === 'cap') cap(pb, S);
  if (sp.extra === 'mush') mush(pb, S);
  if (sp.extra === 'crown') crown(pb, S);
  if (sp.extra === 'nori') for (let y = H - 6; y < H - 1; y++) for (let x = 0; x < W; x++) if (ins(x, y) && Math.abs(x + .5 - S.cx) <= 3.6) pb.set(x, y, y === H - 6 ? '#34452c' : '#1d2a20', 'body');
  if (sp.extra === 'legs'){ const bot = Math.floor(S.cy + S.hy) - 1; for (let i = 0; i < 5; i++){ const lx = Math.round(S.cx - 6 + i*3); for (let j = 0; j < 4; j++) pb.set(lx + (j % 2 ? (i % 2 ? 1 : -1) : 0), bot + j, j === 3 ? P.d : P.b, 'body'); } }
  if (sp.shape === 'shell') for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ if (!ins(x, y) || y > S.py - 2) continue; const a2 = Math.atan2(y + .5 - S.py, x + .5 - S.px); if (Math.floor((a2 + Math.PI)*6.4) % 2 && tone[y*W + x] !== 'h') pb.set(x, y, mix(pb.get(x, y), P.d, .45), 'body'); }
  if (sp.extra === 'halo') halo(pb, S, W);
  const EX = [].concat(sp.extra || []); for (const e of EX) if (XA[e]) XA[e](pb, S, sp, P, ins, W, H);
  pb.outline(m => ({sprout:'#2c5a1b', cap:'#1e2c66', pom:'#56658c', mush:'#5a1410', crown:'#653900', wing:'#8a9ab8', mugi:'#6b4a10', ribbon:'#3a1420', gold:'#653900', lacq:'#3a0808', gem:'#2a1240', wrap:'#2a5a8a', plate:'#56658c', berry:'#5a1010', cone:'#5a2e10', cream:'#7a6a5a', glass:'#4a6a8a', wood:'#4a2e10', tail:'#5a2008', butter:'#8a6a10', candle:'#5a4a6a', ear:'#3a1e0c', beak:'#6a2a00', ink:'#0a0a10', mane:'#4a2008', ringm:'#3a2a6a', metal:'#262b33', panel:'#0a1430', ray:'#7a2a00', disk:'#3a1400', brass:'#4a3410', red:'#4a0a0a', hat:'#1a0e3a', horn:'#5a3a10', wingf:'#3a7a8a', flower:'#7a2a4a', blade:'#2a3040', flame:'#6a1a08', cape:'#3a0408', mane2:'#6a4a8a', wingd:'#0a2018'})[m] || P.o);
  const at = (dx, dy, c, w = 1, h = 1) => pb.rect(Math.floor(S.cx + dx), Math.floor(S.cy + dy), w, h, c, 'body');
  if (sp.extra === 'rot'){ at(-6, 1.5, '#57522a', 2, 2); at(-6, 1.5, '#6b6533'); at(4, -4.5, '#4e5828', 2, 1); at(1, 4.5, '#57522a'); at(-3, -4.5, '#4e5828'); }
  if (sp.extra === 'crack'){ at(3.5, -4, '#4a4e56'); at(4.5, -3, '#4a4e56'); at(3.5, -2, '#4a4e56'); at(4.5, -4, '#d6d9de'); at(-4.5, 3, '#6a6f79'); at(3, 4, '#6a6f79'); at(-1.5, -4.5, '#d6d9de'); }
  if (sp.extra === 'specks'){ for (const [dx, dy] of [[-5.5, .5], [-3.5, 3.5], [3.5, -3.5], [4.5, 2.5], [.5, 4.5], [-1.5, -4.5]]) at(dx, dy, '#a37a4c'); at(5.5, -.5, '#8e939c'); at(-4.5, -2.5, '#8e939c'); }
  if (sp.extra === 'steam') for (const [dx, h] of [[-4, 3], [0, 4], [4, 3]]){ const x = Math.floor(S.cx + dx), top = Math.floor(S.cy - S.hy) - 1; for (let i = 0; i < h; i++) pb.set(x + ((i % 2) ? 1 : 0), top - i, i === h - 1 ? '#ffffff' : '#efe4d4', 'fx'); }
  if (sp.extra === 'snow') for (const [dx, dy] of [[-4, -3], [3, -4], [4.5, 2], [-4.5, 2.5], [0, 4.5]]) at(dx, dy, '#b9cde8');
  if (sp.extra === 'mirror'){ for (const [dx, dy] of [[-5, -1], [-4, -2], [-3, -3], [-4, 1], [-3, 0], [-2, -1], [-1, -2]]) at(dx, dy, WHITE); }
  if (sp.extra === 'wave') for (let x = 0; x < W; x++){ const y = Math.round(S.cy + 3.4 + Math.sin(x*1.15)*.8); if (ins(x, y) && ins(x, y + 1)) pb.set(x, y, '#e4f5ff', 'body'); }
  if (sp.extra === 'stars'){ for (const [dx, dy, c] of [[-5, -2, WHITE], [-2, -4, '#ffe27a'], [3, -3, WHITE], [5.5, 1, '#ffe27a'], [-4.5, 2.5, WHITE], [2, 3.5, '#bfe3ff']]) at(dx, dy, c); const x = Math.floor(S.cx + 4), y = Math.floor(S.cy - 1); for (const [a2, b2] of [[0,-1],[-1,0],[1,0],[0,1]]) pb.set(x + a2, y + b2, '#ffe27a', 'body'); pb.set(x, y, WHITE, 'body'); }
  for (const e of EX) if (XB[e]) XB[e](pb, S, sp, P, ins, W, H, at);
  for (const [x, y, r] of sp.spk || []) spk(pb, x < 0 ? W + x : x, y < 0 ? H + y : y, r);
  if (sp.extra === 'glint'){ const x = W - 4, y = 2; for (const [a, b] of [[0,-1],[-1,0],[0,0],[1,0],[0,1]]) pb.set(x + a, y + b, WHITE, 'fx'); }
  face(pb, sp, S, blink);
  return (potCache[key] = pb);
}

