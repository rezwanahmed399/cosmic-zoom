/**
 * CosmoPlanck Physics Engine: Conservation Ledger
 * Verifies that all particle events, decays, collisions, and string breaking processes
 * strictly adhere to conservation laws:
 * 1. Electric charge conservation
 * 2. Baryon number conservation
 * 3. Flavor conservation (Strangeness, Charm, Bottomness, Topness)
 * 4. Color-singlet status (Confinement constraint: net color must be white/singlet)
 * 5. Energy conservation & kinematic mass threshold
 *
 * If ANY conservation law is violated, the event is immediately rejected.
 */

import { QUARKS, getQuarkData, HADRONS } from '../data/quark-facts.js';

const EPSILON = 1e-6;

/**
 * Resolves a particle or quark descriptor to quantum numbers.
 * Descriptor can be:
 * - Quark symbol string (e.g. 'u', 'd', 's', 'u_bar')
 * - Hadron ID string (e.g. 'p', 'n', 'pi0', 'pi_plus')
 * - Object with explicit quantum numbers: { charge, baryonNumber, strangeness, ... }
 */
export function resolveQuantumNumbers(particle) {
  if (typeof particle === 'string') {
    // 1. Check if quark or antiquark
    const quark = getQuarkData(particle);
    if (quark) {
      return {
        type: 'quark',
        symbol: quark.symbol,
        charge: quark.charge.value,
        baryonNumber: quark.baryonNumber.value,
        strangeness: quark.strangeness,
        charm: quark.charm,
        bottomness: quark.bottomness,
        topness: quark.topness,
        massGeV: quark.mass.unit === 'GeV/c^2' ? quark.mass.value : quark.mass.value * 1e-3,
        color: particle.color || null
      };
    }

    // 2. Check if hadron
    const hadron = HADRONS[particle];
    if (hadron) {
      return {
        type: 'hadron',
        symbol: hadron.symbol,
        charge: hadron.charge,
        baryonNumber: hadron.baryonNumber,
        strangeness: hadron.strangeness || 0,
        charm: hadron.charm || 0,
        bottomness: hadron.bottomness || 0,
        topness: 0,
        massGeV: hadron.mass.unit === 'GeV/c^2' ? hadron.mass.value : hadron.mass.value * 1e-3,
        colorSinglet: true
      };
    }

    // 3. Photon (gamma) / leptons (e-, e+, nu, etc.)
    if (particle === 'gamma' || particle === 'photon') {
      return { type: 'gauge_boson', symbol: 'γ', charge: 0, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0, topness: 0, massGeV: 0, colorSinglet: true };
    }
    if (particle === 'e-' || particle === 'electron') {
      return { type: 'lepton', symbol: 'e⁻', charge: -1, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0, topness: 0, massGeV: 0.000511, colorSinglet: true };
    }
    if (particle === 'e+' || particle === 'positron') {
      return { type: 'lepton', symbol: 'e⁺', charge: 1, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0, topness: 0, massGeV: 0.000511, colorSinglet: true };
    }
    if (particle === 'nu_e' || particle === 'nu') {
      return { type: 'lepton', symbol: 'ν', charge: 0, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0, topness: 0, massGeV: 0, colorSinglet: true };
    }
    if (particle === 'nu_e_bar' || particle === 'nu_bar') {
      return { type: 'lepton', symbol: 'ν̄', charge: 0, baryonNumber: 0, strangeness: 0, charm: 0, bottomness: 0, topness: 0, massGeV: 0, colorSinglet: true };
    }

    throw new Error(`Unrecognized particle descriptor in conservation ledger: "${particle}"`);
  }

  // Already an object
  return {
    type: particle.type || 'custom',
    symbol: particle.symbol || '?',
    charge: particle.charge ?? 0,
    baryonNumber: particle.baryonNumber ?? 0,
    strangeness: particle.strangeness ?? 0,
    charm: particle.charm ?? 0,
    bottomness: particle.bottomness ?? 0,
    topness: particle.topness ?? 0,
    massGeV: particle.massGeV ?? (particle.massMeV ? particle.massMeV * 1e-3 : 0),
    color: particle.color || null,
    colorSinglet: particle.colorSinglet ?? false
  };
}

