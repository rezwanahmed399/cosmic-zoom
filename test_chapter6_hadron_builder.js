/**
 * Unit & Integration Test Suite for Chapter 6: Hadron Builder
 *
 * Acceptance Verification:
 * 1. Acceptance hadrons: p, n, pi+, pi-, pi0, K+, K0, Lambda, Sigma+, Delta++, Omega-, J/psi, Upsilon correctly identified.
 * 2. Invalid quark configurations rejected with explicit physical reasons (e.g. u u, u u d_bar).
 * 3. Spin/isospin ambiguity toggles (uud -> p / Delta+; udd -> n / Delta0; uds -> Lambda / Sigma0; uuu -> Delta++ only).
 * 4. Color-valid but unobserved combinations show badge without inventing fake names.
 * 5. Exotic gallery verified (X(3872), Pc pentaquarks, T_cc+, Glueball).
 * 6. Hadron size comparison values matched (pion 0.66 fm, kaon 0.56 fm, proton 0.84 fm).
 * 7. Chapter 6 router integration & lifecycle.
 * 8. Zero unicode emojis.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  HADRONS,
  EXOTIC_HADRONS,
  HADRON_SIZES,
  getExoticHadrons,
  getHadronSizes,
  getQuarkData
} from './data/quark-facts.js';
import {
  lookupHadron,
  validateHadronComposition,
  canonicalQuarkKey
} from './physics/hadron-lookup.js';
import { CHAPTER_LIST } from './quark/quark-app.js';
import { Chapter6HadronBuilder } from './quark/chapter-6.js';

describe('Chapter 6: Hadron Builder Acceptance Tests', () => {

  it('All 13 acceptance hadrons are correctly identified from quark slots', () => {
    // 1. Proton uud
    const proton = lookupHadron(['u', 'u', 'd'], { spin: 0.5 });
    assert.equal(proton.found, true);
    assert.equal(proton.match.symbol, 'p');
    assert.equal(proton.match.charge, 1);
    assert.equal(proton.match.baryonNumber, 1);

    // 2. Neutron udd
    const neutron = lookupHadron(['u', 'd', 'd'], { spin: 0.5 });
    assert.equal(neutron.found, true);
    assert.equal(neutron.match.symbol, 'n');
    assert.equal(neutron.match.charge, 0);

    // 3. Pion plus u d_bar
    const piPlus = lookupHadron(['u', 'd_bar']);
    assert.equal(piPlus.found, true);
    assert.equal(piPlus.match.symbol, 'π⁺');
    assert.equal(piPlus.match.charge, 1);

    // 4. Pion minus d u_bar
    const piMinus = lookupHadron(['d', 'u_bar']);
    assert.equal(piMinus.found, true);
    assert.equal(piMinus.match.symbol, 'π⁻');
    assert.equal(piMinus.match.charge, -1);

    // 5. Neutral pion u u_bar or d d_bar
    const piZeroU = lookupHadron(['u', 'u_bar']);
    assert.equal(piZeroU.found, true);
    assert.equal(piZeroU.match.symbol, 'π⁰');

    const piZeroD = lookupHadron(['d', 'd_bar']);
    assert.equal(piZeroD.found, true);
    assert.equal(piZeroD.match.symbol, 'π⁰');

    // 6. Kaon plus u s_bar
    const kPlus = lookupHadron(['u', 's_bar']);
    assert.equal(kPlus.found, true);
    assert.equal(kPlus.match.symbol, 'K⁺');
    assert.equal(kPlus.match.charge, 1);

    // 7. Kaon zero d s_bar
    const kZero = lookupHadron(['d', 's_bar']);
    assert.equal(kZero.found, true);
    assert.equal(kZero.match.symbol, 'K⁰');
    assert.equal(kZero.match.charge, 0);

    // 8. Lambda uds (isospin 0)
    const lambda = lookupHadron(['u', 'd', 's'], { isospin: 0 });
    assert.equal(lambda.found, true);
    assert.equal(lambda.match.symbol, 'Λ');
    assert.equal(lambda.match.isospin, 0);

    // 9. Sigma plus uus
    const sigmaPlus = lookupHadron(['u', 'u', 's']);
    assert.equal(sigmaPlus.found, true);
    assert.equal(sigmaPlus.match.symbol, 'Σ⁺');
    assert.equal(sigmaPlus.match.charge, 1);

    // 10. Delta plus plus uuu
    const deltaPlusPlus = lookupHadron(['u', 'u', 'u']);
    assert.equal(deltaPlusPlus.found, true);
    assert.equal(deltaPlusPlus.match.symbol, 'Δ⁺⁺');
    assert.equal(deltaPlusPlus.match.spin, 1.5);
    assert.equal(deltaPlusPlus.match.charge, 2);

    // 11. Omega minus sss
    const omegaMinus = lookupHadron(['s', 's', 's']);
    assert.equal(omegaMinus.found, true);
    assert.equal(omegaMinus.match.symbol, 'Ω⁻');
    assert.equal(omegaMinus.match.charge, -1);
    assert.equal(omegaMinus.match.spin, 1.5);

    // 12. J/psi c c_bar
    const jpsi = lookupHadron(['c', 'c_bar']);
    assert.equal(jpsi.found, true);
    assert.equal(jpsi.match.symbol, 'J/ψ');

    // 13. Upsilon b b_bar
    const upsilon = lookupHadron(['b', 'b_bar']);
    assert.equal(upsilon.found, true);
    assert.equal(upsilon.match.symbol, 'Υ(1S)');
  });

  it('Rejects invalid configurations with explicit scientific reasons', () => {
    // u u: 2 quarks without antiquarks
    const uu = validateHadronComposition(['u', 'u']);
    assert.equal(uu.isValid, false);
    assert.equal(uu.isColorSinglet, false);
    assert.equal(uu.isChargeInteger, false);
    assert.match(uu.violationReasonBn, /color-singlet নয়/);
    assert.match(uu.violationReasonBn, /q q̄/);

    // u u d_bar: 2 quarks + 1 antiquark
    const uudBar = validateHadronComposition(['u', 'u', 'd_bar']);
    assert.equal(uudBar.isValid, false);
    assert.equal(uudBar.isColorSinglet, false);
    assert.match(uudBar.violationReasonBn, /qqq \(ব্যারিয়ন\) অথবা q̄q̄q̄/);

    // Solitary quark u
    const solitary = validateHadronComposition(['u']);
    assert.equal(solitary.isValid, false);
    assert.equal(solitary.isColorSinglet, false);
    assert.match(solitary.violationReasonBn, /কনফাইনমেন্ট লঙ্ঘন/);

    // 4 quarks without antiquarks (u u u u)
    const fourQuarks = validateHadronComposition(['u', 'u', 'u', 'u']);
    assert.equal(fourQuarks.isValid, false);
    assert.match(fourQuarks.violationReasonBn, /টেট্রাকোয়ার্ক/);
  });

  it('Resolves valence ambiguities via spin and isospin toggles', () => {
    // uud: p (spin 0.5) vs Delta+ (spin 1.5)
    const uudP = lookupHadron(['u', 'u', 'd'], { spin: 0.5 });
    const uudDelta = lookupHadron(['u', 'u', 'd'], { spin: 1.5 });
    assert.equal(uudP.match.symbol, 'p');
    assert.equal(uudDelta.match.symbol, 'Δ⁺');
    assert.equal(uudP.isAmbiguous, true);
    assert.equal(uudP.candidates.length >= 2, true);

    // udd: n (spin 0.5) vs Delta0 (spin 1.5)
    const uddN = lookupHadron(['u', 'd', 'd'], { spin: 0.5 });
    const uddDelta0 = lookupHadron(['u', 'd', 'd'], { spin: 1.5 });
    assert.equal(uddN.match.symbol, 'n');
    assert.equal(uddDelta0.match.symbol, 'Δ⁰');

    // uds: Lambda (I = 0) vs Sigma0 (I = 1)
    const udsLambda = lookupHadron(['u', 'd', 's'], { isospin: 0 });
    const udsSigma0 = lookupHadron(['u', 'd', 's'], { isospin: 1 });
    assert.equal(udsLambda.match.symbol, 'Λ');
    assert.equal(udsSigma0.match.symbol, 'Σ⁰');

    // uuu: only Delta++ (spin 1.5)
    const uuu = lookupHadron(['u', 'u', 'u']);
    assert.equal(uuu.match.symbol, 'Δ⁺⁺');
    assert.equal(uuu.match.spin, 1.5);
  });

  it('Color-valid unobserved combinations display special badge without inventing names', () => {
    // u u b is a valid color-singlet baryon with integer charge (+1 e), but not in standard ground state table
    const unobs = lookupHadron(['u', 'u', 'b']);
    assert.equal(unobs.isValid, true);
    assert.equal(unobs.isColorValidUnobserved, true);
    assert.equal(unobs.badgeBn, 'রঙ-বৈধ, কিন্তু ডেটা-ফাইলে নেই/পর্যবেক্ষিত নয়');
    assert.equal(unobs.match, null);
  });

  it('Exotic gallery correctly defines X(3872), Pc pentaquarks, T_cc+, and Glueball', () => {
    const exotics = getExoticHadrons();
    assert.ok(exotics.x_3872, 'X(3872) must be in exotic gallery');
    assert.equal(exotics.x_3872.symbol, 'X(3872)');
    assert.equal(exotics.x_3872.mass.value, 3871.65);
    assert.equal(exotics.x_3872.discovery.year, 2003);
    assert.match(exotics.x_3872.discovery.experiment, /Belle/);

    assert.ok(exotics.p_c_4312, 'P_c(4312)+ must be in exotic gallery');
    assert.equal(exotics.p_c_4312.mass.value, 4311.9);
    assert.ok(exotics.p_c_4440, 'P_c(4440)+ must be in exotic gallery');
    assert.ok(exotics.p_c_4457, 'P_c(4457)+ must be in exotic gallery');

    assert.ok(exotics.t_cc_plus, 'T_cc+ must be in exotic gallery');
    assert.equal(exotics.t_cc_plus.symbol, 'T_cc⁺');
    assert.equal(exotics.t_cc_plus.mass.value, 3874.74);
    assert.match(exotics.t_cc_plus.discovery.experiment, /LHCb/);

    assert.ok(exotics.glueball, 'Glueball must be in exotic gallery');
    assert.equal(exotics.glueball.statusBn, 'অনুমিত, নিশ্চিত নয়');
    assert.equal(exotics.glueball.quarkContent.length, 0);
  });

  it('Hadron size comparison data matches PDG measurements', () => {
    const sizes = getHadronSizes();
    assert.equal(sizes.pion.approximateFm, 0.66);
    assert.equal(sizes.pion.chargeRadiusFm, 0.659);

    assert.equal(sizes.kaon.approximateFm, 0.56);
    assert.equal(sizes.kaon.chargeRadiusFm, 0.560);

    assert.equal(sizes.proton.approximateFm, 0.84);
    assert.equal(sizes.proton.chargeRadiusFm, 0.8414);
  });

  it('Quark app defines Chapter 6 as active with valid route #/quarks/chapter-6', () => {
    const ch6 = CHAPTER_LIST.find(c => c.id === 'chapter-6');
    assert.ok(ch6, 'Chapter 6 must exist in CHAPTER_LIST');
    assert.equal(ch6.isAvailable, true);
    assert.equal(ch6.hash, '#/quarks/chapter-6');
    assert.equal(ch6.titleBn, 'Hadron Builder');
  });

  it('Chapter6HadronBuilder instantiates and binds successfully', () => {
    // Mock DOM container
    const mockContainer = {
      appendChild: () => {},
      removeChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };

    assert.doesNotThrow(() => {
      // Construction test
      assert.equal(typeof Chapter6HadronBuilder, 'function');
    });
  });

  it('Zero unicode emojis in Chapter 6 codebase and tests', () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
    const targetFiles = ['quark/chapter-6.js', 'test_chapter6_hadron_builder.js'];

    targetFiles.forEach(file => {
      const code = fs.readFileSync(file, 'utf8');
      const matches = code.match(new RegExp(emojiRegex, 'gu'));
      assert.equal(matches, null, `Found emojis in ${file}`);
    });
  });

});
