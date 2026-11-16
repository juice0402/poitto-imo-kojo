(() => {
'use strict';
const $ = id => document.getElementById(id);
const root = document.documentElement;
const cv = $('cv'), ctx = cv.getContext('2d');
const low = document.createElement('canvas'), lc = low.getContext('2d');
const FONT = '"DotGothic16","Hiragino Kaku Gothic ProN","Yu Gothic",monospace';
const KEY = 'imo-v2', OLD = 'imo-proto1-v1';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* 数字の3けたごとの「,」は、作っておいた1つの NumberFormat で（toLocaleString は毎回作りなおすので重い。出る文字は同じ・ver 2.7）。fmt より前に要る */
const NF = new Intl.NumberFormat('ja-JP');
const UNITS = [[1e68,'無量大数'],[1e64,'不可思議'],[1e60,'那由他'],[1e56,'阿僧祇'],[1e52,'恒河沙'],[1e48,'極'],[1e44,'載'],[1e40,'正'],[1e36,'澗'],[1e32,'溝'],[1e28,'穣'],[1e24,'秭'],[1e20,'垓'],[1e16,'京'],[1e12,'兆'],[1e8,'億'],[1e4,'万']];

/* ---------- いも ---------- */
const KINDS = {
  futsu:  {name:'ふつういも',     cat:'good', farm:0, desc:'いたってふつうのじゃがいも。ふつうでいることに、ひそかに誇りをもっている。'},
  maru:   {name:'まるいも',       cat:'good', farm:0, desc:'ほぼ球。ベルトの上でも、ちょっとだけころがろうとする。'},
  noppo:  {name:'のっぽいも',     cat:'good', farm:0, desc:'背がたかい。本人はとくに気にしていない。まわりはちょっと気にしている。'},
  aka:    {name:'あかいも',       cat:'good', farm:1, desc:'皮が赤い。てれているわけではない、と本人は言いはっている。'},
  chibi:  {name:'ちびいも',       cat:'good', farm:1, desc:'小さい。そのぶん味がぎゅっとこい、と信じている。'},
  me:     {name:'めがでたいも',   cat:'bad',  farm:0, desc:'芽が出てしまった。やる気はあるのに、出荷はできない。'},
  kusari: {name:'くさりかけいも', cat:'bad',  farm:0, desc:'においが少しあやしい。本人もうすうす気づいている。'},
  ishi:   {name:'いしころ',       cat:'bad',  farm:0, desc:'じゃがいものふりをしている石。わりと上手。'},
  tsuchi: {name:'つちだんご',     cat:'bad',  farm:1, desc:'土のかたまり。わってみたけど、いもは入っていなかった。'},
  heart:  {name:'ハートいも',     cat:'rare', star:2, farm:0, desc:'ハートの形。だれかに渡したかったらしいが、相手はおしえてくれない。'},
  futago: {name:'ふたごいも',     cat:'rare', star:2, farm:0, desc:'くっついて育った。どっちが兄かで、ときどきもめる。'},
  niko:   {name:'にこにこいも',   cat:'rare', star:2, farm:0, desc:'なぜかずっとにこにこしている。理由はきかないであげてほしい。'},
  kin:    {name:'きんいも',       cat:'rare', star:4, farm:0, desc:'金色にかがやく。食べるか売るかで、工場のみんなが3日もめた。'},
  nemuri: {name:'ねむりいも',     cat:'rare', star:2, farm:1, desc:'ずっと寝ている。ベルトのゆれがちょうどいいらしい。'},
  shikaku:{name:'しかくいも',     cat:'rare', star:3, farm:1, desc:'箱につめやすいように、自分で四角くなった。努力家。'},
  deka:   {name:'でかいも',       cat:'rare', star:3, farm:1, desc:'大きすぎて、ベルトが少しきしむ。持ちあげるときは2人で。'},
  hoshi:  {name:'ほしいも',       cat:'rare', star:3, farm:2, desc:'星の形。干しいもとまちがえられると、すこしすねる。'},
  donut:  {name:'あなあきいも',   cat:'rare', star:3, farm:2, desc:'まん中に穴があいている。のぞくと、工場の天井が見える。'},
  niji:   {name:'にじいも',       cat:'rare', star:4, farm:2, desc:'皮が7色。どの畑から来たのか、だれも知らない。'},
  yaki:   {name:'やきいも',       cat:'rare', star:2, farm:0, desc:'はじめから焼けている。だれが焼いたのかは、工場のなぞのひとつ。'},
  mitsugo:{name:'みつごいも',     cat:'rare', star:2, farm:0, desc:'いつも3人いっしょ。写真をとるときは、まん中のとりあい。'},
  hige:   {name:'ひげいも',       cat:'rare', star:3, farm:0, desc:'根っこがひげみたいにのびた。本人はダンディのつもり。'},
  murasaki:{name:'むらさきいも',  cat:'rare', star:2, farm:1, desc:'中までむらさき。ちょっとだけ大人っぽいと思っている。'},
  yuki:   {name:'ゆきいも',       cat:'rare', star:3, farm:1, desc:'雪の中で育った。さわるとひんやりして、すこし気持ちいい。'},
  kinoko: {name:'きのこいも',     cat:'rare', star:2, farm:1, desc:'きのこのかさをかぶっている。本人は帽子だと言いはっている。'},
  onigiri:{name:'おにぎりいも',   cat:'rare', star:3, farm:1, desc:'三角にととのえた。のりを巻いたら、よけいにおにぎりっぽくなった。'},
  tsuki:  {name:'みかづきいも',   cat:'rare', star:3, farm:2, desc:'夜になると少しだけ光る。昼はずっとねむそう。'},
  obake:  {name:'おばけいも',     cat:'rare', star:3, farm:2, desc:'ふわっと浮いて見える。こわがらせたいのに、かわいいと言われる。'},
  kagami: {name:'かがみいも',     cat:'rare', star:2, farm:2, desc:'ピカピカでよく映る。のぞくと、自分の顔もちょっといもっぽい。'},
  ouji:   {name:'おうじいも',     cat:'rare', star:4, farm:2, desc:'王冠をかぶっている。どこの国の王子だったかは、本人もわすれた。'},
  umi:    {name:'うみいも',       cat:'rare', star:2, farm:3, desc:'海の色をしている。耳をあてると、なみの音がする気がする。'},
  kai:    {name:'かいいも',       cat:'rare', star:3, farm:3, desc:'貝がらの形。開けてみても、なにも入っていない。ちょっと残念。'},
  shizuku:{name:'しずくいも',     cat:'rare', star:2, farm:3, desc:'朝つゆがあつまってできた、と言われている。ぷるぷるしている。'},
  tako:   {name:'たこいも',       cat:'rare', star:3, farm:3, desc:'下に根っこが8本。数えると、なぜかいつも7本。'},
  shinju: {name:'しんじゅいも',   cat:'rare', star:4, farm:3, desc:'まんまるで、虹色につやつや。貝の中で育ったらしい。'},
  hoshizora:{name:'ほしぞらいも', cat:'rare', star:3, farm:4, desc:'皮の中に夜空がある。ときどき流れ星がとおる。'},
  sakura: {name:'さくらいも',     cat:'rare', star:3, farm:4, desc:'春のにおいがする。近くにいると、工場が少し明るくなる。'},
  tenshi: {name:'てんしいも',     cat:'rare', star:4, farm:4, desc:'頭の上に輪っか。いいことをすると、ちょっと光る。'},
  maboroshi:{name:'まぼろしいも', cat:'rare', star:5, farm:4, desc:'見た人は、工場に3人しかいない。4人目になれるかも。'},
  mugi:   {name:'むぎいも',         cat:'rare', star:2, farm:5, desc:'頭に麦の穂をのせている。黄金の畑では、これがいちばんのおしゃれ。'},
  kinpaku:{name:'きんぱくいも',     cat:'rare', star:2, farm:5, desc:'金ぱくを少しだけはってみた。はがれるたびに、だれかがそっと拾っている。'},
  koban:  {name:'こばんいも',       cat:'rare', star:2, farm:5, desc:'むかしのお金みたいな形。お店で出してみたけど、おつりはもらえなかった。'},
  kinkai: {name:'きんかいいも',     cat:'rare', star:3, farm:5, desc:'土の中から、ごろっと出てきた金のかたまり。本人がいちばんおどろいている。'},
  nobebou:{name:'のべぼういも',     cat:'rare', star:3, farm:5, desc:'金の延べ棒の形。重そうに見えて、持つとふつうの芋の重さ。'},
  medal:  {name:'メダルいも',       cat:'rare', star:3, farm:5, desc:'首からさげるリボンつき。なんの大会で1位だったのかは、ないしょ。'},
  takara: {name:'たからばこいも',   cat:'rare', star:4, farm:5, desc:'ふたを開けると、中にもう1個いもが入っている。その中にも、たぶん。'},
  kinran: {name:'きんのたまごいも', cat:'rare', star:4, farm:5, desc:'金のたまごの形。あたためてみたけど、なにも生まれなかった。'},
  kozuchi:{name:'うちでのこづちいも', cat:'rare', star:5, farm:5, desc:'ふると、なにかが出てくるらしい。出てきたのは、小さないもだった。'},
  ougon:  {name:'黄金いも',         cat:'rare', star:6, farm:5, desc:'頭のてっぺんから根っこまで、ぜんぶ金。まぶしすぎて、だれも目を合わせられない。'},
  kohaku: {name:'こはくいも',       cat:'rare', star:2, farm:6, desc:'中に、大むかしの小さな芽がとじこめられている。本人は、なにも覚えていない。'},
  turquoise:{name:'ターコイズいも', cat:'rare', star:2, farm:6, desc:'空と海のあいだの色。もようが地図みたいで、ときどき道をきかれる。'},
  ruby:   {name:'ルビーいも',       cat:'rare', star:3, farm:6, desc:'まっ赤にかがやく。てれているわけではない、とあかいもと口をそろえる。'},
  sapphire:{name:'サファイアいも',  cat:'rare', star:3, farm:6, desc:'深い青。じっと見ていると、なぜか夜ふかししたくなる。'},
  emerald:{name:'エメラルドいも',   cat:'rare', star:3, farm:6, desc:'森の色をしている。カットがきれいすぎて、鏡の前からはなれない。'},
  amethyst:{name:'アメジストいも',  cat:'rare', star:4, farm:6, desc:'頭からむらさきの結晶が生えてきた。むらさきいもとは、遠い親戚らしい。'},
  opal:   {name:'オパールいも',     cat:'rare', star:4, farm:6, desc:'見る角度で、色がくるくる変わる。どの色の自分がすきか、まだ決められない。'},
  yubiwa: {name:'ゆびわいも',       cat:'rare', star:5, farm:6, desc:'指輪の上にのっている。サイズが合う指は、まだ見つかっていない。'},
  prism:  {name:'プリズムいも',     cat:'rare', star:6, farm:6, desc:'光を通すと、にじが出る。工場の壁には、いつも小さなにじがかかっている。'},
  diamond:{name:'ダイヤモンドいも', cat:'rare', star:7, farm:6, desc:'世界でいちばんかたい芋。100年ゆでても、まだかたい。'},
  dango:  {name:'だんごいも',       cat:'rare', star:2, farm:7, desc:'3つならんで、くしにささっている。いちばん下の子だけ、なぜかいつも緑。'},
  ame:    {name:'あめいも',         cat:'rare', star:2, farm:7, desc:'キャンディみたいに包まれている。なめても、あまくはない。'},
  purin:  {name:'プリンいも',       cat:'rare', star:2, farm:7, desc:'お皿の上で、ぷるぷるふるえている。こわいのではなく、そういう性格。'},
  macaron:{name:'マカロンいも',     cat:'rare', star:3, farm:7, desc:'2まいのあいだに、クリームをはさんでいる。かじられる夢を、ときどき見る。'},
  aisu:   {name:'アイスいも',       cat:'rare', star:3, farm:7, desc:'コーンの上にのっている。とけないように、いつも少しだけ急いでいる。'},
  chocogake:{name:'チョコがけいも', cat:'rare', star:3, farm:7, desc:'頭からチョコをかぶった。カラフルなつぶつぶは、自分でつけた。'},
  hotcake:{name:'ホットケーキいも', cat:'rare', star:4, farm:7, desc:'3まい重ねて、バターをのせた。いちばん下の1まいが、いちばんがんばっている。'},
  wataame:{name:'わたあめいも',     cat:'rare', star:4, farm:7, desc:'ふわふわの雲みたい。風がふくと、ちょっとだけ小さくなる。'},
  parfait:{name:'パフェいも',       cat:'rare', star:5, farm:7, desc:'グラスのいちばん上が、自分の席。スプーンが近づくと、すこし身がまえる。'},
  oiwai:  {name:'おいわいケーキいも', cat:'rare', star:6, farm:7, desc:'ろうそくが3本。だれのおいわいかは知らないけど、とにかくめでたい。'},
  neko:   {name:'ねこいも',         cat:'rare', star:2, farm:8, desc:'ねこ耳がはえた。ベルトの上でまるくなると、ほぼふつうのいも。'},
  inu:    {name:'いぬいも',         cat:'rare', star:2, farm:8, desc:'たれ耳。名前をよぶと、ベルトの上でしっぽをふる。しっぽはない。'},
  hiyoko: {name:'ひよこいも',       cat:'rare', star:2, farm:8, desc:'ぴよぴよ鳴く。いつかニワトリになれると信じている。'},
  usagi:  {name:'うさぎいも',       cat:'rare', star:3, farm:8, desc:'長い耳で、遠くの芋の声まで聞こえる。だいたいは寝言。'},
  kuma:   {name:'くまいも',         cat:'rare', star:3, farm:8, desc:'冬になると、箱の中で冬眠しようとする。出荷の日だけは起きてほしい。'},
  kaeru:  {name:'かえるいも',       cat:'rare', star:3, farm:8, desc:'雨の日だけ、ちょっと元気。ベルトの上で、たまにジャンプする。'},
  panda:  {name:'パンダいも',       cat:'rare', star:4, farm:8, desc:'白と黒のいも。目のまわりのもようは生まれつきで、寝不足ではない。'},
  penguin:{name:'ペンギンいも',     cat:'rare', star:4, farm:8, desc:'ベルトの上を、よちよち歩く。歩かなくても運ばれることは、まだ知らない。'},
  kitsune:{name:'きつねいも',       cat:'rare', star:5, farm:8, desc:'ふさふさのしっぽ。そばに青い火がうかんでいるが、ぜんぜん熱くない。'},
  lion:   {name:'ライオンいも',     cat:'rare', star:6, farm:8, desc:'どうぶつの畑の王さま。たてがみの手入れに、毎朝1時間かかる。'},
  kasei:  {name:'かせいいも',       cat:'rare', star:2, farm:9, desc:'赤い星からやってきた。地球の土は、ちょっとやわらかいらしい。'},
  inseki: {name:'いんせきいも',     cat:'rare', star:2, farm:9, desc:'空から落ちてきた。まだ少しあたたかい。'},
  dosei:  {name:'どせいいも',       cat:'rare', star:3, farm:9, desc:'わっかがじまん。ベルトのはしっこに、ときどき引っかかる。'},
  suisei: {name:'すいせいいも',     cat:'rare', star:3, farm:9, desc:'長いしっぽをひいて飛んできた。つぎに来るのは、だいたい76年後。'},
  uchujin:{name:'うちゅうじんいも', cat:'rare', star:3, farm:9, desc:'アンテナで、ふるさとの星と話している。話の中身は、ほぼ晩ごはんのこと。'},
  ufo:    {name:'ユーフォーいも',   cat:'rare', star:4, farm:9, desc:'円ばんにのってやってきた。芋をさらいに来たのに、自分が芋だった。'},
  eisei:  {name:'えいせいいも',     cat:'rare', star:4, farm:9, desc:'宇宙から地球を見守っている。いちばんよく見ているのは、いも畑。'},
  taiyou: {name:'たいよういも',     cat:'rare', star:5, farm:9, desc:'まぶしすぎて、自分でサングラスをかけた。近くにいると、ぽかぽかする。'},
  ginga:  {name:'ぎんがいも',       cat:'rare', star:5, farm:9, desc:'おなかの中で、星がうずをまいている。数えようとした人は、みんな寝てしまった。'},
  blackhole:{name:'ブラックホールいも', cat:'rare', star:6, farm:9, desc:'なんでも吸いこむ。さっき工場のおやつが1つ消えたのも、たぶんこの芋。'},
  zenmai: {name:'ぜんまいいも',     cat:'rare', star:2, farm:10, desc:'背中のねじを巻くと、ちょっとだけ歩く。巻きすぎると、走る。'},
  denchi: {name:'でんちいも',       cat:'rare', star:2, farm:10, desc:'いつでも充電まんたん。なにを動かせばいいのかは、だれも知らない。'},
  haguruma:{name:'はぐるまいも',    cat:'rare', star:3, farm:10, desc:'ギザギザの歯で、となりの芋とかみ合いたい。まだ相手が見つからない。'},
  jishaku:{name:'じしゃくいも',     cat:'rare', star:3, farm:10, desc:'なんでもくっつけてしまう。今日もクリップを3こ、どこかでつけてきた。'},
  denkyu: {name:'でんきゅういも',   cat:'rare', star:3, farm:10, desc:'いいことを思いつくと、ぱっと光る。思いついた中身は、すぐわすれる。'},
  robot:  {name:'ロボいも',         cat:'rare', star:4, farm:10, desc:'中に芋が入っている……のではなく、ぜんぶ芋でできている。ネジまで芋。'},
  kikansha:{name:'きかんしゃいも',  cat:'rare', star:4, farm:10, desc:'シュッシュッと言いながら進む。ベルトが動いているので、本当は進まなくてもいい。'},
  rocket: {name:'ロケットいも',     cat:'rare', star:5, farm:10, desc:'いつか月まで行くつもり。いまはベルトの上で、エンジンをあたためている。'},
  orgel:  {name:'オルゴールいも',   cat:'rare', star:5, farm:10, desc:'ねじを巻くと、くるくる回って音楽が流れる。曲名は「いものうた」。'},
  tokitome:{name:'ときとめいも',    cat:'rare', star:6, farm:10, desc:'この芋を見ているあいだ、時間がほんの少しだけ止まる。らしい。'},
  yousei: {name:'ようせいいも',     cat:'rare', star:3, farm:11, desc:'羽がはえた小さな芋。ベルトの上に、ときどき花びらを落としていく。'},
  oni:    {name:'おにいも',         cat:'rare', star:3, farm:11, desc:'つのが2本。こわい顔の練習をしているけど、まだ一度も成功していない。'},
  seirei: {name:'せいれいいも',     cat:'rare', star:4, farm:11, desc:'ふわふわ光る、たましいの芋。さわろうとすると、指のあいだからすりぬける。'},
  unicorn:{name:'ユニコーンいも',   cat:'rare', star:4, farm:11, desc:'金のつのと、にじ色のたてがみ。めったに人前に出てこない、はずだった。'},
  seiken: {name:'せいけんいも',     cat:'rare', star:5, farm:11, desc:'頭に伝説の剣がささっている。ぬける人は、まだあらわれない。'},
  mahou:  {name:'まほうつかいいも', cat:'rare', star:5, farm:11, desc:'呪文をとなえると、芋が1こふえる。たまに2こへる。'},
  dragon: {name:'ドラゴンいも',     cat:'rare', star:6, farm:11, desc:'小さいけれど、ほんもののドラゴン。くしゃみをすると、近くの芋がちょっと焼ける。'},
  fushichou:{name:'ふしちょういも', cat:'rare', star:6, farm:11, desc:'炎の中から何度でもよみがえる。焼きいもになっても、すぐもとにもどる。'},
  imoou:  {name:'いものおうさま',   cat:'rare', star:7, farm:11, desc:'すべてのいもの頂点。王かんが重くて、ちょっと首がこっている。'},
  densetsu:{name:'でんせつのいも',  cat:'rare', star:7, farm:11, desc:'金とダイヤでできた、伝説の芋。見た人はまだいない。いま見ているあなたをのぞけば。'},
};
const ORDER = Object.keys(KINDS);
const FARMS = ['はじまりの畑','やまの畑','ふしぎな畑','うみべの畑','星ふる畑','黄金の畑','宝石の畑','おかしの畑','どうぶつの畑','宇宙の畑','からくりの畑','伝説の畑'];
const FARM_IDS = ['farm1','farm2','farm3','farm4','farm5','farm6','farm7','farm8','farm9','farm10','farm11'];
const GOOD_W = {futsu:5, maru:3, noppo:2, aka:2.5, chibi:2};
const BAD_W  = {me:3, kusari:3, ishi:1.5, tsuchi:2.5};
const RARE_W = {heart:10, futago:10, niko:10, kin:1.5, nemuri:10, shikaku:3.5, deka:3.5, hoshi:3.5, donut:3.5, niji:.8,
  yaki:10, mitsugo:10, hige:3.5, murasaki:10, yuki:3.5, kinoko:10, onigiri:3.5, tsuki:3.5, obake:3.5, kagami:10, ouji:1.2,
  umi:10, kai:3.5, shizuku:10, tako:3.5, shinju:1.2, hoshizora:3.5, sakura:3.5, tenshi:1.2, maboroshi:.25,
  mugi:10, kinpaku:10, koban:10, kinkai:3.5, nobebou:3.5, medal:3.5, takara:1.2, kinran:1.2, kozuchi:.25, ougon:.12,
  kohaku:10, turquoise:10, ruby:3.5, sapphire:3.5, emerald:3.5, amethyst:1.2, opal:1.2, yubiwa:.25, prism:.12, diamond:.04,
  dango:10, ame:10, purin:10, macaron:3.5, aisu:3.5, chocogake:3.5, hotcake:1.2, wataame:1.2, parfait:.25, oiwai:.12,
  neko:10, inu:10, hiyoko:10, usagi:3.5, kuma:3.5, kaeru:3.5, panda:1.2, penguin:1.2, kitsune:.25, lion:.12,
  kasei:10, inseki:10, dosei:3.5, suisei:3.5, uchujin:3.5, ufo:1.2, eisei:1.2, taiyou:.25, ginga:.25, blackhole:.12,
  zenmai:10, denchi:10, haguruma:3.5, jishaku:3.5, denkyu:3.5, robot:1.2, kikansha:1.2, rocket:.25, orgel:.25, tokitome:.12,
  yousei:3.5, oni:3.5, seirei:1.2, unicorn:1.2, seiken:.25, mahou:.25, dragon:.12, fushichou:.12, imoou:.04, densetsu:.04};
const BAD_RATE = .24;
const RARE_SEC = {2:10, 3:30, 4:60, 5:180, 6:900, 7:3600}, RARE_MIN = {2:20, 3:60, 4:200, 5:1000, 6:1e6, 7:1e8};
const GROW = 1.17, AWAY_RATE = .1, AWAY_MAX = 8*3600;

/* ---------- 施設・改良（仮の数字） ---------- */
const BLD = [
  {id:'part',  name:'パートさん',            cost:15,     cps:.08,     unit:'人', tag:'自動ではじく', desc:'ベルトの横で、わる芋をポイッとしてくれる。おやつはじゃがバター。'},
  {id:'air',   name:'エアはじき機',          cost:100,    cps:.8,      unit:'台', tag:'自動ではじく', desc:'わる芋に、シュッと風を当ててはじく。ときどき帽子もとばす。'},
  {id:'hatake',name:'いも畑',                cost:1100,   cps:6,      unit:'面', tag:'芋がふえる',   desc:'芋がたくさんとれる。ベルトに流れてくる芋もふえる。'},
  {id:'robo',  name:'選別ロボ',              cost:12000,  cps:35,     unit:'台', tag:'自動ではじく', desc:'芋を見分けるロボット。たまに芋に話しかけている。'},
  {id:'line2', name:'2号ライン',             cost:1.3e5,  cps:200,    unit:'本', tag:'',             desc:'となりにもう1本ベルトを引いた。見えないけど、ちゃんと動いてる。'},
  {id:'chips', name:'ポテチ工場',            cost:1.4e6,  cps:1050,   unit:'棟', tag:'',             desc:'はじいた芋も、うすく切って揚げればおいしい。'},
  {id:'truck', name:'いもトラック便',        cost:2e7,    cps:5900,   unit:'台', tag:'',             desc:'全国へ芋をとどける。荷台は芋でぎゅうぎゅう。'},
  {id:'lab',   name:'いも研究所',            cost:3.3e8,  cps:33000,  unit:'棟', tag:'レアが出やすい', desc:'芋の声を聞く研究をしている。レア芋が少し出やすくなる。'},
  {id:'sky',   name:'天空いも農園',          cost:5.1e9,  cps:1.95e5,  unit:'面', tag:'',             desc:'雲の上の畑。ちょうどいいお天気が、ずっとつづく。'},
  {id:'space', name:'宇宙いもステーション',  cost:7.5e10, cps:1.2e6,  unit:'基', tag:'',             desc:'無重力で育てると、芋がまんまるになるらしい。'},
  {id:'shrine',name:'いもの神社',            cost:1e12,   cps:7.5e6,    unit:'社', tag:'',             desc:'芋の神さまをまつった。おさいせんは、だいたい芋。'},
  {id:'time',  name:'タイムマシン農場',      cost:1.4e13, cps:4.9e7,  unit:'台', tag:'',             desc:'あしたの芋を、きょう収穫する。たまにきのうの芋もまざる。'},
  {id:'planet',name:'いもの惑星',            cost:1.7e14, cps:3.2e8,  unit:'個', tag:'',             desc:'まるごと芋でできた星。住んでいるのも、だいたい芋。'},
  {id:'gate',  name:'いも次元ゲート',        cost:2.1e15, cps:2.2e9,  unit:'門', tag:'',             desc:'となりの宇宙の芋畑につながっている。むこうの芋もこっちを見ている。'},
  {id:'bang',  name:'いもビッグバン',        cost:2.6e16, cps:1.6e10, unit:'回', tag:'',             desc:'宇宙のはじまりにも、芋があった。たぶん。'},
  {id:'fractal',name:'いもフラクタル',       cost:3.1e17, cps:1.1e11, unit:'個', tag:'',             desc:'芋の中に芋があって、その中にもまた芋がある。どこまでも芋。'},
  {id:'formula',name:'いもの方程式',         cost:7.1e19, cps:8.3e11, unit:'本', tag:'',             desc:'解くと芋が出てくる。答えは、いつも芋。'},
  {id:'multi', name:'いも多元宇宙',          cost:1.2e22, cps:6.2e12, unit:'個', tag:'',             desc:'ちがう宇宙の工場とつながった。どの宇宙でも、みんな芋を選んでいる。'},
  {id:'dream', name:'いもの夢',              cost:1.9e24, cps:4.8e13, unit:'夜', tag:'',             desc:'芋が見ている夢の中で、芋を育てる。起こさないように、そっと。'},
  {id:'imo',   name:'いもそのもの',          cost:5.4e26, cps:3.2e14, unit:'個', tag:'',             desc:'工場が芋なのか、芋が工場なのか。もう、だれにもわからない。'},
];
const BI = Object.fromEntries(BLD.map(b => [b.id, b]));
const TIERS = {
  part:['おそろいのエプロン','まかないカレー','ベテランの勘','パートリーダー'],
  air:['強力コンプレッサー','ノズル二連','芋センサー','台風モード'],
  hatake:['ふかふかの土','品種かいりょう','畑の神さまのおまもり','ミミズ大使'],
  robo:['ピカピカ点検','芋見分けAI','ロボ用ネクタイ','ロボの見る夢'],
  line2:['ベルトの油さし','3交代シフト','夜のライトアップ','ベルト100メートル'],
  chips:['うす切りスライサー','のり塩フレーバー','新商品会議','ポテチの日'],
  truck:['カーナビ','冷蔵トラック','夜行便','空飛ぶトラック'],
  lab:['芋の声マイク','すごい顕微鏡','いも学会','ノーベルいも賞'],
  sky:['雲の水やり','天空ジョウロ','虹のビニールハウス','お天気スイッチ'],
  space:['宇宙エレベーター','月面倉庫','銀河いも便','ワープ畑'],
  shrine:['おさいせん箱','ご神木','いも祭りの太鼓','八百万のいも'],
  time:['未来のカレンダー','タイムパラドックス保険','きのうの芋','あしたの芋'],
  planet:['芋の衛星','空気をつくる','いも惑星の自転','いも星系'],
  gate:['ゲートの鍵','となりの宇宙','次元の芋畑','無限ゲート'],
  bang:['はじまりの芋','宇宙の芋の種','ふくらむ宇宙','いもでできた宇宙'],
  fractal:['芋の中の芋','どこまでも芋','無限ズーム','芋のもよう'],
  formula:['芋の定理','芋の証明','芋の公式','いちばん美しい芋の式'],
  multi:['となりの工場','100の宇宙','宇宙のあいさつ','多元いも会議'],
  dream:['いい夢まくら','夢日記','夢のつづき','正夢'],
  imo:['芋のこころ','芋のことば','芋のたましい','芋のすべて'],
};
const TIER_PRE = ['金の', 'ダイヤの', '銀河の', '伝説の', '神話の', '夢の', '無限の', '究極の'];
const TIER_NEED = [1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450], TIER_COST = [10, 50, 500, 5000, 5e5, 5e7, 5e9, 5e11, 5e13, 5e15, 5e17, 5e19];
const STN = [
  {b:'part', side:-1, base:7.0, reach:10, speak:'ポイッ', cap:8, sp:12},
  {b:'air',  side: 1, base:4.5, reach:10, speak:'シュッ', cap:5, sp:14},
  {b:'robo', side:-1, base:2.4, reach:11, speak:'ガシッ', cap:3, sp:16},
];
const STN_OF = Object.fromEntries(STN.map(s => [s.b, s]));
const UPG = [];
for (const b of BLD) TIER_NEED.forEach((need, i) => UPG.push({id:b.id + (i+1), name:i < 4 ? TIERS[b.id][i] : TIER_PRE[i-4] + b.name, icon:b.id, tier:i+1, cost:b.cost*TIER_COST[i],
  desc:`${b.name}の生産が2倍${STN_OF[b.id] ? '。はじくのも速くなる' : b.id === 'hatake' ? '' : ''}`, unlock:() => S.bld[b.id] >= need}));
UPG.push(
  {id:'box1',  name:'ていねい箱づめ',   icon:'box',    tier:1, cost:60,  desc:'出荷でもらえるお金が2倍',               unlock:() => S.stats.shipped >= 20},
  {id:'tap1',  name:'軍手',             icon:'glove',  tier:1, cost:100, desc:'ポイッでもらえるお金が2倍',             unlock:() => S.stats.flicked >= 10},
  {id:'rare1', name:'虫めがね',         icon:'lens',   tier:1, cost:400, desc:'レア芋が1.5倍出やすい',                 unlock:() => S.stats.rares >= 1},
  {id:'farm1', name:'やまの畑と契約',   icon:'map',    tier:1, cost:2000, desc:'やまの畑の芋が流れてくる（10しゅるい）', unlock:() => S.bld.hatake >= 1},
  {id:'tap2',  name:'すべり止め軍手',   icon:'glove',  tier:2, cost:2000, desc:'ポイッでもらえるお金がさらに2倍',       unlock:() => S.stats.flicked >= 40},
  {id:'box2',  name:'化粧箱',           icon:'box',    tier:2, cost:3000, desc:'出荷でもらえるお金がさらに2倍',        unlock:() => S.stats.shipped >= 150},
  {id:'rare2', name:'ルーペ',           icon:'lens',   tier:2, cost:4e4, desc:'レア芋がさらに1.5倍出やすい',           unlock:() => S.stats.rares >= 5},
  {id:'tap3',  name:'ポイッの極意',     icon:'gglove', tier:1, cost:5e4, desc:'ポイッするたび、毎秒の1%分ももらえる',   unlock:() => S.stats.flicked >= 100},
  {id:'box3',  name:'ブランド箱',       icon:'box',    tier:3, cost:3e5, desc:'出荷でもらえるお金が3倍',               unlock:() => S.stats.shipped >= 800},
  {id:'farm2', name:'ふしぎな畑と契約', icon:'map',    tier:2, cost:5e5, desc:'ふしぎな畑の芋が流れてくる（7しゅるい）', unlock:() => S.upg.farm1 && S.stats.earnedRun >= 1e5},
  {id:'rare3', name:'レア芋の鑑定書',   icon:'scroll', tier:1, cost:4e7, desc:'レア芋のボーナスが2倍',                 unlock:() => S.stats.rares >= 15},
  {id:'tap4',  name:'達人の手首',       icon:'gglove', tier:2, cost:5e6, desc:'ポイッで、毎秒の2%分もさらにもらえる',   unlock:() => S.stats.flicked >= 250},
  {id:'fever1',name:'お祭りはっぴ',     icon:'star',   tier:1, cost:1e7, desc:'フィーバーが10秒のびる',                unlock:() => S.stats.fevers >= 1},
  {id:'tap5',  name:'神の手',           icon:'gglove', tier:3, cost:5e8, desc:'ポイッで、毎秒の4%分もさらにもらえる',   unlock:() => S.stats.flicked >= 600},
  {id:'zk1',   name:'いも図鑑・上巻',     icon:'book',   tier:1, cost:1e9,  desc:'図鑑ボーナスが1しゅるい +3% になる',     unlock:() => foundCount() >= 20},
  {id:'rare4', name:'四つ葉のクローバー', icon:'clover', tier:3, cost:2e9,  desc:'レア芋がさらに1.5倍出やすい',           unlock:() => S.stats.rares >= 40},
  {id:'farm3', name:'うみべの畑と契約',   icon:'map',    tier:3, cost:2e9,  desc:'うみべの畑の芋が流れてくる（5しゅるい）', unlock:() => S.upg.farm2 && S.stats.earnedRun >= 5e8},
  {id:'box4',  name:'いも専用コンテナ',   icon:'box',    tier:4, cost:5e9,  desc:'出荷でもらえるお金がさらに3倍',         unlock:() => S.stats.shipped >= 4000},
  {id:'fever2',name:'お祭り太鼓',         icon:'star',   tier:2, cost:1e10, desc:'フィーバーが7倍になる',                 unlock:() => S.stats.fevers >= 5},
  {id:'rare5', name:'レア芋の写真集',     icon:'scroll', tier:2, cost:2e11, desc:'レア芋のボーナスがさらに2倍',           unlock:() => S.stats.rares >= 100},
  {id:'farm4', name:'星ふる畑と契約',     icon:'map',    tier:4, cost:5e11, desc:'星ふる畑の芋が流れてくる（4しゅるい）',   unlock:() => S.upg.farm3 && S.perk.hoshi},
  {id:'tap6',  name:'ポイッの伝説',       icon:'gglove', tier:4, cost:5e11, desc:'ポイッで、毎秒の8%分もさらにもらえる',   unlock:() => S.stats.flicked >= 1500},
  {id:'boss',  name:'工場長の帽子',       icon:'trophy', tier:1, cost:1e12, desc:'実績ボーナスが1つ +2% になる',           unlock:() => achCount() >= 30},
  {id:'zk2',   name:'いも図鑑・下巻',     icon:'book',   tier:2, cost:1e13, desc:'図鑑ボーナスが1しゅるい +4% になる',     unlock:() => foundCount() >= 30},
);
const FARM_DEALS = [[5, 1e15, 'ougon'], [6, 1e18, 'houseki'], [7, 1e21, 'okashi'], [8, 1e25, 'doubutsu'], [9, 1e30, 'uchu'], [10, 1e36, 'karakuri'], [11, 1e43, 'densetsu']];
for (const [f, cost, pk] of FARM_DEALS) UPG.push({id:'farm' + f, name:`${FARMS[f]}と契約`, icon:'map', tier:Math.min(6, f - 2), cost, desc:`${FARMS[f]}の芋が流れてくる（10しゅるい）`, unlock:() => S.upg['farm' + (f - 1)] && S.perk[pk]});
const CATS = [['neko1','みならいねこ',15,9e6,.1], ['neko2','しごとねこ',35,9e9,.125], ['neko3','ベテランねこ',60,9e12,.15], ['neko4','ねこ係長',90,9e16,.175], ['neko5','ねこ部長',130,9e21,.2], ['neko6','ねこ社長',170,9e27,.2], ['neko7','ねこ会長',210,9e34,.2]];
CATS.forEach(([id, name, need, cost, f], i) => UPG.push({id, name, icon:'cat', tier:Math.min(6, i + 1), cost, desc:`ねこが工場を手伝う。実績1つにつき 生産 +${(f*4).toFixed(1)}%（かけ算）`, unlock:() => achCount() >= need}));
const UI = Object.fromEntries(UPG.map(u => [u.id, u]));

const GOALS = [
  {t:'芋を10こ出荷する',            n:10,  v:() => S.stats.shipped, r:10},
  {t:'わる芋を5こポイッする',        n:5,   v:() => S.stats.flicked, r:10},
  {t:'パートさんを1人やとう',        n:1,   v:() => S.bld.part, r:15},
  {t:'レア芋を1つ見つける',          n:1,   v:() => S.stats.rares, r:20},
  {t:'改良を1つ買う',                n:1,   v:() => S.stats.upgs, r:30},
  {t:'エアはじき機を置く',           n:1,   v:() => S.bld.air, r:50},
  {t:'パートさんを5人にする',        n:5,   v:() => S.bld.part, r:60},
  {t:'毎秒 10円 をこえる',           n:10,  v:() => Math.floor(D.rate), r:80},
  {t:'図鑑を8しゅるいうめる',        n:8,   v:() => foundCount(), r:100},
  {t:'いも畑を1つ作る',              n:1,   v:() => S.bld.hatake, r:150},
  {t:'やまの畑と契約する',           n:1,   v:() => S.upg.farm1 ? 1 : 0, r:300},
  {t:'選別ロボを置く',               n:1,   v:() => S.bld.robo, r:1000},
  {t:'毎秒 500円 をこえる',          n:500, v:() => Math.floor(D.rate), r:3000},
  {t:'図鑑を14しゅるいうめる',       n:14,  v:() => foundCount(), r:8000},
  {t:'2号ラインを引く',              n:1,   v:() => S.bld.line2, r:2e4},
  {t:'ふしぎな畑と契約する',         n:1,   v:() => S.upg.farm2 ? 1 : 0, r:5e4},
  {t:'ポテチ工場を建てる',           n:1,   v:() => S.bld.chips, r:3e5},
  {t:'図鑑を19しゅるいうめる',       n:19,  v:() => foundCount(), r:8e5},
  {t:'毎秒 1万円 をこえる',          n:1e4, v:() => Math.floor(D.rate), r:1.5e6},
  {t:'いもトラック便を走らせる',     n:1,   v:() => S.bld.truck, r:4e6},
  {t:'いも研究所を建てる',           n:1,   v:() => S.bld.lab, r:6e7},
  {t:'うみべの畑と契約する',         n:1,   v:() => S.upg.farm3 ? 1 : 0, r:3e8},
  {t:'天空いも農園をひらく',         n:1,   v:() => S.bld.sky, r:1e9},
  {t:'宇宙いもステーションを打ち上げる', n:1, v:() => S.bld.space, r:1.5e10},
  {t:'工場をたたんで、転生する',     n:1,   v:() => S.prestiges, r:100},
  {t:'種の改良を1つ買う',            n:1,   v:() => Object.keys(S.perk).length, r:500},
  {t:'星ふる畑と契約する',           n:1,   v:() => S.upg.farm4 ? 1 : 0, r:1e11},
  {t:'いもの神社を建てる',           n:1,   v:() => S.bld.shrine, r:2e11},
  {t:'タイムマシン農場を動かす',     n:1,   v:() => S.bld.time, r:2.5e12},
  {t:'いもの惑星をつくる',           n:1,   v:() => S.bld.planet, r:3e13},
  {t:'いも次元ゲートをひらく',       n:1,   v:() => S.bld.gate, r:4e14},
  {t:'いもビッグバンをおこす',       n:1,   v:() => S.bld.bang, r:5e15},
  {t:'黄金の畑と契約する',           n:1,   v:() => S.upg.farm5 ? 1 : 0, r:5e14},
  {t:'いもフラクタルを組み立てる',   n:1,   v:() => S.bld.fractal, r:6e16},
  {t:'宝石の畑と契約する',           n:1,   v:() => S.upg.farm6 ? 1 : 0, r:5e17},
  {t:'いもの方程式を解く',           n:1,   v:() => S.bld.formula, r:1.5e19},
  {t:'おかしの畑と契約する',         n:1,   v:() => S.upg.farm7 ? 1 : 0, r:5e20},
  {t:'いも多元宇宙につなぐ',         n:1,   v:() => S.bld.multi, r:2.5e21},
  {t:'いもの夢を見る',               n:1,   v:() => S.bld.dream, r:4e23},
  {t:'どうぶつの畑と契約する',       n:1,   v:() => S.upg.farm8 ? 1 : 0, r:5e24},
  {t:'いもそのものになる',           n:1,   v:() => S.bld.imo, r:1e26},
  {t:'宇宙の畑と契約する',           n:1,   v:() => S.upg.farm9 ? 1 : 0, r:5e29},
  {t:'からくりの畑と契約する',       n:1,   v:() => S.upg.farm10 ? 1 : 0, r:5e35},
  {t:'伝説の畑と契約する',           n:1,   v:() => S.upg.farm11 ? 1 : 0, r:5e42},
  {t:'図鑑をぜんぶうめる',           n:ORDER.length, v:() => foundCount(), r:1e45},
  {t:'かせいだ合計 1無量大数円',     n:1e68, v:() => S.stats.earned, r:1e66},
];

/* ---------- 転生（いもの種）・種の改良 ---------- */
const PRES_MIN = 1e12;
const presGain = () => Math.floor(Math.cbrt(S.stats.earnedRun/(PRES_MIN/1000))*(S.perk.hatsuga ? 1.2 : 1)*(S.perk.hatsuga2 ? 1.5 : 1));
const canPres = () => S.stats.earnedRun >= PRES_MIN;
const seedsAv = () => Math.max(0, S.seeds - S.seedsUsed);
const seedMulOf = n => 1 + .3*Math.sqrt(n);
const fmtX = x => x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : fmt(x);
const KISEKI0 = 1e8, KISEKI_R = 4;
const kisekiCost = () => KISEKI0*Math.pow(KISEKI_R, S.kiseki);
const PERKS = [
  {id:'tanemaki',name:'はじめの手みやげ', icon:'part',   cost:3,   desc:'転生のあと、パートさんが10人いる'},
  {id:'shikin',  name:'開業資金',         icon:'coin',   cost:5,   desc:'転生のあと、1万円から始まる'},
  {id:'gunte',   name:'ポイッの記憶',     icon:'glove',  cost:6,   desc:'軍手2つと箱づめ2つを持って始まる'},
  {id:'kioku1',  name:'契約の記憶',       icon:'map',    cost:8,   desc:'やま・ふしぎな畑の契約を持って始まる'},
  {id:'jouro',   name:'金のじょうろ',     icon:'clover', cost:10,  desc:'レア芋が1.25倍出やすい'},
  {id:'rusuban', name:'留守番ロボ',       icon:'robo',   cost:10,  desc:'留守ボーナスが毎秒の2.5割・最大12時間に'},
  {id:'matsuri', name:'長いお祭り',       icon:'star',   cost:12,  desc:'フィーバーが10秒のびる'},
  {id:'jidou',   name:'自動選別AI',       icon:'air',    cost:15,  desc:'自動ではじく施設が1.5倍速くなる'},
  {id:'kago1',   name:'いもの加護',       icon:'seed',   cost:20,  desc:'生産が1.25倍'},
  {id:'hoshi',   name:'星のたね',         icon:'sky',    cost:25,  desc:'星ふる畑と契約できるようになる'},
  {id:'hatsuga', name:'種の発芽',         icon:'hatake', cost:30,  desc:'転生でもらえる種が1.2倍'},
  {id:'kioku2',  name:'改良の記憶',       icon:'scroll', cost:40,  desc:'施設の1段目の改良を持って始まる'},
  {id:'kago2',   name:'いもの大加護',     icon:'seed',   cost:60,  desc:'生産が1.5倍'},
  {id:'kago3',   name:'いもの神加護',     icon:'shrine', cost:200, desc:'生産が2倍'},
  {id:'manako',  name:'黄金のまなざし',   icon:'lens',   cost:300,   desc:'レア芋がさらに1.5倍出やすい'},
  {id:'ougon',   name:'黄金の地図',       icon:'map',    cost:1e3,   desc:'黄金の畑と契約できるようになる'},
  {id:'kioku3',  name:'契約の記憶・上',   icon:'map',    cost:3000,  desc:'うみべ・星ふる畑の契約も持って始まる'},
  {id:'houseki', name:'宝石の地図',       icon:'map',    cost:1e4,  desc:'宝石の畑と契約できるようになる'},
  {id:'toki',    name:'時のたね',         icon:'time',   cost:1e4,  desc:'留守ボーナスが毎秒の5割・最大24時間に'},
  {id:'okashi',  name:'おかしの地図',     icon:'map',    cost:1e5, desc:'おかしの畑と契約できるようになる'},
  {id:'nekote',  name:'ねこの手',         icon:'cat',    cost:1e5,   desc:'ねこのボーナスが1.5倍'},
  {id:'matsuri2',name:'永遠のお祭り',     icon:'star',   cost:3e5,   desc:'フィーバーがさらに20秒のびる'},
  {id:'doubutsu',name:'どうぶつの地図',   icon:'map',    cost:1e6,   desc:'どうぶつの畑と契約できるようになる'},
  {id:'kago4',   name:'いもの宇宙加護',   icon:'planet', cost:1e6, desc:'生産が3倍'},
  {id:'uchu',    name:'宇宙の地図',       icon:'map',    cost:1e7,   desc:'宇宙の畑と契約できるようになる'},
  {id:'hatsuga2',name:'種の大発芽',       icon:'hatake', cost:3e7,   desc:'転生でもらえる種がさらに1.5倍'},
  {id:'karakuri',name:'からくりの地図',   icon:'map',    cost:1e9,   desc:'からくりの畑と契約できるようになる'},
  {id:'kago5',   name:'無限のいも',       icon:'gate',   cost:1e9,   desc:'生産が5倍'},
  {id:'densetsu',name:'伝説の地図',       icon:'map',    cost:1e11,   desc:'伝説の畑と契約できるようになる'},
  {id:'kago6',   name:'いもの神話',       icon:'bang',   cost:1e11,   desc:'生産が10倍'},
  {id:'kago7',   name:'いもの真理',       icon:'imo',    cost:1e14,  desc:'生産が20倍'},
];
const PI_ = Object.fromEntries(PERKS.map(x => [x.id, x]));
function applyPerk(id, start){
  if (id === 'tanemaki') S.bld.part = Math.max(S.bld.part, 10);
  if (id === 'shikin' && start) S.coins += 1e4;
  if (id === 'gunte') for (const u of ['tap1', 'tap2', 'box1', 'box2']) S.upg[u] = true;
  if (id === 'kioku1') S.upg.farm1 = S.upg.farm2 = true;
  if (id === 'kioku2') for (const b of BLD) S.upg[b.id + '1'] = true;
  if (id === 'kioku3') S.upg.farm1 = S.upg.farm2 = S.upg.farm3 = S.upg.farm4 = true;
}

/* ---------- 実績（1つにつき生産 +1%） ---------- */
const fmtH = s => s >= 3600 ? Math.floor(s/360)/10 + '時間' : Math.floor(s/60) + '分';
const catFound = c => ORDER.filter(k => KINDS[k].cat === c && S.found[k] > 0).length;
const catAll = c => ORDER.filter(k => KINDS[k].cat === c).length;
const bldTotal = () => Object.values(S.bld).reduce((a, b) => a + b, 0);
const ACH = [
  {id:'ship1', name:'ベルトになれた',     d:'芋を100こ出荷する',            v:() => S.stats.shipped, n:100},
  {id:'ship2', name:'出荷のプロ',         d:'芋を1,000こ出荷する',          v:() => S.stats.shipped, n:1000},
  {id:'ship3', name:'いも街道',           d:'芋を1万こ出荷する',            v:() => S.stats.shipped, n:1e4},
  {id:'ship4', name:'全国にとどけ',       d:'芋を10万こ出荷する',           v:() => S.stats.shipped, n:1e5},
  {id:'flick1',name:'ポイッの見習い',     d:'わる芋を50こポイッする',       v:() => S.stats.flicked, n:50},
  {id:'flick2',name:'ポイッの達人',       d:'わる芋を500こポイッする',      v:() => S.stats.flicked, n:500},
  {id:'flick3',name:'ポイッの神さま',     d:'わる芋を3,000こポイッする',    v:() => S.stats.flicked, n:3000},
  {id:'auto1', name:'たよれる仲間',       d:'施設がわる芋を100こはじく',    v:() => S.stats.auto, n:100},
  {id:'auto2', name:'自動化の夜明け',     d:'施設がわる芋を1万こはじく',    v:() => S.stats.auto, n:1e4},
  {id:'auto3', name:'完全自動工場',       d:'施設がわる芋を10万こはじく',   v:() => S.stats.auto, n:1e5},
  {id:'rare1', name:'キラキラ好き',       d:'レア芋を10こつかまえる',       v:() => S.stats.rares, n:10},
  {id:'rare2', name:'レア芋ハンター',     d:'レア芋を100こつかまえる',      v:() => S.stats.rares, n:100},
  {id:'rare3', name:'芋の目きき',         d:'レア芋を500こつかまえる',      v:() => S.stats.rares, n:500},
  {id:'kin',   name:'きんきらきん',       d:'きんいもを3回つかまえる',      v:() => S.found.kin || 0, n:3},
  {id:'niji',  name:'にじの向こう',       d:'にじいもを3回つかまえる',      v:() => S.found.niji || 0, n:3},
  {id:'nemuri',name:'おやすみ係',         d:'ねむりいもを10回つかまえる',   v:() => S.found.nemuri || 0, n:10},
  {id:'fev1',  name:'はじめてのお祭り',   d:'フィーバーを1回',              v:() => S.stats.fevers, n:1},
  {id:'fev2',  name:'お祭りさわぎ',       d:'フィーバーを10回',             v:() => S.stats.fevers, n:10},
  {id:'fev3',  name:'まいにちお祭り',     d:'フィーバーを50回',             v:() => S.stats.fevers, n:50},
  {id:'zkg',   name:'ふつうがいちばん',   d:'ふつう芋をぜんぶ図鑑に',       v:() => catFound('good'), n:catAll('good')},
  {id:'zkb',   name:'わるもの名鑑',       d:'わる芋をぜんぶ図鑑に',         v:() => catFound('bad'), n:catAll('bad')},
  {id:'zkr',   name:'キラキラ大集合',     d:'レア芋をぜんぶ図鑑に',         v:() => catFound('rare'), n:catAll('rare')},
  {id:'earn1', name:'はじめての1万円',    d:'かせいだ合計 1万円',           v:() => S.stats.earned, n:1e4},
  {id:'earn2', name:'いも長者',           d:'かせいだ合計 100万円',         v:() => S.stats.earned, n:1e6},
  {id:'earn3', name:'いも財閥',           d:'かせいだ合計 1億円',           v:() => S.stats.earned, n:1e8},
  {id:'earn4', name:'いも帝国',           d:'かせいだ合計 1兆円',           v:() => S.stats.earned, n:1e12},
  {id:'earn5', name:'銀河いもバンク',     d:'かせいだ合計 100兆円',         v:() => S.stats.earned, n:1e14},
  {id:'rate1', name:'チャリンチャリン',   d:'毎秒 100円 をこえる',          v:() => Math.floor(D.rate), n:100},
  {id:'rate2', name:'お金の川',           d:'毎秒 1万円 をこえる',          v:() => Math.floor(D.rate), n:1e4},
  {id:'rate3', name:'お金の滝',           d:'毎秒 100万円 をこえる',        v:() => Math.floor(D.rate), n:1e6},
  {id:'bld1',  name:'小さな工場',         d:'施設を合計10こ建てる',         v:bldTotal, n:10},
  {id:'bld2',  name:'大きな工場',         d:'施設を合計100こ建てる',        v:bldTotal, n:100},
  {id:'bld3',  name:'いもの都',           d:'施設を合計300こ建てる',        v:bldTotal, n:300},
  {id:'part50',name:'にぎやかな休けい室', d:'パートさんを50人にする',       v:() => S.bld.part, n:50},
  {id:'all10', name:'工場そろいぶみ',     d:'施設を10しゅるい建てる',       v:() => BLD.filter(b => S.bld[b.id] > 0).length, n:10},
  {id:'all15', name:'いも宇宙そろいぶみ', d:'施設を15しゅるい建てる',       v:() => BLD.filter(b => S.bld[b.id] > 0).length, n:15},
  {id:'all20', name:'すべてがそろった',   d:'施設を20しゅるいぜんぶ建てる', v:() => BLD.filter(b => S.bld[b.id] > 0).length, n:BLD.length},
  {id:'upg1',  name:'カイゼン',           d:'改良を10こ買う',               v:() => Object.keys(S.upg).length, n:10},
  {id:'upg2',  name:'カイゼンのカイゼン', d:'改良を30こ買う',               v:() => Object.keys(S.upg).length, n:30},
  {id:'upg3',  name:'改良コンプリート',   d:'改良をぜんぶ買う',             v:() => Object.keys(S.upg).length, n:UPG.length},
  {id:'play1', name:'シフトに入った',     d:'30分あそぶ',                   v:() => S.stats.play, n:1800, f:fmtH},
  {id:'play2', name:'ベテラン',           d:'3時間あそぶ',                  v:() => S.stats.play, n:3*3600, f:fmtH},
  {id:'play3', name:'工場長',             d:'10時間あそぶ',                 v:() => S.stats.play, n:10*3600, f:fmtH},
  {id:'rate4', name:'お金の宇宙',         d:'毎秒 1億円 をこえる',          v:() => Math.floor(D.rate), n:1e8},
  {id:'earn6', name:'京のいも',           d:'かせいだ合計 1京円',           v:() => S.stats.earned, n:1e16},
  {id:'mabo',  name:'まぼろしを見た',     d:'まぼろしいもをつかまえる',     v:() => S.found.maboroshi || 0, n:1},
  {id:'sfev',  name:'スーパーお祭り',     d:'スーパーフィーバーを1回',      v:() => S.stats.superFevers || 0, n:1},
  {id:'pres1', name:'あたらしい土地',     d:'転生を1回',                    v:() => S.prestiges, n:1},
  {id:'pres2', name:'旅するいも工場',     d:'転生を5回',                    v:() => S.prestiges, n:5},
  {id:'pres3', name:'いもはめぐる',       d:'転生を20回',                   v:() => S.prestiges, n:20},
  {id:'seed1', name:'種もち',             d:'いもの種を100こ集める',        v:() => S.seeds, n:100},
  {id:'seed2', name:'いもの種バンク',     d:'いもの種を1,000こ集める',      v:() => S.seeds, n:1000},
  {id:'perkAll',name:'種の改良コンプリート', d:'種の改良をぜんぶ買う',      v:() => Object.keys(S.perk).length, n:PERKS.length},
  {id:'away',  name:'おかえりなさい',     d:'留守ボーナスを受けとる',       v:() => S.stats.away, n:1},
  {id:'goals', name:'めあてコンプリート', d:'めあてをぜんぶ達成する',       v:() => S.goal, n:GOALS.length},
  {id:'cmp',   name:'おわびの菓子折り',   d:'クレームを10回もらう',         v:() => S.stats.complaints, n:10},
  {id:'miss',  name:'うっかりさん',       d:'いい芋を10回はじいちゃう',     v:() => S.stats.misses, n:10},
];
{
  const add = (id, name, d, v, n, f) => ACH.push({id, name, d, v, n, f});
  [[20,'垓の工場'],[24,'秭の工場'],[28,'穣の工場'],[32,'溝の工場'],[36,'澗の工場'],[40,'正の工場'],[44,'載の工場'],[48,'極の工場'],[52,'恒河沙のいも'],[56,'阿僧祇のいも'],[60,'那由他のいも'],[64,'不可思議のいも'],[68,'無量大数のいも']]
    .forEach(([e, name]) => add('eu' + e, name, `かせいだ合計 ${fmt(Math.pow(10, e))}円`, () => S.stats.earned, Math.pow(10, e)));
  [[12,'お金の嵐'],[16,'お金の海'],[20,'お金の星'],[24,'お金の銀河'],[32,'お金の宇宙のはて'],[40,'お金の神話'],[52,'お金の伝説'],[64,'お金のまぼろし']]
    .forEach(([e, name]) => add('ru' + e, name, `毎秒 ${fmt(Math.pow(10, e))}円 をこえる`, () => Math.floor(D.rate), Math.pow(10, e)));
  for (const b of BLD) for (const n of [1, 50, 100, 150, 200, 300]){ if (b.id === 'part' && n === 50) continue;
    add(`b_${b.id}_${n}`, n === 1 ? `はじめての${b.name}` : `${b.name} ${n}${b.unit}`, `${b.name}を${n}${b.unit}にする`, () => S.bld[b.id], n); }
  FARMS.forEach((fm, f) => { const ks = ORDER.filter(k => KINDS[k].farm === f); if (ks.length) add('zf' + f, `${fm}コンプリート`, `${fm}の図鑑をうめる`, () => ks.filter(k => S.found[k] > 0).length, ks.length); });
  [[50,'いも博士'],[75,'いも大博士'],[100,'いも名誉博士'],[ORDER.length,'いも図鑑の神さま']].forEach(([n, name]) => add('zt' + n, name, `図鑑を${n}しゅるいうめる`, () => foundCount(), n));
  [[1000,'レア芋コレクター'],[5000,'レア芋マスター'],[20000,'レア芋の神さま']].forEach(([n, name]) => add('rc' + n, name, `レア芋を${fmt(n)}こつかまえる`, () => S.stats.rares, n));
  add('gfev', '黄金の時間', '黄金フィーバーを1回', () => S.stats.goldFevers, 1);
  add('dfev', 'ダイヤモンドの時間', 'ダイヤモンドフィーバーを1回', () => S.stats.diaFevers, 1);
  add('fev100', 'お祭りの国', 'フィーバーを100回', () => S.stats.fevers, 100);
  add('pres50', 'いも工場の大旅行', '転生を50回', () => S.prestiges, 50);
  add('pres100', 'いも工場のたましい', '転生を100回', () => S.prestiges, 100);
  [[1e4,'種の山'],[1e6,'種の森'],[1e9,'種の大陸'],[1e12,'種の星']].forEach(([n, name]) => add('sd' + Math.log10(n), name, `いもの種を${fmt(n)}こ集める`, () => S.seeds, n));
  add('flick4', 'ポイッの大名人', 'わる芋を1万こポイッする', () => S.stats.flicked, 1e4);
  add('flick5', 'ポイッの宇宙一', 'わる芋を10万こポイッする', () => S.stats.flicked, 1e5);
  add('ship5', '出荷の星', '芋を100万こ出荷する', () => S.stats.shipped, 1e6);
  add('play4', 'いも工場がわが家', '50時間あそぶ', () => S.stats.play, 50*3600, fmtH);
  add('play5', 'いも工場が人生', '100時間あそぶ', () => S.stats.play, 100*3600, fmtH);
  [[1,'はじめての奇跡'],[10,'奇跡の工場'],[20,'奇跡がふつう']].forEach(([n, name]) => add('ks' + n, name, `いもの奇跡を Lv.${n} にする`, () => S.kiseki, n));
}
const achCount = () => ACH.filter(a => S.ach[a.id]).length;

