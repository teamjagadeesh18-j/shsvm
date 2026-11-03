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

const allFiles = walk(srcDir);
const allCodeFiles = allFiles.filter(f => /\.(jsx?|tsx?|css|json)$/.test(f));

// Read content of all code files
const fileContents = allCodeFiles.map(f => ({
  file: f,
  rel: path.relative(rootDir, f).replace(/\\/g, '/'),
  content: fs.readFileSync(f, 'utf8')
}));

console.log(`Checking ${allCodeFiles.length} files in client/src for usage...`);

const unused = [];

allCodeFiles.forEach(target => {
  const baseName = path.basename(target, path.extname(target));
  const fullBase = path.basename(target);
  const relPath = path.relative(rootDir, target).replace(/\\/g, '/');

  // Entry files
  if (['main.jsx', 'App.jsx', 'index.css'].includes(fullBase)) return;

  // Check if baseName or fullBase appears as an import in any other file
  let isReferenced = false;

  for (const src of fileContents) {
    if (src.file === target) continue;
    // Check if imported
    if (src.content.includes(baseName) || src.content.includes(fullBase)) {
      isReferenced = true;
      break;
    }
  }

  if (!isReferenced) {
    unused.push(relPath);
  }
});

console.log('Potentially unused files in client/src:', unused);

