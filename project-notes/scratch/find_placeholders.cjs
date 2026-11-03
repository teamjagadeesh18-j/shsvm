const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(file => {
    if (['node_modules', '.git', 'dist'].includes(file)) return;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) results = results.concat(walk(p));
    else results.push(p);
  });
  return results;
}

const terms = ['demo', 'foo', 'sample', 'example.com', 'lorem', 'Name Surname', '123456', 'Heedhive', 'test'];
const files = walk(clientDir);

files.forEach(f => {
  if (/\.(png|jpe?g|webp|ico|woff2?)$/i.test(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/');

  lines.forEach((l, idx) => {
    const trimmed = l.trim();
    terms.forEach(t => {
      const reg = new RegExp(`\\b${t}\\b`, 'i');
      if (reg.test(trimmed)) {
        // filter out legitimate code uses: .test(, regex, testId, data-testid, Testimonial, etc.
        if (t === 'test' && (trimmed.includes('testimonial') || trimmed.includes('.test(') || trimmed.includes('data-testid'))) return;
        console.log(`${relPath}:${idx + 1} [${t}]: ${trimmed}`);
      }
    });
  });
});

