const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const exts = ['.js', '.jsx', '.css'];
const colorRegex = /(#[0-9a-fA-F]{3,8})|rgba?\([^)]*\)|hsl\([^)]*\)/g;

function walk(dir, results=[]) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath, results);
    } else {
      if (exts.includes(path.extname(filePath))) results.push(filePath);
    }
  });
  return results;
}

const files = walk(root);
const report = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(colorRegex);
    if (match) {
      report.push({file: f, line: idx+1, text: line.trim(), matches: match});
    }
  });
});

if (report.length === 0) {
  console.log('✅ No hard-coded colors found.');
  process.exit(0);
}

console.log(`Found ${report.length} occurrences of color literals:`);
console.log('----');
report.forEach(r => {
  console.log(`${r.file}:${r.line} -> ${r.matches.join(', ')}\n  ${r.text}\n`);
});

console.log('----');
console.log('Tip: Replace these with CSS variables (e.g., var(--text-primary), var(--bg-primary)).');
