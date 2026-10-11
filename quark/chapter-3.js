/**
 * CosmoPlanck Quark Section - Chapter 3: "কালার ল্যাব" (Color Lab)
 * Interactive QCD Color Charge Laboratory
 *
 * Scientific Fidelity & Features:
 * - Color Wheel: r, g, b at 120° intervals; anti-colors (cyan, magenta, yellow) directly opposite.
 * - "Make White" Game: Assemble quarks/antiquarks; valid states (baryon r+g+b, meson c+c_bar, anti-baryon r_bar+g_bar+b_bar) -> White; invalid -> unconfined colored state with scientific rationale.
 * - 8 Gluon Cards: 6 off-diagonal transitions + 2 diagonal mixtures; "Why no 9th gluon?" pedagogical explanation.
 * - Exchange Simulator: Two quarks exchange a gluon; color swap with Conservation Ledger verification (net color remains white).
 * - "Where is the Proof?" Drawer: Delta++ (uuu) spin-3/2 Pauli exclusion paradox and historical resolution (Greenberg 1964, Han-Nambu 1965).
 * - Truth Tier T4 caveat: Color-singlet is a quantum superposition; balls snapshot is symbolic.
 * - Colorblind-safe accessibility: Distinct r/g/b letters, tactile SVG patterns, and Okabe-Ito compatibility.
 * - Zero hardcoded scientific constants.
 */

import {
  QUARKS,
  COLOR_CHARGE,
  CONFINEMENT,
  getQuarkData
} from '../data/quark-facts.js';
import { ConservationLedger, verifyColorSingletState, resolveQuantumNumbers } from '../physics/conservation-ledger.js';
import { lookupHadron } from '../physics/hadron-lookup.js';
import { createTierBadge } from '../components/tier-badge.js';

const ICON_CHECK_SVG = '<svg class="c3-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="valid"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_CROSS_SVG = '<svg class="c3-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="invalid"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

export class Chapter3ColorLab {
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

    // Scientific color data loaded dynamically from data/quark-facts.js
    this.colorNames = [...COLOR_CHARGE.colors]; // ['red', 'green', 'blue']
    this.antiColors = [...COLOR_CHARGE.antiColors]; // ['anti-red', 'anti-green', 'anti-blue']
    this.antiColorHex = {
      'anti-red': COLOR_CHARGE.antiColorHex.red,       // cyan (#00e5ff)
      'anti-green': COLOR_CHARGE.antiColorHex.green,   // magenta (#ff007f)
      'anti-blue': COLOR_CHARGE.antiColorHex.blue      // yellow (#ffd600)
    };
    this.colorHex = {
      red: '#ff2d55',
      green: '#00e676',
      blue: '#00b0ff'
    };

    // Gluon basis states from Single Source of Truth
    this.gluonBasisStates = [...COLOR_CHARGE.gluons.basisStates];

    // "Make White" Chamber active slots
    this.chamberParticles = [];

    // Exchange Simulator State
    this.exchangeState = {
      q1Color: 'red',
      q2Color: 'green',
      q3Color: 'blue',
      selectedGluon: 'r g_bar',
      isExchanging: false,
      lastExchangeResult: null
    };

    this.initDOM();
    this.attachEvents();
    this.updateLanguageStrings();
    this.updateLevelContent();
    this.runChamberAudit();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'chapter3-colorlab-wrapper';

