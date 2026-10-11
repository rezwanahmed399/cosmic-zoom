/**
 * CosmoPlanck Quark Scientific Data Store
 * Single source of truth loaded from data/quark-facts.json
 * Hardcoding scientific numbers in UI or physics engines is strictly forbidden.
 */

import quarkData from './quark-facts.json' with { type: 'json' };
import quarkPdfData from './quark-pdf-data.json' with { type: 'json' };

export const QUARK_FACTS = Object.freeze(quarkData);
export const QUARK_PDF_DATA = Object.freeze(quarkPdfData);
export const RESOLUTION_SLIDER_PDF = QUARK_FACTS.resolutionSliderPDF;

export const QUARKS = QUARK_FACTS.quarks;
export const PROTON = QUARK_FACTS.proton;
export const COLOR_CHARGE = QUARK_FACTS.colorCharge;
export const CONFINEMENT = QUARK_FACTS.confinement;
export const STRING_BREAKING = QUARK_FACTS.stringBreaking;
export const HADRONS = QUARK_FACTS.hadrons;
export const EXOTIC_HADRONS = QUARK_FACTS.exoticHadrons;
export const HADRON_SIZES = QUARK_FACTS.hadronSizes;
export const TIME_SCALES = QUARK_FACTS.timeScales;
export const SCALE_LADDER = QUARK_FACTS.scaleLadder;
export const NEUTRON_DECAY = QUARK_FACTS.neutronDecay;
export const CKM_MATRIX = QUARK_FACTS.ckmMatrix;

/**
 * Returns exotic hadrons gallery (X(3872), Pc pentaquarks, T_cc^+, Glueball)
 */
export function getExoticHadrons() {
  return EXOTIC_HADRONS;
}

/**
 * Returns hadron charge radius size comparison data (pion, kaon, proton)
 */
export function getHadronSizes() {
  return HADRON_SIZES;
}

/**
 * Returns Proton Ji Mass Decomposition data (Yang et al. PRL 2018)
 */
export function getJiMassDecomposition() {
  return PROTON.jiMassDecomposition;
}

/**
 * Returns complete Proton mass origin dataset including valence sum vs Ji decomposition
 */
export function getProtonMassOrigin() {
  const total = PROTON.mass.value;
  const val = PROTON.valenceQuarkMassSum.value;
  return {
    totalProtonMass: PROTON.mass,
    valenceSum: PROTON.valenceQuarkMassSum,
    missingDynamicalEnergy: {
      value: +(total - val).toFixed(3),
      unit: 'MeV/c^2',
      fractionOfProtonMass: +((total - val) / total).toFixed(4),
      percentageApprox: 99
    },
    jiDecomposition: PROTON.jiMassDecomposition
  };
}

/**
 * Returns the scale ladder steps (Atom, Nucleus, Proton, Quark)
 */
export function getScaleLadderSteps() {
  return SCALE_LADDER.steps;
}

/**
 * Returns Planck gap metadata
 */
export function getPlanckGapInfo() {
  return SCALE_LADDER.planckGap;
}

/**
 * Returns Neutron Decay specifications and conservation ledger
 */
export function getNeutronDecayInfo() {
  return NEUTRON_DECAY;
}

/**
 * Returns CKM Quark-Mixing Matrix
 */
export function getCkmMatrix() {
  return CKM_MATRIX;
}

/**
 * Returns array of 6 quarks ordered by generation (u, d, c, s, t, b)
 */
export function getSixQuarksList() {
  return [QUARKS.u, QUARKS.d, QUARKS.c, QUARKS.s, QUARKS.t, QUARKS.b];
}

/**
 * Returns quark or antiquark properties by flavor key.
 * @param {string} flavor - e.g. 'u', 'd', 's', 'c', 'b', 't', 'u_bar', 'd_bar', etc.
 */
export function getQuarkData(flavor) {
  const isAnti = flavor.endsWith('_bar');
  const base = isAnti ? flavor.replace('_bar', '') : flavor;
  const q = QUARKS[base];
  if (!q) return null;

  if (!isAnti) return q;

  return {
    symbol: `${q.symbol}̄`,
    nameEn: `Anti-${q.nameEn}`,
    nameBn: `অ্যান্টি-${q.nameBn}`,
    isAntiquark: true,
    charge: {
      value: -q.charge.value,
      fraction: q.charge.fraction.startsWith('+') ? q.charge.fraction.replace('+', '-') : q.charge.fraction.replace('-', '+'),
      unit: q.charge.unit,
      tier: q.charge.tier,
      source: q.charge.source,
      retrievedOn: q.charge.retrievedOn
    },
    mass: q.mass,
    spin: q.spin,
    baryonNumber: {
      value: -q.baryonNumber.value,
      fraction: '-1/3',
      unit: q.baryonNumber.unit,
      tier: q.baryonNumber.tier,
      source: q.baryonNumber.source,
      retrievedOn: q.baryonNumber.retrievedOn
    },
    isospin3: -q.isospin3,
    strangeness: -q.strangeness,
    charm: -q.charm,
    bottomness: -q.bottomness,
    topness: -q.topness,
    sizeUpperLimit: q.sizeUpperLimit
  };
}

