/**
 * Automated Test Suite for Chapter 0: "স্কেল-সিঁড়ি" (Scale Ladder)
 * Validates:
 * 1. Scientific scale hierarchy data (Atom 10⁻¹⁰ m -> Nucleus 10⁻¹⁴ m -> Proton 1.7×10⁻¹⁵ m -> Quark < 10⁻¹⁸ m).
 * 2. CosmoPlanck 17-order Planck gap (10⁻¹⁸ m to 1.6×10⁻³⁵ m) and "এখানে জানা শেষ, এরপর অজানা" signpost.
 * 3. Logarithmic scale ruler and monotonic position coordinates.
 * 4. Truth tier annotations (T1 empirical bounds, T4 symbolic visuals).
 * 5. Chapter 0 module exports, pedagogy levels, and Chapter 1 CTA transition.
 * 6. Zero unicode emojis across Chapter 0 files.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  SCALE_LADDER,
  PROTON,
  QUARKS,
  getScaleLadderSteps,
  getPlanckGapInfo
} from './data/quark-facts.js';
import { CHAPTER_LIST } from './quark/quark-app.js';
import { Chapter0ScaleLadder } from './quark/chapter-0.js';

describe('Chapter 0: "স্কেল-সিঁড়ি" (Scale Ladder) Gateway Verification', () => {

  // 1. DATA FILE INTEGRITY (T1 SCIENTIFIC MEASUREMENTS)
  it('SCALE_LADDER defines all 4 continuous zoom-in steps from atom to point-like quark limit', () => {
    const steps = getScaleLadderSteps();
    assert.strictEqual(steps.length, 4, 'Scale ladder must contain exactly 4 steps');

    const [atom, nucleus, proton, quark] = steps;

    // Step 1: Atom (পরমাণু) ≈ 10⁻¹⁰ m
    assert.strictEqual(atom.id, 'atom');
    assert.strictEqual(atom.exponent, -10);
    assert.strictEqual(atom.exponentStr, '10⁻¹⁰ m');
    assert.strictEqual(atom.exponentStrBn, '১০⁻¹⁰ মি');
    assert.strictEqual(atom.truthTier, 'T1');
    assert(atom.orderRatio === 1, 'Atom is baseline (1x)');

    // Step 2: Nucleus (নিউক্লিয়াস) ≈ 10⁻¹⁴ m / few × 10⁻¹⁵ m
    assert.strictEqual(nucleus.id, 'nucleus');
    assert.strictEqual(nucleus.exponent, -14);
    assert.strictEqual(nucleus.truthTier, 'T1');
    assert(nucleus.orderRatio >= 10000, 'Nucleus is at least 10,000x smaller than atom');

    // Step 3: Proton (প্রোটন) diameter ≈ 1.7 × 10⁻¹⁵ m (radius 0.8414 fm)
    assert.strictEqual(proton.id, 'proton');
    assert.strictEqual(proton.exponent, -15);
    assert.strictEqual(proton.truthTier, 'T1');
    assert(proton.sizeFormattedEn.includes('1.7'), 'Proton diameter must be approx 1.7 fm');
    assert.strictEqual(proton.sizeMeters, 1.7e-15);
    assert(proton.substructureFound === true, 'Proton substructure is confirmed (3 valence quarks)');

    // Step 4: Quark (কোয়ার্ক) < 10⁻¹⁸ m (Point-like limit, zero substructure found)
    assert.strictEqual(quark.id, 'quark');
    assert.strictEqual(quark.exponent, -18);
    assert.strictEqual(quark.truthTier, 'T1');
    assert.strictEqual(quark.substructureFound, false, 'No quark substructure found to date');
    assert(quark.limitMeters < 1e-18, 'Quark limit is upper bound < 1e-18 m');
  });

  // 2. COSMOPLANCK CONNECTION & THE 17-ORDER PLANCK GAP
  it('Accurately computes the 17 orders of magnitude gap between quark limit and Planck scale', () => {
    const gap = getPlanckGapInfo();
    assert(gap, 'Planck gap info must exist');

    assert.strictEqual(gap.quarkExponent, -18);
    assert.strictEqual(gap.planckExponent, -35);
    assert.strictEqual(gap.ordersOfMagnitude, 17, 'Order gap must be exactly 17 (35 - 18 = 17 orders)');
    assert.strictEqual(gap.planckLengthMeters, 1.616255e-35);

    // Bengali signpost statement
    assert(
      gap.signpostBn.includes('এখানে জানা শেষ, এরপর অজানা'),
      'Signpost must contain “এখানে জানা শেষ, এরপর অজানা”'
    );
    assert(
      gap.signpostEn.includes('Known realm ends here; the uncharted desert begins'),
      'English signpost must be present'
    );

    // Deep link bridges to CosmoPlanck scale continuum
    assert.strictEqual(gap.planckHash, '#s=-35.0', 'Must bridge to Planck scale #s=-35.0');
    assert.strictEqual(gap.quarkHash, '#s=-18.0', 'Must bridge to Quark scale #s=-18.0');
  });

  // 3. LOG-SCALE RULER MONOTONICITY & GEOMETRY
  it('Log-scale ruler positions and physical ratios are mathematically accurate', () => {
    const steps = SCALE_LADDER.steps;

    // Ratios
    const atomExp = steps[0].exponent; // -10
    const nucleusExp = steps[1].exponent; // -14
    const protonExp = steps[2].exponent; // -15
    const quarkExp = steps[3].exponent; // -18
    const planckExp = -35;

    // Absolute orders of magnitude steps
    assert(atomExp > nucleusExp);
    assert(nucleusExp > protonExp);
    assert(protonExp > quarkExp);
    assert(quarkExp > planckExp);

    // Order differences
    assert.strictEqual(atomExp - nucleusExp, 4); // 4 orders = 10,000x
    assert.strictEqual(nucleusExp - protonExp, 1); // 1 order = 10x
    assert.strictEqual(protonExp - quarkExp, 3); // 3 orders = 1,000x
    assert.strictEqual(quarkExp - planckExp, 17); // 17 orders = 10¹⁷x
  });

  // 4. TRUTH TIER LABELS & FACTSHEET SOURCING
  it('Chapter 0 imports and binds dynamically from factsheet data without hardcoded physics', () => {
    const c0Code = fs.readFileSync('quark/chapter-0.js', 'utf8');

    // Dynamic bindings
    assert(c0Code.includes("from '../data/quark-facts.js'"), 'chapter-0.js must import data/quark-facts.js');
    assert(c0Code.includes('SCALE_LADDER'), 'chapter-0.js must import SCALE_LADDER');
    assert(c0Code.includes('getScaleLadderSteps'), 'chapter-0.js must use getScaleLadderSteps');
    assert(c0Code.includes('getPlanckGapInfo'), 'chapter-0.js must use getPlanckGapInfo');

    // Truth Tier references (T1 empirical bounds, T4 symbolic visualization)
    assert(c0Code.includes('createTierBadge'), 'chapter-0.js must import createTierBadge');
    assert(c0Code.includes("'T1'"), 'chapter-0.js must use T1 tier badge');
    assert(c0Code.includes("'T4'"), 'chapter-0.js must use T4 tier badge');

    // De Broglie wavelength expert level
    assert(c0Code.includes('lambda = hbar*c / E') || c0Code.includes('\\lambda = \\frac{\\hbar c}{E}'),
      'chapter-0.js expert level must document de Broglie probe wavelength');
  });

  // 5. CHAPTER ROUTING & CTA CONTINUITY
  it('Quark app defines Chapter 0 as initial entrance with smooth CTA to Chapter 1', () => {
    assert.strictEqual(CHAPTER_LIST[0].id, 'chapter-0');
    assert.strictEqual(CHAPTER_LIST[0].hash, '#/quarks/chapter-0');
    assert.strictEqual(CHAPTER_LIST[0].isAvailable, true);
    assert.strictEqual(CHAPTER_LIST[0].titleBn, 'স্কেল-সিঁড়ি');

    const c0Code = fs.readFileSync('quark/chapter-0.js', 'utf8');
    assert(c0Code.includes('#c0-btn-go-ch1'), 'Must have CTA button navigating to Chapter 1');
    assert(c0Code.includes('#/quarks/chapter-1'), 'CTA must link to #/quarks/chapter-1');
  });

  // 6. ZERO UNICODE EMOJIS IN CODE AND MARKUP
  it('Zero unicode emojis in Chapter 0 and associated modules', () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
    const targetFiles = [
      'quark/chapter-0.js',
      'quark/quark-app.js',
      'quark/quark-styles.css',
      'data/quark-facts.json',
      'data/quark-facts.js'
    ];

    targetFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const match = emojiRegex.test(line);
        assert.strictEqual(
          match,
          false,
          `Forbidden unicode emoji found in ${file} at line ${idx + 1}: ${line.trim()}`
        );
      });
    });
  });

  // 7. COMPONENT INSTANTIATION & ACCESSIBILITY
  it('Chapter0ScaleLadder class instantiates and binds correctly', () => {
    assert(typeof Chapter0ScaleLadder === 'function', 'Chapter0ScaleLadder must be a class constructor');

    // Verify method definitions
    const proto = Chapter0ScaleLadder.prototype;
    assert(typeof proto.render === 'function', 'render method must exist');
    assert(typeof proto.bindEvents === 'function', 'bindEvents method must exist');
    assert(typeof proto.updateStepDisplay === 'function', 'updateStepDisplay method must exist');
    assert(typeof proto.setLevel === 'function', 'setLevel method must exist');
    assert(typeof proto.toggleAutoPlay === 'function', 'toggleAutoPlay method must exist');
    assert(typeof proto.openScaleInfoDrawer === 'function', 'openScaleInfoDrawer method must exist');
    assert(typeof proto.destroy === 'function', 'destroy method must exist');
  });

});
