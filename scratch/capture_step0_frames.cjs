const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9325;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_frames_step0_' + Date.now();
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

    async function evaluate(expr) {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return (res.result && res.result.result) ? res.result.result.value : null;
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1200));

    // Capture each card at 0ms, 300ms, 600ms, 1200ms
    // First, let's get bounding box of each card
    const cardSelectors = [
      { sel: '.calendar-card', name: 'card1_routine' },
      { sel: '.results-card', name: 'card2_highlights' },
      { sel: '.beyond-card', name: 'card3_beyond' }
    ];

    async function captureCard(sel, filename) {
      const bounds = await evaluate(`
        (() => {
          const el = document.querySelector('${sel}');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(r.left + window.scrollX - 4)),
            y: Math.max(0, Math.floor(r.top + window.scrollY - 4)),
            width: Math.ceil(r.width + 8),
            height: Math.ceil(r.height + 8)
          };
        })()
      `);
      if (!bounds) {
        console.error('Not found:', sel);
        return;
      }
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { ...bounds, scale: 1 }
      });
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved:', filename);
    }

    // Scroll card 1 into view and capture sequence
    await evaluate(`document.querySelector('.dashboard-cards-grid').scrollIntoView({ block: 'center' });`);
    
    // Capture 0ms
    await captureCard('.calendar-card', 'step0_before_card1_0ms.png');
    await captureCard('.results-card', 'step0_before_card2_0ms.png');
    await captureCard('.beyond-card', 'step0_before_card3_0ms.png');

    await new Promise(r => setTimeout(r, 300));
    await captureCard('.calendar-card', 'step0_before_card1_300ms.png');
    await captureCard('.results-card', 'step0_before_card2_300ms.png');
    await captureCard('.beyond-card', 'step0_before_card3_300ms.png');

    await new Promise(r => setTimeout(r, 300)); // 600ms
    await captureCard('.calendar-card', 'step0_before_card1_600ms.png');
    await captureCard('.results-card', 'step0_before_card2_600ms.png');
    await captureCard('.beyond-card', 'step0_before_card3_600ms.png');

    await new Promise(r => setTimeout(r, 600)); // 1200ms
    await captureCard('.calendar-card', 'step0_before_card1_1200ms.png');
    await captureCard('.results-card', 'step0_before_card2_1200ms.png');
    await captureCard('.beyond-card', 'step0_before_card3_1200ms.png');

    console.log('Step 0 frames captured successfully.');
  } finally {
    cp.kill('SIGTERM');
  }
})();

