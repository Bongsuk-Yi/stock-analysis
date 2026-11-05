#!/usr/bin/env python3
"""원본 PRISM-INSIGHT 대시보드(examples/dashboard)를 GitHub Pages 정적 사이트용으로 고친다.
- 하위 경로(basePath) 배포: public 파일과 데이터 JSON 의 절대경로 앞에 NEXT_PUBLIC_BASE_PATH 를 붙인다
- 서버 전용 Stance API 라우트 제거(정적 사이트에서는 실행 불가) → 브라우저 쪽 shim 이 동기화된 JSON 으로 대신 응답
- next.config: output 'export'
사용: python3 scripts/patch_upstream.py app
"""
import os, re, sys
root = sys.argv[1] if len(sys.argv) > 1 else 'app'
B = '(process.env.NEXT_PUBLIC_BASE_PATH || "")'

# 1) public 안의 파일 목록 + 데이터 파일 이름
pub = set()
for d, _, fs in os.walk(os.path.join(root, 'public')):
    for f in fs:
        pub.add('/' + os.path.relpath(os.path.join(d, f), os.path.join(root, 'public')).replace(os.sep, '/'))
pub |= {'/dashboard_data.json', '/dashboard_data_en.json', '/us_dashboard_data.json', '/us_dashboard_data_en.json',
        '/observability_insights.json', '/ops_report.json', '/stance_leaderboard.json', '/api/stance/v1/leaderboard'}
# 원본은 이미지 파일명을 동적으로 만들기도 하므로 폴더 접두어도 처리
prefixes = ['/agents/', '/screenshots/']

pat = re.compile(r'(=)?(["\'])(/[A-Za-z0-9_./-]+)\2')
changed = 0
for d, _, fs in os.walk(root):
    if 'node_modules' in d or '.next' in d or os.sep + 'public' in d: continue
    for f in fs:
        if not f.endswith(('.tsx', '.ts')): continue
        p = os.path.join(d, f); s = open(p, encoding='utf-8').read()
        def rep(m):
            eq, q, path = m.group(1), m.group(2), m.group(3)
            if path not in pub and not any(path.startswith(x) for x in prefixes): return m.group(0)
            expr = f'{B} + {q}{path}{q}'
            return f'={{{expr}}}' if eq else f'({expr})'
        s2 = pat.sub(rep, s)
        # getDataFilePath() 처럼 반환값으로 쓰인 경로, 템플릿 문자열로 만든 경로
        s2 = s2.replace('fetch(dataFile)', f'fetch({B} + dataFile)') if 'getDataFilePath' in s2 and B + ' + "/us_dashboard' not in s2 else s2
        s2 = s2.replace('const API_BASE = "/api/stance/v1"', f'const API_BASE = {B} + "/api/stance/v1"')
        if s2 != s:
            open(p, 'w', encoding='utf-8').write(s2); changed += 1
print('patched files:', changed)

# 2) 서버 라우트 제거
import shutil
shutil.rmtree(os.path.join(root, 'app', 'api'), ignore_errors=True)

# 3) next.config
open(os.path.join(root, 'next.config.mjs'), 'w').write('''/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
export default nextConfig
''')
print('next.config.mjs written')

# 4) layout: next/font/google(빌드 때 구글 폰트를 받아야 함) → <link> 로 교체, 암호화 데이터 shim 주입
lp = os.path.join(root, 'app', 'layout.tsx'); s = open(lp, encoding='utf-8').read()
s = re.sub(r'import \{[^}]*\} from "next/font/google"\n', '', s)
s = re.sub(r'(//[^\n]*\n)?const (geist|geistMono|hedvig) = [^\n]*\n', '', s)
s = s.replace('${geist.variable} ${geistMono.variable} ${hedvig.variable} ', '')
head = '''<head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Hedvig+Letters+Serif&display=swap" />
        <style>{`:root{--font-geist:'Geist',system-ui,sans-serif;--font-geist-mono:'Geist Mono',ui-monospace,monospace;--font-hedvig:'Hedvig Letters Serif',Georgia,serif}`}</style>
        <script src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + "/sync-shim.js"} />
      </head>
      <body'''
if 'sync-shim.js' not in s:
    s = s.replace('<body', head, 1)
open(lp, 'w', encoding='utf-8').write(s)
print('layout patched')

# 5) 이 사본의 표시: 사이트 이름 stock-analysis, 스폰서 표시 제거, 하단 저작권 줄을 라이선스 고지로 교체
SITE = 'stock-analysis'
REPO = 'https://github.com/Bongsuk-Yi/stock-analysis'
hp = os.path.join(root, 'components', 'dashboard-header.tsx'); s = open(hp, encoding='utf-8').read()
s = re.sub(r'\s*\{/\* Platinum Sponsor Bar \*/\}\s*<div className="hidden sm:block border-b border-border">.*?</a>\s*</div>\s*</div>\s*</div>', '', s, count=1, flags=re.S)
s = re.sub(r'\s*<a\s+href="https://wrks\.ai/en"[^>]*>\s*Sponsor\s*<img[^>]*/>\s*</a>', '', s, count=1, flags=re.S)
s = s.replace('whitespace-nowrap">PRISM-INSIGHT</h1>', f'whitespace-nowrap">{SITE}</h1>')
open(hp, 'w', encoding='utf-8').write(s)
assert 'wrks.ai' not in s and SITE in s, 'header patch failed'

fp = os.path.join(root, 'components', 'project-footer.tsx'); s = open(fp, encoding='utf-8').read()
s = s.replace('<h3 className="text-[15px] font-semibold tracking-tight">\n                  PRISM-INSIGHT\n                </h3>',
              f'<h3 className="text-[15px] font-semibold tracking-tight">\n                  {SITE}\n                </h3>')
notice = f'''<div className="flex flex-col md:flex-row items-center gap-2">
                  <span>
                    <a href="https://github.com/dragon1086/prism-insight" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">PRISM-INSIGHT</a>
                    {{" "}}오픈소스(AGPL-3.0) 기반 개인 사본 · 보증 없음 ·{{" "}}
                    <a href="{REPO}" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">소스 코드</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">'''
s, n = re.subn(r'<div className="flex flex-col md:flex-row items-center gap-2">\s*<div className="flex items-center gap-2">\s*<span>© .*?</a>\s*</div>\s*</div>\s*<div className="flex items-center gap-2">', notice, s, count=1, flags=re.S)
s = s.replace('MIT License\n', 'AGPL-3.0\n')
open(fp, 'w', encoding='utf-8').write(s)
assert n == 1 and 'wrks.ai' not in s and 'All rights reserved' not in s, 'footer patch failed'

lp = os.path.join(root, 'app', 'layout.tsx'); s = open(lp, encoding='utf-8').read()
s = s.replace('title: "Prism Insight Dashboard"', f'title: "{SITE}"')
open(lp, 'w', encoding='utf-8').write(s)
print('branding patched')

# 6) 실제 라이선스 표기(원본 저장소 LICENSE 는 AGPL-3.0)
gp = os.path.join(root, 'components', 'language-provider.tsx'); s = open(gp, encoding='utf-8').read()
open(gp, 'w', encoding='utf-8').write(s.replace('MIT License', 'AGPL-3.0'))
print('license text patched')
