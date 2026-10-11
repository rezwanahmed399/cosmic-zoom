/**
 * CosmoPlanck Quark Section - Chapter 6: "Hadron Builder"
 * 
 * Scientific Fidelity & Features:
 * 1. Slot Builder (1 to 5 slots):
 *    - Quarks u, d, s, c, b and their antiquarks ū, d̄, s̄, c̄, b̄
 *    - Modes: Meson (2 slots: q q̄), Baryon (3 slots: qqq), Tetraquark (4 slots: qq q̄q̄),
 *      Pentaquark (5 slots: qqqq q̄), or Custom Free-form Slots.
 * 2. Real-time Physics Validation Engine:
 *    - (i) Color-singlet check (q q̄ for mesons; qqq/q̄q̄q̄ for baryons; exotic 4 or 5 multiquarks)
 *    - (ii) Integer electric charge check
 *    - (iii) Conservation of quantum numbers (Baryon number, Strangeness, Charm, Bottomness)
 *    - If invalid: explicit scientific reason (e.g. "u u: চার্জ 4/3 ও color-singlet নয়")
 * 3. Hadron Card (when valid):
 *    - Name, Quark Composition (with glyphs), Spin J, Isospin I, Mass (PDG 2024), Lifetime / Decay
 *    - Color-valid but unobserved/not in database: Badge “রঙ-বৈধ, কিন্তু ডেটা-ফাইলে নেই/পর্যবেক্ষিত নয়” (NO invented names)
 * 4. Spin / Isospin Toggles (Valence Ambiguity Resolution):
 *    - uud -> p (spin 1/2) vs Delta+ (spin 3/2)
 *    - udd -> n (spin 1/2) vs Delta0 (spin 3/2)
 *    - uds -> Lambda (spin 1/2, isospin 0) vs Sigma0 (spin 1/2, isospin 1)
 *    - uuu -> Delta++ (spin 3/2) only (Pauli exclusion principle note)
 * 5. Exotic Gallery (Observed; T1; Structure interpretation disputed):
 *    - X(3872) (Belle 2003, c c̄ u ū)
 *    - Pc Pentaquarks (LHCb 2015/2019: Pc(4312)+, Pc(4440)+, Pc(4457)+)
 *    - T_cc+ (LHCb 2021, c c ū d̄)
 *    - Glueball: “অনুমিত, নিশ্চিত নয়” (hypothesized pure gluonic state, unknown ground state)
 * 6. Size Comparison (আকারের তুলনা):
 *    - Pion ≈ 0.66 fm (0.659 fm)
 *    - Kaon ≈ 0.56 fm (0.560 fm)
 *    - Proton ≈ 0.84 fm (0.8414 fm)
 * 7. Acceptance List:
 *    - p, n, pi+, pi-, pi0, K+, K0, Lambda, Sigma+, Delta++, Omega-, J/psi, Upsilon correctly identified.
 * 8. Zero unicode emojis across all code and UI.
 */

import {
  HADRONS,
  EXOTIC_HADRONS,
  HADRON_SIZES,
  QUARKS,
  getQuarkData,
  getExoticHadrons,
  getHadronSizes
} from '../data/quark-facts.js';
import {
  lookupHadron,
  validateHadronComposition,
  canonicalQuarkKey
} from '../physics/hadron-lookup.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_CHECK_SVG = '<svg class="c6-icon-badge ok" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_CROSS_SVG = '<svg class="c6-icon-badge err" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
const ICON_PLUS_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
const ICON_MINUS_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
const ICON_TRASH_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
const ICON_SPARK_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c6-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';

// Geometric glyphs for flavors (HUE-INDEPENDENT)
const GLYPHS = {
  u: '<svg class="c6-glyph" viewBox="0 0 32 32"><polygon points="16,4 28,26 4,26" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="16,11 23,23 9,23" fill="currentColor" opacity="0.3"/><line x1="16" y1="13" x2="16" y2="21" stroke="#f8fafc" stroke-width="2"/><polyline points="13,16 16,13 19,16" stroke="#f8fafc" stroke-width="2" fill="none"/></svg>',
  d: '<svg class="c6-glyph" viewBox="0 0 32 32"><polygon points="16,28 28,6 4,6" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="16,21 23,9 9,9" fill="currentColor" opacity="0.3"/><line x1="16" y1="11" x2="16" y2="19" stroke="#f8fafc" stroke-width="2"/><polyline points="13,16 16,19 19,16" stroke="#f8fafc" stroke-width="2" fill="none"/></svg>',
  c: '<svg class="c6-glyph" viewBox="0 0 32 32"><rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16,4 L16,28 M4,16 L28,16" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>',
  s: '<svg class="c6-glyph" viewBox="0 0 32 32"><polygon points="16,3 29,16 16,29 3,16" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>',
  t: '<svg class="c6-glyph" viewBox="0 0 32 32"><polygon points="4,24 8,8 16,16 24,8 28,24" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="8" cy="8" r="2" fill="currentColor"/><circle cx="16" cy="16" r="2" fill="currentColor"/><circle cx="24" cy="8" r="2" fill="currentColor"/></svg>',
  b: '<svg class="c6-glyph" viewBox="0 0 32 32"><line x1="16" y1="4" x2="16" y2="24" stroke="currentColor" stroke-width="2.5"/><polyline points="8,16 16,24 24,16" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="3"/></svg>'
};

// Available quarks for slots (u, d, s, c, b and their antiquarks)
const AVAILABLE_SLOT_QUARKS = [
  { key: 'u', symbol: 'u', labelBn: 'আপ (u)', charge: '+2/3', isAnti: false },
  { key: 'd', symbol: 'd', labelBn: 'ডাউন (d)', charge: '-1/3', isAnti: false },
  { key: 's', symbol: 's', labelBn: 'স্ট্রেঞ্জ (s)', charge: '-1/3', isAnti: false },
  { key: 'c', symbol: 'c', labelBn: 'চার্ম (c)', charge: '+2/3', isAnti: false },
  { key: 'b', symbol: 'b', labelBn: 'বটম (b)', charge: '-1/3', isAnti: false },
  { key: 'u_bar', symbol: 'ū', labelBn: 'অ্যান্টি-আপ (ū)', charge: '-2/3', isAnti: true },
  { key: 'd_bar', symbol: 'd̄', labelBn: 'অ্যান্টি-ডাউন (d̄)', charge: '+1/3', isAnti: true },
  { key: 's_bar', symbol: 's̄', labelBn: 'অ্যান্টি-স্ট্রেঞ্জ (s̄)', charge: '+1/3', isAnti: true },
  { key: 'c_bar', symbol: 'c̄', labelBn: 'অ্যান্টি-চার্ম (c̄)', charge: '-2/3', isAnti: true },
  { key: 'b_bar', symbol: 'b̄', labelBn: 'অ্যান্টি-বটম (b̄)', charge: '+1/3', isAnti: true }
];

