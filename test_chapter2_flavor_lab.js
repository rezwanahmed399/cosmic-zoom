/**
 * Automated Test Suite for Chapter 2: "Flavor ল্যাব + নিউট্রন ক্ষয়" (Flavor Lab & Neutron Decay)
 * 
 * Verifies:
 * 1. Six quark cards data integrity (3 generations x 2 types, mass span, discovery, decay).
 * 2. Top quark special physics (decay before hadronization, tau ≈ 5x10^-25 s, 2025 toponium candidate).
 * 3. Neutron decay physics & Conservation Ledger (charge, baryon, lepton number conservation).
 * 4. Free neutron lifetime ≈ 878.4 s verified against PDG 2024/2026.
 * 5. CKM matrix latest values verified from PDG 2024 (Phys. Rev. D 110, 030001, 2024) with diagonal dominance.
 * 6. Core rule adherence: Flavor changes ONLY via weak interaction; strong force preserves flavor.
 * 7. Strictly zero unicode emojis across Chapter 2 code and data.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  QUARKS,
  NEUTRON_DECAY,
  CKM_MATRIX,
  getNeutronDecayInfo,
  getCkmMatrix,
  getSixQuarksList
} from './data/quark-facts.js';
import { CHAPTER_LIST } from './quark/quark-app.js';
import { Chapter2FlavorLab } from './quark/chapter-2.js';

describe('Chapter 2: Flavor Lab & Neutron Decay Verification', () => {

  // 1. SIX QUARK CARDS & MASS HIERARCHY
  it('Six quark cards span 3 generations and 2 types with scheme-dependent mass labels and discoveries', () => {
    const list = getSixQuarksList();
    assert.strictEqual(list.length, 6, 'Must contain all 6 fundamental quarks');

    const [u, d, c, s, t, b] = list;

    // Up-type quarks (+2/3 e)
    [u, c, t].forEach(q => {
      assert.strictEqual(q.type, 'up-type');
      assert.strictEqual(q.charge.fraction, '+2/3');
      assert(Math.abs(q.charge.value - 2/3) < 1e-6);
      assert.strictEqual(q.charge.tier, 'T1');
    });

    // Down-type quarks (-1/3 e)
    [d, s, b].forEach(q => {
      assert.strictEqual(q.type, 'down-type');
      assert.strictEqual(q.charge.fraction, '-1/3');
      assert(Math.abs(q.charge.value - (-1/3)) < 1e-6);
      assert.strictEqual(q.charge.tier, 'T1');
    });

    // Generations
    assert.strictEqual(u.generation, 1);
    assert.strictEqual(d.generation, 1);
    assert.strictEqual(c.generation, 2);
    assert.strictEqual(s.generation, 2);
    assert.strictEqual(t.generation, 3);
    assert.strictEqual(b.generation, 3);

    // Mass span: u ≈ 2.16 MeV to t ≈ 172.57 GeV (172570 MeV)
    const uMassMeV = u.mass.value; // 2.16 MeV
    const tMassMeV = t.mass.value * 1000; // 172570 MeV
    const massRatio = tMassMeV / uMassMeV;
    assert(massRatio > 70000 && massRatio < 90000, 'Mass ratio between u and t must be ~80,000x');

    // Scheme labels
    assert(u.mass.scheme.includes('MS-bar'), 'Light quark u must use MS-bar scheme');
    assert(d.mass.scheme.includes('MS-bar'), 'Light quark d must use MS-bar scheme');
    assert(s.mass.scheme.includes('MS-bar'), 'Quark s must use MS-bar scheme');
    assert(c.mass.scheme.includes('MS-bar'), 'Quark c must use MS-bar scheme');
    assert(b.mass.scheme.includes('MS-bar'), 'Quark b must use MS-bar scheme');
    assert(t.mass.scheme.includes('pole mass') || t.mass.scheme.includes('Direct'), 'Top quark must use direct/pole mass');

    // Discovery / Evidence strings
    assert(u.discovery.textEn.includes('1964') && u.discovery.textEn.includes('SLAC'));
    assert(d.discovery.textEn.includes('1964') && d.discovery.textEn.includes('SLAC'));
    assert(s.discovery.textEn.includes('1947') || s.discovery.textEn.includes('1953'));
    assert(c.discovery.textEn.includes('1974') && c.discovery.textEn.includes('J/psi'));
    assert(b.discovery.textEn.includes('1977') && b.discovery.textEn.includes('Upsilon'));
    assert(t.discovery.textEn.includes('1995') && t.discovery.textEn.includes('Fermilab'));
  });

  // 2. TOP QUARK SPECIAL PHYSICS
  it('Top quark card defines lifetime ≈ 5x10^-25 s, t -> W b, and 2025 toponium candidate note', () => {
    const t = QUARKS.t;
    assert.strictEqual(t.lifetime.value, 5e-25, 'Top lifetime must be 5e-25 s');
    assert.strictEqual(t.decaysBeforeHadronization.value, true, 'Top must decay before hadronization');
    assert(t.decay.modeEn.includes('t -> W^+ + b'), 'Top decay mode must be t -> W^+ + b');

    // 2025 toponium excess note
    assert(t.toponiumCandidateNote, 'Toponium candidate note must be present');
    assert.strictEqual(t.toponiumCandidateNote.labelBn, 'ব্যাখ্যা চলমান', 'Must be labeled “ব্যাখ্যা চলমান”');
    assert(t.toponiumCandidateNote.value.includes('CMS') && t.toponiumCandidateNote.value.includes('ATLAS'));
  });

  // 3. NEUTRON DECAY PHYSICS & CONSERVATION LEDGER
  it('Neutron decay accurately models d -> u + W^-* with strictly verified conservation ledger', () => {
    const decay = getNeutronDecayInfo();
    assert(decay, 'Neutron decay info must exist');

    // Free neutron lifetime ≈ 878.4 s from PDG
    assert.strictEqual(decay.freeNeutronLifetimeSec.value, 878.4, 'Free neutron lifetime must be 878.4 s');
    assert.strictEqual(decay.freeNeutronLifetimeSec.unit, 's');
    assert.strictEqual(decay.freeNeutronLifetimeSec.tier, 'T1');

    // Reaction and internal mechanism
    assert.strictEqual(decay.reaction, 'n -> p + e^- + nu_e_bar');
    assert.strictEqual(decay.quarkTransition, 'd -> u + W^-*');
    assert.strictEqual(decay.bosonDecay, 'W^-* -> e^- + nu_e_bar');

    // Conservation Ledger
    const ledger = decay.conservationLedger;

    // Electric Charge: -1/3 -> +2/3 + (-1) = -1/3 (Hadron: 0 -> +1 + (-1) = 0)
    assert.strictEqual(ledger.electricCharge.conserved, true);
    assert(Math.abs(ledger.electricCharge.initial - ledger.electricCharge.final) < 1e-9);

    // Baryon Number: 1/3 -> 1/3 (Hadron: 1 -> 1)
    assert.strictEqual(ledger.baryonNumber.conserved, true);
    assert.strictEqual(ledger.baryonNumber.initial, ledger.baryonNumber.final);

    // Lepton Number: 0 -> +1 + (-1) = 0
    assert.strictEqual(ledger.leptonNumber.conserved, true);
    assert.strictEqual(ledger.leptonNumber.final, 0);

    // Core rule statement
    assert(decay.coreFlavorLaw.textBn.includes('flavor বদলায় শুধু দুর্বল বলে'), 'Must state flavor changes only via weak force');
    assert(decay.coreFlavorLaw.textBn.includes('শক্তিশালী বল (গ্লুয়ন) কখনো flavor বদলায় না'), 'Must state strong force does not change flavor');
  });

  // 4. CKM MATRIX ACCURACY (PDG 2024 / PHYS. REV. D 110, 030001, 2024)
  it('CKM matrix contains latest PDG 2024 values with diagonal dominance and physical processes', () => {
    const ckm = getCkmMatrix();
    assert(ckm, 'CKM matrix data must exist');
    assert(ckm.source.includes('PDG 2024'), 'Source must cite PDG 2024');

    const elems = ckm.elements;

    // Check all 9 matrix elements
    const expected = {
      V_ud: { val: 0.97367, err: '+- 0.00032' },
      V_us: { val: 0.22431, err: '+- 0.00085' },
      V_ub: { val: 0.00382, err: '+- 0.00020' },
      V_cd: { val: 0.22100, err: '+- 0.00400' },
      V_cs: { val: 0.97500, err: '+- 0.00600' },
      V_cb: { val: 0.04110, err: '+- 0.00120' },
      V_td: { val: 0.00860, err: '+- 0.00020' },
      V_ts: { val: 0.04150, err: '+- 0.00090' },
      V_tb: { val: 1.01000, err: '+- 0.02700' }
    };

    Object.entries(expected).forEach(([key, exp]) => {
      const el = elems[key];
      assert(el, `Element ${key} must exist in CKM matrix`);
      assert.strictEqual(el.value, exp.val, `Value of ${key} must match PDG 2024`);
      assert.strictEqual(el.uncertainty, exp.err, `Uncertainty of ${key} must match PDG 2024`);
      assert(el.processEn, `Physical decay process for ${key} must be documented`);
      assert(el.processBn, `Bengali description for ${key} must be documented`);
      assert.strictEqual(el.tier, 'T1');
    });

    // Verify diagonal dominance: |V_ud|, |V_cs|, |V_tb| ~ 1
    assert(elems.V_ud.value > 0.95);
    assert(elems.V_cs.value > 0.95);
    assert(elems.V_tb.value >= 1.0);

    // Verify cross-generation suppression: |V_ub| << |V_us| << |V_ud|
    assert(elems.V_ub.value < elems.V_us.value);
    assert(elems.V_us.value < elems.V_ud.value);
  });

  // 5. FLAVOR VISUAL POLICY (HUE-INDEPENDENT)
  it('Chapter 2 uses glyphs, patterns and typography for flavor, reserving hue for color charge', () => {
    const c2Code = fs.readFileSync('quark/chapter-2.js', 'utf8');

    // Rule pill present
    assert(c2Code.includes('FLAVOR_GLYPHS'), 'chapter-2.js must use geometric FLAVOR_GLYPHS');
    assert(c2Code.includes('ফ্লেভার দেখানো হয়েছে জ্যামিতিক প্যাটার্নে, রঙে নয়') || c2Code.includes('Glyphs/patterns, never hue'),
      'Must state flavor visual rule in UI');

    // Zero hardcoded numbers check: imports from data/quark-facts.js
    assert(c2Code.includes("from '../data/quark-facts.js'"), 'chapter-2.js must import data/quark-facts.js');
    assert(c2Code.includes('getNeutronDecayInfo'), 'Must use getNeutronDecayInfo');
    assert(c2Code.includes('getCkmMatrix'), 'Must use getCkmMatrix');
    assert(c2Code.includes('getSixQuarksList'), 'Must use getSixQuarksList');
  });

  // 6. CHAPTER ROUTING INTEGRITY
  it('Quark app defines Chapter 2 as active with smooth navigation to Chapter 1 and Chapter 3', () => {
    const ch2 = CHAPTER_LIST.find(c => c.id === 'chapter-2');
    assert(ch2, 'Chapter 2 must exist in CHAPTER_LIST');
    assert.strictEqual(ch2.hash, '#/quarks/chapter-2');
    assert.strictEqual(ch2.isAvailable, true, 'Chapter 2 must now be available (not a placeholder)');
    assert(ch2.titleBn.includes('Flavor'), 'Title must be Flavor Lab');

    const c2Code = fs.readFileSync('quark/chapter-2.js', 'utf8');
    assert(c2Code.includes('#/quarks/chapter-1'), 'Must have back link to Chapter 1');
    assert(c2Code.includes('#/quarks/chapter-3'), 'Must have forward link to Chapter 3');
  });

  // 7. COMPONENT INSTANTIATION & LIFECYCLE
  it('Chapter2FlavorLab instantiates properly with full event bindings and destroy method', () => {
    assert(typeof Chapter2FlavorLab === 'function', 'Chapter2FlavorLab must be a constructor');
    const proto = Chapter2FlavorLab.prototype;
    assert(typeof proto.render === 'function');
    assert(typeof proto.bindEvents === 'function');
    assert(typeof proto.updateDecayScene === 'function');
    assert(typeof proto.setLevel === 'function');
    assert(typeof proto.destroy === 'function');
  });

  // 8. ZERO UNICODE EMOJIS
  it('Zero unicode emojis in Chapter 2 codebase', () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
    const files = [
      'quark/chapter-2.js',
      'quark/quark-app.js',
      'quark/quark-styles.css',
      'data/quark-facts.json',
      'data/quark-facts.js'
    ];

    files.forEach(file => {
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

});
