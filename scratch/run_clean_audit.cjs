const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9275;
const outputDir = path.resolve(__dirname, '..', 'project-notes');

(async () => {
  const userDataDir = 'C:\\tmp\\chrome_audit_' + Date.now();
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

    async function goTo(url) {
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 1500));
    }

    const audit = {
      routes: {},
      links: [],
      forms: {},
      seo: {},
      a11y: {},
      animations: {}
    };

    const routes = ['/', '/about', '/academics', '/admissions', '/campus', '/contact', '/404'];

    for (const r of routes) {
      console.log(`Auditing route: ${r}`);
      await goTo(`http://localhost:5173${r}`);

      const pageData = await evaluate(`
        (() => {
          const bodyText = document.body.innerText;
          const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
          const title = document.title;
          const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
          const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
          const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
          const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
          const imgsWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;
          const scrollW = document.documentElement.scrollWidth;
          const clientW = window.innerWidth;

          // Search forbidden words
          const forbidden = [];
          if (bodyText.includes('undefined')) forbidden.push('undefined');
          if (bodyText.includes('null')) forbidden.push('null');
          if (bodyText.includes('NaN')) forbidden.push('NaN');
          if (bodyText.includes('[object Object]')) forbidden.push('[object Object]');
          if (/\\b(TODO|FIXME|lorem|Tiruppur|Thangamani|Heedhive)\\b/i.test(bodyText)) forbidden.push('Trace word');
          if (/\\b(Estd\\.|Estd)\\b/i.test(bodyText)) forbidden.push('Estd pill');

          return {
            title,
            desc,
            ogTitle,
            ogDesc,
            ogImage,
            h1s,
            imgsWithoutAlt,
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW,
            forbidden
          };
        })()
      `);

      audit.routes[r] = pageData;
    }

    // Crawl all links on Home and Footer
    await goTo('http://localhost:5173/');
    audit.links = await evaluate(`
      (() => {
        return Array.from(document.querySelectorAll('a')).map(a => {
          const href = a.getAttribute('href');
          const target = a.getAttribute('target');
          const rel = a.getAttribute('rel');
          const text = a.innerText.trim();
          return {
            text: text.substring(0, 30),
            href,
            target,
            rel,
            isExternal: href && (href.startsWith('http') || href.startsWith('//')) && !href.includes('localhost'),
            hasRel: rel ? rel.includes('noopener') : false
          };
        });
      })()
    `);

    // Audit contact form
    await goTo('http://localhost:5173/contact');
    audit.forms.contact = await evaluate(`
      (() => {
        const form = document.querySelector('form');
        if (!form) return null;
        const phone = form.querySelector('input[type="tel"]') || form.querySelector('input[inputmode="numeric"]');
        const submit = form.querySelector('button[type="submit"]');
        return {
          hasForm: true,
          phoneType: phone?.getAttribute('type'),
          inputMode: phone?.getAttribute('inputmode'),
          pattern: phone?.getAttribute('pattern'),
          hasSubmit: !!submit
        };
      })()
    `);

    // Verify Animations
    await goTo('http://localhost:5173/');
    audit.animations = await evaluate(`
      (() => {
        const heroHighlight = document.querySelector('.hero-highlight');
        const marquee1 = document.querySelector('.marquee-row-1');
        const imgMarquee = document.querySelector('.image-marquee-container');
        const timeline = document.querySelector('.scroll-timeline-container');
        const diagramCards = document.querySelectorAll('.ib-flow-card, .ib-integrations-card, .ib-chart-card');
        return {
          heroTypewriterRunning: !!heroHighlight,
          marqueeRowPresent: !!marquee1,
          photoMarqueePresent: !!imgMarquee,
          journeyTimelinePresent: !!timeline,
          diagramCardsCount: diagramCards.length
        };
      })()
    `);

    fs.writeFileSync(path.join(outputDir, 'audit_verified.json'), JSON.stringify(audit, null, 2));
    console.log('Successfully saved audit_verified.json to project-notes!');

    ws.close();
    cp.kill();
  } catch (e) {
    console.error('Error during audit:', e);
    cp.kill();
    process.exit(1);
  }
})();
