/* ---------- アイコン（16×16 ほか） ---------- */
const IC = {};
function glove(main, cuff, cuffHi, seam){
  const p = new PB(16, 16);
  p.rect(4, 7, 8, 6, main);
  [[4,4],[6,3],[8,3],[10,4]].forEach(([x, y]) => p.rect(x, y, 2, 5, main));
  p.rect(12, 8, 2, 3, main); p.set(12, 11, main);
  p.rect(6, 4, 1, 4, seam); p.rect(8, 4, 1, 4, seam); p.rect(10, 5, 1, 3, seam);
  p.rect(4, 13, 8, 2, cuff); p.rect(4, 13, 8, 1, cuffHi);
  return p.outline(INK);
}
IC.coin = () => { const p = new PB(11, 11); p.disc(5.5, 5.5, 4.6, '#f4be2a'); p.recolor('#f4be2a', (x, y) => { const d = Math.hypot(x + .5 - 5.5, y + .5 - 5.5); return d > 2.4 && d < 3.4 ? '#d99a18' : null; }); shadeCol(p, '#f4be2a', 5.5, 5.5, 4.6, '#ffe27a', '#c8860f', .38, -.5); return p.outline(INK); };
IC.gear = () => { const p = new PB(16, 16), c = 7.5; for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; p.disc(c + Math.cos(a)*5.4, c + Math.sin(a)*5.4, 1.8, '#a7b0bb'); } p.disc(c, c, 5, '#a7b0bb'); shadeCol(p, '#a7b0bb', c, c, 6.5, '#d6dce3', '#76808c', .3, -.3); p.erase((x, y) => (x-c)**2 + (y-c)**2 <= 4.6); return p.outline(INK); };
IC.book = () => { const p = new PB(16, 16); p.rect(3, 1, 11, 14, '#d9574a'); p.rect(3, 1, 2, 14, '#a83a32'); p.rect(13, 2, 1, 12, '#fff4dc'); p.rect(5, 14, 8, 1, '#fff4dc'); p.rect(5, 2, 7, 1, '#ef8a7a'); p.ell(9.5, 8, 3.3, 2.8, '#7a2a24'); p.ell(9.5, 8, 2.5, 2.0, '#dea45b'); p.set(8, 7, '#fff3d0'); p.set(10, 9, '#b8763c'); return p.outline(INK); };
IC.factory = () => { const p = new PB(16, 16); p.rect(1, 8, 14, 7, '#c8674a'); for (let i = 0; i < 3; i++){ const x0 = 1 + i*4.67; p.poly([[x0, 8.4], [x0, 4.4], [x0 + 4.67, 8.4]], '#99a3b0'); } p.rect(11, 1, 3, 7, '#7b8592'); p.rect(11, 1, 3, 1, '#b0b8c3'); [[3, 10], [11, 10]].forEach(([x, y]) => p.rect(x, y, 2, 2, '#ffe17a')); p.rect(7, 11, 2, 4, '#6b3a28'); p.rect(1, 8, 14, 1, '#e08a6a'); return p.outline(INK); };
IC.close = () => { const p = new PB(10, 10); for (let i = 0; i < 7; i++){ p.rect(1 + i, 1 + i, 2, 2, INK); p.rect(7 - i, 1 + i, 2, 2, INK); } return p; };
function speaker(p){ p.rect(2, 6, 3, 4, '#8f99a6'); p.poly([[5, 6], [9.4, 2.4], [9.4, 13.6], [5, 10]], '#a7b0bb'); p.outline(INK); }
IC.sndOn = () => { const p = new PB(16, 16); speaker(p); for (const r of [3.6, 6.2]) for (let a = -0.9; a <= 0.9; a += 0.08) p.set(Math.round(8.6 + Math.cos(a)*r), Math.round(7.6 + Math.sin(a)*r), INK, 'fx'); return p; };
IC.sndOff = () => { const p = new PB(16, 16); speaker(p); for (let i = 0; i < 4; i++){ p.set(11 + i, 6 + i, '#e2553f', 'fx'); p.set(14 - i, 6 + i, '#e2553f', 'fx'); } return p; };
IC.part = () => { const p = new PB(16, 16); p.disc(8, 9.2, 5.3, '#ffd3a8'); p.fill((x, y) => (x-8)**2 + (y-9.2)**2 <= 5.3*5.3 && y < 7.6, '#ffffff'); p.rect(3, 7, 10, 1, '#dfe5ee'); p.rect(13, 4, 2, 2, '#ffffff'); p.set(14, 6, '#ffffff'); p.rect(5, 10, 1, 2, EYE); p.rect(10, 10, 1, 2, EYE); p.set(4, 12, PINK); p.set(11, 12, PINK); p.rect(7, 12, 2, 1, '#c0603a'); return p.outline(INK); };
IC.air = () => { const p = new PB(16, 16); p.rect(7, 3, 7, 10, '#97a1ad'); p.rect(7, 3, 7, 1, '#c9d0d8'); p.rect(13, 4, 1, 9, '#6c7581'); p.rect(3, 7, 4, 3, '#5b6370'); p.rect(3, 7, 4, 1, '#7d8692'); p.disc(10.5, 6.5, 1.6, '#ffffff'); p.set(10, 6, '#e2553f'); p.rect(8, 10, 5, 1, '#4fd86a'); p.outline(INK); [[0, 5, 2], [0, 8, 2], [0, 11, 2]].forEach(([x, y, l]) => p.rect(x, y, l, 1, '#5fb4e6', 'fx')); return p; };
IC.hatake = () => { const p = new PB(16, 16); p.rect(1, 9, 14, 6, '#8d5b34'); p.rect(1, 9, 14, 1, '#a8744a'); p.rect(1, 11, 14, 1, '#6b4124'); p.rect(1, 13, 14, 1, '#6b4124'); for (const x of [3, 8, 12]){ p.rect(x, 6, 1, 3, '#5fa83a', 'sprout'); p.set(x-1, 6, '#9bd86a', 'sprout'); p.set(x+1, 5, '#9bd86a', 'sprout'); } return p.outline(m => m === 'sprout' ? '#2c5a1b' : INK); };
IC.robo = () => { const p = new PB(16, 16); p.rect(3, 5, 10, 8, '#b7c0ca'); p.rect(3, 5, 10, 1, '#dde3e9'); p.rect(3, 12, 10, 1, '#8a949f'); p.rect(5, 7, 2, 2, '#4fd8f5'); p.rect(9, 7, 2, 2, '#4fd8f5'); p.set(5, 7, '#c8f6ff'); p.set(9, 7, '#c8f6ff'); p.rect(6, 10, 4, 1, '#5b6370'); p.rect(7, 2, 2, 3, '#8a949f'); p.rect(7, 1, 2, 1, '#e2553f'); p.rect(1, 7, 2, 3, '#8a949f'); p.rect(13, 7, 2, 3, '#8a949f'); return p.outline(INK); };
IC.line2 = () => { const p = new PB(16, 16); p.rect(2, 9, 12, 4, '#4b515e'); p.rect(2, 9, 12, 1, '#6c7380'); p.disc(2.5, 11, 2.1, '#9aa3af'); p.disc(13.5, 11, 2.1, '#9aa3af'); p.set(2, 11, '#5b6370'); p.set(13, 11, '#5b6370'); p.ell(8, 6.4, 3.5, 2.7, '#dea45b'); p.set(6, 5, '#fff3d0'); p.set(7, 6, EYE); p.set(9, 6, EYE); return p.outline(INK); };
IC.chips = () => { const p = new PB(16, 16); p.poly([[3, 2.5], [13, 2.5], [14.2, 14], [1.8, 14]], '#ffd43f'); p.rect(3, 2, 10, 2, '#e2553f'); p.rect(2, 13, 12, 2, '#e2553f'); for (let x = 3; x <= 12; x += 2) p.set(x, 1, '#e2553f'); p.ell(8, 8.5, 3.3, 2.5, '#f3c66a'); p.set(7, 8, '#c98a3a'); p.set(9, 9, '#c98a3a'); p.set(6, 7, '#fff0c0'); return p.outline(INK); };
IC.truck = () => { const p = new PB(16, 16); p.rect(1, 5, 9, 7, '#c98a4c'); p.rect(1, 5, 9, 1, '#e3a868'); p.rect(4, 5, 1, 7, '#a96f38'); p.rect(7, 5, 1, 7, '#a96f38'); p.ell(3, 4, 1.9, 1.5, '#dea45b'); p.ell(6.6, 3.8, 2, 1.6, '#dea45b'); p.rect(10, 7, 5, 5, '#4f8fe0'); p.rect(11, 8, 3, 2, '#bfe3ff'); p.rect(10, 7, 5, 1, '#7fb0f0'); p.rect(1, 12, 14, 1, '#3d4450'); p.disc(4, 13.5, 1.8, '#2c2f36'); p.disc(12, 13.5, 1.8, '#2c2f36'); p.set(4, 13, '#9aa3af'); p.set(12, 13, '#9aa3af'); return p.outline(INK); };
IC.lab = () => { const p = new PB(16, 16), fl = [[6, 6], [10, 6], [14.5, 14.5], [1.5, 14.5]]; p.rect(6, 1, 4, 5, '#e6f6ff'); p.rect(5, 1, 6, 1, '#c7e2f0'); p.poly(fl, '#e6f6ff'); p.fill((x, y) => pip(fl, x, y) && y > 9.5, '#7bd66a'); p.set(7, 12, '#ffffff'); p.set(9, 13, '#ffffff'); p.set(8, 8, '#bfe6ff'); p.set(10, 11, '#b5ef9f'); return p.outline(INK); };
IC.sky = () => { const p = new PB(16, 16); p.disc(5, 10.5, 3.4, '#ffffff'); p.disc(9, 9, 4, '#ffffff'); p.disc(12.4, 11, 3, '#ffffff'); p.rect(3, 11, 11, 3, '#ffffff'); p.recolor('#ffffff', (x, y) => y >= 12 ? '#d6e1ef' : null); p.rect(9, 3, 1, 3, '#5fa83a', 'sprout'); p.rect(7, 3, 2, 1, '#9bd86a', 'sprout'); p.rect(10, 2, 2, 1, '#9bd86a', 'sprout'); return p.outline(m => m === 'sprout' ? '#2c5a1b' : '#4e5d80'); };
IC.space = () => { const p = new PB(16, 16); p.ell(8, 7, 3.2, 5.6, '#f1f3f8'); shadeCol(p, '#f1f3f8', 8, 7, 5, '#ffffff', '#c9cfdb'); p.disc(8, 6, 1.5, '#5fb4e6'); p.set(7, 5, '#c8ecff'); p.poly([[4.8, 9], [2.4, 13.2], [5.6, 12]], '#e2553f'); p.poly([[11.2, 9], [13.6, 13.2], [10.4, 12]], '#e2553f'); p.rect(7, 12, 2, 1, '#e2553f'); p.outline(INK); p.rect(7, 14, 2, 1, '#ffb43a', 'fx'); p.set(7, 15, '#ffe27a', 'fx'); return p; };
IC.glove = () => glove('#ffffff', '#5fb4e6', '#8fd0f5', '#dfe5ee');
IC.gglove = () => glove('#ffe27a', '#e2553f', '#ff8f7a', '#e8b52a');
IC.box = () => { const p = new PB(16, 16); p.rect(2, 6, 12, 8, '#d39a55'); p.poly([[2, 6.5], [5, 3], [11, 3], [14, 6.5]], '#e8b673'); p.rect(7, 3, 2, 11, '#f1d39a'); p.rect(2, 13, 12, 1, '#ad7a3f'); return p.outline(INK); };
IC.lens = () => { const p = new PB(16, 16); for (const [a, b] of [[0, 0], [1, 0], [0, 1]]) p.line(9 + a, 9 + b, 13 + a, 13 + b, '#8a5a34'); p.disc(6.5, 6.5, 4.6, '#c9a75a'); p.disc(6.5, 6.5, 3.3, '#cdeeff'); p.set(5, 4, '#ffffff'); p.set(4, 5, '#ffffff'); return p.outline(INK); };
IC.map = () => { const p = new PB(16, 16); p.poly([[1, 3], [5, 2], [10, 3.5], [15, 2], [15, 13], [10, 14], [5, 12.5], [1, 14]], '#f3e3b6'); p.rect(5, 2, 1, 11, '#dcc58f'); p.rect(10, 3, 1, 11, '#dcc58f'); p.ell(4, 9, 1.8, 1.5, '#7cc35a'); p.ell(12, 6, 2, 1.6, '#7cc35a'); p.set(6, 8, '#e2553f'); p.set(8, 7, '#e2553f'); p.set(10, 8, '#e2553f'); p.rect(11, 9, 2, 2, '#e2553f'); return p.outline(INK); };
IC.scroll = () => { const p = new PB(16, 16); p.rect(3, 2, 10, 12, '#fbf1dc'); p.rect(2, 1, 12, 2, '#d8b77a'); p.rect(2, 13, 12, 2, '#d8b77a'); p.rect(5, 5, 6, 1, '#b9a27a'); p.rect(5, 7, 6, 1, '#b9a27a'); p.rect(5, 9, 3, 1, '#b9a27a'); p.disc(10.5, 10.5, 1.8, '#e2553f'); return p.outline(INK); };
IC.star = () => { const p = new PB(16, 16), pts = []; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i % 2 ? 3.1 : 7.2; pts.push([8 + Math.cos(a)*r, 8.6 + Math.sin(a)*r]); } p.poly(pts, '#ffd23f'); shadeCol(p, '#ffd23f', 8, 8.6, 6, '#fff3a0', '#e0a01c'); return p.outline(INK); };
IC.trophy = () => { const p = new PB(16, 16), G = '#f4be2a'; p.poly([[3, 2], [13, 2], [12.4, 6.5], [10, 9.2], [6, 9.2], [3.6, 6.5]], G); p.rect(7, 9, 2, 3, G); p.rect(4, 12, 8, 3, '#a8744a'); p.rect(4, 12, 8, 1, '#c98a5a'); p.rect(6, 13, 4, 1, '#ffe27a'); for (const [x, y] of [[1, 3], [1, 4], [1, 5], [2, 6], [3, 7]]) p.set(x, y, G); for (const [x, y] of [[14, 3], [14, 4], [14, 5], [13, 6], [12, 7]]) p.set(x, y, G); shadeCol(p, G, 8, 5, 6, '#fff2a0', '#c8860f', .4, -.2); p.rect(5, 3, 1, 3, '#ffffff'); return p.outline(INK); };
function note(p){ p.rect(9, 2, 1, 9, INK); p.rect(10, 2, 3, 1, INK); p.rect(12, 3, 1, 2, INK); p.ell(7, 11.5, 2.8, 2.1, '#ffcd3c'); p.outline(INK); }
IC.note = () => { const p = new PB(16, 16); note(p); return p; };
IC.noteOff = () => { const p = new PB(16, 16); note(p); for (let i = 0; i < 4; i++){ p.set(11 + i, 9 + i, '#e2553f', 'fx'); p.set(14 - i, 9 + i, '#e2553f', 'fx'); } return p; };
IC.seed = () => { const p = new PB(16, 16); p.ell(8, 11.5, 4.8, 3.4, '#dea45b'); shadeCol(p, '#dea45b', 8, 11.5, 4.5, '#f3ca82', '#b8763c'); p.rect(7, 4, 2, 5, '#5fa83a', 'sprout'); p.ell(4.6, 4.6, 2.8, 1.7, '#8fd96a', 'sprout'); p.ell(11.4, 3.6, 2.8, 1.7, '#8fd96a', 'sprout'); p.set(4, 4, '#cdf6a8', 'sprout'); p.set(11, 3, '#cdf6a8', 'sprout'); return p.outline(m => m === 'sprout' ? '#2c5a1b' : INK); };
IC.clover = () => { const p = new PB(16, 16), g = '#5fbf4a'; for (const [x, y] of [[5.5, 5.5], [10.5, 5.5], [5.5, 10.5], [10.5, 10.5]]) p.disc(x, y, 3, g); p.disc(8, 8, 2, g); shadeCol(p, g, 8, 8, 7, '#a6e88a', '#3d8a30'); p.line(9, 11, 12, 15, '#3d8a30'); return p.outline(INK); };
IC.shrine = () => { const p = new PB(16, 16), R = '#d9473a'; p.rect(0, 1, 16, 1, '#3b3b3b'); p.rect(0, 2, 16, 2, R); p.rect(1, 2, 14, 1, '#f07a66'); p.rect(3, 4, 2, 11, R); p.rect(11, 4, 2, 11, R); p.rect(2, 6, 12, 1, R); p.rect(7, 4, 2, 2, R); p.rect(3, 4, 1, 11, '#f07a66'); p.ell(8, 12.4, 2.6, 2.1, '#dea45b'); p.set(7, 12, EYE); p.set(9, 12, EYE); return p.outline(INK); };
IC.time = () => { const p = new PB(16, 16); p.disc(8, 9.5, 5.8, '#4f8fe0'); p.disc(8, 9.5, 4.6, '#fbf1dc'); p.rect(8, 6, 1, 4, INK); p.rect(8, 9, 3, 1, INK); p.set(8, 9, '#e2553f'); p.rect(7, 1, 2, 3, '#5fa83a', 'sprout'); p.set(6, 1, '#9bd86a', 'sprout'); p.set(9, 0, '#9bd86a', 'sprout'); return p.outline(m => m === 'sprout' ? '#2c5a1b' : INK); };
IC.planet = () => { const p = new PB(16, 16); p.disc(8, 8, 5.2, '#dea45b'); shadeCol(p, '#dea45b', 8, 8, 5.2, '#f3ca82', '#b8763c'); p.set(6, 7, EYE); p.set(10, 7, EYE); p.set(8, 9, MOUTH); p.fill((x, y) => { const o = ((x-8)/7.8)**2 + ((y-8.8)/2.3)**2 <= 1, i = ((x-8)/5.6)**2 + ((y-8.8)/1.2)**2 <= 1; return o && !i && (y > 8.8 || (x-8)**2 + (y-8)**2 > 5.2*5.2); }, '#8fd0f5', 'ring'); return p.outline(m => m === 'ring' ? '#2c5a7a' : INK); };
IC.gate = () => { const p = new PB(16, 16); p.disc(8, 8, 7, '#7a5ad6'); p.recolor('#7a5ad6', (x, y) => (x + y) % 3 === 0 ? '#a98af0' : null); p.disc(8, 8, 5, '#2a1d55'); for (const [x, y] of [[5, 6], [10, 5], [11, 10], [6, 11]]) p.set(x, y, '#c3adf5'); p.set(8, 8, '#fff2a0'); p.set(7, 8, '#c3adf5'); return p.outline(INK); };
IC.bang = () => { const p = new PB(16, 16), pts = []; for (let i = 0; i < 16; i++){ const a = i*Math.PI/8, r = i % 2 ? 3.8 : 7.6; pts.push([8 + Math.cos(a)*r, 8 + Math.sin(a)*r]); } p.poly(pts, '#ffd23f'); p.disc(8, 8, 3.8, '#ff9a3c'); p.ell(8, 8, 2.5, 2, '#dea45b'); p.set(7, 8, EYE); p.set(9, 8, EYE); return p.outline(INK); };
IC.cat = () => { const p = new PB(16, 16), O = '#f2a34a'; p.ell(8, 9.5, 6, 5, O); p.poly([[2.4, 7], [3.6, 1.6], [7, 5.4]], O); p.poly([[13.6, 7], [12.4, 1.6], [9, 5.4]], O); p.set(4, 4, '#ffb3a3'); p.set(12, 4, '#ffb3a3'); p.rect(4, 6, 2, 1, '#c97a2a'); p.rect(10, 6, 2, 1, '#c97a2a'); p.set(5, 9, EYE); p.set(11, 9, EYE); p.set(5, 10, EYE); p.set(11, 10, EYE); p.set(8, 11, '#e2553f'); p.set(7, 12, MOUTH); p.set(9, 12, MOUTH); p.set(3, 11, PINK); p.set(13, 11, PINK); return p.outline(INK); };
IC.fractal = () => { const p = new PB(16, 16); const tri = (x, y, s, d) => { if (d === 0 || s < 2){ p.poly([[x, y + s], [x + s/2, y], [x + s, y + s]], '#ffcd3c'); return; } tri(x, y + s/2, s/2, d - 1); tri(x + s/2, y + s/2, s/2, d - 1); tri(x + s/4, y, s/2, d - 1); }; tri(.5, 1, 15, 2); p.recolor('#ffcd3c', (x, y) => y > 11 ? '#d8901a' : y < 5 ? '#fff2a0' : null); return p.outline(INK); };
IC.formula = () => { const p = new PB(16, 16); p.rect(1, 2, 14, 10, '#2f6b3f'); p.rect(1, 2, 14, 1, '#4f8f5f'); p.rect(3, 5, 3, 1, '#f2f5ea'); p.rect(3, 8, 3, 1, '#f2f5ea'); p.rect(4, 4, 1, 3, '#f2f5ea'); p.rect(8, 6, 2, 1, '#f2f5ea'); p.rect(8, 8, 2, 1, '#f2f5ea'); p.ell(12.5, 7, 1.6, 1.4, '#dea45b'); p.rect(3, 12, 1, 3, '#8a5a34'); p.rect(12, 12, 1, 3, '#8a5a34'); return p.outline(INK); };
IC.multi = () => { const p = new PB(16, 16); p.disc(5.5, 6, 4.2, '#8fd0f5'); p.disc(10.5, 6, 4.2, '#c3adf5'); p.disc(8, 10.5, 4.2, '#ffcd3c'); p.set(4, 4, '#ffffff'); p.set(9, 4, '#ffffff'); p.set(7, 9, '#ffffff'); return p.outline(INK); };
IC.dream = () => { const p = new PB(16, 16); p.disc(8, 8, 7, '#3c2f80'); p.disc(6.5, 7, 4, '#ffe887'); p.disc(8.6, 5.6, 3.6, '#3c2f80'); for (const [x, y] of [[11, 10], [12, 4], [4, 12]]) p.set(x, y, '#ffffff'); p.ell(10.5, 11.5, 2.2, 1.6, '#dea45b'); p.set(10, 11, EYE); p.set(11, 11, EYE); return p.outline(INK); };
IC.imo = () => { const p = new PB(16, 16); for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; p.line(8, 8, 8 + Math.cos(a)*7.4, 8 + Math.sin(a)*7.4, '#ffe887'); } p.ell(8, 8.4, 5, 4.2, '#f2ba1e'); shadeCol(p, '#f2ba1e', 8, 8.4, 4.6, '#fff2a0', '#cb8a10'); p.set(6, 8, EYE); p.set(10, 8, EYE); p.set(5, 9, PINK); p.set(11, 9, PINK); p.set(8, 10, MOUTH); return p.outline(INK); };
const icCache = {};
const icon = name => icCache[name] || (icCache[name] = IC[name]());

