const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;
const OUT_DIR = path.resolve('C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330');

async function waitForCdp(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await new Promise((resolve) => {
        http.get(`http://localhost:${PORT}/json/version`, res => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  return false;
}

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page') || list[0];
          if (page && page.webSocketDebuggerUrl) {
            resolve(page.webSocketDebuggerUrl);
          } else {
            reject(new Error('No target page found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\tmp\\chrome_verify_fixes3',
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to Principal section
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('principal-message');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    // Wait for reveal animations to finish
    await new Promise(r => setTimeout(r, 1500));

    const shotPrincipal = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'proof_principal_school_image.png'), Buffer.from(shotPrincipal.data, 'base64'));
    console.log('Saved viewport shot of Principal section');

    // Scroll to Location section
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('home-location') || document.querySelector('.location-section');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    // Wait for reveal animations to finish
    await new Promise(r => setTimeout(r, 1500));

    const shotLocation = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'proof_location_map_image.png'), Buffer.from(shotLocation.data, 'base64'));
    console.log('Saved viewport shot of Location section');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
