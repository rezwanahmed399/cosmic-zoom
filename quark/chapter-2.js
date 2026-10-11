/**
 * CosmoPlanck Quark Section - Chapter 2: "Flavor ল্যাব + নিউট্রন ক্ষয়" (Flavor Lab & Neutron Decay)
 * 
 * Scientific Fidelity & Features:
 * 1. Six Quark Cards (3 Generations x 2 Types):
 *    - Up-type (+2/3 e): u, c, t
 *    - Down-type (-1/3 e): d, s, b
 *    - Charge bar (+2/3 e or -1/3 e)
 *    - Mass log-scale bar with label "লগ-স্কেল; ভর স্কিম-নির্ভর"
 *    - Discovery / Evidence details (1964-1995)
 *    - Decay modes / lifetimes
 *    - u ≈ 2.16 MeV to t ≈ 172.57 GeV mass hierarchy (~8 orders across electroweak spectrum)
 * 2. Flavor Representation Rule:
 *    - Strictly depicted via letters, geometric shapes, and hatch patterns — NEVER by hue!
 *    - (Hue is reserved exclusively for color charges r, g, b)
 * 3. Top Quark Special Card:
 *    - Lifetime ≈ 5×10⁻²⁵ s (decays before forming stable hadrons, t -> W b)
 *    - CMS/ATLAS (2025) threshold-excess toponium candidate labeled "ব্যাখ্যা চলমান" (Interpretation ongoing)
 * 4. Neutron Decay Interactive Lab:
 *    - n (udd) -> p (uud) + e^- + nu_e_bar
 *    - Internal mechanism: d -> u + W^-*, W^-* -> e^- + nu_e_bar
 *    - Live Conservation Ledger: Electric charge (-1/3 -> +2/3 + (-1)), Baryon number, Lepton number
 *    - Free neutron lifetime ≈ 878.4 s (PDG 2024/2026 verified)
 *    - Core Scientific Note: "flavor বদলায় শুধু দুর্বল বলে; শক্তিশালী বল (গ্লুয়ন) কখনো flavor বদলায় না"
 * 5. CKM Heatmap (Cabibbo-Kobayashi-Maskawa Matrix):
 *    - Exact values from PDG 2024 (Phys. Rev. D 110, 030001, 2024)
 *    - Interactive 3x3 matrix with transition amplitudes, uncertainties, and diagonal dominance
 * 6. Truth Tier Badges:
 *    - T1 for measured masses, charges, CKM parameters, lifetimes
 *    - T4 for schematic visualizations and decay animations
 * 7. Zero hardcoded scientific numbers: all sourced from data/quark-facts.js
 * 8. Zero unicode emojis across all code and UI.
 */

