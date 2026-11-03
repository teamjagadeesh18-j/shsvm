const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_verify_academics_full',
    'http://localhost:5173/academics'
  ]);

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) break;
    } catch {}
  }

  const listRes = await fetch('http://127.0.0.1:9222/json/list');
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

  // Desktop viewport
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/academics' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Top section: Hero + 4 photos
  const shotTop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_academics_4photos.png'), Buffer.from(shotTop.data, 'base64'));
  console.log('Saved proof_academics_4photos.png');

  // 2. Scroll to Three Schooling Stages
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.programs-grid');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotStages = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_academics_stages_designed.png'), Buffer.from(shotStages.data, 'base64'));
  console.log('Saved proof_academics_stages_designed.png');

  // 3. Scroll to Daily School Schedule
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.alternating-rows-list');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotSchedule = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_academics_schedule_designed.png'), Buffer.from(shotSchedule.data, 'base64'));
  console.log('Saved proof_academics_schedule_designed.png');

  // 4. Mobile check (390px)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:5173/academics' });
  await new Promise(r => setTimeout(r, 2000));
  const evalRes = await send('Runtime.evaluate', {
    expression: `({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    })`,
    returnByValue: true
  });
  console.log('Mobile overflow check:', evalRes.result.value);

  const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_academics_mobile_4photos.png'), Buffer.from(shotMobile.data, 'base64'));
  console.log('Saved proof_academics_mobile_4photos.png');

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
