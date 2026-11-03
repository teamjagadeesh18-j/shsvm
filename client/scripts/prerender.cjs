const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4173;
const CDP_PORT = 9228;
const DIST_DIR = path.resolve(__dirname, '../dist');

const ROUTES = [
  '/',
  '/about',
  '/academics',
  '/admissions',
  '/campus',
  '/contact',
  '/faq',
  '/404'
];

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function startStaticServer() {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } else {
      // SPA Fallback
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Pre-render preview server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function waitForCdp(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await new Promise((resolve) => {
        http.get(`http://localhost:${CDP_PORT}/json/version`, res => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${CDP_PORT}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page') || list[0];
          if (page && page.webSocketDebuggerUrl) resolve(page.webSocketDebuggerUrl);
          else reject(new Error('No target page found'));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function prerender() {
  const startTime = Date.now();
  console.log('--- Starting Static HTML Pre-Rendering ---');

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist directory does not exist. Run "vite build" first.');
  }

  const server = await startStaticServer();

  console.log('Spawning headless Chrome for DOM pre-rendering...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--user-data-dir=C:\\tmp\\chrome_prerender_prof',
    'about:blank'
  ]);

  try {
    const ready = await waitForCdp();
    if (!ready) throw new Error('Chrome failed to start');

    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
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
    await send('Runtime.enable');

    for (const route of ROUTES) {
      const pageUrl = `http://localhost:${PORT}${route}`;
      console.log(`Pre-rendering route: ${route} ...`);
      await send('Page.navigate', { url: pageUrl });

      // Wait for React code-splitting Suspense & Helmet to hydrate & render
      await new Promise(r => setTimeout(r, 1000));

      const domResult = await send('Runtime.evaluate', {
        expression: 'document.documentElement.outerHTML',
        returnByValue: true
      });

      const fullHtml = '<!doctype html>\n' + domResult.result.value;

      // Determine target path
      let outPath;
      if (route === '/') {
        outPath = path.join(DIST_DIR, 'index.html');
      } else if (route === '/404') {
        outPath = path.join(DIST_DIR, '404.html');
        const dir404 = path.join(DIST_DIR, '404');
        if (!fs.existsSync(dir404)) fs.mkdirSync(dir404, { recursive: true });
        fs.writeFileSync(path.join(dir404, 'index.html'), fullHtml, 'utf8');
      } else {
        const routeDir = path.join(DIST_DIR, route.slice(1));
        if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, { recursive: true });
        outPath = path.join(routeDir, 'index.html');
      }

      fs.writeFileSync(outPath, fullHtml, 'utf8');
      const sizeKb = (Buffer.byteLength(fullHtml, 'utf8') / 1024).toFixed(1);
      console.log(`  ✓ Written ${outPath} (${sizeKb} KB)`);
    }

    ws.close();
  } finally {
    chrome.kill();
    server.close();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`--- Pre-rendering complete in ${duration}s ---`);
}

prerender().catch(err => {
  console.error('Pre-rendering failed:', err);
  process.exit(1);
});

