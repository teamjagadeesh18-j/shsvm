const fs = require('fs');
const path = require('path');

const KEY = 'shsvm9e624a3b993b481cf86cf330';
const settingsPath = path.resolve(__dirname, '../src/content/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const siteUrl = settings.siteUrl || 'https://shsvm-school.edu.in';
const host = new URL(siteUrl).hostname;

const urlList = [
  `${siteUrl}/`,
  `${siteUrl}/about`,
  `${siteUrl}/academics`,
  `${siteUrl}/admissions`,
  `${siteUrl}/campus`,
  `${siteUrl}/contact`,
  `${siteUrl}/faq`
];

async function submitIndexNow() {
  console.log(`Pinging IndexNow for host: ${host} (${urlList.length} URLs)...`);
  const payload = {
    host,
    key: KEY,
    keyLocation: `${siteUrl}/${KEY}.txt`,
    urlList
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    console.log(`IndexNow response status: ${res.status} (${res.statusText})`);
    if (res.status === 200 || res.status === 202) {
      console.log('Successfully submitted URL list to IndexNow (Bing & Yandex).');
    } else {
      console.log(`IndexNow returned HTTP ${res.status}. Payload acknowledged.`);
    }
  } catch (err) {
    console.warn(`IndexNow submission notice (offline/local): ${err.message}`);
  }
}

submitIndexNow();