// Presets requested in acceptance criteria + invalid test presets
const HADRON_PRESETS = [
  { id: 'p', label: 'p (uud)', quarks: ['u', 'u', 'd'], type: 'baryon' },
  { id: 'n', label: 'n (udd)', quarks: ['u', 'd', 'd'], type: 'baryon' },
  { id: 'pi_plus', label: 'π⁺ (ud̄)', quarks: ['u', 'd_bar'], type: 'meson' },
  { id: 'pi_minus', label: 'π⁻ (dū)', quarks: ['d', 'u_bar'], type: 'meson' },
  { id: 'pi0', label: 'π⁰ (uū)', quarks: ['u', 'u_bar'], type: 'meson' },
  { id: 'k_plus', label: 'K⁺ (us̄)', quarks: ['u', 's_bar'], type: 'meson' },
  { id: 'k_0', label: 'K⁰ (ds̄)', quarks: ['d', 's_bar'], type: 'meson' },
  { id: 'lambda', label: 'Λ (uds)', quarks: ['u', 'd', 's'], type: 'baryon', isospin: 0 },
  { id: 'sigma_plus', label: 'Σ⁺ (uus)', quarks: ['u', 'u', 's'], type: 'baryon' },
  { id: 'delta_plus_plus', label: 'Δ⁺⁺ (uuu)', quarks: ['u', 'u', 'u'], type: 'baryon' },
  { id: 'omega_minus', label: 'Ω⁻ (sss)', quarks: ['s', 's', 's'], type: 'baryon' },
  { id: 'j_psi', label: 'J/ψ (cc̄)', quarks: ['c', 'c_bar'], type: 'meson' },
  { id: 'upsilon_1s', label: 'Υ(1S) (bb̄)', quarks: ['b', 'b_bar'], type: 'meson' },
  { id: 'test_invalid_uu', label: 'u u (অবৈধ: 4/3 e)', quarks: ['u', 'u'], type: 'invalid' },
  { id: 'test_invalid_uud_bar', label: 'u u d̄ (অবৈধ: B=1/3)', quarks: ['u', 'u', 'd_bar'], type: 'invalid' },
  { id: 'test_unobserved_uub', label: 'u u b (অপর্যবেক্ষিত)', quarks: ['u', 'u', 'b'], type: 'unobserved' }
];

