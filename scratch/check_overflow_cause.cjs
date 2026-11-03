const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9315',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=C:\\tmp\\chrome_overflow_' + Date.now(),
  'about:blank'
]);

(async () => {
  await new Promise(r => setTimeout(r, 1200));
  const listRes = await fetch('http://127.0.0.1:9315/json/list');
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  const overflowReport = await send('Runtime.evaluate', {
    expression: `(() => {
      document.body.style.overflowX = 'visible';
      document.documentElement.style.overflowX = 'visible';

      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;

      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      for (const el of elements) {
        const r = el.getBoundingClientRect();
        if (r.right > docW + 0.5) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            right: r.right,
            width: r.width,
            docW,
            diff: r.right - docW
          });
        }
      }

      return {
        docW,
        scrollW,
        hasOverflow: scrollW > docW,
        overflowing: overflowing.slice(0, 15)
      };
    })()`,
    returnByValue: true
  });

  console.log('OVERFLOW REPORT (with overflowX = visible):', JSON.stringify(overflowReport.result.result.value, null, 2));
  cp.kill('SIGTERM');
})();

