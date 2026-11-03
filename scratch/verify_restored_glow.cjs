const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9295;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_glow_' + Date.now();
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
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

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
      await new Promise(r => setTimeout(r, 500));
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

    console.log('--- 1. Capturing After Screenshots & Measuring ScrollWidth ---');
    const viewports = [
      { w: 1440, h: 900, mobile: false, name: '1440' },
      { w: 1024, h: 768, mobile: false, name: '1024' },
      { w: 768, h: 1024, mobile: false, name: '768' },
      { w: 390, h: 844, mobile: true, name: '390' },
      { w: 320, h: 568, mobile: true, name: '320' }
    ];

    const scrollResults = [];
    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.mobile);
      if (['1440', '1024', '768', '390'].includes(vp.name)) {
        await captureHero(`proof_glow_after_${vp.name}.png`);
      }

      const scrollInfo = await evaluate(`
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = window.innerWidth;
          return {
            viewport: '${vp.name}',
            scrollWidth: scrollW,
            clientWidth: clientW,
            equals: scrollW === clientW
          };
        })()
      `);
      scrollResults.push(scrollInfo);
      console.log(`Scroll check [${vp.name}]:`, scrollInfo);
    }

    fs.writeFileSync(
      path.join(artifactDir, 'proof_glow_scroll_audit.json'),
      JSON.stringify(scrollResults, null, 2)
    );

    console.log('--- 2. Glow Geometry and Bento Isolation Audit ---');
    await setViewport(1440, 900);
    const geometryAudit = await evaluate(`
      (() => {
        const glow = document.querySelector('.hero-glow-circle');
        const leftCol = document.querySelector('.hero-left-col');
        const bento = document.querySelector('.hero-bento-grid');
        const subtext = document.querySelector('.hero-bento-subtext');

        if (!glow || !leftCol || !bento) return null;

        const glowRect = glow.getBoundingClientRect();
        const leftColRect = leftCol.getBoundingClientRect();
        const bentoRect = bento.getBoundingClientRect();
        const subtextRect = subtext.getBoundingClientRect();

        const glowCenterRelToLeftCol = (glowRect.left + glowRect.width / 2) - (leftColRect.left + leftColRect.width / 2);
        const distanceGlowRightToBentoLeft = bentoRect.left - glowRect.right;

        return {
          glowWidth: glowRect.width,
          glowHeight: glowRect.height,
          leftColWidth: leftColRect.width,
          glowCenterDeltaX: Math.round(glowCenterRelToLeftCol),
          glowRight: Math.round(glowRect.right),
          bentoLeft: Math.round(bentoRect.left),
          distanceToBento: Math.round(distanceGlowRightToBentoLeft),
          doesNotWashOverBento: distanceGlowRightToBentoLeft > 0,
          subtextTop: Math.round(subtextRect.top),
          glowTop: Math.round(glowRect.top),
          glowBottom: Math.round(glowRect.bottom),
          glowCoversSubtextVertically: (glowRect.top < subtextRect.top) && (glowRect.bottom > subtextRect.bottom)
        };
      })()
    `);
    console.log('Geometry Audit [1440]:', geometryAudit);
    fs.writeFileSync(
      path.join(artifactDir, 'proof_glow_geometry_audit.json'),
      JSON.stringify(geometryAudit, null, 2)
    );

    console.log('--- 3. Contrast Calculation of Subtext on Peak Glow ---');
    function srgbToLinear(c) {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    function relLuminance(r, g, b) {
      return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
    }
    function contrastRatio(l1, l2) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // Peak glow: 24% of #0000D8 (0, 0, 216) over white #FFFFFF (255, 255, 255)
    const bgR = Math.round(0 * 0.24 + 255 * 0.76); // 194
    const bgG = Math.round(0 * 0.24 + 255 * 0.76); // 194
    const bgB = Math.round(216 * 0.24 + 255 * 0.76); // 246
    const bgL = relLuminance(bgR, bgG, bgB);

    // Subtext color: #454545 (rgb: 69, 69, 69)
    const fgR = 69, fgG = 69, fgB = 69;
    const fgL = relLuminance(fgR, fgG, fgB);
    const contrastOnPeakGlow = contrastRatio(bgL, fgL);
    // Contrast on pure white (#FFFFFF)
    const whiteL = relLuminance(255, 255, 255);
    const contrastOnWhite = contrastRatio(whiteL, fgL);

    const contrastReport = {
      peakGlowRGB: { r: bgR, g: bgG, b: bgB, hex: '#C2C2F6' },
      subtextRGB: { r: fgR, g: fgG, b: fgB, hex: '#454545' },
      contrastOnPeakGlow: parseFloat(contrastOnPeakGlow.toFixed(2)),
      contrastOnWhite: parseFloat(contrastOnWhite.toFixed(2)),
      wcagAAPass: contrastOnPeakGlow >= 4.5
    };
    console.log('Contrast Report:', contrastReport);
    fs.writeFileSync(
      path.join(artifactDir, 'proof_glow_contrast.json'),
      JSON.stringify(contrastReport, null, 2)
    );

    console.log('--- 4. ANIMATION_BASELINE Verification ---');
    const animChecks = await evaluate(`
      (() => {
        const typewriter = document.querySelector('.typewriter-text');
        const shimmer = document.querySelector('.hero-typewriter-shimmer');
        const wordReveal = document.querySelector('.hero-word-reveal');
        const conicBtn = document.querySelector('.btn-conic-border');
        const countUp = document.querySelector('.bento-count-number');
        const dock = document.querySelector('.hero-dock');
        const status = document.querySelector('.bento-status-text');

        return {
          typewriterText: typewriter ? typewriter.innerText : null,
          shimmerActive: Boolean(shimmer),
          wordRevealActive: Boolean(wordReveal),
          conicButtonActive: Boolean(conicBtn),
          countUpValue: countUp ? countUp.innerText : null,
          dockActive: Boolean(dock),
          statusText: status ? status.innerText : null
        };
      })()
    `);
    console.log('Animation checks:', animChecks);
    fs.writeFileSync(
      path.join(artifactDir, 'proof_glow_animations.json'),
      JSON.stringify(animChecks, null, 2)
    );

    console.log('VERIFICATION COMPLETE!');
  } finally {
    try { cp.kill(); } catch {}
  }
})();

