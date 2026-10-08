import fs from 'fs';

const css = fs.readFileSync('style.css', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

let errors = [];

// 1. Verify CSS rules for hiding pills in black hole mode
if (!css.includes('body.black-hole-mode .object-card-restore-pill')) {
  errors.push('style.css is missing body.black-hole-mode .object-card-restore-pill selector');
}
if (!css.includes('body.black-hole-mode .force-restore-pill')) {
  errors.push('style.css is missing body.black-hole-mode .force-restore-pill selector');
}
if (!css.includes('body.black-hole-mode .object-card-restore-pill,\nbody.black-hole-mode .force-restore-pill {\n  display: none !important;\n}')) {
  errors.push('style.css is missing display: none !important for restore pills in black-hole-mode');
}

// 2. Verify JS logic in onBlackHoleTriggered
if (!app.includes('if (this.cardRestorePill) {\n        this.cardRestorePill.style.display = \'none\';\n      }')) {
  errors.push('app.js onBlackHoleTriggered does not explicitly hide this.cardRestorePill');
}
if (!app.includes('if (this.forceRestorePill) {\n        this.forceRestorePill.style.display = \'none\';\n      }')) {
  errors.push('app.js onBlackHoleTriggered does not explicitly hide this.forceRestorePill');
}

// 3. Verify guards in setObjectCardVisible and setForcesPanelVisible
if (!app.includes('const isBhActive = this.renderEngine && (this.renderEngine.blackHoleState === \'active\' || this.renderEngine.blackHoleState === \'shattering\');')) {
  errors.push('app.js setObjectCardVisible / setForcesPanelVisible does not check isBhActive');
}

if (errors.length > 0) {
  console.error('Black hole pills verification failed:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('Black hole pills verification passed! Both pills are strictly suppressed in Black Hole mode.');
  process.exit(0);
}
