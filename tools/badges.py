"""Game Center の実績のバッジを撮る（ver 2.9）
docs/kobo/gamecenter.json の実績ぜんぶを、index.html の #shot=badge:<id> で 1024×1024 に撮り、
docs/kobo/achievements/<Game Center の id>.png（RGB・透明なし）に書く。並べた見本は --sheet <ファイル> で。
使い方：node tools/build.mjs のあとに python3 tools/badges.py
"""
import json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GC = json.load(open(os.path.join(ROOT, 'docs/kobo/gamecenter.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, 'docs/kobo')

files = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 1024, 'height': 1024}, device_scale_factor=1).new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ROOT, 'index.html'))
    pg.wait_for_timeout(500)
    for a in GC['achievements']:
        gid = a['id']
        pg.evaluate("h => { location.hash = h; }", 'shot=badge:' + gid[len('imo_'):])
        pg.wait_for_timeout(250)
        f = os.path.join(OUT, a['image'])
        os.makedirs(os.path.dirname(f), exist_ok=True)
        pg.screenshot(path=f)
        Image.open(f).convert('RGB').save(f, optimize=True)
        files.append(f)
    b.close()
if errs:
    sys.exit('エラー：' + errs[0])
print(f'{len(files)}枚を撮りました')

if '--sheet' in sys.argv:
    ims = [Image.open(f).resize((256, 256), Image.NEAREST) for f in files]
    cols = 5
    sheet = Image.new('RGB', (cols*266, ((len(ims) + cols - 1)//cols)*266), 'white')
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % cols)*266, (i//cols)*266))
    sheet.save(sys.argv[sys.argv.index('--sheet') + 1])
