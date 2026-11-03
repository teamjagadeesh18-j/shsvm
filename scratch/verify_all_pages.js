import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

function createStaticServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url.split('?')[0]);
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = path.join(distDir, 'index.html');
      }
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '::', () => resolve(server));
  });
}

async function waitForCdp(maxAttempts = 35) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await new Promise((resolve) => {
        http.get({ host: '::1', port: 9222, path: '/json/version' }, (res) => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function getCdpSession() {
  const targets = await new Promise((resolve, reject) => {
    http.get({ host: '::1', port: 9222, path: '/json/list' }, (res) => {
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

  async function close() {
    ws.close();
  }

  return { send, close };
}

async function run() {
  const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';
  const distDir = path.resolve('client/dist');
  const port = 5185;

  console.log(`Starting static server on port ${port} from ${distDir}...`);
  const server = await createStaticServer(distDir, port);
  console.log(`Static server running on port ${port}!`);

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    'about:blank'
  ]);

  try {
    const ready = await waitForCdp();
    if (!ready) throw new Error('CDP not ready');
    console.log('CDP connection established!');

    const session = await getCdpSession();
    await session.send('Page.enable');
    await session.send('Runtime.enable');
    await session.send('DOM.enable');

    const pages = [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Academics', path: '/academics' },
      { name: 'Campus', path: '/campus' },
      { name: 'Admissions', path: '/admissions' },
      { name: 'Contact', path: '/contact' }
    ];

    const viewports = [
      { label: '1440px', width: 1440, height: 900, mobile: false, dsf: 1 },
      { label: '360px', width: 360, height: 740, mobile: true, dsf: 2 }
    ];

    const results = [];

    for (const vp of viewports) {
      console.log(`\n=================== TESTING AT ${vp.label} ===================`);
      await session.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dsf,
        mobile: vp.mobile
      });

      for (const page of pages) {
        const url = `http://localhost:${port}${page.path}`;
        console.log(`Testing ${page.name} (${url}) at ${vp.label}...`);
        await session.send('Page.navigate', { url });
        await new Promise(r => setTimeout(r, 1200));

        // Check horizontal overflow & reveal elements
        const overflowCheck = await session.send('Runtime.evaluate', {
          expression: `(() => {
            return {
              windowWidth: window.innerWidth,
              docScrollWidth: document.documentElement.scrollWidth,
              hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
              revealInitCount: document.querySelectorAll('.reveal-wrapper').length,
              revealVisibleCount: document.querySelectorAll('.reveal-visible').length
            };
          })()`,
          returnByValue: true
        });

        console.log(`  Initial: scrollWidth=${overflowCheck.result.value.docScrollWidth}, windowWidth=${overflowCheck.result.value.windowWidth}, horizontalScroll=${overflowCheck.result.value.hasHorizontalScroll}`);

        // Capture Top Viewport Screenshot
        const shotTop = await session.send('Page.captureScreenshot', { format: 'png' });
        const topFileName = `page_${page.name.toLowerCase()}_top_${vp.width}.png`;
        fs.writeFileSync(path.join(artifactDir, topFileName), Buffer.from(shotTop.data, 'base64'));

        // Scroll down to trigger reveals
        await session.send('Runtime.evaluate', {
          expression: `window.scrollTo(0, 700);`
        });
        await new Promise(r => setTimeout(r, 700));

        // Check reveal triggers after scroll
        const afterScroll = await session.send('Runtime.evaluate', {
          expression: `(() => {
            return {
              revealVisibleCount: document.querySelectorAll('.reveal-visible').length,
              totalReveals: document.querySelectorAll('.reveal-wrapper').length
            };
          })()`,
          returnByValue: true
        });

        console.log(`  Scrolled 700px: ${afterScroll.result.value.revealVisibleCount} / ${afterScroll.result.value.totalReveals} elements revealed`);

        // Capture Scrolled Viewport Screenshot
        const shotScrolled = await session.send('Page.captureScreenshot', { format: 'png' });
        const scrollFileName = `page_${page.name.toLowerCase()}_scrolled_${vp.width}.png`;
        fs.writeFileSync(path.join(artifactDir, scrollFileName), Buffer.from(shotScrolled.data, 'base64'));

        results.push({
          page: page.name,
          viewport: vp.label,
          width: vp.width,
          horizontalScroll: overflowCheck.result.value.hasHorizontalScroll,
          topScreenshot: topFileName,
          scrollScreenshot: scrollFileName,
          revealsActive: `${afterScroll.result.value.revealVisibleCount} / ${afterScroll.result.value.totalReveals}`
        });
      }
    }

    await session.close();
    console.log('\n=================== VERIFICATION SUMMARY ===================');
    console.table(results);
  } finally {
    chromeProc.kill('SIGKILL');
    server.close();
  }
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
