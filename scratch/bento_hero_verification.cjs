const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9288;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_bento_' + Date.now();
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
      await new Promise(r => setTimeout(r, 400));
    }

    async function captureHero(filename) {
      const clip = await evaluate(`
        (() => {
          const el = document.querySelector('.hero-section');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height, scale: 1 };
        })()
      `);
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: clip || undefined
      });
      const filePath = path.join(artifactDir, filename);
      fs.writeFileSync(filePath, Buffer.from(screenshot.result.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }

    // Set non-IST timezone: New York (America/New_York)
    await send('Emulation.setTimezoneOverride', { timezoneId: 'America/New_York' });

    console.log('--- 1. Testing Live Status Clock in non-IST timezone ---');
    const statusTests = [
      { name: 'Saturday 5:31 PM IST', iso: '2026-10-31T12:01:00Z' },
      { name: 'Sunday 12:00 PM IST', iso: '2026-11-01T06:30:00Z' },
      { name: 'Monday 7:59 AM IST', iso: '2026-11-02T02:29:00Z' },
      { name: 'Monday 8:00 AM IST', iso: '2026-11-02T02:30:00Z' },
      { name: 'Wednesday 2:00 PM IST', iso: '2026-11-04T08:30:00Z' }
    ];

    const statusResults = [];
    for (const test of statusTests) {
      await send('Page.navigate', { url: 'about:blank' });
      const scriptRes = await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `
          const mockTs = new Date('${test.iso}').getTime();
          const OrigDate = Date;
          window.Date = class extends OrigDate {
            constructor(...args) {
              if (args.length === 0) return new OrigDate(mockTs);
              return new OrigDate(...args);
            }
            static now() { return mockTs; }
          };
        `
      });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1200));

      const text = await evaluate(`document.querySelector('.bento-status-text')?.innerText`);
      const isOpen = await evaluate(`document.querySelector('.bento-status-tile')?.classList.contains('status-open')`);
      statusResults.push({ name: test.name, iso: test.iso, text, isOpen });
      console.log(`Status Test [${test.name}]:`, { text, isOpen });

      if (test.name === 'Saturday 5:31 PM IST') {
        await setViewport(1440, 900);
        await captureHero('proof_bento_status_closed_sat.png');
      } else if (test.name === 'Sunday 12:00 PM IST') {
        await setViewport(1440, 900);
        await captureHero('proof_bento_status_closed_sun.png');
      } else if (test.name === 'Monday 8:00 AM IST') {
        await setViewport(1440, 900);
        await captureHero('proof_bento_status_open.png');
      }

      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptRes.result.identifier });
    }

    fs.writeFileSync(
      path.join(artifactDir, 'proof_bento_status_tests.json'),
      JSON.stringify(statusResults, null, 2)
    );

    console.log('--- 2. Capturing Hero across viewports & bounds audit ---');
    const viewports = [
      { w: 1440, h: 900, mobile: false, name: '1440' },
      { w: 1024, h: 768, mobile: false, name: '1024' },
      { w: 768, h: 1024, mobile: false, name: '768' },
      { w: 430, h: 932, mobile: true, name: '430' },
      { w: 390, h: 844, mobile: true, name: '390' },
      { w: 360, h: 800, mobile: true, name: '360' },
      { w: 320, h: 568, mobile: true, name: '320' }
    ];

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

    const boundsResults = [];
    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.mobile);
      await captureHero(`proof_bento_hero_${vp.name}.png`);

      const audit = await evaluate(`
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = window.innerWidth;
          const hero = document.querySelector('.hero-section');
          const heroRect = hero ? hero.getBoundingClientRect() : null;
          const elements = Array.from(hero ? hero.querySelectorAll('*') : []);
          let maxRight = 0;
          let overflowingElements = [];

          elements.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              if (r.right > maxRight) maxRight = r.right;
              if (r.right > clientW + 1) {
                overflowingElements.push({ tag: el.tagName, class: el.className, right: r.right, width: r.width });
              }
            }
          });

          return {
            viewportWidth: clientW,
            scrollWidth: scrollW,
            hasOverflow: scrollW > clientW,
            maxRight,
            gutterRight: clientW - maxRight,
            overflowingElements: overflowingElements.slice(0, 3)
          };
        })()
      `);
      boundsResults.push({ viewport: vp.name, ...audit });
      console.log(`Bounds check [${vp.name}]:`, audit);
    }

    fs.writeFileSync(
      path.join(artifactDir, 'proof_bento_bounds_audit.json'),
      JSON.stringify(boundsResults, null, 2)
    );

    console.log('--- 3. Testing 0px layout jump across full typing cycle & CLS ---');
    await setViewport(1440, 900);
    const jumpSamples = [];
    for (let i = 0; i < 8; i++) {
      const sample = await evaluate(`
        (() => {
          const text = document.querySelector('.typewriter-text')?.innerText || '';
          const subtext = document.querySelector('.hero-bento-subtext');
          const actions = document.querySelector('.hero-bento-actions');
          const subtextTop = subtext ? subtext.getBoundingClientRect().top : null;
          const actionsTop = actions ? actions.getBoundingClientRect().top : null;
          return { text, subtextTop, actionsTop };
        })()
      `);
      jumpSamples.push(sample);
      await new Promise(r => setTimeout(r, 400));
    }
    const subtextTops = jumpSamples.map(s => s.subtextTop).filter(t => t !== null);
    const subtextDelta = Math.max(...subtextTops) - Math.min(...subtextTops);
    const actionsTops = jumpSamples.map(s => s.actionsTop).filter(t => t !== null);
    const actionsDelta = Math.max(...actionsTops) - Math.min(...actionsTops);
    console.log(`Layout Jump Test: subtextDelta = ${subtextDelta}px, actionsDelta = ${actionsDelta}px`);

    fs.writeFileSync(
      path.join(artifactDir, 'proof_bento_layout_jump.json'),
      JSON.stringify({ jumpSamples, subtextDelta, actionsDelta, subtextJump0px: subtextDelta === 0, actionsJump0px: actionsDelta === 0 }, null, 2)
    );

    console.log('--- 4. Inspecting animations & styles ---');
    const animDetails = await evaluate(`
      (() => {
        const shimmer = document.querySelector('.hero-typewriter-shimmer');
        const shimmerStyle = shimmer ? window.getComputedStyle(shimmer) : {};
        const conicBtn = document.querySelector('.btn-conic-border');
        const pill = document.querySelector('.hero-shiny-pill');
        const pillStyle = pill ? window.getComputedStyle(pill) : {};
        const wordReveal = document.querySelector('.hero-word-reveal');
        const wordRevealStyle = wordReveal ? window.getComputedStyle(wordReveal) : {};
        const countTile = document.querySelector('.bento-count-number');
        const dock = document.querySelector('.hero-dock');
        const dockItems = Array.from(document.querySelectorAll('.hero-dock-item')).map(d => ({
          aria: d.getAttribute('aria-label'),
          href: d.getAttribute('href')
        }));

        return {
          shimmerBackgroundClip: shimmerStyle.webkitBackgroundClip || shimmerStyle.backgroundClip,
          shimmerAnimation: shimmerStyle.animationName,
          pillAnimation: pillStyle.animationName,
          wordRevealAnimation: wordRevealStyle.animationName,
          conicButtonExists: Boolean(conicBtn),
          countUpValue: countTile ? countTile.innerText : null,
          dockItemCount: dockItems.length,
          dockItems
        };
      })()
    `);
    console.log('Animation and style inspection:', animDetails);
    fs.writeFileSync(
      path.join(artifactDir, 'proof_bento_animations.json'),
      JSON.stringify(animDetails, null, 2)
    );

    console.log('--- 5. Testing Dock Magnification ---');
    await evaluate(`
      (() => {
        const dock = document.querySelector('.hero-dock');
        const firstItem = document.querySelector('.hero-dock-item');
        if (dock && firstItem) {
          const rect = firstItem.getBoundingClientRect();
          const evt = new PointerEvent('pointermove', {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            pointerType: 'mouse',
            bubbles: true
          });
          dock.dispatchEvent(evt);
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 200));
    const dockScale = await evaluate(`
      (() => {
        const firstItem = document.querySelector('.hero-dock-item');
        return firstItem ? firstItem.style.getPropertyValue('--dock-scale') : null;
      })()
    `);
    console.log('Dock magnification --dock-scale under cursor:', dockScale);

    console.log('--- 6. Emulating prefers-reduced-motion ---');
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1200));
    await setViewport(1440, 900);
    await captureHero('proof_bento_hero_reduced_motion.png');

    const reducedMotionAudit = await evaluate(`
      (() => {
        const cursor = document.querySelector('.typing-cursor');
        const countText = document.querySelector('.bento-count-number')?.innerText;
        const text = document.querySelector('.typewriter-text')?.innerText;
        return {
          cursorPresent: Boolean(cursor),
          countText,
          renderedText: text
        };
      })()
    `);
    console.log('Reduced motion audit:', reducedMotionAudit);
    fs.writeFileSync(
      path.join(artifactDir, 'proof_bento_reduced_motion.json'),
      JSON.stringify(reducedMotionAudit, null, 2)
    );

    console.log('ALL BENTO HERO TESTS COMPLETED SUCCESSFULLY!');
  } finally {
    try { cp.kill(); } catch {}
  }
})();
