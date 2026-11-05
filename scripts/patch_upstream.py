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
