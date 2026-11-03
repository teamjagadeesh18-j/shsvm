const fs = require('fs');
const path = require('path');
const routes = ['/fees', '/faculty', '/student-life', '/gallery', '/news', '/alumni', '/careers', '/portal'];
function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (/\.(jsx?|tsx?|json)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      routes.forEach(r => {
        if (content.includes(`"${r}"`) || content.includes(`'${r}'`)) {
          console.log(full, r);
        }
      });
    }
  }
}
scan('client/src');

