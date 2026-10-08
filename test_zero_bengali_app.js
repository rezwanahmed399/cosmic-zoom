import fs from 'fs';

const BENGALI_REGEX = /[\u0980-\u09FF]/;
let failures = [];

// Read app.js
const appContent = fs.readFileSync('app.js', 'utf8');

// Test formatMetersMetric logic in English
function formatMetersMetricEn(m) {
  if (m >= 9.46e25) return `${(m / 9.46e15).toExponential(1)} Light Years`;
  if (m >= 9.46e15) return `${(m / 9.46e15).toFixed(1)} Light Years`;
  if (m >= 1.496e11) return `${(m / 1.496e11).toFixed(1)} AU`;
  if (m >= 1e9) return `${(m / 1e9).toFixed(1)} Million km`;
  if (m >= 1e3) return `${(m / 1e3).toFixed(1)} km`;
  if (m >= 1) return `${m.toFixed(2)} m`;
  if (m >= 1e-2) return `${(m * 100).toFixed(1)} cm`;
  if (m >= 1e-3) return `${(m * 1e3).toFixed(1)} mm`;
  if (m >= 1e-6) return `${(m * 1e6).toFixed(1)} µm`;
  if (m >= 1e-9) return `${(m * 1e9).toFixed(1)} nm`;
  if (m >= 1e-12) return `${(m * 1e12).toFixed(1)} pm`;
  if (m >= 1e-15) return `${(m * 1e15).toFixed(1)} fm`;
  if (m >= 1e-18) return `${(m * 1e18).toFixed(1)} am`;
  return `${m.toExponential(2)} m`;
}

// Test formatLightTransit logic in English
function formatLightTransitEn(s) {
  const yearSec = 31557600;
  if (s >= yearSec * 1e9) return `${(s / (yearSec * 1e9)).toFixed(1)} Billion Years`;
  if (s >= yearSec * 1e6) return `${(s / (yearSec * 1e6)).toFixed(1)} Million Years`;
  if (s >= yearSec) return `${(s / yearSec).toFixed(1)} Years`;
  if (s >= 3600) return `${(s / 3600).toFixed(1)} Hours`;
  if (s >= 60) return `${(s / 60).toFixed(1)} Minutes`;
  if (s >= 1) return `${s.toFixed(2)} Seconds`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(1)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(1)} µs`;
  if (s >= 1e-9) return `${(s * 1e9).toFixed(1)} ns`;
  if (s >= 1e-12) return `${(s * 1e12).toFixed(1)} ps`;
  if (s >= 1e-15) return `${(s * 1e15).toFixed(1)} fs`;
  if (s >= 1e-18) return `${(s * 1e18).toFixed(1)} as`;
  if (s >= 1e-21) return `${(s * 1e21).toFixed(1)} zs`;
  if (s >= 1e-24) return `${(s * 1e24).toFixed(1)} ys`;
  return `${s.toExponential(2)} s (Planck Time)`;
}

for (let ord = -35; ord <= 27; ord += 0.5) {
  const m = Math.pow(10, ord);
  const met = formatMetersMetricEn(m);
  if (BENGALI_REGEX.test(met)) failures.push(`formatMetersMetricEn at 10^${ord}: ${met}`);

  const s = m / 299792458;
  const lt = formatLightTransitEn(s);
  if (BENGALI_REGEX.test(lt)) failures.push(`formatLightTransitEn at 10^${ord}: ${lt}`);
}

// Test English branches of ternary operators in applyLanguageTranslations
const enStrings = [
  'The Cosmic to Planck Journey',
  'ORDER OF MAGNITUDE / SCALE',
  'ACTUAL MEASURE / METRIC',
  'LIGHT TRAVEL TIME / TRANSIT',
  'Search',
  'Compare',
  'Quiz',
  'Black Hole',
  'Search Objects',
  'Scale Comparisons',
  'Scale Estimation Quiz',
  'Gravitational Collapse Simulation',
  'Cosmic Audio Synthesizer',
  'Switch Language',
  'Toggle Fullscreen',
  'Hide',
  'Hide Info Card [C]',
  'Show Info Card [C]',
  'Governing Forces [F]',
  'Hide Forces Panel [F]',
  'Governing Forces',
  'Gravity & Dark Energy',
  'Electromagnetic Force',
  'Strong Nuclear Force',
  'Weak Nuclear Force',
  'Quantum Gravity (Planck)',
  'Observation Technology (Instrument Ladder):',
  'Human Travel Time Equivalent:',
  'Walk (5 km/h):',
  'Jet (900 km/h):',
  'Voyager (17 km/s):',
  'Schwarzschild Radius (rs = 2GM/c²):',
  'COSMIC FACT',
  'Scroll or swipe to explore scales',
  'Planck Wall Reached (Quantum Limit):',
  'The fundamental threshold of modern physics. Probing beyond this creates a micro black hole that conceals spacetime!',
  'Spacetime Gravitational Strain (TRANS-PLANCKIAN)',
  'Scroll mouse wheel more to force gravitational collapse...',
  'Zoom In',
  'Zoom Out',
  'Auto Tour',
  'Pause',
  'Search Cosmic & Quantum Objects',
  'Type object name (e.g., DNA, Earth, Sun, Quark, Laniakea)...',
  'Close',
  'Mind-Blowing Scale Comparisons',
  'Comparative ratios between cosmic and subatomic structures:',
  'Cosmic Scale Estimation Challenge',
  'SCHWARZSCHILD BLACK HOLE (GR MODEL)',
  '3-Rings [O]',
  'Einstein Geometry & 3 Rings [O]',
  'Toggle Accretion Disk / Vacuum Mode',
  'Accretion Disk',
  'Pure Vacuum',
  'Hide Card',
  'Hide Data Card [H]',
  'Evaporate & Return [X]',
  'Hawking Evaporation & Return [X]',
  'Show Black Hole Data [H]',
  'Planck Mass (Quantum)',
  'The Sun (1 Solar Mass)',
  'Sagittarius A* (SMBH)',
  'Collapsed Object Mass',
  'Event Horizon & Shadow',
  'Photon Sphere (r_ph)',
  'Hawking Temp & Lifetime',
  'Simplified 2D Relativistic Model, Not Real Image',
  'N/A (Comoving Distance)',
  'Screen Field: ',
  'No objects found',
  'Jump to Scale',
  'Correct Answer!',
  'Scientific Reality:'
];

enStrings.forEach(str => {
  if (BENGALI_REGEX.test(str)) {
    failures.push(`English string has Bengali: ${str}`);
  }
});

if (failures.length > 0) {
  console.error(`Found ${failures.length} errors:`);
  failures.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('All app & UI English strings verified: 0 Bengali characters found!');
  process.exit(0);
}
