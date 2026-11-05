# PRISM-INSIGHT 대시보드 (개인 사본)

[PRISM-INSIGHT](https://github.com/dragon1086/prism-insight) 오픈소스 프로젝트의 공식 대시보드(`examples/dashboard`)를
GitHub Pages에서 비밀번호로 보호해 운영하는 개인용 사본입니다. 원본 사이트: https://analysis.stocksimulation.kr

## 동작 방식
1. GitHub Actions(`.github/workflows/sync.yml`)가 **30분마다** 원본 사이트가 공개하는 대시보드 데이터를 받아옵니다
   (`dashboard_data*.json`, `us_dashboard_data*.json`, `observability_insights.json`, `ops_report.json`, Stance 리더보드).
2. 데이터가 바뀐 경우에만 다시 배포합니다. 원본은 장중·장후 하루 몇 차례 데이터를 다시 만듭니다.
3. 열려 있는 화면은 원본과 같이 5분마다 데이터를 다시 불러옵니다.
4. 모든 데이터와 HTML은 AES-256-GCM(PBKDF2-SHA256 310,000회)으로 암호화되어 배포되고, 브라우저에서 비밀번호로 복호화됩니다.
   비밀번호는 **Settings → Secrets and variables → Actions → `SITE_PASSWORD`** 에만 둡니다.

## 원본과 다른 점
- 정적 사이트로 바꾸기 위해 `scripts/patch_upstream.py`로 원본을 고쳤습니다(하위 경로 배포, 폰트 로딩 방식, 서버 라우트 제거, 데이터 복호화 shim).
- **Stance 전략 등록·판단 선언**은 서버가 필요해 이 사본에서는 동작하지 않습니다(리더보드 조회는 동기화된 자료로 표시).
- 데이터는 원본 운영자의 계좌·시뮬레이터 기록이며, 이 사본은 그것을 그대로 보여 줄 뿐입니다.

## 원본 대시보드 새 버전 반영
```
git clone --depth 1 https://github.com/dragon1086/prism-insight /tmp/p
rm -rf app && cp -r /tmp/p/examples/dashboard app && cp /tmp/p/LICENSE app/LICENSE
cp scripts/sync-shim.js app/public/
python3 scripts/patch_upstream.py app
```

## 라이선스
`app/` 의 대시보드 코드는 원본 PRISM-INSIGHT와 같은 **GNU AGPL-3.0**을 따릅니다(`app/LICENSE`).
원본 저작권은 PRISM-INSIGHT 기여자에게 있으며, 이 저장소의 수정 사항도 AGPL-3.0으로 공개됩니다.
상업적 이용은 원본 프로젝트의 상업 라이선스 안내를 확인하세요.

분석 정보는 투자 참고용이며 투자 권유가 아닙니다.
