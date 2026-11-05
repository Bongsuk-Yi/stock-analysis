// 빌드된 정적 사이트(app/out) + 동기화 자료(data/) → 배포본(site/)
//  - 데이터 JSON 은 모두 AES-256-GCM 으로 암호화해 site/d/*.enc.json 으로 둔다(원본 JSON 은 남기지 않음)
//  - HTML 페이지는 비밀번호 게이트로 감싼다
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sitePassword, encrypt, makeKey, gatePage, LOCK_SNIPPET } from './gate.mjs';

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
  writeFileSync(f, gatePage({ title: 'PRISM-INSIGHT', mark: '🔷', storeKey: STORE_KEY, envelope: encrypt(html, pw, K), theme: 'dark' }));
  h++;
}
writeFileSync(join(SITE, '.nojekyll'), '');
console.log(`배포본 준비: 데이터 ${n}개 암호화, HTML ${h}개 게이트 적용`);
