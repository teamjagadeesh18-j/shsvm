const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9289;

(async () => {
  const cp = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\tmp\\test_html',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);

  let id = 1;
  const map = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Console.messageAdded') {
      console.log('BROWSER LOG:', m.params.message.text);
    }
    if (m.id && map.has(m.id)) {
      map.get(m.id)(m);
      map.delete(m.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(r => {
      const i = id++;
      map.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Console.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await new Promise(r => setTimeout(r, 3000));

  const html = await send('Runtime.evaluate', { expression: 'document.body.innerHTML', returnByValue: true });
  console.log('HTML snippet:', html.result.result.value.substring(0, 500));

  ws.close();
  cp.kill();
})();

