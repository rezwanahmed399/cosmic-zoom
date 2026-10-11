/**
 * CosmoPlanck Physics Engine: Hadron Lookup & Validation
 * Maps quark composition (+ spin / isospin) to scientifically documented hadrons,
 * exotic multiquarks (tetraquarks, pentaquarks), and verifies QCD color-singlet & charge rules.
 *
 * Implements valence ambiguity resolution specified in quark-spec.md:
 * - uud: Proton (spin 1/2) vs Delta+ (spin 3/2)
 * - udd: Neutron (spin 1/2) vs Delta0 (spin 3/2)
 * - uds: Lambda (spin 1/2, isospin 0) vs Sigma0 (spin 1/2, isospin 1)
 * - uuu: Delta++ (spin 3/2) only (Pauli exclusion principle)
 */

import { HADRONS, EXOTIC_HADRONS, getQuarkData } from '../data/quark-facts.js';

/**
 * Normalizes an array of quark strings into a sorted canonical key.
 * e.g. ['d', 'u', 'u'] -> 'd,u,u' (sorted)
 */
export function canonicalQuarkKey(quarks) {
  return [...quarks].map(q => q.toLowerCase().trim()).sort().join(',');
}

/**
 * Normalizes the quarkContent array of a hadron from the database into a canonical key.
 */
function getHadronKey(hadron) {
  return canonicalQuarkKey(hadron.quarkContent || []);
}

/**
 * Validates a proposed quark composition against QCD Confinement, Color-singlet rules,
 * and electric charge quantization.
 *
 * @param {Array<string>} quarks - Array of quark flavor keys, e.g. ['u', 'd_bar'] or ['u', 'u']
 * @returns {Object} Validation report
 */
