import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(url, (r) => resolve(r.statusCode));
        req.on('error', reject);
        req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (res >= 200 && res < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} not ready`);
}

async function waitForCdp(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await new Promise((resolve) => {
        http.get('http://localhost:9222/json/version', (res) => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function getCdpSession() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
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
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
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
  async function close() { ws.close(); }
  return { send, close };
}

async function main() {
  const outDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330\\scratch\\proof';

  const server = spawn('npm.cmd', ['--prefix', 'client', 'run', 'preview', '--', '--port', '5173', '--host'], {
    stdio: 'pipe',
    shell: true
  });
  await waitForServer('http://localhost:5173/');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_qa_prof',
    'about:blank'
  ]);
  await waitForCdp();

  const session = await getCdpSession();
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await session.send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to why choose us section so it is centered in viewport
  await session.send('Runtime.evaluate', {
    expression: `(() => {
      const sec = document.querySelector('.why-choose-section');
      sec.scrollIntoView({ block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Capture viewport screenshot showing Why Choose Us
  const ssViewport = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}\\why_choose_us_section.png`, Buffer.from(ssViewport.data, 'base64'));

  // Now hover over Row 2 (White row)
  const r2Box = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const r2 = document.querySelectorAll('.alt-row-item')[1];
      const rect = r2.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true
  });

  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: Math.round(r2Box.result.value.x),
    y: Math.round(r2Box.result.value.y)
  });
  await new Promise(r => setTimeout(r, 400));

  const ssHover = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}\\why_choose_us_hover_row2.png`, Buffer.from(ssHover.data, 'base64'));

  await session.close();
  chrome.kill();
  server.kill();
  console.log('Screenshots saved successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

