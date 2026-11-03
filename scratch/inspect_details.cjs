const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const srcDir = path.join(clientDir, 'src');

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

const allClientFiles = walk(clientDir);

console.log('=== 1. CONSOLE STATEMENTS ===');
allClientFiles.forEach(f => {
  if (!/\.(jsx?|tsx?)$/.test(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (/\bconsole\.(log|debug|info|warn|error)\b/.test(l)) {
      console.log(`${path.relative(rootDir, f).replace(/\\/g, '/')}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

console.log('\n=== 2. DEBUGGER STATEMENTS ===');
allClientFiles.forEach(f => {
  if (!/\.(jsx?|tsx?)$/.test(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (/\bdebugger\b/.test(l)) {
      console.log(`${path.relative(rootDir, f).replace(/\\/g, '/')}:${idx + 1} -> ${l.trim()}`);
    }
  });
});

console.log('\n=== 3. GENERATOR & TOOL TRACES ===');
const indexHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');
console.log('index.html checks:');
if (indexHtml.includes('generator')) console.log('  Has <meta name="generator">');
if (indexHtml.includes('vite.svg')) console.log('  Has vite.svg');
if (indexHtml.includes('Vite')) console.log('  Has Vite reference');
console.log('index.html title:', indexHtml.match(/<title>(.*?)<\/title>/)?.[1]);

const pkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
console.log('package.json dependencies:', Object.keys(pkg.dependencies || {}));
console.log('package.json devDependencies:', Object.keys(pkg.devDependencies || {}));

console.log('\n=== 4. PUBLIC ASSETS IN CLIENT/PUBLIC ===');
const publicFiles = walk(path.join(clientDir, 'public'));
publicFiles.forEach(f => {
  const rel = path.relative(path.join(clientDir, 'public'), f).replace(/\\/g, '/');
  console.log(`  ${rel} (${(fs.statSync(f).size / 1024).toFixed(1)} KB)`);
});

