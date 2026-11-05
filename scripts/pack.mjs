// 빌드된 정적 사이트(app/out) + 동기화 자료(data/) → 배포본(site/)
//  - 데이터 JSON 은 모두 AES-256-GCM 으로 암호화해 site/d/*.enc.json 으로 둔다(원본 JSON 은 남기지 않음)
//  - HTML 페이지는 비밀번호 게이트로 감싼다
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sitePassword, encrypt, makeKey, gatePage, LOCK_SNIPPET, decryptNode } from './gate.mjs';

const OUT = 'app/out', SITE = 'site', STORE_KEY = 'prism.pw';
const pw = sitePassword(), K = makeKey(pw);
rmSync(SITE, { recursive: true, force: true });
cpSync(OUT, SITE, { recursive: true });
for (const f of ['dashboard_data.json', 'dashboard_data_en.json', 'us_dashboard_data.json', 'us_dashboard_data_en.json', 'observability_insights.json', 'ops_report.json', 'stance_leaderboard.json'])
  rmSync(join(SITE, f), { force: true });
mkdirSync(join(SITE, 'd'), { recursive: true });
let n = 0;
for (const f of existsSync('data') ? readdirSync('data') : []) {
  if (!f.endsWith('.json')) continue;
  writeFileSync(join(SITE, 'd', f.replace(/\.json$/, '.enc.json')), JSON.stringify(encrypt(readFileSync(join('data', f)), pw, K)));
  n++;
}
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let h = 0;
for (const f of walk(SITE).filter((p) => p.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8').replace(/<\/body>/i, LOCK_SNIPPET(STORE_KEY) + '</body>');
  writeFileSync(f, gatePage({ title: 'stock-analysis', mark: '📈', storeKey: STORE_KEY, envelope: encrypt(html, pw, K), theme: 'dark' }));
  h++;
}
writeFileSync(join(SITE, '.nojekyll'), '');

// 자체 점검: 암호화한 파일을 다시 풀어 원본과 같은지, 대시보드 필수 항목이 있는지 확인한다
for (const f of readdirSync(join(SITE, 'd'))) {
  const plain = decryptNode(JSON.parse(readFileSync(join(SITE, 'd', f), 'utf8')), pw);
  if (plain !== readFileSync(join('data', f.replace('.enc.json', '.json')), 'utf8')) throw new Error('복호화 결과 불일치: ' + f);
  if (/dashboard_data/.test(f)) {
    const j = JSON.parse(plain);
    for (const k of ['generated_at', 'summary', 'holdings', 'trading_history']) if (!(k in j)) throw new Error(`${f}: '${k}' 항목 없음`);
  }
}
const idx = decryptNode(JSON.parse(readFileSync(join(SITE, 'index.html'), 'utf8').match(/<script id="__env" type="application\/json">(.*?)<\/script>/s)[1]), pw);
if (!idx.includes('sync-shim.js')) throw new Error('index.html 에 shim 이 없습니다');
console.log('자체 점검 통과: 모든 데이터 복호화·필수 항목 확인');
console.log(`배포본 준비: 데이터 ${n}개 암호화, HTML ${h}개 게이트 적용`);
