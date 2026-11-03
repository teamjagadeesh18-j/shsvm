const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4181;
const CDP_PORT = 9258;
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
  const userDataDir = path.join(os.tmpdir(), 'chrome_drawer_' + Date.now());
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

    const viewports = [
      { name: '390', width: 390, height: 844 },
      { name: '360', width: 360, height: 780 }
    ];

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: true
      });

      await send('Page.navigate', { url: `http://localhost:${PORT}/` });
      await new Promise(r => setTimeout(r, 1200));

      // Click hamburger button to open drawer
      const clickRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.hamburger-btn');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()`,
        returnByValue: true
      });

      console.log(`Hamburger clicked on ${vp.name}px:`, clickRes.result?.result?.value);
      // Wait for drawer transition
      await new Promise(r => setTimeout(r, 600));

      // Capture drawer screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(
        path.join(artifactDir, `proof_drawer_open_${vp.name}.png`),
        Buffer.from(shot.result.data, 'base64')
      );
      console.log(`Captured proof_drawer_open_${vp.name}.png`);

      // Verify drawer links and active status
      const verifyRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const drawer = document.querySelector('.mobile-nav-drawer');
          const items = Array.from(drawer?.querySelectorAll('.drawer-nav-item') || []).map(el => ({
            text: el.innerText.trim(),
            href: el.getAttribute('href'),
            isActive: el.classList.contains('active')
          }));
          const brandText = drawer?.querySelector('.drawer-brand-name')?.innerText.trim();
          const campusCity = drawer?.querySelector('.drawer-info-title')?.innerText.trim();
          const socialBoxes = drawer?.querySelectorAll('.drawer-social-box').length;
          return { items, brandText, campusCity, socialBoxes, isOpen: drawer?.classList.contains('open') };
        })()`,
        returnByValue: true
      });

      console.log(`Drawer verification for ${vp.name}px:`, verifyRes.result?.result?.value);
    }

    ws.close();
  } finally {
    cp.kill();
    server.close();
  }
})();
