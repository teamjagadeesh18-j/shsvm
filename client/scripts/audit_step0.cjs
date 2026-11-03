const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9292;
const DEV_PORT = 5173;
const ARTIFACTS_DIR = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

const VIEWPORTS = [
  { name: '320', width: 320, height: 568, mobile: true },
  { name: '360', width: 360, height: 640, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '430', width: 430, height: 932, mobile: true },
  { name: '600', width: 600, height: 960, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: false },
  { name: '900', width: 900, height: 1200, mobile: false },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1280', width: 1280, height: 800, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1920', width: 1920, height: 1080, mobile: false },
  { name: 'landscape_phone', width: 844, height: 390, mobile: true },
  { name: 'tablet_landscape', width: 1180, height: 820, mobile: false }
];

const ROUTES = [
  '/',
  '/about',
  '/academics',
  '/admissions',
  '/campus',
  '/contact',
  '/faq'
];

async function run() {
  console.log('--- STARTING STEP 0 FULL SITE AUDIT ---');

  const userDataDir = `C:\\tmp\\chrome_audit_${Date.now()}`;
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  let connected = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected) {
    console.error('Failed to connect to headless Chrome on port', CDP_PORT);
    process.exit(1);
  }

  console.log('Connected to Chrome CDP on port', CDP_PORT);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
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
  await send('DOM.enable');
  await send('Runtime.enable');

  const auditReport = {
    overflows: [],
    smallTapTargets: [],
    inputIssues: [],
    scrollPerformanceBefore: {},
    screenshotsBefore: {}
  };

  // 1. Audit Viewports and Routes
  for (const vp of VIEWPORTS) {
    console.log(`Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    for (const route of ROUTES) {
      await send('Page.navigate', { url: `http://localhost:${DEV_PORT}${route}` });
      await new Promise(r => setTimeout(r, 350));

      const pageCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const sw = document.documentElement.scrollWidth;
          const cw = document.documentElement.clientWidth;
          const hasOverflow = sw > cw;

          // Check interactive elements under 44x44
          const buttonsAndLinks = Array.from(document.querySelectorAll('button, a, input, select'));
          const smallTargets = [];
          for (const el of buttonsAndLinks) {
            const r = el.getBoundingClientRect();
            // Visible elements only
            if (r.width > 0 && r.height > 0 && r.top < window.innerHeight * 2) {
              if (r.width < 44 || r.height < 44) {
                const text = (el.innerText || el.getAttribute('aria-label') || el.className || '').slice(0, 30);
                smallTargets.push({
                  tag: el.tagName,
                  class: el.className,
                  text: text.trim(),
                  w: Math.round(r.width),
                  h: Math.round(r.height)
                });
              }
            }
          }

          // Check inputs font size and inputMode
          const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(inp => ({
            tag: inp.tagName,
            type: inp.type,
            name: inp.name || inp.id,
            fontSize: window.getComputedStyle(inp).fontSize,
            inputMode: inp.getAttribute('inputmode')
          }));

          return {
            scrollWidth: sw,
            clientWidth: cw,
            hasOverflow,
            smallTargetsCount: smallTargets.length,
            smallTargets: smallTargets.slice(0, 3),
            inputs
          };
        })()`,
        returnByValue: true
      });

      const res = pageCheck.result.value;
      if (res && res.hasOverflow) {
        auditReport.overflows.push({
          viewport: vp.name,
          width: vp.width,
          route,
          scrollWidth: res.scrollWidth,
          clientWidth: res.clientWidth,
          diff: res.scrollWidth - res.clientWidth
        });
        console.warn(`[OVERFLOW] ${route} @ ${vp.name}px: scrollWidth ${res.scrollWidth} > clientWidth ${res.clientWidth}`);
      }

      if (res && res.smallTargets && res.smallTargets.length > 0) {
        auditReport.smallTapTargets.push({
          viewport: vp.name,
          route,
          count: res.smallTargetsCount,
          examples: res.smallTargets
        });
      }

      if (res && res.inputs) {
        for (const inp of res.inputs) {
          if (parseInt(inp.fontSize, 10) < 16) {
            auditReport.inputIssues.push({
              route,
              input: inp,
              issue: `Font size ${inp.fontSize} is below 16px (triggers iOS auto-zoom)`
            });
          }
        }
      }

      // Capture before screenshots at key widths for each page
      const keyWidths = ['360', '390', '768', '1024', '1440', '1920', 'landscape_phone', 'tablet_landscape'];
      if (keyWidths.includes(vp.name)) {
        const shotKey = `${route.replace('/', '') || 'home'}_${vp.name}`;
        const shotRes = await send('Page.captureScreenshot', { format: 'png' });
        const shotPath = path.join(ARTIFACTS_DIR, `proof_before_${shotKey}.png`);
        fs.writeFileSync(shotPath, Buffer.from(shotRes.data, 'base64'));
        auditReport.screenshotsBefore[shotKey] = shotPath;
      }
    }
  }

  // 2. Scroll Performance Audit: 1440px and 390px (4x CPU throttling)
  console.log('--- RUNNING SCROLL PERFORMANCE TRACES (BEFORE) ---');
  for (const prof of [
    { name: 'desktop_1440', w: 1440, h: 900, mobile: false, throttle: 1 },
    { name: 'mobile_390_4x', w: 390, h: 844, mobile: true, throttle: 4 }
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: prof.w,
      height: prof.h,
      deviceScaleFactor: 1,
      mobile: prof.mobile
    });

    await send('Emulation.setCPUThrottlingRate', { rate: prof.throttle });
    await send('Page.navigate', { url: `http://localhost:${DEV_PORT}/` });
    await new Promise(r => setTimeout(r, 1500));

    // Measure FPS during smooth programmatic full-page scroll
    const traceRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        let frameTimes = [];
        let lastTime = performance.now();
        let running = true;

        const loop = (now) => {
          const delta = now - lastTime;
          frameTimes.push(delta);
          lastTime = now;
          if (running) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const steps = 40;
        const stepDist = totalScroll / steps;

        for (let i = 0; i <= steps; i++) {
          window.scrollTo(0, i * stepDist);
          await new Promise(r => setTimeout(r, 16));
        }

        running = false;
        await new Promise(r => setTimeout(r, 50));

        const validFrames = frameTimes.slice(2);
        const avgDelta = validFrames.reduce((a, b) => a + b, 0) / validFrames.length;
        const avgFps = Math.round(1000 / avgDelta);
        const droppedFrames = validFrames.filter(d => d > 24).length;
        const longTasks = validFrames.filter(d => d > 50);

        return {
          avgFps,
          totalFrames: validFrames.length,
          droppedFrames,
          longTasksCount: longTasks.length,
          maxFrameDurationMs: Math.round(Math.max(...validFrames))
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    auditReport.scrollPerformanceBefore[prof.name] = traceRes.result.value;
    console.log(`Scroll Performance (${prof.name}):`, traceRes.result.value);
  }

  // Reset throttling
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // Save Step 0 Audit Report
  const reportPath = path.resolve('project-notes/STEP0_AUDIT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`Saved Step 0 report to ${reportPath}`);

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
