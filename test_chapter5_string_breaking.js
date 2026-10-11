/**
 * Unit & Integration Test Suite for Chapter 5: "টেনে ছেঁড়া" (String Breaking - Mode A)
 *
 * Acceptance Verification (Prompt 4 Requirements):
 * 1. sigma = 0.95 GeV/fm, ell = 1.25 fm: W ≈ 0.64 GeV, E_total ≈ 1.577 GeV; for pi0 + p, p* ≈ 0.50 GeV/c.
 * 2. u pull + d d_bar -> pi+ + n: Q (+1 = +1 + 0), B (1 = 0 + 1), S (0 = 0).
 * 3. d pull + u u_bar -> pi- + Delta++: Q (+1 = -1 + 2); invalid channel when ell < 1.03 fm.
 * 4. u pull + s s_bar -> K+ + Lambda: S (0 = +1 + -1); invalid channel when ell < 1.28 fm.
 * 5. Both daughter hadrons [A q_bar] and [q B C] are strictly color-singlets.
 * 6. Same seed -> deterministic identical outcome; confinement force readout F = sigma is constant with ell.
 * 7. Zero hardcoded scientific numbers in code (all bound to data/quark-facts.js & physics modules).
 * 8. Zero unicode emojis across the Chapter 5 codebase.
 */

import assert from 'assert';
import fs from 'fs';
import {
  CONFINEMENT,
  PROTON,
  STRING_BREAKING,
  HADRONS,
  getStringTension,
  getConfinementForceN
} from './data/quark-facts.js';
import {
  erf,
  calculateBreakingProbability,
  createPRNG,
  evaluateStringPullingState,
  calculateKinematics
} from './physics/string-breaking.js';
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

console.log('--- Testing Chapter 5: String Breaking (Mode A: Slow Pull) ---');

// 1. WORK, TOTAL ENERGY, AND RELATIVISTIC CM MOMENTUM (ell = 1.25 fm)
it('sigma = 0.95, ell = 1.25 fm -> W ≈ 0.64 GeV, E_total ≈ 1.577 GeV, pi0 + p -> p* ≈ 0.50 GeV/c', () => {
  const sigma = getStringTension();
  assert.strictEqual(sigma, 0.95, 'String tension sigma must be 0.95 GeV/fm');

  const state = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.25,
    seed: 42
  });

  // W ≈ 0.639 GeV ≈ 0.64 GeV
  assert(Math.abs(state.workDoneGeV - 0.64) < 0.01, `Work done must be ~0.64 GeV, got ${state.workDoneGeV.toFixed(4)}`);
  // E_total ≈ 1.577 GeV
  assert(Math.abs(state.totalEnergyGeV - 1.577) < 0.005, `Total energy must be ~1.577 GeV, got ${state.totalEnergyGeV.toFixed(4)}`);

  // Evaluate pi0 + p kinematics
  const pi0Mass = HADRONS.pi0.mass.value * 1e-3; // ~0.135 GeV
  const pMass = HADRONS.p.mass.value * 1e-3;    // ~0.938 GeV
  const kin = calculateKinematics(state.totalEnergyGeV, pi0Mass, pMass);

  // p* ≈ 0.50 GeV/c (0.497 GeV/c)
  assert(Math.abs(kin.pStarGeV - 0.50) < 0.01, `Outgoing momentum p* must be ~0.50 GeV/c, got ${kin.pStarGeV.toFixed(4)}`);
  assert(kin.beta1 > 0 && kin.beta1 < 1.0, `Meson speed beta1 must be subluminal, got ${kin.beta1}`);
  assert(kin.beta2 > 0 && kin.beta2 < 1.0, `Baryon speed beta2 must be subluminal, got ${kin.beta2}`);
  assert(kin.beta1 > kin.beta2, 'Lighter pion must have higher velocity than heavier proton');
});

// 2. CONSERVATION LAWS: u PULL + d d_bar -> pi+ + n
it('u pull + d d_bar -> pi+ + n: Q (+1 = +1 + 0), B (1 = 0 + 1), S (0 = 0)', () => {
  const state = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.30,
    seed: 101
  });

  const ddChannel = state.evaluatedChannels.find(ch => ch.pairFlavor === 'd');
  assert(ddChannel, 'd d_bar channel must be defined for u pull');
  assert.strictEqual(ddChannel.meson.symbol, 'π⁺');
  assert.strictEqual(ddChannel.baryon.symbol, 'n');

  // Verify quantum numbers
  const initialCharge = 1;
  const finalCharge = ddChannel.meson.charge + ddChannel.baryon.charge; // +1 + 0 = +1
  assert.strictEqual(finalCharge, initialCharge, 'Electric charge must be conserved: +1 = +1 + 0');

  const initialBaryon = 1;
  const finalBaryon = ddChannel.meson.baryonNumber + ddChannel.baryon.baryonNumber; // 0 + 1 = 1
  assert.strictEqual(finalBaryon, initialBaryon, 'Baryon number must be conserved: 1 = 0 + 1');

  const initialStrangeness = 0;
  const finalStrangeness = ddChannel.meson.strangeness + ddChannel.baryon.strangeness; // 0 + 0 = 0
  assert.strictEqual(finalStrangeness, initialStrangeness, 'Strangeness must be conserved: 0 = 0');
});

