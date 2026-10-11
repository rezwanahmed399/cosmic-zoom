/**
 * Unit & Integration Test Suite for Chapter 10: "কীভাবে জানলাম?" (Evidence Lab)
 *
 * Acceptance Verification:
 * 1. R-ratio formula and theoretical staircase plateaus:
 *    - u, d, s (< 3.7 GeV): R = 2
 *    - +c (3.7 - 10.5 GeV): R = 10/3 (3.333)
 *    - +b (> 10.5 GeV): R = 11/3 (3.667)
 * 2. Hypothetical N_c = 1 contrast:
 *    - u, d, s: R = 2/3 (0.667)
 *    - +c: R = 10/9 (1.111)
 *    - +b: R = 11/9 (1.222)
 *    - Step height directly proves N_c = 3 and fractional quark charges.
 * 3. All 6 vector meson resonances identified (rho, omega, phi, J/psi, psi(2S), Upsilon) with tier T1.
 * 4. Authentic PDG measured R(sqrt_s) data points (T1) present with real citations.
 * 5. All 5 historic evidence cards documented:
 *    - DIS scaling (SLAC 1968-69; Nobel 1990)
 *    - 2-jet angular distribution 1 + cos^2(theta) -> spin-1/2 (SLAC SPEAR 1975)
 *    - 3-jet events -> direct gluon discovery (PETRA, DESY 1979)
 *    - Delta++ puzzle -> necessity of SU(3) color
 *    - Ab initio lattice QCD light hadron masses (BMW, Science 322, 1224, 2008)
 * 6. Zero unicode emojis across Chapter 10 modules.
 */

