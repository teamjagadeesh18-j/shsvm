const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');

function walk(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build', '.system_generated']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (excludeDirs.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath, excludeDirs));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const terms = [
  'heedhive', 'Thangamani', 'Claude', 'Gemini', 'ChatGPT', 'Copilot', 'Anti-Gravity', 'Antigravity',
  'as requested', 'per the brief', 'matches reference', 'match reference', 'matching reference',
  'Phase', 'Batch', 'F-0', 'NF-0', 'TODO', 'FIXME', 'lorem', 'foo', 'bar', '123456', 'Name Surname',
  'example.com'
];

const files = walk(clientDir);
const findings = [];

files.forEach(f => {
  if (/\.(png|jpe?g|webp|ico|woff2?)$/i.test(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/');

  lines.forEach((l, idx) => {
    terms.forEach(t => {
      const reg = new RegExp(`\\b${t}\\b`, 'i');
      if (reg.test(l)) {
        findings.push({
          file: relPath,
          line: idx + 1,
          term: t,
          text: l.trim()
        });
      }
    });
  });
});

console.log(`Found ${findings.length} exact keyword hits across client/`);
findings.forEach(hit => {
  console.log(`${hit.file}:${hit.line} [${hit.term}]: ${hit.text}`);
});

