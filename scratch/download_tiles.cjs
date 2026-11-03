const fs = require('fs');
const path = require('path');

const tilesDir = path.resolve(__dirname, 'tiles');
if (!fs.existsSync(tilesDir)) fs.mkdirSync(tilesDir, { recursive: true });

async function downloadTiles() {
  const z = 15;
  const xMin = 23667;
  const xMax = 23671; // 5 columns
  const yMin = 15174;
  const yMax = 15178; // 5 rows

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      const tilePath = path.join(tilesDir, `${z}_${x}_${y}.png`);
      if (fs.existsSync(tilePath)) continue;

      const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      console.log(`Fetching tile ${z}/${x}/${y}...`);
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'SHSVM-School-Site/1.0 (educational website)' }
        });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(tilePath, buf);
        } else {
          console.error(`Failed ${url}: ${res.status}`);
        }
      } catch (err) {
        console.error(`Error fetching ${url}:`, err.message);
      }
      // slight delay to be polite to OSM
      await new Promise(r => setTimeout(r, 100));
    }
  }
  console.log('All tiles downloaded.');
}

downloadTiles();