/* ---------- ベルトの横の仲間 ---------- */
function worker(f){
  const p = new PB(18, 20);
  p.rect(6, 16, 2, 2, '#5b4a3a'); p.rect(10, 16, 2, 2, '#5b4a3a');
  p.rect(5, 10, 8, 6, '#f08a3c');
  p.rect(6, 11, 6, 5, '#5fae5a'); p.rect(6, 11, 6, 1, '#86cc7c'); p.rect(8, 13, 2, 1, '#3f8040');
  p.rect(4, 11, 1, 4, '#f08a3c'); p.set(4, 15, '#ffd3a8');
  if (f === 0){ p.rect(13, 11, 1, 4, '#f08a3c'); p.set(13, 15, '#ffd3a8'); }
  else { p.rect(13, 10, 3, 1, '#f08a3c'); p.rect(16, 9, 1, 2, '#ffd3a8'); }
  p.disc(9, 5.7, 4.5, '#ffd3a8');
  p.fill((x, y) => (x-9)**2 + (y-5.7)**2 <= 4.5*4.5 && y < 4.6, '#ffffff'); p.rect(5, 4, 9, 1, '#dfe5ee');
  p.rect(13, 2, 2, 2, '#ffffff');
  p.set(7, 6, EYE); p.set(11, 6, EYE); p.set(7, 7, EYE); p.set(11, 7, EYE);
  p.set(6, 8, PINK); p.set(12, 8, PINK);
  return p.outline(INK);
}
function finger(){
  const p = new PB(11, 13), SK = '#ffe0c2', SH = '#f0b98c';
  p.rect(1, 1, 9, 2, '#5fae5a'); p.rect(1, 1, 9, 1, '#86cc7c');
  p.rect(2, 3, 7, 4, SK); p.rect(2, 7, 2, 1, SK); p.rect(7, 7, 2, 1, SK);
  p.rect(4, 7, 3, 5, SK); p.rect(4, 11, 3, 1, '#ffd3a8');
  p.rect(8, 3, 1, 4, SH); p.rect(6, 7, 1, 5, SH);
  return p.outline(INK);
}
function airBox(){
  const p = new PB(15, 17);
  p.rect(5, 2, 8, 12, '#97a1ad'); p.rect(5, 2, 8, 1, '#c9d0d8'); p.rect(12, 3, 1, 11, '#6c7581'); p.rect(5, 13, 8, 1, '#6c7581');
  p.disc(9, 6, 2.1, '#ffffff'); p.set(9, 5, '#e2553f'); p.set(10, 5, '#e2553f');
  p.rect(1, 8, 4, 3, '#5b6370'); p.rect(1, 8, 4, 1, '#7d8692');
  p.rect(7, 10, 2, 1, '#4fd86a'); p.rect(10, 10, 1, 1, '#f2c230');
  p.rect(8, 14, 2, 2, '#5b6370');
  return p.outline(INK);
}
function roboBase(){
  const p = new PB(16, 14);
  p.rect(2, 6, 12, 6, '#f2c230');
  for (let x = 2; x < 14; x++) for (let y = 10; y < 12; y++) if ((x + y) % 4 < 2) p.set(x, y, '#2b2b2b');
  p.rect(2, 6, 12, 1, '#ffe27a');
  p.disc(8, 6, 3.4, '#9aa3af'); p.set(7, 4, '#d3d9e0'); p.set(6, 5, '#d3d9e0');
  return p.outline(INK);
}
function sparkle(f){
  const p = new PB(7, 7), W = '#ffffff', Y = '#ffe066';
  if (f === 0) p.set(3, 3, W);
  if (f === 1){ p.set(3, 2, Y); p.set(2, 3, Y); p.set(4, 3, Y); p.set(3, 4, Y); p.set(3, 3, W); }
  if (f === 2){ [[3,0],[0,3],[6,3],[3,6]].forEach(([x, y]) => p.set(x, y, Y)); [[3,1],[3,2],[1,3],[2,3],[4,3],[5,3],[3,4],[3,5],[3,3]].forEach(([x, y]) => p.set(x, y, W)); }
  return p;
}
function coin(f){
  const p = new PB(9, 9), rx = [3.4, 2.4, 1.1, 2.4][f];
  p.ell(4.5, 4.5, rx, 3.4, f === 2 ? '#d8961c' : '#f4be2a');
  if (f !== 2) p.recolor('#f4be2a', (x, y) => x + .5 < 4.5 - rx*.3 ? '#ffe27a' : x + .5 > 4.5 + rx*.45 ? '#c8860f' : null);
  return p.outline(INK);
}

