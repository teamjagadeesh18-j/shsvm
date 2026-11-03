const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9244;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

const pages = [
  { name: 'about', url: 'http://localhost:5173/about' },
  { name: 'academics', url: 'http://localhost:5173/academics' },
  { name: 'admissions', url: 'http://localhost:5173/admissions' },
  { name: 'contact', url: 'http://localhost:5173/contact' }
];

const widths = [1440, 1024, 768, 430, 390, 360, 320];

(async () => {
  const userDataDir = path.join(os.tmpdir(), 'chrome_before_' + Date.now());
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

    for (const p of pages) {
      for (const w of widths) {
        const height = w > 768 ? 900 : 800;
        await send('Emulation.setDeviceMetricsOverride', {
          width: w,
          height: height,
          deviceScaleFactor: 1,
          mobile: w <= 768
        });

        await send('Page.navigate', { url: p.url });
        await new Promise(r => setTimeout(r, 800));

        // Capture viewport top
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: 0,
            y: 0,
            width: w,
            height: Math.min(height, 500),
            scale: 1
          }
        });

        const outName = `proof_before_top_${p.name}_${w}.png`;
        const outPath = path.join(artifactDir, outName);
        fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved ${outName}`);
      }
    }

    ws.close();
  } finally {
    cp.kill();
  }
})();

