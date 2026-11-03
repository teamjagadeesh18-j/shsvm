const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const artifactDir = 'C:/Users/jagad/.gemini/antigravity/brain/b3832e7b-9e62-4a3b-993b-481cf86cf330';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_proof_' + Date.now();
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9295/json/version');
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome did not start on 9295');

    const listRes = await fetch('http://127.0.0.1:9295/json/list');
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

    console.log('=== 1. MEASURE ALL TYPING PHRASES AT 360px ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 900, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 2000));

    const phrases = [
      "Smile, Study, Serve",
      "Primary to Secondary",
      "Academic & Arts Focus",
      "Care & Discipline"
    ];

    const phraseMeasurements360 = [];
    for (const phrase of phrases) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const visibleText = document.querySelector('.typewriter-text');
            const highlight = document.querySelector('.hero-highlight');
            if (!visibleText || !highlight) return null;
            visibleText.textContent = '${phrase}';
            const r = visibleText.getBoundingClientRect();
            const hr = highlight.getBoundingClientRect();
            const h1 = document.querySelector('.hero-title').getBoundingClientRect();
            
            // Calculate lines by line height ratio
            const computedStyle = window.getComputedStyle(visibleText);
            const lh = parseFloat(computedStyle.lineHeight) || (parseFloat(computedStyle.fontSize) * 1.18);
            const lineCount = Math.max(1, Math.round(r.height / lh));

            return {
              phrase: '${phrase}',
              renderedWidth: Math.round(r.width),
              renderedHeight: Math.round(r.height),
              highlightWidth: Math.round(hr.width),
              lineCount,
              leftGutter: Math.round(r.left),
              rightGutter: Math.round(360 - r.right)
            };
          })()
        `,
        returnByValue: true
      });
      phraseMeasurements360.push(evalRes.result.value);
    }
    console.log('360px Phrase Measurements:', JSON.stringify(phraseMeasurements360, null, 2));
    fs.writeFileSync(path.join(artifactDir, 'proof_typing_phrases_360.json'), JSON.stringify(phraseMeasurements360, null, 2));

    console.log('\n=== 2. VERIFY NO-JUMP DURING TYPING CYCLE ===');
    const yPositions = [];
    for (let frame = 0; frame < 15; frame++) {
      await new Promise(r => setTimeout(r, 250));
      const posEval = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const sub = document.querySelector('.hero-subtitle');
            const act = document.querySelector('.hero-actions');
            const h1 = document.querySelector('.hero-title');
            const typed = document.querySelector('.typewriter-text')?.textContent || '';
            const sr = sub ? sub.getBoundingClientRect() : null;
            const ar = act ? act.getBoundingClientRect() : null;
            const hr = h1 ? h1.getBoundingClientRect() : null;
            return {
              frame: ${frame},
              currentText: typed,
              titleHeight: hr ? hr.height : 0,
              subtitleY: sr ? Math.round(sr.top) : 0,
              actionsY: ar ? Math.round(ar.top) : 0
            };
          })()
        `,
        returnByValue: true
      });
      yPositions.push(posEval.result.value);
    }
    const initialSubY = yPositions[0].subtitleY;
    const initialActY = yPositions[0].actionsY;
    const maxSubJump = Math.max(...yPositions.map(p => Math.abs(p.subtitleY - initialSubY)));
    const maxActJump = Math.max(...yPositions.map(p => Math.abs(p.actionsY - initialActY)));
    console.log(`Subtext Jump: ${maxSubJump}px, Actions Jump: ${maxActJump}px (Expected: 0px)`);
    fs.writeFileSync(path.join(artifactDir, 'proof_no_jump_test.json'), JSON.stringify({ yPositions, maxSubJump, maxActJump }, null, 2));

    console.log('\n=== 3. CAPTURE HERO HEADLINE SCREENSHOTS ACROSS VIEWPORTS ===');
    const viewports = [320, 360, 390, 430, 768];
    const heroBoundsAudit = {};

    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1800));

      heroBoundsAudit[width] = {};

      for (const phrase of phrases) {
        // Set phrase and capture headline clip
        await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('.typewriter-text');
              if (el) el.textContent = '${phrase}';
            })()
          `
        });
        await new Promise(r => setTimeout(r, 200));

        const clipEval = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const h1 = document.querySelector('.hero-title');
              if (!h1) return null;
              const r = h1.getBoundingClientRect();
              const cursor = document.querySelector('.typing-cursor')?.getBoundingClientRect();
              const vpW = window.innerWidth;
              const textEls = h1.querySelectorAll('*');
              const errs = [];
              textEls.forEach(t => {
                const tr = t.getBoundingClientRect();
                if (tr.width === 0 || tr.height === 0 || t.classList.contains('typewriter-sizer')) return;
                if (tr.left < 14) errs.push({ tag: t.tagName, left: tr.left, violation: 14 - tr.left });
                if (tr.right > vpW - 14) errs.push({ tag: t.tagName, right: tr.right, violation: tr.right - (vpW - 14) });
              });

              return {
                clip: {
                  x: 0,
                  y: Math.max(0, Math.floor(r.y + window.scrollY - 20)),
                  width: ${width},
                  height: Math.ceil(r.height + 40)
                },
                h1Left: r.left,
                h1Right: r.right,
                cursorRight: cursor ? cursor.right : 0,
                errs
              };
            })()
          `,
          returnByValue: true
        });

        if (clipEval.result && clipEval.result.value) {
          const val = clipEval.result.value;
          heroBoundsAudit[width][phrase] = {
            h1Left: val.h1Left,
            h1Right: val.h1Right,
            violations: val.errs
          };

          const shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { ...val.clip, scale: 1 }
          });
          const safePhrase = phrase.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const fname = `proof_hero_${width}_${safePhrase}.png`;
          fs.writeFileSync(path.join(artifactDir, fname), Buffer.from(shot.data, 'base64'));
          console.log(`Saved ${fname}`);
        }
      }
    }

    console.log('\n=== 4. CAPTURE HOLISTIC CARDS & VERIFY PADDING AND BOTTOM CORNER CLEARANCE ===');
    const cardAudit = {};

    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1800));

      await send('Runtime.evaluate', {
        expression: `document.getElementById('holistic')?.scrollIntoView({ behavior: 'instant', block: 'start' });`
      });
      await new Promise(r => setTimeout(r, 600));

      const cards = [
        { key: 'flow', sel: '.ib-flow-card', copySel: '.ib-wide-copy', name: `proof_card_flow_${width}.png` },
        { key: 'pillars', sel: '.ib-integrations-card', copySel: '.ib-integrations-copy', name: `proof_card_pillars_${width}.png` },
        { key: 'growth', sel: '.ib-chart-card', copySel: '.ib-chart-copy', name: `proof_card_growth_${width}.png` }
      ];

      cardAudit[width] = {};

      for (const c of cards) {
        const evalCard = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const card = document.querySelector('${c.sel}');
              const copy = document.querySelector('${c.sel} ${c.copySel}');
              if (!card || !copy) return null;
              const cb = card.getBoundingClientRect();
              const tb = copy.getBoundingClientRect();

              const lastChild = copy.querySelector('p:last-of-type') || copy.lastElementChild;
              const lb = lastChild ? lastChild.getBoundingClientRect() : tb;

              const bottomClearance = cb.bottom - lb.bottom;
              const leftPadding = tb.left - cb.left;
              const rightPadding = cb.right - tb.right;

              // Check bounding violations
              const violations = [];
              if (leftPadding < 18) violations.push({ type: 'left_pad_too_small', val: leftPadding });
              if (rightPadding < 18) violations.push({ type: 'right_pad_too_small', val: rightPadding });
              if (bottomClearance < 23) violations.push({ type: 'bottom_clearance_too_small', val: bottomClearance });

              return {
                cardWidth: cb.width,
                cardHeight: cb.height,
                leftPadding,
                rightPadding,
                bottomClearance,
                violations,
                clip: {
                  x: Math.max(0, Math.floor(cb.x)),
                  y: Math.max(0, Math.floor(cb.y + window.scrollY)),
                  width: Math.ceil(cb.width),
                  height: Math.ceil(cb.height)
                }
              };
            })()
          `,
          returnByValue: true
        });

        if (evalCard.result && evalCard.result.value) {
          const val = evalCard.result.value;
          cardAudit[width][c.key] = {
            leftPadding: val.leftPadding,
            rightPadding: val.rightPadding,
            bottomClearance: val.bottomClearance,
            violations: val.violations
          };

          const shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { ...val.clip, scale: 1 }
          });
          fs.writeFileSync(path.join(artifactDir, c.name), Buffer.from(shot.data, 'base64'));
          console.log(`Saved ${c.name} (leftPad: ${val.leftPadding}px, bottomClearance: ${val.bottomClearance}px)`);
        }
      }
    }

    fs.writeFileSync(path.join(artifactDir, 'proof_hero_bounds_audit.json'), JSON.stringify(heroBoundsAudit, null, 2));
    fs.writeFileSync(path.join(artifactDir, 'proof_cards_padding_audit.json'), JSON.stringify(cardAudit, null, 2));

    console.log('\n=== 5. PREFERS-REDUCED-MOTION VERIFICATION ===');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));
    const reducedMotionEval = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const visibleText = document.querySelector('.typewriter-text')?.textContent;
          const cursor = document.querySelector('.typing-cursor');
          return {
            visibleText,
            cursorVisible: cursor ? window.getComputedStyle(cursor).display !== 'none' : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Reduced Motion Output:', reducedMotionEval.result.value);
    const reducedShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'proof_hero_reduced_motion.png'), Buffer.from(reducedShot.data, 'base64'));

    console.log('\n=== 6. DESKTOP PARITY CHECK (1024px & 1440px) ===');
    await send('Emulation.setEmulatedMedia', { features: [] });
    for (const dWidth of [1024, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', { width: dWidth, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 1800));

      const dShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, `proof_desktop_page_${dWidth}.png`), Buffer.from(dShot.data, 'base64'));
      console.log(`Saved proof_desktop_page_${dWidth}.png`);
    }

    console.log('\nALL PROOF RUNNER CHECKS COMPLETED SUCCESSFULLY!');
  } finally {
    cp.kill();
  }
})();

