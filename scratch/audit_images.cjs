const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const publicDir = path.join(clientDir, 'public');
const srcDir = path.join(clientDir, 'src');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) results = results.concat(walk(p));
    else results.push(p);
  });
  return results;
}

const allPublicImages = walk(path.join(publicDir, 'images'));
const allCodeFiles = walk(srcDir).filter(f => /\.(jsx?|tsx?|css|json|html)$/.test(f));
allCodeFiles.push(path.join(clientDir, 'index.html'));

const allCodeText = allCodeFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

console.log('=== IMAGE USAGE AUDIT ===');
allPublicImages.forEach(img => {
  const base = path.basename(img);
  const rel = path.relative(publicDir, img).replace(/\\/g, '/');
  const isUsed = allCodeText.includes(base) || allCodeText.includes(rel);
  console.log(`${rel}: ${isUsed ? 'USED' : 'UNUSED'}`);
});