/**
 * Returns string tension in GeV/fm
 */
export function getStringTension() {
  return CONFINEMENT.stringTensionSigma.value;
}

/**
 * Returns linear confinement force in Newtons
 */
export function getConfinementForceN() {
  return CONFINEMENT.forceConstantN.value;
}

/**
 * Returns Asymptotic Freedom dataset including PDG alpha_s points and QED comparison
 */
export function getAsymptoticFreedomData() {
  return QUARK_FACTS.asymptoticFreedom;
}

/**
 * Computes the 1-loop/threshold running coupling alpha_s(Q) in MS-bar scheme
 * normalized to alpha_s(M_Z = 91.1876 GeV) = 0.1180
 * @param {number} Q_GeV - Energy scale in GeV
 * @returns {{ alpha_s: number, alphaS: number, isNonPerturbative: boolean, activeFlavors_nf: number, nf: number, warningBn: string, warningEn: string }}
 */
export function getRunningAlphaS(Q_GeV) {
  if (typeof Q_GeV !== 'number' || Q_GeV <= 0 || isNaN(Q_GeV)) {
    return {
      alpha_s: 0.1180,
      alphaS: 0.1180,
      isNonPerturbative: false,
      activeFlavors_nf: 5,
      nf: 5,
      warningBn: '',
      warningEn: ''
    };
  }

  const MZ = 91.1876;
  const alphaS_MZ = 0.1180;
  const mc = 1.27;
  const mb = 4.18;
  const mt = 172.57;

  // nf = 5 reference (mb <= Q < mt)
  const beta0_5 = 11 - (2 / 3) * 5; // 23/3
  const calcStep = (alpha0, Q0, beta0, Q) => {
    const denom = 1 + (beta0 / (2 * Math.PI)) * alpha0 * Math.log(Q / Q0);
    if (denom <= 0.05) return 2.0; // Perturbative breakdown cap
    return alpha0 / denom;
  };

  const alphaS_mb = calcStep(alphaS_MZ, MZ, beta0_5, mb);
  const alphaS_mt = calcStep(alphaS_MZ, MZ, beta0_5, mt);

  let nf = 5;
  let alphaS = 0;

  if (Q_GeV >= mt) {
    nf = 6;
    const beta0_6 = 11 - (2 / 3) * 6; // 7
    alphaS = calcStep(alphaS_mt, mt, beta0_6, Q_GeV);
  } else if (Q_GeV >= mb) {
    nf = 5;
    alphaS = calcStep(alphaS_MZ, MZ, beta0_5, Q_GeV);
  } else if (Q_GeV >= mc) {
    nf = 4;
    const beta0_4 = 11 - (2 / 3) * 4; // 25/3
    alphaS = calcStep(alphaS_mb, mb, beta0_4, Q_GeV);
  } else {
    nf = 3;
    const beta0_4 = 11 - (2 / 3) * 4;
    const alphaS_mc = calcStep(alphaS_mb, mb, beta0_4, mc);
    const beta0_3 = 11 - (2 / 3) * 3; // 9
    alphaS = calcStep(alphaS_mc, mc, beta0_3, Q_GeV);
  }

  const isNonPerturbative = Q_GeV <= 1.0;
  const val = +alphaS.toFixed(4);
  return {
    alpha_s: val,
    alphaS: val,
    isNonPerturbative,
    activeFlavors_nf: nf,
    nf,
    warningBn: isNonPerturbative ? 'non-perturbative: সূত্র খাটে না (কনফাইনমেন্ট এলাকা)' : '',
    warningEn: isNonPerturbative ? 'non-perturbative: perturbation theory breaks down' : ''
  };
}

/**
 * Returns Evidence Lab dataset (R-ratio, resonances, and 5 evidence cards)
 */
export function getEvidenceLabData() {
  return QUARK_FACTS.evidenceLab;
}

/**
 * Computes theoretical R-ratio value for a given center-of-mass energy sqrt(s)
 * R = Nc * sum(e_q^2)
 * @param {number} sqrt_s_GeV - Center-of-mass energy in GeV
 * @param {number} [Nc=3] - Number of color charges (default 3)
 * @returns {number}
 */
