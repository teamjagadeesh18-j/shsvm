const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const galleryDir = path.resolve('Photo Gallery of Shree Hari Saradha Vidhayalaiya Matriculation School in Pakkam - BestSchools in Chennai - Justdial');

const server = http.createServer((req, res) => {
  const file = path.join(galleryDir, decodeURIComponent(req.url.slice(1)));
  if (fs.existsSync(file)) {
    const ext = path.extname(file).toLowerCase();
    const mime = ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(file));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5244, async () => {
  console.log('Image server on 5244');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_webp_conv',
    'about:blank'
  ]);

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
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

  const files = fs.readdirSync(galleryDir);
  console.log('Files to process:', files.length);

  const evalRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const files = ${JSON.stringify(files)};
      const results = {};

      for (const f of files) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // don't crash
          img.src = 'http://localhost:5244/' + encodeURIComponent(f);
        });

        if (!img.width || !img.height) {
          results[f] = { success: false, reason: 'failed to load' };
          continue;
        }

        // Target 4:3 aspect ratio with optimal resolution (e.g. 1200x900)
        const targetW = 1200;
        const targetH = 900;
        const targetRatio = 4 / 3;
        const srcRatio = img.width / img.height;

        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > targetRatio) {
          // Wider than 4:3 -> crop left and right
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          // Taller than 4:3 -> crop top and bottom (weighted towards upper third)
          sh = img.width / targetRatio;
          sy = (img.height - sh) * 0.25;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Gentle quality enhancement: boost clarity and contrast subtly
        ctx.filter = 'contrast(1.03) saturate(1.04)';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

        const dataUrl = canvas.toDataURL('image/webp', 0.90);
        results[f] = {
          success: true,
          origW: img.width,
          origH: img.height,
          dataUrlLength: dataUrl.length,
          dataUrl: dataUrl
        };
      }
      return results;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const converted = evalRes.result.value;
  const outDir = path.resolve('client/public/images/gallery');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const [origName, res] of Object.entries(converted)) {
    if (res.success && res.dataUrl) {
      const base64Data = res.dataUrl.replace(/^data:image\/webp;base64,/, '');
      const baseName = path.parse(origName).name
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase()
        .slice(0, 30);
      const outFileName = `gallery-${count + 1}-${baseName}.webp`;
      fs.writeFileSync(path.join(outDir, outFileName), Buffer.from(base64Data, 'base64'));
      console.log(`Saved ${outFileName} (${res.origW}x${res.origH} -> 1200x900 webp)`);
      count++;
    } else {
      console.warn(`Failed: ${origName}`, res.reason);
    }
  }

  console.log(`Finished converting ${count} images to high-quality 4:3 WebP!`);

  ws.close();
  cp.kill();
  server.close();
  process.exit(0);
});
