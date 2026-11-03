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

const PORT = 5212;
server.listen(PORT, async () => {
  console.log(`Diagnostic server running on http://localhost:${PORT}`);
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_diag_part',
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

  const viewports = [1440, 1024, 768, 390];
  const diagnosticResults = {};

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
        const body = document.body;
        const appLayout = document.querySelector('.app-layout');
        const programs = document.querySelector('.programs-section') || document.querySelector('[class*="program"]');
        const marquee = document.querySelector('.image-marquee-section');
        const ibRoot = document.querySelector('.ib-root');

        function inspect(el, name) {
          if (!el) return { name, exists: false };
          const cs = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            name,
            exists: true,
            tagName: el.tagName,
            className: el.className,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            cssWidth: cs.width,
            maxWidth: cs.maxWidth,
            margin: cs.margin,
            padding: cs.padding,
            backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 50) + '...' : 'none',
            overflow: cs.overflow,
            overflowX: cs.overflowX,
            boxSizing: cs.boxSizing
          };
        }

        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasHorizontalScroll: docEl.scrollWidth > docEl.clientWidth,
          docEl: inspect(docEl, 'html'),
          body: inspect(body, 'body'),
          appLayout: inspect(appLayout, '.app-layout'),
          programs: inspect(programs, '.programs-section'),
          marquee: inspect(marquee, '.image-marquee-section'),
          ibRoot: inspect(ibRoot, '.ib-root')
        };
      })()`,
      returnByValue: true
    });

    diagnosticResults[w] = evalData.result.value;
  }

  console.log('DIAGNOSTIC RESULTS:\n' + JSON.stringify(diagnosticResults, null, 2));

  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
});
