const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9246;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

const pages = [
  { name: 'about', url: 'http://localhost:5173/about' },
  { name: 'academics', url: 'http://localhost:5173/academics' },
  { name: 'admissions', url: 'http://localhost:5173/admissions' },
  { name: 'contact', url: 'http://localhost:5173/contact' }
];

const topWidths = [1440, 1024, 768, 430, 390, 360, 320];
const heroWidths = [1920, 1440, 1280, 1024, 768, 430, 390, 360, 320];

(async () => {
  const userDataDir = path.join(os.tmpdir(), 'chrome_verify_' + Date.now());
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
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
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome failed to start');

    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
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
    await send('DOM.enable');

    console.log('--- 1. Capturing After Top Screenshots (No Breadcrumbs) ---');
    const layoutReport = {};

    for (const p of pages) {
      layoutReport[p.name] = {};
      for (const w of topWidths) {
        const height = w > 768 ? 900 : 800;
        await send('Emulation.setDeviceMetricsOverride', {
          width: w,
          height: height,
          deviceScaleFactor: 1,
          mobile: w <= 768
        });

        await send('Page.navigate', { url: p.url });
        await new Promise(r => setTimeout(r, 800));

        const evalRes = await send('Runtime.evaluate', {
          expression: `(() => {
            try {
              const clientW = document.documentElement.clientWidth;
              const scrollW = document.documentElement.scrollWidth;
              const breadcrumbs = document.querySelector('.breadcrumbs-nav, .breadcrumbs-list, .breadcrumb-item');
              const logo = document.querySelector('.header-logo');
              const logoRect = logo ? logo.getBoundingClientRect() : null;
              
              let logoOverlapped = false;
              if (logoRect && logoRect.width > 0) {
                const el = document.elementFromPoint(logoRect.left + logoRect.width / 2, logoRect.top + logoRect.height / 2);
                logoOverlapped = el && !logo.contains(el) && !el.contains(logo);
              }

              const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
              let hasBreadcrumbSchema = false;
              let schemaName = '';
              for (const s of scripts) {
                try {
                  const j = JSON.parse(s.textContent);
                  if (j['@type'] === 'BreadcrumbList') {
                    hasBreadcrumbSchema = true;
                    schemaName = j.itemListElement?.[1]?.name || '';
                  }
                } catch {}
              }

              return {
                clientW,
                scrollW,
                hasVisibleBreadcrumb: !!breadcrumbs,
                logoOverlapped: !!logoOverlapped,
                hasBreadcrumbSchema,
                schemaName
              };
            } catch (err) {
              return { error: err.message };
            }
          })()`,
          returnByValue: true
        });

        const val = evalRes.result?.value || { error: 'no value' };
        layoutReport[p.name][w] = val;

        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: 0,
            y: 0,
            width: w,
            height: Math.min(height, 500),
            scale: 1
          }
        });

        const outName = `proof_after_top_${p.name}_${w}.png`;
        fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved ${outName} - scrollW: ${val.scrollW}, clientW: ${val.clientW}, visibleBreadcrumb: ${val.hasVisibleBreadcrumb}, schema: ${val.hasBreadcrumbSchema}`);
      }
    }

    console.log('--- 2. Capturing About Hero at All Viewports (Open state) ---');
    for (const w of heroWidths) {
      const height = w > 768 ? 900 : 800;
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: height,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await send('Page.navigate', { url: 'http://localhost:5173/about' });
      await new Promise(r => setTimeout(r, 900));

      const heroClipRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const hero = document.querySelector('.about-hero-section');
          if (!hero) return null;
          const rect = hero.getBoundingClientRect();
          return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
        })()`,
        returnByValue: true
      });

      const clip = heroClipRes.result?.value;
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: clip ? {
          x: Math.max(0, clip.x),
          y: Math.max(0, clip.y),
          width: Math.min(w, clip.width),
          height: clip.height,
          scale: 1
        } : undefined
      });

      const outName = `proof_about_hero_open_${w}.png`;
      fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved ${outName}`);
    }

    console.log('--- 3. Capturing Mocked Closed States (Sunday & Saturday Evening) ---');
    for (const scenario of [
      { name: 'sunday', dateStr: '2026-11-08T11:00:00+05:30', desc: 'Sunday Closed' },
      { name: 'sat_evening', dateStr: '2026-11-07T18:00:00+05:30', desc: 'Saturday Evening Closed' }
    ]) {
      await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(() => {
          const mockTime = new Date('${scenario.dateStr}').getTime();
          const OrigDate = Date;
          window.Date = class extends OrigDate {
            constructor(...args) {
              if (args.length === 0) return new OrigDate(mockTime);
              return new OrigDate(...args);
            }
            static now() { return mockTime; }
          };
        })()`
      });

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Page.navigate', { url: 'http://localhost:5173/about' });
      await new Promise(r => setTimeout(r, 900));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const outName = `proof_about_hero_closed_${scenario.name}.png`;
      fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved ${outName}`);
    }

    console.log('--- 4. Capturing Prefers-Reduced-Motion ---');
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:5173/about' });
    await new Promise(r => setTimeout(r, 800));

    const reducedShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'proof_about_hero_reduced_motion.png'), Buffer.from(reducedShot.result.data, 'base64'));
    console.log('Saved proof_about_hero_reduced_motion.png');

    console.log('--- 5. Capturing Frame Sequence for Animations ---');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
    await send('Page.navigate', { url: 'http://localhost:5173/about' });
    for (let frame = 1; frame <= 4; frame++) {
      await new Promise(r => setTimeout(r, 350));
      const fShot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1440, height: 750, scale: 1 }
      });
      fs.writeFileSync(path.join(artifactDir, `proof_frame_sequence_hero_0${frame}.png`), Buffer.from(fShot.result.data, 'base64'));
      console.log(`Saved proof_frame_sequence_hero_0${frame}.png`);
    }

    console.log('--- 6. Running Geometric Boundary & Overlap Checks at All Widths ---');
    const geoReport = [];
    for (const w of heroWidths) {
      const height = w > 768 ? 900 : 800;
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: height,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await send('Page.navigate', { url: 'http://localhost:5173/about' });
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

          const photoRect = photoCard?.getBoundingClientRect() || {};
          const boardChipRect = chipBoard?.getBoundingClientRect() || {};
          const estChipRect = chipEst?.getBoundingClientRect() || {};
          const statusRect = statusChip?.getBoundingClientRect() || {};
          const badgeRect = badge?.getBoundingClientRect() || {};
          const titleRect = title?.getBoundingClientRect() || {};
          const actionsRect = actions?.getBoundingClientRect() || {};

          // In photo, name board is right side: left 58% to 98%, top 58% to 85%
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
            badgePastRight: (badgeRect.right || 0) > (clientW - 1),
            overlapBoardName: Math.round(overlapBoardName),
            overlapEstTitle: Math.round(overlapEstTitle),
            overlapBoardActions: Math.round(overlapBoardActions)
          };
        })()`,
        returnByValue: true
      });

      geoReport.push(wGeoRes.result?.value);
      console.log(`Width ${w}px: scrollW=${wGeoRes.result?.value.scrollW}, clientW=${wGeoRes.result?.value.clientW}, overflow=${wGeoRes.result?.value.overflow}, nameBoardOverlap=${wGeoRes.result?.value.overlapBoardName}px²`);
    }

    fs.writeFileSync(path.join(artifactDir, 'verification_metrics.json'), JSON.stringify({
      layoutReport,
      geoReport
    }, null, 2));

    console.log('Metrics and proofs complete!');
    ws.close();
  } finally {
    cp.kill();
  }
})();
