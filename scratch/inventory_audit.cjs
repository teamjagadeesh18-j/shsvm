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
const allRootFiles = fs.readdirSync(rootDir).map(f => path.join(rootDir, f));

// 1. ANIMATION_BASELINE detection
const baseline = [];

// Check CSS files for @keyframes, transitions, animation
allClientFiles.filter(f => f.endsWith('.css')).forEach(filePath => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.includes('@keyframes')) {
      const match = line.match(/@keyframes\s+([a-zA-Z0-9_-]+)/);
      if (match) {
        baseline.push({
          file: relPath,
          line: idx + 1,
          type: 'CSS Keyframe Animation',
          name: match[1],
          mechanism: 'CSS @keyframes'
        });
      }
    }
  });
});

// Check JS/TS files for animation mechanisms, intervals, requestAnimationFrame, IntersectionObserver, scroll listeners
allClientFiles.filter(f => /\.(jsx?|tsx?)$/.test(f)).forEach(filePath => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.includes('requestAnimationFrame')) {
      baseline.push({ file: relPath, line: idx + 1, type: 'JS Animation Loop', name: 'requestAnimationFrame', mechanism: 'requestAnimationFrame loop' });
    }
    if (line.includes('IntersectionObserver')) {
      baseline.push({ file: relPath, line: idx + 1, type: 'Scroll Reveal / Observer', name: 'IntersectionObserver', mechanism: 'IntersectionObserver' });
    }
    if (line.includes('addEventListener') && (line.includes('scroll') || line.includes('resize'))) {
      baseline.push({ file: relPath, line: idx + 1, type: 'Scroll / Resize Listener', name: line.trim(), mechanism: 'Window event listener' });
    }
    if (line.includes('useTypewriter') || (relPath.includes('Hero') && line.includes('setInterval'))) {
      baseline.push({ file: relPath, line: idx + 1, type: 'Hero Typing Animation', name: 'Typing Interval', mechanism: 'Timer interval' });
    }
    if (line.includes('useScrollProgress') || line.includes('scrollProgress')) {
      baseline.push({ file: relPath, line: idx + 1, type: 'Scroll Progress', name: 'Scroll Progress Tracker', mechanism: 'Scroll-linked state' });
    }
  });
});

// 2. CODE AND COMMENT TRACES
// Keywords: AI, Claude, Gemini, ChatGPT, Copilot, Anti-Gravity, Antigravity, "generated", "as requested", "per the brief", "matches reference", "Phase", "Batch", "F-0", "NF-0", "TODO", "FIXME", "heedhive", "Thangamani"
const aiKeywords = [
  /\bAI\b/i, /\bClaude\b/i, /\bGemini\b/i, /\bChatGPT\b/i, /\bCopilot\b/i,
  /Anti-Gravity/i, /Antigravity/i, /\bgenerated\b/i, /as requested/i, /per the brief/i,
  /matches reference/i, /\bPhase\s*\d+/i, /\bBatch\s*\d+/i, /\bF-0\d+/i, /\bNF-0\d+/i,
  /\bTODO\b/i, /\bFIXME\b/i, /heedhive/i, /Thangamani/i
];

const commentTraces = [];
const consoleTraces = [];
const debuggerTraces = [];
const placeholderTraces = [];
const placeholderRegex = /\b(test|demo|foo|bar|sample|example\.com|lorem|Name Surname|123456|Heedhive)\b/i;

