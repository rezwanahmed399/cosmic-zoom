/**
 * Unit & Integration Test Suite for Chapter 9: "Asymptotic freedom"
 *
 * Acceptance Verification:
 * 1. alpha_s(M_Z) = 0.1180 +- 0.0009 (PDG 2024 / 2026 World Average).
 * 2. Renormalization Group Equation (RGE) running coupling alpha_s(Q) decreases monotonically for Q > 1 GeV.
 * 3. Q <= 1.0 GeV is marked strictly non-perturbative with clear scientific warning.
 * 4. Active flavor thresholds (n_f = 3, 4, 5, 6) switch at m_c, m_b, m_t.
 * 5. QED vs QCD comparison: QED screening (1/137 -> 1/128 at M_Z) vs QCD anti-screening.
 * 6. Authentic PDG experimental data points (T1) present with real citations; zero invented points.
 * 7. 2004 Nobel prize documentation (Gross, Politzer, Wilczek).
 * 8. Zero unicode emojis across Chapter 9 modules.
 */

import assert from 'assert';
import fs from 'fs';
import {
  getAsymptoticFreedomData,
  getRunningAlphaS
} from './data/quark-facts.js';

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${description}`);
    console.error(err);
    failed++;
  }
}

console.log('--- Testing Chapter 9: Asymptotic Freedom Architecture ---');

// 1. PDG WORLD AVERAGE BENCHMARK
it('PDG World Average alpha_s(M_Z) = 0.1180 +- 0.0009 benchmark is exact (Tier T1)', () => {
  const data = getAsymptoticFreedomData();
  assert(data, 'Asymptotic freedom data must exist');
  assert.strictEqual(data.alphaS_MZ.value, 0.1180);
  assert.strictEqual(data.alphaS_MZ.uncertainty, '+- 0.0009');
  assert.strictEqual(data.alphaS_MZ.tier, 'T1');
  assert.strictEqual(data.alphaS_MZ.scaleGeV, 91.1876);
  assert(data.alphaS_MZ.source.includes('PDG 2024'));
});

// 2. RUNNING COUPLING alpha_s(Q) DECREASES WITH ENERGY (ASYMPTOTIC FREEDOM)
it('Running coupling alpha_s(Q) decreases monotonically at high energies (Q = 2, 10, 91.2, 500 GeV)', () => {
  const res2 = getRunningAlphaS(2.0);
  const res10 = getRunningAlphaS(10.0);
  const resZ = getRunningAlphaS(91.1876);
  const res500 = getRunningAlphaS(500.0);

  assert.strictEqual(res2.isNonPerturbative, false);
  assert.strictEqual(res10.isNonPerturbative, false);
  assert.strictEqual(resZ.isNonPerturbative, false);
  assert.strictEqual(res500.isNonPerturbative, false);

  assert(res2.alpha_s > res10.alpha_s, `alpha_s(2) [${res2.alpha_s}] must be > alpha_s(10) [${res10.alpha_s}]`);
  assert(res10.alpha_s > resZ.alpha_s, `alpha_s(10) [${res10.alpha_s}] must be > alpha_s(M_Z) [${resZ.alpha_s}]`);
  assert(resZ.alpha_s > res500.alpha_s, `alpha_s(M_Z) [${resZ.alpha_s}] must be > alpha_s(500) [${res500.alpha_s}]`);

  // Value at Z pole must match benchmark within precision tolerance
  assert(Math.abs(resZ.alpha_s - 0.1180) < 0.002, `alpha_s(M_Z) should be ~0.1180, got ${resZ.alpha_s}`);
});

// 3. NON-PERTURBATIVE THRESHOLD Q <= 1.0 GeV
it('Low energy region Q <= 1.0 GeV is flagged as non-perturbative ("সূত্র খাটে না")', () => {
  const lowQ1 = getRunningAlphaS(0.8);
  const lowQ2 = getRunningAlphaS(0.4);

  assert.strictEqual(lowQ1.isNonPerturbative, true);
  assert.strictEqual(lowQ2.isNonPerturbative, true);
  assert(lowQ1.warningBn.includes('সূত্র খাটে না'), 'Warning must explain perturbation breakdown');
  assert(lowQ1.warningBn.includes('non-perturbative'), 'Warning must state non-perturbative');
});

// 4. ACTIVE FLAVOR THRESHOLDS (n_f = 3, 4, 5, 6)
it('Active quark flavors n_f switch appropriately at charm, bottom, and top mass thresholds', () => {
  const resNF3 = getRunningAlphaS(1.1); // below charm (1.27 GeV)
  const resNF4 = getRunningAlphaS(3.0); // between charm and bottom (4.18 GeV)
  const resNF5 = getRunningAlphaS(50.0); // between bottom and top (172.5 GeV)
  const resNF6 = getRunningAlphaS(300.0); // above top

  assert.strictEqual(resNF3.activeFlavors_nf, 3);
  assert.strictEqual(resNF4.activeFlavors_nf, 4);
  assert.strictEqual(resNF5.activeFlavors_nf, 5);
  assert.strictEqual(resNF6.activeFlavors_nf, 6);
});

// 5. QED VS QCD RUNNING COUPLING CONTRAST
it('QED vs QCD contrast is verified: QED increases (screening), QCD decreases (anti-screening)', () => {
  const data = getAsymptoticFreedomData();
  const qed = data.qedComparison;

  assert(qed, 'QED comparison block must exist');
  assert.strictEqual(qed.qedCoupling_0.fraction, '1/137.036');
  assert.strictEqual(qed.qedCoupling_MZ.fraction, '1/128.0');
  assert(qed.comparisonTextBn.includes('screen'));
  assert(qed.comparisonTextBn.includes('anti-screening'));
});

// 6. NOBEL PRIZE 2004 CITATION
it('Nobel Prize 2004 laureates (Gross, Politzer, Wilczek) and discovery quotes are present', () => {
  const data = getAsymptoticFreedomData();
  const nobel = data.nobelPrize2004;

  assert.strictEqual(nobel.year, 2004);
  assert.strictEqual(nobel.laureates.length, 3);
  assert(nobel.laureates.some(l => l.includes('Gross')));
  assert(nobel.laureates.some(l => l.includes('Politzer')));
  assert(nobel.laureates.some(l => l.includes('Wilczek')));
  assert(nobel.storyBn.includes('কোয়ার্কগুলো যখন অত্যন্ত কাছাকাছি থাকে'));
  assert(nobel.storyBn.includes('কনফাইনমেন্ট'));
});

// 7. PDG EXPERIMENTAL DATA INTEGRITY (T1)
it('PDG experimental measurements are strictly Tier T1 with verified references', () => {
  const data = getAsymptoticFreedomData();
  const points = data.pdgDataPoints;

  assert(Array.isArray(points) && points.length >= 7, 'Must have at least 7 verified PDG experimental measurements');

  // Verify every point has real observable, scale, value, error, and citation
  points.forEach((pt, idx) => {
    assert(pt.id, `Point ${idx} must have id`);
    assert(pt.nameEn, `Point ${idx} must have nameEn`);
    assert(pt.Q > 0, `Point ${idx} scale must be positive`);
    assert(pt.alphaS > 0 && pt.alphaS < 1.0, `Point ${idx} alphaS value must be reasonable`);
    assert(pt.uncertainty > 0, `Point ${idx} uncertainty must be positive`);
    assert.strictEqual(pt.tier, 'T1', `Point ${idx} must be tier T1`);
    assert(pt.facility, `Point ${idx} must cite experimental facility`);
  });

  // Verify key anchor points: tau, Z pole, lhcjets
  const tauPt = points.find(p => p.id === 'tau');
  const zPt = points.find(p => p.id === 'zpole');
  const lhcPt = points.find(p => p.id === 'lhcjets');

  assert(tauPt, 'Tau decay point must exist');
  assert(Math.abs(tauPt.Q - 1.78) < 0.05);
  assert(tauPt.alphaS > 0.3);

  assert(zPt, 'Z pole point must exist');
  assert(Math.abs(zPt.Q - 91.2) < 0.1);
  assert(Math.abs(zPt.alphaS - 0.1187) < 0.005);

  assert(lhcPt, 'LHC jets point must exist');
  assert(lhcPt.Q >= 300);
});

// 8. ZERO EMOJIS IN CHAPTER 9
it('Zero unicode emojis in Chapter 9 source file', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-9.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, `Found emojis in quark/chapter-9.js: ${matches ? matches.join(' ') : ''}`);
});

console.log(`\nChapter 9 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
