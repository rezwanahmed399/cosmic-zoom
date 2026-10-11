/**
 * Unit & Integration Test Suite for Chapter 12: "প্রোটনের spin ধাঁধা" (Proton Spin Puzzle)
 */

import assert from 'assert';
import fs from 'fs';
import {
  getProtonSpinPuzzleData,
  PROTON_SPIN_PUZZLE
} from './data/quark-facts.js';
import { Chapter12SpinPuzzle } from './quark/chapter-12.js';
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

console.log('--- Testing Chapter 12: Proton Spin Puzzle ---');

// 1. DATA INTEGRITY & SUM CONSTRAINTS
it('Proton spin decomposition equation components sum to exactly 100% (0.50 hbar)', () => {
  const data = getProtonSpinPuzzleData();
  assert(data, 'Spin puzzle data must exist');
  assert.strictEqual(data.equation, '1/2 = (1/2)DeltaSigma + DeltaG + L_q + L_g');

  const comps = data.components;
  assert.strictEqual(comps.length, 4, 'Must have 4 spin components');

  const totalPct = comps.reduce((acc, c) => acc + c.percentage, 0);
  assert(Math.abs(totalPct - 100.0) < 1e-6, `Percentages must sum to 100%, got ${totalPct}%`);

  const totalVal = comps.reduce((acc, c) => acc + c.value, 0);
  assert(Math.abs(totalVal - 0.50) < 1e-6, `Component values must sum to 0.50 hbar, got ${totalVal}`);
});

// 2. COMPONENT PROPORTIONS & UNCERTAINTY BANDS
it('Component central values and ranges are within established experimental limits', () => {
  const data = getProtonSpinPuzzleData();
  const comps = data.components;

  const qs = comps.find(c => c.id === 'quark_spin');
  assert(qs, 'Quark spin component must exist');
  assert(qs.percentage >= 25.0 && qs.percentage <= 35.0, `Quark spin should be ~25-35%, got ${qs.percentage}%`);
  assert(qs.rangePercent[0] === 25.0 && qs.rangePercent[1] === 35.0);

  const gs = comps.find(c => c.id === 'gluon_spin');
  assert(gs, 'Gluon spin component must exist');
  assert(gs.percentage >= 35.0 && gs.percentage <= 45.0, `Gluon spin should be ~35-45%, got ${gs.percentage}%`);

  const qo = comps.find(c => c.id === 'quark_orbital');
  assert(qo, 'Quark orbital component must exist');
  assert(qo.percentage >= 15.0 && qo.percentage <= 25.0);

  const go = comps.find(c => c.id === 'gluon_orbital');
  assert(go, 'Gluon orbital component must exist');
  assert(go.percentage >= 5.0 && go.percentage <= 15.0);
});

// 3. MYTH BUSTING CLARITY
it('Myth-busting correctly debunks the naive 3-quark spin model using 1987 EMC discovery', () => {
  const data = getProtonSpinPuzzleData();
  assert(data.mythBusting, 'Myth busting section must exist');
  assert(data.mythBusting.naiveModelBn.includes('সরল'));
  assert(data.mythBusting.realityBn.includes('EMC'));
  assert(data.mythBusting.realityBn.includes('১৯৮৭'));
});

// 4. SCIENTIFIC TRUTH TIER
it('Spin puzzle status is labeled as Tier T2 (Partially unsolved mystery)', () => {
  const data = getProtonSpinPuzzleData();
  assert.strictEqual(data.tier, 'T2');
  assert(data.statusBn.includes('আংশিক অমীমাংসিত'));
});

// 5. CHAPTER LIST ROUTER CONTRACT
it('Chapter 12 is available in CHAPTER_LIST with dedicated hash and tier T2', () => {
  const ch12 = CHAPTER_LIST.find(c => c.id === 'chapter-12');
  assert(ch12, 'Chapter 12 must exist in CHAPTER_LIST');
  assert.strictEqual(ch12.hash, '#/quarks/chapter-12');
  assert.strictEqual(ch12.isAvailable, true);
  assert.strictEqual(ch12.titleBn, 'প্রোটনের spin ধাঁধা');
  assert.strictEqual(ch12.tier, 'T2');
});

// 6. ZERO EMOJIS IN CODE
it('Zero unicode emojis in quark/chapter-12.js', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-12.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, 'Found emojis in quark/chapter-12.js');
});

console.log(`\nChapter 12 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
