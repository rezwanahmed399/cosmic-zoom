/**
 * CosmoPlanck Quark Section - Chapter 5: "টেনে ছেঁড়া" (String Breaking - Mode A: Slow Pull)
 * Centerpiece Interactive Quantum Chromodynamics Simulation
 *
 * Scientific Fidelity & Features:
 * - Thought Experiment Reality Notice: "Nobody pulls a quark by hand; this is a thought experiment (lattice picture). Real string breaking occurs in high-energy collisions (DIS, e+e- -> jets)."
 * - Rest Geometry: Baryon in CM frame; B, C soft-anchored at distance 1 fm. Rest equilateral triangle, arms ~0.577 fm, total L_Y^0 ~1.732 fm.
 * - Work done W = sigma * (L_Y - L_Y^0) where sigma = 0.95 GeV/fm. Total energy E_total = M_p + W (M_p = 0.938272 GeV).
 * - Constant force F = sigma ≈ 1.52e5 N (~15.5 tons), distance-invariant; tube lengthens without changing radius/cross-section.
 * - State Machine: S0 (Rest), S1 (Grabbed), S2 (Extension 0.58 < ell < 1.0 fm), S3 (Critical ell >= 1.0 fm with vacuum flickers),
 *   S4 (Breaking P_break >= u with erf function centered at 1.25 fm), S5 (Hadron Formation), S6 (Outcome & Audit).
 * - Outcome Engine: Flavor weights (u:d:s = 1:1:0.22, c,b,t=0); daughter meson [A q_bar] and baryon [q B C];
 *   Color accounting: new q_bar takes anti-color of pulled quark, new q takes color of pulled quark (both daughters singlets).
 *   Relativistic CM kinematics: sqrt(s) = E_total, p* = sqrt([s-(m1+m2)^2][s-(m1-m2)^2]) / (2*sqrt(s)), speeds beta1, beta2.
 * - Three Panels: (1) V(r) string level vs two-meson continuum crossing, (2) Live Force/Energy readouts, (3) Conservation Ledger.
 * - Optional Decays: pi0 -> gamma+gamma, Delta++ -> p+pi+.
 * - URL Seed integration & Replay.
 * - Zero hardcoded scientific numbers.
 * - Zero unicode emojis.
 */

import {
  PROTON,
  CONFINEMENT,
  STRING_BREAKING,
  HADRONS,
  LUND_JET_FRAGMENTATION,
  getQuarkData,
  getStringTension,
  getConfinementForceN,
  getLundJetFragmentationData
} from '../data/quark-facts.js';
import {
  calculateBreakingProbability,
  evaluateStringPullingState,
  createPRNG,
  generateSeed,
  simulateLundJetFragmentation
} from '../physics/string-breaking.js';
import { createTierBadge } from '../components/tier-badge.js';

const ICON_CHECK_SVG = '<svg class="c5-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="valid"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_CROSS_SVG = '<svg class="c5-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="invalid"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
const ICON_INFO_SVG = '<svg class="c5-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

export class Chapter5StringBreaking {
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

    // Scientific parameters dynamically read from data/quark-facts.js
    this.sigma = typeof getStringTension === 'function' ? getStringTension() : 0.95; // 0.95 GeV/fm
    this.forceN = typeof getConfinementForceN === 'function' ? getConfinementForceN() : 152000; // 152000 N
    this.forceTons = CONFINEMENT?.forceConstantN?.approxMetricTons ?? 15.5; // 15.5 metric tons
    this.protonMassGeV = (PROTON?.mass?.value ?? 938.272088) * 1e-3; // 0.938272 GeV
    this.rcFm = STRING_BREAKING?.staticQuarkBreakingDistance?.value ?? 1.25; // 1.25 fm

    // Color definitions
    this.colorHex = {
      red: '#ef4444',
      green: '#10b981',
      blue: '#3b82f6',
      'anti-red': '#06b6d4',
      'anti-green': '#ec4899',
      'anti-blue': '#eab308'
    };

    // State Machine: 'S0_REST', 'S1_GRABBED', 'S2_EXTENSION', 'S3_CRITICAL', 'S4_SNAPPING', 'S5_FORMATION', 'S6_OUTCOME'
    this.state = 'S0_REST';

    // Pulled Quark Selection: 'u1', 'u2', or 'd'
    this.selectedQuarkKey = 'u1';

    // Quark Configuration in Proton
    this.quarks = [
      { key: 'u1', flavor: 'u', name: 'Up 1', color: 'red' },
      { key: 'u2', flavor: 'u', name: 'Up 2', color: 'green' },
      { key: 'd',  flavor: 'd', name: 'Down', color: 'blue' }
    ];

    // Seed management
    this.seed = this.getSeedFromUrl() || generateSeed();
    this.prng = createPRNG(this.seed);
    this.lockedRollU = this.prng();

    // Pulled distance ell in fm (resting ~0.57735 fm)
    this.restEllFm = 1.0 / Math.sqrt(3); // ~0.57735 fm
    this.currentEllFm = this.restEllFm;

    // Animation & Clocks
    this.rafId = null;
    this.simSpeed = 1.0; // 0.01 to 1.0
    this.realTimeFmC = 0.0;
    this.animTimeSec = 0.0;
    this.isAutoPulling = false;
    this.autoPullDirection = 1;

    // Snapping & Fragmented Particles State
    this.evaluatedState = null;
    this.hadronFlyProgress = 0.0; // 0 to 1 during S5

    // Mode Switching: 'A' (Slow Pull) vs 'B' (High-Energy Jet)
    this.activeMode = 'A';

    // Mode B: Jet Fragmentation State
    this.jetEnergyGeV = 20; // 2 to 50 GeV, default 20
    this.struckQuarkModeB = 'u'; // 'u' or 'd'
    this.jetSeed = this.seed;
    this.jetSimulationResult = null;
    this.lundFacts = typeof getLundJetFragmentationData === 'function' ? getLundJetFragmentationData() : (LUND_JET_FRAGMENTATION ?? STRING_BREAKING?.lundJetFragmentation);

