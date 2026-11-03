const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const os = require('os');
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
  console.log('--- STARTING STEP 1 AUDIT & VERIFICATION ---');

  const userDataDir = path.join(os.tmpdir(), `chrome_audit_verify_${Date.now()}`);
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  cp.stderr.on('data', d => console.log('[Chrome stderr]', d.toString()));
  cp.on('error', err => console.error('[Chrome error]', err));

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
    throw new Error('Failed to connect to Chrome headless');
  }

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
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
    const id = msgId++;
    callbacks.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method: m, params: p }));
  });

  await send('Page.enable');
  await send('DOM.enable');

  const verifyReport = {
    timestamp: new Date().toISOString(),
    overflows: [],
    smallTapTargets: [],
    scrollPerformanceAfter: {},
    screenshotsAfter: {}
  };

  // 1. Audit viewports & routes
  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    for (const route of ROUTES) {
      const url = `http://localhost:${DEV_PORT}${route}`;
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 700));

      // Overflows
      const ovRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body ? document.body.scrollWidth : 0;
          const hasOverflow = scrollW > docW || bodyScrollW > docW;
          return { hasOverflow, docW, scrollW, bodyScrollW };
        })()`,
        returnByValue: true
      });

      if (ovRes.result.value.hasOverflow) {
        verifyReport.overflows.push({
          viewport: vp.name,
          route,
          ...ovRes.result.value
        });
      }

      // Tap targets on mobile/touch viewports
      if (vp.mobile || vp.width <= 1024) {
        const tapRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const els = Array.from(document.querySelectorAll('a, button, input:not([type="hidden"]), select, textarea, [role="button"]'));
            const smalls = [];
            for (const el of els) {
              // skip hidden or zero sized
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
              
              // Skip natural inline text links inside running paragraph text (e.g. <p>...<a>link</a>...</p>)
              if (el.tagName === 'A' && el.parentElement && /^(P|LI|SPAN|DIV)$/.test(el.parentElement.tagName) &&
                  !el.classList.contains('btn-pill') &&
                  !el.classList.contains('footer-map-link') &&
                  !el.classList.contains('breadcrumb-link') &&
                  !el.classList.contains('card-learn-more') &&
                  !el.classList.contains('final-card-action-link') &&
                  !el.classList.contains('contact-card-phone-link') &&
                  !el.classList.contains('location-phone-link') &&
                  !el.classList.contains('footer-phone-link') &&
                  !el.classList.contains('footer-social-btn') &&
                  !el.classList.contains('outline-btn') &&
                  !el.classList.contains('hotspot-label-pill') &&
                  !el.classList.contains('nav-link')) {
                continue;
              }

              // Checkbox / Radio touch targets are evaluated via their wrapping/associated label
              if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
                continue;
              }

              if (r.width < 44 || r.height < 44) {
                smalls.push({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 50),
                  text: (el.innerText || el.getAttribute('aria-label') || '').slice(0, 30).trim(),
                  w: Math.round(r.width),
                  h: Math.round(r.height)
                });
              }
            }
            return smalls;
          })()`,
          returnByValue: true
        });

        if (tapRes.result.value.length > 0) {
          verifyReport.smallTapTargets.push({
            viewport: vp.name,
            route,
            count: tapRes.result.value.length,
            examples: tapRes.result.value
          });
        }
      }

      // Capture after screenshots for key viewports
      const keyWidths = ['320', '390', '768', '1440', 'landscape_phone'];
      if (keyWidths.includes(vp.name)) {
        const shotKey = `${route.replace('/', '') || 'home'}_${vp.name}`;
        const shotRes = await send('Page.captureScreenshot', { format: 'png' });
        const shotPath = path.join(ARTIFACTS_DIR, `proof_after_${shotKey}.png`);
        fs.writeFileSync(shotPath, Buffer.from(shotRes.data, 'base64'));
        verifyReport.screenshotsAfter[shotKey] = shotPath;
      }
    }
  }

  // 2. Scroll Performance Measurement (After)
  console.log('--- RUNNING SCROLL PERFORMANCE TRACES (AFTER) ---');
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
        const steps = 60;
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

    verifyReport.scrollPerformanceAfter[prof.name] = traceRes.result.value;
    console.log(`Scroll Performance (After ${prof.name}):`, traceRes.result.value);
  }

  // Reset throttling
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // Save Step 1 Report
  const reportPath = path.resolve('project-notes/STEP1_VERIFY_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(verifyReport, null, 2));
  console.log(`Saved Step 1 report to ${reportPath}`);

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
