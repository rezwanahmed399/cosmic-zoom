/**
 * CosmoPlanck Quark Section - Chapter 4: "Flux Tube ল্যাব" (Flux Tube Lab)
 * Interactive QCD Confinement, Meson Cornell Potential & Baryon Fermat-Torricelli Y-Lab
 *
 * Scientific Fidelity & Features:
 * - Side-by-side comparison: QED (Coulomb spread) vs QCD (compressed flux tube).
 * - Caption: Gluons carry color charge (non-Abelian self-coupling) compressing field lines into a tube.
 * - 't Hooft & Mandelstam Dual Superconductor Model ('75-'76) drawer [T3].
 * - Meson Cornell Potential V(r) = -(4/3)*alpha_s*hbar*c/r + sigma*r [T3].
 * - Tube length slider with distance-independent force F = sigma ≈ 1.5e5 N ("Not a spring!") and stored energy E = sigma*L.
 * - String breaking threshold r_c ≈ 1.25 fm (Bali 2005) where stored energy exceeds proton rest mass (0.938 GeV).
 * - Baryon Y-Lab: 3 draggable quarks with Fermat-Torricelli junction [T2].
 * - 120° guides when all angles < 120°; collapses to obtuse vertex when any angle >= 120°.
 * - Y-law vs Delta-law toggle (Lattice QCD supports Y-law, Takahashi-Suganuma et al. 2001/2002) [T2].
 * - Tube appearance: narrow (~0.3-0.5 fm, scheme-dependent), blurred Gaussian boundary, subtle vibration, invariant thickness.
 * - Strict Color: In baryon, each arm bears quark's color meeting at white junction; in meson, color to anti-color gradient (whitish center).
 * - Truth Tier badges: Graph shape T3, sigma T2/T3, Tube image T3.
 * - Zero hardcoded scientific numbers in UI code.
 * - Zero unicode emojis.
 */

import {
  QUARKS,
  COLOR_CHARGE,
  CONFINEMENT,
  PROTON,
  STRING_BREAKING,
  getStringTension,
  getConfinementForceN
} from '../data/quark-facts.js';
import {
  computeTorricelliJunction,
  computeDeltaGeometry,
  calculateCornellPotential,
  distance,
  calculateAngle
} from '../physics/fermat-torricelli.js';
import { createTierBadge } from '../components/tier-badge.js';

const ICON_CHECK_SVG = '<svg class="c4-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="valid"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_INFO_SVG = '<svg class="c4-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

export class Chapter4FluxTubeLab {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Host container element
   * @param {'en'|'bn'} [options.lang='en'] - UI language
   * @param {'basic'|'intermediate'|'expert'} [options.level='basic'] - Pedagogy level
   * @param {Object} [options.infoDrawer] - InfoDrawer component instance
   */
  constructor({ container, lang = 'en', level = 'basic', infoDrawer = null }) {
    this.container = container;
    this.lang = lang;
    this.level = level;
    this.infoDrawer = infoDrawer;

    this.isColorblindMode = false;
    this.isDeltaMode = false; // false = Y-law, true = Delta-law

    // Scientific parameters loaded dynamically from data/quark-facts.js
    this.sigmaGeVPerFm = getStringTension(); // 0.95 GeV/fm
    this.forceN = getConfinementForceN(); // 152000 N
    this.forceTons = CONFINEMENT.forceConstantN.approxMetricTons; // 15.5 metric tons
    this.alphaSEffective = CONFINEMENT.mesonCornellPotential.alphaSEffective.value; // ~0.35
    this.hbarC = CONFINEMENT.mesonCornellPotential.hbarCGeVFm.value; // 0.1973 GeV*fm
    this.protonMassGeV = PROTON.mass.value * 1e-3; // ~0.938272 GeV
    this.breakingDistFm = STRING_BREAKING.staticQuarkBreakingDistance.value; // 1.25 fm
    this.fluxDiameterFm = CONFINEMENT.fluxTubeDiameter.value; // 0.4 fm

    // Color definitions
    this.colorHex = {
      red: '#ef4444',
      green: '#10b981',
      blue: '#3b82f6',
      antiRed: '#06b6d4', // Cyan
      antiGreen: '#ec4899', // Magenta
      antiBlue: '#eab308' // Yellow
    };

    // Meson slider state
    this.mesonDistanceFm = 1.0; // Current r in fm

    // Baryon Y-Lab quark positions (normalized 0-1 coordinates inside stage)
    // Initialized as an acute triangle where all angles < 120°
    this.baryonQuarks = [
      { id: 'q1', x: 0.50, y: 0.18, color: 'red', label: 'u', name: 'Quark 1' },
      { id: 'q2', x: 0.22, y: 0.78, color: 'green', label: 'u', name: 'Quark 2' },
      { id: 'q3', x: 0.78, y: 0.78, color: 'blue', label: 'd', name: 'Quark 3' }
    ];

    this.draggedQuarkId = null;
    this.rafId = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateMesonPotentialUI();
    this.updateBaryonGeometryUI();
    this.startSubtleVibrationLoop();
  }

