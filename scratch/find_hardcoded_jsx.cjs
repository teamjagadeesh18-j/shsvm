const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'client', 'src');

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

const files = walk(srcDir).filter(f => /\.(jsx?|tsx?)$/.test(f));

// Look for JSX text outside of {t('...')} or variable interpolation
console.log(`Auditing ${files.length} JSX/TSX files for hardcoded strings...`);
const findings = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(path.resolve(__dirname, '..'), f).replace(/\\/g, '/');

  lines.forEach((l, idx) => {
    // Check if line contains JSX text like >Some text< or aria-label="Some text"
    const match = l.match(/>([A-Za-z][A-Za-z0-9 ,.'-]{4,})</);
    if (match) {
      const text = match[1].trim();
      // Ignore common non-copy terms
      if (!['className', 'style', 'button', 'div', 'span', 'svg', 'path'].includes(text)) {
        findings.push({ file: rel, line: idx + 1, text });
      }
    }
  });
});

console.log(`Found ${findings.length} potential hardcoded strings in JSX`);
findings.slice(0, 20).forEach(hit => {
  console.log(`${hit.file}:${hit.line} -> "${hit.text}"`);
});
if (findings.length > 20) {
  console.log(`... and ${findings.length - 20} more`);
}

