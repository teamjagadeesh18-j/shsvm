const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--user-data-dir=C:\\tmp\\chrome_verify_location',
    'http://localhost:5173/contact'
  ]);

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9226/json/version');
      if (res.ok) break;
    } catch {}
  }

  const listRes = await fetch('http://127.0.0.1:9226/json/list');
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
  const artifactDir = 'C:\\Users\\jagad\\.gemini\\antigravity\\brain\\b3832e7b-9e62-4a3b-993b-481cf86cf330';

  // 1. Desktop Contact Page (1440px)
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/contact' });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll to location card
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.location-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const shotContact = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_contact_location_1440.png'), Buffer.from(shotContact.data, 'base64'));
  console.log('Saved proof_contact_location_1440.png');

  // Hover state test on map card
  await send('Runtime.evaluate', {
    expression: `(() => {
      const mapCard = document.querySelector('.location-map-link-card');
      if (mapCard) mapCard.classList.add('hover-simulated');
    })()`
  });
  // Focus the map card
  await send('Runtime.evaluate', {
    expression: `(() => {
      const mapCard = document.querySelector('.location-map-link-card');
      if (mapCard) mapCard.focus();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  const shotHover = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_contact_location_hover_1440.png'), Buffer.from(shotHover.data, 'base64'));
  console.log('Saved proof_contact_location_hover_1440.png');

  // Verify map card links & attributes
  const mapCardAttr = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.location-map-link-card');
      const iframe = document.querySelector('.location-map-iframe');
      const getDirBtn = Array.from(document.querySelectorAll('.location-btn-group a')).find(a => a.textContent.includes('Directions'));
      const openMapsBtn = Array.from(document.querySelectorAll('.location-btn-group a')).find(a => a.textContent.includes('Google Maps'));
      return {
        cardHref: card ? card.href : null,
        cardTarget: card ? card.target : null,
        cardRel: card ? card.rel : null,
        cardAriaLabel: card ? card.getAttribute('aria-label') : null,
        iframeTabindex: iframe ? iframe.getAttribute('tabindex') : null,
        iframePointerEvents: iframe ? window.getComputedStyle(iframe).pointerEvents : null,
        iframeSrc: iframe ? iframe.src : null,
        directionsHref: getDirBtn ? getDirBtn.href : null,
        openMapsHref: openMapsBtn ? openMapsBtn.href : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Map Card Evaluation:', JSON.stringify(mapCardAttr.result.value, null, 2));

  // 2. Mobile Contact Page (390px)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:5173/contact' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.location-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_contact_location_390.png'), Buffer.from(shotMobile.data, 'base64'));
  console.log('Saved proof_contact_location_390.png');

  // 3. Home Page Location Placement (1440px)
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#home-location');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  const shotHome = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_home_location_1440.png'), Buffer.from(shotHome.data, 'base64'));
  console.log('Saved proof_home_location_1440.png');

  // 4. Footer Map Link Placement (1440px)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.site-footer');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'end' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const shotFooter = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_footer_map_link_1440.png'), Buffer.from(shotFooter.data, 'base64'));
  console.log('Saved proof_footer_map_link_1440.png');

  // 5. Official WhatsApp Logo on Admissions Form
  await send('Page.navigate', { url: 'http://localhost:5173/admissions' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.whatsapp-submit-btn');
      if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  const shotWhatsapp = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_whatsapp_official_logo.png'), Buffer.from(shotWhatsapp.data, 'base64'));
  console.log('Saved proof_whatsapp_official_logo.png');

  // 6. Test with network blocked for google.com
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*google.com/maps*', '*maps.google.com*'] });
  await send('Page.navigate', { url: 'http://localhost:5173/contact' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.location-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  const shotOffline = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'proof_location_offline_network_blocked.png'), Buffer.from(shotOffline.data, 'base64'));
  console.log('Saved proof_location_offline_network_blocked.png');

  ws.close();
  cp.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

