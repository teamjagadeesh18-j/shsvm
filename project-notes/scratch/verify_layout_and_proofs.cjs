const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

const PORT = 5233;
server.listen(PORT, async () => {
  console.log(`Verification server running on http://localhost:${PORT}`);
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_verify_proofs',
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
    console.error('CDP failed');
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
  const viewports = [1440, 1280, 1024, 768, 390];
  const measurements = {};

  for (const w of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 900,
      deviceScaleFactor: 1,
      mobile: w <= 768
    });
    await send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await new Promise(r => setTimeout(r, 1200));

    const evalData = await send('Runtime.evaluate', {
      expression: `(() => {
        const docEl = document.documentElement;
        const header = document.querySelector('.header-container');
        const levels = document.querySelector('.programs-grid');
        const darkPanels = Array.from(document.querySelectorAll('.dark-panel'));
        const fullBleedSecs = Array.from(document.querySelectorAll('.full-bleed-section, .programs-section, .image-marquee-section, .site-footer'));

        function box(el) {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width)
          };
        }

        return {
          viewport: ${w},
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasHorizontalScroll: docEl.scrollWidth > docEl.clientWidth,
          header: box(header),
          levels: box(levels),
          darkPanels: darkPanels.map((p, i) => ({ index: i, ...box(p) })),
          fullBleedSecs: fullBleedSecs.map((s, i) => ({
            index: i,
            className: s.className,
            ...box(s)
          }))
        };
      })()`,
      returnByValue: true
    });

    measurements[w] = evalData.result.value;
  }

  fs.writeFileSync('scratch/site_alignment_measurements.json', JSON.stringify(measurements, null, 2));
  console.log('Alignment measurements saved!');

  // Capture Section Junction & Dark Panel proof at 1440px
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll to junction of Programs, ImageMarquee, and Holistic Panel
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.programs-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const junctionShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_theme_junction_1440.png'), Buffer.from(junctionShot.data, 'base64'));
  console.log('Saved proof_theme_junction_1440.png');

  // Scroll to top of Holistic Dark Panel
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#holistic');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const panelShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_dark_panel_top_1440.png'), Buffer.from(panelShot.data, 'base64'));
  console.log('Saved proof_dark_panel_top_1440.png');

  // Capture Full Page Screenshots of Home at 1440px and 390px
  const fullHome1440 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(artifactDir, 'proof_home_full_1440.png'), Buffer.from(fullHome1440.data, 'base64'));
  console.log('Saved proof_home_full_1440.png');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1200));
  const fullHome390 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(artifactDir, 'proof_home_full_390.png'), Buffer.from(fullHome390.data, 'base64'));
  console.log('Saved proof_home_full_390.png');

  // Capture Full Page Screenshots of About at 1440px and 390px
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
  await new Promise(r => setTimeout(r, 1200));
  const fullAbout1440 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(artifactDir, 'proof_about_full_1440.png'), Buffer.from(fullAbout1440.data, 'base64'));
  console.log('Saved proof_about_full_1440.png');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
  await new Promise(r => setTimeout(r, 1200));
  const fullAbout390 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(artifactDir, 'proof_about_full_390.png'), Buffer.from(fullAbout390.data, 'base64'));
  console.log('Saved proof_about_full_390.png');

  ws.close();
  chromeProc.kill();
  server.close();
  console.log('All proofs captured successfully!');
  process.exit(0);
});
