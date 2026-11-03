const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4179;
const CDP_PORT = 9256;
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

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
  const userDataDir = path.join(os.tmpdir(), 'chrome_legal_' + Date.now());
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

    const pages = [
      { route: '/privacy', name: 'privacy' },
      { route: '/terms', name: 'terms' }
    ];

    const viewports = [
      { name: '1440', width: 1440, height: 900 },
      { name: '390', width: 390, height: 844 }
    ];

    for (const p of pages) {
      for (const vp of viewports) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 768
        });

        await send('Page.navigate', { url: `http://localhost:${PORT}${p.route}` });
        await new Promise(r => setTimeout(r, 1200));

        // Full page screenshot
        const metricsRes = await send('Page.getLayoutMetrics');
        const contentHeight = Math.ceil(metricsRes.result.contentSize.height);

        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: contentHeight,
          deviceScaleFactor: 1,
          mobile: vp.width < 768
        });
        await new Promise(r => setTimeout(r, 300));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
          path.join(artifactDir, `proof_${p.name}_${vp.name}.png`),
          Buffer.from(shot.result.data, 'base64')
        );
        console.log(`Captured proof_${p.name}_${vp.name}.png`);
      }
    }

    ws.close();
  } finally {
    cp.kill();
    server.close();
  }
})();

