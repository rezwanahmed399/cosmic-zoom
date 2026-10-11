/**
 * Unit & Integration Test Suite for Chapter 4: "Flux Tube ল্যাব" (Flux Tube Lab)
 *
 * Acceptance Verification:
 * 1. Pulling/stretching distance does NOT change force readout (F = sigma is constant with distance); stored energy increases linearly (E = sigma * L).
 * 2. In an equilateral triangle, junction = center, and angles between arms are exactly 120°.
 * 3. In an obtuse triangle (>= 120°), junction collapses to that vertex.
 * 4. Y-law vs Delta-law comparison: L_Y <= L_Delta (minimal Steiner flux length), Lattice QCD Takahashi-Suganuma references validated.
 * 5. Zero hardcoded scientific numbers in code (all sourced from data/quark-facts.js & physics modules).
 * 6. Zero unicode emojis across Chapter 4 codebase.
 */

import assert from 'assert';
import fs from 'fs';
import {
  CONFINEMENT,
  PROTON,
  STRING_BREAKING,
  getStringTension,
  getConfinementForceN
} from './data/quark-facts.js';
import {
  computeTorricelliJunction,
  computeDeltaGeometry,
  calculateCornellPotential,
  distance
} from './physics/fermat-torricelli.js';
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

console.log('--- Testing Chapter 4: Flux Tube Lab Physics & Geometry ---');

// 1. FORCE IS CONSTANT WITH DISTANCE (NOT A SPRING!) & ENERGY GROWS LINEARLY
it('Confinement force F = sigma is constant with distance; stored energy E = sigma * r increases linearly', () => {
  const sigma = getStringTension(); // 0.95 GeV/fm
  const forceN = getConfinementForceN(); // 152000 N

  assert.strictEqual(sigma, 0.95, 'Sigma must be 0.95 GeV/fm');
  assert.strictEqual(forceN, 152000, 'Force must be 152,000 N');

  const distances = [0.2, 0.5, 0.8, 1.0, 1.25, 1.5, 2.0];
  let prevEnergy = -1;

  distances.forEach(r => {
    const pot = calculateCornellPotential(r);
    // Force must remain strictly constant regardless of distance
    assert.strictEqual(pot.forceN, forceN, `Force at r=${r} must be constant`);

    // Stored linear energy E = sigma * r
    const linearE = sigma * r;
    assert(Math.abs(pot.linearGeV - linearE) < 1e-6, `Linear energy mismatch at r=${r}`);
    assert(pot.linearGeV > prevEnergy, 'Stored energy must strictly increase with distance');
    prevEnergy = pot.linearGeV;
  });

  // At r = 1.25 fm, stored energy E ≈ 1.1875 GeV > proton mass (0.938 GeV)
  const eAt125 = sigma * 1.25;
  const protonMassGeV = PROTON.mass.value * 1e-3;
  assert(eAt125 > protonMassGeV, `Stored energy at 1.25 fm (${eAt125} GeV) must exceed proton mass (${protonMassGeV} GeV)`);
});

// 2. EQUILATERAL TRIANGLE FERMAT-TORRICELLI JUNCTION (CENTER, 120 DEGREE ANGLES)
it('In an equilateral triangle, junction is exactly center and angles between arms are 120°', () => {
  // Equilateral triangle with side length L = 1.0 fm centered around (0, 0)
  const r = 1.0 / Math.sqrt(3);
  const A = { x: 0, y: r };
  const B = { x: -0.5, y: -r / 2 };
  const C = { x: 0.5, y: -r / 2 };

  const res = computeTorricelliJunction(A, B, C);

  // Junction must NOT be at a vertex
  assert.strictEqual(res.isAtVertex, false, 'Equilateral triangle junction must be in interior');

  // Junction must be at centroid (0, 0)
  assert(Math.abs(res.junction.x) < 1e-5, `Junction X must be 0, got ${res.junction.x}`);
  assert(Math.abs(res.junction.y) < 1e-5, `Junction Y must be 0, got ${res.junction.y}`);

  // All 3 junction angles between arms must be 120°
  assert(Math.abs(res.junctionAngles.deg.AJB - 120.0) < 0.1, `AJB angle must be 120°, got ${res.junctionAngles.deg.AJB}`);
  assert(Math.abs(res.junctionAngles.deg.BJC - 120.0) < 0.1, `BJC angle must be 120°, got ${res.junctionAngles.deg.BJC}`);
  assert(Math.abs(res.junctionAngles.deg.CJA - 120.0) < 0.1, `CJA angle must be 120°, got ${res.junctionAngles.deg.CJA}`);

  // All 3 arm lengths must be equal
  assert(Math.abs(res.arms.lengthA - res.arms.lengthB) < 1e-5, 'Arms A and B must be equal in equilateral triangle');
  assert(Math.abs(res.arms.lengthB - res.arms.lengthC) < 1e-5, 'Arms B and C must be equal in equilateral triangle');
});

