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
  const outDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330\\scratch\\heedhive_audit';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Starting Chrome...');
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
  await session.send('DOM.enable');
  await session.send('CSS.enable');

  // Set 1440px viewport
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to https://heedhive.in/services...');
  try {
    await session.send('Page.navigate', { url: 'https://heedhive.in/services' });
    await new Promise(r => setTimeout(r, 4000));
  } catch (e) {
    console.error('Failed to navigate:', e);
  }

  // Check if page loaded
  const title = await session.send('Runtime.evaluate', { expression: 'document.title' });
  console.log('Page Title:', title.result.value);

  // Extract Fonts loaded
  const fonts = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const fontFaces = Array.from(document.fonts).map(f => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status
      }));
      const linkFonts = Array.from(document.querySelectorAll('link[href*="fonts"]')).map(l => l.href);
      return { fontFaces, linkFonts };
    })()`,
    returnByValue: true
  });
  console.log('Loaded Fonts:', JSON.stringify(fonts.result.value, null, 2));

  // Extract Header details
  const headerSpec = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const getStyles = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          rect: { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), left: Math.round(rect.left) },
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          lineHeight: cs.lineHeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          border: cs.border,
          borderRadius: cs.borderRadius,
          padding: cs.padding,
          margin: cs.margin,
          gap: cs.gap,
          boxShadow: cs.boxShadow,
          display: cs.display,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent
        };
      };

      // Header container
      const header = document.querySelector('header') || document.querySelector('nav')?.closest('div') || document.querySelector('[class*="header"]');
      
      // Nav pill/box
      // Search for the black box containing Home, Services, etc.
      const links = Array.from(document.querySelectorAll('a')).filter(a => ['home', 'services', 'testimonials', 'contact'].some(k => a.innerText.toLowerCase().includes(k)));
      const navContainer = links[0]?.parentElement?.closest('nav') || links[0]?.parentElement;
      
      // CTA button
      const ctaBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.toLowerCase().includes('consultation') || el.innerText.toLowerCase().includes('book'));

      // Hamburger
      const hamburger = document.querySelector('[class*="hamburger"], [class*="menu"], [aria-label*="menu"]');

      // Dividers
      const dividers = navContainer ? Array.from(navContainer.querySelectorAll('div, span, hr')).filter(el => {
        const r = el.getBoundingClientRect();
        return r.width <= 2 && r.height > 8;
      }) : [];

      return {
        header: getStyles(header),
        navContainer: getStyles(navContainer),
        navLinks: links.map(l => ({ text: l.innerText, styles: getStyles(l) })),
        divider: dividers.length > 0 ? getStyles(dividers[0]) : null,
        dividerCount: dividers.length,
        ctaButton: getStyles(ctaBtn),
        hamburger: getStyles(hamburger)
      };
    })()`,
    returnByValue: true
  });
  fs.writeFileSync(`${outDir}\\header_spec.json`, JSON.stringify(headerSpec.result.value, null, 2));
  console.log('Header Spec captured.');

  // Capture Header Screenshot at 1440px
  const ssHeader1440 = await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1440, height: 120, scale: 1 }
  });
  fs.writeFileSync(`${outDir}\\ref_header_1440.png`, Buffer.from(ssHeader1440.data, 'base64'));

  // Extract Full Page Sections Spec
  const pageSpec = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const sections = Array.from(document.querySelectorAll('main > *, body > section, body > div > section, main section')).map((s, idx) => {
        const cs = window.getComputedStyle(s);
        const rect = s.getBoundingClientRect();
        const headings = Array.from(s.querySelectorAll('h1, h2, h3, h4')).map(h => ({
          tag: h.tagName,
          text: h.innerText.replace(/\\n/g, ' '),
          fontFamily: window.getComputedStyle(h).fontFamily,
          fontSize: window.getComputedStyle(h).fontSize,
          fontWeight: window.getComputedStyle(h).fontWeight,
          letterSpacing: window.getComputedStyle(h).letterSpacing,
          lineHeight: window.getComputedStyle(h).lineHeight,
          color: window.getComputedStyle(h).color
        }));
        const buttons = Array.from(s.querySelectorAll('button, a[class*="btn"], a[class*="button"]')).map(b => ({
          text: b.innerText.replace(/\\n/g, ' '),
          fontSize: window.getComputedStyle(b).fontSize,
          fontWeight: window.getComputedStyle(b).fontWeight,
          color: window.getComputedStyle(b).color,
          bg: window.getComputedStyle(b).backgroundColor,
          borderRadius: window.getComputedStyle(b).borderRadius,
          padding: window.getComputedStyle(b).padding
        }));
        const cards = Array.from(s.querySelectorAll('[class*="card"], [class*="item"], [class*="box"], [class*="package"]')).slice(0, 5).map(c => ({
          className: c.className,
          bg: window.getComputedStyle(c).backgroundColor,
          border: window.getComputedStyle(c).border,
          borderRadius: window.getComputedStyle(c).borderRadius,
          padding: window.getComputedStyle(c).padding
        }));

        return {
          index: idx,
          tag: s.tagName,
          className: s.className,
          height: Math.round(rect.height),
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.substring(0, 80) : 'none',
          padding: cs.padding,
          headings,
          buttons,
          sampleCards: cards
        };
      });
      return sections;
    })()`,
    returnByValue: true
  });
  fs.writeFileSync(`${outDir}\\page_sections_spec.json`, JSON.stringify(pageSpec.result.value, null, 2));
  console.log('Sections Spec captured.');

  // Capture Full Page Screenshot
  const metrics = await session.send('Page.getLayoutMetrics');
  const fullHeight = Math.ceil(metrics.contentSize.height);
  console.log('Full page height:', fullHeight);

  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: fullHeight,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1000));
  const fullScreenshot = await session.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true
  });
  fs.writeFileSync(`${outDir}\\ref_services_full_1440.png`, Buffer.from(fullScreenshot.data, 'base64'));

  // Mobile 390px inspection
  console.log('Switching to mobile 390px...');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await session.send('Page.navigate', { url: 'https://heedhive.in/services' });
  await new Promise(r => setTimeout(r, 3000));

  const mobileHeaderSpec = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const header = document.querySelector('header') || document.querySelector('nav')?.closest('div');
      const cs = header ? window.getComputedStyle(header) : null;
      const rect = header ? header.getBoundingClientRect() : null;
      const hamburger = document.querySelector('[class*="hamburger"], [class*="menu"], [aria-label*="menu"]');
      const csHam = hamburger ? window.getComputedStyle(hamburger) : null;
      return {
        height: rect ? Math.round(rect.height) : null,
        padding: cs ? cs.padding : null,
        bg: cs ? cs.backgroundColor : null,
        hamburger: csHam ? {
          width: csHam.width,
          height: csHam.height,
          display: csHam.display
        } : null
      };
    })()`,
    returnByValue: true
  });
  fs.writeFileSync(`${outDir}\\mobile_header_spec.json`, JSON.stringify(mobileHeaderSpec.result.value, null, 2));

  const ssMobileHeader = await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 100, scale: 1 }
  });
  fs.writeFileSync(`${outDir}\\ref_header_390.png`, Buffer.from(ssMobileHeader.data, 'base64'));

  await session.close();
  chrome.kill();
  console.log('Heedhive inspection completed successfully!');
}

main().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});

