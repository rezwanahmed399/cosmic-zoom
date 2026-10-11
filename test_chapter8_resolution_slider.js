/**
 * Unit & Integration Test Suite for Chapter 8: "রেজোলিউশন-স্লাইডার" (Parton Distribution Functions / PDFs)
 */

import assert from 'assert';
import fs from 'fs';
import {
  getResolutionSliderPdfData,
  getPdfAtQ2,
  RESOLUTION_SLIDER_PDF
} from './data/quark-facts.js';
import { Chapter8ResolutionSlider } from './quark/chapter-8.js';
import { CHAPTER_LIST } from './quark/quark-app.js';

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

console.log('--- Testing Chapter 8: Resolution Slider (PDF) ---');

// 1. DATASET INTEGRITY
it('CT18NNLO grid dataset is loaded with valid metadata and >= 20 Q^2 slices', () => {
  const data = getResolutionSliderPdfData();
  assert(data, 'PDF dataset must exist');
  assert.strictEqual(data.meta.dataset, 'CT18NNLO');
  assert(data.meta.orderQCD.includes('NNLO'), 'orderQCD must specify NNLO');
  assert(data.points.length >= 20, `Expected >= 20 points, got ${data.points.length}`);
  assert(data.xGrid.length >= 40, `Expected >= 40 x-points, got ${data.xGrid.length}`);
});

// 2. SUM RULES VERIFICATION AT ALL SLICES
it('All Q^2 slices strictly satisfy QCD Sum Rules within tight tolerances', () => {
  const data = getResolutionSliderPdfData();
  
  data.points.forEach((slice, idx) => {
    // 1. Valence Up: \int (u - u_bar) dx = 2.0
    const intUv = slice.sumRules.int_u_minus_ubar;
    assert(Math.abs(intUv - 2.0) <= 0.02, 
      `Slice ${idx} (Q2=${slice.q2_GeV2}): int(u - u_bar) must be ~2.0, got ${intUv}`);

    // 2. Valence Down: \int (d - d_bar) dx = 1.0
    const intDv = slice.sumRules.int_d_minus_dbar;
    assert(Math.abs(intDv - 1.0) <= 0.02, 
      `Slice ${idx} (Q2=${slice.q2_GeV2}): int(d - d_bar) must be ~1.0, got ${intDv}`);

    // 3. Strange Asymmetry: \int (s - s_bar) dx = 0.0
    const intS_diff = slice.sumRules.int_s_minus_sbar;
    assert(Math.abs(intS_diff) <= 0.01, 
      `Slice ${idx} (Q2=${slice.q2_GeV2}): int(s - s_bar) must be ~0.0, got ${intS_diff}`);

    // 4. Momentum Sum Rule: \sum \int x f dx = 1.0
    const momSum = slice.sumRules.momentum_sum;
    assert(Math.abs(momSum - 1.0) <= 0.02, 
      `Slice ${idx} (Q2=${slice.q2_GeV2}): Momentum sum must be ~1.0, got ${momSum}`);
  });
});

// 3. NON-PERTURBATIVE THRESHOLD (Q^2 < 2.0 GeV^2)
it('Q^2 < 2.0 GeV^2 strictly enforces non-perturbative threshold with no PDF curves', () => {
  const lowQ2 = getPdfAtQ2(1.0);
  assert.strictEqual(lowQ2.isNonPerturbative, true);
  assert(lowQ2.warningBn.includes('নন-পার্টারবেটিভ'), 'Must have non-perturbative warning in Bengali');
  assert(!lowQ2.curves, 'Must not return perturbative curves below threshold');

  const zeroQ2 = getPdfAtQ2(0.5);
  assert.strictEqual(zeroQ2.isNonPerturbative, true);

  const validQ2 = getPdfAtQ2(10.0);
  assert.strictEqual(validQ2.isNonPerturbative, false);
  assert(validQ2.curves, 'Must return valid curves above threshold');
  assert(validQ2.curves.u_v.length > 0, 'u_v curve must have data points');
});

// 4. MOMENTUM FRACTION ASYMPTOTIC GROWTH
it('Gluon momentum fraction grows with Q^2 towards asymptotic limit ~52%', () => {
  const lowQ2Slice = getPdfAtQ2(3.0);
  const highQ2Slice = getPdfAtQ2(100000.0);

  const lowGluonMom = lowQ2Slice.momentumFractions.gluon;
  const highGluonMom = highQ2Slice.momentumFractions.gluon;

  assert(highGluonMom > lowGluonMom, 'Gluon momentum fraction must increase from low to high Q^2');
  assert(highGluonMom > 0.45 && highGluonMom < 0.53, 
    `High Q^2 gluon momentum fraction should be ~46-52%, got ${highGluonMom}`);
});

// 5. PROBE RESOLUTION WAVELENGTH
it('Probe resolution lambda decreases as Q^2 increases (lambda ~ hbar*c / Q)', () => {
  const q2_1 = getPdfAtQ2(1.0);
  const q2_100 = getPdfAtQ2(100.0);

  assert(q2_1.wavelength_fm > 0.15 && q2_1.wavelength_fm < 0.25, 
    `At Q2=1 GeV^2, lambda should be ~0.2 fm, got ${q2_1.wavelength_fm}`);
  assert(q2_100.wavelength_fm < 0.03, 
    `At Q2=100 GeV^2, lambda should be < 0.03 fm, got ${q2_100.wavelength_fm}`);
});

// 6. CHAPTER LIST ROUTER CONTRACT
it('Chapter 8 is available in CHAPTER_LIST with dedicated hash and tier T2', () => {
  const ch8 = CHAPTER_LIST.find(c => c.id === 'chapter-8');
  assert(ch8, 'Chapter 8 must exist in CHAPTER_LIST');
  assert.strictEqual(ch8.hash, '#/quarks/chapter-8');
  assert.strictEqual(ch8.isAvailable, true);
  assert.strictEqual(ch8.titleBn, 'রেজোলিউশন-স্লাইডার');
  assert.strictEqual(ch8.tier, 'T2');
});

// 7. ZERO EMOJIS IN CODE
it('Zero unicode emojis in quark/chapter-8.js', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-8.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, 'Found emojis in quark/chapter-8.js');
});

console.log(`\nChapter 8 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
