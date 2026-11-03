const fs = require('fs');
const path = require('path');

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getAllFiles(path.resolve('client/src'));
const oldPatterns = [
  /421\s*247\s*1999/,
  /94433/,
  /shsvmschool\.edu\.in/,
  /tiruppur/i
];

let found = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  oldPatterns.forEach(pat => {
    if (pat.test(content)) {
      console.log('Found:', pat, 'in', f);
      found++;
    }
  });
});

console.log('Total old value occurrences in client/src:', found);