/* ---------- 書き出し ---------- */
const cvCache = {};
const C = (key, mk) => cvCache[key] || (cvCache[key] = mk().canvas(1));
function glowPB(pb){
  const p = new PB(pb.w + 2, pb.h + 2);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++){
    if (pb.get(x-1, y-1)) continue;
    for (const [dx, dy] of N4) if (pb.get(x-1+dx, y-1+dy)){ p.set(x, y, '#ffe066'); break; }
  }
  return p;
}
return {
  PB, mix,
  kinds: Object.keys(POT),
  size: k => [POT[k].w, POT[k].h],
  potatoPB,
  potato: (k, blink) => C('p:' + k + (blink ? '~' : ''), () => potatoPB(k, blink)),
  shadow: k => C('s:' + k, () => potatoPB(k).map(() => '#0b0d11')),
  glow: k => C('g:' + k, () => glowPB(potatoPB(k))),
  silPB: k => potatoPB(k).map((c, m) => m === 'ol' ? '#24180f' : '#4d3d30'),
  iconPB: icon,
  iconSilPB: n => icon(n).map((c, m) => m === 'ol' ? '#5a4632' : '#8a7660'),
  icons: Object.keys(IC),
  worker: f => C('w:' + f, () => worker(f)),
  finger: () => C('finger', finger),
  workerPB: worker,
  airBox: () => C('air', airBox),
  roboBase: () => C('robo', roboBase),
  sparkle: f => C('sp:' + f, () => sparkle(f)),
  coin: f => C('c:' + f, () => coin(f)),
};
})();
