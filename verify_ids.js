import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = idRegex.exec(app)) !== null) {
  ids.add(match[1]);
}

let missing = [];
ids.forEach(id => {
  if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
    missing.push(id);
  }
});

console.log('Total IDs checked:', ids.size);
console.log('Missing IDs:', missing);
process.exit(missing.length === 0 ? 0 : 1);
