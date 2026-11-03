const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=9291', '--no-sandbox', '--disable-gpu', '--user-data-dir=C:\\tmp\\chrome_cycle_before', 'http://localhost:5173/'
]);

setTimeout(async () => {
  try {
    const list = await (await fetch('http://127.0.0.1:9291/json/list')).json();
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
    await new Promise(r => setTimeout(r, 1200));

    // Measure live typing cycle for one phrase
    const measurements = await send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          const el = document.querySelector('.typewriter-text');
          let startEmptyTime = null;
          let fullTypedTime = null;
          let deletedTime = null;
          let initialWord = el.innerText;
          let observedStates = [];

          const interval = setInterval(() => {
            const current = el.innerText;
            const now = performance.now();
            observedStates.push({ t: Math.round(now), text: current });

            if (current === '' && startEmptyTime === null) {
              startEmptyTime = now;
            }
            if (startEmptyTime !== null && current === 'Smile, Study, Serve' && fullTypedTime === null) {
              fullTypedTime = now;
            }
            if (fullTypedTime !== null && current === '' && deletedTime === null) {
              deletedTime = now;
              clearInterval(interval);
              resolve({
                startEmptyTime,
                fullTypedTime,
                deletedTime,
                typingTime: Math.round(fullTypedTime - startEmptyTime),
                cycleTime: Math.round(deletedTime - startEmptyTime),
                observedCount: observedStates.length
              });
            }
          }, 10);

          // Fallback timeout after 6 seconds
          setTimeout(() => {
            clearInterval(interval);
            resolve({ timedOut: true, observedStates: observedStates.slice(0, 10) });
          }, 6000);
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('BEFORE Measurements:', measurements?.result?.value);
    cp.kill();
  } catch(e) {
    console.error(e);
    cp.kill();
  }
}, 1500);

