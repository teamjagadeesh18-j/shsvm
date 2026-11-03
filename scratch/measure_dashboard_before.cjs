const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9297;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_dash_' + Date.now();
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome failed to start');

    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pageTargets = await listRes.json();
    const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    await new Promise(r => ws.onopen = r);

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    function send(method, params = {}) {
      return new Promise(r => {
        const msgId = id++;
        callbacks.set(msgId, r);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

    async function evaluate(expr) {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return (res.result && res.result.result) ? res.result.result.value : null;
    }

    async function setViewport(width, height, isMobile = false) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: isMobile
      });
      await new Promise(r => setTimeout(r, 400));
    }

    async function captureCards(filename) {
      const clip = await evaluate(`
        (() => {
          const el = document.querySelector('.dashboard-cards-grid');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.left - 10), y: Math.max(0, r.top - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
        })()
      `);
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: clip || undefined
      });
      const filePath = path.join(artifactDir, filename);
      fs.writeFileSync(filePath, Buffer.from(screenshot.result.data, 'base64'));
      console.log('Saved screenshot: ' + filename);
    }

    const viewports = [
      { w: 1440, h: 900, mobile: false, name: '1440' },
      { w: 1024, h: 768, mobile: false, name: '1024' },
      { w: 768, h: 1024, mobile: false, name: '768' },
      { w: 430, h: 932, mobile: true, name: '430' },
      { w: 390, h: 844, mobile: true, name: '390' },
      { w: 360, h: 800, mobile: true, name: '360' }
    ];

    const measurements = [];

    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.mobile);
      // scroll cards into view
      await evaluate(`document.querySelector('.dashboard-cards-grid')?.scrollIntoView({ block: 'center' })`);
      await new Promise(r => setTimeout(r, 300));

      await captureCards('proof_dash_before_' + vp.name + '.png');

      const cardHeights = await evaluate(`
        (() => {
          const cards = Array.from(document.querySelectorAll('.dashboard-card'));
          return cards.map((c, i) => ({
            card: i + 1,
            height: Math.round(c.getBoundingClientRect().height),
            width: Math.round(c.getBoundingClientRect().width)
          }));
        })()
      `);

      measurements.push({
        viewport: vp.name,
        cardHeights
      });
      console.log('Measurements [' + vp.name + ']:', cardHeights);
    }

    fs.writeFileSync(
      path.join(artifactDir, 'proof_dash_before_heights.json'),
      JSON.stringify(measurements, null, 2)
    );

    console.log('Measurements complete!');
    cp.kill();
  } catch(e) {
    console.error(e);
    cp.kill();
  }
})();

