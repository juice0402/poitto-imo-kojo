// index.html を src/ から作る（Node の標準だけ・ビルドのほかに入れるものはない）
//   node tools/build.mjs          … src/shell.html の「@@include ファイル名」の行を、src/ のそのファイルの中身にかえて index.html に書き出す
//   node tools/build.mjs --check  … いまの index.html が src と同じかを確かめる（ちがえば失敗）
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = name => readFileSync(join(root, 'src', name), 'utf8');
const out = src('shell.html').replace(/^@@include (\S+)\n/gm, (_, name) => src(name));
const target = join(root, 'index.html');

if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== out) {
    console.error('index.html と src がずれています。node tools/build.mjs で作りなおしてください');
    process.exit(1);
  }
  console.log('OK：index.html は src と同じ');
} else {
  writeFileSync(target, out);
  console.log('index.html を作りました（' + Buffer.byteLength(out) + ' バイト）');
}
