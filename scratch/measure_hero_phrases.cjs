const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9285',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\tmp\\chrome_hero_' + Date.now(),
    'about:blank'
  ]);

  try {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9285/json/version');
        if (res.ok) break;
      } catch {}
    }

    const listRes = await fetch('http://127.0.0.1:9285/json/list');
    const pageTargets = await listRes.json();
    const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    await new Promise(r => ws.onopen = r);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id).resolve(msg.result);
        callbacks.delete(msg.id);
      }
    };
    const send = (m, p = {}) => new Promise(r => {
      const mid = id++;
      callbacks.set(mid, { resolve: r });
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    const phrases = [
      "Smile, Study, Serve",
      "Primary to Secondary",
      "Academic & Arts Focus",
      "Care & Discipline"
    ];

    const viewports = [320, 360, 390, 430, 768];
    const results = {};

    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 768
      });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1500));

      results[width] = {};

      for (const phrase of phrases) {
        // Force the phrase into the typewriter-text element
        const evalRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('.typewriter-text');
              const h1 = document.querySelector('.hero-title');
              const highlight = document.querySelector('.hero-highlight');
              if (!el) return null;
              el.textContent = '${phrase}';
              
              const hRect = highlight.getBoundingClientRect();
              const titleRect = h1.getBoundingClientRect();
              const textRect = el.getBoundingClientRect();
              const cursorRect = document.querySelector('.typing-cursor')?.getBoundingClientRect();

              const vpW = window.innerWidth;
              const scrollW = document.documentElement.scrollWidth;

              return {
                phrase: '${phrase}',
                textWidth: textRect.width,
                highlightWidth: hRect.width,
                highlightLeft: hRect.left,
                highlightRight: hRect.right,
                titleLeft: titleRect.left,
                titleRight: titleRect.right,
                cursorRight: cursorRect ? cursorRect.right : 0,
                rightEdgeDiff: hRect.right - (vpW - 16),
                overflowPage: scrollW > vpW
              };
            })()
          `,
          returnByValue: true
        });
        results[width][phrase] = evalRes.result.value;
      }
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    cp.kill();
  }
})();

