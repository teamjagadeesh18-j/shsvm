import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function waitForCdp(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await new Promise((resolve) => {
        http.get('http://localhost:9222/json/version', (res) => {
          if (res.statusCode === 200) resolve(true);
          else resolve(false);
        }).on('error', () => resolve(false));
      });
      if (ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function getCdpSession() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  async function close() { ws.close(); }
  return { send, close };
}

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\chrome_qa_prof',
    'about:blank'
  ]);
  await waitForCdp();
  const session = await getCdpSession();
  await session.send('Page.enable');
  await session.send('Runtime.enable');

  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await session.send('Page.navigate', { url: 'https://heedhive.in/services' });
  await new Promise(r => setTimeout(r, 3000));

  // Extract detailed measurements of:
  // 1. Logo
  // 2. Nav container & links & dividers
  // 3. CTA button & Hamburger
  // 4. Hero section (tag, heading, paragraph, grid)
  // 5. Marquee band (bg, font, separator)
  // 6. Step cards (light & dark, numbers, titles, text)
  // 7. Package cards (white & black, titles, lists, buttons)
  // 8. Three tall dark cards (titles, lists, tags)
  // 9. Checklist & bordered row list
  // 10. Explore More cards (with corner arrow)
  // 11. Closing CTA section (headings, buttons)

  const detailedSpec = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const cs = (el) => {
        if (!el) return null;
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          width: Math.round(r.width),
          height: Math.round(r.height),
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          letterSpacing: s.letterSpacing,
          lineHeight: s.lineHeight,
          color: s.color,
          bg: s.backgroundColor,
          border: s.border,
          borderRadius: s.borderRadius,
          padding: s.padding,
          margin: s.margin,
          gap: s.gap
        };
      };

      // Header elements
      const navLinks = Array.from(document.querySelectorAll('a')).filter(a => ['home', 'services', 'testimonials', 'contact'].some(k => a.innerText.toLowerCase().includes(k)));
      const navBox = navLinks[0]?.parentElement;
      const cta = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.toLowerCase().includes('consultation'));
      const headerBar = navBox?.closest('div') || document.querySelector('header');

      // Hero elements
      const heroSec = document.querySelector('h1')?.closest('section') || document.querySelector('h1')?.closest('div');
      const heroTag = heroSec?.querySelector('span, [class*="tag"], [class*="badge"]');
      const heroH1 = document.querySelector('h1');
      const heroP = heroSec?.querySelector('p');

      // Marquee
      const marquee = document.querySelector('[class*="marquee"], [class*="ticker"]');

      // Step cards in section 3
      const stepCards = Array.from(document.querySelectorAll('[class*="step"], [class*="process"] div, section:nth-of-type(1) div')).filter(el => {
        return el.querySelector('h4') && el.getBoundingClientRect().height > 80;
      });

      // Package cards (white & black)
      const packageCards = Array.from(document.querySelectorAll('[class*="package"], [class*="card"]')).filter(el => {
        return el.innerText.includes('Package') || el.innerText.includes('Month') || el.innerText.includes('Level');
      });

      // CTA block at bottom
      const ctaH2 = document.querySelector('h2:last-of-type') || Array.from(document.querySelectorAll('h2')).pop();
      const ctaSec = ctaH2?.closest('section') || ctaH2?.closest('div');
      const ctaBtns = Array.from(ctaSec?.querySelectorAll('button, a[class*="btn"]') || []);

      return {
        headerBar: cs(headerBar),
        navBox: cs(navBox),
        navLink: cs(navLinks[0]),
        ctaBtn: cs(cta),
        heroTag: cs(heroTag),
        heroH1: cs(heroH1),
        heroP: cs(heroP),
        marquee: cs(marquee),
        sampleStepCard: cs(stepCards[0]),
        sampleStepCardDark: cs(stepCards.find(c => window.getComputedStyle(c).backgroundColor.includes('0') || window.getComputedStyle(c).backgroundColor.includes('10'))),
        samplePackageWhite: cs(packageCards.find(c => window.getComputedStyle(c).backgroundColor.includes('255'))),
        samplePackageDark: cs(packageCards.find(c => !window.getComputedStyle(c).backgroundColor.includes('255'))),
        ctaSec: cs(ctaSec),
        ctaH2: cs(ctaH2),
        ctaBtns: ctaBtns.map(b => cs(b))
      };
    })()`,
    returnByValue: true
  });

  fs.writeFileSync('C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330\\scratch\\heedhive_audit\\detailed_spec.json', JSON.stringify(detailedSpec.result.value, null, 2));

  await session.close();
  chrome.kill();
  console.log('Detailed spec captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

