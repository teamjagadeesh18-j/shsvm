const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--user-data-dir=C:\\tmp\\chrome_verify_testimonials',
    'http://localhost:5173/'
  ]);

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9224/json/version');
      if (res.ok) break;
    } catch {}
  }

  const listRes = await fetch('http://127.0.0.1:9224/json/list');
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

  // 1. Home Page (1440px)
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll to testimonials above footer
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.testimonials-section-root');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const shotHome = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_home_testimonials_desktop.png'), Buffer.from(shotHome.data, 'base64'));
  console.log('Saved proof_home_testimonials_desktop.png');

  // 2. Admissions Page (1440px)
  await send('Page.navigate', { url: 'http://localhost:5173/admissions' });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll to testimonials above footer
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.testimonials-section-root');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const shotAdmissions = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_admissions_testimonials_desktop.png'), Buffer.from(shotAdmissions.data, 'base64'));
  console.log('Saved proof_admissions_testimonials_desktop.png');

  // 3. Mobile View (390px)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.testimonials-section-root');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_testimonials_mobile.png'), Buffer.from(shotMobile.data, 'base64'));
  console.log('Saved proof_testimonials_mobile.png');

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

