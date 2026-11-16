# 負荷テスト（ぽいっと！いも工場）
#   python3 tools/loadtest.py            … ふつう（重い場面の1コマの時間・早送りで転生をくり返す・エラー/NaN の確かめ）
#   python3 tools/loadtest.py --shots DIR … スクショも DIR に保存
# いるもの：python3 の playwright と Chrome（/usr/bin/google-chrome）。index.html はそのまま、テスト用のコピーを一時フォルダに作って使う
import json, os, re, sys, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
CHROME = '/usr/bin/google-chrome'

# テスト用のコピー：ゲームの中身を window.__imo から見られるようにする（index.html 自体は変えない）
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
HOOK = ("window.__imo = {get S(){return S}, get D(){return D}, get pots(){return pots}, get texts(){return texts}, get parts(){return parts},"
        " get flies(){return flies}, get coinsFly(){return coinsFly}, get feverT(){return feverT}, BLD, UPG, PERKS, ACH, KINDS, ORDER, PRES_MIN,"
        " recalc, tapAt, startFever, buyBld, buyUpg, buyPerk, buyKiseki, doPrestige, bldCost, availUpgs, seedsAv, kisekiCost, canPres, presGain,"
        " openDrawer, closeDrawers, setShopTab, renderZukan, openAch, fmt};\n")
assert html.count('const hot = window.claude') == 1
html = html.replace('const hot = window.claude', HOOK + 'const hot = window.claude')
tmp = tempfile.mkdtemp(); test_html = os.path.join(tmp, 'index.html')
open(test_html, 'w', encoding='utf-8').write(html)

# 1コマの時間を測る（requestAnimationFrame の中の処理の時間）
MEASURE = """
(() => { const raf = window.requestAnimationFrame.bind(window); window.__ft = [];
  window.requestAnimationFrame = cb => raf(t => { const s = performance.now(); cb(t); window.__ft.push(performance.now() - s); }); })();
"""
# 早送り：1コマ＝0.05秒として、待たずに次のコマへ（描くのはとばす＝しくみだけ速く回す）
FAST = """
(() => { let t = 0, posted = false; const ch = new MessageChannel(), q = [];
  ch.port1.onmessage = () => { posted = false; for (let i = 0; i < 40 && q.length; i++){ const cb = q.shift(); t += 50; cb(t); if (window.__perFrame) window.__perFrame(); } if (q.length && !posted){ posted = true; ch.port2.postMessage(0); } };
  window.requestAnimationFrame = cb => { q.push(cb); if (!posted){ posted = true; ch.port2.postMessage(0); } return 1; };
  const P = CanvasRenderingContext2D.prototype, no = () => {}; let drawing = false;
  window.addEventListener('load', () => { drawing = true; });
  for (const k of ['drawImage', 'fillText', 'strokeText']){ const f = P[k]; P[k] = function(...a){ return drawing ? undefined : f.apply(this, a); }; } })();
"""
SAVE = "localStorage.setItem('imo-v2', JSON.stringify({tut:99, seenHelp:true, lastSeen:0}));"

errors = []
def page(b, init, w=390):
    pg = b.new_page(viewport={'width': w, 'height': 844}, device_scale_factor=3)
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and errors.append(m.text))
    pg.add_init_script(SAVE + init)
    pg.goto('file://' + test_html); pg.wait_for_timeout(600); pg.click('#title'); pg.wait_for_timeout(300)
    return pg

def frames(pg, ms):
    pg.evaluate('window.__ft = []'); pg.wait_for_timeout(ms)
    ft = sorted(pg.evaluate('window.__ft'))
    if not ft: return 'コマなし'
    return f'{len(ft)}コマ 平均{sum(ft)/len(ft):.2f}ms 95%{ft[int(len(ft)*.95)]:.2f}ms 最大{ft[-1]:.1f}ms'

HEAVY = """() => { const m = window.__imo, S = m.S;
  for (const b of m.BLD) S.bld[b.id] = 3000; for (const u of m.UPG) S.upg[u.id] = true; for (const p of m.PERKS) S.perk[p.id] = 1;
  S.kiseki = 12; S.seeds = 1e13; for (const k of m.ORDER) S.found[k] = 50; for (const a of m.ACH) S.ach[a.id] = 1; S.coins = 1e200; S.stats.earned = 1e200;
  m.recalc(); }"""
