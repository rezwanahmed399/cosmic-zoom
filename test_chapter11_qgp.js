/**
 * Unit & Integration Test Suite for Chapter 11: "আদি মহাবিশ্ব ও কোয়ার্ক-গ্লুয়ন প্লাজমা" (QGP)
 */

import assert from 'assert';
import fs from 'fs';
import {
  getQgpCosmologyData,
  QGP_COSMOLOGY
} from './data/quark-facts.js';
import { Chapter11QGP } from './quark/chapter-11.js';
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

console.log('--- Testing Chapter 11: Early Universe & QGP ---');

// 1. DATA INTEGRITY & PEER-REVIEWED SOURCES
it('QGP Transition temperature is verified (T_c = 156.5 +- 1.5 MeV ~ 1.8 x 10^12 K; HotQCD / Wuppertal-Budapest)', () => {
  const data = getQgpCosmologyData();
  assert(data, 'QGP data must exist');
  assert.strictEqual(data.transitionTemperatureMeV.value, 156.5);
  assert.strictEqual(data.transitionTemperatureMeV.uncertainty, 1.5);
  assert(Math.abs(data.transitionTemperatureMeV.kelvin - 1.816e12) < 0.05e12);
  assert(data.transitionTemperatureMeV.source.includes('HotQCD'));
  assert(data.transitionTemperatureMeV.source.includes('Wuppertal-Budapest'));
});

// 2. UNIVERSE AGE AT HADRONIZATION ERA
it('Universe age at T_c is within ~10 to 30 microseconds (~ 10^-5 s)', () => {
  const data = getQgpCosmologyData();
  assert(data.universeAgeMicroseconds.range[0] <= 10.0);
  assert(data.universeAgeMicroseconds.range[1] >= 30.0);
  assert.strictEqual(data.universeAgeMicroseconds.nominal, 15.0);
  assert.strictEqual(data.universeAgeMicroseconds.seconds, 1.5e-5);
});

// 3. SMOOTH CROSSOVER NATURE (ZERO BARYON DENSITY)
it('Transition at zero net-baryon density is scientifically documented as a smooth crossover', () => {
  const data = getQgpCosmologyData();
  assert.strictEqual(data.transitionNature.typeEn, 'Smooth Crossover (not a sharp 1st-order phase transition)');
  assert(data.transitionNature.explanationBn.includes('মসৃণ'));
  assert.strictEqual(data.transitionNature.tier, 'T2');
});

// 4. RHIC & ALICE NEARLY PERFECT FLUID
it('QGP fluid behavior is documented from RHIC and LHC ALICE', () => {
  const data = getQgpCosmologyData();
  assert(data.nearlyPerfectFluid.discoveryFacility.includes('RHIC'));
  assert(data.nearlyPerfectFluid.discoveryFacility.includes('ALICE'));
  assert(data.nearlyPerfectFluid.propertyBn.includes('প্রায় নিখুঁত তরল'));
});

// 5. NEUTRON STAR CORE SPECULATION BADGE
it('Dense cold quark matter in neutron star cores is labeled speculative / empirically unknown', () => {
  const data = getQgpCosmologyData();
  assert(data.neutronStarCoreSpeculation.statusBn.includes('অজানা') || data.neutronStarCoreSpeculation.statusBn.includes('অনুমান'));
  assert.strictEqual(data.neutronStarCoreSpeculation.statusEn, 'Empirically Unknown / Speculative');
});

// 6. CHAPTER LIST ROUTER CONTRACT
it('Chapter 11 is available in CHAPTER_LIST with dedicated hash and tier T2', () => {
  const ch11 = CHAPTER_LIST.find(c => c.id === 'chapter-11');
  assert(ch11, 'Chapter 11 must exist in CHAPTER_LIST');
  assert.strictEqual(ch11.hash, '#/quarks/chapter-11');
  assert.strictEqual(ch11.isAvailable, true);
  assert.strictEqual(ch11.titleBn, 'আদি মহাবিশ্ব ও QGP');
  assert.strictEqual(ch11.tier, 'T2');
});

// 7. ZERO EMOJIS IN CODE
it('Zero unicode emojis in quark/chapter-11.js', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-11.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, 'Found emojis in quark/chapter-11.js');
});

console.log(`\nChapter 11 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
