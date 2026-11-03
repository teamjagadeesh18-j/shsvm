const fs = require('fs');
const path = require('path');

const contentDir = path.resolve(__dirname, '..', 'client', 'src', 'content');
const files = fs.readdirSync(contentDir);

console.log('Content JSON files:', files);

const buzzwords = [
  'comprehensive', 'holistic', 'rigorous', 'foster a lifelong love', 'foster', 'lifelong',
  'state-of-the-art', 'nurturing environment', 'nurturing', 'empower', 'unleash',
  'journey of excellence', 'world-class', 'cutting-edge', 'seamless', 'tailored',
  'dynamic', 'transformative', 'vibrant', 'excellence', 'beacon'
];

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const filePath = path.join(contentDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    buzzwords.forEach(bw => {
      const reg = new RegExp(`\\b${bw}\\b`, 'i');
      if (reg.test(line)) {
        console.log(`[BUZZWORD] ${file}:${lineNum} (${bw}): ${line.trim()}`);
      }
    });

    if (line.includes('—') || line.includes('--')) {
      console.log(`[EM-DASH] ${file}:${lineNum}: ${line.trim()}`);
    }

    if (/\b(100%|98%|95%|\b\d{2,3}%\b|ranked|rank\b|award|awards|top 10|#1)\b/i.test(line)) {
      console.log(`[CLAIM/METRIC] ${file}:${lineNum}: ${line.trim()}`);
    }
  });
});