allClientFiles.forEach(filePath => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  // Skip binary/image files
  if (/\.(png|jpe?g|webp|svg|ico|gif|woff2?|ttf|eot)$/i.test(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Check comments
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--');
    if (isComment) {
      for (const kw of aiKeywords) {
        if (kw.test(trimmed)) {
          commentTraces.push({ file: relPath, line: lineNum, text: trimmed, match: kw.toString() });
          break;
        }
      }
      // Decorative separators or long banner comments
      if (/^(\/\*|\/\/|\*|-{3,}|\/{4,}|\*{4,}|={4,})/.test(trimmed) && trimmed.length > 30) {
        if (!commentTraces.some(c => c.file === relPath && c.line === lineNum)) {
          commentTraces.push({ file: relPath, line: lineNum, text: trimmed, match: 'Banner/Separator Comment' });
        }
      }
    }

    // Check consoles & debuggers
    if (/\bconsole\.(log|debug|info|warn|error)\s*\(/.test(trimmed)) {
      consoleTraces.push({ file: relPath, line: lineNum, text: trimmed });
    }
    if (/\bdebugger\s*;?/.test(trimmed)) {
      debuggerTraces.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // Check placeholders (exclude test scripts or comments)
    if (placeholderRegex.test(trimmed)) {
      // Don't flag standard code like testId, regex .test(), etc. unless it's actual demo placeholder
      if (!trimmed.includes('.test(') && !trimmed.includes('test-id') && !trimmed.includes('data-testid')) {
        placeholderTraces.push({ file: relPath, line: lineNum, text: trimmed });
      }
    }
  });
});

// 3. FILES THAT SHOULD NOT SHIP
const filesNotToShip = [];
allRootFiles.forEach(f => {
  const stat = fs.statSync(f);
  const base = path.basename(f);
  if (stat.isFile() && /\.(md|html|js|cjs|ps1)$/.test(base)) {
    if (base.includes('SPEC') || base.includes('REPORT') || base.includes('test') || base.includes('update_logo')) {
      filesNotToShip.push({ path: base, type: 'Root spec / test / report file' });
    }
    if (base === 'MISSING_CONTENT.md') {
      filesNotToShip.push({ path: base, type: 'Project To-Do List (Keep content intact, move to /project-notes)' });
    }
  }
  if (stat.isDirectory() && base === 'scratch') {
    filesNotToShip.push({ path: base, type: 'Agent scratch directory with test scripts' });
  }
});

// 4. GENERATOR AND TOOL TRACES
const generatorTraces = [];
// index.html
const indexHtmlPath = path.join(clientDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const content = fs.readFileSync(indexHtmlPath, 'utf8');
  if (content.includes('generator')) generatorTraces.push({ file: 'client/index.html', issue: '<meta name="generator"> tag present' });
  if (content.includes('vite.svg')) generatorTraces.push({ file: 'client/index.html', issue: 'Default Vite icon referenced' });
  if (content.includes('Vite + React')) generatorTraces.push({ file: 'client/index.html', issue: 'Default Vite + React title' });
}
// README.md
const clientReadme = path.join(clientDir, 'README.md');
if (fs.existsSync(clientReadme)) {
  generatorTraces.push({ file: 'client/README.md', issue: 'Vite template README or AI documentation' });
}
// Public assets
const publicFiles = walk(path.join(clientDir, 'public'));
publicFiles.forEach(f => {
  const base = path.basename(f);
  if (base === 'vite.svg' || base === 'react.svg') {
    generatorTraces.push({ file: path.relative(rootDir, f).replace(/\\/g, '/'), issue: 'Template SVG asset' });
  }
});

// 5. COPY AUDIT (generic, inflated, claims, fake testimonials)
const inflatedWords = [
  'comprehensive', 'holistic', 'rigorous', 'foster a lifelong love', 'state-of-the-art',
  'nurturing environment', 'empower', 'unleash', 'journey of excellence', 'world-class',
  'cutting-edge', 'seamless', 'tailored', 'dynamic', 'transformative'
];

const contentTraces = [];
const jsonFiles = allClientFiles.filter(f => f.endsWith('.json') && f.includes('content'));

jsonFiles.forEach(f => {
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/');
  const raw = fs.readFileSync(f, 'utf8');
  const lines = raw.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    inflatedWords.forEach(word => {
      const reg = new RegExp(`\\b${word}\\b`, 'i');
      if (reg.test(line)) {
        contentTraces.push({ file: relPath, line: lineNum, text: line.trim(), match: word, type: 'Inflated AI Buzzword' });
      }
    });

    if (line.includes('—') || line.includes('--')) {
      contentTraces.push({ file: relPath, line: lineNum, text: line.trim(), match: 'em-dash', type: 'Em-dash in copy' });
    }

    if (/\b(100%|98%|95%|ranked|rating|award)\b/i.test(line)) {
      contentTraces.push({ file: relPath, line: lineNum, text: line.trim(), match: 'unverified metric/claim', type: 'Metric Claim' });
    }
  });
});

console.log(JSON.stringify({
  baselineCount: baseline.length,
  commentCount: commentTraces.length,
  consoleCount: consoleTraces.length,
  debuggerCount: debuggerTraces.length,
  placeholderCount: placeholderTraces.length,
  filesNotToShipCount: filesNotToShip.length,
  generatorTracesCount: generatorTraces.length,
  contentTracesCount: contentTraces.length
}, null, 2));

fs.writeFileSync(path.join(rootDir, 'scratch', 'inventory_raw.json'), JSON.stringify({
  baseline,
  commentTraces,
  consoleTraces,
  debuggerTraces,
  placeholderTraces,
  filesNotToShip,
  generatorTraces,
  contentTraces
}, null, 2));
