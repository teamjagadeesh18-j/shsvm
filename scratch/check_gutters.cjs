const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=9299', '--no-sandbox', '--disable-gpu', '--user-data-dir=C:\\tmp\\chrome_gutter', 'http://localhost:5173/'
]);

setTimeout(async () => {
  try {
    const list = await (await fetch('http://127.0.0.1:9299/json/list')).json();
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p={}) {
      return new Promise(r => {
        const mid = id++;
        ws.send(JSON.stringify({id: mid, method: m, params: p}));
        ws.onmessage = e => {
          const d = JSON.parse(e.data);
          if (d.id === mid) r(d.result);
        };
      });
    }

    const results = [];
    for (const w of [430, 390, 360, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: true });
      await new Promise(r => setTimeout(r, 200));
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const r = document.querySelector(".hero-grid-layout").getBoundingClientRect(); return { viewportWidth: window.innerWidth, left: r.left, right: r.right, gutterLeft: Math.round(r.left), gutterRight: Math.round(window.innerWidth - r.right) }; })()',
        returnByValue: true
      });
      results.push(res.result.value);
    }
    console.log(JSON.stringify(results, null, 2));
    cp.kill();
  } catch(e) {
    console.error(e);
    cp.kill();
  }
}, 1500);

