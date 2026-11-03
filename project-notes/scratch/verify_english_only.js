import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(url, (r) => {
          resolve(r.statusCode);
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      if (res >= 200 && res < 500) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function getCdpSession() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget) throw new Error('No page target found');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  const listeners = [];

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
    } else if (msg.method) {
      listeners.forEach(l => l(msg));
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  function addListener(fn) {
    listeners.push(fn);
  }

  async function close() {
    ws.close();
  }

  return { send, addListener, close, targetId: pageTarget.id };
}

async function run() {
  const outDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330\\scratch\\proof';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('1. Starting Vite dev server...');
  const viteProc = spawn('npm.cmd', ['--prefix', 'client', 'run', 'dev', '--', '--port', '5173', '--host'], {
    stdio: 'pipe',
    shell: true
  });

  viteProc.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('http')) console.log('[Vite stdout]:', s.trim());
  });
  viteProc.stderr.on('data', (d) => console.error('[Vite stderr]:', d.toString()));

  await waitForServer('http://localhost:5173/');
  console.log('Vite dev server is ready on http://localhost:5173');

  console.log('2. Starting headless Chrome...');
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_qa_prof',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const session = await getCdpSession();
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('Log.enable');

  const consoleErrors = [];
  const consoleWarnings = [];

  session.addListener((msg) => {
    if (msg.method === 'Runtime.consoleAPICalled') {
      const { type, args } = msg.params;
      const text = args.map(a => a.value || a.description || '').join(' ');
      if (type === 'error') consoleErrors.push(`[Console Error]: ${text}`);
      if (type === 'warning') consoleWarnings.push(`[Console Warn]: ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(`[Exception]: ${msg.params.exceptionDetails?.text} ${msg.params.exceptionDetails?.exception?.description || ''}`);
    }
  });

  // TEST 1: Header at 1440px
  console.log('\n3. Testing Header at 1440px...');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await session.send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1500));

  const header1440 = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.lang-toggle-btn');
      const actions = document.querySelector('.header-actions');
      const navLinks = Array.from(document.querySelectorAll('.nav-desktop .nav-link')).map(a => a.innerText);
      const applyBtn = document.querySelector('.header-actions .btn');
      const rect = actions?.getBoundingClientRect();
      return {
        hasLangToggle: !!toggle,
        actionsWidth: rect?.width,
        navCount: navLinks.length,
        navLinks,
        applyBtnText: applyBtn?.innerText
      };
    })()`,
    returnByValue: true
  });
  console.log('Header 1440px Layout Info:', header1440.result.value);

  // Capture Header at 1440px screenshot
  const ss1440 = await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1440, height: 180, scale: 1 }
  });
  const ss1440Path = `${outDir}\\header_1440_no_toggle.png`;
  fs.writeFileSync(ss1440Path, Buffer.from(ss1440.data, 'base64'));
  console.log('Saved screenshot:', ss1440Path);

  // TEST 2: Header at 360px
  console.log('\n4. Testing Header at 360px...');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 740,
    deviceScaleFactor: 1,
    mobile: true
  });

  await session.send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1200));

  const header360 = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.lang-toggle-btn');
      const hamburger = document.querySelector('.hamburger-btn');
      const applyBtn = document.querySelector('.header-actions .btn-apply');
      return {
        hasLangToggle: !!toggle,
        hasHamburger: !!hamburger,
        hasApplyBtn: !!applyBtn
      };
    })()`,
    returnByValue: true
  });
  console.log('Header 360px Info:', header360.result.value);

  const ss360Header = await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 360, height: 120, scale: 1 }
  });
  const ss360HeaderPath = `${outDir}\\header_360_no_toggle.png`;
  fs.writeFileSync(ss360HeaderPath, Buffer.from(ss360Header.data, 'base64'));
  console.log('Saved screenshot:', ss360HeaderPath);

  // TEST 3: Mobile Drawer at 360px
  console.log('\n5. Testing Mobile Drawer at 360px...');
  await session.send('Runtime.evaluate', {
    expression: `document.querySelector('.hamburger-btn')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  const drawer360 = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const drawer = document.querySelector('.mobile-drawer.open');
      const toggle = drawer?.querySelector('.lang-toggle-btn');
      const links = Array.from(drawer?.querySelectorAll('.drawer-link') || []).map(a => a.innerText);
      const closeBtn = drawer?.querySelector('.drawer-close-btn');
      return {
        drawerIsOpen: !!drawer,
        hasLangToggleInDrawer: !!toggle,
        linkCount: links.length,
        links: links.slice(0, 5),
        hasCloseBtn: !!closeBtn
      };
    })()`,
    returnByValue: true
  });
  console.log('Drawer 360px Info:', drawer360.result.value);

  const ssDrawer = await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 360, height: 740, scale: 1 }
  });
  const ssDrawerPath = `${outDir}\\drawer_360_no_toggle.png`;
  fs.writeFileSync(ssDrawerPath, Buffer.from(ssDrawer.data, 'base64'));
  console.log('Saved screenshot:', ssDrawerPath);

  // TEST 4: Load all routes and check for console errors
  console.log('\n6. Checking console errors across all 15 routes in npm run dev...');
  const routes = [
    '/',
    '/about',
    '/academics',
    '/admissions',
    '/campus',
    '/faculty',
    '/fees',
    '/gallery',
    '/news',
    '/portal',
    '/student-life',
    '/alumni',
    '/careers',
    '/contact',
    '/non-existent-page'
  ];

  for (const r of routes) {
    await session.send('Page.navigate', { url: `http://localhost:5173${r}` });
    await new Promise(res => setTimeout(res, 500));
  }

  console.log('\n--- CONSOLE ERRORS & WARNINGS SUMMARY ---');
  console.log(`Total Errors: ${consoleErrors.length}`);
  console.log(`Total Warnings: ${consoleWarnings.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
  if (consoleWarnings.length > 0) {
    console.log('Warnings:', consoleWarnings);
  }

  // Cleanup
  console.log('\n7. Cleaning up processes...');
  await session.close();
  chromeProc.kill('SIGKILL');
  viteProc.kill('SIGKILL');
  console.log('All verification tasks finished successfully!');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