export function getRRatioTheory(sqrt_s_GeV, Nc = 3) {
  if (typeof sqrt_s_GeV !== 'number' || isNaN(sqrt_s_GeV)) return 2.0;
  
  if (sqrt_s_GeV < 3.7) {
    // Active flavors: u, d, s -> (4/9 + 1/9 + 1/9) = 6/9 = 2/3
    return +(Nc * (2 / 3)).toFixed(3);
  } else if (sqrt_s_GeV < 10.5) {
    // Active flavors: u, d, s, c -> 2/3 + 4/9 = 10/9
    return +(Nc * (10 / 9)).toFixed(3);
  } else {
    // Active flavors: u, d, s, c, b -> 10/9 + 1/9 = 11/9
    return +(Nc * (11 / 9)).toFixed(3);
  }
}

/**
 * Returns precomputed Parton Distribution Function (PDF) dataset from CT18NNLO
 */
export function getResolutionSliderPdfData() {
  return QUARK_PDF_DATA;
}

/**
 * Finds the PDF slice closest to a given Q^2 without extrapolating outside the grid
 * @param {number} q2_GeV2 - Energy squared in GeV^2
 * @returns {Object}
 */
export function getPdfAtQ2(q2_GeV2) {
  if (typeof q2_GeV2 !== 'number' || isNaN(q2_GeV2) || q2_GeV2 < 2.0) {
    const q2 = q2_GeV2 || 1.0;
    return {
      isNonPerturbative: true,
      q2_GeV2: q2,
      q_GeV: +Math.sqrt(q2).toFixed(3),
      wavelength_fm: +(0.197327 / Math.sqrt(Math.max(0.1, q2))).toFixed(4),
      warningBn: 'Q² < ২ GeV²: নন-পার্টারবেটিভ এলাকা — কোনো সুসংজ্ঞায়িত PDF বক্ররেখা খাটে না।',
      warningEn: 'Q² < 2 GeV²: Non-perturbative domain — No well-defined PDF curves apply.'
    };
  }

  const pts = QUARK_PDF_DATA.points;
  const clampedQ2 = Math.max(pts[0].q2_GeV2, Math.min(pts[pts.length - 1].q2_GeV2, q2_GeV2));

  // Find nearest slice in log10(Q^2) space
  let bestSlice = pts[0];
  let minDiff = Math.abs(Math.log10(bestSlice.q2_GeV2) - Math.log10(clampedQ2));

  for (let i = 1; i < pts.length; i++) {
    const diff = Math.abs(Math.log10(pts[i].q2_GeV2) - Math.log10(clampedQ2));
    if (diff < minDiff) {
      minDiff = diff;
      bestSlice = pts[i];
    }
  }

  return {
    isNonPerturbative: false,
    xGrid: QUARK_PDF_DATA.xGrid,
    ...bestSlice
  };
}

export const QGP_COSMOLOGY = QUARK_FACTS.qgpCosmology;
export const PROTON_SPIN_PUZZLE = QUARK_FACTS.protonSpinPuzzle;
export const UNSOLVED_MYSTERIES = QUARK_FACTS.unsolvedMysteries;
export const QUARK_HISTORY_TIMELINE = QUARK_FACTS.quarkHistoryTimeline;
export const MYTHS_VS_FACTS = QUARK_FACTS.mythsVsFacts;
export const QUARK_QUIZ = QUARK_FACTS.quarkQuiz;
export const QUARK_GLOSSARY = QUARK_FACTS.quarkGlossary;

/**
 * Returns Quark-Gluon Plasma and early universe hadronization data
 */
export function getQgpCosmologyData() {
  return QUARK_FACTS.qgpCosmology;
}

/**
 * Returns Proton Spin Decomposition puzzle data
 */
export function getProtonSpinPuzzleData() {
  return QUARK_FACTS.protonSpinPuzzle;
}

/**
 * Returns Unsolved Mysteries and QCD Frontiers data (Chapter 13)
 */
export function getUnsolvedMysteriesData() {
  return QUARK_FACTS.unsolvedMysteries;
}

/**
 * Returns Historical Timeline of Quarks & QCD (Chapter 14)
 */
export function getQuarkHistoryTimeline() {
  return QUARK_FACTS.quarkHistoryTimeline;
}

/**
 * Returns 13 Myths vs Scientific Facts cards data (Chapter 14)
 */
export function getMythsVsFactsData() {
  return QUARK_FACTS.mythsVsFacts;
}

/**
 * Returns Multi-chapter Quark Quiz data (Chapter 14)
 */
export function getQuarkQuizData() {
  return QUARK_FACTS.quarkQuiz;
}

/**
 * Returns comprehensive Quark and Particle Physics Glossary (Chapter 14)
 */
export function getQuarkGlossaryData() {
  return QUARK_FACTS.quarkGlossary;
}