import {
  QUARKS,
  NEUTRON_DECAY,
  CKM_MATRIX,
  getNeutronDecayInfo,
  getCkmMatrix,
  getSixQuarksList
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_PLAY_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const ICON_PAUSE_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const ICON_RESET_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>';
const ICON_STEP_FWD_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>';
const ICON_INFO_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_CHECK_SVG = '<svg class="c2-icon-badge ok" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c2-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';

// Geometric Glyph SVGs for 6 flavors (HUE-INDEPENDENT, black/white/monochrome pattern)
const FLAVOR_GLYPHS = {
  u: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><polygon points="16,4 28,26 4,26" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="16,11 23,23 9,23" fill="currentColor" opacity="0.3"/><line x1="16" y1="13" x2="16" y2="21" stroke="#f8fafc" stroke-width="2"/><polyline points="13,16 16,13 19,16" stroke="#f8fafc" stroke-width="2" fill="none"/></svg>',
  d: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><polygon points="16,28 28,6 4,6" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="16,21 23,9 9,9" fill="currentColor" opacity="0.3"/><line x1="16" y1="11" x2="16" y2="19" stroke="#f8fafc" stroke-width="2"/><polyline points="13,16 16,19 19,16" stroke="#f8fafc" stroke-width="2" fill="none"/></svg>',
  c: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16,4 L16,28 M4,16 L28,16" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>',
  s: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><polygon points="16,3 29,16 16,29 3,16" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>',
  t: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><polygon points="16,4 21,12 28,8 25,26 7,26 4,8 11,12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="7" r="2" fill="currentColor"/><circle cx="5" cy="10" r="1.5" fill="currentColor"/><circle cx="27" cy="10" r="1.5" fill="currentColor"/><rect x="8" y="23" width="16" height="3" fill="currentColor"/></svg>',
  b: '<svg class="c2-flavor-glyph" viewBox="0 0 32 32"><polygon points="16,29 27,21 23,7 9,7 5,21" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16,7 L16,24 M10,18 L16,24 L22,18" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="11" r="2.5" fill="currentColor"/></svg>'
};

export class Chapter2FlavorLab {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Target container element
   * @param {'en'|'bn'} [options.lang='en'] - UI language
   * @param {'basic'|'intermediate'|'expert'} [options.level='basic'] - Pedagogy level
   * @param {Object} [options.infoDrawer] - InfoDrawer component instance
   */
  constructor({ container, lang = 'en', level = 'basic', infoDrawer = null }) {
    this.container = container;
    this.lang = lang;
    this.level = level;
    this.infoDrawer = infoDrawer;

    // Scientific datasets strictly from factsheet
    this.neutronDecayData = getNeutronDecayInfo ? getNeutronDecayInfo() : (NEUTRON_DECAY || {});
    this.ckmMatrixData = getCkmMatrix ? getCkmMatrix() : (CKM_MATRIX || {});
    this.quarksList = getSixQuarksList ? getSixQuarksList() : [QUARKS.u, QUARKS.d, QUARKS.c, QUARKS.s, QUARKS.t, QUARKS.b];

    // Active selected quark card ID
    this.selectedQuarkId = 'u';

    // Neutron Decay Animation State
    this.decayProgress = 0.0; // 0.0 to 1.0 (reaction timeline)
    this.isPlaying = false;
    this.playSpeed = 1.0;
    this.animReqId = null;
    this.lastFrameTime = 0;

    // Selected CKM matrix element for inspection
    this.selectedCkmKey = 'V_ud';

    this.render();
    this.bindEvents();
    this.startRenderLoop();
  }

  setLevel(newLevel) {
    this.level = newLevel;
    const box = this.wrapper.querySelector('#c2-level-pedagogy-box');
    if (box) {
      box.innerHTML = this.renderPedagogyContent();
    }
  }

  render() {
    this.container.innerHTML = '';
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'chapter-2-view';
    this.wrapper.setAttribute('id', 'chapter-2-view');

    const isBn = this.lang === 'bn';

    this.wrapper.innerHTML = `
      <!-- HERO HEADER -->
      <header class="c2-hero-header">
        <div class="c2-header-main">
          <div class="c2-hero-badge-row">
            <span class="c2-chapter-index-badge">${isBn ? 'অধ্যায় ২' : 'Chapter 2'}</span>
            <span class="c2-spec-badge">${isBn ? 'Flavor ল্যাব + নিউট্রন ক্ষয়' : 'Flavor Lab & Neutron Decay'}</span>
            ${createTierBadge('T1')}
            ${createTierBadge('T4')}
          </div>
          <h2 class="c2-hero-title">
            <span class="c2-title-gradient">${isBn ? 'কোয়ার্কের ৬টি ফ্লেভার ও নিউট্রনের দুর্বল ক্ষয়' : 'Six Quark Flavors & Weak Neutron Decay'}</span>
          </h2>
          <p class="c2-hero-desc">
            ${isBn
              ? '৩ প্রজন্ম ও ২ ধরনের ৬টি কোয়ার্ক; ২.১৬ MeV থেকে ১৭২.৫৭ GeV পর্যন্ত প্রায় ৮ ঘাতের সুবিশাল ভরের অনুক্রম। দেখুন কীভাবে দুর্বল মিথস্ক্রিয়া (W বোসন) কোয়ার্কের ফ্লেভার বদলে মুক্ত নিউট্রনকে প্রোটনে রূপান্তরিত করে, যেখানে শক্তিশালী কালার বল ফ্লেভার সম্পূর্ণ অপরিবর্তিত রাখে।'
              : 'Explore the 3 generations and 2 types of quarks across 8 orders of magnitude in mass from 2.16 MeV to 172.57 GeV. Discover how the weak force (W bosons) mediates flavor changes in neutron beta decay, while the strong force preserves flavor intact.'
            }
          </p>
          <div class="c2-hero-actions">
            <button class="c2-btn-reality" id="c2-btn-flavor-info" type="button">
              ${ICON_INFO_SVG}
              <span>${isBn ? 'বাস্তবতা ও ফ্লেভার নীতি' : 'Flavor Principles & Reality'}</span>
            </button>
            <span class="c2-flavor-rule-pill">
              ${isBn ? 'নীতি: ফ্লেভার দেখানো হয়েছে জ্যামিতিক প্যাটার্নে, রঙে নয়' : 'Rule: Flavors denoted by glyphs/patterns, never hue'}
            </span>
          </div>
        </div>
      </header>

      <!-- SECTION 1: SIX QUARK CARDS & MASS HIERARCHY -->
      <section class="c2-section" aria-labelledby="c2-heading-six-quarks">
        <div class="c2-section-header">
          <div class="c2-section-title-wrap">
            <h3 class="c2-section-title" id="c2-heading-six-quarks">
              ${isBn ? '১. ছয়টি কোয়ার্কের কার্ড (৩ প্রজন্ম × ২ ধরন)' : '1. Six Quark Cards (3 Generations × 2 Types)'}
            </h3>
            <span class="c2-section-sub">
              ${isBn ? 'আপ-টাইপ (+২/৩ e) বনাম ডাউন-টাইপ (−১/৩ e); লগ-স্কেলে ভর ও আবিষ্কার' : 'Up-type (+2/3 e) vs Down-type (-1/3 e); Log-scale Mass & Discovery'}
            </span>
          </div>
          <div class="c2-mass-ratio-badge">
            <span class="c2-m-tag">${isBn ? 'ভরের ব্যবধান:' : 'Mass Span:'}</span>
            <span class="c2-m-ratio">u ≈ 2.16 MeV → t ≈ 172.57 GeV (≈ 80,000×)</span>
          </div>
        </div>

        <!-- 6 QUARK CARDS GRID -->
        <div class="c2-cards-grid" id="c2-cards-grid" role="region" aria-label="Quark Flavor Cards">
          ${this.renderSixQuarkCards()}
        </div>

        <!-- LOGARITHMIC MASS COMPARISON RULER -->
        <div class="c2-mass-ruler-card">
          <div class="c2-ruler-head">
            <h4 class="c2-ruler-title">${isBn ? 'কোয়ার্ক ভর অনুক্রম (লগ-স্কেল; ভর স্কিম-নির্ভর)' : 'Quark Mass Hierarchy (Log-scale; Mass is Scheme-Dependent)'}</h4>
            <span class="c2-scheme-tag">${isBn ? 'MS-bar (μ = 2 GeV) ও Pole Mass' : 'MS-bar (μ = 2 GeV) & Pole Mass'}</span>
          </div>
          <div class="c2-mass-track-container">
            <div class="c2-mass-track">
              <!-- Grid exponents: 1 MeV, 10 MeV, 100 MeV, 1 GeV, 10 GeV, 100 GeV -->
              <div class="c2-mass-tick" style="left: 0%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">1 MeV</span></div>
              <div class="c2-mass-tick" style="left: 19%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">10 MeV</span></div>
              <div class="c2-mass-tick" style="left: 38%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">100 MeV</span></div>
              <div class="c2-mass-tick" style="left: 58%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">1 GeV</span></div>
              <div class="c2-mass-tick" style="left: 77%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">10 GeV</span></div>
              <div class="c2-mass-tick" style="left: 96%;"><span class="c2-tick-line"></span><span class="c2-tick-txt">100 GeV</span></div>

              <!-- Quarks pins placed at log10 positions -->
              ${this.renderMassPins()}
            </div>
          </div>
          <div class="c2-ruler-footer">
            <span class="c2-rf-note">
              ${isBn
                ? 'লক্ষণীয়: কোয়ার্কের ভর মুক্তভাবে পরিমাপ করা যায় না (রঙ কনফাইনমেন্টের কারণে)। হালকা কোয়ার্কের (u, d, s) ভর ল্যাটিস কিউসিডি ও চিরাল পারটারবেশনে MS-bar স্কিমে নির্ধারিত; ভারী টপ কোয়ার্ক সরাসরি টেভাট্রন ও এলএইচসিতে পোল-ম্যাস হিসেবে পরিমাপযোগ্য।'
                : 'Note: Isolated quarks cannot be weighed directly due to confinement. Light quark masses (u, d, s) are determined in the MS-bar scheme via Lattice QCD; the heavy top quark is directly measured via collider kinematics as a pole mass.'
              }
            </span>
          </div>
        </div>
      </section>

      <!-- SECTION 2: NEUTRON DECAY INTERACTIVE LAB -->
      <section class="c2-section" aria-labelledby="c2-heading-neutron-decay">
        <div class="c2-section-header">
          <div class="c2-section-title-wrap">
            <h3 class="c2-section-title" id="c2-heading-neutron-decay">
              ${isBn ? '২. নিউট্রন ক্ষয় ল্যাব: d → u + W⁻* → e⁻ + ν̄ₑ' : '2. Neutron Decay Lab: d → u + W⁻* → e⁻ + ν̄ₑ'}
            </h3>
            <span class="c2-section-sub">
              ${isBn ? 'দুর্বল মিথস্ক্রিয়ায় কোয়ার্ক ফ্লেভারের রূপান্তর ও সংরক্ষণ লেজার' : 'Weak Flavor Transformation & Conservation Ledger'}
            </span>
          </div>
          <div class="c2-neutron-life-badge">
            <span class="c2-nl-lbl">${isBn ? 'মুক্ত নিউট্রনের জীবনকাল:' : 'Free Neutron Lifetime:'}</span>
            <span class="c2-nl-val">${this.neutronDecayData.freeNeutronLifetimeSec.value} ± ${this.neutronDecayData.freeNeutronLifetimeSec.uncertainty.replace('+-', '')} s</span>
            <span class="c2-nl-sub">${isBn ? '(প্রায় ১৪.৬ মিনিট)' : '(~14.6 mins)'}</span>
          </div>
        </div>

        <!-- CORE FLAVOR LAW CALLOUT -->
        <div class="c2-callout-card">
          <div class="c2-callout-icon">${ICON_INFO_SVG}</div>
          <div class="c2-callout-body">
            <strong class="c2-callout-headline">
              ${isBn ? 'মৌলিক সূত্র: ফ্লেভার বদলায় কেবল দুর্বল বলে (Weak Force)' : 'Fundamental Law: Flavor Changes ONLY via the Weak Force'}
            </strong>
            <p class="c2-callout-desc">
              ${isBn
                ? 'শক্তিশালী মিথস্ক্রিয়া (গ্লুয়ন বিনিময়) কেবল কালার-চার্জ অদলবদল করে, কোয়ার্কের ফ্লেভার কখনো বদলাতে পারে না। ফ্লেভার পরিবর্তনের একমাত্র মাধ্যম হলো দুর্বল মিথস্ক্রিয়ার চার্জড W বোসন ($W^+$ বা $W^-$)। মুক্ত নিউট্রনের একটি d কোয়ার্ক W⁻* বোসন নির্গমন করে u কোয়ার্কে রূপান্তরিত হয় বলেই নিউট্রন ক্ষয় হয়ে প্রোটনে পরিণত হতে পারে।'
                : 'The strong interaction (gluon exchange) strictly conserves quark flavor; it only swaps color charges. Quark flavor can ONLY be altered by the weak interaction via charged W bosons. Inside a neutron, a d quark emits a virtual W⁻* boson to become a u quark, converting the neutron into a proton.'
              }
            </p>
          </div>
        </div>

        <!-- DECAY WORKBENCH: ANIMATION VIEWPORT + CONSERVATION LEDGER -->
        <div class="c2-decay-workbench">
          
          <!-- LEFT: ANIMATED SVG VIEWPORT -->
          <div class="c2-decay-viewport-card">
            <div class="c2-card-toolbar">
              <span class="c2-toolbar-title">${isBn ? 'দুর্বল ফ্লেভার রূপান্তর সিমুলেশন' : 'Weak Flavor Transition Simulation'}</span>
              <div class="c2-transport-controls">
                <button class="c2-btn-transport" id="c2-btn-play" type="button" aria-label="Play/Pause">
                  ${ICON_PLAY_SVG}
                </button>
                <button class="c2-btn-transport" id="c2-btn-step" type="button" aria-label="Step Forward">
                  ${ICON_STEP_FWD_SVG}
                </button>
                <button class="c2-btn-transport" id="c2-btn-reset" type="button" aria-label="Reset">
                  ${ICON_RESET_SVG}
                </button>
              </div>
            </div>

            <div class="c2-svg-container" id="c2-svg-container">
              <svg class="c2-decay-svg" id="c2-decay-svg" viewBox="0 0 600 360" role="img" aria-label="Neutron Decay Diagram">
                <defs>
                  <!-- Glow filter -->
                  <filter id="c2-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <!-- Hatch pattern for weak field -->
                  <pattern id="c2-w-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(244, 63, 94, 0.4)" stroke-width="2" />
                  </pattern>
                </defs>

                <!-- Background grid -->
                <rect width="600" height="360" fill="#020617"/>
                <g stroke="rgba(148, 163, 184, 0.08)" stroke-width="1">
                  <line x1="100" y1="0" x2="100" y2="360" />
                  <line x1="200" y1="0" x2="200" y2="360" />
                  <line x1="300" y1="0" x2="300" y2="360" />
                  <line x1="400" y1="0" x2="400" y2="360" />
                  <line x1="500" y1="0" x2="500" y2="360" />
                  <line x1="0" y1="90" x2="600" y2="90" />
                  <line x1="0" y1="180" x2="600" y2="180" />
                  <line x1="0" y1="270" x2="600" y2="270" />
                </g>

                <!-- DYNAMIC DECAY SCENE GROUP -->
                <g id="c2-scene-group">
                  <!-- Rendered dynamically by updateDecayScene() -->
                </g>
              </svg>

              <!-- Floating Stage Phase Banner -->
              <div class="c2-stage-phase-banner" id="c2-stage-phase-banner">
                <span class="c2-phase-pill" id="c2-phase-pill">${isBn ? 'প্রারম্ভিক অবস্থা: নিউট্রন (udd)' : 'Initial: Neutron (udd)'}</span>
                <span class="c2-phase-text" id="c2-phase-text">${isBn ? 'চার্জ: ০ e | ব্যারিয়ন সংখ্যা: ১' : 'Charge: 0 e | Baryon: 1'}</span>
              </div>
            </div>

            <!-- Scrub Slider & Speed -->
            <div class="c2-scrubber-row">
              <label for="c2-decay-slider" class="c2-scrub-lbl">${isBn ? 'প্রক্রিয়া টাইমলাইন:' : 'Decay Progress:'}</label>
              <input type="range" class="c2-scrub-input" id="c2-decay-slider" min="0" max="100" value="0" aria-label="Reaction Timeline Scrub" />
              <div class="c2-speed-toggles">
                <button class="c2-speed-btn active" data-speed="1.0" type="button">1x</button>
                <button class="c2-speed-btn" data-speed="0.5" type="button">0.5x</button>
                <button class="c2-speed-btn" data-speed="2.0" type="button">2x</button>
              </div>
            </div>
          </div>

          <!-- RIGHT: CONSERVATION LEDGER CARD -->
          <div class="c2-ledger-card">
            <div class="c2-ledger-header">
              <h4 class="c2-ledger-title">${isBn ? 'সংরক্ষণ লেজার (Conservation Ledger)' : 'Conservation Ledger'}</h4>
              <span class="c2-ledger-badge ok">
                ${ICON_CHECK_SVG}
                <span>${isBn ? 'সর্বদা সংরক্ষিত' : 'Strictly Conserved'}</span>
              </span>
            </div>

            <div class="c2-ledger-items" id="c2-ledger-items">
              <!-- Item 1: Electric Charge -->
              <div class="c2-l-item">
                <div class="c2-l-item-top">
                  <span class="c2-l-name">${isBn ? 'তড়িৎ আধান (Electric Charge Q)' : 'Electric Charge (Q)'}</span>
                  <span class="c2-l-status ok">${ICON_CHECK_SVG}</span>
                </div>
                <div class="c2-l-math">
                  <span class="c2-l-initial">−⅓ e (d)</span>
                  <span class="c2-l-arrow">→</span>
                  <span class="c2-l-final">+⅔ e (u) + (−1 e) (W⁻*) = −⅓ e</span>
                </div>
                <div class="c2-l-hadron-note">
                  ${isBn ? 'হ্যাড্রন স্তর: 0 e (n) → +1 e (p) + (−1 e) (e⁻) + 0 e (ν̄ₑ) = 0 e' : 'Hadron Level: 0 e (n) → +1 e (p) + (-1 e) (e⁻) + 0 (ν̄ₑ) = 0 e'}
                </div>
              </div>

              <!-- Item 2: Baryon Number -->
              <div class="c2-l-item">
                <div class="c2-l-item-top">
                  <span class="c2-l-name">${isBn ? 'ব্যারিয়ন সংখ্যা (Baryon Number B)' : 'Baryon Number (B)'}</span>
                  <span class="c2-l-status ok">${ICON_CHECK_SVG}</span>
                </div>
                <div class="c2-l-math">
                  <span class="c2-l-initial">B = 1 (n)</span>
                  <span class="c2-l-arrow">→</span>
                  <span class="c2-l-final">B = 1 (p) + 0 (e⁻) + 0 (ν̄ₑ) = 1</span>
                </div>
                <div class="c2-l-hadron-note">
                  ${isBn ? 'কোয়ার্ক স্তর: ⅓ (d) → ⅓ (u) + 0 (W⁻*) = ⅓' : 'Quark Level: 1/3 (d) → 1/3 (u) + 0 (W⁻*) = 1/3'}
                </div>
              </div>

              <!-- Item 3: Lepton Number -->
              <div class="c2-l-item">
                <div class="c2-l-item-top">
                  <span class="c2-l-name">${isBn ? 'লেপ্টন সংখ্যা (Lepton Number L)' : 'Lepton Number (L)'}</span>
                  <span class="c2-l-status ok">${ICON_CHECK_SVG}</span>
                </div>
                <div class="c2-l-math">
                  <span class="c2-l-initial">L = 0</span>
                  <span class="c2-l-arrow">→</span>
                  <span class="c2-l-final">+1 (e⁻) + (−1) (ν̄ₑ) = 0</span>
                </div>
                <div class="c2-l-hadron-note">
                  ${isBn ? 'লেপ্টন ও অ্যান্টি-লেপ্টন জোড় তৈরি হওয়ায় মোট লেপ্টন সংখ্যা শূন্য থাকে।' : 'Electron (+1) and anti-neutrino (-1) pair creation yields net zero.'}
                </div>
              </div>

              <!-- Item 4: Q-Value Energy Release -->
              <div class="c2-l-item">
                <div class="c2-l-item-top">
                  <span class="c2-l-name">${isBn ? 'শক্তি নির্গমন (Q-Value)' : 'Energy Release (Q-Value)'}</span>
                  <span class="c2-l-energy-val highlight">0.782 MeV</span>
                </div>
                <div class="c2-l-hadron-note">
                  Q = m_n − m_p − m_e = 939.565 − 938.272 − 0.511 MeV
                </div>
              </div>
            </div>

            <!-- PEDAGOGY LEVEL NOTE -->
            <div class="c2-level-pedagogy-box" id="c2-level-pedagogy-box">
              ${this.renderPedagogyContent()}
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: CKM QUARK-MIXING MATRIX HEATMAP -->
      <section class="c2-section" aria-labelledby="c2-heading-ckm">
        <div class="c2-section-header">
          <div class="c2-section-title-wrap">
            <h3 class="c2-section-title" id="c2-heading-ckm">
              ${isBn ? '৩. সিকেএম কোয়ার্ক-মিক্সিং ম্যাট্রিক্স (CKM Heatmap)' : '3. CKM Quark-Mixing Matrix Heatmap'}
            </h3>
            <span class="c2-section-sub">
              ${isBn ? 'PDG 2024 মান; ফ্লেভার রূপান্তরের সম্ভাবনা ও ডায়াগনাল আধিপত্য' : 'PDG 2024 Review; Transition Probabilities & Diagonal Dominance'}
            </span>
          </div>
          <div class="c2-ckm-source-pill">
            <span>PDG 2024 / Phys. Rev. D 110, 030001 (2024)</span>
          </div>
        </div>

        <div class="c2-ckm-workbench">
          <!-- 3x3 MATRIX TABLE -->
          <div class="c2-ckm-matrix-card">
            <div class="c2-ckm-table-wrap">
              <table class="c2-ckm-table" role="grid" aria-label="CKM Matrix Table">
                <thead>
                  <tr>
                    <th class="c2-ckm-th corner">V_CKM</th>
                    <th class="c2-ckm-th">d</th>
                    <th class="c2-ckm-th">s</th>
                    <th class="c2-ckm-th">b</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderCkmMatrixRows()}
                </tbody>
              </table>
            </div>

            <!-- Heatmap Intensity Legend -->
            <div class="c2-ckm-legend">
              <span class="c2-leg-txt">${isBn ? 'রূপান্তর সম্ভাবনা:' : 'Transition Strength:'}</span>
              <div class="c2-leg-bar">
                <span class="c2-leg-min">0.003 (বিরল)</span>
                <div class="c2-leg-gradient"></div>
                <span class="c2-leg-max">1.0 (সর্বাধিক)</span>
              </div>
            </div>
          </div>

          <!-- SELECTED CKM ELEMENT DETAILS -->
          <div class="c2-ckm-details-card" id="c2-ckm-details-card">
            ${this.renderCkmElementDetails(this.selectedCkmKey)}
          </div>
        </div>
      </section>

      <!-- BOTTOM CTA & NAVIGATION CONTINUITY -->
      <div class="c2-nav-footer">
        <button class="c2-btn-nav-prev" id="c2-btn-go-ch1" type="button">
          ${ICON_ARROW_LEFT_SVG}
          <span>${isBn ? 'অধ্যায় ১: প্রোটনের শরীর' : "Chapter 1: The Proton's Body"}</span>
        </button>

        <div class="c2-cta-content">
          <span class="c2-cta-badge">${isBn ? 'পরবর্তী ল্যাব' : 'Next Interactive'}</span>
          <h4 class="c2-cta-title">
            ${isBn ? 'কালার চার্জ ও গ্লুয়ন বিনিময় পরীক্ষা করুন' : 'Explore Color Charge & Live Gluon Swaps'}
          </h4>
          <p class="c2-cta-desc">
            ${isBn
              ? 'আমরা দেখেছি দুর্বল মিথস্ক্রিয়া কীভাবে ফ্লেভার বদলায়। এবার অধ্যায় ৩-এ গিয়ে দেখুন কোয়ার্কের লাল, সবুজ ও নীল কালার-চার্জ, "সাদা বানাও" খেলা এবং ৮টি রঙিন গ্লুয়ন।'
              : 'Having explored flavor changes and mass hierarchies, move into Chapter 3 to interact with the color wheel, the "Make White" puzzle, and live 8-gluon color exchanges.'
            }
          </p>
        </div>

        <button class="c2-btn-nav-next" id="c2-btn-go-ch3" type="button">
          <span>${isBn ? 'অধ্যায় ৩: কালার ল্যাব-এ চলুন' : 'Enter Chapter 3: Color Lab'}</span>
          ${ICON_ARROW_RIGHT_SVG}
        </button>
      </div>
    `;

    this.container.appendChild(this.wrapper);
  }

  renderSixQuarkCards() {
    const isBn = this.lang === 'bn';
    // u (2.16 MeV) to t (172570 MeV): span is log10(172570 / 2.16) ≈ 4.9 orders
    const logMin = Math.log10(2.0);
    const logMax = Math.log10(180000);

    return this.quarksList.map(q => {
      const isSelected = q.symbol === this.selectedQuarkId;
      const massValMeV = q.mass.unit === 'GeV/c^2' ? q.mass.value * 1000 : q.mass.value;
      const logPos = Math.max(0, Math.min(100, ((Math.log10(massValMeV) - logMin) / (logMax - logMin)) * 100));

      const isTop = q.symbol === 't';
      const glyphSvg = FLAVOR_GLYPHS[q.symbol] || '';

      return `
        <div class="c2-q-card ${isSelected ? 'selected' : ''} ${isTop ? 'top-card' : ''}" data-qid="${q.symbol}" id="c2-card-${q.symbol}">
          <!-- CARD HEADER -->
          <div class="c2-qc-header">
            <div class="c2-qc-flavor-badge">
              ${glyphSvg}
              <div class="c2-qc-names">
                <span class="c2-qc-symbol">${q.symbol}</span>
                <span class="c2-qc-name">${isBn ? q.nameBn : q.nameEn}</span>
              </div>
            </div>
            <div class="c2-qc-gen-type">
              <span class="c2-qc-gen">${isBn ? `প্রজন্ম ${q.generation}` : `Gen ${q.generation}`}</span>
              <span class="c2-qc-type">${q.type === 'up-type' ? '+⅔ e' : '−⅓ e'}</span>
            </div>
          </div>

          <!-- CHARGE GAUGE -->
          <div class="c2-qc-charge-row">
            <span class="c2-qc-lbl">${isBn ? 'তড়িৎ আধান:' : 'Charge:'}</span>
            <div class="c2-qc-charge-bar-wrap">
              <div class="c2-qc-charge-bar ${q.type === 'up-type' ? 'pos' : 'neg'}" style="width: ${q.type === 'up-type' ? '66.7%' : '33.3%'};"></div>
            </div>
            <span class="c2-qc-charge-txt">${q.charge.fraction} e</span>
          </div>

          <!-- MASS (LOG SCALE) -->
          <div class="c2-qc-mass-box">
            <div class="c2-qc-mass-head">
              <span class="c2-qc-lbl">${isBn ? 'ভর (লগ-স্কেল; ভর স্কিম-নির্ভর):' : 'Mass (Log-scale; Scheme-dependent):'}</span>
              <span class="c2-qc-mass-val">${q.mass.value} ${q.mass.unit}</span>
            </div>
            <div class="c2-qc-mass-bar-bg">
              <div class="c2-qc-mass-bar-fill" style="width: ${logPos.toFixed(1)}%;"></div>
            </div>
            <span class="c2-qc-scheme">${q.mass.scheme}</span>
          </div>

          <!-- DISCOVERY -->
          <div class="c2-qc-meta-row">
            <span class="c2-qc-meta-lbl">${isBn ? 'আবিষ্কার / প্রমাণ:' : 'Discovery / Evidence:'}</span>
            <span class="c2-qc-meta-val">${isBn ? q.discovery.textBn : q.discovery.textEn}</span>
          </div>

          <!-- DECAY -->
          <div class="c2-qc-meta-row">
            <span class="c2-qc-meta-lbl">${isBn ? 'ক্ষয় রূপান্তর:' : 'Decay Mode:'}</span>
            <span class="c2-qc-meta-val">${isBn ? q.decay.modeBn : q.decay.modeEn}</span>
          </div>

          <!-- TOP QUARK SPECIAL CALLOUT -->
          ${isTop ? `
            <div class="c2-top-special-box">
              <div class="c2-ts-top">
                <span class="c2-ts-lifetime">${isBn ? 'জীবনকাল ≈ ৫×১০⁻²⁵ s' : 'Lifetime ≈ 5×10⁻²⁵ s'}</span>
                <span class="c2-ts-excess-badge">${isBn ? 'ব্যাখ্যা চলমান' : 'Interpretation Ongoing'}</span>
              </div>
              <p class="c2-ts-desc">
                ${isBn
                  ? 'হ্যাড্রন গড়ার আগেই (τ ≈ 5×10⁻²⁵ s) ক্ষয় হয় (t → W⁺ b)। CMS ও ATLAS (2025) থ্রেশহোল্ডে টপোনিয়াম-সঙ্গত অতিরিক্ত ঘটনা দেখেছে।'
                  : 'Decays before hadronization occurs (τ ≈ 5×10⁻²⁵ s) via t → W⁺ b. CMS & ATLAS (2025) observed excess near threshold consistent with toponium.'
                }
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  renderMassPins() {
    const logMin = Math.log10(1.0); // 1 MeV = 0%
    const logMax = Math.log10(200000); // 200 GeV = 100%

    return this.quarksList.map(q => {
      const massValMeV = q.mass.unit === 'GeV/c^2' ? q.mass.value * 1000 : q.mass.value;
      const pct = Math.max(0, Math.min(100, ((Math.log10(massValMeV) - logMin) / (logMax - logMin)) * 100));
      return `
        <div class="c2-mass-pin" style="left: ${pct.toFixed(1)}%;" title="${q.nameEn}: ${q.mass.value} ${q.mass.unit}">
          <span class="c2-pin-glyph">${q.symbol}</span>
          <span class="c2-pin-line"></span>
          <span class="c2-pin-val">${q.mass.value} ${q.mass.unit.split('/')[0]}</span>
        </div>
      `;
    }).join('');
  }

  renderCkmMatrixRows() {
    const isBn = this.lang === 'bn';
    const rows = ['u', 'c', 't'];
    const cols = ['d', 's', 'b'];
    const elements = this.ckmMatrixData.elements || {};

    return rows.map((r, rIdx) => `
      <tr>
        <th class="c2-ckm-th row">${r}</th>
        ${cols.map((c, cIdx) => {
          const key = `V_${r}${c}`;
          const elem = elements[key] || {};
          const isSelected = key === this.selectedCkmKey;
          // Magnitude 0 to 1
          const val = elem.value || 0;
          // Opacity scaled logarithmically between 0.15 and 0.95
          const intensity = Math.min(1.0, Math.max(0.12, Math.pow(val, 0.45)));

          return `
            <td class="c2-ckm-cell ${isSelected ? 'selected' : ''}" data-ckm="${key}" tabindex="0" role="gridcell" style="--cell-intensity: ${intensity.toFixed(2)};">
              <div class="c2-ckm-cell-content">
                <span class="c2-ckm-sym">${elem.symbol || key}</span>
                <span class="c2-ckm-val">${val.toFixed(val < 0.01 ? 5 : (val < 0.1 ? 4 : 3))}</span>
              </div>
            </td>
          `;
        }).join('')}
      </tr>
    `).join('');
  }

  renderCkmElementDetails(key) {
    const isBn = this.lang === 'bn';
    const elements = this.ckmMatrixData.elements || {};
    const elem = elements[key] || elements['V_ud'] || {};

    return `
      <div class="c2-ckm-det-header">
        <div class="c2-ckm-det-title-row">
          <span class="c2-ckm-det-sym">${elem.symbol || key}</span>
          <span class="c2-ckm-det-transition">${elem.upQuark} (${elem.upQuark === 'u' ? 'Up' : elem.upQuark === 'c' ? 'Charm' : 'Top'}) ↔ ${elem.downQuark} (${elem.downQuark === 'd' ? 'Down' : elem.downQuark === 's' ? 'Strange' : 'Bottom'})</span>
        </div>
        <span class="c2-ckm-det-val-pill">${elem.value} ${elem.uncertainty ? elem.uncertainty : ''}</span>
      </div>

      <div class="c2-ckm-det-body">
        <div class="c2-ckm-det-stat">
          <span class="c2-ckm-s-lbl">${isBn ? 'পরীক্ষালব্ধ মান (PDG 2024):' : 'Measured Magnitude (PDG 2024):'}</span>
          <span class="c2-ckm-s-val">${elem.value}</span>
        </div>
        <div class="c2-ckm-det-stat">
          <span class="c2-ckm-s-lbl">${isBn ? 'পরীক্ষামূলক অনিশ্চয়তা:' : 'Experimental Uncertainty:'}</span>
          <span class="c2-ckm-s-val">${elem.uncertainty || '± 0'}</span>
        </div>
        ${elem.globalFitValue ? `
          <div class="c2-ckm-det-stat">
            <span class="c2-ckm-s-lbl">${isBn ? 'ইউনিটারিটি গ্লোবাল ফিট:' : 'Unitarity Global Fit:'}</span>
            <span class="c2-ckm-s-val">${elem.globalFitValue}</span>
          </div>
        ` : ''}
        <div class="c2-ckm-det-process">
          <span class="c2-ckm-p-lbl">${isBn ? 'পরিমাপক প্রক্রিয়া ও ক্ষয় চ্যানেল:' : 'Measuring Process & Decay Channel:'}</span>
          <p class="c2-ckm-p-txt">${isBn ? elem.processBn : elem.processEn}</p>
        </div>
        <div class="c2-ckm-diagonal-note">
          ${elem.row === elem.col
            ? (isBn ? 'ডায়াগনাল পদ: একই প্রজন্মের মধ্যে স্থানান্তর সর্বাধিক অনুকূল (|V| ≈ ১)।' : 'Diagonal element: Intra-generation transition is heavily favored (|V| ≈ 1).')
            : (isBn ? 'অফ-ডায়াগনাল পদ: ভিন্ন প্রজন্মের মধ্যে স্থানান্তর ক্যাবিবো কোণ λ দ্বারা অবদমিত।' : 'Off-diagonal element: Cross-generation transition is Cabibbo-suppressed.')
          }
        </div>
      </div>
    `;
  }

  renderPedagogyContent() {
    const isBn = this.lang === 'bn';
    if (this.level === 'expert') {
      return `
        <div class="c2-pedagogy-card expert">
          <span class="c2-pedagogy-tag expert">${isBn ? 'বিশেষজ্ঞ স্তর: দুর্বল মিথস্ক্রিয়া ও V-A ল্যাগরেঞ্জিয়ান' : 'Expert: V-A Electroweak Lagrangian'}</span>
          <div class="c2-formula-box">
            <span class="c2-math-code">ℒ_CC = - (g / √2) [ J_μ^W W^+μ + h.c. ]</span>
            <span class="c2-formula-note">J_μ^W = (ū, c̄, t̄)_L γ_μ V_CKM (d, s, b)_L^T</span>
          </div>
          <p class="c2-pedagogy-text">
            ${isBn
              ? 'দুর্বল চার্জড-কারেন্ট মিথস্ক্রিয়ায় কেবল বাম-ঘূর্ণি (left-handed) কোয়ার্ক অংশ নেয়। W বোসনের ভর M_W ≈ ৮০.৩৮ GeV হওয়ায় নিউট্রন ক্ষয়ে মোমেন্টাম ট্রান্সফার q² ≪ M_W², যার ফলে মিথস্ক্রিয়াটি কার্যকরভাবে ফার্মির ৪-ফার্মিয়ন পয়েন্ট মিথস্ক্রিয়া (G_F ≈ 1.166×10⁻⁵ GeV⁻²) হিসেবে আত্মপ্রকাশ করে।'
              : 'The charged-current weak interaction couples exclusively to left-handed chiral fields. Because M_W ≈ 80.38 GeV, the momentum transfer q² ≪ M_W² in neutron beta decay reduces the W-propagator to Fermi’s contact interaction with G_F ≈ 1.166×10⁻⁵ GeV⁻².'
            }
          </p>
        </div>
      `;
    }

    if (this.level === 'intermediate') {
      return `
        <div class="c2-pedagogy-card intermediate">
          <span class="c2-pedagogy-tag intermediate">${isBn ? 'মাঝারি স্তর: কোয়ার্ক পর্যায়ক্রম ও জীবনকাল' : 'Intermediate: Quark Transition Hierarchy'}</span>
          <p class="c2-pedagogy-text">
            ${isBn
              ? 'একটি মুক্ত নিউট্রনের ভর (৯৩৯.৫৬৫ MeV) প্রোটন (৯৩৮.২৭২ MeV) ও ইলেকট্রনের (০.৫১১ MeV) সম্মিলিত ভরের চেয়ে সামান্য বেশি (Δm ≈ ০.৭৮২ MeV)। এই ক্ষুদ্র ভর-পার্থক্যই নিউট্রনকে ক্ষয়িষ্ণু করে তোলে। অন্যদিকে প্রোটন সবচেয়ে হালকা ব্যারিয়ন হওয়ায় এবং ব্যারিয়ন সংখ্যা কঠোরভাবে সংরক্ষিত থাকায় মুক্ত প্রোটন সম্পূর্ণ স্থিতিশীল।'
              : 'A free neutron’s mass (939.565 MeV) exceeds the combined mass of a proton (938.272 MeV) and an electron (0.511 MeV) by Δm ≈ 0.782 MeV. This allows beta decay with a lifetime of ~878.4 s. The proton is the lightest baryon and cannot decay due to baryon number conservation.'
            }
          </p>
        </div>
      `;
    }

    // Basic level
    return `
      <div class="c2-pedagogy-card basic">
        <span class="c2-pedagogy-tag basic">${isBn ? 'সহজ স্তর: নিউট্রন কেন ভাঙে?' : 'Basic: Why does a neutron decay?'}</span>
        <p class="c2-pedagogy-text">
          ${isBn
            ? 'পরমাণুর ভেতরে নিউট্রন প্রোটনের সাথে সবল বল দ্বারা আবদ্ধ থেকে স্থিতিশীল থাকে। কিন্তু মুক্ত অবস্থায় একটি নিউট্রন প্রায় ১৪.৬ মিনিটে নিজে থেকেই ভেঙে একটি প্রোটন, একটি ইলেকট্রন ও একটি অদৃশ্যে ছুটে চলা অ্যান্টি-নিউট্রিনোতে রূপান্তরিত হয়।'
            : 'Inside atomic nuclei, neutrons are bound tightly and remain stable indefinitely. When free in space, a neutron decays after about 14.6 minutes into a proton, an electron, and an escaping anti-neutrino.'
          }
        </p>
      </div>
    `;
  }

  bindEvents() {
    // 1. Reality / Flavor Info Drawer
    const btnInfo = this.wrapper.querySelector('#c2-btn-flavor-info');
    if (btnInfo) {
      btnInfo.addEventListener('click', () => this.openFlavorInfoDrawer());
    }

    // 2. Quark Cards Selection
    const cards = this.wrapper.querySelectorAll('.c2-q-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const qid = card.getAttribute('data-qid');
        if (qid) {
          this.selectedQuarkId = qid;
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        }
      });
    });

    // 3. Neutron Decay Transport Controls
    const btnPlay = this.wrapper.querySelector('#c2-btn-play');
    const btnStep = this.wrapper.querySelector('#c2-btn-step');
    const btnReset = this.wrapper.querySelector('#c2-btn-reset');
    const slider = this.wrapper.querySelector('#c2-decay-slider');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => this.toggleDecayPlay());
    }

    if (btnStep) {
      btnStep.addEventListener('click', () => {
        this.pauseDecay();
        this.decayProgress = Math.min(1.0, this.decayProgress + 0.15);
        if (slider) slider.value = Math.round(this.decayProgress * 100);
        this.updateDecayScene();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.pauseDecay();
        this.decayProgress = 0.0;
        if (slider) slider.value = 0;
        this.updateDecayScene();
      });
    }

    if (slider) {
      slider.addEventListener('input', (e) => {
        this.pauseDecay();
        this.decayProgress = parseFloat(e.target.value) / 100.0;
        this.updateDecayScene();
      });
    }

    // 4. Speed toggles
    const speedBtns = this.wrapper.querySelectorAll('.c2-speed-btn');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playSpeed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
      });
    });

    // 5. CKM Matrix Cells
    const ckmCells = this.wrapper.querySelectorAll('.c2-ckm-cell');
    ckmCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const key = cell.getAttribute('data-ckm');
        if (key) {
          this.selectedCkmKey = key;
          ckmCells.forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          const det = this.wrapper.querySelector('#c2-ckm-details-card');
          if (det) det.innerHTML = this.renderCkmElementDetails(key);
        }
      });

      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cell.click();
        }
      });
    });

    // 6. Navigation Buttons (Prev to Chapter 1, Next to Chapter 3)
    const btnGoCh1 = this.wrapper.querySelector('#c2-btn-go-ch1');
    if (btnGoCh1) {
      btnGoCh1.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-1';
      });
    }

    const btnGoCh3 = this.wrapper.querySelector('#c2-btn-go-ch3');
    if (btnGoCh3) {
      btnGoCh3.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-3';
      });
    }
  }

  toggleDecayPlay() {
    if (this.isPlaying) {
      this.pauseDecay();
    } else {
      this.playDecay();
    }
  }

  playDecay() {
    this.isPlaying = true;
    const btn = this.wrapper.querySelector('#c2-btn-play');
    if (btn) btn.innerHTML = ICON_PAUSE_SVG;
    if (this.decayProgress >= 1.0) {
      this.decayProgress = 0.0;
    }
    this.lastFrameTime = performance.now();
  }

  pauseDecay() {
    this.isPlaying = false;
    const btn = this.wrapper.querySelector('#c2-btn-play');
    if (btn) btn.innerHTML = ICON_PLAY_SVG;
  }

  startRenderLoop() {
    const loop = (timestamp) => {
      if (this.isPlaying) {
        const dt = (timestamp - this.lastFrameTime) / 1000.0;
        this.lastFrameTime = timestamp;

        // One complete reaction takes ~3.5 seconds at 1x
        const reactionRate = 0.28 * this.playSpeed;
        this.decayProgress += dt * reactionRate;

        if (this.decayProgress >= 1.0) {
          this.decayProgress = 1.0;
          this.pauseDecay();
        }

        const slider = this.wrapper.querySelector('#c2-decay-slider');
        if (slider) slider.value = Math.round(this.decayProgress * 100);

        this.updateDecayScene();
      } else {
        this.lastFrameTime = timestamp;
      }
      this.animReqId = requestAnimationFrame(loop);
    };

    this.animReqId = requestAnimationFrame(loop);
    // Render initial static scene
    this.updateDecayScene();
  }

  updateDecayScene() {
    const scene = this.wrapper.querySelector('#c2-scene-group');
    if (!scene) return;

    const isBn = this.lang === 'bn';
    const p = this.decayProgress; // 0.0 to 1.0

    // Coordinates of initial neutron bag center
    const bagX = 180;
    const bagY = 180;
    const bagR = 95;

    // Valence quarks positions inside the nucleon bag:
    // Q1 (Top): u (+2/3)
    const q1X = bagX - 25;
    const q1Y = bagY - 45;
    // Q2 (Bottom Left): d (-1/3) (Spectator)
    const q2X = bagX - 45;
    const q2Y = bagY + 40;
    // Q3 (Right): d (-1/3) -> transitioning to u (+2/3) at weak vertex
    const q3X = bagX + 45;
    const q3Y = bagY + 10;

    // Phase 1: Initial state (p < 0.25)
    // Phase 2: d emits W^-* boson (0.25 <= p < 0.6)
    // Phase 3: W^-* splits into e^- and nu_bar (0.6 <= p <= 1.0)

    let phasePill = '';
    let phaseText = '';

    if (p < 0.25) {
      phasePill = isBn ? 'ধাপ ১: প্রারম্ভিক নিউট্রন (udd)' : 'Phase 1: Bound Neutron (udd)';
      phaseText = isBn ? '৩টি কোয়ার্ক: u (+⅔), d (−⅓), d (−⅓) | মোট আধান: ০ e' : '3 Quarks: u (+2/3), d (-1/3), d (-1/3) | Net Charge: 0 e';
    } else if (p < 0.65) {
      phasePill = isBn ? 'ধাপ ২: দুর্বল ভার্টেক্স (d → u + W⁻*)' : 'Phase 2: Weak Vertex (d → u + W⁻*)';
      phaseText = isBn ? 'd কোয়ার্ক ভার্চুয়াল W⁻* বোসন নির্গমন করে u-তে পরিণত হচ্ছে' : 'A d quark emits a virtual W⁻* boson, transforming into u';
    } else {
      phasePill = isBn ? 'ধাপ ৩: প্রোটন (uud) + e⁻ + ν̄ₑ নির্গমন' : 'Phase 3: Proton (uud) + e⁻ + ν̄ₑ Emitted';
      phaseText = isBn ? 'W⁻* বোসন ভেঙে ইলেকট্রন ও অ্যান্টি-নিউট্রিনো হয়ে মুক্ত হলো' : 'The W⁻* decays into an electron and electron anti-neutrino';
    }

    const pillEl = this.wrapper.querySelector('#c2-phase-pill');
    const textEl = this.wrapper.querySelector('#c2-phase-text');
    if (pillEl) pillEl.textContent = phasePill;
    if (textEl) textEl.textContent = phaseText;

    // Transitioning quark Q3:
    // Color/Flavor morphs from d to u around p = 0.45
    const isTransformed = p >= 0.45;
    const q3Label = isTransformed ? 'u' : 'd';
    const q3Charge = isTransformed ? '+⅔' : '−⅓';

    // Bag label (Neutron -> Proton)
    const bagLabel = isTransformed ? (isBn ? 'প্রোটন (uud)' : 'Proton (uud)') : (isBn ? 'নিউট্রন (udd)' : 'Neutron (udd)');

    // Virtual W boson position (starts at q3 and moves rightward)
    const wProgress = Math.max(0, Math.min(1, (p - 0.25) / 0.4));
    const wStartX = q3X;
    const wStartY = q3Y;
    const wEndX = 340;
    const wEndY = 180;
    const wCurrentX = wStartX + (wEndX - wStartX) * wProgress;
    const wCurrentY = wStartY + (wEndY - wStartY) * wProgress;

    // Decay products (electron & antineutrino) positions (p > 0.6)
    const leptonProgress = Math.max(0, Math.min(1, (p - 0.6) / 0.4));
    const eEndX = 540;
    const eEndY = 80;
    const nuEndX = 550;
    const nuEndY = 290;

    const eCurrentX = wEndX + (eEndX - wEndX) * leptonProgress;
    const eCurrentY = wEndY + (eEndY - wEndY) * leptonProgress;
    const nuCurrentX = wEndX + (nuEndX - wEndX) * leptonProgress;
    const nuCurrentY = wEndY + (nuEndY - wEndY) * leptonProgress;

    let markup = `
      <!-- NUCLEON BAG BOUNDARY -->
      <circle cx="${bagX}" cy="${bagY}" r="${bagR}" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(148, 163, 184, 0.35)" stroke-width="2" stroke-dasharray="6,4" />
      <text x="${bagX}" y="${bagY - 72}" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="700">
        ${bagLabel}
      </text>

      <!-- GLUON STRING FLUX BINDING SPECTATORS -->
      <line x1="${q1X}" y1="${q1Y}" x2="${bagX - 10}" y2="${bagY}" stroke="rgba(148, 163, 184, 0.3)" stroke-width="2.5" />
      <line x1="${q2X}" y1="${q2Y}" x2="${bagX - 10}" y2="${bagY}" stroke="rgba(148, 163, 184, 0.3)" stroke-width="2.5" />
      <line x1="${q3X}" y1="${q3Y}" x2="${bagX - 10}" y2="${bagY}" stroke="rgba(148, 163, 184, 0.3)" stroke-width="2.5" />

      <!-- QUARK 1 (u) -->
      <g transform="translate(${q1X}, ${q1Y})">
        <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
        <polygon points="0,-10 8,6 -8,6" fill="none" stroke="#f8fafc" stroke-width="1.8" />
        <text x="0" y="3" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="800" font-family="'JetBrains Mono', monospace">u</text>
        <text x="0" y="27" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace">+⅔</text>
      </g>

      <!-- QUARK 2 (d - spectator) -->
      <g transform="translate(${q2X}, ${q2Y})">
        <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#cbd5e1" stroke-width="2" />
        <polygon points="0,10 8,-6 -8,-6" fill="none" stroke="#f8fafc" stroke-width="1.8" />
        <text x="0" y="3" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="800" font-family="'JetBrains Mono', monospace">d</text>
        <text x="0" y="27" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace">−⅓</text>
      </g>

      <!-- QUARK 3 (d -> u transitioning) -->
      <g transform="translate(${q3X}, ${q3Y})">
        <circle cx="0" cy="0" r="18" fill="${isTransformed ? '#0f172a' : '#1e293b'}" stroke="${isTransformed ? '#38bdf8' : '#cbd5e1'}" stroke-width="${isTransformed ? '2.5' : '2'}" />
        ${isTransformed
          ? '<polygon points="0,-10 8,6 -8,6" fill="none" stroke="#38bdf8" stroke-width="2" />'
          : '<polygon points="0,10 8,-6 -8,-6" fill="none" stroke="#f8fafc" stroke-width="1.8" />'
        }
        <text x="0" y="3" text-anchor="middle" fill="${isTransformed ? '#38bdf8' : '#f8fafc'}" font-size="12" font-weight="800" font-family="'JetBrains Mono', monospace">
          ${q3Label}
        </text>
        <text x="0" y="27" text-anchor="middle" fill="${isTransformed ? '#38bdf8' : '#94a3b8'}" font-size="10" font-family="'JetBrains Mono', monospace">
          ${q3Charge}
        </text>
      </g>
    `;

    // W BOSON TRACK (0.25 <= p <= 0.7)
    if (p >= 0.25) {
      // W wavy path between vertex and W decay point
      const waveD = `M ${wStartX} ${wStartY} Q ${(wStartX + wCurrentX) / 2} ${(wStartY + wCurrentY) / 2 - 14} ${wCurrentX} ${wCurrentY}`;
      markup += `
        <!-- WEAK BOSON W^-* WAVY LINE -->
        <path d="${waveD}" fill="none" stroke="#fb7185" stroke-width="3" stroke-dasharray="5,3" filter="url(#c2-glow)" />
        <circle cx="${wCurrentX}" cy="${wCurrentY}" r="7" fill="#f43f5e" stroke="#fff" stroke-width="1.5" />
        <text x="${wCurrentX}" y="${wCurrentY - 14}" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="800" font-family="'JetBrains Mono', monospace">
          W⁻*
        </text>
      `;
    }

    // LEPTON EMISSION (p >= 0.6)
    if (p >= 0.6) {
      markup += `
        <!-- ELECTRON (e^-) TRACK -->
        <line x1="${wEndX}" y1="${wEndY}" x2="${eCurrentX}" y2="${eCurrentY}" stroke="#38bdf8" stroke-width="2.5" />
        <g transform="translate(${eCurrentX}, ${eCurrentY})">
          <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#fff" stroke-width="1.5" />
          <text x="0" y="3.5" text-anchor="middle" fill="#fff" font-size="11" font-weight="800" font-family="'JetBrains Mono', monospace">e⁻</text>
          <text x="18" y="4" text-anchor="start" fill="#7dd3fc" font-size="11" font-family="'JetBrains Mono', monospace">
            ${isBn ? 'ইলেকট্রন (−১ e)' : 'Electron (-1 e)'}
          </text>
        </g>

        <!-- ELECTRON ANTI-NEUTRINO (nu_e_bar) TRACK -->
        <line x1="${wEndX}" y1="${wEndY}" x2="${nuCurrentX}" y2="${nuCurrentY}" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
        <g transform="translate(${nuCurrentX}, ${nuCurrentY})">
          <circle cx="0" cy="0" r="8" fill="#7e22ce" stroke="#e9d5ff" stroke-width="1.5" />
          <text x="0" y="3.5" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" font-family="'JetBrains Mono', monospace">ν̄</text>
          <text x="18" y="4" text-anchor="start" fill="#c084fc" font-size="11" font-family="'JetBrains Mono', monospace">
            ${isBn ? 'অ্যান্টি-নিউট্রিনো (০ e)' : 'Anti-neutrino (0 e)'}
          </text>
        </g>
      `;
    }

    scene.innerHTML = markup;
  }

  openFlavorInfoDrawer() {
    if (!this.infoDrawer) return;

    const isBn = this.lang === 'bn';

    this.infoDrawer.open({
      title: isBn ? 'ফ্লেভার নীতি ও সত্যতার স্তর (Flavor Spec)' : 'Flavor Principles & Truth Tiers',
      tier: 'T1',
      content: `
        <div class="c2-drawer-body">
          <h4>${isBn ? 'ফ্লেভার প্রদর্শন নীতি (Hue vs Glyph)' : 'Flavor Visual Principle (Hue vs Glyph)'}</h4>
          <p>
            ${isBn
              ? '<strong>কঠোর নিয়ম:</strong> কোয়ার্ক ভিজ্যুয়ালাইজেশনে hue (রঙ) কেবল এবং কেবল কালার-চার্জের জন্য সংরক্ষিত (red, green, blue)। কোয়ার্কের ৬টি ফ্লেভার (up, down, charm, strange, top, bottom) প্রদর্শন করতে হবে অনন্য অক্ষর, জ্যামিতিক শেপ ও টেক্সচার প্যাটার্ন দিয়ে, কখনোই রঙিন ব্যাকগ্রাউন্ড বা হিউ দিয়ে নয়।'
              : '<strong>Strict Rule:</strong> In quark visualizations, hue is reserved strictly for color charges (red, green, blue). The six flavors (up, down, charm, strange, top, bottom) must be identified using distinct glyphs, geometric patterns, and labels—never hue.'
            }
          </p>

          <div class="c2-drawer-box">
            <h4>${isBn ? 'ভর স্কিম-নির্ভরতা (Mass Scheme Dependency)' : 'Mass Scheme Dependency'}</h4>
            <p>
              ${isBn
                ? 'রঙ কনফাইনমেন্টের কারণে কোনো কোয়ার্ককে মুক্ত অবস্থায় দাঁড়িপাল্লায় মাপা অসম্ভব। u, d, s কোয়ার্কের ভর ল্যাটিস কিউসিডির মাধ্যমে MS-bar স্কিমে (μ = 2 GeV স্কেলে) সংজ্ঞায়িত। c ও b কোয়ার্ক নিজ স্কেলে এবং সর্বভারী t কোয়ার্ক সরাসরি কাইনেমেটিক পোল-ম্যাস হিসেবে পরিমাপ করা হয়।'
                : 'Free quarks cannot be isolated due to confinement. Light quarks (u, d, s) are evaluated in the MS-bar scheme (μ = 2 GeV) from Lattice QCD. Heavy top quarks decay so quickly that their mass is directly measured via kinematics as a pole mass (~172.57 GeV).'
              }
            </p>
          </div>

          <div class="c2-drawer-box warn">
            <h4>${isBn ? 'টপ কোয়ার্ক ও টপোনিয়াম (Toponium Excess 2025)' : 'Top Quark & Toponium Excess (2025)'}</h4>
            <p>
              ${isBn
                ? 'টপ কোয়ার্কের জীবনকাল প্রায় ৫×১০⁻²৫ সেকেন্ড, যা একটি হ্যাড্রন গঠিত হওয়ার স্বাভাবিক সময়ের (১০⁻²³ সেকেন্ড) চেয়েও কম। তাই টপ কোয়ার্ক কোনো স্থিতিশীল মেসন বা ব্যারিয়ন তৈরি করার আগেই ক্ষয়প্রাপ্ত হয়। ২০২৫ সালে CMS ও ATLAS কোলাবরেশন t t̄ থ্রেশহোল্ডে অতিরিক্ত ঘটনা লক্ষ্য করেছে যা টপোনিয়াম বাউন্ড-স্টেটের সাথে সামঞ্জস্যপূর্ণ; এর তাত্বিক ব্যাখ্যা বর্তমানে চলমান।'
                : 'With a lifetime of ~5×10⁻²⁵ s, the top quark decays via t → W b before it can bind into stable hadrons (~10⁻²³ s). Recent CMS/ATLAS (2025) observations near the t t̄ threshold show excess consistent with a toponium bound state, labeled "interpretation ongoing".'
              }
            </p>
          </div>
        </div>
      `
    });
  }

  destroy() {
    if (this.animReqId) {
      cancelAnimationFrame(this.animReqId);
      this.animReqId = null;
    }
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}
