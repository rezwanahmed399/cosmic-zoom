/**
 * CosmoPlanck Physics Engine: Fermat–Torricelli Junction
 * Computes the optimal Y-shaped three-quark color flux tube junction in baryons.
 *
 * Supported by Lattice QCD (Takahashi et al.):
 * - 3 quarks in a baryon are connected by a Y-shaped flux tube meeting at the
 *   Fermat–Torricelli point to minimize the total flux tube length (and QCD field energy).
 * - If all internal angles are < 120° (2π/3 rad), the junction is inside the triangle
 *   and subtends exactly 120° between each pair of arms.
 * - If any internal angle is >= 120°, the junction collapses to that obtuse vertex.
 */

import { CONFINEMENT } from '../data/quark-facts.js';

const EPSILON = 1e-9;
const RAD_120 = (2 * Math.PI) / 3; // 120 degrees in radians

/**
 * Calculates Euclidean distance between two points in 2D or 3D.
 */
export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z ?? 0) - (p2.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates internal angle at vertex B formed by rays BA and BC.
 * Returns angle in radians [0, pi].
 */
export function calculateAngle(A, B, C) {
  const v1 = { x: A.x - B.x, y: A.y - B.y, z: (A.z ?? 0) - (B.z ?? 0) };
  const v2 = { x: C.x - B.x, y: C.y - B.y, z: (C.z ?? 0) - (B.z ?? 0) };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 < EPSILON || mag2 < EPSILON) return 0;

  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta);
}

/**
 * Computes the Fermat–Torricelli junction point and flux tube geometry for 3 quarks.
 *
 * @param {Object} A - First quark position { x, y, [z] }
 * @param {Object} B - Second quark position { x, y, [z] }
 * @param {Object} C - Third quark position { x, y, [z] }
 * @param {Object} [options]
 * @param {number} [options.stringTensionSigma] - Custom string tension in GeV/fm (default from quark-facts)
 * @returns {Object} Fermat-Torricelli geometry result
 */
export function computeTorricelliJunction(A, B, C, options = {}) {
  const sigma = options.stringTensionSigma ?? CONFINEMENT.stringTensionSigma.value;

  // 1. Calculate internal angles at all three vertices
  const angleA = calculateAngle(B, A, C);
  const angleB = calculateAngle(A, B, C);
  const angleC = calculateAngle(A, C, B);

  const anglesDeg = {
    A: (angleA * 180) / Math.PI,
    B: (angleB * 180) / Math.PI,
    C: (angleC * 180) / Math.PI
  };

  let junction = null;
  let isAtVertex = false;
  let collapsedVertex = null;

  // 2. Check if any angle >= 120 degrees (2pi/3 radians)
  // According to Torricelli's theorem & QCD flux tube simulations,
  // if an angle is >= 120°, the flux tube length is minimized at that vertex.
  if (angleA >= RAD_120 - EPSILON) {
    junction = { x: A.x, y: A.y, z: A.z ?? 0 };
    isAtVertex = true;
    collapsedVertex = 'A';
  } else if (angleB >= RAD_120 - EPSILON) {
    junction = { x: B.x, y: B.y, z: B.z ?? 0 };
    isAtVertex = true;
    collapsedVertex = 'B';
  } else if (angleC >= RAD_120 - EPSILON) {
    junction = { x: C.x, y: C.y, z: C.z ?? 0 };
    isAtVertex = true;
    collapsedVertex = 'C';
  } else {
    // 3. Interior Fermat-Torricelli Point:
    // Analytical computation via side-weighted barycentric coordinates (Kimberling X_13):
    // wA = a / sin(angleA + 60°), wB = b / sin(angleB + 60°), wC = c / sin(angleC + 60°)
    // where a = |BC|, b = |CA|, c = |AB|
    const a = distance(B, C);
    const b = distance(C, A);
    const c = distance(A, B);

    const shift = Math.PI / 3; // 60 degrees in radians
    const wA = a / Math.sin(angleA + shift);
    const wB = b / Math.sin(angleB + shift);
    const wC = c / Math.sin(angleC + shift);

    const sumW = wA + wB + wC;

    junction = {
      x: (wA * A.x + wB * B.x + wC * C.x) / sumW,
      y: (wA * A.y + wB * B.y + wC * C.y) / sumW,
      z: (wA * (A.z ?? 0) + wB * (B.z ?? 0) + wC * (C.z ?? 0)) / sumW
    };
  }

  // 4. Calculate individual arm lengths (from junction to each quark)
  const armA = distance(junction, A);
  const armB = distance(junction, B);
  const armC = distance(junction, C);
  const totalLength = armA + armB + armC;

  // 5. Calculate angles at junction between each pair of arms
  const angleAJB = calculateAngle(A, junction, B);
  const angleBJC = calculateAngle(B, junction, C);
  const angleCJA = calculateAngle(C, junction, A);

  const junctionAnglesDeg = {
    AJB: (angleAJB * 180) / Math.PI,
    BJC: (angleBJC * 180) / Math.PI,
    CJA: (angleCJA * 180) / Math.PI
  };

  // 6. Confinement potential energy: E = sigma * L_total
  const potentialEnergyGeV = sigma * totalLength;

  return {
    junction,
    isAtVertex,
    collapsedVertex,
    vertices: { A, B, C },
    internalAngles: {
      A: angleA,
      B: angleB,
      C: angleC,
      deg: anglesDeg
    },
    arms: {
      lengthA: armA,
      lengthB: armB,
      lengthC: armC,
      totalLength
    },
    junctionAngles: {
      AJB: angleAJB,
      BJC: angleBJC,
      CJA: angleCJA,
      deg: junctionAnglesDeg
    },
    confinementEnergy: {
      valueGeV: potentialEnergyGeV,
      stringTensionGeVPerFm: sigma,
      tier: 'T2'
    }
  };
}

