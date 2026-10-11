import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import {
  PROTON,
  getJiMassDecomposition,
  getProtonMassOrigin
} from './data/quark-facts.js';
import { CHAPTER_LIST } from './quark/quark-app.js';
import { Chapter7MassOrigin } from './quark/chapter-7.js';

describe('Chapter 7: Origin of Mass (ভর কোথা থেকে আসে) - Scientific & Architectural Audit', () => {

  // 1. DATA AUDIT: BAR (a) VALENCE QUARK MASS
  it('Bar (a) data represents ~1% (~9 MeV) valence current quark mass vs ~99% dynamical QCD energy', () => {
    const massOrigin = getProtonMassOrigin();
    assert.ok(massOrigin, 'getProtonMassOrigin must return valid object');
    assert.ok(Math.abs(massOrigin.totalProtonMass.value - 938.272) < 0.001, 'Proton mass should be 938.272 MeV/c^2');
    assert.strictEqual(massOrigin.totalProtonMass.unit, 'MeV/c^2');

    // u + u + d bare masses: 2.16 + 2.16 + 4.67 = 8.99 ≈ 9.0 MeV
    const valSum = massOrigin.valenceSum.value;
    assert.ok(Math.abs(valSum - 8.99) < 0.05, `Valence mass sum ${valSum} should be ≈ 9.0 MeV`);
    
    // Fraction of proton mass ≈ 0.0096 (~1%)
    const fraction = massOrigin.valenceSum.fractionOfProtonMass;
    assert.ok(fraction > 0.009 && fraction < 0.011, `Valence fraction ${fraction} should be ≈ 1%`);

    // Missing energy ≈ 929.3 MeV (≈ 99%)
    const missing = massOrigin.missingDynamicalEnergy.value;
    assert.ok(Math.abs(missing - 929.28) < 0.1, `Missing dynamical energy should be ≈ 929.3 MeV`);
  });

  // 2. DATA AUDIT: BAR (b) JI MASS DECOMPOSITION & UNCERTAINTIES
  it('Bar (b) Ji decomposition exactly matches PRL 121, 212001 (2018) with complete uncertainty bands', () => {
    const ji = getJiMassDecomposition();
    assert.ok(ji, 'getJiMassDecomposition must return valid object');
    assert.ok(ji.scheme.includes('MS-bar'), 'Scheme must specify MS-bar');
    assert.strictEqual(ji.scaleGeV, 2.0);
    assert.strictEqual(ji.referencePaper.journal, 'PRL');
    assert.strictEqual(ji.referencePaper.volume, 121);
    assert.strictEqual(ji.referencePaper.page, 212001);
    assert.strictEqual(ji.referencePaper.year, 2018);
    assert.strictEqual(ji.tier, 'T2');

    const comp = ji.components;
    assert.ok(comp.quarkEnergy, 'Must contain quarkEnergy');
    assert.ok(comp.glueEnergy, 'Must contain glueEnergy');
    assert.ok(comp.traceAnomaly, 'Must contain traceAnomaly');
    assert.ok(comp.quarkMassContribution, 'Must contain quarkMassContribution');

    // Percentage values
    assert.strictEqual(comp.quarkEnergy.percentage, 32);
    assert.strictEqual(comp.glueEnergy.percentage, 36);
    assert.strictEqual(comp.traceAnomaly.percentage, 23);
    assert.strictEqual(comp.quarkMassContribution.percentage, 9);

    // Sum of percentages must equal 100%
    const totalPct = comp.quarkEnergy.percentage + comp.glueEnergy.percentage + comp.traceAnomaly.percentage + comp.quarkMassContribution.percentage;
    assert.strictEqual(totalPct, 100, 'Sum of Ji decomposition components must be exactly 100%');

    // Uncertainty notation breakdown: 32(4)(4)%, 36(5)(4)%, 23(1)(1)%, 9(2)(1)%
    assert.strictEqual(comp.quarkEnergy.notation, '32(4)(4)%');
    assert.strictEqual(comp.quarkEnergy.statUncertainty, 4);
    assert.strictEqual(comp.quarkEnergy.systUncertainty, 4);

    assert.strictEqual(comp.glueEnergy.notation, '36(5)(4)%');
    assert.strictEqual(comp.glueEnergy.statUncertainty, 5);
    assert.strictEqual(comp.glueEnergy.systUncertainty, 4);

    assert.strictEqual(comp.traceAnomaly.notation, '23(1)(1)%');
    assert.strictEqual(comp.traceAnomaly.statUncertainty, 1);
    assert.strictEqual(comp.traceAnomaly.systUncertainty, 1);

    assert.strictEqual(comp.quarkMassContribution.notation, '9(2)(1)%');
    assert.strictEqual(comp.quarkMassContribution.statUncertainty, 2);
    assert.strictEqual(comp.quarkMassContribution.systUncertainty, 1);
  });

  // 3. SCIENTIFIC RULES & BANNED PHRASES CHECK
  it('Enforces scientific warnings and strictly prohibits misleading "99% Higgs ছাড়া" statements', () => {
    const c7Code = fs.readFileSync('quark/chapter-7.js', 'utf8');
    const factsJson = fs.readFileSync('data/quark-facts.json', 'utf8');

    // Prohibited phrase: "99% Higgs ছাড়া" or "৯৯% হিগস ছাড়া" as a statement of fact
    const bannedRegex = /"99%\s*Higgs\s*ছাড়া"/i;
    assert.ok(!bannedRegex.test(c7Code), 'Code must not endorse banned phrasing "99% Higgs ছাড়া"');

    // Must prominently display warning badge "[T2] আনুমানিক, স্কিম-নির্ভর"
    assert.ok(c7Code.includes('আনুমানিক, স্কিম-নির্ভর (T2)') || c7Code.includes('আনুমানিক ও স্কিম-নির্ভর (T2)'),
      'Must display "আনুমানিক, স্কিম-নির্ভর (T2)" warning');

    // Must explain physical distinction between (a) and (b): sea quarks and chiral condensate
    assert.ok(c7Code.includes('sea') || c7Code.includes('সি-কোয়ার্ক'), 'Must explain sea quarks in Bar (b)');
    assert.ok(c7Code.includes('condensate') || c7Code.includes('কনডেনসেট'), 'Must explain chiral condensate in Bar (b)');

    // Must emphasize E = mc² and ~90% QCD kinetic & color field energy
    assert.ok(c7Code.includes('E = mc²') || c7Code.includes('E = mc^2'), 'Must mention E = mc²');
    assert.ok(c7Code.includes('৯০%') || c7Code.includes('90%') || c7Code.includes('৯১%'), 'Must mention ~90% QCD dynamical energy');
  });

  // 4. ROUTER & CONTINUITY INTEGRITY
  it('Chapter 7 is active in CHAPTER_LIST with route #/quarks/chapter-7', () => {
    const ch7 = CHAPTER_LIST.find(c => c.id === 'chapter-7');
    assert.ok(ch7, 'Chapter 7 must exist in CHAPTER_LIST');
    assert.strictEqual(ch7.hash, '#/quarks/chapter-7');
    assert.strictEqual(ch7.isAvailable, true);
    assert.strictEqual(ch7.titleBn, 'ভর কোথা থেকে আসে');
    assert.strictEqual(ch7.numberBn, '৭');
    assert.strictEqual(ch7.tier, 'T2');
  });

  // 5. DOM INSTANTIATION & INTERACTIVITY
  it('Chapter7MassOrigin mounts cleanly and provides interactive component inspection', () => {
    // Setup minimal DOM mock
    const makeMockEl = (tag = 'div') => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        id: '',
        style: {
          setProperty() {}
        },
        innerHTML: '',
        attributes: {},
        parentNode: { removeChild: () => {} },
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k]; },
        addEventListener() {},
        querySelector() {
          return makeMockEl();
        },
        querySelectorAll() {
          return [makeMockEl(), makeMockEl()];
        },
        appendChild(child) { return child; },
        removeChild(child) { return child; },
        classList: {
          toggle() {},
          add() {},
          remove() {}
        }
      };
      return el;
    };

    globalThis.document = {
      createElement: (tag) => makeMockEl(tag)
    };

    const container = makeMockEl();

    const chapter = new Chapter7MassOrigin({
      container,
      lang: 'bn',
      level: 'basic'
    });

    assert.ok(chapter.viewEl, 'Must instantiate viewEl DOM');
    assert.strictEqual(chapter.activeComponentId, 'quarkEnergy');

    // Test selectComponent switches active component
    chapter.selectComponent('glueEnergy');
    assert.strictEqual(chapter.activeComponentId, 'glueEnergy');

    chapter.selectComponent('traceAnomaly');
    assert.strictEqual(chapter.activeComponentId, 'traceAnomaly');

    chapter.selectComponent('quarkMassContribution');
    assert.strictEqual(chapter.activeComponentId, 'quarkMassContribution');

    // Clean up
    chapter.destroy();
    delete globalThis.document;
  });

  // 6. WCAG 2.2 AA & ZERO UNICODE EMOJIS IN CODE
  it('Zero unicode emojis in Chapter 7 files', () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
    const files = ['quark/chapter-7.js', 'test_chapter7_mass_origin.js'];

    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      const matches = content.match(new RegExp(emojiRegex, 'gu'));
      assert.strictEqual(matches, null, `File ${f} must have zero emojis, but found: ${matches ? matches.join(' ') : ''}`);
    }
  });

});