// 3. CHANNEL THRESHOLD & INVALID CHANNEL: d PULL + u u_bar -> pi- + Delta++
it('d pull + u u_bar -> pi- + Delta++: Q (+1 = -1 + 2); invalid channel when ell < 1.03 fm', () => {
  // At ell = 1.00 fm (below threshold 1.03 fm)
  const subThresholdState = evaluateStringPullingState({
    pulledQuarkKey: 'd',
    pulledFlavor: 'd',
    pulledColor: 'blue',
    otherQuarks: [
      { flavor: 'u', color: 'red' },
      { flavor: 'u', color: 'green' }
    ],
    ellFm: 1.00,
    seed: 55
  });

  const subCh = subThresholdState.evaluatedChannels.find(ch => ch.pairFlavor === 'u');
  assert(subCh, 'u u_bar channel must be present');
  assert.strictEqual(subCh.meson.symbol, 'π⁻');
  assert.strictEqual(subCh.baryon.symbol, 'Δ⁺⁺');
  assert.strictEqual(subCh.isAllowed, false, 'Channel pi- + Delta++ must be forbidden when ell < 1.03 fm');
  assert.strictEqual(subCh.weight, 0, 'Forbidden channel weight must be 0');

  // At ell = 1.15 fm (above threshold 1.03 fm)
  const aboveThresholdState = evaluateStringPullingState({
    pulledQuarkKey: 'd',
    pulledFlavor: 'd',
    pulledColor: 'blue',
    otherQuarks: [
      { flavor: 'u', color: 'red' },
      { flavor: 'u', color: 'green' }
    ],
    ellFm: 1.15,
    seed: 55
  });

  const aboveCh = aboveThresholdState.evaluatedChannels.find(ch => ch.pairFlavor === 'u');
  assert.strictEqual(aboveCh.isAllowed, true, 'Channel pi- + Delta++ must be allowed when ell >= 1.03 fm');
  assert(aboveCh.weight > 0, 'Allowed channel weight must be > 0');

  // Verify charge conservation: -1 + 2 = +1
  const finalCharge = aboveCh.meson.charge + aboveCh.baryon.charge;
  assert.strictEqual(finalCharge, 1, 'Charge must be conserved (+1 = -1 + 2)');
});

// 4. STRANGENESS CONSERVATION & THRESHOLD: u PULL + s s_bar -> K+ + Lambda
it('u pull + s s_bar -> K+ + Lambda: S (0 = +1 + -1); invalid channel when ell < 1.28 fm', () => {
  // At ell = 1.20 fm (below threshold 1.28 fm)
  const subState = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.20,
    seed: 777
  });

  const subSs = subState.evaluatedChannels.find(ch => ch.pairFlavor === 's');
  assert(subSs, 's s_bar channel must be present');
  assert.strictEqual(subSs.meson.symbol, 'K⁺');
  assert.strictEqual(subSs.baryon.symbol, 'Λ');
  assert.strictEqual(subSs.isAllowed, false, 'Channel K+ + Lambda must be forbidden when ell < 1.28 fm');
  assert.strictEqual(subSs.weight, 0, 'Forbidden strange channel weight must be 0');

  // At ell = 1.35 fm (above threshold 1.28 fm)
  const aboveState = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.35,
    seed: 777
  });

  const aboveSs = aboveState.evaluatedChannels.find(ch => ch.pairFlavor === 's');
  assert.strictEqual(aboveSs.isAllowed, true, 'Channel K+ + Lambda must be allowed when ell >= 1.28 fm');
  assert(aboveSs.weight > 0, 'Allowed strange channel weight must be > 0');

  // Strangeness conservation: K+ (S = +1), Lambda (S = -1) -> Net S = 0
  const finalStrangeness = aboveSs.meson.strangeness + aboveSs.baryon.strangeness;
  assert.strictEqual(finalStrangeness, 0, 'Strangeness must be conserved (0 = +1 + -1)');
});

