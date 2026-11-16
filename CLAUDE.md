# ぽいっと！いも工場（記号 imo）

- 直すのは src/。直したら `node tools/build.mjs`（index.html を作る）→ `npm test`（ずれの確かめ）。**index.html は手で直さない**
- 直す前に docs/MAP.md（どのファイルに何があるか）→ 検索 → その範囲だけ読む
- 企画メモ・決めたことは claude.ai のプロジェクト「ネット副業」の claude/imo-game-idea.md
- 試しに遊ぶページ：https://claude.ai/artifact/MvGTq8bsSkFqeVNu3FpJeK（直したら index.html を同じ URL に出し直す）
- セーブ名は imo-v2。古いセーブがそのまま読めるように、S の形を変えるときは merge で補う
- 絵はぜんぶコードで描いたドット絵（ART の表）。絵・音・コインや運のしくみをさわるときは claude/game-art-rule.md
- LICENSE は入れない（著作権はしょーくん）
- ゲーム工房に新しい版を出すときは RELEASES.md のいちばん上に版を足す（マージで Actions がタグと Releases を作る）
