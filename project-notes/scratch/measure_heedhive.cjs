const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\tmp\\chrome_ref_measure',
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
  await send('DOM.enable');
  await new Promise(r => setTimeout(r, 4000));

  const results = {};

  for (const w of [1440, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 900,
      deviceScaleFactor: 1,
      mobile: w <= 768
    });
    await new Promise(r => setTimeout(r, 1000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        function getStyles(el) {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            className: el.className,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            padding: cs.padding,
            paddingTop: cs.paddingTop,
            paddingBottom: cs.paddingBottom,
            paddingLeft: cs.paddingLeft,
            paddingRight: cs.paddingRight,
            margin: cs.margin,
            marginLeft: cs.marginLeft,
            marginRight: cs.marginRight,
            borderRadius: cs.borderRadius,
            backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage : 'none',
            backgroundSize: cs.backgroundSize,
            border: cs.border,
            borderWidth: cs.borderWidth,
            borderColor: cs.borderColor,
            borderStyle: cs.borderStyle,
            boxShadow: cs.boxShadow,
            maxWidth: cs.maxWidth,
            fontSize: cs.fontSize,
            letterSpacing: cs.letterSpacing,
            color: cs.color
          };
        }

        // Find sections
        const allSections = Array.from(document.querySelectorAll('section, main > div, footer, header')).map((el, i) => {
          const cs = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            index: i,
            tagName: el.tagName,
            className: typeof el.className === 'string' ? el.className : '',
            id: el.id,
            rectWidth: rect.width,
            rectHeight: rect.height,
            left: rect.left,
            right: rect.right,
            bg: cs.backgroundColor,
            bgImg: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 60) : 'none',
            padding: cs.padding,
            margin: cs.margin
          };
        }).filter(s => s.rectHeight > 50);

        // Find dark panel (e.g., social media marketing or similar rounded panel)
        const darkElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const cs = window.getComputedStyle(el);
          const bg = cs.backgroundColor;
          const br = parseInt(cs.borderRadius) || 0;
          return (bg.includes('rgb(0, 0, 0)') || bg.includes('rgb(10,') || bg.includes('rgb(18,') || bg.includes('rgb(20,')) && br > 15 && el.getBoundingClientRect().width > 250;
        });

        // Pill element
        const pills = Array.from(document.querySelectorAll('*')).filter(el => {
          const cs = window.getComputedStyle(el);
          const br = parseInt(cs.borderRadius) || 0;
          return br > 20 && el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 35 && el.getBoundingClientRect().height < 45 && el.getBoundingClientRect().height > 20;
        });

        // Buttons
        const outlineBtns = Array.from(document.querySelectorAll('button, a')).filter(el => {
          const cs = window.getComputedStyle(el);
          const bw = parseInt(cs.borderWidth) || 0;
          return bw >= 1 && (el.innerText.toLowerCase().includes('service') || el.innerText.toLowerCase().includes('view') || el.innerText.toLowerCase().includes('consultation'));
        });

        return {
          viewport: ${w},
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          sections: allSections,
          darkPanels: darkElements.slice(0, 3).map(getStyles),
          darkPanelParents: darkElements.slice(0, 3).map(el => getStyles(el.parentElement)),
          pills: pills.slice(0, 4).map(getStyles),
          outlineBtns: outlineBtns.slice(0, 4).map(getStyles)
        };
      })()`,
      returnByValue: true
    });

    results[w] = evalRes.result.value;
  }

  fs.writeFileSync('scratch/heedhive_measurements.json', JSON.stringify(results, null, 2));
  console.log('Saved scratch/heedhive_measurements.json successfully!');

  ws.close();
  cp.kill();
}

run().catch(console.error);
