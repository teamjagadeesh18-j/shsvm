const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const srcDir = path.join(clientDir, 'src');

function walk(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build', '.system_generated']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(file => {
    if (excludeDirs.includes(file)) return;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) results = results.concat(walk(p, excludeDirs));
    else results.push(p);
  });
  return results;
}

// 1. Scan comments for Heedhive, Reference, Reviewer comments
const allFiles = walk(srcDir);
const commentHits = [];

allFiles.forEach(f => {
  if (/\.(png|jpe?g|webp|ico|woff2?)$/i.test(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');

  lines.forEach((l, idx) => {
    const trimmed = l.trim();
    const lineNum = idx + 1;
    // Check for heedhive, matches reference, etc.
    if (/heedhive/i.test(trimmed)) {
      commentHits.push({ file: rel, line: lineNum, text: trimmed, reason: 'Heedhive reference citation', action: 'Remove' });
    } else if (/(matches|matching|match)\s+reference/i.test(trimmed)) {
      commentHits.push({ file: rel, line: lineNum, text: trimmed, reason: 'Narrative "matches reference" comment', action: 'Remove' });
    } else if (/^(\/\*|\/\/|\*)\s*={5,}/.test(trimmed) || /^(\/\*|\/\/|\*)\s*-{5,}/.test(trimmed)) {
      commentHits.push({ file: rel, line: lineNum, text: trimmed, reason: 'Decorative banner / separator comment', action: 'Remove' });
    }
  });
});

console.log(`Found ${commentHits.length} comment traces to remove/rewrite`);
fs.writeFileSync(path.join(rootDir, 'scratch', 'comment_hits.json'), JSON.stringify(commentHits, null, 2));

