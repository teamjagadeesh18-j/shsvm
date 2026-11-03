const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4176;
const CDP_PORT = 9252;
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
  const userDataDir = path.join(os.tmpdir(), 'chrome_cwv_' + Date.now());
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
    await send('Performance.enable');

    // Emulate Mobile Device (Moto G4 / 412x823) with CPU throttling
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 823,
      deviceScaleFactor: 2.625,
      mobile: true
    });
    await send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await send('Page.navigate', { url: `http://localhost:${PORT}/about` });

    // Wait for page load and observe performance metrics
    await new Promise(r => setTimeout(r, 2500));

    const perfRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const entries = performance.getEntriesByType('navigation')[0] || {};
        const paintEntries = performance.getEntriesByType('paint');
        let fcp = 0;
        for (const p of paintEntries) {
          if (p.name === 'first-contentful-paint') fcp = p.startTime;
        }

        // Measure CLS
        let cls = 0;
        const shiftEntries = performance.getEntriesByType('layout-shift') || [];
        for (const s of shiftEntries) {
          if (!s.hadRecentInput) cls += s.value;
        }

        // Measure LCP from element
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint') || [];
        const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : fcp;

        return {
          fcp: Math.round(fcp),
          lcp: Math.round(lcp),
          cls: parseFloat(cls.toFixed(4)),
          domInteractive: Math.round(entries.domInteractive || 0),
          domContentLoaded: Math.round(entries.domContentLoadedEventEnd || 0)
        };
      })()`,
      returnByValue: true
    });

    const perf = perfRes.result?.result?.value || {};
    console.log('Mobile CWV Metrics for /about (4x CPU Throttling):', perf);
    fs.writeFileSync(path.join(artifactDir, 'about_mobile_cwv.json'), JSON.stringify(perf, null, 2));

    ws.close();
  } finally {
    cp.kill();
    server.close();
  }
})();

