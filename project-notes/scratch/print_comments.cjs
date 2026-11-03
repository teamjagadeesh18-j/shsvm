const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'scratch', 'inventory_raw.json'), 'utf8'));

console.log(`Total comment traces found: ${raw.commentTraces.length}`);

// Group by match or file
const byFile = {};
raw.commentTraces.forEach(c => {
  if (!byFile[c.file]) byFile[c.file] = [];
  byFile[c.file].push(c);
});

Object.keys(byFile).forEach(file => {
  console.log(`\n--- ${file} (${byFile[file].length} traces) ---`);
  byFile[file].slice(0, 10).forEach(c => {
    console.log(`  Line ${c.line} [${c.match}]: ${c.text.substring(0, 80)}`);
  });
  if (byFile[file].length > 10) {
    console.log(`  ... and ${byFile[file].length - 10} more`);
  }
});

