const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'scratch', 'inventory_raw.json'), 'utf8'));

console.log('=== ANIMATION BASELINE ===');
raw.baseline.forEach(b => {
  console.log(`[${b.type}] ${b.file}:${b.line} -> ${b.name}`);
});

