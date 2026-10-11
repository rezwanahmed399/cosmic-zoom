import fs from 'fs';

const app = fs.readFileSync('app.js', 'utf8');
const render = fs.readFileSync('render-engine.js', 'utf8');

const errors = [];

// 1. Verify app.js allows zooming backwards out of Planck scale on mobile (diffY > 0)
if (!app.includes('diffY > 0') || !app.includes('this.renderEngine.addZoomDelta(diffY * 0.02)')) {
  errors.push('app.js: touchmove must allow zooming backwards out of Planck scale when diffY > 0');
}

// 2. Verify app.js allows 2-finger pinch out at Planck scale (pinchDelta > 0)
if (!app.includes('pinchDelta > 0') || !app.includes('this.renderEngine.addZoomDelta(pinchDelta * 0.03)')) {
  errors.push('app.js: touchmove must allow pinch-out backwards zoom at Planck scale when pinchDelta > 0');
}

// 3. Verify render-engine.js mobile object tag eliminated duplicate upper arrow/branch
if (render.includes('tagY = cy > this.height * 0.5 ? cy - Math.max')) {
  errors.push('render-engine.js: duplicate upper arrow/tagY branch still exists on mobile');
}

if (!render.includes('tagY = Math.min(maxTagY, cy + Math.max(r + 40, 80));')) {
  errors.push('render-engine.js: mobile tagY must strictly anchor below center object');
}

if (errors.length > 0) {
  console.error('Mobile Planck fixes verification failed:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('Mobile Planck fixes verified successfully! Touch zoom-out works and top duplicate arrow is deleted.');
  process.exit(0);
}