/**
 * Convenience wrapper returning junction coordinates, angles, and arm lengths array.
 */
export function calculateFermatTorricelliJunction(p1, p2, p3, customSigma = null) {
  const res = computeTorricelliJunction(p1, p2, p3, customSigma);
  return {
    junction: res.junction,
    isVertex: res.isAtVertex,
    collapsedVertexIndex: res.collapsedVertex === 'A' ? 0 : (res.collapsedVertex === 'B' ? 1 : (res.collapsedVertex === 'C' ? 2 : null)),
    anglesDeg: [res.junctionAngles.deg.BJC, res.junctionAngles.deg.CJA, res.junctionAngles.deg.AJB],
    armLengthsFm: [res.arms.lengthA, res.arms.lengthB, res.arms.lengthC],
    totalLengthFm: res.arms.totalLength,
    confinementEnergyGeV: res.confinementEnergy.valueGeV,
    raw: res
  };
}

/**
 * Computes Delta-type flux tube geometry for comparison (half-perimeter model).
 * Disfavored by Lattice QCD (Takahashi & Suganuma et al. 2001/2002) in favor of the Y-law.
 * Formula: L_Delta = 0.5 * (a + b + c), E_Delta = sigma * L_Delta
 */
export function computeDeltaGeometry(A, B, C, customSigma = null) {
  const sigma = customSigma ?? CONFINEMENT.stringTensionSigma.value;
  const a = distance(B, C);
  const b = distance(C, A);
  const c = distance(A, B);
  const perimeter = a + b + c;
  const totalLength = perimeter / 2; // Delta-law effective flux length
  const energyGeV = sigma * totalLength;

  return {
    sides: { a, b, c },
    perimeter,
    totalLength,
    energyGeV,
    tier: 'T2'
  };
}

/**
 * Computes Cornell Potential for Mesons:
 * V(r) = -(4/3) * (alpha_s * hbar * c) / r + sigma * r
 *
 * @param {number} rFm - Quark-antiquark distance in femtometers (fm)
 * @param {Object} [options]
 * @returns {Object} Potential breakdown (Coulombic, Linear, Total in GeV, Force in N)
 */
export function calculateCornellPotential(rFm, options = {}) {
  const sigma = options.sigma ?? CONFINEMENT.stringTensionSigma.value;
  const alphaS = options.alphaS ?? CONFINEMENT.mesonCornellPotential.alphaSEffective.value;
  const hbarC = options.hbarC ?? CONFINEMENT.mesonCornellPotential.hbarCGeVFm.value;

  if (rFm <= 0) {
    return {
      rFm: 0,
      coulombGeV: -Infinity,
      linearGeV: 0,
      totalGeV: -Infinity,
      forceN: CONFINEMENT.forceConstantN.value,
      forceTonWeight: CONFINEMENT.forceConstantN.approxMetricTons,
      tier: 'T3'
    };
  }

  const coulombGeV = -(4 / 3) * (alphaS * hbarC) / rFm;
  const linearGeV = sigma * rFm;
  const totalGeV = coulombGeV + linearGeV;

  return {
    rFm,
    coulombGeV,
    linearGeV,
    totalGeV,
    forceN: CONFINEMENT.forceConstantN.value,
    forceTonWeight: CONFINEMENT.forceConstantN.approxMetricTons,
    tier: 'T3'
  };
}