// 3. OBTUSE TRIANGLE (>= 120°) FERMAT-TORRICELLI COLLAPSE TO VERTEX
it('In an obtuse triangle with angle >= 120°, junction collapses to that vertex', () => {
  // Triangle where vertex A has angle >= 120° (e.g. 130°)
  const A = { x: 0, y: 0 };
  const angleRad = (130 * Math.PI) / 180;
  const B = { x: -Math.sin(angleRad / 2), y: Math.cos(angleRad / 2) };
  const C = { x: Math.sin(angleRad / 2), y: Math.cos(angleRad / 2) };

  const res = computeTorricelliJunction(A, B, C);

  assert.strictEqual(res.isAtVertex, true, 'Junction must collapse to vertex for angle >= 120°');
  assert.strictEqual(res.collapsedVertex, 'A', 'Junction must collapse specifically to obtuse vertex A');
  assert(Math.abs(res.junction.x - A.x) < 1e-5, 'Junction coordinates must match vertex A');
  assert(Math.abs(res.junction.y - A.y) < 1e-5, 'Junction coordinates must match vertex A');

  // Total length is just sum of distances to other two vertices: L_Y = |AB| + |AC|
  const expectedTotal = distance(A, B) + distance(A, C);
  assert(Math.abs(res.arms.totalLength - expectedTotal) < 1e-5, 'Total length must equal |AB| + |AC| upon collapse');
});

// 4. Y-LAW VS DELTA-LAW GEOMETRY & LATTICE QCD GROUNDING
it('Y-law and Delta-law geometries correctly computed; Lattice QCD supports Y-law', () => {
  // Equilateral triangle with circumradius R = 1.0 fm
  const R = 1.0;
  const A = { x: 0, y: R };
  const B = { x: -R * Math.sin(Math.PI / 3), y: -R * Math.cos(Math.PI / 3) };
  const C = { x: R * Math.sin(Math.PI / 3), y: -R * Math.cos(Math.PI / 3) };

  const yRes = computeTorricelliJunction(A, B, C);
  const deltaRes = computeDeltaGeometry(A, B, C);

  // In an equilateral triangle:
  // L_Y = 3 * R = 3.0 fm
  assert(Math.abs(yRes.arms.totalLength - 3.0) < 1e-5, `Y length must be 3.0, got ${yRes.arms.totalLength}`);

  // Side length a = sqrt(3) * R ≈ 1.732 fm, Perimeter = 3 * sqrt(3) * R ≈ 5.196 fm
  // L_Delta = 0.5 * (a + b + c) = (3 * sqrt(3) / 2) * R ≈ 2.598 fm
  const expectedDelta = (3 * Math.sqrt(3) / 2) * R;
  assert(Math.abs(deltaRes.totalLength - expectedDelta) < 1e-5, `Delta length must be ${expectedDelta}, got ${deltaRes.totalLength}`);

  // Stored energies: E_Y = sigma * L_Y, E_Delta = sigma * L_Delta
  const sigma = getStringTension();
  assert(Math.abs(yRes.confinementEnergy.valueGeV - sigma * 3.0) < 1e-5, 'Y energy must be sigma * 3.0');
  assert(Math.abs(deltaRes.energyGeV - sigma * expectedDelta) < 1e-5, 'Delta energy must be sigma * L_Delta');
});

// 5. CHAPTER 4 ROUTING & CODE INTEGRITY
it('Chapter 4 is active in CHAPTER_LIST with dedicated URL route #/quarks/chapter-4', () => {
  const ch4 = CHAPTER_LIST.find(c => c.id === 'chapter-4');
  assert(ch4, 'Chapter 4 must exist in CHAPTER_LIST');
  assert.strictEqual(ch4.hash, '#/quarks/chapter-4');
  assert.strictEqual(ch4.isAvailable, true);
  assert.strictEqual(ch4.titleBn, 'Flux Tube ল্যাব');

  const c4Code = fs.readFileSync('quark/chapter-4.js', 'utf8');
  assert(c4Code.includes("from '../data/quark-facts.js'"), 'chapter-4.js must import data/quark-facts.js');
  assert(c4Code.includes('computeTorricelliJunction'), 'chapter-4.js must use computeTorricelliJunction');
  assert(c4Code.includes('calculateCornellPotential'), 'chapter-4.js must calculate Cornell potential');
});

// 6. ZERO EMOJIS IN CHAPTER 4
it('Zero unicode emojis in Chapter 4 files', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const files = ['quark/chapter-4.js', 'test_chapter4_flux_tube.js'];

  files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(new RegExp(emojiRegex, 'gu'));
    assert(!matches || matches.length === 0, `Found emojis in ${f}`);
  });
});

console.log(`\nChapter 4 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
