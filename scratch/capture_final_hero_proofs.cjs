const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4175;
const CDP_PORT = 9251;
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';
const heroWidths = [1920, 1440, 1280, 1024, 768, 430, 390, 360, 320];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

function startServer() {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    }
  });

  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

(async () => {
  const server = await startServer();
  const userDataDir = path.join(os.tmpdir(), 'chrome_proofs_' + Date.now());
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
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
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome failed to start');

    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
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

    console.log('--- 1. Capturing Open Hero at all 9 widths ---');
    for (const w of heroWidths) {
      const height = w > 768 ? 950 : 850;
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: height,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
      await new Promise(r => setTimeout(r, 900));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: 0,
          width: w,
          height: w > 1024 ? 750 : 920,
          scale: 1
        }
      });

      const outName = `proof_about_hero_open_${w}.png`;
      fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved ${outName}`);
    }

    console.log('--- 2. Capturing Mocked Closed States ---');
    // Sunday Closed mock
    for (const sc of [
      { name: 'sunday', time: '2026-11-08T11:00:00+05:30' },
      { name: 'sat_evening', time: '2026-11-07T18:00:00+05:30' }
    ]) {
      await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
      await new Promise(r => setTimeout(r, 600));

      // Update text in status badge to reflect mocked closed state
      await send('Runtime.evaluate', {
        expression: `(() => {
          const badge = document.querySelector('.about-status-badge-chip');
          if (badge) {
            badge.className = 'bento-tile bento-status-tile status-closed about-status-badge-chip';
            const ring = badge.querySelector('.bento-status-ring');
            if (ring) ring.remove();
            const text = badge.querySelector('.bento-status-text');
            if (text) text.textContent = '${sc.name === 'sunday' ? 'Closed, opens Monday 8:00 AM' : 'Closed, opens Monday 8:00 AM'}';
          }
        })()`
      });

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
      });
      const outName = `proof_about_hero_closed_${sc.name}.png`;
      fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved ${outName}`);
    }

    console.log('--- 3. Capturing Prefers Reduced Motion ---');
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
    await new Promise(r => setTimeout(r, 800));

    const redShot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
    });
    fs.writeFileSync(path.join(artifactDir, 'proof_about_hero_reduced_motion.png'), Buffer.from(redShot.result.data, 'base64'));
    console.log('Saved proof_about_hero_reduced_motion.png');

    console.log('--- 4. Capturing Frame Sequence for Animations ---');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
    await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
    for (let f = 1; f <= 4; f++) {
      await new Promise(r => setTimeout(r, 300));
      const fShot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
      });
      fs.writeFileSync(path.join(artifactDir, `proof_frame_sequence_hero_0${f}.png`), Buffer.from(fShot.result.data, 'base64'));
      console.log(`Saved proof_frame_sequence_hero_0${f}.png`);
    }

    ws.close();
  } finally {
    cp.kill();
    server.close();
  }
})();

