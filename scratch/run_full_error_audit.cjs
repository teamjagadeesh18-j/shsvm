const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9260;
const artifactDir = path.resolve(__dirname, '..', 'project-notes');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${PORT}/json/version`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('Spawning Chrome headless on port ' + PORT);
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(__dirname, 'temp_chrome_audit')
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const wsUrl = await getWsUrl();
  console.log('Connected to Chrome WebSocket:', wsUrl);

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const pageTargets = await listRes.json();
  const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  await new Promise((resolve) => ws.onopen = resolve);

  let id = 1;
  const callbacks = new Map();
  const consoleMessages = [];
  const networkErrors = [];

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Console.messageAdded') {
      consoleMessages.push(msg.params.message);
    }
    if (msg.method === 'Log.entryAdded') {
      consoleMessages.push(msg.params.entry);
    }
    if (msg.method === 'Network.responseReceived') {
      if (msg.params.response.status >= 400) {
        networkErrors.push({ url: msg.params.response.url, status: msg.params.response.status });
      }
    }
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Console.enable');
  await send('Log.enable');
  await send('Network.enable');

  const report = {
    runtime: {},
    links: [],
    forms: {},
    contentIntegrity: {},
    layout: {},
    a11y: {},
    seo: {},
    animations: {},
    assets: {}
  };

  const routes = ['/', '/about', '/academics', '/admissions', '/campus', '/contact', '/non-existent-page'];
  const viewports = [360, 390, 768, 1024, 1440];

  console.log('\n=== 1. RUNTIME & CONSOLE AUDIT ACROSS ROUTES & VIEWPORTS ===');
  for (const route of routes) {
    report.runtime[route] = { errors: [], networkErrors: [] };
    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await send('Page.navigate', { url: `http://localhost:5173${route}` });
      await new Promise(r => setTimeout(r, 1200));

      // Check DOM errors
      const domCheck = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const text = document.body.innerText;
            const issues = [];
            if (text.includes('undefined')) issues.push('Contains "undefined"');
            if (text.includes('null')) issues.push('Contains "null"');
            if (text.includes('NaN')) issues.push('Contains "NaN"');
            if (text.includes('[object Object]')) issues.push('Contains "[object Object]"');
            if (/\\b(TODO|FIXME|lorem|Tiruppur|Thangamani|Heedhive)\\b/i.test(text)) issues.push('Contains forbidden trace word');
            if (document.documentElement.scrollWidth > window.innerWidth) issues.push('Horizontal scroll overflow: ' + (document.documentElement.scrollWidth - window.innerWidth) + 'px');
            return issues;
          })()
        `,
        returnByValue: true
      });

      if (domCheck.result && domCheck.result.value && domCheck.result.value.length > 0) {
        report.runtime[route].errors.push({ width, issues: domCheck.result.value });
      }
    }
  }

  console.log('\n=== 2. LINK CRAWLER & ATTRIBUTE CHECK ===');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1200));

  const linkEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.map(a => {
          const href = a.getAttribute('href');
          const target = a.getAttribute('target');
          const rel = a.getAttribute('rel');
          const text = a.innerText.trim();
          const isExternal = href && (href.startsWith('http') || href.startsWith('//')) && !href.includes('localhost');
          const hasProperSecurity = !isExternal || (target === '_blank' && rel && rel.includes('noopener') && rel.includes('noreferrer'));
          const isDead = !href || href === '#' || href === '';
          return {
            text: text.substring(0, 40),
            href,
            target,
            rel,
            isExternal,
            hasProperSecurity,
            isDead
          };
        });
      })()
    `,
    returnByValue: true
  });
  report.links = linkEval.result.value;

  console.log('\n=== 3. FORM VALIDATION & WHATSAPP URL AUDIT ===');
  await send('Page.navigate', { url: 'http://localhost:5173/contact' });
  await new Promise(r => setTimeout(r, 1200));

  const formAudit = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        if (!form) return { hasForm: false };

        const phoneInput = form.querySelector('input[type="tel"]') || form.querySelector('input[name*="phone"]');
        const submitBtn = form.querySelector('button[type="submit"]');

        return {
          hasForm: true,
          hasPhoneInput: !!phoneInput,
          hasSubmitBtn: !!submitBtn,
          inputMode: phoneInput?.getAttribute('inputmode'),
          pattern: phoneInput?.getAttribute('pattern')
        };
      })()
    `,
    returnByValue: true
  });
  report.forms.contact = formAudit.result.value;

  console.log('\n=== 4. ACCESSIBILITY & HEADING AUDIT ===');
  for (const route of ['/', '/about', '/academics', '/admissions', '/campus', '/contact']) {
    await send('Page.navigate', { url: `http://localhost:5173${route}` });
    await new Promise(r => setTimeout(r, 1000));

    const a11yEval = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
          const imgsWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;
          const skipLink = !!document.querySelector('a[href="#main-content"]');
          return {
            h1Count: h1s.length,
            h1Text: h1s[0] || null,
            imgsWithoutAlt,
            hasSkipLink: skipLink
          };
        })()
      `,
      returnByValue: true
    });
    report.a11y[route] = a11yEval.result.value;
  }

  console.log('\n=== 5. SEO & METADATA AUDIT ===');
  for (const route of ['/', '/about', '/academics', '/admissions', '/campus', '/contact']) {
    await send('Page.navigate', { url: `http://localhost:5173${route}` });
    await new Promise(r => setTimeout(r, 1000));

    const seoEval = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.title;
          const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
          const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
          const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
          const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
          return {
            title,
            metaDesc,
            ogTitle,
            ogDesc,
            ogImage
          };
        })()
      `,
      returnByValue: true
    });
    report.seo[route] = seoEval.result.value;
  }

  console.log('\n=== 6. ANIMATION_BASELINE VERIFICATION ===');
  // Check hero typewriter progression
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1000));

  const animEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const typewriter = document.querySelector('.hero-highlight');
        const marquee1 = document.querySelector('.marquee-row-1');
        const timeline = document.querySelector('.scroll-timeline-container');
        const chart = document.querySelector('.ib-chart-card');
        const svgPath = document.querySelector('.ib-flow-svg path');

        return {
          hasTypewriter: !!typewriter,
          hasMarquee: !!marquee1,
          hasTimeline: !!timeline,
          hasChart: !!chart,
          hasDiagramSvg: !!svgPath
        };
      })()
    `,
    returnByValue: true
  });
  report.animations = animEval.result.value;

  console.log('\n=== 7. ASSET SIZE AUDIT ===');
  const pubImagesDir = path.resolve(__dirname, '..', 'client', 'public', 'images');
  function walkDir(dir) {
    let res = [];
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) res = res.concat(walkDir(p));
      else res.push(p);
    });
    return res;
  }
  const imgs = walkDir(pubImagesDir);
  const oversized = [];
  imgs.forEach(img => {
    const size = fs.statSync(img).size;
    if (size > 300 * 1024) {
      oversized.push({
        file: path.relative(pubImagesDir, img).replace(/\\/g, '/'),
        sizeKb: (size / 1024).toFixed(1)
      });
    }
  });
  report.assets.oversized = oversized;

  report.consoleMessages = consoleMessages;
  report.networkErrors = networkErrors;

  fs.writeFileSync(path.join(artifactDir, 'full_error_audit_report.json'), JSON.stringify(report, null, 2));
  console.log('Saved full error audit report to project-notes/full_error_audit_report.json');

  ws.close();
  chromeProcess.kill();
  console.log('Audit completed cleanly.');
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
