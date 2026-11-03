const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9299;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_dash_clean_' + Date.now();
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
      await new Promise(r => setTimeout(r, 300));
    }

    async function captureElement(selector, filename) {
      // Get element bounds
      const bounds = await evaluate(`
        (() => {
          const el = document.querySelector('${selector}');
          if (!el) return null;
          el.scrollIntoView({ block: 'start' });
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(r.left + window.scrollX - 8)),
            y: Math.max(0, Math.floor(r.top + window.scrollY - 8)),
            width: Math.ceil(r.width + 16),
            height: Math.ceil(r.height + 16)
          };
        })()
      `);
      if (!bounds) {
        console.error('Element not found:', selector);
        return;
      }

      // Allow 200ms for any layout to settle
      await new Promise(r => setTimeout(r, 200));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          scale: 1
        }
      });
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved:', filename);
    }

    const viewports = [
      { w: 1440, h: 900, name: '1440', mobile: false },
      { w: 1024, h: 800, name: '1024', mobile: false },
      { w: 768, h: 1024, name: '768', mobile: false },
      { w: 430, h: 932, name: '430', mobile: true },
      { w: 390, h: 844, name: '390', mobile: true },
      { w: 360, h: 780, name: '360', mobile: true }
    ];

    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.mobile);
      // Wait for animations to settle
      await evaluate(`
        const grid = document.querySelector('.dashboard-cards-grid');
        if (grid) grid.scrollIntoView({ block: 'center' });
      `);
      await new Promise(r => setTimeout(r, 1200));
      await captureElement('.dashboard-cards-grid', `proof_dash_after_${vp.name}.png`);
    }

    // Animation frames at 1440px
    await setViewport(1440, 900, false);
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 500));
    await evaluate(`
      const grid = document.querySelector('.dashboard-cards-grid');
      if (grid) grid.scrollIntoView({ block: 'center' });
    `);
    // Mid animation (~350ms)
    await new Promise(r => setTimeout(r, 350));
    await captureElement('.dashboard-cards-grid', 'proof_dash_anim_mid.png');

    // Final animation (~1400ms)
    await new Promise(r => setTimeout(r, 1100));
    await captureElement('.dashboard-cards-grid', 'proof_dash_anim_final.png');

    console.log('All clean screenshots captured successfully.');
  } finally {
    cp.kill('SIGTERM');
  }
})();

