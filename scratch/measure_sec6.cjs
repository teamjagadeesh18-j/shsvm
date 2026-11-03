const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\tmp\\chrome_ref_sec6',
  'https://heedhive.in'
]);

async function run() {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) break;
    } catch {}
  }
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id).resolve(msg.result);
      callbacks.delete(msg.id);
    }
  };
  const send = (m, p = {}) => new Promise(res => {
    const mid = id++;
    callbacks.set(mid, { resolve: res });
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 3000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const s6 = document.querySelector('section.bg-neutral-950') || document.querySelector('.rounded-3xl.bg-neutral-950');
      if (!s6) return { error: 's6 not found' };

      // Look for SVGs or elements with background-image or grid
      const allChildren = Array.from(s6.querySelectorAll('*'));
      
      const gridEls = allChildren.filter(el => {
        const cs = window.getComputedStyle(el);
        return (cs.backgroundImage && cs.backgroundImage !== 'none') || el.tagName.toLowerCase() === 'svg';
      });

      // Pill in s6
      const pills = allChildren.filter(el => {
        const cs = window.getComputedStyle(el);
        return cs.borderRadius.includes('9999px') || parseInt(cs.borderRadius) >= 20;
      });
      
      // Button in s6
      const btns = allChildren.filter(el => {
        return el.tagName === 'BUTTON' || el.tagName === 'A' && (el.innerText.includes('Services') || el.className.includes('border'));
      });

      function inspect(el) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          className: el.className,
          text: el.innerText ? el.innerText.trim().slice(0, 50) : '',
          rect: { w: rect.width, h: rect.height, l: rect.left, t: rect.top },
          cs: {
            padding: cs.padding,
            margin: cs.margin,
            borderRadius: cs.borderRadius,
            backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage ? cs.backgroundImage.slice(0, 80) : 'none',
            backgroundSize: cs.backgroundSize,
            border: cs.border,
            borderWidth: cs.borderWidth,
            borderColor: cs.borderColor,
            color: cs.color,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            letterSpacing: cs.letterSpacing,
            gap: cs.gap,
            display: cs.display
          }
        };
      }

      return {
        s6: inspect(s6),
        pills: pills.slice(0, 3).map(inspect),
        btns: btns.slice(0, 3).map(inspect),
        gridPatternSVGs: Array.from(s6.querySelectorAll('svg pattern')).map(p => p.outerHTML),
        allSVGs: Array.from(s6.querySelectorAll('svg')).map(s => ({
          className: s.className.baseVal || s.className,
          w: s.getAttribute('width') || s.getBoundingClientRect().width,
          h: s.getAttribute('height') || s.getBoundingClientRect().height,
          outerHTML: s.outerHTML.slice(0, 150)
        }))
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
  cp.kill();
}

run().catch(console.error);
