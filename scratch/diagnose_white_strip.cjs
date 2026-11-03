const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9310',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=C:\\tmp\\chrome_white_strip_' + Date.now(),
  'about:blank'
]);

(async () => {
  await new Promise(r => setTimeout(r, 1200));
  const listRes = await fetch('http://127.0.0.1:9310/json/list');
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

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('#campus-life');
      const body = document.body;
      const html = document.documentElement;

      const panelRect = panel ? panel.getBoundingClientRect() : null;
      const panelStyle = panel ? getComputedStyle(panel) : null;
      const bodyStyle = getComputedStyle(body);
      const htmlStyle = getComputedStyle(html);

      // Check parents of panel
      let p = panel;
      const ancestry = [];
      while (p) {
        ancestry.push({
          tag: p.tagName,
          id: p.id,
          class: p.className,
          rect: p.getBoundingClientRect(),
          bg: getComputedStyle(p).backgroundColor,
          overflow: getComputedStyle(p).overflow
        });
        p = p.parentElement;
      }

      return {
        panelRect,
        panelBg: panelStyle ? panelStyle.backgroundColor : null,
        bodyBg: bodyStyle.backgroundColor,
        htmlBg: htmlStyle.backgroundColor,
        docWidth: html.clientWidth,
        scrollWidth: html.scrollWidth,
        ancestry
      };
    })()`,
    returnByValue: true
  });

  console.log('White strip diagnosis:', JSON.stringify(info.result.result.value, null, 2));
  cp.kill('SIGTERM');
})();

