const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const cp = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9277', '--user-data-dir=C:\\tmp\\debug_elem_' + Date.now(), 'about:blank']);
  try {
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9277/json/version');
        if (res.ok) break;
      } catch {}
    }
    const listRes = await fetch('http://127.0.0.1:9277/json/list');
    const pageTargets = await listRes.json();
    const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();
    await new Promise(r => ws.onopen = r);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) callbacks.get(msg.id).resolve(msg.result);
    };
    const send = (m, p = {}) => new Promise(r => {
      const mid = id++;
      callbacks.set(mid, { resolve: r });
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 900, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 3000));
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.ib-flow-card');
          if (!card) return 'NO CARD';
          const cb = card.getBoundingClientRect();
          const errs = [];
          card.querySelectorAll('*').forEach(child => {
            const b = child.getBoundingClientRect();
            if (b.left < cb.left - 2 || b.right > cb.right + 2) {
              errs.push({
                tag: child.tagName,
                cls: child.className.baseVal || child.className,
                rect: { left: b.left, right: b.right, cardLeft: cb.left, cardRight: cb.right },
                outerHTML: child.outerHTML.substring(0, 140)
              });
            }
          });
          return errs;
        })()
      `,
      returnByValue: true
    });
    console.log('HREF:', await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true }));
    console.log('TITLES:', await send('Runtime.evaluate', { expression: 'document.title + " | " + document.querySelectorAll("section").length', returnByValue: true }));
    console.log('RES:', JSON.stringify(res.result.value, null, 2));
  } finally {
    cp.kill();
  }
})();
