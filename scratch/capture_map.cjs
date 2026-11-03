const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

async function waitForCdp(maxAttempts = 25) {
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
    await new Promise(r => setTimeout(r, 200));
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
          if (list.length > 0 && list[0].webSocketDebuggerUrl) {
            resolve(list[0].webSocketDebuggerUrl);
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

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureMap() {
  console.log('Spawning Chrome for map capture...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\tmp\\chrome_map_prof',
    '--window-size=1000,750',
    'about:blank'
  ]);

  try {
    const ready = await waitForCdp();
    if (!ready) throw new Error('Chrome failed to start');

    const wsUrl = await getWsUrl();
    const cdp = new CdpConnection(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1000,
      height: 750,
      deviceScaleFactor: 2,
      mobile: false
    });

    const mapUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=80.0248861%2C13.1416061%2C80.0508861%2C13.1656061&layer=mapnik';
    console.log('Navigating to OSM embed:', mapUrl);
    await cdp.send('Page.navigate', { url: mapUrl });
    await new Promise(r => setTimeout(r, 6000));

    // Remove any UI overlays from OSM embed if any, to keep it clean
    await cdp.send('Runtime.evaluate', {
      expression: `
        const controls = document.querySelectorAll('.leaflet-control-container, .donate-attr');
        controls.forEach(c => c.style.display = 'none');
      `
    });

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90
    });

    const outPath = path.resolve('client/public/images/map-preview.jpg');
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved map preview to:', outPath);

    cdp.close();
  } finally {
    chrome.kill();
  }
}

captureMap().catch(err => {
  console.error('Map capture error:', err);
  process.exit(1);
});
