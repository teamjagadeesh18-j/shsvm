const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9290',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\tmp\\chrome_white_' + Date.now(),
    'about:blank'
  ]);

  try {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9290/json/version');
        if (res.ok) break;
      } catch {}
    }

    const listRes = await fetch('http://127.0.0.1:9290/json/list');
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
    const send = (m, p = {}) => new Promise(r => {
      const mid = id++;
      callbacks.set(mid, { resolve: r });
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    const viewports = [320, 360, 390, 430];
    const results = {};

    for (const width of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: true
      });
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await new Promise(r => setTimeout(r, 2000));

      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const vpW = window.innerWidth;
            const scrollW = document.documentElement.scrollWidth;
            const clientW = document.documentElement.clientWidth;

            const violations = [];
            // Check all sections on Home page
            const sections = document.querySelectorAll('section');
            sections.forEach((sec, sIdx) => {
              const secId = sec.id || sec.className;
              const isDark = sec.classList.contains('section-dark') || sec.querySelector('.dark-panel') || secId.includes('holistic') || secId.includes('campus');
              if (isDark) return; // Only white / light sections

              // Check text elements in this section
              const textEls = sec.querySelectorAll('h1, h2, h3, h4, p, span, a, button, .section-pill, .badge-item, .program-card, .location-card, .timeline-card');
              textEls.forEach(el => {
                if (el.closest('.marquee') || el.closest('.mobile-drawer') || el.closest('.testimonials-marquee')) return;
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) return;

                // Gutter is 16px minimum
                if (r.left < 14) {
                  violations.push({
                    secId,
                    tag: el.tagName,
                    cls: el.className,
                    text: el.textContent.trim().substring(0, 35),
                    type: 'left_gutter',
                    val: r.left
                  });
                }
                if (r.right > vpW - 14) {
                  violations.push({
                    secId,
                    tag: el.tagName,
                    cls: el.className,
                    text: el.textContent.trim().substring(0, 35),
                    type: 'right_gutter',
                    val: r.right,
                    vpW
                  });
                }
                // Check if element's content overflows itself
                if (el.scrollWidth > el.clientWidth + 2 && style.overflow !== 'visible' && !el.closest('svg')) {
                  violations.push({
                    secId,
                    tag: el.tagName,
                    cls: el.className,
                    text: el.textContent.trim().substring(0, 35),
                    type: 'self_overflow',
                    scrollW: el.scrollWidth,
                    clientW: el.clientWidth
                  });
                }
              });
            });

            return {
              width: vpW,
              pageOverflow: scrollW > clientW,
              scrollW,
              clientW,
              violations
            };
          })()
        `,
        returnByValue: true
      });

      results[width] = evalRes.result.value;
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    cp.kill();
  }
})();

