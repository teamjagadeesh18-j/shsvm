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

const PORT = 5210;
server.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_final_proof',
    'about:blank'
  ]);

  let ok = false;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version').catch(() => fetch('http://[::1]:9222/json/version'));
      if (res && res.ok) {
        ok = true;
        break;
      }
    } catch {}
  }

  if (!ok) {
    console.error('CDP failed to start');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  const targetsRes = await fetch('http://127.0.0.1:9222/json/list').catch(() => fetch('http://[::1]:9222/json/list'));
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  await new Promise(resolve => { ws.onopen = resolve; });
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

  // Desktop 1440px
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Header screenshot
  const shotHeader = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1440, height: 160, scale: 1 }
  });
  fs.writeFileSync(path.join(artifactDir, 'proof_header_desktop.png'), Buffer.from(shotHeader.data, 'base64'));

  // 2. Image Marquee screenshot on Home
  const evalMarquee = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.image-marquee-section');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: 0, y: window.scrollY + rect.top, width: 1440, height: rect.height };
    })()`,
    returnByValue: true
  });
  if (evalMarquee.result && evalMarquee.result.value) {
    const rect = evalMarquee.result.value;
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${rect.y - 40})` });
    await new Promise(r => setTimeout(r, 600));
    const shotMarquee = await send('Page.captureScreenshot', {
      clip: { x: 0, y: rect.y, width: 1440, height: rect.height, scale: 1 }
    });
    fs.writeFileSync(path.join(artifactDir, 'proof_image_marquee_white.png'), Buffer.from(shotMarquee.data, 'base64'));
  }

  // 3. Ink Orbit Features Bento screenshot
  const evalInk = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.ib-root');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: 0, y: window.scrollY + rect.top, width: 1440, height: rect.height };
    })()`,
    returnByValue: true
  });
  if (evalInk.result && evalInk.result.value) {
    const rect = evalInk.result.value;
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${rect.y - 40})` });
    await new Promise(r => setTimeout(r, 800));
    const shotInk = await send('Page.captureScreenshot', {
      clip: { x: 0, y: rect.y, width: 1440, height: rect.height, scale: 1 }
    });
    fs.writeFileSync(path.join(artifactDir, 'proof_ink_orbit_features.png'), Buffer.from(shotInk.data, 'base64'));
  }

  // 4. Footer screenshot
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
    const shotFooter = await send('Page.captureScreenshot', {
      clip: { x: 0, y: rect.y, width: 1440, height: rect.height, scale: 1 }
    });
    fs.writeFileSync(path.join(artifactDir, 'proof_footer_desktop.png'), Buffer.from(shotFooter.data, 'base64'));
  }

  // 5. Admissions page ("Apply for Admission")
  await send('Page.navigate', { url: `http://localhost:${PORT}/admissions` });
  await new Promise(r => setTimeout(r, 1200));
  const shotAdmissions = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
  });
  fs.writeFileSync(path.join(artifactDir, 'proof_admissions_desktop.png'), Buffer.from(shotAdmissions.data, 'base64'));

  console.log('SUCCESS: All proof screenshots captured!');
  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
});

