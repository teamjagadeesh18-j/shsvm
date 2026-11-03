const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'project-notes', 'full_error_audit_report.json'), 'utf8'));

console.log('=== AUDIT SUMMARY ===');
console.log('1. A11y:');
console.log(JSON.stringify(report.a11y, null, 2));

console.log('\n2. SEO:');
console.log(JSON.stringify(report.seo, null, 2));

console.log('\n3. Animations:');
console.log(JSON.stringify(report.animations, null, 2));

console.log('\n4. Forms:');
console.log(JSON.stringify(report.forms, null, 2));

console.log('\n5. Links (total):', report.links.length);
const deadLinks = report.links.filter(l => l.isDead);
console.log('Dead links (# or empty):', deadLinks.length);
const externalInsecure = report.links.filter(l => l.isExternal && !l.hasProperSecurity);
console.log('External insecure links:', externalInsecure.length);
if (externalInsecure.length > 0) {
  console.log(externalInsecure);
}

console.log('\n6. Oversized assets (>300KB):');
console.log(report.assets.oversized);