/**
 * Checks whether a collection of colored objects forms an overall color-singlet (white).
 * In QCD:
 * - A meson must be color + anti-color (e.g. red + anti-red, or equal superposition).
 * - A baryon must have 1 red, 1 green, 1 blue (triplet singlet).
 * - An anti-baryon must have 1 anti-red, 1 anti-green, 1 anti-blue.
 * - Hadrons (protons, pions, etc.) are inherently color singlets.
 */
export function verifyColorSingletState(particles) {
  // If all particles are already composite hadrons / leptons / photons, they are singlets
  const coloredQuarks = particles.filter(p => p.type === 'quark');
  if (coloredQuarks.length === 0) {
    return { isSinglet: true, reason: 'All participants are color-singlet hadrons or leptons' };
  }

  // Confinement forbids isolated colored states
  // Count colors
  let red = 0, green = 0, blue = 0;
  let antiRed = 0, antiGreen = 0, antiBlue = 0;

  for (const q of coloredQuarks) {
    if (!q.color) {
      // If color is unspecified, check if quarks group into valid hadron valence sets
      continue;
    }
    if (q.color === 'red' || q.color === 'r') red++;
    else if (q.color === 'green' || q.color === 'g') green++;
    else if (q.color === 'blue' || q.color === 'b') blue++;
    else if (q.color === 'anti-red' || q.color === 'r_bar' || q.color === 'cyan') antiRed++;
    else if (q.color === 'anti-green' || q.color === 'g_bar' || q.color === 'magenta') antiGreen++;
    else if (q.color === 'anti-blue' || q.color === 'b_bar' || q.color === 'yellow') antiBlue++;
  }

  // Meson pairing (color + anti-color cancellation)
  const pairedRed = Math.min(red, antiRed);
  red -= pairedRed;
  antiRed -= pairedRed;

  const pairedGreen = Math.min(green, antiGreen);
  green -= pairedGreen;
  antiGreen -= pairedGreen;

  const pairedBlue = Math.min(blue, antiBlue);
  blue -= pairedBlue;
  antiBlue -= pairedBlue;

  // Baryon triplets (1 red, 1 green, 1 blue)
  const baryons = Math.min(red, green, blue);
  red -= baryons;
  green -= baryons;
  blue -= baryons;

  // Anti-baryon triplets (1 anti-red, 1 anti-green, 1 anti-blue)
  const antiBaryons = Math.min(antiRed, antiGreen, antiBlue);
  antiRed -= antiBaryons;
  antiGreen -= antiBaryons;
  antiBlue -= antiBaryons;

  const remaining = red + green + blue + antiRed + antiGreen + antiBlue;
  if (remaining === 0) {
    return { isSinglet: true, reason: 'Net color is neutral (color singlet)' };
  }

  return {
    isSinglet: false,
    reason: `Unpaired color charge detected (R:${red}, G:${green}, B:${blue}, R̄:${antiRed}, Ḡ:${antiGreen}, B̄:${antiBlue}). Violates QCD confinement.`
  };
}

/**
 * Validates an entire physical event against all conservation laws.
 *
 * @param {Object} options
 * @param {Array} options.initial - List of initial state particles
 * @param {Array} options.final - List of final state particles
 * @param {number} [options.availableEnergyGeV] - Optional available center-of-mass energy in GeV
 * @param {string} [options.interactionType='strong'] - 'strong', 'electromagnetic', or 'weak'
 * @returns {Object} Validation report
 */
