# 地図

- 直すのは src/ のファイル。直したら `node tools/build.mjs` で index.html を作りなおす（`npm test` で src と index.html がずれていないか確かめる）
- **index.html は自動で作るファイル。手で直さない**（遊ぶ人が開く出口なので、コミットはする。場所・名前・1ファイルで動くことは変えない）
- 絵はコードで描いたドット絵（base64 の埋めこみはない）。探すときは `grep -n '関数名' src/*.js | cut -c1-200` → 前後だけ読む

## ファイルの役目（つなぐ順＝ src/shell.html の「@@include」の順）
- shell.html：HTML のわく（head・画面の部品の HTML・script のかこみ）。「@@include ファイル名」の行が、そのファイルの中身になる
- style.css：見た目（.hud 上の表示・.hud::before 上の黒い帯・.qnote めあての付箋・.toast/.achpop/.rpop お知らせ・.drawer 引き出し・.brow 施設の行・.zgrid 図鑑）
- 絵の表 ART（1つ目の script。`const ART = (() => {` は art-imo.js、`})();` は art-icons.js の最後）
  - art-imo.js：色の計算・PB（ドット絵の板）・いも39しゅるい（PAL・POT・shapeOf）
  - art-imo70.js：畑5〜11の70しゅるい（COL・XA・XB）・顔 face・potatoPB
  - art-icons.js：アイコン IC・パートさんなど worker/airBox/roboBase・書き出し（ART の中身の一覧）
- ゲーム本体（2つ目の script。`(() => {` は game-data.js の1行目、`})();` は game-screens.js の最後）
  - game-data.js：いも KINDS（109）・FARMS・GOOD_W/RARE_W・BAD_RATE・RARE_SEC／施設 BLD（20）・TIERS・UPG・FARM_DEALS・CATS・GOALS（めあて）／転生 PRES_MIN・PERKS・applyPerk／実績 ACH
  - game-core.js：状態 DEF・merge（古いセーブの補い）・load・save（セーブ名 imo-v2）／計算 recalc（D.cps・D.interval・D.lineRate）・earn／数字 fmt・fmtR・fmtTime／画面の大きさ resize・layout・buildStatic／pix・img（ドット絵を部品に）／音 SFX・BGM
  - game-belt.js：ベルトの上 warm（はじめのゆっくり）・spawn・tapAt・ship・startFever・beltTick・fxTick・econTick／描く drawBelt・drawPot・drawStations・draw
  - game-ui.js：toast・alignRows・fitText・hudTick（お知らせの順番・calmT）・fitCoins/fitRate（上のお金・毎秒をボタンにかからない大きさに）・setQuest・checkGoal・holdAchPop／実績 checkAch・renderAch／留守 calcAway・showAway／工場 renderShop・bldRow・buyBld・buyUpg／転生 renderSeed・doPrestige
  - game-screens.js：図鑑 renderZukan／引き出し openDrawer・closeDrawers／カード・メニュー openCard・openMenu／タイトル startGame／はじまり frame・start
- 1つの .js は500行くらいまで。大きくなったら、節（`/* ---------- 〇〇 ---------- */`）の切れ目で分けて、shell.html に「@@include」を足す

## ビルドと確かめ
- `node tools/build.mjs`：index.html を作る（Node の標準だけ）
- `node tools/build.mjs --check`（＝ `npm test`）：index.html が src と同じか
- `python3 tools/loadtest.py`：負荷テスト（Playwright。転生をくり返し・施設を大量にして、1コマの時間とエラーを見る）

## 枠の決まり（ver 2.4〜）
- 同じしゅるいの枠は、中身にかかわらず同じ大きさ。1行の名前は class="fit"（はみ出したら 16→14→12px）、説明は class="clamp2"（14px・高さ38px・2行まで）
- 描きなおしたら fitText(その入れもの) をよぶ（renderShop・renderSeed・renderUpgDetail・renderZukan・renderAch）
- 引き出しの背景はダンボール色（.drawer の --bg）。中のボタンは白っぽい色
- 縦のライン（ver 2.5）：施設・種の改良のリスト（.blist の .brow）は、アイコンの列と値段の列の幅を、そのリストでいちばん広いものにそろえる（alignRows が --iw・--cw に入れる。fitText の中でよばれる）。値段の列はコイン・種が左、数字が右。値段の列は行の4割まで、はみ出した数字は .fit でちぢむ

## お知らせの決まり
- 引き出しやカードを開いているあいだに起きた「めあて達成」と「実績」は、画面にもどって0.5秒たってから1つずつ出す
- 引き出しの中で出た大事なお知らせ（new・gold）は、閉じたら画面でもう一度ちゃんと出す
