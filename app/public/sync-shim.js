/* 암호화된 데이터 shim — 원본 대시보드의 fetch('/xxx.json') 요청을 d/xxx.enc.json 으로 돌려 브라우저에서 복호화한다.
   비밀번호는 게이트 화면에서 저장한 값을 쓴다. Stance 등록(POST)처럼 서버가 필요한 요청은 안내 메시지로 응답한다. */
(function () {
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? new URL('.', me).pathname.replace(/\/$/, '') : '';
  var KEY = 'prism.pw';
  var pw = null;
  try { pw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch (e) {}
  var MAP = {
    '/dashboard_data.json': 'dashboard_data', '/dashboard_data_en.json': 'dashboard_data_en',
    '/us_dashboard_data.json': 'us_dashboard_data', '/us_dashboard_data_en.json': 'us_dashboard_data_en',
    '/observability_insights.json': 'observability_insights', '/ops_report.json': 'ops_report',
    '/stance_leaderboard.json': 'stance_leaderboard', '/api/stance/v1/leaderboard': 'stance_leaderboard',
    '/api/stance/v1/markets': 'stance_markets', '/api/stance/v1/health': 'stance_health',
  };
  var b64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  var keys = {};
  function key(env) {
    if (!keys[env.salt]) keys[env.salt] = crypto.subtle.importKey('raw', new TextEncoder().encode(pw || ''), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(env.salt), iterations: env.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']); });
    return keys[env.salt];
  }
  async function decrypt(env) {
    var k = await key(env);
    var bytes = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(env.iv) }, k, b64(env.data)));
    if (env.compression === 'gzip') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    return bytes;
  }
  var json = function (o, status) { return new Response(JSON.stringify(o), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); };
  var orig = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      var url = new URL(typeof input === 'string' ? input : input.url, location.href);
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      if (url.origin === location.origin) {
        var p = url.pathname;
        if (BASE && p.indexOf(BASE + '/') === 0) p = p.slice(BASE.length);
        if (p.indexOf('/api/stance/') === 0 && method !== 'GET')
          return Promise.resolve(json({ error: 'not_supported', message: '이 사이트(GitHub Pages 사본)에서는 Stance 등록·선언을 지원하지 않습니다. 원본 사이트를 이용하세요.' }, 503));
        var name = MAP[p];
        if (name) {
          return orig(BASE + '/d/' + name + '.enc.json?t=' + Date.now(), { cache: 'no-store' }).then(async function (r) {
            if (!r.ok) return new Response('', { status: r.status });
            return new Response(await decrypt(await r.json()), { status: 200, headers: { 'Content-Type': 'application/json' } });
          });
        }
      }
    } catch (e) { console.error('[sync-shim]', e); }
    return orig(input, init);
  };
})();
