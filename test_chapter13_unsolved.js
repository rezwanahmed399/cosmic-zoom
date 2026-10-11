/**
 * Unit & Integration Test Suite for Chapter 13: "অজানা ও অমীমাংসিত" (Unsolved Mysteries of QCD)
 *
 * Verifies:
 * 1. Exactly 10 scientific frontier cards with required status tags:
 *    - 1) Confinement & mass gap (Clay Millennium Problem) -> unsolved
 *    - 2) Proton spin distribution -> partially_known
 *    - 3) Exotic hadrons (compact vs molecular) -> debated
 *    - 4) Glueball -> hypothesized
 *    - 5) QCD phase diagram critical point -> unknown
 *    - 6) Strong CP problem (theta parameter & axion) -> unsolved
 *    - 7) Quark substructure limit (< 10^-18 m) -> unknown
 *    - 8) Dense quark matter / CFL -> speculative / hypothesized
 *    - 9) Toponium explanation (CMS/ATLAS 2025) -> ongoing
 *    - 10) Intrinsic charm (NNPDF, Nature 2022) -> debated / evidence
 * 2. Data contracts in data/quark-facts.js & json
 * 3. Chapter 13 routing integrity in CHAPTER_LIST
 * 4. Zero unicode emojis across files
 */

import assert from 'assert';
import fs from 'fs';
import {
  getUnsolvedMysteriesData,
  UNSOLVED_MYSTERIES
} from './data/quark-facts.js';
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

console.log('--- Testing Chapter 13: Unsolved Mysteries of QCD ---');

// 1. DATASET INTEGRITY
it('Unsolved mysteries dataset contains exactly 10 cards with scientific status tags', () => {
  const data = getUnsolvedMysteriesData();
  assert(data, 'Mysteries data must be defined');
  assert.strictEqual(data.items.length, 10, 'Must have exactly 10 cards');

  // 1) Confinement & Mass Gap
  const c1 = data.items.find(i => i.id === 'confinement_mass_gap');
  assert(c1, 'Confinement mass gap card must exist');
  assert.strictEqual(c1.statusTag, 'unsolved');
  assert(c1.bounty.includes('$1,000,000') || c1.descriptionBn.includes('Clay Mathematics'), 'Must cite Clay prize');

  // 2) Proton Spin
  const c2 = data.items.find(i => i.id === 'proton_spin_puzzle');
  assert(c2, 'Proton spin puzzle card must exist');
  assert.strictEqual(c2.statusTag, 'partially_known');

  // 3) Exotic Hadrons
  const c3 = data.items.find(i => i.id === 'exotic_hadron_structure');
  assert(c3, 'Exotic hadrons card must exist');
  assert.strictEqual(c3.statusTag, 'debated');

  // 4) Glueball
  const c4 = data.items.find(i => i.id === 'glueball');
  assert(c4, 'Glueball card must exist');
  assert.strictEqual(c4.statusTag, 'hypothesized');

  // 5) QCD Critical Point
  const c5 = data.items.find(i => i.id === 'qcd_critical_point');
  assert(c5, 'QCD critical point card must exist');
  assert.strictEqual(c5.statusTag, 'unknown');

  // 6) Strong CP & Axion
  const c6 = data.items.find(i => i.id === 'strong_cp_axion');
  assert(c6, 'Strong CP card must exist');
  assert.strictEqual(c6.statusTag, 'unsolved');

  // 7) Quark Substructure Limit
  const c7 = data.items.find(i => i.id === 'quark_substructure');
  assert(c7, 'Quark substructure card must exist');
  assert.strictEqual(c7.statusTag, 'unknown');
  assert(c7.descriptionBn.includes('১০⁻¹⁸') || c7.statusEn.includes('10^-18'), 'Must mention < 10^-18 m limit');

  // 8) Dense Quark Matter
  const c8 = data.items.find(i => i.id === 'dense_quark_matter');
  assert(c8, 'Dense quark matter card must exist');
  assert.strictEqual(c8.statusTag, 'speculative');

  // 9) Toponium
  const c9 = data.items.find(i => i.id === 'toponium');
  assert(c9, 'Toponium card must exist');
  assert.strictEqual(c9.statusTag, 'ongoing');
  assert((c9.descriptionBn.includes('CMS') || c9.institution.includes('CMS')) && (c9.descriptionBn.includes('ATLAS') || c9.institution.includes('ATLAS')), 'Must cite CMS and ATLAS');

  // 10) Intrinsic Charm
  const c10 = data.items.find(i => i.id === 'intrinsic_charm');
  assert(c10, 'Intrinsic charm card must exist');
  assert.strictEqual(c10.statusTag, 'debated');
  assert((c10.institution.includes('Nature 608') || c10.descriptionBn.includes('নেচার')) && (c10.institution.includes('NNPDF') || c10.descriptionBn.includes('NNPDF')), 'Must cite Nature 2022 NNPDF');
});

// 2. CHAPTER ROUTING INTEGRITY
it('Chapter 13 is registered in CHAPTER_LIST with valid hash', () => {
  const ch13 = CHAPTER_LIST.find(c => c.id === 'chapter-13');
  assert(ch13, 'Chapter 13 must exist in CHAPTER_LIST');
  assert.strictEqual(ch13.hash, '#/quarks/chapter-13');
  assert.strictEqual(ch13.isAvailable, true);
  assert.strictEqual(ch13.titleBn, 'অজানা ও অমীমাংসিত');
});

// 3. ZERO EMOJI IN CODE
it('Zero unicode emojis in Chapter 13 files', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-13.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, `Found emojis in quark/chapter-13.js: ${matches}`);
});

console.log(`\nChapter 13 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
