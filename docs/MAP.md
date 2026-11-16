# 地図（index.html・約2,880行）

ビルドなし。index.html 1つで動く。絵はコードで描いたドット絵（base64 の埋めこみはない）。
探すときは `grep -n '関数名' index.html | cut -c1-200` → 前後だけ読む。

## 大きなまとまり（行の目安）
- 7〜329：CSS（.hud 上の表示・.qnote めあての付箋・.toast/.achpop/.rpop お知らせ・.drawer 引き出し・.brow 施設の行・.zgrid 図鑑）
- 330〜466：画面の部品（HTML）
- 462〜1293：絵の表 ART（芋の形 POT・色 PAL・飾り XA/XB・アイコン IC・パートさんなど）
- 1294〜2830：ゲーム本体（下）

## ゲーム本体（`/* ---------- 〇〇 ---------- */` の見出しで探せる）
- いも：KINDS（109しゅるい）・FARMS・GOOD_W/RARE_W・BAD_RATE・RARE_SEC
- 施設・改良：BLD（20）・TIERS・UPG・FARM_DEALS・CATS・GOALS（めあて）
- 転生：PRES_MIN・PERKS（種の改良）・applyPerk
- 実績：ACH
- 状態：DEF・merge（古いセーブの補い）・load・save（セーブ名 imo-v2）
- 計算：recalc（D.cps・D.interval 芋の間かく・D.lineRate）・earn
- 数字：fmt・fmtR・fmtTime
- 画面の大きさ：layout（ベルト・通路・G.run＝ベルトの長さ）
- 音：SFX・BGM
- ベルトの上：warm（はじめのゆっくり）・spawn・tapAt・ship・startFever・beltTick（ベルトの速さ・芋の出る間かく・スタッフ）・econTick
- 描く：drawBelt・drawPot・drawStations・draw
- 画面の部品：toast・fitText（1行の名前をちぢめる）・hudTick（お知らせの順番・calmT）・setQuest・checkGoal（めあて達成・qDoneQ）・showAchPop・showRarePop・checkAch
- 留守ボーナス：calcAway・showAway
- 工場：renderShop・bldRow・buyBld・buyUpg／転生：renderSeed・doPrestige
- 図鑑：renderZukan／引き出し：openDrawer・closeDrawers
- カード・メニュー：openCard・openMenu／タイトル：startGame／はじまり：frame・start

## 枠の決まり（ver 2.4）
- 同じしゅるいの枠は、中身にかかわらず同じ大きさ。1行の名前は class="fit"（はみ出したら 16→14→12px）、説明は class="clamp2"（14px・高さ38px・2行まで）
- 描きなおしたら fitText(その入れもの) をよぶ（renderShop・renderSeed・renderUpgDetail・renderZukan・renderAch）
- 引き出しの背景はダンボール色（.drawer の --bg）。中のボタンは白っぽい色
- 縦のライン（ver 2.5）：施設・種の改良のリスト（.blist の .brow）は、アイコンの列と値段の列の幅を、そのリストでいちばん広いものにそろえる（alignRows が --iw・--cw に入れる。fitText の中でよばれる）。値段の列はコイン・種が左、数字が右。値段の列は行の4割まで、はみ出した数字は .fit でちぢむ

## お知らせの決まり
- 引き出しやカードを開いているあいだに起きた「めあて達成」と「実績」は、画面にもどって0.5秒たってから1つずつ出す
- 引き出しの中で出た大事なお知らせ（new・gold）は、閉じたら画面でもう一度ちゃんと出す