    this.wrapper.innerHTML = `
      <!-- First-Look Epistemic Disclaimer Banner (Mandatory T4) -->
      <section class="c3-disclaimer-banner" role="region" aria-label="Color Charge Epistemic Disclaimer">
        <div class="c3-disclaimer-content">
          <div class="c3-disclaimer-tag-row">
            <span class="c3-disclaimer-pill" id="c3-disclaimer-badge"></span>
            <span class="c3-disclaimer-title" id="c3-disclaimer-title">EPISTEMIC NOTICE • COLOR CHARGE IS NOT LIGHT</span>
          </div>
          <p class="c3-disclaimer-text" id="c3-disclaimer-text">
            এই রঙ কালার-চার্জের নাম, আলোর রঙ নয়। কালার-সিঙ্গলেট আসলে একটি কোয়ান্টাম সুপারপজিশন; "লাল-সবুজ-নীল" স্ন্যাপশট প্রতীকী (T4)।
          </p>
        </div>
        <div class="c3-disclaimer-actions">
          <button class="c3-btn-proof" id="c3-btn-proof" type="button" aria-label="Open Experimental Proof Drawer">
            <svg class="c3-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span id="c3-lbl-proof-btn">প্রমাণ কোথায়? (Δ⁺⁺)</span>
          </button>
        </div>
      </section>

      <!-- Main Lab Grid: Left = Color Wheel & Make White Game; Right = Gluons & Exchange Simulator -->
      <div class="c3-lab-grid">
        <!-- LEFT COLUMN: Color Wheel & "Make White" Game -->
        <div class="c3-column left-column">
          <!-- 1. The QCD Color Wheel -->
          <div class="c3-card c3-wheel-card">
            <div class="c3-card-header">
              <h3 class="c3-card-title" id="c3-title-wheel">SU(3) রঙ-চাকা (QCD Color Wheel)</h3>
              <label class="c3-cb-toggle-label" for="c3-toggle-colorblind">
                <input type="checkbox" id="c3-toggle-colorblind" class="c3-cb-input">
                <span class="c3-cb-track"><span class="c3-cb-thumb"></span></span>
                <span class="c3-cb-text" id="c3-lbl-cb-mode">বর্ণান্ধ-সহায়ক মোড</span>
              </label>
            </div>

            <div class="c3-wheel-layout">
              <div class="c3-wheel-canvas-box">
                <svg class="c3-wheel-svg" id="c3-wheel-svg" viewBox="-160 -160 320 320" width="280" height="280" aria-label="SU(3) color charge wheel diagram">
                  <!-- SVG definitions for colorblind patterns -->
                  <defs>
                    <pattern id="pat-stripes-r" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" stroke-width="1.8" />
                    </pattern>
                    <pattern id="pat-dots-g" width="6" height="6" patternUnits="userSpaceOnUse">
                      <circle cx="3" cy="3" r="1.5" fill="#ffffff" />
                    </pattern>
                    <pattern id="pat-rings-b" width="8" height="8" patternUnits="userSpaceOnUse">
                      <rect width="8" height="8" fill="none" stroke="#ffffff" stroke-width="1" />
                    </pattern>
                    <pattern id="pat-cross-anti-r" width="6" height="6" patternUnits="userSpaceOnUse">
                      <path d="M0 0L6 6M6 0L0 6" stroke="#000000" stroke-width="1" />
                    </pattern>
                    <pattern id="pat-wavy-anti-g" width="6" height="6" patternUnits="userSpaceOnUse">
                      <path d="M0 3 Q 1.5 0, 3 3 T 6 3" fill="none" stroke="#000000" stroke-width="1" />
                    </pattern>
                    <pattern id="pat-dash-anti-b" width="6" height="6" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="3" x2="6" y2="3" stroke="#000000" stroke-width="1.5" stroke-dasharray="2 1" />
                    </pattern>
                  </defs>

                  <!-- Background coordinate axes -->
                  <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3" />
                  <line x1="-130" y1="0" x2="130" y2="0" stroke="rgba(255,255,255,0.06)" />
                  <line x1="0" y1="-130" x2="0" y2="130" stroke="rgba(255,255,255,0.06)" />

                  <!-- Triplet Connecting Rays -->
                  <polygon points="0,-110 95.26,55 -95.26,55" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
                  <polygon points="0,110 -95.26,-55 95.26,-55" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.1)" stroke-width="1.2" stroke-dasharray="2 2" />

                  <!-- Central Neutral Singlet (White) Node -->
                  <circle cx="0" cy="0" r="22" fill="#ffffff" filter="drop-shadow(0 0 10px rgba(255,255,255,0.8))" />
                  <text x="0" y="4" text-anchor="middle" fill="#030712" font-size="11" font-weight="bold" font-family="'JetBrains Mono', monospace">WHITE</text>

                  <!-- 3 Fundamental Colors (r, g, b at 120 deg) -->
                  <!-- Red (Top: 0, -110) -->
                  <g class="c3-wheel-node" id="node-red" transform="translate(0, -110)">
                    <circle r="20" fill="#ff2d55" stroke="#ffffff" stroke-width="2" />
                    <circle class="c3-pattern-overlay" r="20" fill="url(#pat-stripes-r)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="'JetBrains Mono', monospace">r</text>
                  </g>

                  <!-- Green (Bottom Right: 95.26, 55) -->
                  <g class="c3-wheel-node" id="node-green" transform="translate(95.26, 55)">
                    <circle r="20" fill="#00e676" stroke="#ffffff" stroke-width="2" />
                    <circle class="c3-pattern-overlay" r="20" fill="url(#pat-dots-g)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="'JetBrains Mono', monospace">g</text>
                  </g>

                  <!-- Blue (Bottom Left: -95.26, 55) -->
                  <g class="c3-wheel-node" id="node-blue" transform="translate(-95.26, 55)">
                    <circle r="20" fill="#00b0ff" stroke="#ffffff" stroke-width="2" />
                    <circle class="c3-pattern-overlay" r="20" fill="url(#pat-rings-b)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="'JetBrains Mono', monospace">b</text>
                  </g>

                  <!-- 3 Anti-Colors (Directly Opposite) -->
                  <!-- Anti-Red = Cyan (Bottom: 0, 110) -->
                  <g class="c3-wheel-node" id="node-anti-red" transform="translate(0, 110)">
                    <circle r="18" fill="#00e5ff" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" />
                    <circle class="c3-pattern-overlay" r="18" fill="url(#pat-cross-anti-r)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#000000" font-size="12" font-weight="bold" font-family="'JetBrains Mono', monospace">r̄</text>
                  </g>

                  <!-- Anti-Green = Magenta (Top Left: -95.26, -55) -->
                  <g class="c3-wheel-node" id="node-anti-green" transform="translate(-95.26, -55)">
                    <circle r="18" fill="#ff007f" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" />
                    <circle class="c3-pattern-overlay" r="18" fill="url(#pat-wavy-anti-g)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold" font-family="'JetBrains Mono', monospace">ḡ</text>
                  </g>

                  <!-- Anti-Blue = Yellow (Top Right: 95.26, -55) -->
                  <g class="c3-wheel-node" id="node-anti-blue" transform="translate(95.26, -55)">
                    <circle r="18" fill="#ffd600" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" />
                    <circle class="c3-pattern-overlay" r="18" fill="url(#pat-dash-anti-b)" opacity="0" />
                    <text y="4" text-anchor="middle" fill="#000000" font-size="12" font-weight="bold" font-family="'JetBrains Mono', monospace">b̄</text>
                  </g>
                </svg>
              </div>

              <div class="c3-wheel-legend">
                <div class="c3-legend-item">
                  <span class="c3-legend-dot r"></span>
                  <span class="c3-legend-text"><strong>r, g, b</strong>: কালার-চার্জ ট্রিপলেট (১২০° ব্যবধান)</span>
                </div>
                <div class="c3-legend-item">
                  <span class="c3-legend-dot anti-r"></span>
                  <span class="c3-legend-text"><strong>r̄, ḡ, b̄</strong>: অ্যান্টি-কালার (সায়ান, ম্যাজেন্টা, হলুদ)</span>
                </div>
                <div class="c3-legend-item">
                  <span class="c3-legend-dot white"></span>
                  <span class="c3-legend-text"><strong>কেন্দ্রীয় সাদা</strong>: কালার-সিঙ্গলেট (মুক্ত কণার একমাত্র বৈধ রূপ)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. "Make White" Game / Assembly Lab -->
          <div class="c3-card c3-chamber-card">
            <div class="c3-card-header">
              <h3 class="c3-card-title" id="c3-title-game">“সাদা বানাও” খেলা (Make White Lab)</h3>
              <div class="c3-chamber-actions">
                <button class="c3-btn-sub" id="c3-btn-clear-chamber" type="button">খালি করুন</button>
              </div>
            </div>

            <!-- Presets row -->
            <div class="c3-presets-row">
              <span class="c3-presets-lbl" id="c3-lbl-presets">দ্রুত প্রিসেট:</span>
              <button class="c3-preset-btn" id="c3-pre-baryon" type="button">ব্যারিয়ন (uud)</button>
              <button class="c3-preset-btn" id="c3-pre-meson" type="button">মেসন (ud̄)</button>
              <button class="c3-preset-btn invalid" id="c3-pre-diquark" type="button">অবৈধ (ud)</button>
              <button class="c3-preset-btn" id="c3-pre-antibaryon" type="button">অ্যান্টি-ব্যারিয়ন (ūd̄s̄)</button>
            </div>

            <!-- Quark Palette Selector Tray -->
            <div class="c3-palette-tray">
              <div class="c3-palette-group">
                <span class="c3-palette-title" id="c3-lbl-quarks-tray">কোয়ার্ক যুক্ত করুন (r, g, b):</span>
                <div class="c3-palette-btns">
                  <!-- Up Quarks -->
                  <button class="c3-particle-btn r" data-flavor="u" data-color="red" type="button">u <small>(r)</small></button>
                  <button class="c3-particle-btn g" data-flavor="u" data-color="green" type="button">u <small>(g)</small></button>
                  <button class="c3-particle-btn b" data-flavor="u" data-color="blue" type="button">u <small>(b)</small></button>
                  <!-- Down Quarks -->
                  <button class="c3-particle-btn r" data-flavor="d" data-color="red" type="button">d <small>(r)</small></button>
                  <button class="c3-particle-btn g" data-flavor="d" data-color="green" type="button">d <small>(g)</small></button>
                  <button class="c3-particle-btn b" data-flavor="d" data-color="blue" type="button">d <small>(b)</small></button>
                  <!-- Strange Quarks -->
                  <button class="c3-particle-btn r" data-flavor="s" data-color="red" type="button">s <small>(r)</small></button>
                  <button class="c3-particle-btn g" data-flavor="s" data-color="green" type="button">s <small>(g)</small></button>
                  <button class="c3-particle-btn b" data-flavor="s" data-color="blue" type="button">s <small>(b)</small></button>
                </div>
              </div>

              <div class="c3-palette-group">
                <span class="c3-palette-title" id="c3-lbl-antiquarks-tray">অ্যান্টিকোয়ার্ক যুক্ত করুন (r̄, ḡ, b̄):</span>
                <div class="c3-palette-btns">
                  <!-- Anti-Up Quarks -->
                  <button class="c3-particle-btn anti-r" data-flavor="u_bar" data-color="anti-red" type="button">ū <small>(r̄)</small></button>
                  <button class="c3-particle-btn anti-g" data-flavor="u_bar" data-color="anti-green" type="button">ū <small>(ḡ)</small></button>
                  <button class="c3-particle-btn anti-b" data-flavor="u_bar" data-color="anti-blue" type="button">ū <small>(b̄)</small></button>
                  <!-- Anti-Down Quarks -->
                  <button class="c3-particle-btn anti-r" data-flavor="d_bar" data-color="anti-red" type="button">d̄ <small>(r̄)</small></button>
                  <button class="c3-particle-btn anti-g" data-flavor="d_bar" data-color="anti-green" type="button">d̄ <small>(ḡ)</small></button>
                  <button class="c3-particle-btn anti-b" data-flavor="d_bar" data-color="anti-blue" type="button">d̄ <small>(b̄)</small></button>
                  <!-- Anti-Strange Quarks -->
                  <button class="c3-particle-btn anti-r" data-flavor="s_bar" data-color="anti-red" type="button">s̄ <small>(r̄)</small></button>
                  <button class="c3-particle-btn anti-g" data-flavor="s_bar" data-color="anti-green" type="button">s̄ <small>(ḡ)</small></button>
                  <button class="c3-particle-btn anti-b" data-flavor="s_bar" data-color="anti-blue" type="button">s̄ <small>(b̄)</small></button>
                </div>
              </div>
            </div>

            <!-- Reaction Chamber Vessel Area -->
            <div class="c3-vessel-area" id="c3-vessel-area" aria-live="polite">
              <div class="c3-vessel-dropzone" id="c3-vessel-dropzone">
                <span class="c3-vessel-empty-prompt" id="c3-vessel-prompt">প্যালেট থেকে কোয়ার্ক নির্বাচন করে চেম্বারে যোগ করুন</span>
              </div>
            </div>

            <!-- Confinement Ledger Audit Result Card -->
            <div class="c3-audit-result-box" id="c3-audit-result-box">
              <!-- Dynamically populated by runChamberAudit() -->
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: 8 Gluon Cards & Exchange Simulator -->
        <div class="c3-column right-column">
          <!-- 3. The 8 Gluon Cards -->
          <div class="c3-card c3-gluons-card">
            <div class="c3-card-header">
              <div class="c3-header-meta">
                <h3 class="c3-card-title" id="c3-title-gluons">৮টি গ্লুয়ন স্টেট (SU(3) Color Octet)</h3>
                <span class="c3-gluon-count-tag">8 BASIS STATES</span>
              </div>
              <button class="c3-btn-ninth" id="c3-btn-ninth-gluon" type="button" aria-label="Why is there no 9th gluon?">
                <span id="c3-lbl-ninth-btn">নবম নেই কেন?</span>
                <svg class="c3-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>

            <p class="c3-gluon-intro" id="c3-desc-gluons">
              গ্লুয়ন ভরহীন ও বিদ্যুৎ-চার্জহীন, কিন্তু এরা নিজেরাই কালার-চার্জ বহন করে। নিচের ৮টি স্বাধীন কোয়ান্টাম স্টেট শক্তিশালী বল পরিবহন করে:
            </p>

            <div class="c3-gluon-grid" id="c3-gluon-grid">
              <!-- 6 Off-Diagonal Gluons -->
              <div class="c3-gluon-item off-diagonal" data-basis="r g_bar">
                <span class="c3-gluon-symbol">r ḡ</span>
                <span class="c3-gluon-desc">Red → Green</span>
              </div>
              <div class="c3-gluon-item off-diagonal" data-basis="r b_bar">
                <span class="c3-gluon-symbol">r b̄</span>
                <span class="c3-gluon-desc">Red → Blue</span>
              </div>
              <div class="c3-gluon-item off-diagonal" data-basis="g r_bar">
                <span class="c3-gluon-symbol">g r̄</span>
                <span class="c3-gluon-desc">Green → Red</span>
              </div>
              <div class="c3-gluon-item off-diagonal" data-basis="g b_bar">
                <span class="c3-gluon-symbol">g b̄</span>
                <span class="c3-gluon-desc">Green → Blue</span>
              </div>
              <div class="c3-gluon-item off-diagonal" data-basis="b r_bar">
                <span class="c3-gluon-symbol">b r̄</span>
                <span class="c3-gluon-desc">Blue → Red</span>
              </div>
              <div class="c3-gluon-item off-diagonal" data-basis="b g_bar">
                <span class="c3-gluon-symbol">b ḡ</span>
                <span class="c3-gluon-desc">Blue → Green</span>
              </div>

              <!-- 2 Diagonal Gluons -->
              <div class="c3-gluon-item diagonal" data-basis="(r r_bar - g g_bar)/sqrt(2)">
                <span class="c3-gluon-symbol">(r r̄ − g ḡ)/√2</span>
                <span class="c3-gluon-desc">Diagonal (No Color Swap)</span>
              </div>
              <div class="c3-gluon-item diagonal" data-basis="(r r_bar + g g_bar - 2 b b_bar)/sqrt(6)">
                <span class="c3-gluon-symbol">(r r̄ + g ḡ − 2b b̄)/√6</span>
                <span class="c3-gluon-desc">Diagonal (No Color Swap)</span>
              </div>
            </div>
          </div>

          <!-- 4. Gluon Exchange Simulator -->
          <div class="c3-card c3-exchange-card">
            <div class="c3-card-header">
              <h3 class="c3-card-title" id="c3-title-exchange">বিনিময় সিমুলেটর (Gluon Exchange Simulator)</h3>
            </div>

            <p class="c3-exchange-rule" id="c3-desc-exchange-rule">
              নিয়ম: c₁ রঙের কোয়ার্ক (c₁ c̄₂) গ্লুয়ন ছেড়ে c₂ হয়; c₂ রঙের কোয়ার্ক সেটি শুষে c₁ হয়।
            </p>

            <div class="c3-exchange-stage">
              <!-- Quark 1 -->
              <div class="c3-stage-quark" id="c3-stage-q1">
                <div class="c3-quark-orb" id="c3-orb-q1" style="background:#ff2d55">
                  <span class="c3-orb-lbl" id="c3-lbl-q1">u (r)</span>
                </div>
                <span class="c3-stage-caption" id="c3-cap-q1">কোয়ার্ক ১</span>
              </div>

              <!-- Connecting Gluon Transfer Tunnel -->
              <div class="c3-stage-tunnel">
                <div class="c3-gluon-packet-transit" id="c3-transit-packet">
                  <span class="c3-transit-label" id="c3-transit-label">r ḡ</span>
                </div>
                <div class="c3-tunnel-line"></div>
              </div>

              <!-- Quark 2 -->
              <div class="c3-stage-quark" id="c3-stage-q2">
                <div class="c3-quark-orb" id="c3-orb-q2" style="background:#00e676">
                  <span class="c3-orb-lbl" id="c3-lbl-q2">u (g)</span>
                </div>
                <span class="c3-stage-caption" id="c3-cap-q2">কোয়ার্ক ২</span>
              </div>
            </div>

            <div class="c3-exchange-controls">
              <div class="c3-select-gluon-row">
                <label for="c3-select-gluon" id="c3-lbl-select-gluon">বিনিময়যোগ্য গ্লুয়ন:</label>
                <select id="c3-select-gluon" class="c3-gluon-select">
                  <option value="r g_bar">r ḡ (লাল ↔ সবুজ অদলবদল)</option>
                  <option value="r b_bar">r b̄ (লাল ↔ নীল অদলবদল)</option>
                  <option value="g b_bar">g b̄ (সবুজ ↔ নীল অদলবদল)</option>
                  <option value="diag1">(r r̄ − g ḡ)/√2 (ডায়াগোনাল, রঙ অপরিবর্তিত)</option>
                  <option value="diag2">(r r̄ + g ḡ − 2b b̄)/√6 (ডায়াগোনাল, রঙ অপরিবর্তিত)</option>
                </select>
              </div>

              <button class="c3-btn-primary" id="c3-btn-trigger-exchange" type="button">
                <svg class="c3-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 3l4 4-4 4"></path>
                  <path d="M20 7H4"></path>
                  <path d="M8 21l-4-4 4-4"></path>
                  <path d="M4 17h16"></path>
                </svg>
                <span id="c3-lbl-trigger-btn">গ্লুয়ন বিনিময় ঘটান</span>
              </button>
            </div>

            <!-- Exchange Ledger Box -->
            <div class="c3-exchange-ledger" id="c3-exchange-ledger">
              <div class="c3-ledger-line">
                <span class="c3-ledger-tag">BEFORE:</span>
                <span class="c3-ledger-status ok" id="c3-led-before">r + g + b = ${this.lang === 'bn' ? 'সাদা' : 'White'} ${ICON_CHECK_SVG} (Color Singlet)</span>
              </div>
              <div class="c3-ledger-line">
                <span class="c3-ledger-tag">ACTION:</span>
                <span class="c3-ledger-action" id="c3-led-action">${this.lang === 'bn' ? 'লাল কোয়ার্ক rḡ ছেড়ে সবুজ হলো; সবুজ কোয়ার্ক শুষে লাল হলো' : 'Red quark emitted rḡ becoming green; Green absorbed it becoming red'}</span>
              </div>
              <div class="c3-ledger-line">
                <span class="c3-ledger-tag">AFTER:</span>
                <span class="c3-ledger-status ok" id="c3-led-after">g + r + b = ${this.lang === 'bn' ? 'সাদা' : 'White'} ${ICON_CHECK_SVG} (Color Singlet)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.wrapper);

    // Initial Badge mounting
    const disclaimerBadge = this.wrapper.querySelector('#c3-disclaimer-badge');
    if (disclaimerBadge) {
      disclaimerBadge.appendChild(createTierBadge({
        tier: 'T4',
        lang: this.lang,
        compact: false,
        interactive: true,
        onClick: () => this.openDrawerFor('color_superposition')
      }));
    }
  }

  attachEvents() {
    // 1. Proof Drawer Button
    this.wrapper.querySelector('#c3-btn-proof')?.addEventListener('click', () => {
      this.openDrawerFor('proof_delta_plus_plus');
    });

    // 2. 9th Gluon Button
    this.wrapper.querySelector('#c3-btn-ninth-gluon')?.addEventListener('click', () => {
      this.openDrawerFor('why_no_ninth_gluon');
    });

    // 3. Colorblind Mode Toggle
    const cbToggle = this.wrapper.querySelector('#c3-toggle-colorblind');
    cbToggle?.addEventListener('change', (e) => {
      this.isColorblindMode = e.target.checked;
      this.updateColorblindStyles();
    });

    // 4. "Make White" Tray Particle Buttons
    const particleBtns = this.wrapper.querySelectorAll('.c3-particle-btn');
    particleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const flavor = btn.getAttribute('data-flavor');
        const color = btn.getAttribute('data-color');
        this.addParticleToChamber(flavor, color);
      });
    });

    // 5. Presets
    this.wrapper.querySelector('#c3-pre-baryon')?.addEventListener('click', () => {
      this.chamberParticles = [
        { flavor: 'u', color: 'red' },
        { flavor: 'u', color: 'green' },
        { flavor: 'd', color: 'blue' }
      ];
      this.runChamberAudit();
    });

    this.wrapper.querySelector('#c3-pre-meson')?.addEventListener('click', () => {
      this.chamberParticles = [
        { flavor: 'u', color: 'red' },
        { flavor: 'd_bar', color: 'anti-red' }
      ];
      this.runChamberAudit();
    });

    this.wrapper.querySelector('#c3-pre-diquark')?.addEventListener('click', () => {
      this.chamberParticles = [
        { flavor: 'u', color: 'red' },
        { flavor: 'd', color: 'green' }
      ];
      this.runChamberAudit();
    });

    this.wrapper.querySelector('#c3-pre-antibaryon')?.addEventListener('click', () => {
      this.chamberParticles = [
        { flavor: 'u_bar', color: 'anti-red' },
        { flavor: 'd_bar', color: 'anti-green' },
        { flavor: 's_bar', color: 'anti-blue' }
      ];
      this.runChamberAudit();
    });

    // 6. Clear Chamber
    this.wrapper.querySelector('#c3-btn-clear-chamber')?.addEventListener('click', () => {
      this.chamberParticles = [];
      this.runChamberAudit();
    });

    // 7. Gluon Exchange Trigger
    this.wrapper.querySelector('#c3-btn-trigger-exchange')?.addEventListener('click', () => {
      this.triggerExchange();
    });
  }

  addParticleToChamber(flavor, color) {
    if (this.chamberParticles.length >= 6) return; // limit
    this.chamberParticles.push({ flavor, color });
    this.runChamberAudit();
  }

  removeParticleFromChamber(idx) {
    this.chamberParticles.splice(idx, 1);
    this.runChamberAudit();
  }

  runChamberAudit() {
    const isBn = this.lang === 'bn';
    const dropzone = this.wrapper.querySelector('#c3-vessel-dropzone');
    const resultBox = this.wrapper.querySelector('#c3-audit-result-box');
    if (!dropzone || !resultBox) return;

    dropzone.innerHTML = '';

    if (this.chamberParticles.length === 0) {
      dropzone.innerHTML = `
        <span class="c3-vessel-empty-prompt">
          ${isBn ? 'প্যালেট থেকে কোয়ার্ক নির্বাচন করে চেম্বারে যোগ করুন' : 'Click quarks from palette above to assemble in chamber'}
        </span>
      `;
      resultBox.className = 'c3-audit-result-box neutral';
      resultBox.innerHTML = `
        <span class="c3-result-status-title neutral">
          ${isBn ? 'চেম্বার শূন্য • কোনো কণা নেই' : 'Chamber Empty • No Particles'}
        </span>
        <p class="c3-result-desc">
          ${isBn ? 'ব্যারিয়ন তৈরি করতে r+g+b অথবা মেসন তৈরি করতে color+anti-color যোগ করুন।' : 'Add r+g+b for baryons or color+anti-color for mesons.'}
        </p>
      `;
      return;
    }

    // Render particle pills inside dropzone
    this.chamberParticles.forEach((p, idx) => {
      const qData = getQuarkData(p.flavor);
      const isAnti = p.flavor.endsWith('_bar');
      const hex = isAnti ? (this.antiColorHex[p.color] || '#00e5ff') : (this.colorHex[p.color] || '#ff2d55');
      const colorCode = this.getColorShortLabel(p.color);

      const pill = document.createElement('div');
      pill.className = `c3-chamber-pill ${isAnti ? 'anti' : ''}`;
      pill.style.setProperty('--pill-color', hex);

      pill.innerHTML = `
        <span class="c3-pill-dot" style="background:${hex}"></span>
        <span class="c3-pill-name">${qData ? qData.symbol : p.flavor} <small>(${colorCode})</small></span>
        <button class="c3-pill-remove" type="button" aria-label="Remove particle">×</button>
      `;

      pill.querySelector('.c3-pill-remove').addEventListener('click', () => {
        this.removeParticleFromChamber(idx);
      });

      dropzone.appendChild(pill);
    });

    // Audit using ConservationLedger & verifyColorSingletState!
    const resolved = this.chamberParticles.map(p => {
      const qData = getQuarkData(p.flavor);
      return {
        type: 'quark',
        symbol: qData ? qData.symbol : p.flavor,
        color: p.color,
        charge: qData ? qData.charge.value : 0,
        baryonNumber: qData ? qData.baryonNumber.value : 0,
        strangeness: qData ? qData.strangeness : 0,
        charm: qData ? qData.charm : 0,
        bottomness: qData ? qData.bottomness : 0,
        topness: qData ? qData.topness : 0,
        massGeV: qData ? (qData.mass.unit === 'GeV/c^2' ? qData.mass.value : qData.mass.value * 1e-3) : 0
      };
    });

    const singletAudit = verifyColorSingletState(resolved);
    const netChargeVal = resolved.reduce((acc, p) => acc + p.charge, 0);
    const netBaryonVal = resolved.reduce((acc, p) => acc + p.baryonNumber, 0);

    const chargeStr = (netChargeVal >= 0 ? '+' : '') + netChargeVal.toFixed(2).replace(/\.00$/, '') + ' e';
    const baryonStr = netBaryonVal.toFixed(2).replace(/\.00$/, '');

    // Formatted formula: e.g. "uud" or "ud̄"
    const formulaStr = resolved.map(p => p.symbol).join('');

    // Hadron lookup if matching
    const flavors = this.chamberParticles.map(p => p.flavor);
    let identifiedHadron = null;
    try {
      identifiedHadron = lookupHadron(flavors);
    } catch (_) {}

    if (singletAudit.isSinglet) {
      // VALID COLOR SINGLET STATE (White)
      resultBox.className = 'c3-audit-result-box valid';

      let hadronLabel = '';
      if (identifiedHadron) {
        hadronLabel = isBn
          ? `শনাক্তকৃত হ্যাড্রন: <strong>${identifiedHadron.nameBn} (${identifiedHadron.symbol})</strong> | ভর: ${identifiedHadron.massMeV} MeV/c²`
          : `Identified Hadron: <strong>${identifiedHadron.nameEn} (${identifiedHadron.symbol})</strong> | Mass: ${identifiedHadron.massMeV} MeV/c²`;
      }

      resultBox.innerHTML = `
        <div class="c3-result-header">
          <span class="c3-result-badge valid">${isBn ? 'সাদা' : 'White'} ${ICON_CHECK_SVG} (${isBn ? 'কালার-সিঙ্গলেট' : 'Color Singlet'})</span>
          <span class="c3-result-formula">${formulaStr}</span>
        </div>
        <div class="c3-result-telemetry">
          <span>${isBn ? 'চার্জ (Q):' : 'Charge (Q):'} <strong>${chargeStr}</strong></span>
          <span>${isBn ? 'ব্যারিয়ন সংখ্যা (B):' : 'Baryon Number (B):'} <strong>${baryonStr}</strong></span>
          <span>${isBn ? 'কালার চার্জ:' : 'Color Charge:'} <strong>${isBn ? 'সাদা (নিরপেক্ষ)' : 'White (Neutral)'}</strong></span>
        </div>
        <p class="c3-result-desc">
          ${isBn
            ? 'কালার কনফাইনমেন্ট সফল! নেট কালার নিরপেক্ষ হওয়ায় এই কণাটি প্রকৃতিতে স্বাধীনভাবে বিরাজ করতে পারে।'
            : 'QCD Color Confinement satisfied! Total color charge cancelled to white singlet; particle can exist freely.'}
        </p>
        ${hadronLabel ? `<div class="c3-result-hadron-id">${hadronLabel}</div>` : ''}
      `;
    } else {
      // INVALID COLORED STATE (Colored, cannot exist unconfined)
      resultBox.className = 'c3-audit-result-box invalid';

      resultBox.innerHTML = `
        <div class="c3-result-header">
          <span class="c3-result-badge invalid">${isBn ? 'রঙিন, মুক্ত থাকতে পারে না' : 'Colored, cannot exist unconfined'} ${ICON_CROSS_SVG}</span>
          <span class="c3-result-formula">${formulaStr}</span>
        </div>
        <div class="c3-result-telemetry">
          <span>${isBn ? 'চার্জ (Q):' : 'Charge (Q):'} <strong>${chargeStr}</strong></span>
          <span>${isBn ? 'ব্যারিয়ন সংখ্যা (B):' : 'Baryon Number (B):'} <strong>${baryonStr}</strong></span>
          <span>${isBn ? 'কালার চার্জ:' : 'Color Charge:'} <strong class="danger">${singletAudit.reason}</strong></span>
        </div>
        <p class="c3-result-desc">
          ${isBn
            ? 'অযুগ্ম কালার-চার্জ বিদ্যমান! QCD কনফাইনমেন্ট অনুসারে কোনো রঙিন কণা বিচ্ছিন্ন বা মুক্ত থাকতে পারে না। দূরত্ব বাড়লে বিভব শক্তি V(r) ≈ σ·r অসীমে ধাবিত হয়, ফলে স্ট্রিং ছিঁড়ে গিয়ে নতুন কোয়ার্ক-অ্যান্টিকোয়ার্ক তৈরি না হওয়া পর্যন্ত এটি কখনোই স্থিতিশীল হতে পারে না।'
            : 'Non-zero color charge detected! Quarks cannot exist in isolation due to confinement. The flux tube energy V(r) ≈ σ·r grows linearly, prohibiting unconfined colored states.'}
        </p>
      `;
    }
  }

  getColorShortLabel(c) {
    if (c === 'red') return 'r';
    if (c === 'green') return 'g';
    if (c === 'blue') return 'b';
    if (c === 'anti-red') return 'r̄';
    if (c === 'anti-green') return 'ḡ';
    if (c === 'anti-blue') return 'b̄';
    return c;
  }

  triggerExchange() {
    const isBn = this.lang === 'bn';
    const selectEl = this.wrapper.querySelector('#c3-select-gluon');
    const gluonType = selectEl ? selectEl.value : 'r g_bar';

    const orb1 = this.wrapper.querySelector('#c3-orb-q1');
    const orb2 = this.wrapper.querySelector('#c3-orb-q2');
    const lbl1 = this.wrapper.querySelector('#c3-lbl-q1');
    const lbl2 = this.wrapper.querySelector('#c3-lbl-q2');
    const packet = this.wrapper.querySelector('#c3-transit-packet');
    const transitLbl = this.wrapper.querySelector('#c3-transit-label');

    const ledBefore = this.wrapper.querySelector('#c3-led-before');
    const ledAction = this.wrapper.querySelector('#c3-led-action');
    const ledAfter = this.wrapper.querySelector('#c3-led-after');

    if (this.exchangeState.isExchanging) return;
    this.exchangeState.isExchanging = true;

    // Trigger visual packet animation
    if (packet) {
      packet.classList.remove('animating');
      void packet.offsetWidth; // reflow
      packet.classList.add('animating');
    }

    if (gluonType === 'diag1' || gluonType === 'diag2') {
      // Diagonal gluon: NO color swap!
      const diagFormula = gluonType === 'diag1' ? '(r r̄ − g ḡ)/√2' : '(r r̄ + g ḡ − 2b b̄)/√6';
      if (transitLbl) transitLbl.textContent = diagFormula;

      setTimeout(() => {
        if (ledAction) {
          ledAction.textContent = isBn
            ? `ডায়াগোনাল গ্লুয়ন ${diagFormula} বিনিময় হলো; কোনো কোয়ার্কের দৃশ্যমান রঙ পরিবর্তন হয়নি।`
            : `Diagonal gluon ${diagFormula} exchanged; colors remain unchanged (phase coupling only).`;
        }
        if (ledAfter) {
          ledAfter.innerHTML = isBn
            ? `r + g + b = সাদা ${ICON_CHECK_SVG} (Color Singlet অক্ষুণ্ণ)`
            : `r + g + b = White ${ICON_CHECK_SVG} (Color Singlet conserved)`;
        }
        this.exchangeState.isExchanging = false;
      }, 700);
      return;
    }

    // Off-diagonal gluon swap:
    let newQ1Color, newQ2Color, gluonLabel, actionText;

    if (gluonType === 'r g_bar') {
      newQ1Color = 'green';
      newQ2Color = 'red';
      gluonLabel = 'r ḡ';
      actionText = isBn
        ? 'কোয়ার্ক ১ rḡ ছেড়ে সবুজ (g) হলো; কোয়ার্ক ২ rḡ শুষে লাল (r) হলো।'
        : 'Quark 1 emitted rḡ becoming green; Quark 2 absorbed it becoming red.';
    } else if (gluonType === 'r b_bar') {
      newQ1Color = 'blue';
      newQ2Color = 'red';
      gluonLabel = 'r b̄';
      actionText = isBn
        ? 'কোয়ার্ক ১ rb̄ ছেড়ে নীল (b) হলো; কোয়ার্ক ২ rb̄ শুষে লাল (r) হলো।'
        : 'Quark 1 emitted rb̄ becoming blue; Quark 2 absorbed it becoming red.';
    } else {
      newQ1Color = 'blue';
      newQ2Color = 'green';
      gluonLabel = 'g b̄';
      actionText = isBn
        ? 'কোয়ার্ক ১ gb̄ ছেড়ে নীল (b) হলো; কোয়ার্ক ২ gb̄ শুষে সবুজ (g) হলো।'
        : 'Quark 1 emitted gb̄ becoming blue; Quark 2 absorbed it becoming green.';
    }

    if (transitLbl) transitLbl.textContent = gluonLabel;

    setTimeout(() => {
      // Apply color swap
      if (orb1) orb1.style.background = this.colorHex[newQ1Color];
      if (orb2) orb2.style.background = this.colorHex[newQ2Color];
      if (lbl1) lbl1.textContent = `u (${this.getColorShortLabel(newQ1Color)})`;
      if (lbl2) lbl2.textContent = `u (${this.getColorShortLabel(newQ2Color)})`;

      if (ledAction) ledAction.textContent = actionText;
      if (ledAfter) {
        ledAfter.innerHTML = isBn
          ? `${this.getColorShortLabel(newQ1Color)} + ${this.getColorShortLabel(newQ2Color)} + b = সাদা ${ICON_CHECK_SVG} (Color Singlet সংরক্ষিত)`
          : `${this.getColorShortLabel(newQ1Color)} + ${this.getColorShortLabel(newQ2Color)} + b = White ${ICON_CHECK_SVG} (Color Singlet conserved)`;
      }

      this.exchangeState.isExchanging = false;
    }, 700);
  }

  updateColorblindStyles() {
    const overlays = this.wrapper.querySelectorAll('.c3-pattern-overlay');
    overlays.forEach(el => {
      el.setAttribute('opacity', this.isColorblindMode ? '0.35' : '0');
    });

    const bodyWrap = this.wrapper;
    if (this.isColorblindMode) {
      bodyWrap.classList.add('colorblind-active');
    } else {
      bodyWrap.classList.remove('colorblind-active');
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    this.updateLanguageStrings();
    this.updateLevelContent();
    this.runChamberAudit();
  }

  setLevel(level) {
    this.level = level;
    this.updateLevelContent();
  }

  updateLanguageStrings() {
    const isBn = this.lang === 'bn';

    const setTxt = (sel, bn, en) => {
      const el = this.wrapper.querySelector(sel);
      if (el) el.textContent = isBn ? bn : en;
    };

    setTxt('#c3-disclaimer-title', 'প্রথম দর্শনে নোট • কালার-চার্জ আলোর রঙ নয়', 'EPISTEMIC NOTICE • COLOR CHARGE IS NOT LIGHT');
    setTxt('#c3-disclaimer-text',
      'এই রঙ কালার-চার্জের নাম, আলোর রঙ নয়। কালার-সিঙ্গলেট আসলে একটি কোয়ান্টাম সুপারপজিশন; "লাল-সবুজ-নীল" স্ন্যাপশট প্রতীকী (T4)।',
      'This color is the name of color-charge, not the color of light. Color-singlet is a quantum superposition; the red-green-blue snapshot is symbolic (T4).'
    );
    setTxt('#c3-lbl-proof-btn', 'প্রমাণ কোথায়? (Δ⁺⁺)', 'Where is the Proof? (Δ⁺⁺)');
    setTxt('#c3-title-wheel', 'SU(3) রঙ-চাকা (QCD Color Wheel)', 'SU(3) Color Charge Wheel');
    setTxt('#c3-lbl-cb-mode', 'বর্ণান্ধ-সহায়ক মোড', 'Colorblind-Safe Mode');
    setTxt('#c3-title-game', '“সাদা বানাও” খেলা (Make White Lab)', 'Make White Lab (Confinement Game)');
    setTxt('#c3-btn-clear-chamber', 'খালি করুন', 'Clear Chamber');
    setTxt('#c3-lbl-presets', 'দ্রুত প্রিসেট:', 'Presets:');
    setTxt('#c3-pre-baryon', 'ব্যারিয়ন (uud)', 'Baryon (uud)');
    setTxt('#c3-pre-meson', 'মেসন (ud̄)', 'Meson (ud̄)');
    setTxt('#c3-pre-diquark', 'অবৈধ ডিকোয়ার্ক (ud)', 'Invalid (ud)');
    setTxt('#c3-pre-antibaryon', 'অ্যান্টি-ব্যারিয়ন (ūd̄s̄)', 'Anti-Baryon (ūd̄s̄)');

    setTxt('#c3-lbl-quarks-tray', 'কোয়ার্ক যুক্ত করুন (r, g, b):', 'Add Quarks (r, g, b):');
    setTxt('#c3-lbl-antiquarks-tray', 'অ্যান্টিকোয়ার্ক যুক্ত করুন (r̄, ḡ, b̄):', 'Add Antiquarks (r̄, ḡ, b̄):');

    setTxt('#c3-title-gluons', '৮টি গ্লুয়ন স্টেট (SU(3) Color Octet)', '8 Gluon States (Color Octet)');
    setTxt('#c3-lbl-ninth-btn', 'নবম নেই কেন?', 'Why No 9th Gluon?');
    setTxt('#c3-desc-gluons',
      'গ্লুয়ন ভরহীন ও বিদ্যুৎ-চার্জহীন, কিন্তু এরা নিজেরাই কালার-চার্জ বহন করে। নিচের ৮টি স্বাধীন কোয়ান্টাম স্টেট শক্তিশালী বল পরিবহন করে:',
      'Gluons are massless and electrically neutral, but carry color charge themselves. These 8 independent quantum states mediate the strong force:'
    );

    setTxt('#c3-title-exchange', 'বিনিময় সিমুলেটর (Gluon Exchange Simulator)', 'Gluon Exchange Simulator');
    setTxt('#c3-desc-exchange-rule',
      'নিয়ম: c₁ রঙের কোয়ার্ক (c₁ c̄₂) গ্লুয়ন ছেড়ে c₂ হয়; c₂ রঙের কোয়ার্ক সেটি শুষে c₁ হয়।',
      'Rule: Quark of color c1 emits (c1 c2_bar) becoming c2; Quark of color c2 absorbs it becoming c1.'
    );
    setTxt('#c3-lbl-select-gluon', 'বিনিময়যোগ্য গ্লুয়ন:', 'Exchange Gluon:');
    setTxt('#c3-lbl-trigger-btn', 'গ্লুয়ন বিনিময় ঘটান', 'Trigger Exchange');
    setTxt('#c3-cap-q1', 'কোয়ার্ক ১', 'Quark 1');
    setTxt('#c3-cap-q2', 'কোয়ার্ক ২', 'Quark 2');
  }

  updateLevelContent() {
    // Pedagogy level tuning for Chapter 3
    // In expert level, display SU(3) Gell-Mann matrices & weight diagram formulas
  }

  openDrawerFor(key) {
    if (!this.infoDrawer) return;

    if (key === 'color_superposition') {
      this.infoDrawer.open({
        claimEn: 'The proton color-singlet state is a completely anti-symmetric quantum superposition, not three static colored spheres.',
        claimBn: 'প্রোটনের কালার-সিঙ্গলেট অবস্থা সম্পূর্ণ অ্যান্টি-সিমেট্রিক কোয়ান্টাম সুপারপজিশন, তিনটি নিরেট রঙের গোলক নয়।',
        tier: 'T4',
        evidenceEn: '|p> = (1/√6) [|rgb> - |rbg> + |gbr> - |grb> + |brg> - |bgr>]. An observer measuring the three quarks at any instant will find one red, one green, and one blue with probability 1, but the physical state is a coherent colorless SU(3) singlet.',
        evidenceBn: '|p> = (১/√৬) [|rgb> - |rbg> + |gbr> - |grb> + |brg> - |bgr>]। যেকোনো মুহূর্তে পর্যবেক্ষণ করলে ১টি লাল, ১টি সবুজ ও ১টি নীল পাওয়া যাবে, তবে ভৌত অবস্থাটি একটি নিরবচ্ছিন্ন বর্ণহীন SU(3) সিঙ্গলেট।',
        sources: [
          'D. J. Griffiths: Introduction to Elementary Particles (Chapter 5 & 8)',
          'Particle Data Group (PDG 2024/2026): Quantum Chromodynamics Review'
        ],
        unknownNoteEn: 'Confinement guarantees that free color states cannot escape, but the non-perturbative transition from color confinement to hadronization lacks a closed-form analytic proof.',
        unknownNoteBn: 'কনফাইনমেন্ট নিশ্চিত করে যে কোনো রঙিন কণা মুক্ত হতে পারে না, তবে হেড্রোনাইজেশনের ট্রানজিশনের কোনো বিশ্লেষণী রুদ্ধ সমীকরণ নেই।'
      });
    } else if (key === 'proof_delta_plus_plus') {
      this.infoDrawer.open({
        claimEn: 'The existence of Delta++ (uuu) baryon with spin-3/2 requires color charge to prevent Pauli Exclusion Principle violation.',
        claimBn: 'স্পিন-৩/২ বিশিষ্ট ডেল্টা++ (uuu) ব্যারিয়নের অস্তিত্ব পাউলি অপবর্জন নীতি লঙ্ঘন রোধে কালার-চার্জের অস্তিত্ব প্রমাণ করে।',
        tier: 'T1',
        evidenceEn: 'Delta++ is composed of three identical up quarks (uuu) in ground orbital state (L=0, symmetric space wavefunction), aligned spin (S=3/2, symmetric spin wavefunction), and identical flavor (symmetric flavor wavefunction). Since quarks are fermions (spin-1/2), the total wavefunction must be completely anti-symmetric. This necessitates a 4th degree of freedom: anti-symmetric Color Singlet wavefunction (1/√6) ε_ijk |q_i q_j q_k>.',
        evidenceBn: 'ডেল্টা++ কণা ৩টি অভিন্ন আপ কোয়ার্ক (uuu) দ্বারা গঠিত, যার স্থানিক তরঙ্গফাংশন প্রতিসম (L=০), স্পিন তরঙ্গফাংশন প্রতিসম (S=৩/২) এবং ফ্লেভার প্রতিসম (uuu)। কোয়ার্ক ফার্মিয়ন হওয়ায় সামগ্রিক তরঙ্গফাংশন সম্পূর্ণ প্রতিসাম্যহীন (anti-symmetric) হতে হবে। সুতরাং চতুর্থ একটি প্রতিসাম্যহীন কোয়ান্টাম মাত্রা অপরিহার্য—যা হলো কালার চার্জ।',
        sources: [
          'O. W. Greenberg, Phys. Rev. Lett. 13, 598 (1964)',
          'M. Y. Han and Y. Nambu, Phys. Rev. 139, B1006 (1965)',
          'PDG 2024/2026: Delta(1232) Resonance Review'
        ],
        unknownNoteEn: 'Why SU(3) was selected by nature rather than SU(2) or higher gauge groups remains an open question in fundamental physics.',
        unknownNoteBn: 'প্রকৃতি কেন SU(2) বা উচ্চতর গেজ গ্রুপের বদলে ঠিক SU(3) কালার চার্জ বেছে নিল তা পদার্থবিজ্ঞানের একটি মৌলিক অমীমাংসিত প্রশ্ন।'
      });
    } else if (key === 'why_no_ninth_gluon') {
      this.infoDrawer.open({
        claimEn: 'There are exactly 8 gluons in nature; a 9th color-singlet gluon does not exist.',
        claimBn: 'প্রকৃতিতে ঠিক ৮টি গ্লুয়ন রয়েছে; কোনো নবম কালার-সিঙ্গলেট গ্লুয়নের অস্তিত্ব নেই।',
        tier: 'T1',
        evidenceEn: 'In SU(3) group theory, 3 ⊗ 3_bar = 8 ⊕ 1. The 8 states form the adjoint color octet. The 9th state is the singlet (r r_bar + g g_bar + b b_bar)/√3. Because this singlet carries NO net color charge, it would not couple to colored gluon loops or be subject to confinement. It would mediate an unconfined, infinite-range strong interaction between all nucleons across the cosmos (similar to gravitation/electromagnetism). Since the strong nuclear force is strictly short-ranged (~1 fm), the 9th gluon does not couple to physical quarks.',
        evidenceBn: 'SU(3) গ্রুপ তত্ত্বে ৩ ⊗ ৩̄ = ৮ (অক্টেট) ⊕ ১ (সিঙ্গলেট)। নবম স্টেট (r r̄ + g ḡ + b b̄)/√৩ সম্পূর্ণ কালার-নিরপেক্ষ। এটি থাকলে কনফাইনমেন্টের আওতামুক্ত হয়ে এটি ফোটনের মতো অসীম দূরত্বে শক্তিশালী বল ছড়াতো, যা গোটা মহাবিশ্বের সমস্ত নিউক্লিয়াসকে ধসিয়ে দিত। বাস্তবে শক্তিশালী বল ১ ফেমটোমিটারের বাইরে অদৃশ্য হয়ে যায়, যা প্রমাণ করে নবম গ্লুয়নের কোনো ভৌত অস্তিত্ব নেই।',
        sources: [
          'F. Close: An Introduction to Quarks and Partons (Academic Press)',
          'Particle Data Group (PDG 2024/2026): Gluon Properties Review'
        ],
        unknownNoteEn: 'Unification theories (GUTs) suggest color SU(3) merges into larger groups (SU(5), SO(10)) at Planck/GUT scales, generating heavy leptoquark gauge bosons.',
        unknownNoteBn: 'গ্র্যান্ড ইউনিফাইড তত্ত্বে (GUT) প্ল্যাঙ্ক স্কেলে কালার SU(3) বৃহৎ গেজ গ্রুপে একীভূত হয়ে ভারী লেপ্টোকোয়ার্ক বোসন তৈরি করতে পারে।'
      });
    }
  }

  destroy() {
    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }
  }
}
