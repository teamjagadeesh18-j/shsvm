import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const distDir = path.resolve('client/dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url.split('?')[0]);
  if (req.url === '/' || !path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(distDir, 'index.html'), (err2, fallback) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fallback);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = 5199;
server.listen(PORT, async () => {
  console.log(`Static server running on http://localhost:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_qa_footer',
    'about:blank'
  ]);

  let ok = false;
  for (let i = 0; i < 30; i++) {
    try {
      ok = await new Promise((resolve) => {
        http.get('http://127.0.0.1:9222/json/version', (res) => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }

  if (!ok) {
    console.error('Could not connect to Chrome CDP');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('DOM.enable');

  const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

  // 1. Capture Desktop Header (1440px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1200));

  const shotHeader1440 = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1440, height: 160, scale: 1 }
  });
  fs.writeFileSync(path.join(artifactDir, 'header_desktop_1440.png'), Buffer.from(shotHeader1440.data, 'base64'));

  // 2. Capture Desktop Footer (1440px)
  const evalFooter = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.site-footer');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: 0, y: window.scrollY + rect.top, width: 1440, height: rect.height };
    })()`,
    returnByValue: true
  });
  if (evalFooter.result && evalFooter.result.value) {
    const rect = evalFooter.result.value;
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${rect.y})` });
    await new Promise(r => setTimeout(r, 600));
    const shotFooter1440 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: rect.y, width: 1440, height: rect.height, scale: 1 }
    });
    fs.writeFileSync(path.join(artifactDir, 'footer_desktop_1440.png'), Buffer.from(shotFooter1440.data, 'base64'));
  }

  // 3. Capture Desktop Admissions Page (1440px)
  await send('Page.navigate', { url: `http://localhost:${PORT}/admissions` });
  await new Promise(r => setTimeout(r, 1200));
  const shotAdmissions1440 = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
  });
  fs.writeFileSync(path.join(artifactDir, 'admissions_hero_1440.png'), Buffer.from(shotAdmissions1440.data, 'base64'));

  // 4. Capture Mobile Header (360px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 740,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1200));
  const shotHeader360 = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 360, height: 120, scale: 2 }
  });
  fs.writeFileSync(path.join(artifactDir, 'header_mobile_360.png'), Buffer.from(shotHeader360.data, 'base64'));

  // 5. Capture Mobile Footer (360px)
  const evalFooterMobile = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.site-footer');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: 0, y: window.scrollY + rect.top, width: 360, height: rect.height };
    })()`,
    returnByValue: true
  });
  if (evalFooterMobile.result && evalFooterMobile.result.value) {
    const rect = evalFooterMobile.result.value;
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${rect.y})` });
    await new Promise(r => setTimeout(r, 600));
    const shotFooter360 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: rect.y, width: 360, height: rect.height, scale: 2 }
    });
    fs.writeFileSync(path.join(artifactDir, 'footer_mobile_360.png'), Buffer.from(shotFooter360.data, 'base64'));
  }

  console.log('SUCCESS: All screenshots captured!');
  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
});
