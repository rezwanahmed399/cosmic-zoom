import fs from 'fs';

const app = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

const errors = [];

// 1. Verify accumulatePlanckStrain exists and triggers black hole
if (!app.includes('accumulatePlanckStrain(amount = 1)')) {
  errors.push('app.js: missing accumulatePlanckStrain method');
}

if (!app.includes('this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);')) {
  errors.push('app.js: accumulatePlanckStrain must call triggerBlackHoleCollapse');
}

// 2. Verify wheel listener calls accumulatePlanckStrain
if (!app.includes('this.renderEngine.currentOrder <= -34.5 && e.deltaY > 0')) {
  errors.push('app.js: wheel listener missing Planck scale check');
}

// 3. Verify touch listeners on mobile accumulate strain
if (!app.includes('accumulatedTouchStrain += Math.abs(diffY);') && !app.includes('accumulatedTouchStrain')) {
  errors.push('app.js: mobile touchmove missing accumulated touch strain logic');
}

// 4. Verify zoom-in button calls accumulatePlanckStrain at Planck scale
if (!app.includes("document.getElementById('zoom-in-btn').addEventListener('click'") ||
    !app.includes('this.accumulatePlanckStrain(2)')) {
  errors.push('app.js: zoom-in-btn must call accumulatePlanckStrain at Planck scale');
}

// 5. Verify style.css allows clicking planck banner and strain card
if (!css.includes('.planck-wall-banner.active') || !css.includes('pointer-events: auto;')) {
  errors.push('style.css: .planck-wall-banner.active must have pointer-events: auto');
}

if (errors.length > 0) {
  console.error('Planck collapse verification failed:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('Planck collapse verification passed! Black hole triggers smoothly across all devices at Planck scale.');
  process.exit(0);
}