import assert from 'assert';
import fs from 'fs';
import {
  getEvidenceLabData,
  getRRatioTheory
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

console.log('--- Testing Chapter 10: Evidence Lab Architecture ---');

// 1. R-RATIO THEORETICAL STAIRCASE (N_c = 3)
it('R-ratio theoretical plateaus for N_c = 3 are exact: 2 (uds), 10/3 (+c), 11/3 (+b)', () => {
  const data = getEvidenceLabData();
  assert(data, 'Evidence lab data must exist');
  assert(data.rRatio, 'rRatio data must exist');

  const steps = data.rRatio.theoreticalSteps;
  assert.strictEqual(steps.length, 3, 'Must have 3 theoretical flavor threshold steps');

  // Step 1: u, d, s
  assert.strictEqual(steps[0].Nc3_fraction, '2');
  assert.strictEqual(steps[0].Nc3_value, 2.0);
  assert.deepStrictEqual(steps[0].flavors, ['u', 'd', 's']);

  // Step 2: +c
  assert.strictEqual(steps[1].Nc3_fraction, '10/3');
  assert.strictEqual(steps[1].Nc3_value, 3.333);
  assert.deepStrictEqual(steps[1].flavors, ['u', 'd', 's', 'c']);

  // Step 3: +b
  assert.strictEqual(steps[2].Nc3_fraction, '11/3');
  assert.strictEqual(steps[2].Nc3_value, 3.667);
  assert.deepStrictEqual(steps[2].flavors, ['u', 'd', 's', 'c', 'b']);

  // Calculation function test
  assert.strictEqual(getRRatioTheory(2.5, 3), 2.0);
  assert.strictEqual(getRRatioTheory(6.0, 3), 3.333);
  assert.strictEqual(getRRatioTheory(20.0, 3), 3.667);
});

// 2. PEDAGOGICAL CONTRAST WITH N_c = 1 (COLOR PROOF)
it('Hypothetical N_c = 1 values are 2/3, 10/9, 11/9 — proving N_c = 3 from step height', () => {
  const data = getEvidenceLabData();
  const steps = data.rRatio.theoreticalSteps;

  assert.strictEqual(steps[0].Nc1_fraction, '2/3');
  assert.strictEqual(steps[0].Nc1_value, 0.667);

  assert.strictEqual(steps[1].Nc1_fraction, '10/9');
  assert.strictEqual(steps[1].Nc1_value, 1.111);

  assert.strictEqual(steps[2].Nc1_fraction, '11/9');
  assert.strictEqual(steps[2].Nc1_value, 1.222);

  // Calculation function test with Nc = 1
  assert.strictEqual(getRRatioTheory(2.5, 1), 0.667);
  assert.strictEqual(getRRatioTheory(6.0, 1), 1.111);
  assert.strictEqual(getRRatioTheory(20.0, 1), 1.222);

  assert(data.rRatio.colorProofBn.includes('Nc = 3'));
  assert(data.rRatio.colorProofBn.includes('Nc = 1'));
});

// 3. VECTOR MESON RESONANCE PEAKS (T1)
it('All 6 specified vector meson resonances (rho, omega, phi, J/psi, psi(2S), Upsilon) are present with exact masses', () => {
  const data = getEvidenceLabData();
  const res = data.rRatio.resonances;
  assert.strictEqual(res.length, 6, 'Must contain all 6 resonance peaks');

  const symbols = res.map(r => r.symbol);
  ['rho', 'omega', 'phi', 'J/psi', 'psi(2S)', 'Upsilon'].forEach(sym => {
    assert(symbols.includes(sym), `Resonance ${sym} must be present`);
  });

  const rho = res.find(r => r.symbol === 'rho');
  const jpsi = res.find(r => r.symbol === 'J/psi');
  const upsilon = res.find(r => r.symbol === 'Upsilon');

  assert.strictEqual(rho.massGeV, 0.775);
  assert.strictEqual(jpsi.massGeV, 3.097);
  assert.strictEqual(upsilon.massGeV, 9.460);
  assert.strictEqual(rho.tier, 'T1');
  assert.strictEqual(jpsi.tier, 'T1');
  assert.strictEqual(upsilon.tier, 'T1');
});

// 4. PDG MEASURED EXPERIMENTAL DATA POINTS (T1)
it('PDG measured R(sqrt_s) points are authentic, Tier T1, with valid facility citations', () => {
  const data = getEvidenceLabData();
  const pts = data.rRatio.pdgMeasuredPoints;

  assert(Array.isArray(pts) && pts.length >= 10, 'Must have at least 10 PDG measured R points');
  pts.forEach((p, idx) => {
    assert(p.sqrt_s > 0, `Point ${idx} energy must be positive`);
    assert(p.R > 0, `Point ${idx} R value must be positive`);
    assert(p.uncertainty > 0, `Point ${idx} uncertainty must be positive`);
    assert.strictEqual(p.tier, 'T1', `Point ${idx} must be tier T1`);
    assert(p.facility, `Point ${idx} must specify experiment/facility`);
  });
});

// 5. FIVE HISTORIC EVIDENCE CARDS
it('All 5 specified historic evidence cards are fully detailed with correct scientific citations', () => {
  const data = getEvidenceLabData();
  const cards = data.evidenceCards;
  assert.strictEqual(cards.length, 5, 'Must contain exactly 5 historic evidence cards');

  // 1. DIS scaling
  const dis = cards.find(c => c.id === 'dis_scaling');
  assert(dis, 'DIS scaling card must exist');
  assert(dis.experiment.includes('SLAC'));
  assert.strictEqual(dis.nobelYear, 1990);
  assert(dis.nobelLaureates.some(l => l.includes('Friedman')));
  assert(dis.keyDiscoveryBn.includes('বজরকেন স্কেলিং'));

  // 2. 2-jet spin-1/2
  const twoJet = cards.find(c => c.id === 'two_jet_spin');
  assert(twoJet, 'Two-jet spin card must exist');
  assert(twoJet.experiment.includes('SPEAR'));
  assert(twoJet.keyDiscoveryBn.includes('1 + cos^2'));
  assert(twoJet.physicsProofBn.includes('স্পিন-১/২'));

  // 3. 3-jet gluon
  const threeJet = cards.find(c => c.id === 'three_jet_gluon');
  assert(threeJet, 'Three-jet gluon card must exist');
  assert(threeJet.experiment.includes('PETRA'));
  assert(threeJet.experiment.includes('DESY'));
  assert(threeJet.keyDiscoveryBn.includes('৩টি পৃথক কণা-ঝাঁক'));
  assert(threeJet.physicsProofBn.includes('গ্লুয়ন'));

  // 4. Delta++ puzzle
  const delta = cards.find(c => c.id === 'delta_puzzle');
  assert(delta, 'Delta++ puzzle card must exist');
  assert(delta.theorists.includes('Greenberg'));
  assert(delta.theorists.includes('Han'));
  assert(delta.keyDiscoveryBn.includes('uuu'));
  assert(delta.physicsProofBn.includes('কালার'));

  // 5. Lattice QCD masses
  const lattice = cards.find(c => c.id === 'lattice_masses');
  assert(lattice, 'Lattice QCD masses card must exist');
  assert(lattice.collaboration.includes('BMW'));
  assert(lattice.publication.includes('Science 322, 1224 (2008)'));
  assert(lattice.physicsProofBn.includes('ল্যাটিস QCD'));
});

// 6. ZERO EMOJIS IN CHAPTER 10
it('Zero unicode emojis in Chapter 10 source file', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-10.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, `Found emojis in quark/chapter-10.js: ${matches ? matches.join(' ') : ''}`);
});

console.log(`\nChapter 10 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
