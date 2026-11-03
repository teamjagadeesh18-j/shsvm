const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9320',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=C:\\tmp\\chrome_widths_' + Date.now(),
  'about:blank'
]);

(async () => {
  await new Promise(r => setTimeout(r, 1200));
  const listRes = await fetch('http://127.0.0.1:9320/json/list');
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

  const widths = [1440, 1024, 768, 430, 390, 360, 320];

  for (const w of widths) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 800,
      deviceScaleFactor: 1,
      mobile: w < 768
    });
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        // Temporarily unset body overflow-x to see true element overflowing
        const prev = document.body.style.overflowX;
        document.body.style.overflowX = 'visible';
        document.documentElement.style.overflowX = 'visible';

        const clientW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const diff = scrollW - clientW;

        const offenders = [];
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > clientW + 1) {
            offenders.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              right: Math.round(r.right),
              width: Math.round(r.width),
              overflowPx: Math.round(r.right - clientW)
            });
          }
        });

        document.body.style.overflowX = prev;
        return { width: ${w}, clientW, scrollW, diff, offenders: offenders.slice(0, 5) };
      })()`,
      returnByValue: true
    });
    console.log('WIDTH ' + w + ':', JSON.stringify(check.result.result.value, null, 2));
  }

  cp.kill('SIGTERM');
})();

