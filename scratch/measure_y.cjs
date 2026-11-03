const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=9298', '--no-sandbox', '--disable-gpu', '--user-data-dir=C:\\tmp\\chrome_y', 'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await (await fetch('http://127.0.0.1:9298/json/list')).json();
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
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 1500));

    for (const w of [1440, 1024, 768, 390]) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
      await new Promise(r => setTimeout(r, 400));
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const s = document.querySelector(".hero-section").getBoundingClientRect(); const t = document.querySelector(".hero-bento-title").getBoundingClientRect(); const sub = document.querySelector(".hero-bento-subtext").getBoundingClientRect(); const act = document.querySelector(".hero-bento-actions").getBoundingClientRect(); return { w: window.innerWidth, sectionH: Math.round(s.height), titleTopRel: Math.round(t.top - s.top), titleBottomRel: Math.round(t.bottom - s.top), subtextTopRel: Math.round(sub.top - s.top), actTopRel: Math.round(act.top - s.top), midPointRel: Math.round((t.bottom + act.top)/2 - s.top), midPercent: (((t.bottom + act.top)/2 - s.top) / s.height * 100).toFixed(1) + "%" }; })()',
        returnByValue: true
      });
      console.log(JSON.stringify(res));
    }
    cp.kill();
  } catch(e) {
    console.error(e);
    cp.kill();
  }
}, 1500);
