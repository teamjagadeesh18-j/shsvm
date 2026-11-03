const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'client', 'src');

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

const files = walk(srcDir);

console.log('=== A. LAB / STEM MENTIONS ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  lines.forEach((l, idx) => {
    if (/\b(lab|labs|stem|laboratory)\b/i.test(l)) {
      console.log(`${rel}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

console.log('\n=== B. EM-DASHES (—) IN CONTENT/SOURCE ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  lines.forEach((l, idx) => {
    if (l.includes('—') || l.includes('&mdash;')) {
      console.log(`${rel}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

console.log('\n=== C. PERCENTAGE / 100% CLAIMS ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  lines.forEach((l, idx) => {
    if (/\b(100%|100\s*%|\b\d{2,3}%\b)/.test(l)) {
      console.log(`${rel}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

console.log('\n=== D. ALT TEXT STARTING WITH "image of" / "photo of" ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  lines.forEach((l, idx) => {
    if (/alt=(["'])(\s*(image|photo|picture)\s+of)/i.test(l) || /"alt":\s*(["'])(\s*(image|photo|picture)\s+of)/i.test(l)) {
      console.log(`${rel}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