// 5. COLOR-SINGLET CONSERVATION ON BOTH DAUGHTER HADRONS
it('Both daughter hadrons [A q_bar] and [q B C] are strictly color-singlets', () => {
  ['u1', 'u2', 'd'].forEach(quarkKey => {
    const pulledFlavor = quarkKey.startsWith('u') ? 'u' : 'd';
    const pulledColor = quarkKey === 'u1' ? 'red' : (quarkKey === 'u2' ? 'green' : 'blue');
    const otherColors = ['red', 'green', 'blue'].filter(c => c !== pulledColor);

    const state = evaluateStringPullingState({
      pulledQuarkKey: quarkKey,
      pulledFlavor: pulledFlavor,
      pulledColor: pulledColor,
      otherQuarks: [
        { flavor: 'u', color: otherColors[0] },
        { flavor: 'd', color: otherColors[1] }
      ],
      ellFm: 1.35,
      seed: 8888
    });

    const audit = state.ledgerAudit;
    assert(audit, 'Ledger audit must be computed');
    assert.strictEqual(audit.colorSinglet.conserved, true, `Daughter hadrons must both be color singlets when pulling ${quarkKey}`);
    assert.strictEqual(audit.allConserved, true, 'All conservation laws must pass simultaneously');
  });
});

// 6. DETERMINISTIC SEED REPRODUCIBILITY & DISTANCE-INVARIANT FORCE READOUT
it('Same seed -> deterministic identical outcome; force readout is strictly distance-invariant F = sigma', () => {
  const seed = 987654321;
  const state1 = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.30,
    seed: seed
  });

  const state2 = evaluateStringPullingState({
    pulledQuarkKey: 'u1',
    pulledFlavor: 'u',
    pulledColor: 'red',
    otherQuarks: [
      { flavor: 'u', color: 'green' },
      { flavor: 'd', color: 'blue' }
    ],
    ellFm: 1.30,
    seed: seed
  });

  assert.strictEqual(state1.selectedChannel.channelKey, state2.selectedChannel.channelKey, 'Same seed must select identical channel');
  assert.strictEqual(state1.breakFraction, state2.breakFraction, 'Same seed must produce identical break location');
  assert.strictEqual(state1.lockedRollU, state2.lockedRollU, 'Same seed must lock identical roll u');

  // Verify force readout is strictly distance-invariant F = sigma = 152,000 N across multiple ell values
  const forceN = getConfinementForceN();
  assert.strictEqual(forceN, 152000, 'Confinement force must be 152,000 N');

  const testDistances = [0.60, 0.80, 1.00, 1.25, 1.40, 1.50];
  testDistances.forEach(ell => {
    const st = evaluateStringPullingState({
      pulledQuarkKey: 'u1',
      pulledFlavor: 'u',
      pulledColor: 'red',
      otherQuarks: [
        { flavor: 'u', color: 'green' },
        { flavor: 'd', color: 'blue' }
      ],
      ellFm: ell,
      seed: seed
    });
    // Force does not depend on distance (not a spring!)
    assert.strictEqual(st.forceN, forceN, `Force at ell=${ell} fm must remain constant at 152,000 N`);
  });
});

// 7. BREAKING PROBABILITY (ERF CURVE, CENTER AT 1.25 FM, FORCED AT 1.5 FM)
it('Breaking probability: P_break(1.25) ≈ 0.50, P_break(1.50) = 1.0 (forced)', () => {
  const pCenter = calculateBreakingProbability(1.25);
  assert(Math.abs(pCenter - 0.50) < 1e-4, `Probability at center 1.25 fm must be 0.50, got ${pCenter}`);

  const pLow = calculateBreakingProbability(0.90);
  assert(pLow < 0.01, `Probability at 0.90 fm must be near 0, got ${pLow}`);

  const pForced = calculateBreakingProbability(1.50);
  assert.strictEqual(pForced, 1.0, 'Probability at 1.50 fm must be forced to 1.0');

  const pHigh = calculateBreakingProbability(1.60);
  assert.strictEqual(pHigh, 1.0, 'Probability for ell >= 1.50 fm must be 1.0');
});

// 8. ZERO EMOJI AUDIT IN CHAPTER 5 AND PHYSICS STRING BREAKING
it('Zero unicode emojis in Chapter 5 codebase', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const filesToAudit = [
    'quark/chapter-5.js',
    'physics/string-breaking.js'
  ];

  filesToAudit.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(new RegExp(emojiRegex, 'gu'));
    assert(!matches || matches.length === 0, `Found emojis in ${f}: ${matches ? matches.join(' ') : ''}`);
  });
});

console.log(`\nChapter 5 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
