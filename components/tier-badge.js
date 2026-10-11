/**
 * CosmoPlanck Reusable Component: Truth Tier Badge (T1–T4)
 * Mandatory badge attached to every scientific visual, graph, claim, and parameter.
 *
 * Tiers:
 * - T1: Direct Measurement (সরাসরি পরিমাপ) - PDG, CODATA
 * - T2: Computed (গণনালব্ধ) - Lattice QCD, global fits, perturbation theory
 * - T3: Effective Model (কার্যকর মডেল) - Lund string, Cornell potential, phenomenological
 * - T4: Symbolic (প্রতীকী) - Pedagogical visual metaphor, scale/color not literal
 *
 * Accessibility:
 * - WCAG 2.2 AA compliant contrast
 * - Colorblind-safe palette (Okabe-Ito inspired tokens)
 * - Distinctive SVG icons & textual labels
 */

export const TIER_DEFINITIONS = {
  T1: {
    code: 'T1',
    labelEn: 'Direct Measurement',
    labelBn: 'সরাসরি পরিমাপ',
    shortEn: 'Measured',
    shortBn: 'পরিমাপিত',
    color: '#10b981', // Emerald (Okabe-Ito bluish green compatible)
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    textColor: '#34d399',
    iconSvg: `<svg class="tier-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
    descEn: 'Direct experimental measurement with quantified uncertainty (e.g., PDG, CODATA).',
    descBn: 'পরীক্ষাগারে সরাসরি পরিমাপকৃত ধ্রুবক ও সুস্পষ্ট অনিশ্চয়তা (যেমন PDG, CODATA)।'
  },
  T2: {
    code: 'T2',
    labelEn: 'Computed / Lattice QCD',
    labelBn: 'গণনালব্ধ (ল্যাটিস QCD)',
    shortEn: 'Lattice QCD',
    shortBn: 'গণনালব্ধ',
    color: '#38bdf8', // Sky Blue
    bgColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    textColor: '#7dd3fc',
    iconSvg: `<svg class="tier-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path></svg>`,
    descEn: 'Derived from first-principles quantum computations (Lattice QCD, global fits, perturbation theory).',
    descBn: 'মৌলিক কোয়ান্টাম ক্ষেত্রতত্ত্ব থেকে সুপারকম্পিউটারে গণনাকৃত (Lattice QCD, গ্লোবাল ফিট)।'
  },
  T3: {
    code: 'T3',
    labelEn: 'Effective Model',
    labelBn: 'কার্যকর মডেল',
    shortEn: 'Model',
    shortBn: 'মডেল',
    color: '#f59e0b', // Amber
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    textColor: '#fbbf24',
    iconSvg: `<svg class="tier-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h5l3-7 4 14 3-7h5"></path></svg>`,
    descEn: 'Phenomenological model consistent with experiments/lattice (e.g., Lund string, Cornell potential). Not a literal photograph.',
    descBn: 'পরীক্ষা ও ল্যাটিস-সঙ্গত কার্যকর মডেল (যেমন লুন্ড স্ট্রিং, কর্নেল পটেনশিয়াল)। আক্ষরিক ছবি নয়।'
  },
  T4: {
    code: 'T4',
    labelEn: 'Symbolic Representation',
    labelBn: 'প্রতীকী চিত্রায়ন',
    shortEn: 'Symbolic',
    shortBn: 'প্রতীকী',
    color: '#c084fc', // Purple (Okabe-Ito reddish purple)
    bgColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: 'rgba(192, 132, 252, 0.45)',
    textColor: '#e9d5ff',
    iconSvg: `<svg class="tier-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
    descEn: 'Pedagogical metaphor. Sizes, boundaries, or colors are symbolic visual cues rather than physical reality.',
    descBn: 'শিক্ষামূলক প্রতীকী রূপক। আকার, সীমানা বা রঙ বোঝার সুবিধার জন্য প্রতীকী, ভৌত বাস্তবতা নয়।'
  }
};

/**
 * Creates and returns an accessible TierBadge HTMLElement.
 *
 * @param {Object} options
 * @param {'T1'|'T2'|'T3'|'T4'} options.tier - Truth tier code
 * @param {'en'|'bn'} [options.lang='en'] - Display language
 * @param {boolean} [options.compact=false] - Whether to show compact code badge only
 * @param {boolean} [options.interactive=true] - Allows clicking to view explanation
 * @param {Function} [options.onClick] - Click callback
 * @returns {HTMLElement}
 */
export function createTierBadge({
  tier = 'T1',
  lang = 'en',
  compact = false,
  interactive = true,
  onClick = null
} = {}) {
  const meta = TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.T4;
  const badge = document.createElement('span');
  badge.className = `tier-badge tier-${tier.toLowerCase()} ${compact ? 'compact' : ''} ${interactive ? 'interactive' : ''}`;
  badge.setAttribute('role', interactive ? 'button' : 'status');
  badge.setAttribute('tabindex', interactive ? '0' : '-1');

  const label = lang === 'bn' ? meta.labelBn : meta.labelEn;
  const desc = lang === 'bn' ? meta.descBn : meta.descEn;

  badge.setAttribute('aria-label', `${meta.code}: ${label} - ${desc}`);
  badge.title = `${meta.code}: ${label} — ${desc}`;

  badge.style.setProperty('--badge-color', meta.color);
  badge.style.setProperty('--badge-bg', meta.bgColor);
  badge.style.setProperty('--badge-border', meta.borderColor);
  badge.style.setProperty('--badge-text', meta.textColor);

  badge.innerHTML = `
    <span class="badge-icon-slot" aria-hidden="true">${meta.iconSvg}</span>
    <span class="badge-code-slot">${meta.code}</span>
    ${compact ? '' : `<span class="badge-divider-slot" aria-hidden="true">•</span><span class="badge-label-slot">${lang === 'bn' ? meta.shortBn : meta.shortEn}</span>`}
  `;

  if (interactive) {
    const handleTrigger = (e) => {
      e.stopPropagation();
      if (typeof onClick === 'function') {
        onClick(meta, e);
      }
    };
    badge.addEventListener('click', handleTrigger);
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTrigger(e);
      }
    });
  }

  return badge;
}

/**
 * Returns raw HTML string for embedding Tier Badge inside templates.
 */
export function getTierBadgeHTML(tier = 'T1', lang = 'en', compact = false) {
  const meta = TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.T4;
  const label = lang === 'bn' ? meta.labelBn : meta.labelEn;
  const short = lang === 'bn' ? meta.shortBn : meta.shortEn;
  const desc = lang === 'bn' ? meta.descBn : meta.descEn;

  return `
    <span class="tier-badge tier-${tier.toLowerCase()} ${compact ? 'compact' : ''}" 
          role="status" 
          aria-label="${meta.code}: ${label} - ${desc}"
          title="${meta.code}: ${label} — ${desc}"
          style="--badge-color: ${meta.color}; --badge-bg: ${meta.bgColor}; --badge-border: ${meta.borderColor}; --badge-text: ${meta.textColor};">
      <span class="badge-icon-slot" aria-hidden="true">${meta.iconSvg}</span>
      <span class="badge-code-slot">${meta.code}</span>
      ${compact ? '' : `<span class="badge-divider-slot" aria-hidden="true">•</span><span class="badge-label-slot">${short}</span>`}
    </span>
  `;
}