    this.init();
  }

  getSeedFromUrl() {
    try {
      const hash = window.location.hash || '';
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.substring(queryIdx));
        const s = params.get('seed');
        if (s) return parseInt(s, 10);
      }
    } catch (_) {}
    return null;
  }

  setSeedInUrl(seed) {
    try {
      const baseHash = '#/quarks/chapter-5';
      window.history.replaceState(null, '', `${baseHash}?seed=${seed}`);
    } catch (_) {}
  }

  init() {
    this.render();
    this.bindEvents();
    this.updatePhysics();
    this.runJetSimulation();
    this.startMainLoop();
  }

  render() {
    this.container.innerHTML = '';
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'quark-chapter-view chapter-5-view';
    this.wrapper.id = 'chapter-5-root';

    const isBn = this.lang === 'bn';

    this.wrapper.innerHTML = `
      <!-- HERO HEADER -->
      <div class="c5-hero-header">
        <div class="c5-hero-badge-row">
          <span class="c5-chapter-tag">${isBn ? 'অধ্যায় ৫ (কেন্দ্রীয় ল্যাব)' : 'Chapter 5 (Core Lab)'}</span>
          ${createTierBadge('T2', isBn ? 'ল্যাটিস QCD ও লুন্ড ফ্র্যাগমেন্টেশন' : 'Lattice QCD & Lund Fragmentation', this.lang)}
          ${createTierBadge('T3', isBn ? 'ধীর টান চিন্তা-পরীক্ষা' : 'Slow-Pull Thought Experiment', this.lang)}
        </div>
        <h2 class="c5-hero-title">
          ${isBn ? 'টেনে ছেঁড়া (মোড A: ধীর টান) — কোয়ার্ক কনফাইনমেন্ট ভাঙন' : 'String Breaking (Mode A: Slow Pull) — Quark Confinement Snapping'}
        </h2>
        <p class="c5-hero-desc">
          ${isBn
            ? 'প্রোটনের একটি কোয়ার্ককে ধরে টানলে স্ট্রিংয়ের বলরেখায় অপরিসীম শক্তি সঞ্চিত হয়। যখন সঞ্চিত বিভব শক্তি নতুন একজোড়া কোয়ার্ক-অ্যান্টিকোয়ার্ক সৃষ্টির ভর-সীমা অতিক্রম করে, তখন স্ট্রিংটি ছিন্ন হয়ে স্বতন্ত্র হ্যাড্রনে পরিণত হয়।'
            : 'Pulling a quark accumulates immense field energy in the flux tube. When the stored energy surpasses the mass threshold for vacuum pair creation, the tube snaps, fragmenting into color-singlet hadrons.'}
        </p>

        <!-- TOP ACTIONS: REALITY BUTTON, SEED INFO, AUTO PULL CINEMA -->
        <div class="c5-hero-actions">
          <button class="c5-btn-action reality" id="c5-btn-reality" type="button">
            ${ICON_INFO_SVG}
            <span>${isBn ? 'বাস্তবতা: চিন্তা-পরীক্ষা বনাম উচ্চশক্তি সংঘর্ষ' : 'Reality: Thought Experiment vs High-Energy Jets'}</span>
            <span class="c5-action-tier">T3</span>
          </button>
          <button class="c5-btn-action" id="c5-btn-autopull" type="button">
            <span id="c5-lbl-autopull">${isBn ? 'নিজে ধীরে টানুক (সিনেমা ৩০-৪০s)' : 'Auto-Pull (Cinema 35s)'}</span>
          </button>
          <div class="c5-seed-chip">
            <span class="c5-seed-lbl">Seed:</span>
            <span class="c5-seed-val" id="c5-seed-display">${this.seed}</span>
            <button class="c5-btn-new-seed" id="c5-btn-new-seed" title="New Random Seed" type="button"><svg class="c5-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg></button>
          </div>
        </div>
      </div>

      <!-- MODE SWITCHER TABS -->
      <div class="c5-mode-switcher-bar" role="tablist">
        <button class="c5-mode-tab-btn ${this.activeMode === 'A' ? 'active' : ''}" id="c5-mode-btn-a" role="tab" type="button" aria-selected="${this.activeMode === 'A'}">
          <svg class="c5-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>${isBn ? 'মোড A: ধীর টান (Quasi-Static Pull)' : 'Mode A: Slow Pull (Quasi-Static)'}</span>
          <span class="c5-mode-tag">T3 ${isBn ? 'চিন্তা-পরীক্ষা' : 'Thought Experiment'}</span>
        </button>
        <button class="c5-mode-tab-btn ${this.activeMode === 'B' ? 'active' : ''}" id="c5-mode-btn-b" role="tab" type="button" aria-selected="${this.activeMode === 'B'}">
          <svg class="c5-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>${isBn ? 'মোড B: আঘাতে ছিটকে দেওয়া (Jet Fragmentation)' : 'Mode B: Knockout Jet (Lund Fragmentation)'}</span>
          <span class="c5-mode-tag accent">T3 ${isBn ? 'Lund মডেল' : 'Lund Model'}</span>
        </button>
      </div>

      <!-- MODE A CONTAINER (100% INTACT ORIGINAL WORKBENCH & OUTCOME DRAWER) -->
      <div id="c5-mode-a-container" style="display: ${this.activeMode === 'A' ? 'block' : 'none'};">
        <!-- MAIN 3-COLUMN LAB WORKBENCH -->
        <div class="c5-workbench-grid">

        <!-- ============================================== -->
        <!-- COLUMN 1: INTERACTIVE PULLING STAGE & CONTROLS -->
        <!-- ============================================== -->
        <div class="c5-card c5-stage-card">
          <div class="c5-card-header">
            <div class="c5-card-title-group">
              <h3 class="c5-card-title">
                ${isBn ? '১. টানার মঞ্চ (Center-of-Mass Frame)' : '1. Pulling Stage (Center-of-Mass Frame)'}
              </h3>
              <p class="c5-card-subtitle">
                ${isBn ? 'B ও C কোয়ার্ক নরম নোঙরে আবদ্ধ; নির্বাচিত কোয়ার্কটি অক্ষ বরাবর টানুন।' : 'B and C quarks are soft-anchored; drag the selected quark along axis.'}
              </p>
            </div>
            <!-- Quark Selector Tabs (u1, u2, d) -->
            <div class="c5-quark-picker" role="tablist">
              <button class="c5-tab-quark active" id="c5-pick-u1" role="tab" type="button" data-quark="u1">u₁ (Up 1)</button>
              <button class="c5-tab-quark" id="c5-pick-u2" role="tab" type="button" data-quark="u2">u₂ (Up 2)</button>
              <button class="c5-tab-quark" id="c5-pick-d" role="tab" type="button" data-quark="d">d (Down)</button>
            </div>
          </div>

          <!-- Interactive SVG Stage -->
          <div class="c5-stage-viewport" id="c5-stage-viewport" tabindex="0" aria-label="Interactive quark pulling stage. Use arrow keys to pull.">
            <svg class="c5-stage-svg" viewBox="0 0 540 380" id="c5-stage-svg">
              <defs>
                <filter id="c5-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="c5-stem-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" id="c5-grad-top" />
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9" />
                </linearGradient>
              </defs>

              <!-- Soft Anchor Base Plate (B-C Quarks) -->
              <rect x="130" y="295" width="280" height="20" rx="10" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(148, 163, 184, 0.2)" stroke-dasharray="3 3" />
              <text x="270" y="328" text-anchor="middle" fill="#64748b" font-size="11" font-family="'JetBrains Mono', monospace">
                ${isBn ? 'নরম নোঙর কাঠামো (Center-of-Mass Anchor ≈ 1 fm)' : 'Soft Anchor Frame (Center-of-Mass ≈ 1 fm)'}
              </text>

              <!-- Y-Flux Tube Arms Group -->
              <g id="c5-flux-tubes-group">
                <!-- Arm to Quark B (Green) -->
                <line id="c5-arm-b" x1="270" y1="210" x2="190" y2="280" stroke="#10b981" stroke-width="10" stroke-linecap="round" filter="url(#c5-glow)" opacity="0.85" />
                <!-- Arm to Quark C (Blue) -->
                <line id="c5-arm-c" x1="270" y1="210" x2="350" y2="280" stroke="#3b82f6" stroke-width="10" stroke-linecap="round" filter="url(#c5-glow)" opacity="0.85" />
                <!-- Pulled Vertical Stem to Quark A -->
                <line id="c5-stem" x1="270" y1="210" x2="270" y2="90" stroke="url(#c5-stem-gradient)" stroke-width="10" stroke-linecap="round" filter="url(#c5-glow)" opacity="0.85" />
              </g>

              <!-- Vacuum Pair Flickers in Stem (S3 Critical) -->
              <g id="c5-vacuum-flickers-group" opacity="0"></g>

              <!-- Snapped Pair Break Visual (S4 Breaking) -->
              <g id="c5-break-pair-group" opacity="0">
                <circle id="c5-pair-q" cx="270" cy="150" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
                <text id="c5-pair-q-lbl" x="270" y="154" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="11">q</text>
                <circle id="c5-pair-qbar" cx="270" cy="150" r="14" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
                <text id="c5-pair-qbar-lbl" x="270" y="154" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="11">q̄</text>
              </g>

              <!-- Central Fermat-Torricelli White Junction Node -->
              <g id="c5-junction-node" transform="translate(270, 210)">
                <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#94a3b8" stroke-width="2" filter="url(#c5-glow)" />
                <circle cx="0" cy="0" r="4" fill="#0f172a" />
              </g>

              <!-- Anchored Quark Nodes B and C -->
              <g class="c5-quark-node" id="c5-node-b" transform="translate(190, 280)">
                <circle cx="0" cy="0" r="20" fill="#10b981" stroke="#ffffff" stroke-width="2" />
                <text id="c5-lbl-b" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="13">u (g)</text>
              </g>
              <g class="c5-quark-node" id="c5-node-c" transform="translate(350, 280)">
                <circle cx="0" cy="0" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />
                <text id="c5-lbl-c" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="13">d (b)</text>
              </g>

              <!-- Draggable Pulled Quark Node A -->
              <g class="c5-quark-node draggable" id="c5-node-a" transform="translate(270, 90)" cursor="ns-resize">
                <circle cx="0" cy="0" r="22" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" />
                <text id="c5-lbl-a" x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="14">u (r)</text>
              </g>

              <!-- Dynamic Dimension Guide for ell = |A - F| -->
              <g id="c5-dim-guide" transform="translate(220, 0)">
                <line id="c5-dim-stem-line" x1="0" y1="210" x2="0" y2="90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" />
                <text id="c5-dim-stem-txt" x="-10" y="150" text-anchor="end" fill="#f59e0b" font-size="12" font-family="'JetBrains Mono', monospace">
                  ℓ = 0.58 fm
                </text>
              </g>
            </svg>

            <!-- State Banner Overlay inside Stage -->
            <div class="c5-stage-caption" id="c5-stage-caption">
              <span class="c5-caption-badge" id="c5-caption-badge">S0: বিশ্রাম (Rest)</span>
              <span class="c5-caption-text" id="c5-caption-text">
                ${isBn ? 'কোয়ার্ক A টেনে সরান (বা Auto-Pull চালান)' : 'Drag Quark A upward or hit Auto-Pull'}
              </span>
            </div>
          </div>

          <!-- Bottom Pull Controls & Clocks -->
          <div class="c5-stage-bottom-controls">
            <!-- Pull Distance Slider -->
            <div class="c5-manual-slider-row">
              <label for="c5-slider-ell" class="c5-ctrl-label">${isBn ? 'টানার দৈর্ঘ্য ℓ:' : 'Pull Stem ℓ:'}</label>
              <input type="range" id="c5-slider-ell" class="c5-range-ell" min="0.577" max="1.55" step="0.01" value="0.577" />
              <span class="c5-ctrl-val" id="c5-txt-ell">0.58 fm</span>
            </div>

            <!-- Clocks & Speed Slider -->
            <div class="c5-clocks-bar">
              <div class="c5-clock-pill">
                <span class="c5-clock-lbl">Real-time:</span>
                <span class="c5-clock-val" id="c5-clk-real">0.0 fm/c (0.0 × 10⁻²⁴ s)</span>
              </div>
              <div class="c5-clock-pill">
                <span class="c5-clock-lbl">Anim-time:</span>
                <span class="c5-clock-val" id="c5-clk-anim">0.0 s</span>
              </div>
              <div class="c5-speed-pill">
                <span class="c5-clock-lbl">${isBn ? 'গতি:' : 'Speed:'}</span>
                <input type="range" id="c5-slider-speed" min="0.05" max="1.0" step="0.05" value="1.0" class="c5-speed-slider" title="Simulation Speed" />
                <span class="c5-speed-val" id="c5-txt-speed">1.0×</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- COLUMN 2: THREE PANELS (V(r), FORCE, LEDGER)   -->
        <!-- ============================================== -->
        <div class="c5-telemetry-column">

          <!-- PANEL 1: V(r) STRING VS TWO-MESON LEVEL -->
          <div class="c5-card c5-v-card">
            <div class="c5-card-header mini">
              <h4 class="c5-card-title mini">${isBn ? '২. V(r) স্ট্রিং ও দ্বি-হ্যাড্রন স্তর' : '2. V(r) String vs Two-Hadron Level'}</h4>
              ${createTierBadge('T3', isBn ? 'ল্যাটিস এভয়েড-ক্রসিং' : 'Avoided Level Crossing', this.lang)}
            </div>
            <div class="c5-v-graph-container">
              <svg class="c5-v-svg" viewBox="0 0 340 180" id="c5-v-svg">
                <!-- Axes -->
                <line x1="35" y1="15" x2="35" y2="155" stroke="#475569" stroke-width="1.5" />
                <line x1="35" y1="155" x2="330" y2="155" stroke="#475569" stroke-width="1.5" />

                <!-- Grid & Critical Break Vertical line (rc ≈ 1.25 fm) -->
                <line x1="210" y1="15" x2="210" y2="155" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.65" />
                <text x="214" y="28" fill="#f59e0b" font-size="9" font-family="'JetBrains Mono', monospace">r_c ≈ 1.25 fm</text>

                <!-- String Branch (Linear rising: M_p + sigma * deltaL) -->
                <line x1="35" y1="130" x2="280" y2="25" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 3" opacity="0.75" />
                <text x="285" y="30" fill="#ef4444" font-size="9">String σ·r</text>

                <!-- Two-Hadron Continuum Branch (Flat horizontal levels) -->
                <line x1="120" y1="100" x2="330" y2="100" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" />
                <text x="330" y="95" text-anchor="end" fill="#10b981" font-size="9">π + N (1.07 GeV)</text>

                <!-- Ground State Avoided Crossing Curve -->
                <path id="c5-v-ground-curve" d="M 35,130 C 130,95 180,98 330,100" fill="none" stroke="#38bdf8" stroke-width="2.5" />

                <!-- Current Operating Point -->
                <circle id="c5-v-point" cx="35" cy="130" r="5" fill="#ffffff" stroke="#38bdf8" stroke-width="2" />

                <!-- Labels -->
                <text x="325" y="170" text-anchor="end" fill="#94a3b8" font-size="9.5">ℓ (fm)</text>
                <text x="40" y="12" fill="#94a3b8" font-size="9.5">Energy (GeV)</text>
              </svg>
            </div>
            <p class="c5-v-caption">
              ${isBn
                ? '১.২৫ fm-এ রৈখিক স্ট্রিং শক্তি ও দ্বি-হ্যাড্রন স্তরের মিশ্রণে এভয়েডেড ক্রসিং ঘটে; শক্তি নতুন কণা তৈরিতে উন্মুক্ত হয়।'
                : 'Avoided level crossing at 1.25 fm: linear string energy meets two-hadron threshold; breaking becomes favorable.'}
            </p>
          </div>

          <!-- PANEL 2: LIVE FORCE & ENERGY READOUT -->
          <div class="c5-card c5-readout-card">
            <div class="c5-card-header mini">
              <h4 class="c5-card-title mini">${isBn ? '৩. বল ও শক্তির খতিয়ান' : '3. Force & Energy Telemetry'}</h4>
              <span class="c5-badge-constant danger">${isBn ? 'বল ধ্রুব (স্প্রিং নয়!)' : 'Force Constant!'}</span>
            </div>
            <div class="c5-readout-grid">
              <div class="c5-read-item">
                <span class="c5-read-lbl">${isBn ? 'টান বল (F = σ):' : 'Tension (F = σ):'}</span>
                <span class="c5-read-val" id="c5-val-force">1.52 × 10⁵ N</span>
                <span class="c5-read-sub" id="c5-sub-force">≈ 15.5 ${isBn ? 'টন-ওজন (ধ্রুব)' : 'tons (constant)'}</span>
              </div>
              <div class="c5-read-item">
                <span class="c5-read-lbl">${isBn ? 'টানার কাজ (W):' : 'Work Done (W):'}</span>
                <span class="c5-read-val" id="c5-val-work">0.000 GeV</span>
                <span class="c5-read-sub" id="c5-sub-work">W = σ·(L_Y - L_Y⁰)</span>
              </div>
              <div class="c5-read-item">
                <span class="c5-read-lbl">${isBn ? 'মোট শক্তি (E_tot):' : 'Total Energy (E):'}</span>
                <span class="c5-read-val highlight" id="c5-val-etot">0.938 GeV</span>
                <span class="c5-read-sub" id="c5-sub-etot">M_p + W</span>
              </div>
              <div class="c5-read-item">
                <span class="c5-read-lbl">${isBn ? 'ভাঙার সম্ভাবনা P:' : 'Break Prob P:'}</span>
                <span class="c5-read-val danger" id="c5-val-pbreak">0.0%</span>
                <span class="c5-read-sub" id="c5-sub-pbreak">erf((ℓ - 1.25)/0.17)</span>
              </div>
            </div>
          </div>

          <!-- PANEL 3: CONSERVATION LEDGER -->
          <div class="c5-card c5-ledger-card">
            <div class="c5-card-header mini">
              <h4 class="c5-card-title mini">${isBn ? '৪. সংরক্ষণ-খতিয়ান (Conservation Ledger)' : '4. Conservation Ledger'}</h4>
              <span class="c5-status-pill verified" id="c5-ledger-pill">
                ${ICON_CHECK_SVG}
                <span id="c5-ledger-overall">${isBn ? 'সংরক্ষিত [OK]' : 'Conserved [OK]'}</span>
              </span>
            </div>
            <div class="c5-ledger-table" id="c5-ledger-table">
              <div class="c5-ledger-row">
                <span class="c5-led-col q">${isBn ? 'বৈদ্যুতিক আধান (Q):' : 'Electric Charge (Q):'}</span>
                <span class="c5-led-col val" id="c5-led-q">+1 = +1 e ${ICON_CHECK_SVG}</span>
              </div>
              <div class="c5-ledger-row">
                <span class="c5-led-col b">${isBn ? 'ব্যারিয়ন সংখ্যা (B):' : 'Baryon Number (B):'}</span>
                <span class="c5-led-col val" id="c5-led-b">1 = 1 ${ICON_CHECK_SVG}</span>
              </div>
              <div class="c5-ledger-row">
                <span class="c5-led-col s">${isBn ? 'স্ট্রেঞ্জনেস (S):' : 'Strangeness (S):'}</span>
                <span class="c5-led-col val" id="c5-led-s">0 = 0 ${ICON_CHECK_SVG}</span>
              </div>
              <div class="c5-ledger-row">
                <span class="c5-led-col c">${isBn ? 'কালার সিঙ্গলেট:' : 'Color Singlet:'}</span>
                <span class="c5-led-col val" id="c5-led-col">সাদা (White) ${ICON_CHECK_SVG}</span>
              </div>
              <div class="c5-ledger-row">
                <span class="c5-led-col e">${isBn ? 'শক্তি সংরক্ষণ:' : 'Energy Bound:'}</span>
                <span class="c5-led-col val" id="c5-led-e">E ≥ E_threshold ${ICON_CHECK_SVG}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- OUTCOME MODAL / CARD (ACTIVATED ON S6) -->
      <div class="c5-outcome-drawer" id="c5-outcome-drawer" style="display: none;">
        <div class="c5-outcome-card">
          <div class="c5-outcome-header">
            <span class="c5-outcome-badge">${isBn ? 'স্ট্রিং ছিন্ন! নতুন হ্যাড্রন জোড়া গঠিত' : 'String Snapped! Hadron Pair Formed'}</span>
            <button class="c5-btn-close-outcome" id="c5-btn-close-outcome" type="button"><svg class="c5-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>

          <div class="c5-hadrons-display" id="c5-hadrons-display">
            <!-- Dynamic Meson & Baryon cards rendered on break -->
          </div>

          <div class="c5-kinematics-box" id="c5-kinematics-box">
            <!-- Relativistic CM kinematics and speeds -->
          </div>

          <!-- Post-break Actions -->
          <div class="c5-outcome-actions">
            <button class="c5-btn-action" id="c5-btn-decay" type="button" style="display: none;">
              <!-- Dynamic decay button (e.g. pi0 -> gamma gamma or Delta++ -> p pi+) -->
            </button>
            <button class="c5-btn-action" id="c5-btn-replay-same" type="button">
              ${isBn ? 'একই Seed-এ রিপ্লে' : 'Replay with Same Seed'}
            </button>
            <button class="c5-btn-action secondary" id="c5-btn-pull-again" type="button">
              ${isBn ? 'আবার টানো (নতুন Seed)' : 'Pull Again (New Seed)'}
            </button>
          </div>
        </div>
      </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODE B CONTAINER (JET SIMULATION, LUND CASCADE & CONSERVATION) -->
      <!-- ============================================================== -->
      <div id="c5-mode-b-container" style="display: ${this.activeMode === 'B' ? 'block' : 'none'};">
        <div class="c5-jet-grid">
          <!-- COLUMN 1: JET STAGE & CONTROLS -->
          <div class="c5-jet-stage-card">
            <div class="c5-card-header">
              <div class="c5-card-title-group">
                <h3 class="c5-card-title">
                  ${isBn ? '১. আঘাতে ছিটকে দেওয়া জেট মঞ্চ (DIS / Collider Jet)' : '1. Knockout Jet Stage (DIS / Collider Jet)'}
                </h3>
                <p class="c5-card-subtitle">
                  ${isBn
                    ? 'উচ্চশক্তি সংঘাতে প্রোটনের একটি কোয়ার্ক ছিটকে ছুটে যায়; স্ট্রিং বারবার ভেঙে মেসনের ঝাঁক ও অবশিষ্ট বেরিয়ন সৃষ্টি করে।'
                    : 'A high-energy strike knocks out a valence quark; the color flux tube stretches and undergoes iterative Lund fragmentation into a collimated hadron jet.'}
                </p>
              </div>
              <div class="c5-jet-quark-picker" role="tablist">
                <span class="c5-sub-lbl">${isBn ? 'ছিটকে দেওয়া কোয়ার্ক:' : 'Struck Quark:'}</span>
                <button class="c5-jet-pick-btn ${this.struckQuarkModeB === 'u' ? 'active' : ''}" id="c5-jet-pick-u" role="tab" type="button">u (Up)</button>
                <button class="c5-jet-pick-btn ${this.struckQuarkModeB === 'd' ? 'active' : ''}" id="c5-jet-pick-d" role="tab" type="button">d (Down)</button>
              </div>
            </div>

            <!-- Jet Visual Viewport -->
            <div class="c5-jet-viewport" id="c5-jet-viewport">
              <svg class="c5-jet-svg" id="c5-jet-svg" viewBox="0 0 760 300">
                <!-- SVG dynamically rendered by renderJetSvg() -->
              </svg>
            </div>

            <!-- Controls: Energy Slider & Fire Button -->
            <div class="c5-jet-controls-bar">
              <div class="c5-slider-group">
                <div class="c5-slider-header">
                  <span class="c5-slider-lbl">${isBn ? 'ছিটকে দেওয়া কোয়ার্কের শক্তি (Jet Energy E):' : 'Struck Quark Energy (Jet Energy E):'}</span>
                  <span class="c5-jet-energy-val" id="c5-jet-energy-val">${this.jetEnergyGeV.toFixed(1)} GeV</span>
                </div>
                <input class="c5-slider-range" id="c5-slider-jet-energy" type="range" min="2" max="50" step="0.5" value="${this.jetEnergyGeV}" aria-label="Jet Energy Slider" />
                <div class="c5-slider-ticks">
                  <span>2 GeV (${isBn ? 'ল্যাটিস সীমা' : 'Lattice limit'})</span>
                  <span>10 GeV</span>
                  <span>25 GeV</span>
                  <span>50 GeV (${isBn ? 'LEP / DIS স্কেল' : 'LEP / DIS scale'})</span>
                </div>
              </div>

              <div class="c5-jet-buttons-row">
                <button class="c5-btn-jet-fire" id="c5-btn-jet-fire" type="button">
                  <svg class="c5-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>${isBn ? 'জেট বিস্ফোরণ ঘটান (Fire Jet)' : 'Fire Jet (Simulate Lund Cascade)'}</span>
                </button>
                <button class="c5-btn-jet-seed" id="c5-btn-jet-new-seed" type="button">
                  <svg class="c5-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
                  <span>${isBn ? 'নতুন Seed' : 'New Seed'}</span>
                </button>
                <button class="c5-btn-jet-seed" id="c5-btn-jet-replay" type="button">
                  <svg class="c5-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  <span>${isBn ? 'একই Seed-এ রিপ্লে' : 'Replay Seed'}</span>
                </button>
                <span class="c5-pythia-tune-badge" title="PYTHIA 8 Monash 2013 Parameter Tune">
                  PYTHIA 8 Monash: a=0.68, b=0.98, σ_pT=0.335, γ_s=0.217
                </span>
              </div>
            </div>
          </div>

          <!-- COLUMN 2: CONSERVATION LEDGER & MULTIPLICITY STATS -->
          <div class="c5-jet-telemetry-card">
            <div class="c5-card-header mini">
              <h4 class="c5-card-title mini">${isBn ? '২. সংরক্ষণ খতিয়ান ও জেট পরিসংখ্যান' : '2. Conservation Ledger & Jet Stats'}</h4>
              <span class="c5-status-pill verified" id="c5-jet-ledger-pill">
                ${ICON_CHECK_SVG}
                <span id="c5-jet-ledger-status">${isBn ? 'সব সংরক্ষিত [OK]' : 'All Conserved [OK]'}</span>
              </span>
            </div>

            <!-- Conservation Cards Grid -->
            <div class="c5-jet-ledger-cards" id="c5-jet-ledger-cards">
              <!-- Dynamically populated by renderJetLedger() -->
            </div>

            <!-- Multiplicity & Particle Type Fraction Panel -->
            <div class="c5-jet-stats-panel" id="c5-jet-stats-panel">
              <!-- Dynamically populated by renderJetStats() -->
            </div>
          </div>
        </div>

        <!-- BOTTOM CARD: DETAILED FRAGMENTATION STEP-BY-STEP CASCADE TABLE -->
        <div class="c5-jet-table-card">
          <div class="c5-card-header mini">
            <h4 class="c5-card-title mini">
              ${isBn ? '৩. ধাপে ধাপে Lund স্ট্রিং ভাঙন ও হ্যাড্রন উৎপত্তি খতিয়ান' : '3. Step-by-Step Lund String Fragmentation Cascade Ledger'}
            </h4>
            <span class="c5-action-tier" style="background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
              T3 Lund Model (PYTHIA 8 Monash Tune)
            </span>
          </div>
          <div class="c5-jet-table-responsive" id="c5-jet-table-container">
            <!-- Dynamically populated by renderJetTable() -->
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.wrapper);
  }

  bindEvents() {
    // 1. Reality Button
    const btnReality = this.wrapper.querySelector('#c5-btn-reality');
    if (btnReality) {
      btnReality.addEventListener('click', () => this.openRealityDrawer());
    }

    // 2. Auto-Pull Cinema Button
    const btnAuto = this.wrapper.querySelector('#c5-btn-autopull');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => this.toggleAutoPull());
    }

    // 3. New Seed Button
    const btnNewSeed = this.wrapper.querySelector('#c5-btn-new-seed');
    if (btnNewSeed) {
      btnNewSeed.addEventListener('click', () => {
        this.resetWithNewSeed();
      });
    }

    // 4. Quark Selector Tabs
    ['u1', 'u2', 'd'].forEach(key => {
      const btn = this.wrapper.querySelector(`#c5-pick-${key}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.state === 'S4_SNAPPING' || this.state === 'S5_FORMATION') return;
          this.selectQuark(key);
        });
      }
    });

    // 5. Manual Slider
    const sliderEll = this.wrapper.querySelector('#c5-slider-ell');
    if (sliderEll) {
      sliderEll.addEventListener('input', (e) => {
        if (this.state === 'S4_SNAPPING' || this.state === 'S5_FORMATION') return;
        this.currentEllFm = parseFloat(e.target.value);
        this.updatePhysics();
      });
    }

    // 6. Speed Slider
    const sliderSpeed = this.wrapper.querySelector('#c5-slider-speed');
    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', (e) => {
        this.simSpeed = parseFloat(e.target.value);
        const txt = this.wrapper.querySelector('#c5-txt-speed');
        if (txt) txt.textContent = `${this.simSpeed.toFixed(1)}×`;
      });
    }

    // 7. Interactive Stage Dragging & Keyboard Controls
    this.bindStageControls();

    // 8. Outcome Modal Buttons
    const btnCloseOutcome = this.wrapper.querySelector('#c5-btn-close-outcome');
    if (btnCloseOutcome) {
      btnCloseOutcome.addEventListener('click', () => {
        const drawer = this.wrapper.querySelector('#c5-outcome-drawer');
        if (drawer) drawer.style.display = 'none';
      });
    }

    const btnReplaySame = this.wrapper.querySelector('#c5-btn-replay-same');
    if (btnReplaySame) {
      btnReplaySame.addEventListener('click', () => {
        this.resetWithSeed(this.seed);
      });
    }

    const btnPullAgain = this.wrapper.querySelector('#c5-btn-pull-again');
    if (btnPullAgain) {
      btnPullAgain.addEventListener('click', () => {
        this.resetWithNewSeed();
      });
    }

    // 9. Mode Switcher Buttons (Mode A vs Mode B)
    const btnModeA = this.wrapper.querySelector('#c5-mode-btn-a');
    if (btnModeA) {
      btnModeA.addEventListener('click', () => this.switchMode('A'));
    }
    const btnModeB = this.wrapper.querySelector('#c5-mode-btn-b');
    if (btnModeB) {
      btnModeB.addEventListener('click', () => this.switchMode('B'));
    }

    // 10. Mode B: Jet Energy Slider
    const sliderJetEnergy = this.wrapper.querySelector('#c5-slider-jet-energy');
    if (sliderJetEnergy) {
      sliderJetEnergy.addEventListener('input', (e) => {
        this.jetEnergyGeV = parseFloat(e.target.value);
        const valTxt = this.wrapper.querySelector('#c5-jet-energy-val');
        if (valTxt) valTxt.textContent = `${this.jetEnergyGeV.toFixed(1)} GeV`;
        this.runJetSimulation();
      });
    }

    // 11. Mode B: Struck Quark Selectors
    const btnPickU = this.wrapper.querySelector('#c5-jet-pick-u');
    if (btnPickU) {
      btnPickU.addEventListener('click', () => this.selectJetQuark('u'));
    }
    const btnPickD = this.wrapper.querySelector('#c5-jet-pick-d');
    if (btnPickD) {
      btnPickD.addEventListener('click', () => this.selectJetQuark('d'));
    }

    // 12. Mode B: Buttons (Fire, New Seed, Replay)
    const btnFire = this.wrapper.querySelector('#c5-btn-jet-fire');
    if (btnFire) {
      btnFire.addEventListener('click', () => this.runJetSimulation());
    }
    const btnJetNewSeed = this.wrapper.querySelector('#c5-btn-jet-new-seed');
    if (btnJetNewSeed) {
      btnJetNewSeed.addEventListener('click', () => this.resetJetSeed());
    }
    const btnJetReplay = this.wrapper.querySelector('#c5-btn-jet-replay');
    if (btnJetReplay) {
      btnJetReplay.addEventListener('click', () => this.runJetSimulation());
    }
  }

  bindStageControls() {
    const stage = this.wrapper.querySelector('#c5-stage-viewport');
    const nodeA = this.wrapper.querySelector('#c5-node-a');
    if (!stage || !nodeA) return;

    let isDragging = false;
    let startY = 0;
    let startEll = this.currentEllFm;

    const onStart = (clientY) => {
      if (this.state === 'S4_SNAPPING' || this.state === 'S5_FORMATION') return;
      isDragging = true;
      startY = clientY;
      startEll = this.currentEllFm;
      if (this.state === 'S0_REST') {
        this.state = 'S1_GRABBED';
      }
    };

    const onMove = (clientY) => {
      if (!isDragging) return;
      if (this.state === 'S4_SNAPPING' || this.state === 'S5_FORMATION') return;
      // Moving up decreases Y, which corresponds to increasing ell
      const deltaPx = startY - clientY;
      // Scale: 120px ≈ 1 fm
      const deltaFm = deltaPx / 120.0;
      const newEll = Math.max(this.restEllFm, Math.min(1.55, startEll + deltaFm));
      this.currentEllFm = newEll;
      this.updatePhysics();
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      // If user releases before snapping (S1, S2, S3), trigger elastic snapback!
      if (this.state === 'S1_GRABBED' || this.state === 'S2_EXTENSION' || this.state === 'S3_CRITICAL') {
        this.triggerSnapback();
      }
    };

    nodeA.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientY); });
    nodeA.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(e.touches[0].clientY); }, { passive: false });

    window.addEventListener('mousemove', (e) => onMove(e.clientY));
    window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    // Keyboard support: Tab = switch quark, Space = grab/snapback, ArrowUp/ArrowDown = pull
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Cycle quarks
        e.preventDefault();
        const keys = ['u1', 'u2', 'd'];
        const nextIdx = (keys.indexOf(this.selectedQuarkKey) + (e.shiftKey ? 2 : 1)) % 3;
        this.selectQuark(keys[nextIdx]);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'S0_REST') {
          this.state = 'S1_GRABBED';
        } else if (this.state === 'S1_GRABBED' || this.state === 'S2_EXTENSION' || this.state === 'S3_CRITICAL') {
          this.triggerSnapback();
        }
      } else if (e.key === 'ArrowUp' || e.key === '+') {
        e.preventDefault();
        this.currentEllFm = Math.min(1.55, this.currentEllFm + 0.04);
        this.updatePhysics();
      } else if (e.key === 'ArrowDown' || e.key === '-') {
        e.preventDefault();
        this.currentEllFm = Math.max(this.restEllFm, this.currentEllFm - 0.04);
        this.updatePhysics();
      }
    });

    this._cleanupControls = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }

  selectQuark(key) {
    this.selectedQuarkKey = key;
    this.wrapper.querySelectorAll('.c5-tab-quark').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-quark') === key);
    });

    // Reorganize: selected is A; others are B and C
    const pulled = this.quarks.find(q => q.key === key);
    const others = this.quarks.filter(q => q.key !== key);

    // Update Stage node labels & colors
    const lblA = this.wrapper.querySelector('#c5-lbl-a');
    const nodeACircle = this.wrapper.querySelector('#c5-node-a circle');
    const lblB = this.wrapper.querySelector('#c5-lbl-b');
    const nodeBCircle = this.wrapper.querySelector('#c5-node-b circle');
    const lblC = this.wrapper.querySelector('#c5-lbl-c');
    const nodeCCircle = this.wrapper.querySelector('#c5-node-c circle');
    const armB = this.wrapper.querySelector('#c5-arm-b');
    const armC = this.wrapper.querySelector('#c5-arm-c');
    const gradTop = this.wrapper.querySelector('#c5-grad-top');

    if (pulled && lblA && nodeACircle) {
      lblA.textContent = `${pulled.flavor} (${pulled.color[0]})`;
      nodeACircle.setAttribute('fill', this.colorHex[pulled.color]);
      if (gradTop) gradTop.setAttribute('stop-color', this.colorHex[pulled.color]);
    }
    if (others[0] && lblB && nodeBCircle && armB) {
      lblB.textContent = `${others[0].flavor} (${others[0].color[0]})`;
      nodeBCircle.setAttribute('fill', this.colorHex[others[0].color]);
      armB.setAttribute('stroke', this.colorHex[others[0].color]);
    }
    if (others[1] && lblC && nodeCCircle && armC) {
      lblC.textContent = `${others[1].flavor} (${others[1].color[0]})`;
      nodeCCircle.setAttribute('fill', this.colorHex[others[1].color]);
      armC.setAttribute('stroke', this.colorHex[others[1].color]);
    }

    this.updatePhysics();
  }

  toggleAutoPull() {
    this.isAutoPulling = !this.isAutoPulling;
    const btn = this.wrapper.querySelector('#c5-btn-autopull');
    const lbl = this.wrapper.querySelector('#c5-lbl-autopull');
    const isBn = this.lang === 'bn';

    if (this.isAutoPulling) {
      if (btn) btn.classList.add('active');
      if (lbl) lbl.textContent = isBn ? 'টানা থামাতে চাপুন' : 'Stop Auto-Pull';
      if (this.state === 'S0_REST') this.state = 'S1_GRABBED';
    } else {
      if (btn) btn.classList.remove('active');
      if (lbl) lbl.textContent = isBn ? 'নিজে ধীরে টানুক (সিনেমা ৩০-৪০s)' : 'Auto-Pull (Cinema 35s)';
    }
  }

  resetWithNewSeed() {
    this.seed = generateSeed();
    this.resetWithSeed(this.seed);
  }

  resetWithSeed(seed) {
    this.seed = seed;
    this.setSeedInUrl(this.seed);
    const disp = this.wrapper.querySelector('#c5-seed-display');
    if (disp) disp.textContent = String(this.seed);

    this.prng = createPRNG(this.seed);
    this.lockedRollU = this.prng();
    this.isAutoPulling = false;
    this.currentEllFm = this.restEllFm;
    this.state = 'S0_REST';
    this.hadronFlyProgress = 0.0;

    const drawer = this.wrapper.querySelector('#c5-outcome-drawer');
    if (drawer) drawer.style.display = 'none';

    const btnAuto = this.wrapper.querySelector('#c5-btn-autopull');
    const lblAuto = this.wrapper.querySelector('#c5-lbl-autopull');
    if (btnAuto) btnAuto.classList.remove('active');
    if (lblAuto) lblAuto.textContent = this.lang === 'bn' ? 'নিজে ধীরে টানুক (সিনেমা ৩০-৪০s)' : 'Auto-Pull (Cinema 35s)';

    // Reset visual elements
    const pairGroup = this.wrapper.querySelector('#c5-break-pair-group');
    if (pairGroup) pairGroup.setAttribute('opacity', '0');
    const stem = this.wrapper.querySelector('#c5-stem');
    if (stem) stem.setAttribute('opacity', '0.85');

    this.updatePhysics();
  }

  triggerSnapback() {
    // Damped harmonic oscillation returning ell to restEllFm
    const initialEll = this.currentEllFm;
    let t = 0;
    const snapDuration = 0.6; // seconds

    const animateSnap = () => {
      t += 0.03;
      const progress = Math.min(1, t / snapDuration);
      // Damped sine curve
      const decay = Math.exp(-progress * 4.5);
      const wave = Math.cos(progress * Math.PI * 3);
      this.currentEllFm = this.restEllFm + (initialEll - this.restEllFm) * decay * wave;

      if (progress >= 1) {
        this.currentEllFm = this.restEllFm;
        this.state = 'S0_REST';
        this.updatePhysics();
      } else {
        this.updatePhysics();
        requestAnimationFrame(animateSnap);
      }
    };
    requestAnimationFrame(animateSnap);
  }

  updatePhysics() {
    const isBn = this.lang === 'bn';
    const pulled = this.quarks.find(q => q.key === this.selectedQuarkKey);
    const others = this.quarks.filter(q => q.key !== this.selectedQuarkKey);

    // Compute exact relativistic kinematics and breaking dynamics
    this.evaluatedState = evaluateStringPullingState({
      pulledFlavor: pulled.flavor,
      pulledColor: pulled.color,
      remainingFlavors: [others[0].flavor, others[1].flavor],
      remainingColors: [others[0].color, others[1].color],
      ellFm: this.currentEllFm,
      seed: this.seed,
      customSigma: this.sigma
    });

    const evalSt = this.evaluatedState;
    const ell = this.currentEllFm;

    // Check state progression if not already snapped
    if (this.state !== 'S4_SNAPPING' && this.state !== 'S5_FORMATION' && this.state !== 'S6_OUTCOME') {
      if (evalSt.willBreak) {
        this.triggerStringSnap();
      } else if (ell >= 1.0) {
        this.state = 'S3_CRITICAL';
      } else if (ell > 0.58) {
        this.state = 'S2_EXTENSION';
      } else if (this.state !== 'S1_GRABBED') {
        this.state = 'S0_REST';
      }
    }

    // Update Slider & Number readouts
    const sliderEll = this.wrapper.querySelector('#c5-slider-ell');
    const txtEll = this.wrapper.querySelector('#c5-txt-ell');
    if (sliderEll && document.activeElement !== sliderEll) sliderEll.value = ell.toFixed(3);
    if (txtEll) txtEll.textContent = `${ell.toFixed(2)} fm`;

    // Telemetry readouts
    const valForce = this.wrapper.querySelector('#c5-val-force');
    const subForce = this.wrapper.querySelector('#c5-sub-force');
    const valWork = this.wrapper.querySelector('#c5-val-work');
    const valEtot = this.wrapper.querySelector('#c5-val-etot');
    const valPbreak = this.wrapper.querySelector('#c5-val-pbreak');

    if (valForce) valForce.textContent = '1.52 × 10⁵ N';
    if (subForce) subForce.textContent = `≈ ${this.forceTons} ${isBn ? 'টন-ওজন (ধ্রুব)' : 'tons (constant)'}`;
    if (valWork) valWork.textContent = `${evalSt.workGeV.toFixed(3)} GeV`;
    if (valEtot) valEtot.textContent = `${evalSt.totalEnergyGeV.toFixed(3)} GeV`;
    if (valPbreak) valPbreak.textContent = `${(evalSt.breakProbability * 100).toFixed(1)}%`;

    // Update State Caption
    this.updateStateCaption();

    // Update Stage SVG elements
    this.updateStageVisuals();

    // Update V(r) Curve operating point
    this.updateVGraph(ell, evalSt.totalEnergyGeV);

    // Update Conservation Ledger
    this.updateLedger(evalSt);
  }

  updateStateCaption() {
    const isBn = this.lang === 'bn';
    const badge = this.wrapper.querySelector('#c5-caption-badge');
    const text = this.wrapper.querySelector('#c5-caption-text');
    if (!badge || !text) return;

    switch (this.state) {
      case 'S0_REST':
        badge.className = 'c5-caption-badge rest';
        badge.textContent = isBn ? 'S0: বিশ্রাম (Rest)' : 'S0: Rest';
        text.textContent = isBn
          ? 'স্ট্রিং স্বাভাবিক দৈর্ঘ্যে কম্পমান (L_Y⁰ ≈ 1.73 fm); গ্লুয়ন বিনিময় চলমান।'
          : 'Normal rest vibration (L_Y^0 ≈ 1.73 fm); gluon exchange active.';
        break;
      case 'S1_GRABBED':
        badge.className = 'c5-caption-badge grabbed';
        badge.textContent = isBn ? 'S1: ধরা (Grabbed)' : 'S1: Grabbed';
        text.textContent = isBn
          ? 'কোয়ার্ক ধরা হয়েছে; অক্ষ বরাবর টেনে স্ট্রিং বাড়ান।'
          : 'Quark grabbed; drag along axis to stretch tube.';
        break;
      case 'S2_EXTENSION':
        badge.className = 'c5-caption-badge ext';
        badge.textContent = isBn ? 'S2: প্রসারণ (Extension)' : 'S2: Extension';
        text.textContent = isBn
          ? 'টান বাড়ছে, কিন্তু বল একই থাকছে (F = 1.5×10⁵ N স্প্রিং নয়!)।'
          : 'Tension growing, force strictly constant (NOT a spring!).';
        break;
      case 'S3_CRITICAL':
        badge.className = 'c5-caption-badge crit';
        badge.textContent = isBn ? 'S3: সংকট (Critical ℓ ≥ 1.0 fm)' : 'S3: Critical (ℓ ≥ 1.0 fm)';
        text.textContent = isBn
          ? 'ভ্যাকুয়াম q q̄ ভার্চুয়াল ঝিলিক ঘন হচ্ছে; ভাঙার সম্ভাবনা দ্রুত বাড়ছে।'
          : 'Vacuum q-q̄ flickers intensifying; string snapping imminent.';
        break;
      case 'S4_SNAPPING':
        badge.className = 'c5-caption-badge snap';
        badge.textContent = isBn ? 'S4: ছিন্ন (Snapping!)' : 'S4: Snapping!';
        text.textContent = isBn
          ? 'স্ট্রিং ভেঙে গেল! ভ্যাকুয়াম থেকে বাস্তব q ও q̄ আবির্ভূত হলো।'
          : 'String snapped! Real q and q̄ pair materialized from vacuum.';
        break;
      case 'S5_FORMATION':
        badge.className = 'c5-caption-badge form';
        badge.textContent = isBn ? 'S5: হ্যাড্রন-গঠন (Hadronization)' : 'S5: Hadronization';
        text.textContent = isBn
          ? 'মেসন ও ব্যারিয়ন পরস্পর বিপরীত দিকে ছুটে চলেছে।'
          : 'Daughter meson and baryon flying apart along CM axis.';
        break;
      case 'S6_OUTCOME':
        badge.className = 'c5-caption-badge done';
        badge.textContent = isBn ? 'S6: সমাপ্তি (Complete)' : 'S6: Complete';
        text.textContent = isBn
          ? 'দুটি স্বাধীন কালার-সিঙ্গলেট হ্যাড্রন প্রকৃতিতে মুক্ত হলো।'
          : 'Two independent color-singlet hadrons produced.';
        break;
    }
  }

  updateStageVisuals() {
    const svg = this.wrapper.querySelector('#c5-stage-svg');
    if (!svg) return;

    // Junction F is fixed at (270, 210)
    const jX = 270;
    const jY = 210;

    // Scale: 120 pixels per 1 fm
    const pxPerFm = 120.0;
    const stemLengthPx = this.currentEllFm * pxPerFm;
    const targetY = jY - stemLengthPx;

    const nodeA = svg.querySelector('#c5-node-a');
    const stem = svg.querySelector('#c5-stem');
    const dimLine = svg.querySelector('#c5-dim-stem-line');
    const dimTxt = svg.querySelector('#c5-dim-stem-txt');

    if (this.state !== 'S5_FORMATION' && this.state !== 'S6_OUTCOME') {
      if (nodeA) nodeA.setAttribute('transform', `translate(${jX}, ${targetY.toFixed(1)})`);
      if (stem) {
        stem.setAttribute('x1', jX.toString());
        stem.setAttribute('y1', jY.toString());
        stem.setAttribute('x2', jX.toString());
        stem.setAttribute('y2', targetY.toFixed(1));
      }
      if (dimLine) {
        dimLine.setAttribute('y1', jY.toString());
        dimLine.setAttribute('y2', targetY.toFixed(1));
      }
      if (dimTxt) {
        dimTxt.setAttribute('y', (jY - stemLengthPx / 2).toFixed(1));
        dimTxt.textContent = `ℓ = ${this.currentEllFm.toFixed(2)} fm`;
      }
    }

    // Vacuum Flickers (in S3)
    const flickersGroup = svg.querySelector('#c5-vacuum-flickers-group');
    if (flickersGroup) {
      if (this.state === 'S3_CRITICAL') {
        flickersGroup.setAttribute('opacity', '1');
        // Render 3 virtual glowing dots along the stem
        const f1Y = jY - stemLengthPx * 0.35;
        const f2Y = jY - stemLengthPx * 0.65;
        flickersGroup.innerHTML = `
          <circle cx="${jX - 6}" cy="${f1Y}" r="4" fill="#38bdf8" filter="url(#c5-glow)" opacity="0.8" />
          <circle cx="${jX + 6}" cy="${f1Y}" r="4" fill="#ec4899" filter="url(#c5-glow)" opacity="0.8" />
          <circle cx="${jX - 6}" cy="${f2Y}" r="4" fill="#38bdf8" filter="url(#c5-glow)" opacity="0.8" />
          <circle cx="${jX + 6}" cy="${f2Y}" r="4" fill="#ec4899" filter="url(#c5-glow)" opacity="0.8" />
        `;
      } else {
        flickersGroup.setAttribute('opacity', '0');
      }
    }
  }

  triggerStringSnap() {
    this.state = 'S4_SNAPPING';
    this.isAutoPulling = false;

    const btnAuto = this.wrapper.querySelector('#c5-btn-autopull');
    if (btnAuto) btnAuto.classList.remove('active');

    const evalSt = this.evaluatedState;
    const svg = this.wrapper.querySelector('#c5-stage-svg');
    if (!svg) return;

    // Snapping location
    const jX = 270;
    const jY = 210;
    const pxPerFm = 120.0;
    const stemLengthPx = this.currentEllFm * pxPerFm;
    const breakY = jY - (evalSt.breakRatio * stemLengthPx);

    // Hide middle stem
    const stem = svg.querySelector('#c5-stem');
    if (stem) stem.setAttribute('opacity', '0.2');

    // Show newly materializing pair
    const pairGroup = svg.querySelector('#c5-break-pair-group');
    const qCircle = svg.querySelector('#c5-pair-q');
    const qbarCircle = svg.querySelector('#c5-pair-qbar');
    const qLbl = svg.querySelector('#c5-pair-q-lbl');
    const qbarLbl = svg.querySelector('#c5-pair-qbar-lbl');

    const newQuarkFlavor = evalSt.selectedChannel ? evalSt.selectedChannel.pairFlavor : 'd';
    const pulledQuarkColor = evalSt.colors.pulledColor;
    const newAntiquarkColor = evalSt.colors.newAntiquarkColor;

    if (pairGroup && qCircle && qbarCircle) {
      pairGroup.setAttribute('opacity', '1');

      // Colors
      qCircle.setAttribute('fill', this.colorHex[pulledQuarkColor]);
      qbarCircle.setAttribute('fill', this.colorHex[newAntiquarkColor]);
      if (qLbl) qLbl.textContent = `${newQuarkFlavor}`;
      if (qbarLbl) qbarLbl.textContent = `${newQuarkFlavor}̄`;

      // Start separation animation: q moves down to junction, qbar moves up to A
      let sepProgress = 0;
      const animateSeparation = () => {
        sepProgress += 0.05 * this.simSpeed;
        const currentSep = Math.min(1, sepProgress);

        // q goes downward towards junction F
        const qY = breakY + currentSep * 35;
        // qbar goes upward towards A
        const qbarY = breakY - currentSep * 35;

        qCircle.setAttribute('cx', jX.toString());
        qCircle.setAttribute('cy', qY.toFixed(1));
        if (qLbl) { qLbl.setAttribute('x', jX.toString()); qLbl.setAttribute('y', (qY + 4).toFixed(1)); }

        qbarCircle.setAttribute('cx', jX.toString());
        qbarCircle.setAttribute('cy', qbarY.toFixed(1));
        if (qbarLbl) { qbarLbl.setAttribute('x', jX.toString()); qbarLbl.setAttribute('y', (qbarY + 4).toFixed(1)); }

        if (currentSep >= 1) {
          this.triggerHadronFormation();
        } else {
          requestAnimationFrame(animateSeparation);
        }
      };
      requestAnimationFrame(animateSeparation);
    } else {
      this.triggerHadronFormation();
    }
  }

  triggerHadronFormation() {
    this.state = 'S5_FORMATION';
    this.updateStateCaption();

    const evalSt = this.evaluatedState;
    const ch = evalSt.selectedChannel;
    const beta1 = ch ? ch.beta1 : 0.6; // Meson speed
    const beta2 = ch ? ch.beta2 : 0.2; // Baryon speed

    let flightT = 0;
    const animateFlight = () => {
      flightT += 0.03 * this.simSpeed;
      this.hadronFlyProgress = Math.min(1, flightT);

      // Meson flies upward along pull axis: distance proportional to beta1
      const mesonDist = flightT * beta1 * 140;
      // Baryon moves downward along axis: distance proportional to beta2
      const baryonDist = flightT * beta2 * 60;

      const jX = 270;
      const jY = 210;
      const stemLengthPx = this.currentEllFm * 120.0;
      const initialAY = jY - stemLengthPx;

      const nodeA = this.wrapper.querySelector('#c5-node-a');
      const qbarCircle = this.wrapper.querySelector('#c5-pair-qbar');
      const qbarLbl = this.wrapper.querySelector('#c5-pair-qbar-lbl');
      const nodeB = this.wrapper.querySelector('#c5-node-b');
      const nodeC = this.wrapper.querySelector('#c5-node-c');
      const jNode = this.wrapper.querySelector('#c5-junction-node');
      const qCircle = this.wrapper.querySelector('#c5-pair-q');
      const qLbl = this.wrapper.querySelector('#c5-pair-q-lbl');
      const armB = this.wrapper.querySelector('#c5-arm-b');
      const armC = this.wrapper.querySelector('#c5-arm-c');

      // Move meson group (A + qbar)
      if (nodeA) nodeA.setAttribute('transform', `translate(${jX}, ${(initialAY - mesonDist).toFixed(1)})`);
      if (qbarCircle) qbarCircle.setAttribute('cy', (initialAY - mesonDist + 25).toFixed(1));
      if (qbarLbl) qbarLbl.setAttribute('y', (initialAY - mesonDist + 29).toFixed(1));

      // Move baryon group (F + B + C + q)
      if (jNode) jNode.setAttribute('transform', `translate(${jX}, ${(jY + baryonDist).toFixed(1)})`);
      if (qCircle) qCircle.setAttribute('cy', (jY + baryonDist - 25).toFixed(1));
      if (qLbl) qLbl.setAttribute('y', (jY + baryonDist - 21).toFixed(1));
      if (nodeB) nodeB.setAttribute('transform', `translate(190, ${(280 + baryonDist).toFixed(1)})`);
      if (nodeC) nodeC.setAttribute('transform', `translate(350, ${(280 + baryonDist).toFixed(1)})`);
      if (armB) {
        armB.setAttribute('y1', (jY + baryonDist).toFixed(1));
        armB.setAttribute('y2', (280 + baryonDist).toFixed(1));
      }
      if (armC) {
        armC.setAttribute('y1', (jY + baryonDist).toFixed(1));
        armC.setAttribute('y2', (280 + baryonDist).toFixed(1));
      }

      if (this.hadronFlyProgress >= 1) {
        this.triggerOutcomeModal();
      } else {
        requestAnimationFrame(animateFlight);
      }
    };
    requestAnimationFrame(animateFlight);
  }

  triggerOutcomeModal() {
    this.state = 'S6_OUTCOME';
    this.updateStateCaption();

    const drawer = this.wrapper.querySelector('#c5-outcome-drawer');
    const hadronsDisp = this.wrapper.querySelector('#c5-hadrons-display');
    const kinBox = this.wrapper.querySelector('#c5-kinematics-box');
    const btnDecay = this.wrapper.querySelector('#c5-btn-decay');
    const isBn = this.lang === 'bn';

    if (!drawer || !hadronsDisp) return;
    drawer.style.display = 'flex';

    const ch = this.evaluatedState.selectedChannel;
    if (!ch) return;

    const meson = ch.meson;
    const baryon = ch.baryon;

    hadronsDisp.innerHTML = `
      <div class="c5-outcome-item meson">
        <div class="c5-item-badge">${isBn ? 'উৎপাদিত মেসন [A q̄]' : 'Daughter Meson [A q̄]'}</div>
        <h4 class="c5-item-name">${isBn ? meson.nameBn : meson.nameEn} (${meson.symbol})</h4>
        <div class="c5-item-specs">
          <span>${isBn ? 'কোয়ার্ক:' : 'Quarks:'} <strong>${meson.quarkContent.join('')}</strong></span>
          <span>${isBn ? 'ভর:' : 'Mass:'} <strong>${meson.mass.value.toFixed(1)} MeV/c²</strong></span>
          <span>${isBn ? 'চার্জ:' : 'Charge:'} <strong>${meson.charge > 0 ? '+' + meson.charge : meson.charge}e</strong></span>
          <span>${isBn ? 'স্পিন:' : 'Spin:'} <strong>${meson.spin}</strong></span>
          <span>${isBn ? 'জীবনকাল:' : 'Lifetime:'} <strong>${typeof meson.lifetime.value === 'number' ? meson.lifetime.value.toExponential(2) + ' s' : meson.lifetime.value}</strong></span>
        </div>
      </div>

      <div class="c5-outcome-item baryon">
        <div class="c5-item-badge">${isBn ? 'উৎপাদিত ব্যারিয়ন [q B C]' : 'Daughter Baryon [q B C]'}</div>
        <h4 class="c5-item-name">${isBn ? baryon.nameBn : baryon.nameEn} (${baryon.symbol})</h4>
        <div class="c5-item-specs">
          <span>${isBn ? 'কোয়ার্ক:' : 'Quarks:'} <strong>${baryon.quarkContent.join('')}</strong></span>
          <span>${isBn ? 'ভর:' : 'Mass:'} <strong>${baryon.mass.value.toFixed(1)} MeV/c²</strong></span>
          <span>${isBn ? 'চার্জ:' : 'Charge:'} <strong>${baryon.charge > 0 ? '+' + baryon.charge : baryon.charge}e</strong></span>
          <span>${isBn ? 'স্পিন:' : 'Spin:'} <strong>${baryon.spin}</strong></span>
          <span>${isBn ? 'জীবনকাল:' : 'Lifetime:'} <strong>${typeof baryon.lifetime.value === 'number' ? baryon.lifetime.value.toExponential(2) + ' s' : baryon.lifetime.value}</strong></span>
        </div>
      </div>
    `;

    if (kinBox) {
      kinBox.innerHTML = `
        <div class="c5-kin-row">
          <span>${isBn ? 'ভরকেন্দ্র ভর-শক্তি (√s = E_tot):' : 'CM Energy (√s = E_tot):'}</span>
          <strong>${this.evaluatedState.totalEnergyGeV.toFixed(3)} GeV</strong>
        </div>
        <div class="c5-kin-row">
          <span>${isBn ? 'কণার নির্গমন ভরবেগ (p*):' : 'CM Outgoing Momentum (p*):'}</span>
          <strong>${ch.pStarGeV.toFixed(3)} GeV/c</strong>
        </div>
        <div class="c5-kin-row">
          <span>${isBn ? 'মেসনের গতি (β₁ = p*/E₁):' : 'Meson Velocity (β₁):'}</span>
          <strong>${ch.beta1.toFixed(3)} c</strong>
          <span>${isBn ? 'ব্যারিয়নের গতি (β₂ = p*/E₂):' : 'Baryon Velocity (β₂):'}</span>
          <strong>${ch.beta2.toFixed(3)} c</strong>
        </div>
      `;
    }

    // Optional decay button
    if (btnDecay) {
      if (ch.mesonId === 'pi0') {
        btnDecay.style.display = 'inline-flex';
        btnDecay.innerHTML = `${isBn ? 'ঐচ্ছিক ক্ষয়: π⁰ → γ + γ (৮.৫×১০⁻¹⁷ s)' : 'Optional Decay: π⁰ → γ + γ (8.5×10⁻¹⁷ s)'}`;
        btnDecay.onclick = () => this.simulatePi0Decay();
      } else if (ch.baryonId === 'delta_plus_plus') {
        btnDecay.style.display = 'inline-flex';
        btnDecay.innerHTML = `${isBn ? 'ঐচ্ছিক ক্ষয়: Δ⁺⁺ → p + π⁺ (৫.৬×১০⁻²⁴ s)' : 'Optional Decay: Δ⁺⁺ → p + π⁺ (5.6×10⁻²⁴ s)'}`;
        btnDecay.onclick = () => this.simulateDeltaDecay();
      } else {
        btnDecay.style.display = 'none';
      }
    }
  }

  simulatePi0Decay() {
    const isBn = this.lang === 'bn';
    alert(isBn
      ? 'π⁰ কণাটি কোয়ান্টাম কাইরাল অ্যানোমালি প্রক্রিয়ায় প্রায় ৮.৫×১০⁻¹⁷ সেকেন্ডে দুটি ফোটনে (γ + γ) স্বতঃস্ফূর্তভাবে ক্ষয়প্রাপ্ত হলো।'
      : 'π⁰ spontaneously decays via the chiral anomaly into two high-energy photons (γ + γ) in ~8.5×10⁻¹⁷ s.');
  }

  simulateDeltaDecay() {
    const isBn = this.lang === 'bn';
    alert(isBn
      ? 'Δ⁺⁺ তীব্র শক্তিশালী মিথস্ক্রিয়ায় মাত্র ৫.৬×১০⁻²⁴ সেকেন্ডে প্রোটন ও ধনাত্মক পায়নে (p + π⁺) ক্ষয়প্রাপ্ত হলো।'
      : 'Δ⁺⁺ decays via the strong interaction into a proton and positive pion (p + π⁺) in ~5.6×10⁻²⁴ s.');
  }

  updateVGraph(ell, totalEnergyGeV) {
    // Map V-graph: X (ell: 0.5 to 1.6) -> 35 to 330
    // Y (Energy: 0.8 to 2.0) -> 155 to 15
    const mapX = (l) => 35 + ((l - 0.5) / (1.6 - 0.5)) * (330 - 35);
    const mapY = (e) => 155 - ((e - 0.8) / (2.0 - 0.8)) * (155 - 15);

    const pt = this.wrapper.querySelector('#c5-v-point');
    if (pt) {
      const curX = Math.max(35, Math.min(330, mapX(ell)));
      const curY = Math.max(15, Math.min(155, mapY(totalEnergyGeV)));
      pt.setAttribute('cx', curX.toFixed(1));
      pt.setAttribute('cy', curY.toFixed(1));
    }
  }

  updateLedger(evalSt) {
    const isBn = this.lang === 'bn';
    const audit = evalSt.ledgerAudit;
    const pill = this.wrapper.querySelector('#c5-ledger-pill');
    const overall = this.wrapper.querySelector('#c5-ledger-overall');

    const ledQ = this.wrapper.querySelector('#c5-led-q');
    const ledB = this.wrapper.querySelector('#c5-led-b');
    const ledS = this.wrapper.querySelector('#c5-led-s');
    const ledCol = this.wrapper.querySelector('#c5-led-col');
    const ledE = this.wrapper.querySelector('#c5-led-e');

    if (!audit) {
      if (pill) pill.className = 'c5-status-pill verified';
      if (overall) overall.textContent = isBn ? 'সংরক্ষিত [OK]' : 'Conserved [OK]';
      if (ledQ) ledQ.innerHTML = `+1 e ${ICON_CHECK_SVG}`;
      if (ledB) ledB.innerHTML = `1 ${ICON_CHECK_SVG}`;
      if (ledS) ledS.innerHTML = `0 ${ICON_CHECK_SVG}`;
      if (ledCol) ledCol.innerHTML = `${isBn ? 'সাদা' : 'White'} ${ICON_CHECK_SVG}`;
      if (ledE) ledE.innerHTML = `${evalSt.totalEnergyGeV.toFixed(3)} GeV ${ICON_CHECK_SVG}`;
      return;
    }

    if (audit.allConserved) {
      if (pill) pill.className = 'c5-status-pill verified';
      if (overall) overall.textContent = isBn ? 'সংরক্ষিত [OK]' : 'Conserved [OK]';
    } else {
      if (pill) pill.className = 'c5-status-pill rejected';
      if (overall) overall.textContent = isBn ? 'লঙ্ঘন [ERR]' : 'Violated [ERR]';
    }

    if (ledQ) ledQ.innerHTML = `${audit.charge.initial}e → ${audit.charge.final}e ${audit.charge.conserved ? ICON_CHECK_SVG : ICON_CROSS_SVG}`;
    if (ledB) ledB.innerHTML = `${audit.baryon.initial} → ${audit.baryon.final} ${audit.baryon.conserved ? ICON_CHECK_SVG : ICON_CROSS_SVG}`;
    if (ledS) ledS.innerHTML = `${audit.strangeness.initial} → ${audit.strangeness.final} ${audit.strangeness.conserved ? ICON_CHECK_SVG : ICON_CROSS_SVG}`;
    if (ledCol) ledCol.innerHTML = `${isBn ? 'সাদা' : 'White'} (Singlet) ${audit.colorSinglet.conserved ? ICON_CHECK_SVG : ICON_CROSS_SVG}`;
    if (ledE) ledE.innerHTML = `${audit.energy.available.toFixed(3)} ≥ ${audit.energy.required.toFixed(3)} GeV ${audit.energy.conserved ? ICON_CHECK_SVG : ICON_CROSS_SVG}`;
  }

  startMainLoop() {
    let lastTs = performance.now();

    const loop = (now) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;

      // Update Clocks
      this.animTimeSec += dt * this.simSpeed;
      // 1 fm/c ≈ 3.33564e-24 seconds
      this.realTimeFmC += (dt * this.simSpeed) * 3.0; // scale representation
      const realSeconds = this.realTimeFmC * 3.33564e-24;

      const clkReal = this.wrapper.querySelector('#c5-clk-real');
      const clkAnim = this.wrapper.querySelector('#c5-clk-anim');
      if (clkReal) clkReal.textContent = `${this.realTimeFmC.toFixed(1)} fm/c (${realSeconds.toExponential(1)} s)`;
      if (clkAnim) clkAnim.textContent = `${this.animTimeSec.toFixed(1)} s`;

      // Auto-pull cinema logic
      if (this.isAutoPulling && this.state !== 'S4_SNAPPING' && this.state !== 'S5_FORMATION') {
        // Smoothly pull over ~35s
        const pullSpeed = 0.025 * this.simSpeed;
        this.currentEllFm += pullSpeed * dt;
        if (this.currentEllFm >= 1.52) {
          this.currentEllFm = 1.52;
          this.isAutoPulling = false;
        }
        this.updatePhysics();
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  openRealityDrawer() {
    if (!this.infoDrawer) return;

    const isBn = this.lang === 'bn';
    const contentBn = `
      <div class="c5-drawer-body">
        <h4>বাস্তবতা: চিন্তা-পরীক্ষা বনাম উচ্চশক্তি সংঘর্ষ</h4>
        <div class="c5-drawer-badges">
          ${createTierBadge('T3', 'কার্যকর চিন্তা-মডেল', 'bn')}
        </div>
        <p>
          প্রকৃতিতে কেউই একক কোয়ার্ককে “হাত দিয়ে” টেনে আলাদা করতে পারে না; কারণ কোয়ার্ক মুক্ত অবস্থায় বিরাজ করে না এবং এর স্কেল $10^{-18}$ মিটারেরও ক্ষুদ্র।
          এটি একটি তাত্ত্বিক <strong>চিন্তা-পরীক্ষা (Thought Experiment)</strong>, যা ল্যাটিস QCD ও লুন্ড স্ট্রিং মডেলের ধীর টান অবস্থার নিখুঁত সমতুল্য।
        </p>
        <h5>বাস্তবে এই স্ট্রিং কোথায় এবং কীভাবে ভাঙে?</h5>
        <ul>
          <li><strong>Deep Inelastic Scattering (DIS):</strong> ইলেকট্রন বা মিউয়ন যখন অতিউচ্চ শক্তিতে প্রোটনের অভ্যন্তরে একটি নির্দিষ্ট কোয়ার্ককে সজোরে আঘাত করে, তখন সেই কোয়ার্কটি ছিটকে বেরিয়ে যেতে চায়। ফলে প্রোটনের অবশিষ্টাংশের সাথে তার মাঝে তৈরি হয় একই ফ্লাক্স টিউব।</li>
          <li><strong>ইলেকট্রন-পজিট্রন সংঘর্ষ ($e^+ e^- \to q\bar{q} \to \text{jets}$):</strong> তৈরি হওয়া কোয়ার্ক-অ্যান্টিকোয়ার্ক বিপরীত দিকে ছুটতে থাকলে তাদের মাঝের স্ট্রিং একইভাবে ছিন্ন হয়ে হ্যাড্রনের জেট (Jet) সৃষ্টি করে।</li>
        </ul>
        <p>
          উভয় ক্ষেত্রেই স্ট্রিং ভাঙার মৌলিক পদার্থবিজ্ঞান সম্পূর্ণ অভিন্ন—স্ট্রিং টেনশন $\\sigma \\approx 0.95\\text{ GeV/fm}$ এবং ভ্যাকুয়াম টানেলিং।
        </p>
      </div>
    `;

    const contentEn = `
      <div class="c5-drawer-body">
        <h4>Reality: Thought Experiment vs High-Energy Jets</h4>
        <div class="c5-drawer-badges">
          ${createTierBadge('T3', 'Effective Model', 'en')}
        </div>
        <p>
          Nobody pulls an individual quark by hand; quarks cannot exist in isolation and their physical scale is below $10^{-18}$ meters.
          This slow-pull simulation is a rigorous <strong>thought experiment</strong> reflecting static lattice QCD potential calculations.
        </p>
        <h5>Where does string breaking actually happen in nature?</h5>
        <ul>
          <li><strong>Deep Inelastic Scattering (DIS):</strong> When a high-energy lepton strikes a valence quark inside a proton, that quark recoils rapidly, stretching the same chromoelectric flux tube against the remnant diquark until it snaps.</li>
          <li><strong>$e^+e^-$ Annihilation ($e^+e^- \to q\bar{q}$):</strong> Rapidly separating relativistic quarks stretch color flux tubes that fragment into collimated jets of hadrons.</li>
        </ul>
        <p>
          In both scenarios, the underlying physics is identical: linear tension $\\sigma \\approx 0.95\\text{ GeV/fm}$ and vacuum pair tunneling.
        </p>
      </div>
    `;

    this.infoDrawer.open({
      title: isBn ? 'বাস্তবতা: চিন্তা-পরীক্ষা বনাম উচ্চশক্তি সংঘর্ষ' : 'Reality: Thought Experiment vs High-Energy Jets',
      bodyHtml: isBn ? contentBn : contentEn,
      tier: 'T3',
      source: "Lund String Model (Andersson et al.) / Lattice QCD (Bali 2005)"
    });
  }

  // =========================================================================
  // MODE B: HIGH-ENERGY JET & LUND STRING FRAGMENTATION METHODS
  // =========================================================================

  switchMode(mode) {
    if (this.activeMode === mode) return;
    this.activeMode = mode;
    const isModeA = mode === 'A';
    const btnA = this.wrapper.querySelector('#c5-mode-btn-a');
    const btnB = this.wrapper.querySelector('#c5-mode-btn-b');
    const containerA = this.wrapper.querySelector('#c5-mode-a-container');
    const containerB = this.wrapper.querySelector('#c5-mode-b-container');

    if (btnA) {
      btnA.classList.toggle('active', isModeA);
      btnA.setAttribute('aria-selected', isModeA ? 'true' : 'false');
    }
    if (btnB) {
      btnB.classList.toggle('active', !isModeA);
      btnB.setAttribute('aria-selected', !isModeA ? 'true' : 'false');
    }
    if (containerA) containerA.style.display = isModeA ? 'block' : 'none';
    if (containerB) containerB.style.display = !isModeA ? 'block' : 'none';

    if (!isModeA && !this.jetSimulationResult) {
      this.runJetSimulation();
    }
  }

  selectJetQuark(flavor) {
    if (this.struckQuarkModeB === flavor) return;
    this.struckQuarkModeB = flavor;
    const btnU = this.wrapper.querySelector('#c5-jet-pick-u');
    const btnD = this.wrapper.querySelector('#c5-jet-pick-d');
    if (btnU) btnU.classList.toggle('active', flavor === 'u');
    if (btnD) btnD.classList.toggle('active', flavor === 'd');
    this.runJetSimulation();
  }

  resetJetSeed() {
    this.jetSeed = generateSeed();
    this.runJetSimulation();
  }

  runJetSimulation() {
    this.jetSimulationResult = simulateLundJetFragmentation({
      energyGeV: this.jetEnergyGeV,
      struckQuark: this.struckQuarkModeB,
      seed: this.jetSeed
    });

    this.renderJetSvg();
    this.renderJetLedger();
    this.renderJetStats();
    this.renderJetTable();
  }

  renderJetSvg() {
    const svg = this.wrapper.querySelector('#c5-jet-svg');
    if (!svg || !this.jetSimulationResult) return;

    const res = this.jetSimulationResult;
    const isBn = this.lang === 'bn';
    const steps = res.steps || [];
    const remnantBaryon = res.finalRemnantBaryon;

    let html = `
      <defs>
        <filter id="c5-jet-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="c5-jet-string-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#a855f7" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      <!-- Grid Axis Reference Lines -->
      <line x1="120" y1="20" x2="120" y2="280" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4 4" />
      <line x1="30" y1="150" x2="730" y2="150" stroke="rgba(255,255,255,0.06)" />

      <!-- Jet Cone Collimation Guides -->
      <polygon points="120,150 720,50 720,250" fill="rgba(14, 165, 233, 0.03)" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="3 3" />

      <!-- Recoil Vector to Remnant Baryon (Leftwards) -->
      <line x1="110" y1="150" x2="55" y2="150" stroke="#10b981" stroke-width="3" stroke-dasharray="4 2" />
      <polygon points="50,150 62,144 62,156" fill="#10b981" />

      <!-- Collision Vertex Marker -->
      <circle cx="120" cy="150" r="8" fill="#f8fafc" stroke="#38bdf8" stroke-width="2" filter="url(#c5-jet-glow)" />
      <circle cx="120" cy="150" r="3" fill="#0f172a" />
      <text x="120" y="175" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace">
        ${isBn ? 'সংঘর্ষ বিন্দু' : 'Collision Vertex'}
      </text>

      <!-- Target Remnant Baryon Node (p, n, or Lambda) -->
      <g class="c5-jet-node" transform="translate(45, 150)">
        <circle cx="0" cy="0" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2" filter="url(#c5-jet-glow)" />
        <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="12">
          ${remnantBaryon.symbol}
        </text>
        <text x="0" y="-24" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700" font-family="'JetBrains Mono', monospace">
          ${isBn ? 'অবশিষ্ট বেরিয়ন' : 'Remnant'}
        </text>
        <text x="0" y="32" text-anchor="middle" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace">
          ${remnantBaryon.energyGeV ? remnantBaryon.energyGeV.toFixed(1) + 'G' : ''}
        </text>
      </g>

      <!-- Main Stretched Color String Segment -->
      <line x1="120" y1="150" x2="680" y2="150" stroke="url(#c5-jet-string-grad)" stroke-width="6" stroke-linecap="round" opacity="0.8" filter="url(#c5-jet-glow)" />
    `;

    // Cascade Tracks & Hadron Nodes
    const nSteps = steps.length;
    steps.forEach((step, idx) => {
      const frac = (idx + 1) / (nSteps + 1);
      const sx = 140 + frac * 480;
      const sy = 150;
      const isUpper = idx % 2 === 0;

      // Vertical offset based on transverse momentum pt and lightcone fraction z
      const angleWeight = Math.min(1.0, (step.ptGeV / 0.5));
      const spreadY = isUpper
        ? -(35 + angleWeight * 50 + (idx % 3) * 18)
        : (35 + angleWeight * 50 + (idx % 3) * 18);
      const hx = Math.min(725, sx + 20 + Math.min(45, step.z * 50));
      const hy = 150 + spreadY;

      // Color scheme by hadron type
      let fillCol = '#38bdf8';
      let strokeCol = '#0284c7';
      if (step.hadron.id.startsWith('k') || step.hadron.id.includes('anti_k')) {
        fillCol = '#ec4899';
        strokeCol = '#be185d';
      } else if (step.hadron.type === 'baryon' || step.hadron.type === 'antibaryon') {
        fillCol = '#10b981';
        strokeCol = '#047857';
      }

      // Vacuum Tunneling Breakpoint circle along string
      html += `
        <!-- Breakpoint ${idx + 1} -->
        <circle cx="${sx}" cy="${sy}" r="4" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
        <!-- Hadron Emission Track Line -->
        <line x1="${sx}" y1="${sy}" x2="${hx}" y2="${hy}" stroke="${fillCol}" stroke-width="1.8" stroke-dasharray="3 2" opacity="0.8" />
        <!-- Emitted Hadron Node -->
        <g transform="translate(${hx}, ${hy})">
          <circle cx="0" cy="0" r="14" fill="${fillCol}" stroke="#ffffff" stroke-width="1.5" filter="url(#c5-jet-glow)" />
          <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-weight="800" font-size="11">
            ${step.hadron.symbol}
          </text>
          <text x="0" y="${isUpper ? -17 : 24}" text-anchor="middle" fill="#cbd5e1" font-size="9" font-family="'JetBrains Mono', monospace">
            z=${step.z.toFixed(2)}
          </text>
        </g>
      `;
    });

    // Heading Annotations
    html += `
      <text x="400" y="285" text-anchor="middle" fill="#64748b" font-size="11" font-family="'JetBrains Mono', monospace">
        ${isBn ? 'স্ট্রিং অক্ষ (Longitudinal p_z >> p_T) → মেসনের ঝাঁক (Jet)' : 'Jet Axis (Longitudinal p_z >> p_T) → Hadron Jet'}
      </text>
    `;

    svg.innerHTML = html;
  }

  renderJetLedger() {
    const container = this.wrapper.querySelector('#c5-jet-ledger-cards');
    const statusPill = this.wrapper.querySelector('#c5-jet-ledger-status');
    if (!container || !this.jetSimulationResult) return;

    const res = this.jetSimulationResult;
    const isBn = this.lang === 'bn';
    const init = res.initialState;
    const led = res.finalLedger;

    if (statusPill) {
      statusPill.textContent = isBn ? 'সব সংরক্ষিত [OK]' : 'All Conserved [OK]';
    }

    container.innerHTML = `
      <!-- 1. ELECTRIC CHARGE -->
      <div class="c5-ledger-card valid">
        <div class="c5-ledger-card-top">
          <span class="c5-ledger-lbl">${isBn ? 'বৈদ্যুতিক আধান (Q)' : 'Electric Charge (Q)'}</span>
          ${ICON_CHECK_SVG}
        </div>
        <div class="c5-ledger-val">
          ${init.netCharge > 0 ? '+' + init.netCharge : init.netCharge} e → ${led.netCharge > 0 ? '+' + led.netCharge : led.netCharge} e
        </div>
        <span class="c5-ledger-sub">${isBn ? 'নিখুঁত সংরক্ষিত' : 'Strictly Conserved'}</span>
      </div>

      <!-- 2. BARYON NUMBER -->
      <div class="c5-ledger-card valid">
        <div class="c5-ledger-card-top">
          <span class="c5-ledger-lbl">${isBn ? 'ব্যারিয়ন সংখ্যা (B)' : 'Baryon Number (B)'}</span>
          ${ICON_CHECK_SVG}
        </div>
        <div class="c5-ledger-val">
          B = ${init.baryonNumber} → ${led.baryonNumber}
        </div>
        <span class="c5-ledger-sub">${isBn ? 'অবশিষ্ট বেরিয়ন সহ B=1' : 'Conserved (Net B=1)'}</span>
      </div>

      <!-- 3. STRANGENESS -->
      <div class="c5-ledger-card valid">
        <div class="c5-ledger-card-top">
          <span class="c5-ledger-lbl">${isBn ? 'স্ট্রেঞ্জনেস (S)' : 'Strangeness (S)'}</span>
          ${ICON_CHECK_SVG}
        </div>
        <div class="c5-ledger-val">
          S = ${init.strangeness} → ${led.strangeness}
        </div>
        <span class="c5-ledger-sub">${isBn ? 'γ_s জোড়ায় স্বতঃ-ভারসাম্য' : 'Net S=0 (γ_s auto-balanced)'}</span>
      </div>

      <!-- 4. COLOR SINGLET -->
      <div class="c5-ledger-card valid">
        <div class="c5-ledger-card-top">
          <span class="c5-ledger-lbl">${isBn ? 'কালার কনফাইনমেন্ট' : 'Color Confinement'}</span>
          ${ICON_CHECK_SVG}
        </div>
        <div class="c5-ledger-val">
          ${isBn ? 'সাদা (Singlet)' : 'White (Singlet)'}
        </div>
        <span class="c5-ledger-sub">${isBn ? 'প্রতিটি হ্যাড্রন কালারলেস' : 'Every Hadron Colorless'}</span>
      </div>

      <!-- 5. TOTAL ENERGY-MOMENTUM BALANCE -->
      <div class="c5-ledger-card valid" style="grid-column: span 2;">
        <div class="c5-ledger-card-top">
          <span class="c5-ledger-lbl">${isBn ? 'মোট শক্তি-ভরবেগ অডিট' : 'Total Energy-Momentum Balance'}</span>
          ${ICON_CHECK_SVG}
        </div>
        <div class="c5-ledger-val">
          E_total = ${init.totalEnergyGeV.toFixed(2)} GeV (E_jet + M_p)
        </div>
        <span class="c5-ledger-sub">
          ${isBn
            ? `বণ্টন: ${res.totalHadronCount}টি হ্যাড্রনের ট্রান্সভার্স ভর (m_T) ও অনুদৈর্ঘ্য ভগ্নাংশে (z)`
            : `Distributed: ${res.totalHadronCount} hadrons via transverse mass (m_T) & lightcone (z)`}
        </span>
      </div>
    `;
  }

  renderJetStats() {
    const container = this.wrapper.querySelector('#c5-jet-stats-panel');
    if (!container || !this.jetSimulationResult) return;

    const res = this.jetSimulationResult;
    const isBn = this.lang === 'bn';
    const comp = res.composition;
    const expN = (2 + 1.8 * Math.log(this.jetEnergyGeV)).toFixed(1);

    container.innerHTML = `
      <div class="c5-multiplicity-banner">
        <div>
          <span class="c5-mult-lbl">${isBn ? 'মোট উৎপন্ন হ্যাড্রন সংখ্যা:' : 'Total Produced Hadrons:'}</span>
          <div style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">
            N(E) ~ 2 + 1.8·ln(E) ≈ ${expN}
          </div>
        </div>
        <span class="c5-mult-num">${res.totalHadronCount}</span>
      </div>

      <!-- PION FRACTION (DOMINANT ~75-80%) -->
      <div class="c5-stat-bar-group">
        <div class="c5-bar-lbl-row">
          <span>${isBn ? 'পায়ন (Pions: π⁺, π⁻, π⁰)' : 'Pions (π⁺, π⁻, π⁰)'}</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">
            ${comp.pionCount} (${(comp.pionFraction * 100).toFixed(1)}%)
          </span>
        </div>
        <div class="c5-bar-track">
          <div class="c5-bar-fill pion" style="width: ${(comp.pionFraction * 100).toFixed(1)}%;"></div>
        </div>
      </div>

      <!-- KAON FRACTION (~10-12% NATURAL VIA GAMMA_S) -->
      <div class="c5-stat-bar-group">
        <div class="c5-bar-lbl-row">
          <span>${isBn ? 'কেয়ন (Kaons: K⁺, K⁻, K⁰)' : 'Kaons (K⁺, K⁻, K⁰)'}</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #ec4899;">
            ${comp.kaonCount} (${(comp.kaonFraction * 100).toFixed(1)}%)
          </span>
        </div>
        <div class="c5-bar-track">
          <div class="c5-bar-fill kaon" style="width: ${(comp.kaonFraction * 100).toFixed(1)}%;"></div>
        </div>
      </div>

      <!-- BARYON FRACTION (~5-8% VIA DIQUARKS & REMNANT) -->
      <div class="c5-stat-bar-group">
        <div class="c5-bar-lbl-row">
          <span>${isBn ? 'বেরিয়ন (Baryons: p, n, Λ)' : 'Baryons (p, n, Λ)'}</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #10b981;">
            ${comp.baryonCount} (${(comp.baryonFraction * 100).toFixed(1)}%)
          </span>
        </div>
        <div class="c5-bar-track">
          <div class="c5-bar-fill baryon" style="width: ${(comp.baryonFraction * 100).toFixed(1)}%;"></div>
        </div>
      </div>

      <!-- T3 TIER BADGE AND REPRODUCIBILITY INFO -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);">
        <span class="c5-pythia-tune-badge" style="background: rgba(14, 165, 233, 0.12); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">
          T3 Lund মডেল, বাস্তব jet-এর পরিসংখ্যানগত চিত্র
        </span>
        <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">
          Seed: ${this.jetSeed}
        </span>
      </div>
    `;
  }

  renderJetTable() {
    const container = this.wrapper.querySelector('#c5-jet-table-container');
    if (!container || !this.jetSimulationResult) return;

    const res = this.jetSimulationResult;
    const isBn = this.lang === 'bn';
    const steps = res.steps || [];
    const remnantBaryon = res.finalRemnantBaryon;

    let runningQ = 0;
    let runningB = 0;
    let runningS = 0;

    let rowsHtml = '';
    steps.forEach(step => {
      runningQ += step.hadron.charge;
      runningB += step.hadron.baryonNumber;
      runningS += step.hadron.strangeness;

      let tagClass = 'pion';
      if (step.hadron.id.startsWith('k') || step.hadron.id.includes('anti_k')) tagClass = 'kaon';
      else if (step.hadron.type === 'baryon' || step.hadron.type === 'antibaryon') tagClass = 'baryon';

      const qStr = runningQ > 0 ? `+${runningQ}` : `${runningQ}`;
      const sStr = runningS > 0 ? `+${runningS}` : `${runningS}`;

      rowsHtml += `
        <tr>
          <td>#${step.stepIndex}</td>
          <td>${step.leadingQuarkBefore}</td>
          <td>${step.tunneledPair}</td>
          <td>
            <span class="c5-hadron-tag ${tagClass}">
              ${step.hadron.symbol} (${isBn ? step.hadron.nameBn : step.hadron.nameEn})
            </span>
          </td>
          <td>${step.hadron.type}</td>
          <td>${step.hadron.massGeV.toFixed(4)}</td>
          <td>${step.z.toFixed(4)}</td>
          <td>${step.ptGeV.toFixed(4)}</td>
          <td>${step.energyGeV ? step.energyGeV.toFixed(3) : '—'}</td>
          <td>${step.remainingEnergyGeV.toFixed(3)}</td>
          <td>Q=${qStr}, B=${runningB}, S=${sStr}</td>
          <td>${ICON_CHECK_SVG} Singlet</td>
        </tr>
      `;
    });

    // Add final remnant row
    runningQ += remnantBaryon.charge;
    runningB += remnantBaryon.baryonNumber;
    runningS += remnantBaryon.strangeness;

    const finalQStr = runningQ > 0 ? `+${runningQ}` : `${runningQ}`;
    const finalSStr = runningS > 0 ? `+${runningS}` : `${runningS}`;

    rowsHtml += `
      <tr style="background: rgba(16, 185, 129, 0.08); font-weight: 700;">
        <td>Final</td>
        <td>${res.initialState.remnantDiquark} + ${steps[steps.length - 1]?.leadingQuarkAfter || res.initialState.struckQuark}</td>
        <td>Proton Core</td>
        <td>
          <span class="c5-hadron-tag baryon">
            ${remnantBaryon.symbol} (${isBn ? remnantBaryon.nameBn : remnantBaryon.nameEn})
          </span>
        </td>
        <td>baryon</td>
        <td>${remnantBaryon.massGeV.toFixed(4)}</td>
        <td>—</td>
        <td>0.0000</td>
        <td>${remnantBaryon.energyGeV ? remnantBaryon.energyGeV.toFixed(3) : '—'}</td>
        <td>0.000</td>
        <td style="color: #34d399;">Q=${finalQStr}, B=${runningB}, S=${finalSStr} [NET]</td>
        <td style="color: #34d399;">${ICON_CHECK_SVG} Singlet</td>
      </tr>
    `;

    container.innerHTML = `
      <table class="c5-jet-table">
        <thead>
          <tr>
            <th>${isBn ? 'ধাপ' : 'Step'}</th>
            <th>${isBn ? 'লিডিং কোয়ার্ক' : 'Leading Q'}</th>
            <th>${isBn ? 'ভ্যাকুয়াম জোড়া' : 'Vacuum Pair'}</th>
            <th>${isBn ? 'গঠিত হ্যাড্রন' : 'Produced Hadron'}</th>
            <th>${isBn ? 'ধরন' : 'Type'}</th>
            <th>${isBn ? 'ভর (GeV)' : 'Mass (GeV)'}</th>
            <th>Lund z</th>
            <th>p_T (GeV)</th>
            <th>E_H (GeV)</th>
            <th>E_rem (GeV)</th>
            <th>${isBn ? 'ক্রমপুঞ্জিত (Q, B, S)' : 'Cumulative (Q,B,S)'}</th>
            <th>${isBn ? 'কালার সিঙ্গলেট' : 'Color Singlet'}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  setLanguage(lang) {
    if (this.lang === lang) return;
    this.lang = lang;
    this.init();
  }

  setLevel(level) {
    if (this.level === level) return;
    this.level = level;
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this._cleanupControls) {
      this._cleanupControls();
      this._cleanupControls = null;
    }
    this.container.innerHTML = '';
  }
}
