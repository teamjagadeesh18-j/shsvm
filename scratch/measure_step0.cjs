const fs = require('fs');
const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9246',
    '--user-data-dir=C:\\tmp\\chrome_diag_step0_' + Date.now(),
    'about:blank'
  ]);
  try {
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9246/json/version');
        if (res.ok) break;
      } catch {}
    }
    const listRes = await fetch('http://127.0.0.1:9246/json/list');
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
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const mid = id++;
      callbacks.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    const widths = [360, 390, 430, 768];
    const step0Data = {};

    for (const w of widths) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1600));
      await send('Runtime.evaluate', { expression: `document.getElementById('holistic')?.scrollIntoView({ behavior: 'instant', block: 'start' });` });
      await new Promise(r => setTimeout(r, 400));

      const diag = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('#holistic .ib-card'));
            return cards.map((c, i) => {
              const svg = c.querySelector('svg.ib-diagram') || c.querySelector('svg');
              const cRect = c.getBoundingClientRect();
              const sRect = svg ? svg.getBoundingClientRect() : { width: 0, height: 0 };
              const ratio = cRect.height > 0 ? (sRect.height / cRect.height) : 0;
              return {
                cardIndex: i,
                cardTitle: c.querySelector('h3')?.textContent || '',
                cardHeight: Math.round(cRect.height),
                diagramHeight: Math.round(sRect.height),
                diagramWidth: Math.round(sRect.width),
                ratioDiagramToCardHeight: (ratio * 100).toFixed(1) + '%'
              };
            });
          })()
        `,
        returnByValue: true
      });
      step0Data[w] = diag.result.value;
    }
    console.log('STEP 0 MEASUREMENTS:');
    console.log(JSON.stringify(step0Data, null, 2));
    fs.writeFileSync('C:/Users/jagad/.gemini/antigravity/brain/b3832e7b-9e62-4a3b-993b-481cf86cf330/scratch/step0_diagnosis.json', JSON.stringify(step0Data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    try { cp.kill(); } catch {}
  }
})();

