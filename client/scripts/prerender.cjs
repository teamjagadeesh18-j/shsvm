const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 4173;
const CDP_PORT = 9228;
const DIST_DIR = path.resolve(__dirname, '../dist');
const ROUTES = ['/', '/about', '/academics', '/admissions', '/campus', '/contact', '/faq', '/privacy', '/terms', '/404'];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function findChrome() {
  const envBin = process.env.CHROME_BIN || process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envBin && fs.existsSync(envBin)) return envBin;

  const candidates = [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];
  return candidates.find(p => p && fs.existsSync(p)) || null;
}

function writeFallbackRoutes() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  for (const route of ROUTES) {
    if (route === '/') continue;
    const is404 = route === '/404';
    const outDir = path.join(DIST_DIR, is404 ? '404' : route.slice(1));
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf8');
    if (is404) fs.writeFileSync(path.join(DIST_DIR, '404.html'), indexHtml, 'utf8');
  }
  console.log('✓ SPA fallback route files generated successfully.');
}

function startStaticServer() {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
  const server = http.createServer((req, res) => {
    const filePath = path.join(DIST_DIR, req.url.split('?')[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } else {
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
          resolve(res.statusCode === 200);
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
      res.on('data', chunk => { data += chunk; });
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
  if (!fs.existsSync(DIST_DIR)) throw new Error('dist directory does not exist.');

  const chromePath = findChrome();
  if (!chromePath) {
    console.warn('⚠️ Chrome/Chromium binary not detected (Vercel/CI environment).');
    console.warn('Skipping headless pre-rendering; generating SPA route fallbacks.');
    writeFallbackRoutes();
    return;
  }

  let server;
  let chrome;
  let userDataDir;

  try {
    server = await startStaticServer();
    userDataDir = path.join(os.tmpdir(), `chrome_prerender_${Date.now()}`);
    console.log(`Spawning headless Chrome (${chromePath})...`);

    chrome = spawn(chromePath, [
      '--headless=new', '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', '--disable-gpu',
      `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${userDataDir}`, 'about:blank'
    ]);
    chrome.on('error', (err) => console.warn('Chrome process warning:', err.message));

    const ready = await waitForCdp();
    if (!ready) throw new Error('Chrome CDP failed to become ready');

    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

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

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    for (const route of ROUTES) {
      console.log(`Pre-rendering route: ${route} ...`);
      await send('Page.navigate', { url: `http://localhost:${PORT}${route}` });
      await new Promise(r => setTimeout(r, 1000));

      const domResult = await send('Runtime.evaluate', {
        expression: 'document.documentElement.outerHTML',
        returnByValue: true
      });

      const fullHtml = '<!doctype html>\n' + domResult.result.value;
      const is404 = route === '/404';
      const outDir = path.join(DIST_DIR, is404 ? '404' : route.slice(1));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), fullHtml, 'utf8');
      if (is404) fs.writeFileSync(path.join(DIST_DIR, '404.html'), fullHtml, 'utf8');
      if (route === '/') fs.writeFileSync(path.join(DIST_DIR, 'index.html'), fullHtml, 'utf8');
      console.log(`  ✓ Written ${route} (${(Buffer.byteLength(fullHtml, 'utf8') / 1024).toFixed(1)} KB)`);
    }

    ws.close();
  } catch (err) {
    console.warn('⚠️ Pre-rendering error:', err.message);
    console.warn('Falling back to SPA route distribution...');
    writeFallbackRoutes();
  } finally {
    if (chrome) try { chrome.kill(); } catch {}
    if (server) try { server.close(); } catch {}
    if (userDataDir && fs.existsSync(userDataDir)) {
      try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`--- Pre-rendering completed in ${duration}s ---`);
}

prerender().catch(err => {
  console.warn('Pre-rendering execution warning:', err.message);
  writeFallbackRoutes();
});