export function validateHadronComposition(quarks) {
  if (!Array.isArray(quarks) || quarks.length === 0) {
    return {
      isValid: false,
      isColorSinglet: false,
      isChargeInteger: false,
      singletType: null,
      violationReasonBn: 'কোনো কোয়ার্ক নির্বাচন করা হয়নি।',
      violationReasonEn: 'No quarks selected in slots.',
      quantumNumbers: { charge: 0, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0 }
    };
  }

  let qCount = 0;
  let qBarCount = 0;
  let netCharge = 0;
  let netBaryon = 0;
  let netStrangeness = 0;
  let netCharm = 0;
  let netBottomness = 0;

  const quarkSymbols = [];

  for (const qKey of quarks) {
    const qData = getQuarkData(qKey);
    if (!qData) {
      return {
        isValid: false,
        isColorSinglet: false,
        isChargeInteger: false,
        singletType: null,
        violationReasonBn: `অজানা কোয়ার্ক ফ্লেভার: "${qKey}"`,
        violationReasonEn: `Unknown quark flavor: "${qKey}"`,
        quantumNumbers: { charge: 0, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0 }
      };
    }
    quarkSymbols.push(qData.symbol);
    if (qData.isAntiquark) {
      qBarCount++;
    } else {
      qCount++;
    }
    netCharge += qData.charge.value;
    netBaryon += qData.baryonNumber.value;
    netStrangeness += qData.strangeness;
    netCharm += qData.charm;
    netBottomness += qData.bottomness;
  }

  // Round values
  const roundedCharge = Math.round(netCharge * 3) / 3;
  const roundedBaryon = Math.round(netBaryon * 3) / 3;
  const isChargeInteger = Math.abs(roundedCharge - Math.round(roundedCharge)) < 1e-4;
  const isBaryonInteger = Math.abs(roundedBaryon - Math.round(roundedBaryon)) < 1e-4;
  const totalCount = quarks.length;

  let isColorSinglet = false;
  let singletType = null;
  let violationReasonBn = '';
  let violationReasonEn = '';

  const compStr = quarkSymbols.join(' ');

  // Standard color-singlet representation rules:
  if (totalCount === 1) {
    violationReasonBn = `${compStr}: একক কোয়ার্ক কনফাইনমেন্ট লঙ্ঘন করে (color-singlet নয়; মুক্ত কোয়ার্ক প্রকৃতিতে নিষিদ্ধ)।`;
    violationReasonEn = `${compStr}: Solitary quarks violate confinement (cannot form a color singlet; free quarks are forbidden).`;
  } else if (totalCount === 2) {
    if (qCount === 1 && qBarCount === 1) {
      isColorSinglet = true;
      singletType = 'meson';
    } else {
      const chargeSign = roundedCharge >= 0 ? '+' : '';
      const chargeFractionStr = roundedCharge === 4/3 ? '4/3' : (roundedCharge === 1/3 ? '1/3' : roundedCharge.toFixed(2));
      violationReasonBn = `${compStr}: চার্জ ${chargeSign}${chargeFractionStr} এবং color-singlet নয় (২টি কোয়ার্কে অবশ্যই একটি কোয়ার্ক ও একটি অ্যান্টি-কোয়ার্ক (q q̄) হতে হবে)।`;
      violationReasonEn = `${compStr}: Net charge ${chargeSign}${chargeFractionStr} e and not a color-singlet (2 quarks must be q + q_bar to form a meson).`;
    }
  } else if (totalCount === 3) {
    if (qCount === 3 && qBarCount === 0) {
      isColorSinglet = true;
      singletType = 'baryon';
    } else if (qCount === 0 && qBarCount === 3) {
      isColorSinglet = true;
      singletType = 'anti-baryon';
    } else {
      violationReasonBn = `${compStr}: ৩টি কোয়ার্কের ক্ষেত্রে অবশ্যই qqq (ব্যারিয়ন) অথবা q̄q̄q̄ (অ্যান্টি-ব্যারিয়ন) হতে হবে; ${compStr} কালার-সিঙ্গলেট গঠন করতে পারে না।`;
      violationReasonEn = `${compStr}: 3 quarks must be qqq (baryon) or q_bar q_bar q_bar (anti-baryon); ${compStr} cannot form a color singlet.`;
    }
  } else if (totalCount === 4) {
    if (qCount === 2 && qBarCount === 2) {
      isColorSinglet = true;
      singletType = 'tetraquark';
    } else {
      violationReasonBn = `${compStr}: ৪-কোয়ার্ক সিস্টেমে কালার-সিঙ্গলেট হতে হলে অবশ্যই ২ কোয়ার্ক ও ২ অ্যান্টি-কোয়ার্ক (qq q̄q̄ টেট্রাকোয়ার্ক) হতে হবে।`;
      violationReasonEn = `${compStr}: 4 quarks must be 2 quarks + 2 antiquarks (qq q_bar q_bar tetraquark) to form a color singlet.`;
    }
  } else if (totalCount === 5) {
    if ((qCount === 4 && qBarCount === 1) || (qCount === 1 && qBarCount === 4)) {
      isColorSinglet = true;
      singletType = 'pentaquark';
    } else {
      violationReasonBn = `${compStr}: ৫-কোয়ার্ক সিস্টেমে কালার-সিঙ্গলেট হতে হলে অবশ্যই ৪ কোয়ার্ক ও ১ অ্যান্টি-কোয়ার্ক (qqqq q̄ পেন্টাকোয়ার্ক) হতে হবে।`;
      violationReasonEn = `${compStr}: 5 quarks must be 4 quarks + 1 antiquark (qqqq q_bar pentaquark) to form a color singlet.`;
    }
  } else {
    violationReasonBn = `সর্বোচ্চ ৫টি কোয়ার্ক স্লট সমর্থিত (প্রদত্ত: ${totalCount})।`;
    violationReasonEn = `Maximum 5 quark slots supported (provided: ${totalCount}).`;
  }

  const isValid = isColorSinglet && isChargeInteger && isBaryonInteger;

  return {
    isValid,
    isColorSinglet,
    isChargeInteger,
    isBaryonInteger,
    singletType,
    violationReasonBn,
    violationReasonEn,
    quantumNumbers: {
      charge: Math.round(roundedCharge),
      baryonNumber: Math.round(roundedBaryon),
      strangeness: netStrangeness,
      charm: netCharm,
      bottomness: netBottomness
    }
  };
}

