const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4174;
const CDP_PORT = 9248;
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';
const heroWidths = [1920, 1440, 1280, 1024, 768, 430, 390, 360, 320];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

function startServer() {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    }
  });

  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

(async () => {
  const server = await startServer();
  const userDataDir = path.join(os.tmpdir(), 'chrome_geo_' + Date.now());
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome failed to start');

    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTargets = await listRes.json();
    const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    await new Promise(r => ws.onopen = r);

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    function send(method, params = {}) {
      return new Promise(r => {
        const msgId = id++;
        callbacks.set(msgId, r);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    const results = [];
    for (const w of heroWidths) {
      const height = w > 768 ? 900 : 800;
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: height,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await send('Page.navigate', { url: `http://localhost:${PORT}/about` });
      await new Promise(r => setTimeout(r, 800));

      const wGeoRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const clientW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const photoCard = document.querySelector('.about-photo-card');
          const chipEst = document.querySelector('.chip-est');
          const chipBoard = document.querySelector('.chip-board');
          const statusChip = document.querySelector('.about-status-chip-wrapper');
          const badge = document.querySelector('.about-motto-badge');
          const title = document.querySelector('.about-hero-title');
          const actions = document.querySelector('.about-hero-actions');

          const photoRect = photoCard ? photoCard.getBoundingClientRect() : {};
          const boardChipRect = chipBoard ? chipBoard.getBoundingClientRect() : {};
          const estChipRect = chipEst ? chipEst.getBoundingClientRect() : {};
          const statusRect = statusChip ? statusChip.getBoundingClientRect() : {};
          const badgeRect = badge ? badge.getBoundingClientRect() : {};
          const titleRect = title ? title.getBoundingClientRect() : {};
          const actionsRect = actions ? actions.getBoundingClientRect() : {};

          // School name board is in right portion of the photo
          const nameBoard = {
            left: (photoRect.left || 0) + (photoRect.width || 0) * 0.58,
            right: (photoRect.left || 0) + (photoRect.width || 0) * 0.98,
            top: (photoRect.top || 0) + (photoRect.height || 0) * 0.58,
            bottom: (photoRect.top || 0) + (photoRect.height || 0) * 0.85
          };

          function getOverlapArea(r1, r2) {
            if (!r1.right || !r2.right) return 0;
            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            return xOverlap * yOverlap;
          }

          const overlapBoardName = getOverlapArea(boardChipRect, nameBoard);
          const overlapEstTitle = getOverlapArea(estChipRect, titleRect);
          const overlapBoardActions = getOverlapArea(boardChipRect, actionsRect);

          return {
            width: ${w},
            scrollW,
            clientW,
            overflow: scrollW > clientW,
            badgePastRight: (badgeRect.right || 0) > clientW,
            pastLeft: (estChipRect.left || 0) < 0,
            overlapBoardName: Math.round(overlapBoardName),
            overlapEstTitle: Math.round(overlapEstTitle),
            overlapBoardActions: Math.round(overlapBoardActions)
          };
        })()`,
        returnByValue: true
      });

      const res = wGeoRes.result?.result?.value || { error: 'failed', details: wGeoRes.result?.exceptionDetails };
      results.push(res);
      console.log(`Width ${w}px: scrollW=${res.scrollW}, clientW=${res.clientW}, overflow=${res.overflow}, badgePastRight=${res.badgePastRight}, pastLeft=${res.pastLeft}, nameBoardOverlap=${res.overlapBoardName}px², titleOverlap=${res.overlapEstTitle}px², actionsOverlap=${res.overlapBoardActions}px²`);
    }

    fs.writeFileSync(path.join(artifactDir, 'geo_check_report.json'), JSON.stringify(results, null, 2));
    console.log('Saved geo_check_report.json');
    ws.close();
  } finally {
    cp.kill();
    server.close();
  }
})();
