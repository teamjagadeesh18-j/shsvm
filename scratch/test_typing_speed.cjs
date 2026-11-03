const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9294;
const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_speed_' + Date.now();
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

    console.log('--- 1. Testing Layout Jump Across Full Cycle ---');
    const jumpSamples = [];
    for (let i = 0; i < 15; i++) {
      const sample = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const text = document.querySelector('.typewriter-text')?.innerText || '';
            const subtext = document.querySelector('.hero-bento-subtext');
            const top = subtext ? subtext.getBoundingClientRect().top : null;
            return { text, top };
          })()
        `,
        returnByValue: true
      });
      jumpSamples.push(sample.result?.result?.value);
      await new Promise(r => setTimeout(r, 250));
    }
    const tops = jumpSamples.map(s => s?.top).filter(t => t !== null && t !== undefined);
    const deltaY = Math.max(...tops) - Math.min(...tops);
    console.log('Subtext deltaY across cycle:', deltaY, 'px');
    console.log('Sample texts observed:', jumpSamples.map(s => s?.text).filter(Boolean));

    console.log('--- 2. Testing Prefers-Reduced-Motion ---');
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1200));

    const reducedMotionCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cursor = document.querySelector('.typing-cursor');
          const text = document.querySelector('.typewriter-text')?.innerText;
          return {
            cursorPresent: Boolean(cursor),
            renderedText: text
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Reduced motion check:', reducedMotionCheck.result?.result?.value);

    console.log('--- 3. Testing Animation Baseline Integrity ---');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1200));

    const baselineChecks = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const typewriter = document.querySelector('.typewriter-text');
          const shimmer = document.querySelector('.hero-typewriter-shimmer');
          const wordReveal = document.querySelector('.hero-word-reveal');
          const conicBtn = document.querySelector('.btn-conic-border');
          const countUp = document.querySelector('.bento-count-number');
          const dock = document.querySelector('.hero-dock');
          const status = document.querySelector('.bento-status-text');

          return {
            typewriterPresent: Boolean(typewriter),
            shimmerPresent: Boolean(shimmer),
            wordRevealPresent: Boolean(wordReveal),
            conicBtnPresent: Boolean(conicBtn),
            countUpPresent: Boolean(countUp),
            dockPresent: Boolean(dock),
            statusPresent: Boolean(status)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Baseline checks:', baselineChecks.result?.result?.value);

    fs.writeFileSync(
      path.join(artifactDir, 'proof_speed_verification.json'),
      JSON.stringify({
        deltaY,
        jumpSamples,
        reducedMotionCheck: reducedMotionCheck.result?.result?.value,
        baselineChecks: baselineChecks.result?.result?.value
      }, null, 2)
    );

    console.log('VERIFICATION FINISHED SUCCESSFULLY!');
    cp.kill();
  } catch(e) {
    console.error(e);
    cp.kill();
  }
})();

