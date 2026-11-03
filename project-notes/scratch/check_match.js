const l = '    "exploreMoreTitle": "Explore More About SHSVM",';
const patterns = ['tiruppur', 'lorem', '\\[X\\]', 'XX', 'example\\.com', 'placeholder', 'TODO', 'undefined'];
for (const p of patterns) {
  if (new RegExp(p, 'i').test(l)) {
    console.log('Matched:', p);
  }
}

