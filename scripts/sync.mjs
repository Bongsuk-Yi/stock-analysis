// 원본 사이트(analysis.stocksimulation.kr)가 공개하는 대시보드 데이터를 받아 data/ 에 저장한다.
// 원본은 하루 몇 차례 데이터를 다시 만들고, 이 스크립트는 30분마다 실행되어 최신본을 가져온다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SRC = process.env.SOURCE_URL || 'https://analysis.stocksimulation.kr';
const FILES = {
  dashboard_data: '/dashboard_data.json',
  dashboard_data_en: '/dashboard_data_en.json',
  us_dashboard_data: '/us_dashboard_data.json',
  us_dashboard_data_en: '/us_dashboard_data_en.json',
  observability_insights: '/observability_insights.json',
  ops_report: '/ops_report.json',
  stance_leaderboard: '/api/stance/v1/leaderboard',
  stance_markets: '/api/stance/v1/markets',
  stance_health: '/api/stance/v1/health',
};
const REQUIRED = ['dashboard_data', 'dashboard_data_en'];
mkdirSync('data', { recursive: true });
const h = createHash('sha256'), report = [];
let failed = 0;
for (const [name, path] of Object.entries(FILES)) {
  let ok = false;
  for (let t = 0; t < 3 && !ok; t++) {
    try {
      const r = await fetch(SRC + path, { headers: { 'User-Agent': 'prism-mirror (GitHub Actions)', Accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const text = await r.text();
      JSON.parse(text);                                   // 깨진 응답은 저장하지 않는다
      writeFileSync(`data/${name}.json`, text);
      if (!name.startsWith('stance_health')) h.update(name).update(text);
      const gen = (text.match(/"generated_at"\s*:\s*"([^"]+)"/) || [])[1] || '';
      report.push(`${name}: ${(text.length / 1048576).toFixed(2)}MB ${gen}`);
      ok = true;
    } catch (e) {
      if (t === 2) { report.push(`${name}: 실패 (${e.message})`); failed++; if (REQUIRED.includes(name)) { console.error(report.join('\n')); process.exit(1); } }
      else await new Promise((r) => setTimeout(r, 2000 * (t + 1)));
    }
  }
}
console.log(report.join('\n'));
const digest = h.digest('hex').slice(0, 16);
writeFileSync('data/.hash', digest);
console.log('data hash:', digest, failed ? `(${failed}개 실패 — 있는 것만 반영)` : '');
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `hash=${digest}\n`, { flag: 'a' });
