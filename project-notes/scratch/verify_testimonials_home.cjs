const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:\\tmp\\chrome_verify_testimonials_home',
    'http://localhost:5173/'
  ]);

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      if (res.ok) break;
    } catch {}
  }

  const listRes = await fetch('http://127.0.0.1:9225/json/list');
  const targets = await listRes.json();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id).resolve(msg.result);
      callbacks.delete(msg.id);
    }
  };
  const send = (m, p = {}) => new Promise(res => {
    const mid = id++;
    callbacks.set(mid, { resolve: res });
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  await send('Page.enable');
  const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

  // Desktop Home
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for lazy page to load and element to exist
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('.testimonials-section-root')`,
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) {
      console.log('Found .testimonials-section-root on Home page at iteration', i);
      break;
    }
  }

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.testimonials-section-root');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const shotHome = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_home_testimonials_desktop.png'), Buffer.from(shotHome.data, 'base64'));
  console.log('Saved proof_home_testimonials_desktop.png');

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

