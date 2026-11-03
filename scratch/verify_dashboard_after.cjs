const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9298;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_dash_after_' + Date.now();
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
    await new Promise(r => setTimeout(r, 1600));

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
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(r.left - 16)),
            y: Math.max(0, Math.floor(r.top + window.scrollY - 16)),
            width: Math.min(window.innerWidth, Math.ceil(r.width + 32)),
            height: Math.ceil(r.height + 32),
            scale: 1
          };
        })()
      `);
      if (!clip) {
        console.error('Grid element not found for clip');
        return;
      }
      const shot = await send('Page.captureScreenshot', { clip, format: 'png' });
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }

    const viewports = [
      { w: 1440, h: 900, name: '1440', mobile: false },
      { w: 1024, h: 800, name: '1024', mobile: false },
      { w: 768, h: 1024, name: '768', mobile: false },
      { w: 430, h: 932, name: '430', mobile: true },
      { w: 390, h: 844, name: '390', mobile: true },
      { w: 360, h: 780, name: '360', mobile: true }
    ];

    const measurements = {};

    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.mobile);
      await evaluate(`
        const grid = document.querySelector('.dashboard-cards-grid');
        if (grid) grid.scrollIntoView({ block: 'center' });
      `);
      await new Promise(r => setTimeout(r, 800));

      const data = await evaluate(`
        (() => {
          const cards = Array.from(document.querySelectorAll('.dashboard-cards-grid .dashboard-card'));
          const h = cards.map(c => Math.round(c.getBoundingClientRect().height));
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const overflow = scrollW > docW;
          return {
            cardHeights: h,
            equalHeights: h.length >= 3 ? (h[0] === h[1] && h[1] === h[2]) : false,
            clientWidth: docW,
            scrollWidth: scrollW,
            hasOverflow: overflow
          };
        })()
      `);

      measurements[vp.name] = data;
      console.log(`VP ${vp.name}px: Heights=${JSON.stringify(data.cardHeights)}, Equal=${data.equalHeights}, Overflow=${data.hasOverflow}`);
      await captureCards(`proof_dash_after_${vp.name}.png`);
    }

    // Capture animation progression frames at 1440px
    await setViewport(1440, 900, false);
    // Reload page
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 400));
    // Scroll into view immediately to start animation
    await evaluate(`
      const grid = document.querySelector('.dashboard-cards-grid');
      if (grid) grid.scrollIntoView({ block: 'center' });
    `);
    // Mid-animation frame (~220ms)
    await new Promise(r => setTimeout(r, 220));
    await captureCards('proof_dash_anim_mid.png');

    // Final state frame (~1400ms)
    await new Promise(r => setTimeout(r, 1200));
    await captureCards('proof_dash_anim_final.png');

    // Bounds check at 320px
    await setViewport(320, 600, true);
    await evaluate(`
      const grid = document.querySelector('.dashboard-cards-grid');
      if (grid) grid.scrollIntoView({ block: 'center' });
    `);
    await new Promise(r => setTimeout(r, 400));
    const bounds320 = await evaluate(`
      (() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        return { clientWidth: docW, scrollWidth: scrollW, hasOverflow: scrollW > docW };
      })()
    `);
    measurements['320'] = bounds320;
    console.log(`VP 320px Bounds:`, bounds320);

    // Save report
    fs.writeFileSync(path.join(artifactDir, 'proof_dash_after_measurements.json'), JSON.stringify(measurements, null, 2));

  } finally {
    cp.kill('SIGTERM');
  }
})();

