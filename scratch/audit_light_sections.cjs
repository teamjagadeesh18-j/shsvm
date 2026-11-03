const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9280',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\tmp\\chrome_audit_' + Date.now(),
    'about:blank'
  ]);

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9280/json/version');
        if (res.ok) { ready = true; break; }
      } catch {}
    }
    if (!ready) throw new Error('Chrome did not start on 9280');

    const listRes = await fetch('http://127.0.0.1:9280/json/list');
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

    console.log('=== AUDITING VIEWPORTS: 320, 360, 390, 430 ===');
    const viewports = [320, 360, 390, 430];
    const auditResults = {};

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

            // Find all light sections (or sections not .dark-panel)
            const textNodes = [];
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_ELEMENT,
              {
                acceptNode: (el) => {
                  const style = window.getComputedStyle(el);
                  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    return NodeFilter.FILTER_REJECT;
                  }
                  // Check if it directly contains meaningful text
                  const hasDirectText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
                  if (hasDirectText && (el.matches('h1, h2, h3, h4, p, span, a, button, li, .badge-item, .pill') || el.children.length === 0)) {
                    return NodeFilter.FILTER_ACCEPT;
                  }
                  return NodeFilter.FILTER_SKIP;
                }
              }
            );

            let node;
            const gutterViolations = [];
            while ((node = walker.nextNode())) {
              const rect = node.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;

              // Ignore marquee and testimonials slider track which scrolls horizontally
              if (node.closest('.marquee') || node.closest('.marquee-track') || node.closest('.marquee-row') || node.closest('.testimonials-marquee') || node.closest('.community-testimonials-track') || node.closest('.mobile-drawer')) continue;
              // Ignore offscreen elements
              if (rect.right > vpW * 3 || rect.left < -vpW * 2) continue;

              const text = node.textContent.trim().substring(0, 40);
              const isDark = node.closest('.dark-panel') || node.closest('.section-dark') || node.closest('#holistic') || node.closest('#campus-life');

              // Check if touches screen edge: gutter is 16px
              if (rect.left < 14) {
                gutterViolations.push({
                  type: 'left_gutter',
                  text,
                  tag: node.tagName,
                  class: node.className,
                  left: rect.left,
                  isDark: !!isDark
                });
              }
              if (rect.right > vpW - 14) {
                gutterViolations.push({
                  type: 'right_gutter',
                  text,
                  tag: node.tagName,
                  class: node.className,
                  right: rect.right,
                  vpW,
                  isDark: !!isDark
                });
              }
            }

            return {
              width: vpW,
              scrollW,
              clientW,
              overflow: scrollW - clientW,
              gutterViolations
            };
          })()
        `,
        returnByValue: true
      });

      auditResults[width] = evalRes.result.value;
      console.log(`Width ${width}: overflow = ${evalRes.result.value.overflow}px, violations = ${evalRes.result.value.gutterViolations.length}`);
    }

    console.log(JSON.stringify(auditResults, null, 2));
  } finally {
    cp.kill();
  }
})();