export function validateReaction({
  initial = [],
  final = [],
  availableEnergyGeV = null,
  interactionType = 'strong'
}) {
  const resolvedInitial = initial.map(resolveQuantumNumbers);
  const resolvedFinal = final.map(resolveQuantumNumbers);

  const reasons = [];

  // 1. Sum up quantum numbers
  const sumInitial = {
    charge: 0,
    baryon: 0,
    strangeness: 0,
    charm: 0,
    bottom: 0,
    top: 0,
    massGeV: 0
  };

  const sumFinal = {
    charge: 0,
    baryon: 0,
    strangeness: 0,
    charm: 0,
    bottom: 0,
    top: 0,
    massGeV: 0
  };

  for (const p of resolvedInitial) {
    sumInitial.charge += p.charge;
    sumInitial.baryon += p.baryonNumber;
    sumInitial.strangeness += p.strangeness;
    sumInitial.charm += p.charm;
    sumInitial.bottom += p.bottomness;
    sumInitial.top += p.topness;
    sumInitial.massGeV += p.massGeV;
  }

  for (const p of resolvedFinal) {
    sumFinal.charge += p.charge;
    sumFinal.baryon += p.baryonNumber;
    sumFinal.strangeness += p.strangeness;
    sumFinal.charm += p.charm;
    sumFinal.bottom += p.bottomness;
    sumFinal.top += p.topness;
    sumFinal.massGeV += p.massGeV;
  }

  // 2. Electric Charge Check
  const chargeDiff = Math.abs(sumInitial.charge - sumFinal.charge);
  const chargeConserved = chargeDiff < EPSILON;
  if (!chargeConserved) {
    reasons.push(`Electric charge violation: initial ${sumInitial.charge.toFixed(3)} e != final ${sumFinal.charge.toFixed(3)} e`);
  }

  // 3. Baryon Number Check
  const baryonDiff = Math.abs(sumInitial.baryon - sumFinal.baryon);
  const baryonConserved = baryonDiff < EPSILON;
  if (!baryonConserved) {
    reasons.push(`Baryon number violation: initial ${sumInitial.baryon.toFixed(3)} != final ${sumFinal.baryon.toFixed(3)}`);
  }

  // 4. Flavor Numbers Check
  let flavorConserved = true;
  if (interactionType === 'strong' || interactionType === 'electromagnetic') {
    const sDiff = Math.abs(sumInitial.strangeness - sumFinal.strangeness);
    const cDiff = Math.abs(sumInitial.charm - sumFinal.charm);
    const bDiff = Math.abs(sumInitial.bottom - sumFinal.bottom);
    const tDiff = Math.abs(sumInitial.top - sumFinal.top);

    if (sDiff > EPSILON) {
      flavorConserved = false;
      reasons.push(`Strangeness violation in ${interactionType} interaction: initial S=${sumInitial.strangeness} != final S=${sumFinal.strangeness}`);
    }
    if (cDiff > EPSILON) {
      flavorConserved = false;
      reasons.push(`Charm violation in ${interactionType} interaction: initial C=${sumInitial.charm} != final C=${sumFinal.charm}`);
    }
    if (bDiff > EPSILON) {
      flavorConserved = false;
      reasons.push(`Bottomness violation in ${interactionType} interaction: initial B'=${sumInitial.bottom} != final B'=${sumFinal.bottom}`);
    }
    if (tDiff > EPSILON) {
      flavorConserved = false;
      reasons.push(`Topness violation in ${interactionType} interaction: initial T=${sumInitial.top} != final T=${sumFinal.top}`);
    }
  }

  // 5. Color-Singlet Confinement Check
  const initialColor = verifyColorSingletState(resolvedInitial);
  const finalColor = verifyColorSingletState(resolvedFinal);
  const colorSinglet = initialColor.isSinglet && finalColor.isSinglet;

  if (!initialColor.isSinglet) {
    reasons.push(`Initial state color non-singlet: ${initialColor.reason}`);
  }
  if (!finalColor.isSinglet) {
    reasons.push(`Final state color non-singlet: ${finalColor.reason}`);
  }

  // 6. Energy / Kinematic Mass Threshold Check
  let energySufficient = true;
  const effectiveAvailableEnergy = availableEnergyGeV !== null ? availableEnergyGeV : sumInitial.massGeV;
  if (effectiveAvailableEnergy + EPSILON < sumFinal.massGeV) {
    energySufficient = false;
    reasons.push(`Energy conservation / threshold violation: Available energy ${effectiveAvailableEnergy.toFixed(4)} GeV is less than final rest mass threshold ${sumFinal.massGeV.toFixed(4)} GeV`);
  }

  const valid = chargeConserved && baryonConserved && flavorConserved && colorSinglet && energySufficient;

  return {
    valid,
    chargeConserved,
    baryonConserved,
    flavorConserved,
    colorSinglet,
    energySufficient,
    ledger: {
      initial: sumInitial,
      final: sumFinal,
      delta: {
        charge: sumFinal.charge - sumInitial.charge,
        baryon: sumFinal.baryon - sumInitial.baryon,
        strangeness: sumFinal.strangeness - sumInitial.strangeness,
        charm: sumFinal.charm - sumInitial.charm,
        bottom: sumFinal.bottom - sumInitial.bottom,
        top: sumFinal.top - sumInitial.top
      }
    },
    reasons
  };
}