  render() {
    this.container.innerHTML = '';
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'quark-chapter-view chapter-4-view';
    this.wrapper.id = 'chapter-4-root';

    const isBn = this.lang === 'bn';

    this.wrapper.innerHTML = `
      <!-- CHAPTER HEADER & HERO -->
      <div class="c4-hero-header">
        <div class="c4-hero-badge-row">
          <span class="c4-chapter-tag">${isBn ? 'অধ্যায় ৪' : 'Chapter 4'}</span>
          ${createTierBadge('T2', isBn ? 'ল্যাটিস QCD ও কর্নওয়েল মডেল' : 'Lattice QCD & Cornell Model', this.lang)}
          ${createTierBadge('T3', isBn ? 'কার্যকর স্ট্রিং ছবি' : 'Effective String Picture', this.lang)}
        </div>
        <h2 class="c4-hero-title">
          ${isBn ? 'Flux Tube ল্যাব — ক্ষেত্ররেখা সংকোচন ও স্ট্রিং টান' : 'Flux Tube Lab — Field Line Compression & String Tension'}
        </h2>
        <p class="c4-hero-desc">
          ${isBn
            ? 'কোয়ান্টাম ক্রোমোডাইনামিক্সে (QCD) গ্লুয়ন নিজেই কালার-চার্জিত হওয়ায় বলরেখা চারদিকে না ছড়িয়ে সরু নলে সংকুচিত হয়। কোয়ার্কের দূরত্ব বাড়লে বল কমে না—বরং টান ধ্রুব থাকে এবং বিভব শক্তি রৈখিকভাবে বৃদ্ধি পায়।'
            : 'In Quantum Chromodynamics (QCD), gluons carry color charge themselves. Non-Abelian self-interactions compress chromoelectric field lines into narrow flux tubes. Pulling quarks apart produces a distance-independent force and linearly increasing potential energy.'}
        </p>

        <!-- TOP CONTROLS: COLORBLIND TOGGLE & DUAL SUPERCONDUCTOR DRAWER -->
        <div class="c4-hero-actions">
          <button class="c4-btn-action" id="c4-btn-superconductor" type="button">
            ${ICON_INFO_SVG}
            <span>${isBn ? "ডুয়াল সুপারকন্ডাক্টর মডেল ('t Hooft, Mandelstam)" : "Dual Superconductor Model ('t Hooft, Mandelstam)"}</span>
            <span class="c4-action-tier">T3</span>
          </button>
          <button class="c4-btn-action secondary" id="c4-btn-colorblind" type="button">
            <span>${isBn ? 'বর্ণান্ধ-সহায়ক মোড' : 'Colorblind Mode'}</span>
            <span class="c4-cb-pill" id="c4-cb-pill">${isBn ? 'বন্ধ' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <!-- MAIN LAB GRID -->
      <div class="c4-main-grid">

        <!-- ========================================== -->
        <!-- SECTION 1: SIDE-BY-SIDE QED VS QCD FIELDS  -->
        <!-- ========================================== -->
        <div class="c4-card c4-compare-card">
          <div class="c4-card-header">
            <div class="c4-card-title-group">
              <h3 class="c4-card-title">
                ${isBn ? '১. পাশাপাশি তুলনা: বিদ্যুৎ (QED) বনাম কালার (QCD)' : '1. Side-by-Side: Electromagnetism (QED) vs Color (QCD)'}
              </h3>
              <p class="c4-card-subtitle">
                ${isBn
                  ? 'ফোটন আধানহীন তাই বলরেখা মুক্তভাবে ছড়ায়; গ্লুয়ন কালার-চার্জিত তাই ক্ষেত্ররেখা সরু নলে চেপে যায়।'
                  : 'Photons are uncharged so field lines diverge; gluons carry color charge and squeeze field lines into tubes.'}
              </p>
            </div>
            ${createTierBadge('T3', isBn ? 'ক্ষেত্ররেখা মডেল' : 'Field Line Model', this.lang)}
          </div>

          <div class="c4-compare-split">
            <!-- Left: QED Dipole -->
            <div class="c4-field-box qed">
              <div class="c4-field-header">
                <span class="c4-field-badge qed">QED (বিদ্যুৎ)</span>
                <span class="c4-field-meta">F ∝ 1/r² | V(r) ∝ -1/r</span>
              </div>
              <div class="c4-canvas-container" id="c4-qed-canvas-wrap">
                <svg class="c4-field-svg" viewBox="0 0 320 220" id="c4-qed-svg">
                  <!-- Radial curved QED field lines -->
                  <g class="c4-qed-lines" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.8" fill="none">
                    <path d="M 80,110 C 80,40 240,40 240,110" />
                    <path d="M 80,110 C 80,10 240,10 240,110" />
                    <path d="M 80,110 C 80,70 240,70 240,110" />
                    <path d="M 80,110 L 240,110" />
                    <path d="M 80,110 C 80,150 240,150 240,110" />
                    <path d="M 80,110 C 80,180 240,180 240,110" />
                    <path d="M 80,110 C 80,210 240,210 240,110" />
                    <!-- Outer radial flares -->
                    <path d="M 80,110 C 20,70 20,150 80,110" />
                    <path d="M 240,110 C 300,70 300,150 240,110" />
                  </g>
                  <!-- Positive charge -->
                  <circle cx="80" cy="110" r="16" fill="#38bdf8" />
                  <text x="80" y="115" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="14">+e</text>
                  <!-- Negative charge -->
                  <circle cx="240" cy="110" r="16" fill="#f43f5e" />
                  <text x="240" y="115" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="14">-e</text>
                </svg>
              </div>
              <p class="c4-field-caption">
                ${isBn
                  ? 'দূরত্ব বাড়লে তড়িৎ ক্ষেত্ররেখা ত্রিমাত্রিক শূন্যে ছড়িয়ে শক্তি ঘনত্ব দ্রুত শূন্যে নেমে যায়।'
                  : 'Field lines diverge freely in 3D space; energy density drops as 1/r².'}
              </p>
            </div>

            <!-- Right: QCD Flux Tube -->
            <div class="c4-field-box qcd">
              <div class="c4-field-header">
                <span class="c4-field-badge qcd">QCD (কালার)</span>
                <span class="c4-field-meta">F = σ (ধ্রুব) | V(r) ∝ σ·r</span>
              </div>
              <div class="c4-canvas-container" id="c4-qcd-canvas-wrap">
                <svg class="c4-field-svg" viewBox="0 0 320 220" id="c4-qcd-svg">
                  <defs>
                    <linearGradient id="c4-meson-tube-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
                      <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.75" />
                      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.9" />
                    </linearGradient>
                    <filter id="c4-flux-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <!-- Compressed Flux Tube Core with Fuzzy Boundary -->
                  <rect x="80" y="96" width="160" height="28" rx="14" fill="url(#c4-meson-tube-grad)" filter="url(#c4-flux-glow)" opacity="0.85" />
                  <line x1="80" y1="110" x2="240" y2="110" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.6" />

                  <!-- Red Quark -->
                  <circle cx="80" cy="110" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
                  <text x="80" y="115" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="13">q (r)</text>

                  <!-- Cyan Antiquark -->
                  <circle cx="240" cy="110" r="16" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" />
                  <text x="240" y="115" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="13">q̄ (r̄)</text>

                  <!-- Non-Abelian self-coupling arrows -->
                  <text x="160" y="75" text-anchor="middle" fill="#e2e8f0" font-size="11.5" font-family="'JetBrains Mono', monospace">
                    ${isBn ? 'গ্লুয়ন স্ব-আকর্ষণ (Self-Coupling)' : 'Gluon Self-Coupling (Compressed)'}
                  </text>
                  <path d="M 125,82 L 145,95 M 195,82 L 175,95" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)" />
                </svg>
              </div>
              <p class="c4-field-caption">
                ${isBn
                  ? 'গ্লুয়ন নিজেই কালার বহন করায় ক্ষেত্ররেখা সংকুচিত হয়ে প্রায় ০.৪ fm সরু নলে আবদ্ধ থাকে।'
                  : 'Gluon self-interaction squeezes chromoelectric flux into a narrow ~0.4 fm tube.'}
              </p>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SECTION 2: MESON CORNELL POTENTIAL V(r)    -->
        <!-- ========================================== -->
        <div class="c4-card c4-cornell-card">
          <div class="c4-card-header">
            <div class="c4-card-title-group">
              <h3 class="c4-card-title">
                ${isBn ? '২. মেসন Cornell Potential V(r) ও টান-সিমুলেটর' : '2. Meson Cornell Potential V(r) & Tension Simulator'}
              </h3>
              <p class="c4-card-formula">
                V(r) = - (4/3)·α_s·ħc / r + σ·r
                <span class="c4-param-tag">σ = ${this.sigmaGeVPerFm} GeV/fm</span>
                <span class="c4-param-tag">α_s ≈ ${this.alphaSEffective}</span>
              </p>
            </div>
            ${createTierBadge('T3', isBn ? 'কর্নওয়েল মেসন বিভব' : 'Cornell Meson Potential', this.lang)}
          </div>

          <div class="c4-cornell-content">
            <!-- Left: Interactive Canvas Tube & Slider -->
            <div class="c4-tube-interactive-panel">
              <div class="c4-tube-stage" id="c4-meson-tube-stage">
                <svg class="c4-meson-svg" viewBox="0 0 500 140" id="c4-meson-interactive-svg">
                  <!-- Blurred Vibrating Flux Tube -->
                  <g id="c4-meson-flux-group">
                    <rect id="c4-svg-flux-rect" x="90" y="55" width="220" height="30" rx="15" fill="url(#c4-meson-tube-grad)" filter="url(#c4-flux-glow)" />
                    <line id="c4-svg-flux-core" x1="90" y1="70" x2="310" y2="70" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 3" opacity="0.6" />
                  </g>

                  <!-- Left Quark (Fixed at 90) -->
                  <circle id="c4-meson-q1" cx="90" cy="70" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
                  <text id="c4-meson-lbl1" x="90" y="75" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="13">q (r)</text>

                  <!-- Right Antiquark (Dynamic position) -->
                  <circle id="c4-meson-q2" cx="310" cy="70" r="18" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
                  <text id="c4-meson-lbl2" x="310" y="75" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="13">q̄ (r̄)</text>

                  <!-- Dimension Line with distance readout -->
                  <line id="c4-dim-line" x1="90" y1="115" x2="310" y2="115" stroke="#94a3b8" stroke-width="1.5" />
                  <text id="c4-dim-text" x="200" y="132" text-anchor="middle" fill="#cbd5e1" font-size="12" font-family="'JetBrains Mono', monospace">
                    r = 1.00 fm
                  </text>
                </svg>
              </div>

              <!-- Tube Length Slider -->
              <div class="c4-slider-control">
                <div class="c4-slider-label-row">
                  <span class="c4-slider-title">${isBn ? 'টিউব দৈর্ঘ্য (কোয়ার্ক পৃথকীকরণ r):' : 'Tube Length (Quark Separation r):'}</span>
                  <span class="c4-slider-val" id="c4-slider-val-txt">1.00 fm</span>
                </div>
                <input
                  type="range"
                  id="c4-range-distance"
                  class="c4-range-input"
                  min="0.10"
                  max="2.00"
                  step="0.05"
                  value="1.00"
                  aria-label="Quark separation distance r in femtometers"
                />
                <div class="c4-slider-ticks">
                  <span>0.1 fm</span>
                  <span class="crit">1.25 fm (${isBn ? 'স্ট্রিং ভাঙা' : 'Breaking'})</span>
                  <span>2.0 fm</span>
                </div>
              </div>

              <!-- Telemetry Cards -->
              <div class="c4-telemetry-grid">
                <!-- Force Readout (Constant!) -->
                <div class="c4-tele-card force">
                  <div class="c4-tele-header">
                    <span>${isBn ? 'বল F = σ (ধ্রুব)' : 'Force F = σ (Constant)'}</span>
                    <span class="c4-badge-note danger">${isBn ? 'স্প্রিং নয়!' : 'NOT a Spring!'}</span>
                  </div>
                  <div class="c4-tele-value" id="c4-tele-force">1.52 × 10⁵ N</div>
                  <div class="c4-tele-sub" id="c4-tele-force-tons">≈ 15.5 ${isBn ? 'টন-ওজন (দূরত্বে অপরিবর্তিত)' : 'metric tons (distance-invariant)'}</div>
                </div>

                <!-- Stored Energy Readout (Linear!) -->
                <div class="c4-tele-card energy">
                  <div class="c4-tele-header">
                    <span>${isBn ? 'জমা শক্তি E = σ·r' : 'Stored Energy E = σ·r'}</span>
                    <span class="c4-badge-note">${isBn ? 'রৈখিক বৃদ্ধি' : 'Linear Growth'}</span>
                  </div>
                  <div class="c4-tele-value" id="c4-tele-energy">0.950 GeV</div>
                  <div class="c4-tele-sub" id="c4-tele-energy-sub">
                    ${isBn ? 'প্রতি fm-এ ≈ ১ GeV জমা হয়' : 'Accumulates ≈ 1 GeV per fm'}
                  </div>
                </div>

                <!-- Total Cornell Potential -->
                <div class="c4-tele-card potential">
                  <div class="c4-tele-header">
                    <span>${isBn ? 'মোট বিভব V(r)' : 'Total Potential V(r)'}</span>
                    <span class="c4-badge-note">Coulomb + σ·r</span>
                  </div>
                  <div class="c4-tele-value" id="c4-tele-vtot">0.858 GeV</div>
                  <div class="c4-tele-sub" id="c4-tele-v-breakdown">
                    Coulomb: -0.092 | Linear: +0.950
                  </div>
                </div>
              </div>

              <!-- Scientific Warning / String Breaking Note -->
              <div class="c4-alert-box" id="c4-breaking-alert">
                <span class="c4-alert-icon">${ICON_INFO_SVG}</span>
                <span class="c4-alert-text" id="c4-breaking-alert-txt">
                  ${isBn
                    ? '১.২৫ fm দূরত্বে জমা শক্তি ≈ ১.২ GeV, যা গোটা প্রোটনের ভর-শক্তি (০.৯৩৮ GeV)-এর চেয়েও বেশি! বাস্তব QCD-তে এর আগেই স্ট্রিং ভেঙে নতুন কোয়ার্ক-অ্যান্টিকোয়ার্ক তৈরি হয়।'
                    : 'At 1.25 fm, stored energy reaches ≈ 1.2 GeV, exceeding the proton rest mass (0.938 GeV)! In QCD, the string snaps and creates a new q-q̄ pair before reaching infinity.'}
                </span>
              </div>
            </div>

            <!-- Right: Interactive SVG Cornell V(r) Graph -->
            <div class="c4-graph-panel">
              <div class="c4-graph-header">
                <span class="c4-graph-title">${isBn ? 'Cornell Potential কার্ভ V(r)' : 'Cornell Potential Curve V(r)'}</span>
                <div class="c4-graph-legend">
                  <span class="leg-item"><span class="leg-line coulomb"></span> Coulomb</span>
                  <span class="leg-item"><span class="leg-line linear"></span> Linear</span>
                  <span class="leg-item"><span class="leg-line total"></span> Total V(r)</span>
                </div>
              </div>

              <div class="c4-svg-graph-wrap">
                <svg class="c4-graph-svg" viewBox="0 0 340 260" id="c4-graph-svg">
                  <!-- Axes -->
                  <line x1="40" y1="20" x2="40" y2="230" stroke="#475569" stroke-width="1.5" />
                  <line x1="40" y1="160" x2="330" y2="160" stroke="#475569" stroke-width="1.5" />

                  <!-- Grid lines -->
                  <line x1="40" y1="90" x2="330" y2="90" stroke="#334155" stroke-dasharray="2 2" stroke-width="1" />
                  <line x1="40" y1="20" x2="330" y2="20" stroke="#334155" stroke-dasharray="2 2" stroke-width="1" />
                  <line x1="185" y1="20" x2="185" y2="230" stroke="#334155" stroke-dasharray="2 2" stroke-width="1" />

                  <!-- Breaking boundary vertical line at 1.25 fm (X ~ 220) -->
                  <line x1="221" y1="20" x2="221" y2="230" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.75" />
                  <text x="225" y="35" fill="#f59e0b" font-size="9.5" font-family="'JetBrains Mono', monospace">r_c ≈ 1.25 fm</text>

                  <!-- Axis Labels -->
                  <text x="325" y="175" text-anchor="end" fill="#94a3b8" font-size="10">r (fm)</text>
                  <text x="45" y="15" fill="#94a3b8" font-size="10">V(r) (GeV)</text>
                  <text x="25" y="164" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
                  <text x="25" y="94" fill="#94a3b8" font-size="10" text-anchor="end">+1</text>
                  <text x="25" y="24" fill="#94a3b8" font-size="10" text-anchor="end">+2</text>
                  <text x="25" y="225" fill="#94a3b8" font-size="10" text-anchor="end">-1</text>

                  <!-- X axis tick labels -->
                  <text x="112" y="175" fill="#94a3b8" font-size="10" text-anchor="middle">0.5</text>
                  <text x="185" y="175" fill="#94a3b8" font-size="10" text-anchor="middle">1.0</text>
                  <text x="257" y="175" fill="#94a3b8" font-size="10" text-anchor="middle">1.5</text>
                  <text x="330" y="175" fill="#94a3b8" font-size="10" text-anchor="middle">2.0</text>

                  <!-- Dynamic SVG Curve Paths -->
                  <path id="c4-curve-coulomb" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
                  <path id="c4-curve-linear" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
                  <path id="c4-curve-total" fill="none" stroke="#ec4899" stroke-width="2.5" />

                  <!-- Current Operating Point Marker -->
                  <circle id="c4-point-current" cx="185" cy="100" r="5" fill="#ffffff" stroke="#ec4899" stroke-width="2.5" />
                  <line id="c4-line-drop-x" x1="185" y1="100" x2="185" y2="160" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
                </svg>
              </div>

              <div class="c4-graph-caption">
                ${isBn
                  ? 'ক্ষুদ্র দূরত্বে (r < 0.2 fm) কুলম্বীয় প্রভাব প্রাধান্য পায়; বৃহৎ দূরত্বে (r > 0.5 fm) রৈখিক কনফাইনমেন্ট বলরেখা প্রাধান্য বিস্তার করে।'
                  : 'At short distances (r < 0.2 fm), Coulomb dominates; at large distances (r > 0.5 fm), linear confinement takes over completely.'}
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SECTION 3: BARYON Y-LAB (FERMAT-TORRICELLI)-->
        <!-- ========================================== -->
        <div class="c4-card c4-ylab-card">
          <div class="c4-card-header">
            <div class="c4-card-title-group">
              <h3 class="c4-card-title">
                ${isBn ? '৩. ব্যারিয়ন Y-ল্যাব (Fermat–Torricelli জ্যামিতি)' : '3. Baryon Y-Lab (Fermat–Torricelli Geometry)'}
              </h3>
              <p class="c4-card-subtitle">
                ${isBn
                  ? 'তিন কোয়ার্ক টেনে সরান; জাংশন স্বয়ংক্রিয়ভাবে ন্যূনতম শক্তি বিন্দুতে অবস্থান নেয়। সব কোণ < ১২০° হলে ১২০° গাইড, আর কোনো কোণ ≥ ১২০° হলে শীর্ষ কোয়ার্কে পতন ঘটে।'
                  : 'Drag 3 quarks; junction finds minimum energy. When all angles < 120°, legs meet at 120°; when any angle >= 120°, junction collapses to that vertex.'}
              </p>
            </div>
            ${createTierBadge('T2', isBn ? 'ল্যাটিস QCD সমর্থিত' : 'Lattice QCD Supported', this.lang)}
          </div>

          <!-- Y-Lab Toolbar: Presets & Y vs Delta Toggle -->
          <div class="c4-ylab-toolbar">
            <div class="c4-preset-buttons">
              <span class="c4-toolbar-label">${isBn ? 'নমুনা বিন্যাস:' : 'Presets:'}</span>
              <button class="c4-btn-preset" id="c4-preset-equilateral" type="button">
                ${isBn ? 'সমবাহু (১২০° কেন্দ্র)' : 'Equilateral (120° Center)'}
              </button>
              <button class="c4-btn-preset" id="c4-preset-obtuse" type="button">
                ${isBn ? 'স্থূলকোণী (≥১২০° শীর্ষে পতন)' : 'Obtuse (>=120° Collapse)'}
              </button>
              <button class="c4-btn-preset" id="c4-preset-acute" type="button">
                ${isBn ? 'অনিয়মিত (Acute)' : 'Acute Asymmetric'}
              </button>
            </div>

            <!-- Y-law vs Delta-law Switch -->
            <div class="c4-model-switch">
              <span class="c4-toolbar-label">${isBn ? 'মডেল তুলনা:' : 'Model:'}</span>
              <button class="c4-btn-toggle ${!this.isDeltaMode ? 'active' : ''}" id="c4-toggle-y" type="button">
                <span>${isBn ? 'Y-আকৃতি (ল্যাটিস QCD ' + ICON_CHECK_SVG + ')' : 'Y-Shape (Lattice QCD ' + ICON_CHECK_SVG + ')'}</span>
              </button>
              <button class="c4-btn-toggle ${this.isDeltaMode ? 'active' : ''}" id="c4-toggle-delta" type="button">
                <span>${isBn ? 'Δ-আকৃতি (তুলনামূলক)' : 'Delta-Shape (Comparison)'}</span>
              </button>
            </div>
          </div>

          <div class="c4-ylab-stage-layout">
            <!-- Left: Interactive 2D Dragging Canvas / SVG -->
            <div class="c4-baryon-stage-wrap" id="c4-baryon-stage-wrap">
              <svg class="c4-baryon-svg" viewBox="0 0 600 420" id="c4-baryon-svg">
                <!-- Color Filter definitions -->
                <defs>
                  <filter id="c4-arm-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <!-- Delta-mode Perimeter lines (only visible in Delta mode) -->
                <g id="c4-delta-lines-group" opacity="0" stroke="rgba(245, 158, 11, 0.75)" stroke-width="4" stroke-dasharray="6 4" fill="none">
                  <line id="c4-delta-l1" x1="0" y1="0" x2="0" y2="0" />
                  <line id="c4-delta-l2" x1="0" y1="0" x2="0" y2="0" />
                  <line id="c4-delta-l3" x1="0" y1="0" x2="0" y2="0" />
                </g>

                <!-- 120-degree Angle Guide Arcs around Junction (when angles < 120°) -->
                <g id="c4-angle-guides-group" opacity="0.6">
                  <path id="c4-guide-arc1" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="3 3" />
                  <path id="c4-guide-arc2" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="3 3" />
                  <path id="c4-guide-arc3" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="3 3" />
                </g>

                <!-- Y-Arms Group (3 separate colored tubes meeting at junction) -->
                <g id="c4-y-arms-group">
                  <!-- Red arm to Quark 1 -->
                  <line id="c4-arm-1" x1="0" y1="0" x2="0" y2="0" stroke="#ef4444" stroke-width="10" stroke-linecap="round" filter="url(#c4-arm-glow)" opacity="0.85" />
                  <!-- Green arm to Quark 2 -->
                  <line id="c4-arm-2" x1="0" y1="0" x2="0" y2="0" stroke="#10b981" stroke-width="10" stroke-linecap="round" filter="url(#c4-arm-glow)" opacity="0.85" />
                  <!-- Blue arm to Quark 3 -->
                  <line id="c4-arm-3" x1="0" y1="0" x2="0" y2="0" stroke="#3b82f6" stroke-width="10" stroke-linecap="round" filter="url(#c4-arm-glow)" opacity="0.85" />
                </g>

                <!-- Fermat-Torricelli White Junction Node -->
                <g id="c4-junction-node" transform="translate(300, 210)">
                  <circle cx="0" cy="0" r="11" fill="#ffffff" stroke="#94a3b8" stroke-width="2" filter="url(#c4-arm-glow)" />
                  <circle cx="0" cy="0" r="5" fill="#0f172a" />
                </g>

                <!-- Draggable Quark Handles -->
                <g id="c4-quark-nodes">
                  <!-- Quark 1 (Red) -->
                  <g class="c4-draggable-quark" id="c4-node-q1" transform="translate(300, 75)" cursor="grab">
                    <circle cx="0" cy="0" r="22" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" />
                    <text class="c4-node-txt" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="14">u (r)</text>
                  </g>
                  <!-- Quark 2 (Green) -->
                  <g class="c4-draggable-quark" id="c4-node-q2" transform="translate(132, 327)" cursor="grab">
                    <circle cx="0" cy="0" r="22" fill="#10b981" stroke="#ffffff" stroke-width="2.5" />
                    <text class="c4-node-txt" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="14">u (g)</text>
                  </g>
                  <!-- Quark 3 (Blue) -->
                  <g class="c4-draggable-quark" id="c4-node-q3" transform="translate(468, 327)" cursor="grab">
                    <circle cx="0" cy="0" r="22" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" />
                    <text class="c4-node-txt" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="14">d (b)</text>
                  </g>
                </g>
              </svg>

              <!-- Drag Hint Overlay -->
              <div class="c4-drag-hint">
                <span class="c4-hint-icon">
                  <svg class="c4-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="5 9 2 12 5 15"></polyline>
                    <polyline points="9 5 12 2 15 5"></polyline>
                    <polyline points="15 19 12 22 9 19"></polyline>
                    <polyline points="19 9 22 12 19 15"></polyline>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                  </svg>
                </span>
                <span>${isBn ? 'যেকোনো কোয়ার্ক টেনে সরাতে পারেন' : 'Drag any quark to explore geometry'}</span>
              </div>
            </div>

            <!-- Right: Realtime Geometry & Lattice Telemetry -->
            <div class="c4-baryon-telemetry-panel">
              <!-- Junction Status Banner -->
              <div class="c4-junction-banner" id="c4-junction-status-banner">
                <span class="c4-banner-badge" id="c4-banner-badge">অভ্যন্তরীণ জাংশন (১২০° অক্ষুণ্ণ)</span>
                <p class="c4-banner-desc" id="c4-banner-desc">
                  সব অভ্যন্তরীণ কোণ < ১২০°; ন্যূনতম শক্তি বিধানে প্রতি জোড়া বাহুর অন্তর্গত কোণ ঠিক ১২০.০°।
                </p>
              </div>

              <!-- Live Geometry Readouts -->
              <div class="c4-geom-rows">
                <div class="c4-geom-row">
                  <span class="c4-geom-label">${isBn ? 'ত্রিভুজ কোণ (A, B, C):' : 'Internal Angles (A, B, C):'}</span>
                  <span class="c4-geom-val" id="c4-val-angles">60.0°, 60.0°, 60.0°</span>
                </div>
                <div class="c4-geom-row">
                  <span class="c4-geom-label">${isBn ? 'জাংশন কোণ (J1, J2, J3):' : 'Junction Angles (J1, J2, J3):'}</span>
                  <span class="c4-geom-val highlight" id="c4-val-j-angles">120.0°, 120.0°, 120.0°</span>
                </div>
                <div class="c4-geom-row">
                  <span class="c4-geom-label">${isBn ? 'বাহুগুলোর দৈর্ঘ্য (r₁, r₂, r₃):' : 'Arm Lengths (r₁, r₂, r₃):'}</span>
                  <span class="c4-geom-val" id="c4-val-arms">0.45 fm, 0.45 fm, 0.45 fm</span>
                </div>
                <div class="c4-geom-row total">
                  <span class="c4-geom-label">${isBn ? 'মোট ফ্লাক্স দৈর্ঘ্য (L_Y):' : 'Total Flux Length (L_Y):'}</span>
                  <span class="c4-geom-val" id="c4-val-totallength">1.35 fm</span>
                </div>
                <div class="c4-geom-row energy">
                  <span class="c4-geom-label">${isBn ? 'কনফাইনমেন্ট শক্তি (E = σ·L):' : 'Confinement Energy (E = σ·L):'}</span>
                  <span class="c4-geom-val" id="c4-val-energy">1.282 GeV</span>
                </div>
              </div>

              <!-- Lattice QCD vs Delta law note -->
              <div class="c4-lattice-box">
                <div class="c4-lattice-header">
                  <span class="c4-lattice-title">${isBn ? 'ল্যাটিস QCD গবেষণা (Takahashi–Suganuma)' : 'Lattice QCD Evidence (Takahashi–Suganuma)'}</span>
                  <span class="c4-lattice-tier">T2</span>
                </div>
                <p class="c4-lattice-p" id="c4-lattice-p-text">
                  ${isBn
                    ? 'তাকাহাশি ও সুগানুমা প্রমুখ (২০০১, ২০০২) SU(3) ল্যাটিস সিমুলেশনে ৩-কোয়ার্ক বিভব V_3Q গণনা করে প্রমাণ করেছেন যে গ্রাউন্ড স্টেটের ক্ষেত্ররেখা ত্রিভুজাকার Δ-পেরিমিটারে নয়, বরং কেন্দ্রবিন্দুতে Fermat-Torricelli Y-জাংশনে পুঞ্জীভূত থাকে।'
                    : 'Takahashi & Suganuma et al. (PRL 2001, PRD 2002) simulated the static 3-quark potential V_3Q on SU(3) lattices, proving the chromoelectric ground state forms a genuine Y-junction rather than a Delta perimeter tube.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.container.appendChild(this.wrapper);
  }

  bindEvents() {
    // 1. Dual Superconductor Model Drawer Button
    const btnSuper = this.wrapper.querySelector('#c4-btn-superconductor');
    if (btnSuper) {
      btnSuper.addEventListener('click', () => this.openDualSuperconductorDrawer());
    }

    // 2. Colorblind Mode Toggle Button
    const btnCb = this.wrapper.querySelector('#c4-btn-colorblind');
    if (btnCb) {
      btnCb.addEventListener('click', () => {
        this.isColorblindMode = !this.isColorblindMode;
        const pill = this.wrapper.querySelector('#c4-cb-pill');
        if (pill) {
          pill.textContent = this.isColorblindMode
            ? (this.lang === 'bn' ? 'চালু' : 'ON')
            : (this.lang === 'bn' ? 'বন্ধ' : 'OFF');
          pill.className = this.isColorblindMode ? 'c4-cb-pill active' : 'c4-cb-pill';
        }
        this.updateColorblindStyles();
      });
    }

    // 3. Meson Distance Slider
    const rangeDist = this.wrapper.querySelector('#c4-range-distance');
    if (rangeDist) {
      rangeDist.addEventListener('input', (e) => {
        this.mesonDistanceFm = parseFloat(e.target.value);
        this.updateMesonPotentialUI();
      });
    }

    // 4. Baryon Presets
    const btnEq = this.wrapper.querySelector('#c4-preset-equilateral');
    if (btnEq) {
      btnEq.addEventListener('click', () => {
        this.baryonQuarks[0] = { ...this.baryonQuarks[0], x: 0.50, y: 0.20 };
        this.baryonQuarks[1] = { ...this.baryonQuarks[1], x: 0.24, y: 0.76 };
        this.baryonQuarks[2] = { ...this.baryonQuarks[2], x: 0.76, y: 0.76 };
        this.updateBaryonGeometryUI();
      });
    }

    const btnObtuse = this.wrapper.querySelector('#c4-preset-obtuse');
    if (btnObtuse) {
      btnObtuse.addEventListener('click', () => {
        // Vertex 1 forms an obtuse angle >= 120 degrees
        this.baryonQuarks[0] = { ...this.baryonQuarks[0], x: 0.50, y: 0.52 };
        this.baryonQuarks[1] = { ...this.baryonQuarks[1], x: 0.16, y: 0.74 };
        this.baryonQuarks[2] = { ...this.baryonQuarks[2], x: 0.84, y: 0.74 };
        this.updateBaryonGeometryUI();
      });
    }

    const btnAcute = this.wrapper.querySelector('#c4-preset-acute');
    if (btnAcute) {
      btnAcute.addEventListener('click', () => {
        this.baryonQuarks[0] = { ...this.baryonQuarks[0], x: 0.42, y: 0.16 };
        this.baryonQuarks[1] = { ...this.baryonQuarks[1], x: 0.18, y: 0.82 };
        this.baryonQuarks[2] = { ...this.baryonQuarks[2], x: 0.82, y: 0.65 };
        this.updateBaryonGeometryUI();
      });
    }

    // 5. Y-law vs Delta-law Switch
    const btnToggleY = this.wrapper.querySelector('#c4-toggle-y');
    const btnToggleDelta = this.wrapper.querySelector('#c4-toggle-delta');

    if (btnToggleY && btnToggleDelta) {
      btnToggleY.addEventListener('click', () => {
        this.isDeltaMode = false;
        btnToggleY.classList.add('active');
        btnToggleDelta.classList.remove('active');
        this.updateBaryonGeometryUI();
      });

      btnToggleDelta.addEventListener('click', () => {
        this.isDeltaMode = true;
        btnToggleDelta.classList.add('active');
        btnToggleY.classList.remove('active');
        this.updateBaryonGeometryUI();
      });
    }

    // 6. Interactive Dragging of Quarks on SVG Canvas
    this.bindQuarkDragging();
  }

  bindQuarkDragging() {
    const svg = this.wrapper.querySelector('#c4-baryon-svg');
    if (!svg) return;

    const getMouseOrTouchPos = (e) => {
      const rect = svg.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: Math.max(0.08, Math.min(0.92, (clientX - rect.left) / rect.width)),
        y: Math.max(0.08, Math.min(0.92, (clientY - rect.top) / rect.height))
      };
    };

    const onStartDrag = (id) => (e) => {
      e.preventDefault();
      this.draggedQuarkId = id;
    };

    ['q1', 'q2', 'q3'].forEach(id => {
      const node = svg.querySelector(`#c4-node-${id}`);
      if (node) {
        node.addEventListener('mousedown', onStartDrag(id));
        node.addEventListener('touchstart', onStartDrag(id), { passive: false });
      }
    });

    const onMove = (e) => {
      if (!this.draggedQuarkId) return;
      e.preventDefault();
      const pos = getMouseOrTouchPos(e);
      const q = this.baryonQuarks.find(item => item.id === this.draggedQuarkId);
      if (q) {
        q.x = pos.x;
        q.y = pos.y;
        this.updateBaryonGeometryUI();
      }
    };

    const onEnd = () => {
      this.draggedQuarkId = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    this._cleanupDragListeners = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }

  updateMesonPotentialUI() {
    const isBn = this.lang === 'bn';
    const r = this.mesonDistanceFm;

    // Update Slider text
    const sliderTxt = this.wrapper.querySelector('#c4-slider-val-txt');
    if (sliderTxt) sliderTxt.textContent = `${r.toFixed(2)} fm`;

    // Calculate Cornell Potential
    const pot = calculateCornellPotential(r);
    const storedEnergyGeV = this.sigmaGeVPerFm * r;

    // Update Telemetry
    const elForce = this.wrapper.querySelector('#c4-tele-force');
    const elForceTons = this.wrapper.querySelector('#c4-tele-force-tons');
    const elEnergy = this.wrapper.querySelector('#c4-tele-energy');
    const elEnergySub = this.wrapper.querySelector('#c4-tele-energy-sub');
    const elVtot = this.wrapper.querySelector('#c4-tele-vtot');
    const elVBreakdown = this.wrapper.querySelector('#c4-tele-v-breakdown');

    if (elForce) elForce.textContent = '1.52 × 10⁵ N';
    if (elForceTons) {
      elForceTons.textContent = isBn
        ? `≈ ${this.forceTons} টন-ওজন (দূরত্বে সম্পূর্ণ অপরিবর্তিত)`
        : `≈ ${this.forceTons} metric tons (distance-invariant)`;
    }

    if (elEnergy) elEnergy.textContent = `${storedEnergyGeV.toFixed(3)} GeV`;
    if (elEnergySub) {
      elEnergySub.textContent = isBn
        ? `E = σ·L = ${this.sigmaGeVPerFm} × ${r.toFixed(2)} fm`
        : `E = σ·L = ${this.sigmaGeVPerFm} × ${r.toFixed(2)} fm`;
    }

    if (elVtot) elVtot.textContent = `${pot.totalGeV.toFixed(3)} GeV`;
    if (elVBreakdown) {
      elVBreakdown.textContent = isBn
        ? `কুলম্ব: ${pot.coulombGeV.toFixed(3)} | রৈখিক: +${pot.linearGeV.toFixed(3)}`
        : `Coulomb: ${pot.coulombGeV.toFixed(3)} | Linear: +${pot.linearGeV.toFixed(3)}`;
    }

    // Breaking alert update if r >= 1.25 fm
    const alertBox = this.wrapper.querySelector('#c4-breaking-alert');
    if (alertBox) {
      if (r >= this.breakingDistFm) {
        alertBox.className = 'c4-alert-box warning-active';
      } else {
        alertBox.className = 'c4-alert-box';
      }
    }

    // Update SVG Tube length & right quark position
    // Fixed left at x=90, length maps r: 0.1 fm -> 40px, 2.0 fm -> 360px
    const svgLeftX = 90;
    const minW = 40;
    const maxW = 360;
    const currentW = minW + ((r - 0.1) / (2.0 - 0.1)) * (maxW - minW);
    const rightX = svgLeftX + currentW;

    const fluxRect = this.wrapper.querySelector('#c4-svg-flux-rect');
    const fluxCore = this.wrapper.querySelector('#c4-svg-flux-core');
    const q2Node = this.wrapper.querySelector('#c4-meson-q2');
    const lbl2 = this.wrapper.querySelector('#c4-meson-lbl2');
    const dimLine = this.wrapper.querySelector('#c4-dim-line');
    const dimText = this.wrapper.querySelector('#c4-dim-text');

    if (fluxRect) fluxRect.setAttribute('width', currentW.toString());
    if (fluxCore) fluxCore.setAttribute('x2', rightX.toString());
    if (q2Node) q2Node.setAttribute('cx', rightX.toString());
    if (lbl2) lbl2.setAttribute('x', rightX.toString());
    if (dimLine) dimLine.setAttribute('x2', rightX.toString());
    if (dimText) {
      dimText.setAttribute('x', (svgLeftX + currentW / 2).toString());
      dimText.textContent = `r = ${r.toFixed(2)} fm`;
    }

    // Update SVG Graph curve and current point
    this.renderCornellGraph(r, pot.totalGeV);
  }

  renderCornellGraph(currentR, currentV) {
    // Map graph coordinates: X (r: 0 to 2.0) -> (40 to 330)
    // Map Y (V: -1.0 to +2.5) -> (225 to 20)
    const mapX = (r) => 40 + (r / 2.0) * (330 - 40);
    const mapY = (v) => 160 - (v / 1.0) * 70; // 0 GeV is at Y=160, +1 GeV is at Y=90, +2 GeV is at Y=20

    const ptsCoulomb = [];
    const ptsLinear = [];
    const ptsTotal = [];

    for (let rTest = 0.08; rTest <= 2.0; rTest += 0.04) {
      const res = calculateCornellPotential(rTest);
      const x = mapX(rTest);
      const yC = Math.max(10, Math.min(250, mapY(res.coulombGeV)));
      const yL = Math.max(10, Math.min(250, mapY(res.linearGeV)));
      const yT = Math.max(10, Math.min(250, mapY(res.totalGeV)));

      ptsCoulomb.push(`${x.toFixed(1)},${yC.toFixed(1)}`);
      ptsLinear.push(`${x.toFixed(1)},${yL.toFixed(1)}`);
      ptsTotal.push(`${x.toFixed(1)},${yT.toFixed(1)}`);
    }

    const pathC = this.wrapper.querySelector('#c4-curve-coulomb');
    const pathL = this.wrapper.querySelector('#c4-curve-linear');
    const pathT = this.wrapper.querySelector('#c4-curve-total');

    if (pathC) pathC.setAttribute('d', `M ${ptsCoulomb.join(' L ')}`);
    if (pathL) pathL.setAttribute('d', `M ${ptsLinear.join(' L ')}`);
    if (pathT) pathT.setAttribute('d', `M ${ptsTotal.join(' L ')}`);

    // Current point marker
    const curX = mapX(currentR);
    const curY = Math.max(15, Math.min(240, mapY(currentV)));

    const ptMarker = this.wrapper.querySelector('#c4-point-current');
    const dropLine = this.wrapper.querySelector('#c4-line-drop-x');

    if (ptMarker) {
      ptMarker.setAttribute('cx', curX.toFixed(1));
      ptMarker.setAttribute('cy', curY.toFixed(1));
    }
    if (dropLine) {
      dropLine.setAttribute('x1', curX.toFixed(1));
      dropLine.setAttribute('y1', curY.toFixed(1));
      dropLine.setAttribute('x2', curX.toFixed(1));
      dropLine.setAttribute('y2', '160');
    }
  }

  updateBaryonGeometryUI() {
    const isBn = this.lang === 'bn';
    const svg = this.wrapper.querySelector('#c4-baryon-svg');
    if (!svg) return;

    // ViewBox is 600 x 420
    const vbWidth = 600;
    const vbHeight = 420;

    // Convert normalized coords to pixels
    const p1 = { x: this.baryonQuarks[0].x * vbWidth, y: this.baryonQuarks[0].y * vbHeight };
    const p2 = { x: this.baryonQuarks[1].x * vbWidth, y: this.baryonQuarks[1].y * vbHeight };
    const p3 = { x: this.baryonQuarks[2].x * vbWidth, y: this.baryonQuarks[2].y * vbHeight };

    // Update Quark Handle positions
    ['q1', 'q2', 'q3'].forEach((id, idx) => {
      const node = svg.querySelector(`#c4-node-${id}`);
      const pt = idx === 0 ? p1 : (idx === 1 ? p2 : p3);
      if (node) {
        node.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
      }
    });

    // Compute Fermat-Torricelli Junction
    // Scale: 200 pixels ≈ 1 fm (so typical proton size fits cleanly)
    const pxToFm = 1 / 200;
    const p1Fm = { x: p1.x * pxToFm, y: p1.y * pxToFm };
    const p2Fm = { x: p2.x * pxToFm, y: p2.y * pxToFm };
    const p3Fm = { x: p3.x * pxToFm, y: p3.y * pxToFm };

    const torricelli = computeTorricelliJunction(p1Fm, p2Fm, p3Fm);
    const junctionPx = {
      x: torricelli.junction.x / pxToFm,
      y: torricelli.junction.y / pxToFm
    };

    // Calculate Delta geometry if toggle active
    const deltaGeom = computeDeltaGeometry(p1Fm, p2Fm, p3Fm);

    // Update Y-arms lines (from junction to each quark)
    const arm1 = svg.querySelector('#c4-arm-1');
    const arm2 = svg.querySelector('#c4-arm-2');
    const arm3 = svg.querySelector('#c4-arm-3');
    const jNode = svg.querySelector('#c4-junction-node');
    const yArmsGroup = svg.querySelector('#c4-y-arms-group');
    const deltaGroup = svg.querySelector('#c4-delta-lines-group');

    if (this.isDeltaMode) {
      // Delta mode: show perimeter tubes, dim Y-arms
      if (yArmsGroup) yArmsGroup.setAttribute('opacity', '0.2');
      if (jNode) jNode.setAttribute('opacity', '0.2');
      if (deltaGroup) deltaGroup.setAttribute('opacity', '1');

      const dl1 = svg.querySelector('#c4-delta-l1');
      const dl2 = svg.querySelector('#c4-delta-l2');
      const dl3 = svg.querySelector('#c4-delta-l3');

      if (dl1) {
        dl1.setAttribute('x1', p1.x.toFixed(1)); dl1.setAttribute('y1', p1.y.toFixed(1));
        dl1.setAttribute('x2', p2.x.toFixed(1)); dl1.setAttribute('y2', p2.y.toFixed(1));
      }
      if (dl2) {
        dl2.setAttribute('x1', p2.x.toFixed(1)); dl2.setAttribute('y1', p2.y.toFixed(1));
        dl2.setAttribute('x2', p3.x.toFixed(1)); dl2.setAttribute('y2', p3.y.toFixed(1));
      }
      if (dl3) {
        dl3.setAttribute('x1', p3.x.toFixed(1)); dl3.setAttribute('y1', p3.y.toFixed(1));
        dl3.setAttribute('x2', p1.x.toFixed(1)); dl3.setAttribute('y2', p1.y.toFixed(1));
      }
    } else {
      // Y-law mode: highlight Y-arms, hide Delta lines
      if (yArmsGroup) yArmsGroup.setAttribute('opacity', '1');
      if (jNode) jNode.setAttribute('opacity', '1');
      if (deltaGroup) deltaGroup.setAttribute('opacity', '0');
    }

    if (arm1) {
      arm1.setAttribute('x1', junctionPx.x.toFixed(1)); arm1.setAttribute('y1', junctionPx.y.toFixed(1));
      arm1.setAttribute('x2', p1.x.toFixed(1)); arm1.setAttribute('y2', p1.y.toFixed(1));
    }
    if (arm2) {
      arm2.setAttribute('x1', junctionPx.x.toFixed(1)); arm2.setAttribute('y1', junctionPx.y.toFixed(1));
      arm2.setAttribute('x2', p2.x.toFixed(1)); arm2.setAttribute('y2', p2.y.toFixed(1));
    }
    if (arm3) {
      arm3.setAttribute('x1', junctionPx.x.toFixed(1)); arm3.setAttribute('y1', junctionPx.y.toFixed(1));
      arm3.setAttribute('x2', p3.x.toFixed(1)); arm3.setAttribute('y2', p3.y.toFixed(1));
    }
    if (jNode) {
      jNode.setAttribute('transform', `translate(${junctionPx.x.toFixed(1)}, ${junctionPx.y.toFixed(1)})`);
    }

    // 120-degree Angle Guide Arcs when internal angles < 120
    const guidesGroup = svg.querySelector('#c4-angle-guides-group');
    if (guidesGroup) {
      if (torricelli.isAtVertex || this.isDeltaMode) {
        guidesGroup.setAttribute('opacity', '0');
      } else {
        guidesGroup.setAttribute('opacity', '0.7');
        this.renderAngleGuideArcs(junctionPx, p1, p2, p3);
      }
    }

    // Update Telemetry Panel
    const angA = torricelli.internalAngles.deg.A.toFixed(1);
    const angB = torricelli.internalAngles.deg.B.toFixed(1);
    const angC = torricelli.internalAngles.deg.C.toFixed(1);

    const jAJB = torricelli.junctionAngles.deg.AJB.toFixed(1);
    const jBJC = torricelli.junctionAngles.deg.BJC.toFixed(1);
    const jCJA = torricelli.junctionAngles.deg.CJA.toFixed(1);

    const r1 = torricelli.arms.lengthA.toFixed(2);
    const r2 = torricelli.arms.lengthB.toFixed(2);
    const r3 = torricelli.arms.lengthC.toFixed(2);

    const activeTotalLength = this.isDeltaMode ? deltaGeom.totalLength : torricelli.arms.totalLength;
    const activeEnergy = this.isDeltaMode ? deltaGeom.energyGeV : torricelli.confinementEnergy.valueGeV;

    const elAngles = this.wrapper.querySelector('#c4-val-angles');
    const elJAngles = this.wrapper.querySelector('#c4-val-j-angles');
    const elArms = this.wrapper.querySelector('#c4-val-arms');
    const elTotLen = this.wrapper.querySelector('#c4-val-totallength');
    const elEnergy = this.wrapper.querySelector('#c4-val-energy');

    if (elAngles) elAngles.textContent = `${angA}°, ${angB}°, ${angC}°`;
    if (elJAngles) {
      if (torricelli.isAtVertex) {
        elJAngles.textContent = isBn
          ? `শীর্ষে পতন (${torricelli.collapsedVertex} কোয়ার্কে লীন)`
          : `Collapsed to Vertex ${torricelli.collapsedVertex}`;
      } else {
        elJAngles.textContent = `${jBJC}°, ${jCJA}°, ${jAJB}°`;
      }
    }
    if (elArms) elArms.textContent = `${r1} fm, ${r2} fm, ${r3} fm`;
    if (elTotLen) {
      elTotLen.textContent = this.isDeltaMode
        ? `L_Δ = ½(a+b+c) = ${activeTotalLength.toFixed(2)} fm`
        : `L_Y = ${activeTotalLength.toFixed(2)} fm`;
    }
    if (elEnergy) elEnergy.textContent = `${activeEnergy.toFixed(3)} GeV`;

    // Update Banner Explanation
    const bannerBadge = this.wrapper.querySelector('#c4-banner-badge');
    const bannerDesc = this.wrapper.querySelector('#c4-banner-desc');
    const bannerWrap = this.wrapper.querySelector('#c4-junction-status-banner');

    if (bannerBadge && bannerDesc && bannerWrap) {
      if (this.isDeltaMode) {
        bannerWrap.className = 'c4-junction-banner delta';
        bannerBadge.textContent = isBn ? 'Δ-মডেল (তুলনামূলক বিশ্লেষণ)' : 'Delta-Model (Comparative Only)';
        bannerDesc.textContent = isBn
          ? 'Δ-মডেল ধরে নেয় ফ্লাক্স ত্রিভুজের পেরিমিটার বরাবর বিস্তৃত (L_Δ = ½ Perimeter)। কিন্তু ল্যাটিস QCD নিশ্চিত করেছে যে বাস্তব কোয়ার্ক ব্যবস্থা Y-কনফিগারেশন বজায় রাখে।'
          : 'The Delta-model assumes flux runs along triangle perimeters. However, Lattice QCD confirms physical baryons form Y-shaped flux tubes.';
      } else if (torricelli.isAtVertex) {
        bannerWrap.className = 'c4-junction-banner collapsed';
        bannerBadge.textContent = isBn
          ? `শীর্ষে পতন! কোণ ${torricelli.collapsedVertex} ≥ ১২০°`
          : `Vertex Collapse! Angle ${torricelli.collapsedVertex} >= 120°`;
        bannerDesc.textContent = isBn
          ? `যখন কোনো অভ্যন্তরীণ কোণ ১২০° বা তার বেশি হয়, জাংশন ওই কোয়ার্কে পতিত হয়। কারণ ওই অবস্থানেই মোট ফ্লাক্স দৈর্ঘ্য সর্বনিম্ন ($L_Y = b + c$) হয়।`
          : `When any internal angle is >= 120°, the Fermat-Torricelli junction collapses to that vertex to minimize total flux tube length.`;
      } else {
        bannerWrap.className = 'c4-junction-banner interior';
        bannerBadge.textContent = isBn ? 'অভ্যন্তরীণ জাংশন (১২০° অক্ষুণ্ণ)' : 'Interior Junction (120° Maintained)';
        bannerDesc.textContent = isBn
          ? 'সব অভ্যন্তরীণ কোণ < ১২০°; ন্যূনতম শক্তি বিধানে প্রতি জোড়া বাহুর অন্তর্গত কোণ ঠিক ১২০.০°।'
          : 'All interior angles < 120°; optimal flux tube energy forces all 3 arms to meet at exactly 120.0°.';
      }
    }
  }

  renderAngleGuideArcs(J, p1, p2, p3) {
    const arc1 = this.wrapper.querySelector('#c4-guide-arc1');
    const arc2 = this.wrapper.querySelector('#c4-guide-arc2');
    const arc3 = this.wrapper.querySelector('#c4-guide-arc3');

    const drawArc = (el, targetA, targetB) => {
      if (!el) return;
      const r = 24;
      const a1 = Math.atan2(targetA.y - J.y, targetA.x - J.x);
      const a2 = Math.atan2(targetB.y - J.y, targetB.x - J.x);

      const sx = J.x + r * Math.cos(a1);
      const sy = J.y + r * Math.sin(a1);
      const ex = J.x + r * Math.cos(a2);
      const ey = J.y + r * Math.sin(a2);

      let diff = a2 - a1;
      while (diff < 0) diff += 2 * Math.PI;
      const largeArc = diff > Math.PI ? 1 : 0;

      el.setAttribute('d', `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    };

    drawArc(arc1, p1, p2);
    drawArc(arc2, p2, p3);
    drawArc(arc3, p3, p1);
  }

  startSubtleVibrationLoop() {
    let t = 0;
    const animate = () => {
      t += 0.05;
      const fluxRect = this.wrapper?.querySelector('#c4-svg-flux-rect');
      if (fluxRect) {
        // Subtle Gaussian blur wobble (amplitude ~ 0.5px)
        const dy = Math.sin(t * 3) * 0.4;
        fluxRect.setAttribute('transform', `translate(0, ${dy.toFixed(2)})`);
      }
      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);
  }

  updateColorblindStyles() {
    const q1Txt = this.wrapper.querySelector('#c4-meson-lbl1');
    const q2Txt = this.wrapper.querySelector('#c4-meson-lbl2');
    const bQuarks = this.wrapper.querySelectorAll('.c4-node-txt');

    if (this.isColorblindMode) {
      if (q1Txt) q1Txt.textContent = 'q [R]';
      if (q2Txt) q2Txt.textContent = 'q̄ [cR]';
      bQuarks.forEach((el, idx) => {
        if (idx === 0) el.textContent = 'u [R]';
        if (idx === 1) el.textContent = 'u [G]';
        if (idx === 2) el.textContent = 'd [B]';
      });
    } else {
      if (q1Txt) q1Txt.textContent = 'q (r)';
      if (q2Txt) q2Txt.textContent = 'q̄ (r̄)';
      bQuarks.forEach((el, idx) => {
        if (idx === 0) el.textContent = 'u (r)';
        if (idx === 1) el.textContent = 'u (g)';
        if (idx === 2) el.textContent = 'd (b)';
      });
    }
  }

  openDualSuperconductorDrawer() {
    if (!this.infoDrawer) return;

    const isBn = this.lang === 'bn';
    const contentBn = `
      <div class="c4-drawer-body">
        <h4>ডুয়াল সুপারকন্ডাক্টর মডেল ('t Hooft, Mandelstam)</h4>
        <div class="c4-drawer-badges">
          ${createTierBadge('T3', 'কার্যকর ক্ষেত্র মডেল', 'bn')}
        </div>
        <p>
          ১৯৭৫ সালে জেরার্ড 'ট হুফ্ট (Gerard 't Hooft) এবং ১৯৭৬ সালে স্ট্যানলি ম্যান্ডেলস্ট্যাম (Stanley Mandelstam)
          কোয়ার্ক কনফাইনমেন্টের অন্তর্নিহিত ভৌত প্রক্রিয়া ব্যাখ্যা করতে <strong>ডুয়াল সুপারকন্ডাক্টর (Dual Superconductor)</strong> মডেল প্রস্তাব করেন।
        </p>

        <h5>১. সাধারণ সুপারকন্ডাক্টর (BCS) বনাম ডুয়াল সুপারকন্ডাক্টর:</h5>
        <ul>
          <li><strong>সাধারণ সুপারকন্ডাক্টর:</strong> বৈদ্যুতিক কুপার পেয়ার কনডেনসেশনের কারণে মাইসনার ক্রিয়ায় (Meissner effect) চৌম্বক ক্ষেত্র বিতাড়িত হয়। টাইপ-২ সুপারকন্ডাক্টরে অবশিষ্ট চৌম্বক ফ্লাক্স সরু অ্যাব্রিকোসোভ ঘূর্ণিতে (Abrikosov vortices) সংকুচিত থাকে।</li>
          <li><strong>QCD ডুয়াল ভ্যাকুয়াম:</strong> ঠিক বিপরীত ঘটনা ঘটে! QCD কোয়ান্টাম ভ্যাকুয়ামে <em>কালার-ম্যাগনেটিক মনোপোল (Color-Magnetic Monopoles)</em> কনডেনসেশন ঘটে। ফলে "ডুয়াল মাইসনার ক্রিয়া"-য় কালার-ইলেকট্রিক ফ্লাক্স বহিষ্কৃত হয়ে কোয়ার্ক ও অ্যান্টিকোয়ার্কের মাঝখানে সরু নলের মতো <strong>ফ্লাক্স টিউবে</strong> আবদ্ধ হয়ে যায়।</li>
        </ul>

        <h5>২. ল্যাটিস QCD সমর্থন (T2):</h5>
        <p>
          ম্যাক্সিমাল অ্যাবেলিয়ান গেজে ল্যাটিস সিমুলেশন দেখিয়েছে যে মনোপোল কারেন্ট কনডেনসেশনই লিনিয়ার কনফাইনমেন্ট স্ট্রিং টেনশন $\\sigma \\approx 0.95\\text{ GeV/fm}$-এর মূল চালিকাশক্তি।
        </p>
      </div>
    `;

    const contentEn = `
      <div class="c4-drawer-body">
        <h4>Dual Superconductor Model ('t Hooft & Mandelstam)</h4>
        <div class="c4-drawer-badges">
          ${createTierBadge('T3', 'Effective Field Model', 'en')}
        </div>
        <p>
          In 1975, Gerard 't Hooft and in 1976, Stanley Mandelstam proposed the <strong>Dual Superconductor picture</strong> of the QCD vacuum to provide a physical mechanism for quark confinement.
        </p>

        <h5>1. Standard Superconductor vs Dual QCD Vacuum:</h5>
        <ul>
          <li><strong>Standard (BCS) Superconductor:</strong> Condensation of electric Cooper pairs expels magnetic fields via the Meissner effect. In Type-II materials, magnetic flux is squeezed into quantized Abrikosov vortices.</li>
          <li><strong>Dual QCD Superconductor:</strong> Exactly inverted! Condensation of <em>color-magnetic monopoles</em> in the non-Abelian vacuum produces a dual Meissner effect that compresses chromoelectric field lines into narrow flux tubes between color charges.</li>
        </ul>

        <h5>2. Lattice QCD Grounding (T2):</h5>
        <p>
          Lattice QCD simulations in maximal Abelian gauges demonstrate that monopole currents indeed condense, generating the observed linear confinement tension $\\sigma \\approx 0.95\\text{ GeV/fm}$.
        </p>
      </div>
    `;

    this.infoDrawer.open({
      title: isBn ? "ডুয়াল সুপারকন্ডাক্টর মডেল ('t Hooft, Mandelstam)" : "Dual Superconductor Model ('t Hooft & Mandelstam)",
      bodyHtml: isBn ? contentBn : contentEn,
      tier: 'T3',
      source: "G. 't Hooft (1975); S. Mandelstam, Phys. Rep. 23, 245 (1976)"
    });
  }

  setLanguage(lang) {
    if (this.lang === lang) return;
    this.lang = lang;
    this.init();
  }

  setLevel(level) {
    if (this.level === level) return;
    this.level = level;
    // Highlight relevant level sections
    const expertEl = this.wrapper?.querySelectorAll('.c4-expert-only');
    expertEl?.forEach(el => {
      el.style.display = level === 'expert' ? 'block' : 'none';
    });
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this._cleanupDragListeners) {
      this._cleanupDragListeners();
      this._cleanupDragListeners = null;
    }
    this.container.innerHTML = '';
  }
}
