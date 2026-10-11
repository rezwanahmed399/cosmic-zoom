/**
 * Comprehensive Test Suite for CosmoPlanck Quark Physics Modules
 * Tests:
 * 1. Conservation Ledger (Charge, Baryon, Flavor, Color-Singlet, Energy)
 * 2. Fermat-Torricelli Baryon Junction (angles, arm lengths, collapse to vertex at >= 120°)
 * 3. Hadron Lookup (quark content matching, spin/isospin disambiguation)
 */

import { validateReaction, verifyColorSingletState } from './physics/conservation-ledger.js';
import { computeTorricelliJunction, calculateAngle } from './physics/fermat-torricelli.js';
import { lookupHadron, queryHadrons } from './physics/hadron-lookup.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
  }
}

console.log('--- Testing Conservation Ledger ---');

// 1. Valid decay: pi0 -> gamma + gamma
const pi0Decay = validateReaction({
  initial: ['pi0'],
  final: ['gamma', 'gamma'],
  interactionType: 'electromagnetic'
});
assert(pi0Decay.valid === true, 'pi0 -> gamma + gamma must be valid');
assert(pi0Decay.chargeConserved === true, 'pi0 decay charge conserved');
assert(pi0Decay.baryonConserved === true, 'pi0 decay baryon conserved');

// 2. Valid QCD string breaking with ss_bar vacuum pair production:
// Meson (u d_bar) + (s s_bar pair) -> (u s_bar) + (s d_bar) [pi+ with energy -> K+ + K0_bar]
const stringBreaking = validateReaction({
  initial: [
    { type: 'quark', symbol: 'u', charge: 2/3, baryonNumber: 1/3, strangeness: 0, charm: 0, bottomness: 0, topness: 0, color: 'r', massGeV: 0.002 },
    { type: 'quark', symbol: 'd̄', charge: 1/3, baryonNumber: -1/3, strangeness: 0, charm: 0, bottomness: 0, topness: 0, color: 'anti-red', massGeV: 0.005 }
  ],
  final: [
    { type: 'quark', symbol: 'u', charge: 2/3, baryonNumber: 1/3, strangeness: 0, charm: 0, bottomness: 0, topness: 0, color: 'r', massGeV: 0.002 },
    { type: 'quark', symbol: 's̄', charge: 1/3, baryonNumber: -1/3, strangeness: 1, charm: 0, bottomness: 0, topness: 0, color: 'anti-red', massGeV: 0.093 },
    { type: 'quark', symbol: 's', charge: -1/3, baryonNumber: 1/3, strangeness: -1, charm: 0, bottomness: 0, topness: 0, color: 'b', massGeV: 0.093 },
    { type: 'quark', symbol: 'd̄', charge: 1/3, baryonNumber: -1/3, strangeness: 0, charm: 0, bottomness: 0, topness: 0, color: 'anti-blue', massGeV: 0.005 }
  ],
  availableEnergyGeV: 1.5,
  interactionType: 'strong'
});
assert(stringBreaking.valid === true, 'Valid string breaking event must pass all conservation laws');
assert(stringBreaking.flavorConserved === true, 'Flavor conserved in vacuum pair production');
assert(stringBreaking.colorSinglet === true, 'Net color remains singlet in string breaking');

// 3. Baryon violation attempt: proton -> positron + photon (p -> e+ + gamma)
const protonDecay = validateReaction({
  initial: ['p'],
  final: ['e+', 'gamma'],
  interactionType: 'strong'
});
assert(protonDecay.valid === false, 'Proton decay violates baryon number and must be rejected');
assert(protonDecay.baryonConserved === false, 'Baryon number not conserved in p -> e+ gamma');

// 4. Electric charge violation attempt: u -> d without W boson
const chargeViolation = validateReaction({
  initial: ['u'],
  final: ['d'],
  interactionType: 'strong'
});
assert(chargeViolation.valid === false, 'Charge violation event must be rejected');
assert(chargeViolation.chargeConserved === false, 'Charge not conserved');

// 5. Confinement color violation: isolated uncompensated red quark
const colorViolation = verifyColorSingletState([
  { type: 'quark', symbol: 'u', color: 'red' },
  { type: 'quark', symbol: 'u', color: 'green' }
]);
assert(colorViolation.isSinglet === false, 'Two colored quarks without blue or antiquarks must fail color singlet check');

// 6. Energy threshold violation: p -> Delta++ + pi- with insufficient kinetic energy
const thresholdViolation = validateReaction({
  initial: ['p'],
  final: ['delta_plus_plus', 'pi_minus'],
  availableEnergyGeV: 0.94 // Only 0.94 GeV available, but Delta++ + pi- needs 1.232 + 0.139 = 1.371 GeV
});
assert(thresholdViolation.valid === false, 'Energy threshold violation must be rejected');
assert(thresholdViolation.energySufficient === false, 'Energy insufficient flag set');

console.log('--- Testing Fermat–Torricelli Junction ---');

// 7. Equilateral triangle: centroid must be junction, angles must be 120 deg
const A_eq = { x: 0, y: 1 };
const B_eq = { x: -Math.sqrt(3) / 2, y: -0.5 };
const C_eq = { x: Math.sqrt(3) / 2, y: -0.5 };
const result_eq = computeTorricelliJunction(A_eq, B_eq, C_eq);

