const { spawn } = require('child_process');
const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9308',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=C:\\tmp\\chrome_errs_' + Date.now(),
  'about:blank'
]);

(async () => {
  await new Promise(r => setTimeout(r, 1200));
  const listRes = await fetch('http://127.0.0.1:9308/json/list');
  const pageTargets = await listRes.json();
  const page = pageTargets.find(t => t.type === 'page') || pageTargets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
    }
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
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));
  const res = await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("section, div[id]")).map(s => ({ tag: s.tagName, id: s.id, class: s.className }))',
    returnByValue: true
  });
  console.log('Elements:', JSON.stringify(res.result.result.value, null, 2));

  // Check if .dashboard-card or .dashboard-cards-grid exists anywhere
  const cardCount = await send('Runtime.evaluate', {
    expression: 'document.querySelectorAll(".dashboard-card").length',
    returnByValue: true
  });
  console.log('Dashboard cards count:', cardCount.result.result.value);

  // Check where text 'School Routine' is
  const textCheck = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.includes("School Routine")',
    returnByValue: true
  });
  console.log('Has School Routine text:', textCheck.result.result.value);

  cp.kill('SIGTERM');
})();

