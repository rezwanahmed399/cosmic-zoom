/**
 * CosmoPlanck Quark Scientific Data Store
 * Single source of truth loaded from data/quark-facts.json
 * Hardcoding scientific numbers in UI or physics engines is strictly forbidden.
 */

import quarkData from './quark-facts.json' with { type: 'json' };

export const QUARK_FACTS = Object.freeze(quarkData);

export const QUARKS = QUARK_FACTS.quarks;
export const PROTON = QUARK_FACTS.proton;
export const COLOR_CHARGE = QUARK_FACTS.colorCharge;
export const CONFINEMENT = QUARK_FACTS.confinement;
export const STRING_BREAKING = QUARK_FACTS.stringBreaking;
export const HADRONS = QUARK_FACTS.hadrons;
export const TIME_SCALES = QUARK_FACTS.timeScales;
export const SCALE_LADDER = QUARK_FACTS.scaleLadder;
export const NEUTRON_DECAY = QUARK_FACTS.neutronDecay;
export const CKM_MATRIX = QUARK_FACTS.ckmMatrix;

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