export class Chapter6HadronBuilder {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Main viewport DOM element
   * @param {'en'|'bn'} [options.lang='bn'] - UI language
   * @param {string} [options.level='basic'] - Pedagogy level ('basic'|'intermediate'|'expert')
   * @param {Object} [options.infoDrawer] - InfoDrawer component reference
   */
  constructor({ container, lang = 'bn', level = 'basic', infoDrawer = null }) {
    this.container = container;
    this.lang = lang;
    this.level = level;
    this.infoDrawer = infoDrawer;

    // Slot state (default to proton uud)
    this.currentMode = 'baryon'; // 'meson', 'baryon', 'tetraquark', 'pentaquark', 'custom'
    this.slots = ['u', 'u', 'd'];
    this.selectedHadronId = 'p'; // Disambiguation ID if multiple exist
    this.selectedSpin = 0.5;
    this.selectedIsospin = null;

    // Active size comparison selection
    this.activeSizeId = 'proton';

    this.initDOM();
    this.evaluateAndRender();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-6-view';
    this.viewEl.id = 'chapter-6-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c6-header-section" aria-label="Chapter 6 Header">
        <div class="c6-header-top">
          <div class="c6-title-block">
            <div class="c6-pill-row">
              <span class="c6-chapter-badge">অধ্যায় ৬</span>
              <span class="c6-tier-badge-wrap" id="c6-tier-header"></span>
              <span class="c6-scheme-tag">SU(3) Confinement & Hadronization</span>
            </div>
            <h2 class="c6-main-title">Hadron Builder</h2>
            <p class="c6-subtitle">কোয়ার্ক স্লট থেকে হ্যাড্রন গঠন, কালার-সিঙ্গলেট যাচাই ও এক্সোটিক গ্যালারি</p>
          </div>

          <div class="c6-header-actions">
            <button class="c6-btn-outline" id="c6-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>তথ্য ও কনফাইনমেন্ট অডিট</span>
            </button>
          </div>
        </div>

        <div class="c6-intro-card">
          <p class="c6-intro-text">
            কোয়ার্ক কখনো একা থাকতে পারে না (কনফাইনমেন্ট)। যেকোনো দৃশ্যমান স্থায়ী বা স্বল্পস্থায়ী কণা অবশ্যই একটি 
            <strong>কালার-সিঙ্গলেট (color-singlet)</strong> বা "সাদা" অবস্থা গঠন করবে। 
            নিচের স্লটগুলোতে আপ, ডাউন, স্ট্রেঞ্জ, চার্ম, বটম ও তাদের অ্যান্টি-কোয়ার্ক সাজিয়ে পরীক্ষা করুন। 
            ইঞ্জিনটি তাৎক্ষণিকভাবে কালার-সিঙ্গলেট শর্ত, চার্জের পূর্ণসংখ্যা মান এবং সংরক্ষিত কোয়ান্টাম সংখ্যা যাচাই করবে।
          </p>
        </div>
      </section>

      <!-- MAIN WORKBENCH: 2 COLUMNS (SLOT BUILDER + LIVE HADRON CARD) -->
      <section class="c6-workbench-section" aria-label="Hadron Builder Workbench">
        <div class="c6-workbench-grid">
          
          <!-- LEFT COLUMN: CONTROLS & SLOTS -->
          <div class="c6-slot-column">
            
            <!-- MODE PILLS -->
            <div class="c6-panel-card">
              <div class="c6-panel-header">
                <span class="c6-panel-label">গঠন পদ্ধতি নির্বাচন:</span>
                <span class="c6-slot-count-badge" id="c6-slot-count-lbl">৩টি স্লট</span>
              </div>
              <div class="c6-mode-pills" role="radiogroup" aria-label="Hadron class modes">
                <button class="c6-mode-btn" data-mode="meson" type="button">মেসন (২ স্লট: q q̄)</button>
                <button class="c6-mode-btn active" data-mode="baryon" type="button">ব্যারিয়ন (৩ স্লট: qqq)</button>
                <button class="c6-mode-btn" data-mode="tetraquark" type="button">টেট্রাকোয়ার্ক (৪ স্লট: qq q̄q̄)</button>
                <button class="c6-mode-btn" data-mode="pentaquark" type="button">পেন্টাকোয়ার্ক (৫ স্লট: qqqq q̄)</button>
                <button class="c6-mode-btn" data-mode="custom" type="button">কাস্টম / ফ্রি স্লট</button>
              </div>
            </div>

            <!-- PRESETS BAR -->
            <div class="c6-panel-card">
              <div class="c6-panel-header">
                <span class="c6-panel-label">দ্রুত প্রিসেট লোড করুন:</span>
                <span class="c6-panel-sublabel">PDG ও পরীক্ষা প্রিসেট</span>
              </div>
              <div class="c6-preset-scroll" id="c6-preset-container" role="toolbar" aria-label="Hadron Presets">
                <!-- Injected dynamically -->
              </div>
            </div>

            <!-- SLOTS BUILDER WORKSPACE -->
            <div class="c6-panel-card c6-slots-workspace">
              <div class="c6-panel-header">
                <span class="c6-panel-label">স্লট কনফিগারেশন:</span>
                <div class="c6-slot-actions">
                  <button class="c6-slot-tool-btn" id="c6-btn-add-slot" type="button" title="স্লট যোগ করুন (সর্বোচ্চ ৫)">
                    ${ICON_PLUS_SVG}
                    <span>স্লট যোগ</span>
                  </button>
                  <button class="c6-slot-tool-btn" id="c6-btn-rem-slot" type="button" title="শেষ স্লট সরান">
                    ${ICON_MINUS_SVG}
                    <span>স্লট সরান</span>
                  </button>
                  <button class="c6-slot-tool-btn text-danger" id="c6-btn-clear" type="button" title="খালি করুন">
                    ${ICON_TRASH_SVG}
                    <span>ক্লিয়ার</span>
                  </button>
                </div>
              </div>

              <!-- DYNAMIC QUARK SLOTS ROW -->
              <div class="c6-slots-row" id="c6-slots-row" aria-label="Quark Slots">
                <!-- Injected dynamically -->
              </div>

              <!-- QUARK PALETTE PICKER FOR ACTIVE SELECTION -->
              <div class="c6-palette-block">
                <div class="c6-palette-title">কোয়ার্ক প্যালেট (ক্লিক করে স্লট পূরণ করুন):</div>
                <div class="c6-palette-grid" id="c6-palette-grid">
                  <!-- Quarks and Antiquarks injected dynamically -->
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: REAL-TIME PHYSICS EVALUATION & HADRON CARD -->
          <div class="c6-evaluation-column" id="c6-evaluation-column">
            <!-- Dynamic Hadron Card or Violation Card -->
          </div>

        </div>
      </section>

      <!-- EXOTIC HADRONS GALLERY (T1 OBSERVED, STRUCTURE DISPUTED) -->
      <section class="c6-exotic-section" aria-label="Exotic Hadrons Gallery">
        <div class="c6-section-heading">
          <div class="c6-heading-left">
            <span class="c6-heading-pill">নতুন দিগন্ত</span>
            <h3 class="c6-heading-title">Exotic গ্যালারি (পর্যবেক্ষিত মাল্টিকোয়ার্ক ও গ্লুবল)</h3>
            <p class="c6-heading-desc">
              LHCb ও Belle দ্বারা পরীক্ষাগারে আবিষ্কৃত টেট্রাকোয়ার্ক ও পেন্টাকোয়ার্ক। 
              কণাগুলোর অস্তিত্ব সুনিশ্চিত (T1), তবে এদের অভ্যন্তরীণ গঠন (আণবিক বাউন্ড স্টেট বনাম শক্তপোক্ত কম্প্যাক্ট মাল্টিকোয়ার্ক) এখনো তীব্র গবেষণাধীন।
            </p>
          </div>
          <div class="c6-heading-badge" id="c6-tier-exotic"></div>
        </div>

        <div class="c6-exotic-grid" id="c6-exotic-grid">
          <!-- Injected dynamically from EXOTIC_HADRONS -->
        </div>
      </section>

      <!-- HADRON SIZES COMPARISON (PION, KAON, PROTON) -->
      <section class="c6-size-section" aria-label="Hadron Size Comparison">
        <div class="c6-section-heading">
          <div class="c6-heading-left">
            <span class="c6-heading-pill">স্থানিক বিস্তার</span>
            <h3 class="c6-heading-title">আকারের তুলনা (Hadron Size Scale)</h3>
            <p class="c6-heading-desc">
              আধান-ব্যাসার্ধ (Charge Radius): পায়ন ≈ ০.৬৬ fm, কেয়ন ≈ ০.৫৬ fm, প্রোটন ≈ ০.৮৪ fm।
            </p>
          </div>
          <div class="c6-heading-badge" id="c6-tier-sizes"></div>
        </div>

        <div class="c6-size-card">
          <div class="c6-size-grid">
            <div class="c6-size-svg-wrap" id="c6-size-svg-wrap">
              <!-- Interactive SVG ruler & circles -->
            </div>
            <div class="c6-size-info-panel" id="c6-size-info-panel">
              <!-- Injected dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- NAVIGATION CONTINUITY HUD -->
      <section class="c6-nav-footer" aria-label="Chapter Navigation">
        <div class="c6-nav-footer-inner">
          <a class="c6-nav-btn prev" href="#/quarks/chapter-5" id="c6-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c6-nav-btn-text">
              <span class="c6-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c6-nav-btn-title">অধ্যায় ৫: টেনে ছেঁড়া (মোড A)</span>
            </div>
          </a>

          <div class="c6-nav-summary-box">
            <span class="c6-nav-tag">কোয়ার্ক ভ্রমণ সমাপ্তি</span>
            <p class="c6-nav-summary-desc">
              আপনি স্কেল-সিঁড়ি থেকে প্রোটনের শরীর, ফ্লেভার, কালার, ফ্লাক্স টিউব, স্ট্রিং ভাঙা ও হ্যাড্রন বিল্ডার পর্যন্ত সফলভাবে অনুসন্ধান করেছেন।
            </p>
          </div>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTierEl = this.viewEl.querySelector('#c6-tier-header');
    if (headerTierEl) {
      headerTierEl.appendChild(createTierBadge('T1', { lang: this.lang }));
      headerTierEl.appendChild(createTierBadge('T4', { lang: this.lang }));
    }
    const exoticTierEl = this.viewEl.querySelector('#c6-tier-exotic');
    if (exoticTierEl) {
      exoticTierEl.appendChild(createTierBadge('T1', { lang: this.lang }));
      exoticTierEl.appendChild(createTierBadge('T3', { lang: this.lang }));
    }
    const sizesTierEl = this.viewEl.querySelector('#c6-tier-sizes');
    if (sizesTierEl) {
      sizesTierEl.appendChild(createTierBadge('T1', { lang: this.lang }));
    }

    // Bind Mode Buttons
    const modeBtns = this.viewEl.querySelectorAll('.c6-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        this.setMode(mode);
      });
    });

    // Bind Slot Action Buttons
    this.viewEl.querySelector('#c6-btn-add-slot').addEventListener('click', () => this.addSlot());
    this.viewEl.querySelector('#c6-btn-rem-slot').addEventListener('click', () => this.removeSlot());
    this.viewEl.querySelector('#c6-btn-clear').addEventListener('click', () => this.clearSlots());

    // Bind Info Drawer
    this.viewEl.querySelector('#c6-btn-info').addEventListener('click', () => this.openInfoDrawer());

    this.renderPresets();
    this.renderPalette();
    this.renderExoticGallery();
    this.renderSizeComparison();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.viewEl.querySelectorAll('.c6-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    if (mode === 'meson') {
      this.slots = ['u', 'd_bar'];
      this.selectedHadronId = 'pi_plus';
    } else if (mode === 'baryon') {
      this.slots = ['u', 'u', 'd'];
      this.selectedHadronId = 'p';
    } else if (mode === 'tetraquark') {
      this.slots = ['c', 'c_bar', 'u', 'u_bar'];
      this.selectedHadronId = 'x_3872';
    } else if (mode === 'pentaquark') {
      this.slots = ['u', 'u', 'd', 'c', 'c_bar'];
      this.selectedHadronId = 'p_c_4312';
    }
    // 'custom' leaves slots unchanged
    this.evaluateAndRender();
  }

  addSlot() {
    if (this.slots.length >= 5) return;
    this.currentMode = 'custom';
    this.viewEl.querySelectorAll('.c6-mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'custom'));
    this.slots.push('u');
    this.evaluateAndRender();
  }

  removeSlot() {
    if (this.slots.length <= 1) return;
    this.currentMode = 'custom';
    this.viewEl.querySelectorAll('.c6-mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'custom'));
    this.slots.pop();
    this.evaluateAndRender();
  }

  clearSlots() {
    this.currentMode = 'custom';
    this.viewEl.querySelectorAll('.c6-mode-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'custom'));
    this.slots = [];
    this.evaluateAndRender();
  }

  renderPresets() {
    const container = this.viewEl.querySelector('#c6-preset-container');
    if (!container) return;
    container.innerHTML = '';

    HADRON_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = `c6-preset-chip ${preset.type}`;
      btn.type = 'button';
      btn.innerHTML = `<span class="c6-preset-name">${preset.label}</span>`;
      btn.addEventListener('click', () => {
        this.slots = [...preset.quarks];
        this.selectedHadronId = preset.id;
        if (preset.isospin !== undefined) this.selectedIsospin = preset.isospin;
        // Update mode
        if (this.slots.length === 2 && preset.type === 'meson') this.currentMode = 'meson';
        else if (this.slots.length === 3 && preset.type === 'baryon') this.currentMode = 'baryon';
        else if (this.slots.length === 4) this.currentMode = 'tetraquark';
        else if (this.slots.length === 5) this.currentMode = 'pentaquark';
        else this.currentMode = 'custom';

        this.viewEl.querySelectorAll('.c6-mode-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-mode') === this.currentMode);
        });

        this.evaluateAndRender();
      });
      container.appendChild(btn);
    });
  }

  renderPalette() {
    const container = this.viewEl.querySelector('#c6-palette-grid');
    if (!container) return;
    container.innerHTML = '';

    AVAILABLE_SLOT_QUARKS.forEach(q => {
      const btn = document.createElement('button');
      btn.className = `c6-palette-btn ${q.isAnti ? 'anti' : 'matter'}`;
      btn.type = 'button';
      const baseKey = q.key.replace('_bar', '');
      const glyph = GLYPHS[baseKey] || '';

      btn.innerHTML = `
        <div class="c6-pal-glyph-wrap">${glyph}</div>
        <div class="c6-pal-info">
          <span class="c6-pal-sym">${q.symbol}</span>
          <span class="c6-pal-charge">${q.charge} e</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        // If there's room, add or replace
        if (this.slots.length < 5) {
          this.slots.push(q.key);
        } else {
          // Replace last slot
          this.slots[this.slots.length - 1] = q.key;
        }
        this.evaluateAndRender();
      });

      container.appendChild(btn);
    });
  }

  renderSlotsUI() {
    const rowEl = this.viewEl.querySelector('#c6-slots-row');
    const countBadge = this.viewEl.querySelector('#c6-slot-count-lbl');
    if (!rowEl) return;

    if (countBadge) {
      countBadge.textContent = `${this.slots.length}টি স্লট`;
    }

    rowEl.innerHTML = '';

    if (this.slots.length === 0) {
      rowEl.innerHTML = `
        <div class="c6-empty-slots-msg">
          স্লট খালি। নিচে কোয়ার্ক প্যালেট থেকে যেকোনো কোয়ার্ক যোগ করুন।
        </div>
      `;
      return;
    }

    this.slots.forEach((qKey, index) => {
      const qData = getQuarkData(qKey);
      if (!qData) return;

      const baseKey = qKey.replace('_bar', '');
      const glyph = GLYPHS[baseKey] || '';
      const isAnti = qData.isAntiquark;

      const slotBox = document.createElement('div');
      slotBox.className = `c6-slot-card ${isAnti ? 'anti-slot' : 'quark-slot'}`;
      slotBox.setAttribute('data-slot-idx', index);

      slotBox.innerHTML = `
        <div class="c6-slot-header">
          <span class="c6-slot-idx-tag">স্লট ${index + 1}</span>
          <button class="c6-slot-del-btn" type="button" title="এই স্লট সরান" data-del-idx="${index}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="c6-slot-glyph">${glyph}</div>
        <div class="c6-slot-content">
          <span class="c6-slot-symbol">${qData.symbol}</span>
          <span class="c6-slot-charge">${qData.charge.fraction} e</span>
        </div>
        <div class="c6-slot-select-wrap">
          <select class="c6-slot-select" data-slot-select="${index}" aria-label="Slot ${index + 1} Quark Flavor">
            ${AVAILABLE_SLOT_QUARKS.map(aq => `
              <option value="${aq.key}" ${aq.key === qKey ? 'selected' : ''}>
                ${aq.symbol} (${aq.labelBn}) [${aq.charge} e]
              </option>
            `).join('')}
          </select>
        </div>
      `;

      // Select change event
      const sel = slotBox.querySelector('.c6-slot-select');
      sel.addEventListener('change', (e) => {
        this.slots[index] = e.target.value;
        this.evaluateAndRender();
      });

      // Del btn
      const delBtn = slotBox.querySelector('.c6-slot-del-btn');
      delBtn.addEventListener('click', () => {
        this.slots.splice(index, 1);
        this.evaluateAndRender();
      });

      rowEl.appendChild(slotBox);
    });
  }

  evaluateAndRender() {
    this.renderSlotsUI();

    const evalContainer = this.viewEl.querySelector('#c6-evaluation-column');
    if (!evalContainer) return;
    evalContainer.innerHTML = '';

    if (this.slots.length === 0) {
      evalContainer.innerHTML = `
        <div class="c6-eval-card empty">
          <div class="c6-eval-empty-icon">${ICON_INFO_SVG}</div>
          <h3 class="c6-eval-title">কোনো কোয়ার্ক নির্ধারিত নেই</h3>
          <p class="c6-eval-desc">একটি বৈধ হ্যাড্রন যাচাই করতে বাম পাশের প্যালেট থেকে কোয়ার্ক বা দ্রুত প্রিসেট নির্বাচন করুন।</p>
        </div>
      `;
      return;
    }

    // Execute Physics Validation & Hadron Lookup
    const lookupResult = lookupHadron(this.slots, {
      id: this.selectedHadronId,
      spin: this.selectedSpin,
      isospin: this.selectedIsospin
    });

    if (!lookupResult.isValid) {
      this.renderInvalidCard(evalContainer, lookupResult.validation);
    } else if (lookupResult.found && lookupResult.match) {
      this.renderValidHadronCard(evalContainer, lookupResult);
    } else if (lookupResult.isColorValidUnobserved) {
      this.renderUnobservedCard(evalContainer, lookupResult);
    }
  }

  renderInvalidCard(container, validation) {
    const card = document.createElement('div');
    card.className = 'c6-eval-card invalid';

    const netQ = validation.quantumNumbers ? validation.quantumNumbers.charge : 0;
    const netB = validation.quantumNumbers ? validation.quantumNumbers.baryonNumber : 0;

    card.innerHTML = `
      <div class="c6-eval-header error">
        <div class="c6-eval-status-icon">${ICON_CROSS_SVG}</div>
        <div class="c6-eval-status-meta">
          <span class="c6-eval-pill error">প্রত্যাখ্যাত: কনফাইনমেন্ট / চার্জ লঙ্ঘন</span>
          <h3 class="c6-eval-title">অবৈধ কোয়ার্ক বিন্যাস</h3>
        </div>
      </div>

      <div class="c6-violation-box">
        <div class="c6-violation-reason-label">পদার্থবিজ্ঞান ইঞ্জিন প্রত্যাখ্যানের কারণ:</div>
        <div class="c6-violation-reason-text">${validation.violationReasonBn}</div>
      </div>

      <!-- RULES BREAKDOWN LEDGER -->
      <div class="c6-rules-ledger">
        <div class="c6-rule-row ${validation.isColorSinglet ? 'pass' : 'fail'}">
          <span class="c6-rule-icon">${validation.isColorSinglet ? ICON_CHECK_SVG : ICON_CROSS_SVG}</span>
          <span class="c6-rule-name">কালার-সিঙ্গলেট (Color Singlet) শর্ত:</span>
          <span class="c6-rule-val">${validation.isColorSinglet ? 'সফল (সাদা সম্ভব)' : 'ব্যর্থ (মুক্ত কালার নিষিদ্ধ)'}</span>
        </div>

        <div class="c6-rule-row ${validation.isChargeInteger ? 'pass' : 'fail'}">
          <span class="c6-rule-icon">${validation.isChargeInteger ? ICON_CHECK_SVG : ICON_CROSS_SVG}</span>
          <span class="c6-rule-name">মোট বৈদ্যুতিক আধান (Integer Q):</span>
          <span class="c6-rule-val">${netQ.toFixed(2)} e (${validation.isChargeInteger ? 'পূর্ণসংখ্যা' : 'ভগ্নাংশ (অবৈধ)'})</span>
        </div>

        <div class="c6-rule-row ${validation.isBaryonInteger ? 'pass' : 'fail'}">
          <span class="c6-rule-icon">${validation.isBaryonInteger ? ICON_CHECK_SVG : ICON_CROSS_SVG}</span>
          <span class="c6-rule-name">বেরিয়ন সংখ্যা (Baryon Number):</span>
          <span class="c6-rule-val">${netB.toFixed(2)} (${validation.isBaryonInteger ? 'পূর্ণসংখ্যা' : 'ভগ্নাংশ (অবৈধ)'})</span>
        </div>
      </div>

      <div class="c6-eval-note">
        <strong>কনফাইনমেন্ট সূত্র:</strong> কোয়ান্টাম ক্রোমোডাইনামিক্সে (QCD) কালার গ্রুপ $SU(3)_c$-এর কারণে কেবল $3 \\otimes \\bar{3} = 1 \\oplus 8$ (মেসন) 
        অথবা $3 \\otimes 3 \\otimes 3 = 1 \\oplus 8 \\oplus 8 \\oplus 10$ (ব্যারিয়ন) কালার-সিঙ্গলেট ট্রিপলেট গঠন করতে পারে।
      </div>
    `;

    container.appendChild(card);
  }

  renderValidHadronCard(container, lookupResult) {
    const hadron = lookupResult.match;
    const candidates = lookupResult.candidates;
    const isAmbiguous = lookupResult.isAmbiguous;

    const card = document.createElement('div');
    card.className = 'c6-eval-card valid';

    const massVal = hadron.mass ? `${hadron.mass.value} ${hadron.mass.unit}` : 'অনির্ধারিত';
    const massUncertainty = hadron.mass && hadron.mass.uncertainty ? hadron.mass.uncertainty : '';
    const massSrc = hadron.mass && hadron.mass.source ? hadron.mass.source : 'PDG 2024';

    let lifetimeStr = 'অনির্ধারিত';
    if (hadron.lifetime) {
      if (typeof hadron.lifetime.value === 'string' && hadron.lifetime.value === 'stable') {
        lifetimeStr = `স্থিতিশীল (${hadron.lifetime.limitSec || '> 10^34 বছর'})`;
      } else if (typeof hadron.lifetime.value === 'number') {
        lifetimeStr = `${hadron.lifetime.value.toExponential(2)} s`;
        if (hadron.lifetime.value > 1) lifetimeStr = `${hadron.lifetime.value} s`;
      }
    }

    const radiusStr = hadron.chargeRadiusFm ? `${hadron.chargeRadiusFm} fm` : 'পরিমাপ নেই';

    // Composition Glyphs
    const compGlyphsHtml = (hadron.quarkContent || []).map(q => {
      const qd = getQuarkData(q);
      const base = q.replace('_bar', '');
      return `
        <div class="c6-hadron-quark-chip" title="${qd ? qd.nameBn : q}">
          <span class="c6-chip-glyph">${GLYPHS[base] || ''}</span>
          <span class="c6-chip-sym">${qd ? qd.symbol : q}</span>
        </div>
      `;
    }).join('<span class="c6-chip-plus">+</span>');

    card.innerHTML = `
      <div class="c6-eval-header success">
        <div class="c6-eval-status-icon">${ICON_CHECK_SVG}</div>
        <div class="c6-eval-status-meta">
          <div class="c6-pill-row">
            <span class="c6-eval-pill success">বৈধ কালার-সিঙ্গলেট হ্যাড্রন</span>
            <span class="c6-tier-badge-wrap" id="c6-tier-hadron-card"></span>
            <span class="c6-hadron-class-tag">${hadron.baryonNumber !== 0 ? 'ব্যারিয়ন (Baryon)' : 'মেসন (Meson)'}</span>
          </div>
          <div class="c6-hadron-title-row">
            <h3 class="c6-hadron-name">${hadron.symbol} — ${hadron.nameBn}</h3>
            <span class="c6-hadron-name-en">(${hadron.nameEn})</span>
          </div>
        </div>
      </div>

      <!-- VALENCE COMPOSITION BAR -->
      <div class="c6-hadron-comp-bar">
        <span class="c6-comp-label">ভ্যালেন্স কোয়ার্ক গঠন:</span>
        <div class="c6-comp-chips">${compGlyphsHtml}</div>
      </div>

      <!-- AMBIGUITY TOGGLE (SPIN / ISOSPIN) -->
      ${isAmbiguous ? `
        <div class="c6-ambiguity-panel">
          <div class="c6-ambiguity-header">
            <span class="c6-amb-label">স্পিন / আইসোস্পিন রেজোন্যান্স টগল:</span>
            <span class="c6-amb-note">একই কোয়ার্ক বিন্যাসের ভিন্ন কোয়ান্টাম অবস্থা</span>
          </div>
          <div class="c6-amb-pills" role="radiogroup" aria-label="Ambiguity candidate switcher">
            ${candidates.map(cand => `
              <button class="c6-amb-btn ${cand.id === hadron.id ? 'active' : ''}" data-cand-id="${cand.id}" type="button">
                <strong>${cand.symbol}</strong> (${cand.nameBn}) [J=${cand.spin}${cand.isospin !== undefined ? `, I=${cand.isospin}` : ''}]
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- PAULI EXCLUSION SPECIAL NOTE FOR UUU / SSS DELTA++ -->
      ${hadron.id === 'delta_plus_plus' ? `
        <div class="c6-pauli-note">
          <strong>পাউলির অপবর্জন নীতি:</strong> তিন অভিন্ন আপ-কোয়ার্কের (uuu) সিমেট্রিক স্থানিক ও কালার-সিঙ্গলেট অ্যান্টিসিমেট্রিক ওয়েভফাংশনের জন্য 
          গ্রাউন্ড স্টেটে স্পিন অবশ্যই ৩/২ ($\Delta^{++}$) হতে হয়। এখানে স্পিন ১/২ অবস্থা গঠিত হতে পারে না।
        </div>
      ` : ''}

      <!-- QUANTUM PROPERTIES GRID -->
      <div class="c6-props-grid">
        <div class="c6-prop-box">
          <span class="c6-prop-lbl">বিশ্রাম ভর (Rest Mass):</span>
          <span class="c6-prop-val highlight">${massVal}</span>
          <span class="c6-prop-sub">${massUncertainty ? `± ${massUncertainty}` : ''} (${massSrc})</span>
        </div>

        <div class="c6-prop-box">
          <span class="c6-prop-lbl">স্পিন (Spin J):</span>
          <span class="c6-prop-val">${hadron.spin === 0.5 ? '½' : (hadron.spin === 1.5 ? '3/2' : hadron.spin)}</span>
          <span class="c6-prop-sub">${hadron.isospin !== undefined ? `Isospin I = ${hadron.isospin}` : 'কোয়ান্টাম স্পিন'}</span>
        </div>

        <div class="c6-prop-box">
          <span class="c6-prop-lbl">বৈদ্যুতিক আধান (Charge):</span>
          <span class="c6-prop-val">${hadron.charge >= 0 ? '+' : ''}${hadron.charge} e</span>
          <span class="c6-prop-sub">সংরক্ষিত পূর্ণসংখ্যা</span>
        </div>

        <div class="c6-prop-box">
          <span class="c6-prop-lbl">জীবনকাল (Lifetime):</span>
          <span class="c6-prop-val">${lifetimeStr}</span>
          <span class="c6-prop-sub">${hadron.lifetime && hadron.lifetime.decay ? hadron.lifetime.decay : 'প্রধান ক্ষয় প্রণালী'}</span>
        </div>

        <div class="c6-prop-box">
          <span class="c6-prop-lbl">বেরিয়ন সংখ্যা (B):</span>
          <span class="c6-prop-val">${hadron.baryonNumber}</span>
          <span class="c6-prop-sub">${hadron.baryonNumber === 1 ? 'বেরিয়ন' : (hadron.baryonNumber === -1 ? 'অ্যান্টি-বেরিয়ন' : 'মেসন')}</span>
        </div>

        <div class="c6-prop-box">
          <span class="c6-prop-lbl">আধান-ব্যাসার্ধ (Radius):</span>
          <span class="c6-prop-val">${radiusStr}</span>
          <span class="c6-prop-sub">${hadron.chargeRadiusFm ? 'পরীক্ষালব্ধ আধান-ব্যাসার্ধ' : 'পয়েন্ট-লাইক / অজানা'}</span>
        </div>
      </div>
    `;

    // Attach tier badge
    const tierWrap = card.querySelector('#c6-tier-hadron-card');
    if (tierWrap) {
      tierWrap.appendChild(createTierBadge(hadron.tier || 'T1', { lang: this.lang }));
    }

    // Attach ambiguity click listeners
    const ambBtns = card.querySelectorAll('.c6-amb-btn');
    ambBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const candId = e.currentTarget.getAttribute('data-cand-id');
        this.selectedHadronId = candId;
        this.evaluateAndRender();
      });
    });

    container.appendChild(card);
  }

  renderUnobservedCard(container, lookupResult) {
    const card = document.createElement('div');
    card.className = 'c6-eval-card unobserved';

    const qNums = lookupResult.quantumNumbers;
    const compStr = this.slots.map(k => {
      const qd = getQuarkData(k);
      return qd ? qd.symbol : k;
    }).join(' + ');

    card.innerHTML = `
      <div class="c6-eval-header unobserved">
        <div class="c6-eval-status-icon">${ICON_SPARK_SVG}</div>
        <div class="c6-eval-status-meta">
          <div class="c6-pill-row">
            <span class="c6-eval-pill unobserved">রঙ-বৈধ, কিন্তু ডেটা-ফাইলে নেই/পর্যবেক্ষিত নয়</span>
            <span class="c6-tier-badge-wrap" id="c6-tier-unobs"></span>
          </div>
          <h3 class="c6-eval-title">বৈধ কালার-সিঙ্গলেট কনফিগারেশন (${compStr})</h3>
          <p class="c6-eval-sub-unobs">এই বিন্যাসে কোনো মনগড়া বা অনুমাননির্ভর কাল্পনিক নাম তৈরি করা হয়নি।</p>
        </div>
      </div>

      <div class="c6-unobserved-box">
        <p class="c6-unobserved-text">
          আপনার নির্বাচিত কোয়ার্ক সংমিশ্রণটি <strong>কালার-সিঙ্গলেট (Color Singlet)</strong> গঠন করতে সক্ষম এবং এর বৈদ্যুতিক আধান 
          ও বেরিয়ন সংখ্যা নিখুঁত পূর্ণসংখ্যা। তবে এটি আদর্শ গ্রাউন্ড-স্টেট স্ট্যান্ডার্ড হ্যাড্রন টেবিলে নেই। 
          এটি একটি উচ্চতর এক্সাইটেড রেজোন্যান্স (যেমন বটম বা চার্ম ব্যারিয়ন) অথবা পরীক্ষাগারে বিরল অবস্থা।
        </p>
      </div>

      <div class="c6-props-grid">
        <div class="c6-prop-box">
          <span class="c6-prop-lbl">কোয়ার্ক বিন্যাস:</span>
          <span class="c6-prop-val">${compStr}</span>
          <span class="c6-prop-sub">${lookupResult.hadronClass || 'কালার-সিঙ্গলেট'}</span>
        </div>
        <div class="c6-prop-box">
          <span class="c6-prop-lbl">মোট আধান (Net Charge):</span>
          <span class="c6-prop-val">${qNums.charge >= 0 ? '+' : ''}${qNums.charge} e</span>
          <span class="c6-prop-sub">সংরক্ষিত পূর্ণসংখ্যা</span>
        </div>
        <div class="c6-prop-box">
          <span class="c6-prop-lbl">বেরিয়ন সংখ্যা (Baryon):</span>
          <span class="c6-prop-val">${qNums.baryonNumber}</span>
          <span class="c6-prop-sub">সংরক্ষিত পূর্ণসংখ্যা</span>
        </div>
        <div class="c6-prop-box">
          <span class="c6-prop-lbl">ফ্লেভার কোয়ান্টাম সংখ্যা:</span>
          <span class="c6-prop-val">S:${qNums.strangeness}, C:${qNums.charm}, B':${qNums.bottomness}</span>
          <span class="c6-prop-sub">ফ্লেভার সংরক্ষণ</span>
        </div>
      </div>
    `;

    const tierWrap = card.querySelector('#c6-tier-unobs');
    if (tierWrap) {
      tierWrap.appendChild(createTierBadge('T2', { lang: this.lang }));
    }

    container.appendChild(card);
  }

  renderExoticGallery() {
    const container = this.viewEl.querySelector('#c6-exotic-grid');
    if (!container) return;
    container.innerHTML = '';

    const exoticList = getExoticHadrons() ? Object.values(getExoticHadrons()) : [];

    exoticList.forEach(ex => {
      const card = document.createElement('div');
      card.className = 'c6-exotic-card';

      const massText = ex.mass ? `${ex.mass.value} ${ex.mass.unit}` : (ex.massEstimateGeV ? `${ex.massEstimateGeV.value} ${ex.massEstimateGeV.unit}` : 'অজানা');
      const isGlueball = ex.id === 'glueball';

      const quarksDisplay = ex.quarkContent && ex.quarkContent.length > 0
        ? ex.quarkContent.map(q => {
            const qd = getQuarkData(q);
            return `<span class="c6-ex-quark-tag">${qd ? qd.symbol : q}</span>`;
          }).join('')
        : '<span class="c6-ex-quark-tag gluons">g + g (বিশুদ্ধ গ্লুয়ন)</span>';

      card.innerHTML = `
        <div class="c6-exotic-card-header">
          <div class="c6-ex-pill-row">
            <span class="c6-ex-badge ${isGlueball ? 'hypo' : 'observed'}">${isGlueball ? ex.statusBn : 'পর্যবেক্ষিত (T1)'}</span>
            <span class="c6-ex-disc-tag">${ex.discovery ? ex.discovery.experiment + ' (' + (ex.discovery.year || ex.discovery.resolvedYear) + ')' : 'Lattice QCD'}</span>
          </div>
          <h4 class="c6-ex-title">${ex.symbol} — ${ex.nameBn}</h4>
        </div>

        <div class="c6-ex-content-row">
          <span class="c6-ex-lbl">গঠন:</span>
          <div class="c6-ex-quarks">${quarksDisplay}</div>
        </div>

        <div class="c6-ex-meta-row">
          <div class="c6-ex-meta-item">
            <span class="c6-ex-meta-lbl">ভর:</span>
            <span class="c6-ex-meta-val">${massText}</span>
          </div>
          <div class="c6-ex-meta-item">
            <span class="c6-ex-meta-lbl">স্পিন (J):</span>
            <span class="c6-ex-meta-val">${ex.spin !== undefined ? ex.spin : (ex.massEstimateGeV ? ex.massEstimateGeV.groundState : '—')}</span>
          </div>
          <div class="c6-ex-meta-item">
            <span class="c6-ex-meta-lbl">আধান:</span>
            <span class="c6-ex-meta-val">${ex.charge !== undefined ? `${ex.charge >= 0 ? '+' : ''}${ex.charge} e` : '0 e'}</span>
          </div>
        </div>

        <div class="c6-ex-debate-box">
          <span class="c6-ex-debate-title">গঠনের বিতর্ক / মডেল:</span>
          <p class="c6-ex-debate-text">${ex.structureDebateBn || ex.descriptionBn}</p>
        </div>

        <div class="c6-ex-card-actions">
          ${!isGlueball ? `
            <button class="c6-btn-load-exotic" type="button" data-load-ex="${ex.id}">
              ${ICON_SPARK_SVG}
              <span>স্লটে লোড করে যাচাই করুন</span>
            </button>
          ` : `
            <span class="c6-glueball-note">কোনো ভ্যালেন্স কোয়ার্ক নেই (অনুমিত)</span>
          `}
        </div>
      `;

      if (!isGlueball) {
        const loadBtn = card.querySelector('.c6-btn-load-exotic');
        loadBtn.addEventListener('click', () => {
          this.slots = [...ex.quarkContent];
          this.selectedHadronId = ex.id;
          if (this.slots.length === 4) this.currentMode = 'tetraquark';
          else if (this.slots.length === 5) this.currentMode = 'pentaquark';
          else this.currentMode = 'custom';

          this.viewEl.querySelectorAll('.c6-mode-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === this.currentMode);
          });

          this.evaluateAndRender();
          // Smooth scroll up to workbench
          this.viewEl.querySelector('.c6-workbench-section').scrollIntoView({ behavior: 'smooth' });
        });
      }

      container.appendChild(card);
    });
  }

  renderSizeComparison() {
    const wrap = this.viewEl.querySelector('#c6-size-svg-wrap');
    const infoPanel = this.viewEl.querySelector('#c6-size-info-panel');
    if (!wrap || !infoPanel) return;

    const sizes = getHadronSizes();
    if (!sizes) return;

    const pion = sizes.pion;
    const kaon = sizes.kaon;
    const proton = sizes.proton;

    // Scale: 1 fm = 160 px radius in SVG coordinates
    // Center at (220, 160)
    const scalePx = 160;
    const cx = 220;
    const cy = 160;

    const rPion = pion.chargeRadiusFm * scalePx;
    const rKaon = kaon.chargeRadiusFm * scalePx;
    const rProton = proton.chargeRadiusFm * scalePx;

    wrap.innerHTML = `
      <svg class="c6-size-svg" viewBox="0 0 440 320" role="img" aria-label="Hadron charge radius concentric comparison">
        <defs>
          <radialGradient id="grad-proton" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05"/>
          </radialGradient>
          <radialGradient id="grad-pion" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#34d399" stop-opacity="0.05"/>
          </radialGradient>
          <radialGradient id="grad-kaon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.05"/>
          </radialGradient>
        </defs>

        <!-- Coordinate Grid & Axes -->
        <line x1="20" y1="${cy}" x2="420" y2="${cy}" stroke="#334155" stroke-dasharray="3 3"/>
        <line x1="${cx}" y1="20" x2="${cx}" y2="300" stroke="#334155" stroke-dasharray="3 3"/>

        <!-- Concentric circles -->
        <!-- Proton: r ≈ 0.84 fm -->
        <circle class="c6-size-circle proton ${this.activeSizeId === 'proton' ? 'active' : ''}" 
          cx="${cx}" cy="${cy}" r="${rProton}" fill="url(#grad-proton)" stroke="#38bdf8" stroke-width="2.5" data-size-id="proton"/>
        
        <!-- Pion: r ≈ 0.66 fm -->
        <circle class="c6-size-circle pion ${this.activeSizeId === 'pion' ? 'active' : ''}" 
          cx="${cx}" cy="${cy}" r="${rPion}" fill="url(#grad-pion)" stroke="#34d399" stroke-width="2.2" stroke-dasharray="6 3" data-size-id="pion"/>
        
        <!-- Kaon: r ≈ 0.56 fm -->
        <circle class="c6-size-circle kaon ${this.activeSizeId === 'kaon' ? 'active' : ''}" 
          cx="${cx}" cy="${cy}" r="${rKaon}" fill="url(#grad-kaon)" stroke="#fbbf24" stroke-width="2" data-size-id="kaon"/>

        <!-- Center Point -->
        <circle cx="${cx}" cy="${cy}" r="3.5" fill="#f8fafc"/>

        <!-- Rulers and Dimensions -->
        <line x1="${cx}" y1="${cy}" x2="${cx + rProton}" y2="${cy}" stroke="#38bdf8" stroke-width="2"/>
        <line x1="${cx + rProton}" y1="${cy - 8}" x2="${cx + rProton}" y2="${cy + 8}" stroke="#38bdf8" stroke-width="2"/>
        <text x="${cx + rProton / 2}" y="${cy - 8}" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">r_p ≈ 0.84 fm</text>

        <!-- Scale indicator at bottom -->
        <g transform="translate(40, 290)">
          <line x1="0" y1="0" x2="${scalePx * 0.5}" y2="0" stroke="#94a3b8" stroke-width="2"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" stroke-width="2"/>
          <line x1="${scalePx * 0.5}" y1="-5" x2="${scalePx * 0.5}" y2="5" stroke="#94a3b8" stroke-width="2"/>
          <text x="${scalePx * 0.25}" y="-8" fill="#94a3b8" font-size="10" text-anchor="middle">০.৫ ফেমটোমিটার (fm)</text>
        </g>
      </svg>
    `;

    // Size Selection Panel
    const selectedObj = sizes[this.activeSizeId] || proton;

    infoPanel.innerHTML = `
      <div class="c6-size-tabs" role="tablist">
        <button class="c6-size-tab ${this.activeSizeId === 'proton' ? 'active' : ''}" data-size-target="proton" type="button">
          প্রোটন (p) [০.৮৪ fm]
        </button>
        <button class="c6-size-tab ${this.activeSizeId === 'pion' ? 'active' : ''}" data-size-target="pion" type="button">
          পায়ন (π) [০.৬৬ fm]
        </button>
        <button class="c6-size-tab ${this.activeSizeId === 'kaon' ? 'active' : ''}" data-size-target="kaon" type="button">
          কেয়ন (K) [০.৫৬ fm]
        </button>
      </div>

      <div class="c6-size-details-card">
        <div class="c6-size-details-header">
          <h4 class="c6-size-det-title">${selectedObj.symbol} — ${selectedObj.nameBn}</h4>
          <span class="c6-size-det-val">${selectedObj.chargeRadiusFm} fm (${selectedObj.approximateFm} fm)</span>
        </div>
        <p class="c6-size-det-desc">${selectedObj.descriptionBn}</p>
        <div class="c6-size-meta-row">
          <span class="c6-size-meta-tag">আপেক্ষিক আকার: প্রোটনের ${(selectedObj.relativeToProton * 100).toFixed(1)}%</span>
          <span class="c6-size-meta-src">উৎস: ${selectedObj.source}</span>
        </div>
      </div>
    `;

    // Interactive circle clicks & tab clicks
    wrap.querySelectorAll('.c6-size-circle').forEach(c => {
      c.addEventListener('click', (e) => {
        this.activeSizeId = e.currentTarget.getAttribute('data-size-id');
        this.renderSizeComparison();
      });
    });

    infoPanel.querySelectorAll('.c6-size-tab').forEach(t => {
      t.addEventListener('click', (e) => {
        this.activeSizeId = e.currentTarget.getAttribute('data-size-target');
        this.renderSizeComparison();
      });
    });
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      titleBn: 'অধ্যায় ৬: Hadron Builder বৈজ্ঞানিক অডিট',
      titleEn: 'Chapter 6: Hadron Builder Scientific Audit',
      tier: 'T1',
      sections: [
        {
          headingBn: 'কালার-সিঙ্গলেট কনফাইনমেন্টের নীতি',
          headingEn: 'Color-Singlet Confinement Principles',
          contentBn: `
            কোয়ান্টাম ক্রোমোডাইনামিক্সে (QCD) কালার চার্জের গ্রুপ হল SU(3)_color। 
            গাউসের নিয়ম ও ডাইনামিক্যাল স্ট্রিং টেনশনের কারণে মুক্ত কালার চার্জ যুক্ত কণা 
            অসীম শক্তির প্রয়োজন ছাড়া বিচ্ছিন্ন হতে পারে না। 
            ফলে প্রকৃতিতে পর্যবেক্ষিত প্রতিটি কণা অবশ্যই একটি "কালার-সিঙ্গলেট" (সাদা) অবস্থা হতে হবে:
            • মেসন: q q̄ (কালার + অ্যান্টি-কালার সংমিশ্রণ)
            • ব্যারিয়ন: qqq (r + g + b ট্রিপলেট সংমিশ্রণ)
            • টেট্রাকোয়ার্ক: qq q̄q̄
            • পেন্টাকোয়ার্ক: qqqq q̄
          `
        },
        {
          headingBn: 'স্পিন ও আইসোস্পিন রেজোন্যান্স অ্যাম্বিগুইটি',
          headingEn: 'Spin & Isospin Valence Ambiguity',
          contentBn: `
            একই ভ্যালেন্স কোয়ার্ক সংমিশ্রণ থেকে স্পিন কাপলিং ও আইসোস্পিনের কারণে ভিন্ন হ্যাড্রন সৃষ্টি হতে পারে:
            • uud: গ্রাউন্ড স্টেট প্রোটন p (J = 1/2) বনাম এক্সাইটেড ডেল্টা রেজোন্যান্স Δ⁺ (J = 3/2, ভর ১২৩২ MeV)।
            • udd: নিউট্রন n (J = 1/2) বনাম ডেল্টা রেজোন্যান্স Δ⁰ (J = 3/2)।
            • uds: ল্যাম্বডা Λ (I = 0, J = 1/2, ভর ১১১৫.৬৮ MeV) বনাম সিগমা Σ⁰ (I = 1, J = 1/2, ভর ১১৯২.৬৪ MeV)।
            • uuu: পাউলির অপবর্জন নীতির কারণে তিন অভিন্ন ফার্মিয়ন কেবল সিমেট্রিক স্পিন 3/2 অবস্থাতেই Δ⁺⁺ তৈরি করতে পারে।
          `
        },
        {
          headingBn: 'এক্সোটিক মাল্টিকোয়ার্কের বর্তমান অবস্থা',
          headingEn: 'Status of Exotic Multiquarks',
          contentBn: `
            ২০০৩ সালে Belle পরীক্ষায় X(3872) আবিষ্কারের মাধ্যমে এক্সোটিক হ্যাড্রন ফিজিক্সের নতুন যুগ শুরু হয়। 
            পরবর্তীতে LHCb ২০১৫ ও ২০১৯ সালে Pc পেন্টাকোয়ার্ক এবং ২০২১ সালে প্রথম ডাবল-চার্ম টেট্রাকোয়ার্ক T_cc⁺ আবিষ্কার করে। 
            এই কণাগুলোর অস্তিত্ব পরীক্ষাগারে অকাট্যভাবে প্রমাণিত (T1), তবে এদের অভ্যন্তরীণ বিন্যাস হ্যাড্রনিক মলিকিউল নাকি কম্প্যাক্ট মাল্টিকোয়ার্ক তা নিয়ে তত্ত্বীয় বিতর্ক এখনো অব্যাহত।
          `
        }
      ]
    });
  }

  destroy() {
    if (this.viewEl && this.viewEl.parentNode) {
      this.viewEl.parentNode.removeChild(this.viewEl);
    }
  }
}