/**
 * Looks up a hadron by its constituent quarks and optional quantum spin/isospin/id.
 *
 * @param {Array<string>} quarks - Array of quark flavors, e.g. ['u', 'u', 'd'] or ['u', 'd_bar']
 * @param {Object} [options]
 * @param {number} [options.spin] - Spin J (e.g. 0, 0.5, 1, 1.5)
 * @param {number} [options.isospin] - Isospin I (e.g. 0 for Lambda, 1 for Sigma)
 * @param {string} [options.id] - Specific hadron ID to select among candidates
 * @returns {Object} Search result containing match, candidates, and validation report
 */
export function lookupHadron(quarks, options = {}) {
  if (!Array.isArray(quarks) || quarks.length === 0) {
    throw new Error('lookupHadron requires a non-empty array of quark flavors');
  }

  const validation = validateHadronComposition(quarks);
  if (!validation.isValid) {
    return {
      found: false,
      isValid: false,
      match: null,
      candidates: [],
      isAmbiguous: false,
      validation,
      hadronClass: validation.singletType || 'invalid',
      quantumNumbers: validation.quantumNumbers
    };
  }

  const inputKey = canonicalQuarkKey(quarks);

  // 1. Search Conventional Hadrons
  const allConventional = Object.values(HADRONS);
  const conventionalCandidates = allConventional.filter(h => {
    if (getHadronKey(h) === inputKey) return true;
    // Check aliases (e.g. pi0 has alias [["d", "d_bar"]])
    if (Array.isArray(h.aliasQuarkContent)) {
      return h.aliasQuarkContent.some(alias => canonicalQuarkKey(alias) === inputKey);
    }
    return false;
  });

  // 2. Search Exotic Hadrons (if any)
  const allExotic = EXOTIC_HADRONS ? Object.values(EXOTIC_HADRONS) : [];
  const exoticCandidates = allExotic.filter(ex => {
    if (getHadronKey(ex) === inputKey) return true;
    if (Array.isArray(ex.alternativeQuarkContent)) {
      return canonicalQuarkKey(ex.alternativeQuarkContent) === inputKey;
    }
    return false;
  });

  const candidates = [...conventionalCandidates, ...exoticCandidates];

  // 3. If no matching hadron in database, but color-singlet & integer charge valid:
  if (candidates.length === 0) {
    return {
      found: false,
      isValid: true,
      isColorValidUnobserved: true,
      badgeBn: 'রঙ-বৈধ, কিন্তু ডেটা-ফাইলে নেই/পর্যবেক্ষিত নয়',
      badgeEn: 'Color-valid, but not in database / unobserved',
      match: null,
      candidates: [],
      isAmbiguous: false,
      validation,
      hadronClass: validation.singletType,
      quantumNumbers: validation.quantumNumbers
    };
  }

  // 4. Disambiguate if multiple candidates exist
  let match = candidates[0];
  const isAmbiguous = candidates.length > 1;

  if (isAmbiguous) {
    if (options.id) {
      const idMatch = candidates.find(c => c.id === options.id);
      if (idMatch) match = idMatch;
    } else {
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
  }

  return {
    found: true,
    isValid: true,
    match,
    candidates,
    isAmbiguous,
    validation,
    hadronClass: validation.singletType,
    quantumNumbers: {
      charge: match.charge,
      baryonNumber: match.baryonNumber,
      strangeness: match.strangeness || validation.quantumNumbers.strangeness,
      charm: match.charm || validation.quantumNumbers.charm,
      bottomness: match.bottomness || validation.quantumNumbers.bottomness,
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
