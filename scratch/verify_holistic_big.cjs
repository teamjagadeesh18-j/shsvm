const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const artifactDir = 'C:/Users/jagad/.gemini/antigravity/brain/b3832e7b-9e62-4a3b-993b-481cf86cf330';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_big_' + Date.now();
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9252',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);
  cp.stderr.on('data', d => console.error('CHROME STDERR:', d.toString()));
  cp.on('error', e => console.error('CHROME SPAWN ERR:', e));

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9252/json/version');
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome did not start on 9252');

    const listRes = await fetch('http://127.0.0.1:9252/json/list');
    const pageTargets = await listRes.json();
    const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
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
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const mid = id++;
      callbacks.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    console.log('--- SCREENSHOTS & MEASUREMENTS ---');
    const viewports = [360, 390, 430, 768, 1023, 1024, 1440];
    const measurements = {};
    const violations = [];

    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 768
      });

      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1800));

      // Scroll to holistic
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('holistic');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 600));

      // Capture screenshot of holistic panel
      const clipEval = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('holistic');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              x: Math.max(0, Math.floor(r.x)),
              y: Math.max(0, Math.floor(r.y + window.scrollY)),
              width: Math.min(${width}, Math.ceil(r.width)),
              height: Math.ceil(r.height)
            };
          })()
        `,
        returnByValue: true
      });

      if (clipEval.result && clipEval.result.value) {
        const clip = clipEval.result.value;
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...clip, scale: 1 }
        });
        const filename = width >= 1024 ? `proof_holistic_desktop_${width}.png` : `proof_holistic_big_${width}.png`;
        fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));
        console.log(`Saved ${filename} (${clip.width}x${clip.height})`);
      }

      // Extract detailed metrics
      const metricsEval = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const flowCard = document.querySelector('.ib-flow-card');
            const integrationsCard = document.querySelector('.ib-integrations-card');
            const chartCard = document.querySelector('.ib-chart-card');
            const headH2 = document.querySelector('.ib-h2');
            
            // Active SVGs
            const activeFlowSvg = Array.from(document.querySelectorAll('.ib-flow-svg')).find(s => window.getComputedStyle(s).display !== 'none');
            const activePillarsSvg = Array.from(document.querySelectorAll('.ib-integrations-svg')).find(s => window.getComputedStyle(s).display !== 'none');
            const activeChartSvg = Array.from(document.querySelectorAll('.ib-chart')).find(s => window.getComputedStyle(s).display !== 'none');

            const fBox = flowCard ? flowCard.getBoundingClientRect() : null;
            const fSvgBox = activeFlowSvg ? activeFlowSvg.getBoundingClientRect() : null;

            const pBox = integrationsCard ? integrationsCard.getBoundingClientRect() : null;
            const pSvgBox = activePillarsSvg ? activePillarsSvg.getBoundingClientRect() : null;

            const cBox = chartCard ? chartCard.getBoundingClientRect() : null;
            const cSvgBox = activeChartSvg ? activeChartSvg.getBoundingClientRect() : null;

            // Smallest avatar
            let minAvatarSize = 999;
            if (activeFlowSvg) {
              const avatars = activeFlowSvg.querySelectorAll('circle, image, .ib-node');
              avatars.forEach(a => {
                const b = a.getBoundingClientRect();
                if (b.width > 15 && b.width < minAvatarSize) minAvatarSize = b.width;
              });
            }

            // Smallest label font size
            let minFontSize = 999;
            if (activeFlowSvg) {
              const texts = activeFlowSvg.querySelectorAll('text');
              texts.forEach(t => {
                const fs = parseFloat(window.getComputedStyle(t).fontSize);
                if (fs > 0 && fs < minFontSize) minFontSize = fs;
              });
            }

            const h2Size = headH2 ? window.getComputedStyle(headH2).fontSize : '';
            const titleEl = document.querySelector('.ib-card h3');
            const titleSize = titleEl ? window.getComputedStyle(titleEl).fontSize : '';
            const bodyEl = document.querySelector('.ib-card p');
            const bodySize = bodyEl ? window.getComputedStyle(bodyEl).fontSize : '';

            // Bounding box checks
            const boundsCheck = (card, label) => {
              if (!card) return [];
              const cb = card.getBoundingClientRect();
              const errs = [];
              card.querySelectorAll('*').forEach(child => {
                const svg = child.closest('svg');
                if (svg && window.getComputedStyle(svg).display === 'none') return;
                if (window.getComputedStyle(child).display === 'none') return;
                const b = child.getBoundingClientRect();
                if (b.width === 0 || b.height === 0) return;
                // Allow 2px subpixel rounding tolerance
                if (b.left < cb.left - 2) errs.push({ label, child: child.tagName, leftViolation: cb.left - b.left });
                if (b.right > cb.right + 2) errs.push({ label, child: child.tagName, rightViolation: b.right - cb.right });
              });
              return errs;
            };

            const cardErrs = [
              ...boundsCheck(flowCard, 'FlowCard'),
              ...boundsCheck(integrationsCard, 'IntegrationsCard'),
              ...boundsCheck(chartCard, 'ChartCard')
            ];

            const scrollW = document.documentElement.scrollWidth;
            const clientW = document.documentElement.clientWidth;

            return {
              flowCardHeight: fBox ? fBox.height : 0,
              flowSvgWidth: fSvgBox ? fSvgBox.width : 0,
              flowSvgHeight: fSvgBox ? fSvgBox.height : 0,
              flowDiagramShare: (fBox && fSvgBox) ? ((fSvgBox.height / fBox.height) * 100).toFixed(1) + '%' : '0%',
              pillarsCardHeight: pBox ? pBox.height : 0,
              pillarsSvgHeight: pSvgBox ? pSvgBox.height : 0,
              pillarsDiagramShare: (pBox && pSvgBox) ? ((pSvgBox.height / pBox.height) * 100).toFixed(1) + '%' : '0%',
              chartCardHeight: cBox ? cBox.height : 0,
              chartSvgHeight: cSvgBox ? cSvgBox.height : 0,
              chartDiagramShare: (cBox && cSvgBox) ? ((cSvgBox.height / cBox.height) * 100).toFixed(1) + '%' : '0%',
              minAvatarSize: minAvatarSize === 999 ? 'N/A' : minAvatarSize.toFixed(1) + 'px',
              minFontSize: minFontSize === 999 ? 'N/A' : minFontSize.toFixed(1) + 'px',
              h2Size,
              titleSize,
              bodySize,
              horizontalOverflow: scrollW > clientW ? (scrollW - clientW) + 'px' : '0px',
              cardErrs
            };
          })()
        `,
        returnByValue: true
      });

      if (metricsEval.result && metricsEval.result.value) {
        const val = metricsEval.result.value;
        measurements[width] = val;
        if (val.cardErrs && val.cardErrs.length > 0) {
          violations.push({ width, errs: val.cardErrs });
        }
      }
    }

    console.log('\n--- 2. CAPTURE INDIVIDUAL CARDS AT 390px ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1800));
    await send('Runtime.evaluate', {
      expression: `document.getElementById('holistic')?.scrollIntoView({ behavior: 'instant', block: 'start' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const cardSelectors = [
      { name: 'proof_flow_card_390.png', sel: '.ib-flow-card' },
      { name: 'proof_pillars_card_390.png', sel: '.ib-integrations-card' },
      { name: 'proof_growth_card_390.png', sel: '.ib-chart-card' }
    ];

    for (const card of cardSelectors) {
      const bEval = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${card.sel}');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              x: Math.max(0, Math.floor(r.x)),
              y: Math.max(0, Math.floor(r.y + window.scrollY)),
              width: Math.ceil(r.width),
              height: Math.ceil(r.height)
            };
          })()
        `,
        returnByValue: true
      });
      if (bEval.result && bEval.result.value) {
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...bEval.result.value, scale: 1 }
        });
        fs.writeFileSync(path.join(artifactDir, card.name), Buffer.from(shot.data, 'base64'));
        console.log(`Saved ${card.name}`);
      }
    }

    console.log('\n--- 3. RESIZE RESILIENCE (1440 -> 360 -> 1440) ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 500));
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 900, deviceScaleFactor: 1, mobile: true });
    await new Promise(r => setTimeout(r, 500));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'proof_resize_to_360.png'), Buffer.from(shot.data, 'base64'));

    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'proof_resize_back_to_1440.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved resize proof screenshots');

    console.log('\n--- 4. ANIMATION FRAMES OVER TIME ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
    await new Promise(r => setTimeout(r, 500));
    for (let f = 1; f <= 3; f++) {
      await new Promise(r => setTimeout(r, 400));
      const animShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, `proof_animation_frame_${f}.png`), Buffer.from(animShot.data, 'base64'));
      console.log(`Captured animation frame ${f}`);
    }

    console.log('\n--- 5. SCROLL-DRIVEN GROWTH VERIFICATION ---');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('holistic');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
    const growthEval = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.ib-insights-frame');
          if (!card) return null;
          return {
            progress: card.style.getPropertyValue('--chart-progress'),
            scaleY: card.style.getPropertyValue('--curve-scale-y'),
            dotOpacity: card.style.getPropertyValue('--dot-opacity'),
            dotY_M: card.style.getPropertyValue('--dot-y-m'),
            tagX_M: card.style.getPropertyValue('--tag-x-m')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Scroll growth styles at center of viewport:', growthEval.result.value);

    // Write full report JSON
    fs.writeFileSync(path.join(artifactDir, 'holistic_big_measurements.json'), JSON.stringify(measurements, null, 2));
    fs.writeFileSync(path.join(artifactDir, 'holistic_big_violations.json'), JSON.stringify(violations, null, 2));
    console.log('\nSaved holistic_big_measurements.json and violations.json');

  } finally {
    cp.kill();
  }
})();
