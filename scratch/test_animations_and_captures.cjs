const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9335;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_test_suite2_' + Date.now();
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

    async function setViewport(width, height, isMobile = false) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: isMobile
      });
      await new Promise(r => setTimeout(r, 200));
    }

    async function waitForElement(sel) {
      for (let i = 0; i < 50; i++) {
        const exists = await evaluate(`!!document.querySelector('${sel}')`);
        if (exists) return true;
        await new Promise(r => setTimeout(r, 100));
      }
      return false;
    }

    async function captureElement(selector, filename) {
      const bounds = await evaluate(`
        (() => {
          const el = document.querySelector('${selector}');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(r.left + window.scrollX - 4)),
            y: Math.max(0, Math.floor(r.top + window.scrollY - 4)),
            width: Math.ceil(r.width + 8),
            height: Math.ceil(r.height + 8)
          };
        })()
      `);
      if (!bounds) {
        console.error('Element not found for capture:', selector);
        return;
      }
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { ...bounds, scale: 1 }
      });
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved:', filename);
    }

    // ==========================================
    // TEST 1: Frame sequence at 1440px & 390px
    // 0, 300, 600, 1200, 2000 ms
    // ==========================================
    const frameTimes = [0, 300, 600, 1200, 2000];
    const frameStats = {};

    for (const testVp of [{ w: 1440, h: 900, m: false }, { w: 390, h: 844, m: true }]) {
      const label = testVp.w;
      frameStats[label] = [];
      await setViewport(testVp.w, testVp.h, testVp.m);
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await waitForElement('.dashboard-cards-grid');

      // Scroll to top first
      await evaluate(`window.scrollTo(0, 0);`);
      await new Promise(r => setTimeout(r, 400));

      // Scroll to trigger entrance and measure precisely
      await evaluate(`document.querySelector('.dashboard-cards-grid').scrollIntoView({ block: 'center' });`);
      let prevTime = 0;

      for (const t of frameTimes) {
        const wait = t - prevTime;
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
        prevTime = t;

        // Capture grid
        await captureElement('.dashboard-cards-grid', `proof_frame_${label}px_${t}ms.png`);

        // Measure computed animated properties
        const computed = await evaluate(`
          (() => {
            const calTitle = document.querySelector('.cal-month-title');
            const dayLabels = Array.from(document.querySelectorAll('.cal-day-label')).map(l => getComputedStyle(l).opacity);
            const calCells = Array.from(document.querySelectorAll('.cal-cell:not(.cal-blank)')).map(c => ({
              op: getComputedStyle(c).opacity,
              tr: getComputedStyle(c).transform
            }));
            const stat1 = document.querySelector('.stat-tile-1');
            const stat2 = document.querySelector('.stat-tile-2');
            const yearVal = document.querySelector('.stat-val-established');
            const pBar = document.querySelector('.level-bar-primary');
            const mBar = document.querySelector('.level-bar-middle');
            const sBar = document.querySelector('.level-bar-secondary');
            const labels = Array.from(document.querySelectorAll('.level-label')).map(l => getComputedStyle(l).opacity);
            const beyondItems = Array.from(document.querySelectorAll('.beyond-item')).map(b => ({
              op: getComputedStyle(b).opacity,
              tr: getComputedStyle(b).transform,
              bg: getComputedStyle(b).backgroundColor
            }));

            return {
              time: ${t},
              calTitle: calTitle ? { op: getComputedStyle(calTitle).opacity, tr: getComputedStyle(calTitle).transform } : null,
              dayLabelsVisibleCount: dayLabels.filter(op => parseFloat(op) > 0.1).length,
              cellsRisingOrUpCount: calCells.filter(c => parseFloat(c.op) > 0.05).length,
              stat1Op: stat1 ? getComputedStyle(stat1).opacity : null,
              stat2Op: stat2 ? getComputedStyle(stat2).opacity : null,
              yearVal: yearVal ? yearVal.innerText : null,
              pBarScale: pBar ? getComputedStyle(pBar).transform : null,
              mBarScale: mBar ? getComputedStyle(mBar).transform : null,
              sBarScale: sBar ? getComputedStyle(sBar).transform : null,
              labelsVisibleCount: labels.filter(op => parseFloat(op) > 0.1).length,
              beyondItemsVisibleCount: beyondItems.filter(b => parseFloat(b.op) > 0.1).length
            };
          })()
        `);
        frameStats[label].push(computed);
      }
    }
    console.log('FRAME STATS 1440px:', JSON.stringify(frameStats[1440], null, 2));

    // ==========================================
    // TEST 2: Replay Test
    // ==========================================
    console.log('Running Replay Test...');
    await setViewport(1440, 900, false);
    // Scroll away to top (scrollY = 0)
    await evaluate(`window.scrollTo(0, 0);`);
    await new Promise(r => setTimeout(r, 600));

    const stateAtTop = await evaluate(`
      (() => {
        const cal = document.querySelector('.calendar-widget');
        const results = document.querySelector('.results-card');
        const beyond = document.querySelector('.beyond-card');
        const year = document.querySelector('.stat-val-established');
        return {
          calAnimated: cal ? cal.classList.contains('is-animated') : false,
          resultsAnimated: results ? results.classList.contains('is-animated') : false,
          beyondAnimated: beyond ? beyond.classList.contains('is-animated') : false,
          yearReset: year ? year.innerText : null
        };
      })()
    `);
    console.log('State when scrolled out of view (reset):', stateAtTop);

    // Scroll back in
    await evaluate(`document.querySelector('.dashboard-cards-grid').scrollIntoView({ block: 'center' });`);
    await new Promise(r => setTimeout(r, 450)); // catch mid-animation replay

    const stateReplayedMid = await evaluate(`
      (() => {
        const cal = document.querySelector('.calendar-widget');
        const year = document.querySelector('.stat-val-established');
        return {
          calAnimated: cal ? cal.classList.contains('is-animated') : false,
          yearMidCount: year ? year.innerText : null
        };
      })()
    `);
    console.log('State replaying mid-scroll:', stateReplayedMid);

    await new Promise(r => setTimeout(r, 1200)); // wait for complete
    const stateReplayedFinal = await evaluate(`
      (() => {
        const year = document.querySelector('.stat-val-established');
        const sBar = document.querySelector('.level-bar-secondary');
        return {
          yearFinal: year ? year.innerText : null,
          sBarTransform: sBar ? getComputedStyle(sBar).transform : null
        };
      })()
    `);
    console.log('State replayed final:', stateReplayedFinal);

    // ==========================================
    // TEST 3: All Breakpoint Screenshots & Heights
    // ==========================================
    const allViewports = [
      { w: 1440, h: 900, name: '1440', m: false },
      { w: 1024, h: 800, name: '1024', m: false },
      { w: 768, h: 1024, name: '768', m: false },
      { w: 430, h: 932, name: '430', m: true },
      { w: 390, h: 844, name: '390', m: true },
      { w: 360, h: 780, name: '360', m: true },
      { w: 320, h: 600, name: '320', m: true }
    ];

    const measurementsAfter = {};

    for (const vp of allViewports) {
      await setViewport(vp.w, vp.h, vp.m);
      await evaluate(`document.querySelector('.dashboard-cards-grid').scrollIntoView({ block: 'center' });`);
      await new Promise(r => setTimeout(r, 1500)); // allow animation to settle

      const data = await evaluate(`
        (() => {
          const cards = Array.from(document.querySelectorAll('.dashboard-cards-grid .dashboard-card'));
          const h = cards.map(c => Math.round(c.getBoundingClientRect().height));
          const clientW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          return {
            heights: h,
            equalHeights: h.length === 3 ? (h[0] === h[1] && h[1] === h[2]) : false,
            calendarHeight: h[0],
            clientW,
            scrollW,
            hasOverflow: scrollW > clientW
          };
        })()
      `);
      measurementsAfter[vp.name] = data;
      console.log(`VP ${vp.name}px: Heights=${JSON.stringify(data.heights)}, Equal=${data.equalHeights}, CalHeight=${data.calendarHeight}, Overflow=${data.hasOverflow}`);
      await captureElement('.dashboard-cards-grid', `proof_final_after_${vp.name}.png`);
    }

    // ==========================================
    // TEST 4: Prefers Reduced Motion Test
    // ==========================================
    console.log('Testing prefers-reduced-motion...');
    await setViewport(1440, 900, false);
    await send('Emulation.setEmulatedMedia', {
      media: 'page',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await waitForElement('.dashboard-cards-grid');
    await evaluate(`document.querySelector('.dashboard-cards-grid').scrollIntoView({ block: 'center' });`);
    await new Promise(r => setTimeout(r, 300)); // immediate check without waiting

    const reducedMotionData = await evaluate(`
      (() => {
        const cal = document.querySelector('.calendar-widget');
        const calCell = document.querySelector('.cal-cell:not(.cal-blank)');
        const year = document.querySelector('.stat-val-established');
        const sBar = document.querySelector('.level-bar-secondary');
        const beyondItem = document.querySelector('.beyond-item');

        return {
          matches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          calCellOpacity: calCell ? getComputedStyle(calCell).opacity : null,
          yearValImmediate: year ? year.innerText : null,
          sBarTransform: sBar ? getComputedStyle(sBar).transform : null,
          beyondItemOpacity: beyondItem ? getComputedStyle(beyondItem).opacity : null
        };
      })()
    `);
    console.log('Reduced motion check:', reducedMotionData);
    await captureElement('.dashboard-cards-grid', 'proof_final_reduced_motion.png');

    // Save report
    fs.writeFileSync(
      path.join(artifactDir, 'proof_dashboard_final_report.json'),
      JSON.stringify({ frameStats, replayTest: { stateAtTop, stateReplayedMid, stateReplayedFinal }, measurementsAfter, reducedMotionData }, null, 2)
    );

    console.log('All tests finished successfully.');
  } finally {
    cp.kill('SIGTERM');
  }
})();
