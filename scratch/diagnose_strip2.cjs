const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9312',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=C:\\tmp\\chrome_strip2_' + Date.now(),
  'about:blank'
]);

(async () => {
  await new Promise(r => setTimeout(r, 1200));
  const listRes = await fetch('http://127.0.0.1:9312/json/list');
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

  const data = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('#campus-life');
      const darkPanel = panel ? panel.querySelector('.dark-panel') : null;
      const grid = panel ? panel.querySelector('.dashboard-cards-grid') : null;
      const windowWidth = window.innerWidth;
      const docClientW = document.documentElement.clientWidth;
      const docScrollW = document.documentElement.scrollWidth;

      const pR = panel ? panel.getBoundingClientRect() : null;
      const dpR = darkPanel ? darkPanel.getBoundingClientRect() : null;
      const gR = grid ? grid.getBoundingClientRect() : null;

      // Find any element whose right > docClientW or whose background creates a white strip
      const rightGaps = [];
      document.querySelectorAll('section, .panel-section, .dark-panel, .full-bleed-section').forEach(el => {
        const r = el.getBoundingClientRect();
        rightGaps.push({
          id: el.id,
          class: el.className,
          left: r.left,
          right: r.right,
          width: r.width,
          marginInline: getComputedStyle(el).marginInline || (getComputedStyle(el).marginLeft + ' ' + getComputedStyle(el).marginRight),
          paddingInline: getComputedStyle(el).paddingLeft + ' ' + getComputedStyle(el).paddingRight
        });
      });

      return {
        windowWidth,
        docClientW,
        docScrollW,
        panelRect: pR ? { left: pR.left, right: pR.right, width: pR.width } : null,
        darkPanelRect: dpR ? { left: dpR.left, right: dpR.right, width: dpR.width } : null,
        gridRect: gR ? { left: gR.left, right: gR.right, width: gR.width } : null,
        rightGaps
      };
    })()`,
    returnByValue: true
  });

  console.log('MEASUREMENTS:', JSON.stringify(data.result.result.value, null, 2));
  cp.kill('SIGTERM');
})();

