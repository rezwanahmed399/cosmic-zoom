/**
 * CosmoPlanck Physics Engine: Hadron Lookup
 * Maps quark composition (+ spin / isospin) to scientifically documented hadrons.
 *
 * Implements valence ambiguity resolution specified in quark-spec.md:
 * - uud: Proton (spin 1/2) vs Delta+ (spin 3/2)
 * - udd: Neutron (spin 1/2) vs Delta0 (spin 3/2)
 * - uds: Lambda (spin 1/2, isospin 0) vs Sigma0 (spin 1/2, isospin 1)
 */

import { HADRONS, getQuarkData } from '../data/quark-facts.js';

/**
 * Normalizes an array of quark strings into a sorted canonical key.
 * e.g. ['d', 'u', 'u'] -> 'u,u,d'
 */
export function canonicalQuarkKey(quarks) {
  return [...quarks].map(q => q.toLowerCase().trim()).sort().join(',');
}

/**
 * Normalizes the quarkContent array of a hadron from the database into a canonical key.
 */
function getHadronKey(hadron) {
  return canonicalQuarkKey(hadron.quarkContent);
}

/**
 * Looks up a hadron by its constituent quarks and optional quantum spin/isospin.
 *
 * @param {Array<string>} quarks - Array of quark flavors, e.g. ['u', 'u', 'd'] or ['u', 'd_bar']
 * @param {Object} [options]
 * @param {number} [options.spin] - Spin J (e.g. 0, 0.5, 1, 1.5)
 * @param {number} [options.isospin] - Isospin I (e.g. 0 for Lambda, 1 for Sigma)
 * @returns {Object} Search result containing primary match, candidates, and quantum properties
 */
export function lookupHadron(quarks, options = {}) {
  if (!Array.isArray(quarks) || quarks.length === 0) {
    throw new Error('lookupHadron requires a non-empty array of quark flavors');
  }

  const inputKey = canonicalQuarkKey(quarks);

  // 1. Calculate combined intrinsic quantum numbers from constituent quarks
  let netCharge = 0;
  let netBaryon = 0;
  let netStrangeness = 0;
  let netCharm = 0;
  let netBottomness = 0;

  for (const qKey of quarks) {
    const qData = getQuarkData(qKey);
    if (!qData) {
      throw new Error(`Unknown quark flavor in lookup: "${qKey}"`);
    }
    netCharge += qData.charge.value;
    netBaryon += qData.baryonNumber.value;
    netStrangeness += qData.strangeness;
    netCharm += qData.charm;
    netBottomness += qData.bottomness;
  }

  // Round charge to nearest fraction or whole number to avoid floating-point drift
  const roundedCharge = Math.round(netCharge * 3) / 3;
  const roundedBaryon = Math.round(netBaryon * 3) / 3;

  let hadronClass = 'exotic';
  if (Math.abs(roundedBaryon - 1) < 1e-6) hadronClass = 'baryon';
  else if (Math.abs(roundedBaryon - (-1)) < 1e-6) hadronClass = 'anti-baryon';
  else if (Math.abs(roundedBaryon) < 1e-6 && quarks.length === 2) hadronClass = 'meson';

  // 2. Find all matching hadrons from scientific database
  const allHadrons = Object.values(HADRONS);
  const candidates = allHadrons.filter(h => getHadronKey(h) === inputKey);

  if (candidates.length === 0) {
    return {
      found: false,
      match: null,
      candidates: [],
      isAmbiguous: false,
      hadronClass,
      quantumNumbers: {
        charge: roundedCharge,
        baryonNumber: roundedBaryon,
        strangeness: netStrangeness,
        charm: netCharm,
        bottomness: netBottomness
      }
    };
  }

  // 3. Disambiguate if multiple candidates exist with the same quark content
  let match = candidates[0];
  let isAmbiguous = candidates.length > 1;

  if (isAmbiguous) {
    const desiredSpin = options.spin !== undefined ? Number(options.spin) : null;
    const desiredIsospin = options.isospin !== undefined ? Number(options.isospin) : null;

    if (desiredSpin !== null) {
      const spinMatch = candidates.find(c => Math.abs(c.spin - desiredSpin) < 1e-6);
      if (spinMatch) match = spinMatch;
    }

    if (desiredIsospin !== null) {
      const isospinMatch = candidates.find(c => c.isospin !== undefined && Math.abs(c.isospin - desiredIsospin) < 1e-6);
      if (isospinMatch) match = isospinMatch;
    }
  }

  return {
    found: true,
    match,
    candidates,
    isAmbiguous,
    hadronClass,
    quantumNumbers: {
      charge: match.charge,
      baryonNumber: match.baryonNumber,
      strangeness: match.strangeness || 0,
      charm: match.charm || 0,
      bottomness: match.bottomness || 0,
      spin: match.spin
    }
  };
}

/**
 * Returns all hadrons from the database matching custom filter criteria.
 */
export function queryHadrons(filter = {}) {
  return Object.values(HADRONS).filter(h => {
    if (filter.baryonNumber !== undefined && h.baryonNumber !== filter.baryonNumber) return false;
    if (filter.spin !== undefined && h.spin !== filter.spin) return false;
    if (filter.charge !== undefined && h.charge !== filter.charge) return false;
    if (filter.strangeness !== undefined && (h.strangeness || 0) !== filter.strangeness) return false;
    if (filter.minMass !== undefined && h.mass.value < filter.minMass) return false;
    if (filter.maxMass !== undefined && h.mass.value > filter.maxMass) return false;
    return true;
  });
}
