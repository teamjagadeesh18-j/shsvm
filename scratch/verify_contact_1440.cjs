const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--user-data-dir=C:\\tmp\\chrome_verify_contact_1440',
    'http://localhost:5173/contact'
  ]);

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9227/json/version');
      if (res.ok) break;
    } catch {}
  }

  const listRes = await fetch('http://127.0.0.1:9227/json/list');
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

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/contact' });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    const chk = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('#campus-location')`,
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) {
      console.log('Found #campus-location on Contact page');
      break;
    }
  }

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#campus-location');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_contact_location_1440.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved proof_contact_location_1440.png');

  // Hover state
  await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.location-map-link-card');
      if (card) {
        card.style.transform = 'translateY(-4px)';
        card.style.borderColor = 'var(--color-accent)';
        card.style.outline = '2px solid var(--color-accent)';
        const pill = card.querySelector('.location-pill-open');
        if (pill) {
          pill.style.background = '#ffffff';
          pill.style.color = '#000000';
        }
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 400));
  const shotHover = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_contact_location_hover_1440.png'), Buffer.from(shotHover.data, 'base64'));
  console.log('Saved proof_contact_location_hover_1440.png');

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