SCAN = """() => { const m = window.__imo, bad = [];
  const walk = (o, p) => { for (const k in o){ const v = o[k]; if (typeof v === 'number' && !isFinite(v) && !(p + k).endsWith('coins')) bad.push(p + k + '=' + v); else if (v && typeof v === 'object') walk(v, p + k + '.'); } };
  walk(m.S, 'S.'); walk(m.D, 'D.');
  return {bad:bad.slice(0, 8), pots:m.pots.length, texts:m.texts.length, parts:m.parts.length, flies:m.flies.length, coins:m.coinsFly.length}; }"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    def put(k, v): print(k, ':', json.dumps(v, ensure_ascii=False), flush=True)
    # 1) ふつうの場面と重い場面の1コマ（スマホくらいの遅さ＝CPU 4倍おそく）
    pg = page(b, MEASURE); cdp = pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    put('はじめ', frames(pg, 4000))
    pg.evaluate(HEAVY); pg.wait_for_timeout(500)
    put('施設3000ずつ', frames(pg, 4000))
    pg.evaluate('() => window.__imo.startFever(7)'); pg.wait_for_timeout(300)
    put('＋ダイヤモンドフィーバー', frames(pg, 4000))
    # 芋を手でどんどんタップ（レアもわるも）
    pg.evaluate("() => { window.__tap = setInterval(() => { const m = window.__imo; for (const q of m.pots.slice(0, 3)) if (m.KINDS[q.kind].cat !== 'good') m.tapAt(q.x, q.y); }, 60); }")
    put('＋連打', frames(pg, 4000))
    pg.evaluate('() => clearInterval(window.__tap)')
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'heavy.png'))
    pg.evaluate("() => { window.__imo.openDrawer('shop'); }"); pg.wait_for_timeout(400)
    put('工場を開いたまま', frames(pg, 3000))
    pg.evaluate("() => { window.__imo.setShopTab('s'); }"); pg.wait_for_timeout(300)
    put('転生のページ', frames(pg, 3000))
    pg.evaluate("() => { window.__imo.closeDrawers(true); window.__imo.openDrawer('zukan'); }"); pg.wait_for_timeout(300)
    put('図鑑', frames(pg, 2000))
    pg.evaluate("() => { window.__imo.closeDrawers(true); window.__imo.openAch(); }"); pg.wait_for_timeout(300)
    put('実績', frames(pg, 2000))
    put('重い場面のあと', pg.evaluate(SCAN))
    put('数字の表示', pg.evaluate("() => [1e4, 1.5e8, 9.99e71, 1e72, 1.23e75, 1e135, 1e136, 1e300].map(n => window.__imo.fmt(n)).join(' / ')"))
    pg.close()

    # 2) 早送りで遊ぶ：ロボットが買い物とタップ、転生を何回も
    pg = page(b, FAST)
    # ロボット：毎コマ わる芋・レア芋をタップ（よく見て遊ぶ人）。1秒ごとに改良・施設を買う（毎秒の生産あたりの値段がいちばん安い施設）。種が倍になるなら転生
    BOT = """([sec, real]) => new Promise(done => { const m = window.__imo, S = m.S, t0 = S.stats.play, r0 = performance.now(); let pres = 0, log = [], buyT = 0, end = false;
      for (const id of ['shopDrawer', 'zukanDrawer']) document.getElementById(id).style.display = 'none';  /* 引き出しは開かないので、買うたびの描きなおしを軽く */
      window.__perFrame = () => { if (end) return; const play = S.stats.play - t0;
        for (const q of m.pots) if (m.KINDS[q.kind].cat !== 'good' && q.y > 30){ m.tapAt(q.x, q.y); break; }
        if (play - buyT < 1) return; buyT = play;
        for (let i = 0; i < 4; i++){ const u = m.availUpgs()[0]; if (u && S.coins >= u.cost) m.buyUpg(u.id); else break; }
        for (let i = 0; i < 4; i++){ let best = null; for (const b of m.BLD){ const c = m.bldCost(b, 1), r = b.cps*(m.D.mult[b.id] || 1)/c; if (S.coins >= c && (!best || r > best[1])) best = [b, r]; } if (best) m.buyBld(best[0].id); else break; }
        if (m.canPres() && (pres === 0 || m.presGain() >= S.seeds)){ pres++; log.push(Math.round(play/60) + '分で転生' + pres + '（種+' + m.fmt(m.presGain()) + '）'); m.doPrestige();
          for (let i = 0; i < 40; i++){ const pk = m.PERKS.filter(x => !S.perk[x.id] && m.seedsAv() >= x.cost).sort((a, b) => a.cost - b.cost)[0]; if (pk) m.buyPerk(pk.id); else break; }
          while (m.seedsAv() >= m.kisekiCost()) m.buyKiseki(); }
        document.querySelectorAll('.modal:not([hidden])').forEach(e => e.id !== 'presModal' && (e.hidden = true));
        if (play >= sec || performance.now() - r0 > real*1000){ end = true; done({log, play:Math.round(play/60) + '分', found:Object.keys(S.found).length, pres:S.prestiges, goal:S.goal, ach:Object.keys(S.ach).length, coins:m.fmt(S.coins)}); } };
    })"""
    put('早送り（12時間ぶんか、本当の300秒まで）', pg.evaluate(BOT, [12*3600, 300]))
    put('早送りのあと', pg.evaluate(SCAN))
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'after-bot.png'))
    pg.close()
    b.close()

print('エラー :', json.dumps(errors[:10] or 'なし', ensure_ascii=False))
