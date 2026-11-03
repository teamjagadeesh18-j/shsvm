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

const files = walk(srcDir).filter(f => /\.(jsx?|tsx?|css)$/.test(f));

let modifiedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove Heedhive mentions
  content = content.replace(/Exact parity with Heedhive reference dark footer/gi, 'School Footer Navigation');
  content = content.replace(/\* Styled in exact visual parity with the Heedhive reference dark footer/gi, '* School Footer Component');
  content = content.replace(/Matches https:\/\/heedhive\.in computed specs/gi, 'Header Navigation Bar');
  content = content.replace(/Orchestrates subcomponents matching https:\/\/heedhive\.in\/services layout/gi, 'About School Page Orchestration');
  content = content.replace(/\/\* Section Layout System \(Reference from heedhive\.in\) \*\//gi, '/* Section Layout System */');

  // Remove narrative "matches reference" comments
  content = content.replace(/Matches Reference Images \(media_.*?\)/gi, 'School Highlights Marquee Ticker');
  content = content.replace(/\(Matches Reference: 14px radius, 42px height, flat NO shadow\)/gi, '');
  content = content.replace(/\(Fully Rounded, 14px font, matches Reference\)/gi, '');
  content = content.replace(/\(Matches Reference: Clean two-line menu button visible on desktop & mobile\)/gi, '');
  content = content.replace(/\(Matches Reference Solid Black Background\)/gi, '');
  content = content.replace(/\(Matches Reference Bold Sans Typography\)/gi, '');
  content = content.replace(/Uses the official logo blue colour instead of yellow, matching reference structure! \*\//gi, '*/');
  content = content.replace(/\(Matches Reference Glyph\)/gi, '');
  content = content.replace(/matching reference mobile navigation/gi, 'Mobile Navigation Drawer');
  content = content.replace(/\/\/ If dual is requested or variant is dark, render the dual-line marquee matching reference/gi, '// Render dual-line marquee for dark variant');
  content = content.replace(/\(matches Reference Image 4\)/gi, '');
  content = content.replace(/\(Section 08 - Matches Reference 'Let's Build'\)/gi, '');
  content = content.replace(/\(Section 03 - Matches Reference 'Websites 24\/7'\)/gi, '');
  content = content.replace(/\(Matches Reference 'Explore Our Services'\)/gi, '');
  content = content.replace(/\(Matches Reference Image 3 'Instagram Packages'\)/gi, '');
  content = content.replace(/\(Matches Reference Image 3\)/gi, '');
  content = content.replace(/\(Section 02 - Matches Reference Images 4 & 5\)/gi, '');
  content = content.replace(/\(Section 01 - Matches Reference Images 2 & 3\)/gi, '');
  content = content.replace(/\(Matches Reference Image 2: \| Our Process\)/gi, '');
  content = content.replace(/\(Matches Reference 01-07\)/gi, '');
  content = content.replace(/\(Matches Reference 'Results Delivered'\)/gi, '');
  content = content.replace(/Structured to match reference theme \(dark panel hero, white form card, facts\)/gi, 'Admissions Page Layout');
  content = content.replace(/\(Matching Reference\)/gi, '');
  content = content.replace(/\(Matches Reference\)/gi, '');

  // Remove decorative separator banners like /* ==========================================================================
  content = content.replace(/\/\*\s*={10,}[\s\S]*?={10,}\s*\*\//g, '');
  content = content.replace(/\/\/\s*={10,}/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`Cleaned traces in: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`Finished cleaning comments across ${modifiedCount} files.`);