assert(Math.abs(result_eq.junction.x) < 1e-5, 'Equilateral junction X close to 0');
assert(Math.abs(result_eq.junction.y) < 1e-5, 'Equilateral junction Y close to 0');
assert(result_eq.isAtVertex === false, 'Equilateral junction is inside');
assert(Math.abs(result_eq.junctionAngles.deg.AJB - 120) < 1e-4, 'Equilateral AJB angle is 120°');
assert(Math.abs(result_eq.junctionAngles.deg.BJC - 120) < 1e-4, 'Equilateral BJC angle is 120°');
assert(Math.abs(result_eq.junctionAngles.deg.CJA - 120) < 1e-4, 'Equilateral CJA angle is 120°');
assert(result_eq.confinementEnergy.valueGeV > 0, 'Confinement potential energy calculated');

// 8. Scalene triangle with all angles < 120 deg:
// A(0, 2), B(-1.5, -0.5), C(1.8, -0.8)
const A_sc = { x: 0, y: 2 };
const B_sc = { x: -1.5, y: -0.5 };
const C_sc = { x: 1.8, y: -0.8 };
const result_sc = computeTorricelliJunction(A_sc, B_sc, C_sc);
assert(result_sc.isAtVertex === false, 'Scalene junction is strictly inside');
assert(Math.abs(result_sc.junctionAngles.deg.AJB - 120) < 0.05, 'Scalene AJB angle is 120°');
assert(Math.abs(result_sc.junctionAngles.deg.BJC - 120) < 0.05, 'Scalene BJC angle is 120°');
assert(Math.abs(result_sc.junctionAngles.deg.CJA - 120) < 0.05, 'Scalene CJA angle is 120°');

// 9. Obtuse triangle with angle >= 120 deg (e.g. angle A = 135 deg)
// A(0, 0), B(2, 0), C(-1.414, 1.414) -> Angle at A is 135° >= 120°
const A_ob = { x: 0, y: 0 };
const B_ob = { x: 2, y: 0 };
const C_ob = { x: -1.4142, y: 1.4142 };
const result_ob = computeTorricelliJunction(A_ob, B_ob, C_ob);
assert(result_ob.isAtVertex === true, 'Obtuse triangle junction must collapse to vertex');
assert(result_ob.collapsedVertex === 'A', 'Junction collapses to vertex A (obtuse vertex >= 120°)');
assert(Math.abs(result_ob.junction.x - A_ob.x) < 1e-6, 'Junction coordinates match vertex A');
assert(Math.abs(result_ob.junction.y - A_ob.y) < 1e-6, 'Junction coordinates match vertex A');

console.log('--- Testing Hadron Lookup ---');

// 10. Proton lookup (uud, spin 0.5)
const protonLookup = lookupHadron(['u', 'u', 'd'], { spin: 0.5 });
assert(protonLookup.found === true, 'Proton found');
assert(protonLookup.match.symbol === 'p', 'Proton symbol is p');
assert(protonLookup.match.mass.value === 938.272088, 'Proton mass matched');
assert(protonLookup.hadronClass === 'baryon', 'Proton is a baryon');

// 11. Delta+ lookup (uud, spin 1.5)
const deltaPlusLookup = lookupHadron(['u', 'u', 'd'], { spin: 1.5 });
assert(deltaPlusLookup.found === true, 'Delta+ found with spin 1.5');
assert(deltaPlusLookup.match.symbol === 'Δ⁺', 'Delta+ symbol is Δ⁺');
assert(deltaPlusLookup.match.spin === 1.5, 'Delta+ spin is 1.5');

// 12. Neutron lookup (udd, spin 0.5)
const neutronLookup = lookupHadron(['d', 'u', 'd'], { spin: 0.5 }); // Permutation test
assert(neutronLookup.found === true, 'Neutron found with permuted order');
assert(neutronLookup.match.symbol === 'n', 'Neutron symbol is n');

// 13. Delta0 lookup (udd, spin 1.5)
const delta0Lookup = lookupHadron(['u', 'd', 'd'], { spin: 1.5 });
assert(delta0Lookup.found === true, 'Delta0 found with spin 1.5');
assert(delta0Lookup.match.symbol === 'Δ⁰', 'Delta0 symbol is Δ⁰');

// 14. Lambda vs Sigma0 lookup (uds)
const lambdaLookup = lookupHadron(['u', 'd', 's'], { spin: 0.5, isospin: 0 });
assert(lambdaLookup.found === true, 'Lambda found');
assert(lambdaLookup.match.symbol === 'Λ', 'Lambda symbol is Λ');

const sigma0Lookup = lookupHadron(['u', 'd', 's'], { spin: 0.5, isospin: 1 });
assert(sigma0Lookup.found === true, 'Sigma0 found');
assert(sigma0Lookup.match.symbol === 'Σ⁰', 'Sigma0 symbol is Σ⁰');

// 15. Mesons: pi+, pi-, pi0, K+, Omega-, J/psi
const piPlus = lookupHadron(['u', 'd_bar']);
assert(piPlus.found === true && piPlus.match.symbol === 'π⁺', 'Pion plus lookup');

const piMinus = lookupHadron(['d', 'u_bar']);
assert(piMinus.found === true && piMinus.match.symbol === 'π⁻', 'Pion minus lookup');

const omegaMinus = lookupHadron(['s', 's', 's']);
assert(omegaMinus.found === true && omegaMinus.match.symbol === 'Ω⁻', 'Omega minus lookup');

const jpsi = lookupHadron(['c', 'c_bar']);
assert(jpsi.found === true && jpsi.match.symbol === 'J/ψ', 'J/psi lookup');

const upsilon = lookupHadron(['b', 'b_bar']);
assert(upsilon.found === true && upsilon.match.symbol === 'Υ(1S)', 'Upsilon 1S lookup');

console.log(`\nPhysics Tests Completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Quark Physics Engine tests passed successfully!');
  process.exit(0);
}
