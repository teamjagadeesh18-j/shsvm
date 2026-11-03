const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9301;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_diag_' + Date.now();
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

    async function evaluate(expr) {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return (res.result && res.result.result) ? res.result.result.value : null;
    }

    // Load at 1440x900
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    // Wait only 100ms
    await new Promise(r => setTimeout(r, 200));

    // Diagnosis 1: Initial state immediately on load (scrollY = 0)
    const initialDiag = await evaluate(`
      (() => {
        const cal = document.querySelector('.calendar-widget');
        const results = document.querySelector('.results-card');
        const beyond = document.querySelector('.beyond-card');
        const panel = document.querySelector('#campus-life');

        return {
          scrollY: window.scrollY,
          panelTop: panel ? panel.getBoundingClientRect().top : null,
          calHasAnimated: cal ? cal.classList.contains('is-animated') : null,
          resultsHasAnimated: results ? results.classList.contains('is-animated') : null,
          beyondHasAnimated: beyond ? beyond.classList.contains('is-animated') : null,
          prefersReducedMotionMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
      })()
    `);
    console.log('=== INITIAL DIAGNOSIS AT SCROLLY=0 ===', initialDiag);

    // Diagnosis 2: Why white strip on right edge?
    const edgeDiag = await evaluate(`
      (() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const offenders = [];
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > docW + 1) {
            offenders.push({
              tag: el.tagName,
              className: el.className,
              id: el.id,
              right: r.right,
              docW
            });
          }
        });
        return { docW, scrollW, hasOverflow: scrollW > docW, offenders: offenders.slice(0, 10) };
      })()
    `);
    console.log('=== EDGE & OVERFLOW DIAGNOSIS ===', edgeDiag);

    // Diagnosis 3: Card 1, 2, 3 animation frames at 0, 300, 600, 1200ms
    // Scroll cards into view now
    console.log('Scrolling cards into view...');
    await evaluate(`
      const grid = document.querySelector('.dashboard-cards-grid');
      if (grid) grid.scrollIntoView({ block: 'center' });
    `);

    // Let's check status right after scroll
    const afterScrollDiag = await evaluate(`
      (() => {
        const cal = document.querySelector('.calendar-widget');
        const results = document.querySelector('.results-card');
        const beyond = document.querySelector('.beyond-card');
        return {
          calHasAnimated: cal ? cal.classList.contains('is-animated') : null,
          resultsHasAnimated: results ? results.classList.contains('is-animated') : null,
          beyondHasAnimated: beyond ? beyond.classList.contains('is-animated') : null,
        };
      })()
    `);
    console.log('=== IMMEDIATELY AFTER SCROLL ===', afterScrollDiag);

    // Frame capture helper for step 0
    async function captureGridClip(filename) {
      const bounds = await evaluate(`
        (() => {
          const el = document.querySelector('.dashboard-cards-grid');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(r.left + window.scrollX - 8)),
            y: Math.max(0, Math.floor(r.top + window.scrollY - 8)),
            width: Math.ceil(r.width + 16),
            height: Math.ceil(r.height + 16)
          };
        })()
      `);
      if (!bounds) return;
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { ...bounds, scale: 1 }
      });
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved frame:', filename);
    }

    // Now reload and test precise timing frames from entrance
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 600));

    // Scroll to panel and capture at 0ms, 300ms, 600ms, 1200ms
    await evaluate(`
      const grid = document.querySelector('.dashboard-cards-grid');
      if (grid) grid.scrollIntoView({ block: 'center' });
    `);
    await captureGridClip('proof_step0_frame_0ms.png');
    await new Promise(r => setTimeout(r, 300));
    await captureGridClip('proof_step0_frame_300ms.png');
    await new Promise(r => setTimeout(r, 300)); // now 600ms
    await captureGridClip('proof_step0_frame_600ms.png');
    await new Promise(r => setTimeout(r, 600)); // now 1200ms
    await captureGridClip('proof_step0_frame_1200ms.png');

    // Also get computed styles of elements across frames
    const computedProps = await evaluate(`
      (() => {
        const calCells = Array.from(document.querySelectorAll('.cal-cell:not(.cal-blank)')).slice(0, 3);
        const year = document.querySelector('.stat-val-established');
        const middleBar = document.querySelector('.level-bar-middle');
        const secondaryBar = document.querySelector('.level-bar-secondary');
        const beyondItems = Array.from(document.querySelectorAll('.beyond-item'));

        return {
          calCells: calCells.map(c => ({ opacity: getComputedStyle(c).opacity, transform: getComputedStyle(c).transform })),
          establishedYearText: year ? year.innerText : null,
          middleBarTransform: middleBar ? getComputedStyle(middleBar).transform : null,
          secondaryBarTransform: secondaryBar ? getComputedStyle(secondaryBar).transform : null,
          beyondItem0: beyondItems[0] ? { opacity: getComputedStyle(beyondItems[0]).opacity, transform: getComputedStyle(beyondItems[0]).transform } : null,
          beyondItem3: beyondItems[3] ? { opacity: getComputedStyle(beyondItems[3]).opacity, transform: getComputedStyle(beyondItems[3]).transform } : null
        };
      })()
    `);
    console.log('=== COMPUTED STYLES AT 1200MS ===', computedProps);

  } finally {
    cp.kill('SIGTERM');
  }
})();

