import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const errors = [];

// 1. Check initial index.html attributes
if (!html.includes('class="object-card-container minimized"')) {
  errors.push('index.html: object-card-container must have class minimized initially');
}

if (!html.includes('class="force-dominance-panel minimized"')) {
  errors.push('index.html: force-dominance-panel must have class minimized initially');
}

if (!html.includes('id="object-card-restore-pill"') || !html.includes('style="display: inline-flex;"')) {
  errors.push('index.html: object-card-restore-pill must be visible initially');
}

// 2. Check app.js initialization: must hide both panels unconditionally
const constructorInitMatch = /this\.setObjectCardVisible\(false,\s*true\);\s*this\.setForcesPanelVisible\(false,\s*true\);/.test(app);
if (!constructorInitMatch) {
  errors.push('app.js: constructor must unconditionally call setObjectCardVisible(false, true) and setForcesPanelVisible(false, true)');
}

// 3. Ensure no device screen breakpoint check in app.js constructor or resize handler for panel visibility
if (/window\.innerWidth\s*<=\s*768\s*\{\s*this\.setObjectCardVisible/.test(app)) {
  errors.push('app.js: found device breakpoint logic for setObjectCardVisible');
}

if (errors.length > 0) {
  console.error('Default hidden on all devices verification failed:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('Default hidden on all devices verification passed! Both panels are hidden by default on all screens.');
  process.exit(0);
}
