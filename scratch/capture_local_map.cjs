const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;

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

async function capture() {
  console.log('Spawning Chrome for local map capture...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\tmp\\chrome_map_prof2',
    '--allow-file-access-from-files',
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 800,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false
    });

    const localUrl = 'file:///' + path.resolve(__dirname, 'stitch_map.html').replace(/\\/g, '/');
    console.log('Navigating to local HTML:', localUrl);
    await send('Page.navigate', { url: localUrl });

    // Wait 1.5 seconds for images to draw onto canvas
    await new Promise(r => setTimeout(r, 1500));

    const shot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 85
    });

    const outPath = path.resolve('client/public/images/map-preview.jpg');
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Successfully wrote map to:', outPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});

