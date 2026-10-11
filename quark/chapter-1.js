/**
 * CosmoPlanck Quark Section - Chapter 1: "প্রোটনের শরীর" (The Proton's Body)
 * Hero Interactive Simulation
 *
 * Scientific Fidelity & Constraints:
 * - Single source of truth: docs/quark-spec.md and data/quark-facts.js
 * - Zero hardcoded scientific constants in code!
 * - Fermat–Torricelli junction recalculated every frame from physics/fermat-torricelli.js
 * - At rest: equilateral triangle, side ≈ 1 fm
 * - Quantum jitter: ±0.15 fm continuous probability perturbations (never static)
 * - Hue strictly reserved for color charges (r, g, b) and anti-colors (c, m, y)
 * - Flavor represented by typography and geometric glyphs, never hue
 * - Continuous color singlet preservation: exactly one r, one g, one b at all instants
 * - Periodic gluon exchange with color swap along flux tube
 * - "Full Proton" mode with virtual sea pairs (u-ubar, d-dbar, s-sbar) and gluon cloud
 * - WCAG 2.2 AA accessibility and prefers-reduced-motion compliance
 */

import {
  QUARKS,
  PROTON,
  COLOR_CHARGE,
  CONFINEMENT,
  STRING_BREAKING,
  TIME_SCALES,
  getQuarkData
} from '../data/quark-facts.js';
import { calculateFermatTorricelliJunction } from '../physics/fermat-torricelli.js';
import { ConservationLedger } from '../physics/conservation-ledger.js';
import { createTierBadge } from '../components/tier-badge.js';

export class Chapter1Proton {
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

    // Simulation states
    this.isFullProton = false;
    this.isPaused = false;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Canvas & physical dimensions (1 fm ≈ 170 screen pixels on default 680x520 viewport)
    this.scalePxPerFm = 175;
    this.equilibriumSideFm = 1.0; // from spec (equilateral triangle, side ≈ 1 fm)
    this.jitterAmplitudeFm = 0.15; // from spec (±0.15 fm)

    // Scientific data extracted dynamically from data/quark-facts.js
    this.stringTension = CONFINEMENT.stringTensionSigma.value;
    this.upData = getQuarkData('u');
    this.downData = getQuarkData('d');

    // Color charges & state management
    this.colorNames = [...COLOR_CHARGE.colors]; // ['red', 'green', 'blue']
    this.colorHexMap = {
      red: '#ff2d55',
      green: '#00e676',
      blue: '#00b0ff'
    };
    this.antiColorHexMap = {
      'anti-red': COLOR_CHARGE.antiColorHex.red,       // cyan (#00e5ff)
      'anti-green': COLOR_CHARGE.antiColorHex.green,   // magenta (#ff007f)
      'anti-blue': COLOR_CHARGE.antiColorHex.blue      // yellow (#ffd600)
    };

    // Quark definitions for uud
    this.quarks = [
      { id: 'q0', flavor: 'u', symbol: 'u', chargeFrac: this.upData.charge.fraction, chargeVal: this.upData.charge.value, color: 'red', xFm: 0, yFm: 0, jitterX: 0, jitterY: 0, isDragging: false },
      { id: 'q1', flavor: 'u', symbol: 'u', chargeFrac: this.upData.charge.fraction, chargeVal: this.upData.charge.value, color: 'green', xFm: 0, yFm: 0, jitterX: 0, jitterY: 0, isDragging: false },
      { id: 'q2', flavor: 'd', symbol: 'd', chargeFrac: this.downData.charge.fraction, chargeVal: this.downData.charge.value, color: 'blue', xFm: 0, yFm: 0, jitterX: 0, jitterY: 0, isDragging: false }
    ];

    // Gluon exchange state
    this.lastGluonExchangeTime = performance.now();
    this.gluonExchangeInterval = 1000; // 0.6 - 1.5 s
    this.activeGluonPacket = null; // { fromIdx, toIdx, startTime, duration, gluonState, fromColor, toColor }
    this.lastExchangedGluonName = 'r g_bar';

    // Virtual Sea Quarks collection (for Full Proton mode)
    this.virtualSeaPairs = [];
    this.seaSpawnTimer = 0;

    // Drag interaction tracking
    this.draggedQuark = null;
    this.dragOffset = { x: 0, y: 0 };

    // RequestAnimationFrame handle
    this.animId = null;

    this.initDOM();
    this.initEquilibriumPositions();
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'chapter1-proton-wrapper';

    this.wrapper.innerHTML = `
      <!-- First-Look Disclaimer Note (Mandatory T4) -->
      <section class="c1-disclaimer-banner" role="region" aria-label="Scientific Model Disclaimer">
        <div class="c1-disclaimer-content">
          <div class="c1-disclaimer-tag-row">
            <span class="c1-disclaimer-pill" id="c1-disclaimer-badge"></span>
            <span class="c1-disclaimer-title" id="c1-disclaimer-title">FIRST-LOOK EPISTEMIC NOTE</span>
          </div>
          <p class="c1-disclaimer-text" id="c1-disclaimer-text">
            কোয়ার্ক বিন্দুসদৃশ (&lt; 10⁻¹⁸ m); গোলকগুলো প্রতীকী বিবর্ধিত। রঙ = কালার-চার্জের নাম, আলোর রঙ নয়।
          </p>
        </div>
        <button class="c1-info-btn" id="c1-btn-info-disclaimer" type="button" aria-label="Read Disclaimer Evidence">
          <svg class="c1-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </section>

      <!-- Proton Interactive Workspace Grid -->
      <div class="c1-workspace-grid">
        <!-- Main Canvas Viewport Column -->
        <div class="c1-canvas-column">
          <div class="c1-canvas-container" id="c1-canvas-container">
            <canvas id="c1-proton-canvas" width="680" height="520" aria-label="Proton interactive structure simulation"></canvas>
            
            <!-- Canvas Overlay Floating Telemetry HUD -->
            <div class="c1-canvas-hud top-left">
              <div class="c1-hud-item">
                <span class="c1-hud-label" id="c1-lbl-junction">FERMAT–TORRICELLI JUNCTION</span>
                <span class="c1-hud-value" id="c1-val-junction">120.0° • 120.0° • 120.0°</span>
              </div>
              <div class="c1-hud-item">
                <span class="c1-hud-label" id="c1-lbl-energy">CONFINEMENT ENERGY [E = σ·L]</span>
                <span class="c1-hud-value highlight" id="c1-val-energy">~0.95 GeV</span>
              </div>
            </div>

            <div class="c1-canvas-hud top-right">
              <div class="c1-hud-badge-pill" id="c1-hud-gluon-badge">
                <span class="c1-gluon-indicator"></span>
                <span class="c1-gluon-text" id="c1-hud-gluon-text">GLUON: r ḡ</span>
              </div>
            </div>

            <!-- Drag Prompt / Accessibility Instruction -->
            <div class="c1-canvas-hint" id="c1-canvas-hint">
              <svg class="c1-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="5 9 2 12 5 15"></polyline>
                <polyline points="9 5 12 2 15 5"></polyline>
                <polyline points="15 19 12 22 9 19"></polyline>
                <polyline points="19 9 22 12 19 15"></polyline>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="12" y1="2" x2="12" y2="22"></line>
              </svg>
              <span id="c1-hint-text">মাউস বা স্পর্শ দিয়ে কোয়ার্ক টেনে স্ট্রিং টান পরীক্ষা করুন</span>
            </div>
          </div>

          <!-- Interactive Controls Toolbar Under Canvas -->
          <div class="c1-toolbar">
            <div class="c1-toolbar-left">
              <!-- Full Proton Mode Switch -->
              <label class="c1-switch-label" for="c1-toggle-full-proton">
                <input type="checkbox" id="c1-toggle-full-proton" class="c1-switch-input">
                <span class="c1-switch-track"><span class="c1-switch-thumb"></span></span>
                <span class="c1-switch-text" id="c1-lbl-full-proton">পূর্ণ প্রোটন (Sea + Gluon মেঘ)</span>
              </label>

              <!-- Motion Pause Toggle -->
              <button class="c1-btn-secondary" id="c1-btn-pause" type="button" aria-label="Pause quantum jitter">
                <svg class="c1-svg-icon mini" id="c1-icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span id="c1-lbl-pause">স্থির করুন</span>
              </button>

              <!-- Reset Equilibrium Button -->
              <button class="c1-btn-secondary" id="c1-btn-reset" type="button" aria-label="Reset equilibrium triangle">
                <svg class="c1-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span id="c1-lbl-reset">পুনর্বিন্যাস</span>
              </button>
            </div>

            <div class="c1-toolbar-right">
              <span class="c1-caption-pill" id="c1-caption-uud">uud = নেট কোয়ান্টাম সংখ্যা</span>
            </div>
          </div>
        </div>

        <!-- Telemetry, Charge Ledger & Data Chips Column -->
        <div class="c1-telemetry-column">
          <!-- 1. Live Charge Ledger (চার্জ-খতিয়ান) -->
          <div class="c1-card c1-ledger-card">
            <div class="c1-card-header">
              <h3 class="c1-card-title" id="c1-title-ledger">চার্জ-খতিয়ান (Charge Ledger)</h3>
              <span class="c1-status-pill verified" id="c1-ledger-status">
                <svg class="c1-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span id="c1-ledger-status-text">Q = +1 e সংরক্ষিত</span>
              </span>
            </div>

            <div class="c1-ledger-table">
              <div class="c1-ledger-row">
                <span class="c1-ledger-q"><span class="c1-flavor-badge up">u</span> Up কোয়ার্ক ১:</span>
                <span class="c1-ledger-val" id="c1-val-q0">+2/3 e</span>
              </div>
              <div class="c1-ledger-row">
                <span class="c1-ledger-q"><span class="c1-flavor-badge up">u</span> Up কোয়ার্ক ২:</span>
                <span class="c1-ledger-val" id="c1-val-q1">+2/3 e</span>
              </div>
              <div class="c1-ledger-row">
                <span class="c1-ledger-q"><span class="c1-flavor-badge down">d</span> Down কোয়ার্ক ৩:</span>
                <span class="c1-ledger-val" id="c1-val-q2">−1/3 e</span>
              </div>
              <div class="c1-ledger-divider"></div>
              <div class="c1-ledger-row total">
                <span class="c1-ledger-q" id="c1-lbl-sum">মোট বৈদ্যুতিক চার্জ (Net):</span>
                <span class="c1-ledger-val highlight" id="c1-val-total-charge">+1.00 e (+1 e)</span>
              </div>
            </div>

            <div class="c1-color-singlet-row">
              <span class="c1-singlet-dot red"></span>
              <span class="c1-singlet-dot green"></span>
              <span class="c1-singlet-dot blue"></span>
              <span class="c1-singlet-text" id="c1-text-singlet">কালার-সিঙ্গলেট অবস্থা (সাদা): r + g + b = ১টি বর্ণহীন ব্যারিয়ন</span>
            </div>
          </div>

          <!-- 2. Proton Scientific Data Chips -->
          <div class="c1-card c1-chips-card">
            <h3 class="c1-card-title" id="c1-title-chips">বৈজ্ঞানিক ফ্যাক্টস ও সত্যতা-স্তর (Truth Tiers)</h3>
            
            <div class="c1-chips-list">
              <!-- Chip 1: Mass -->
              <div class="c1-data-chip" id="c1-chip-mass">
                <div class="c1-chip-left">
                  <span class="c1-chip-label" id="c1-lbl-chip-mass">ভর (Inertial Mass)</span>
                  <span class="c1-chip-val" id="c1-val-chip-mass">938.272 MeV/c²</span>
                </div>
                <div class="c1-chip-right" id="c1-slot-badge-mass"></div>
              </div>

              <!-- Chip 2: Charge Radius -->
              <div class="c1-data-chip" id="c1-chip-radius">
                <div class="c1-chip-left">
                  <span class="c1-chip-label" id="c1-lbl-chip-radius">চার্জ-ব্যাসার্ধ (Charge Radius)</span>
                  <span class="c1-chip-val" id="c1-val-chip-radius">≈ 0.84 fm</span>
                </div>
                <div class="c1-chip-right" id="c1-slot-badge-radius"></div>
              </div>

              <!-- Chip 3: Valence Mass Fraction -->
              <div class="c1-data-chip" id="c1-chip-valence">
                <div class="c1-chip-left">
                  <span class="c1-chip-label" id="c1-lbl-chip-valence">ভ্যালেন্স কোয়ার্ক ভর অংশ</span>
                  <span class="c1-chip-val" id="c1-val-chip-valence">≈ 1% (≈ 9 MeV)</span>
                </div>
                <div class="c1-chip-right" id="c1-slot-badge-valence"></div>
              </div>

              <!-- Chip 4: Flux Tube & String Tension -->
              <div class="c1-data-chip" id="c1-chip-flux">
                <div class="c1-chip-left">
                  <span class="c1-chip-label" id="c1-lbl-chip-flux">ফ্লাক্স টিউব বল (String Force)</span>
                  <span class="c1-chip-val" id="c1-val-chip-flux">F ≈ 1.5×10⁵ N (≈ 15 টন)</span>
                </div>
                <div class="c1-chip-right" id="c1-slot-badge-flux"></div>
              </div>

              <!-- Chip 5: Sea Quarks (Dynamic Tier T2) -->
              <div class="c1-data-chip" id="c1-chip-sea">
                <div class="c1-chip-left">
                  <span class="c1-chip-label" id="c1-lbl-chip-sea">সি-কোয়ার্ক ফ্ল্যাকচুয়েশন</span>
                  <span class="c1-chip-val" id="c1-val-chip-sea">d̄ &gt; ū অসমমিতি (T2)</span>
                </div>
                <div class="c1-chip-right" id="c1-slot-badge-sea"></div>
              </div>
            </div>
          </div>

          <!-- 3. Dynamic Pedagogy Level Details Card -->
          <div class="c1-card c1-level-card" id="c1-level-card">
            <!-- Rendered dynamically by updateLevelContent() -->
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.wrapper);

    // Grab canvas and context
    this.canvas = this.wrapper.querySelector('#c1-proton-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Mount initial badges
    this.mountBadges();
    this.updateLanguageStrings();
    this.updateLevelContent();
  }

  mountBadges() {
    // 1. Disclaimer Badge (T4)
    const disclaimerBadgeSlot = this.wrapper.querySelector('#c1-disclaimer-badge');
    if (disclaimerBadgeSlot) {
      disclaimerBadgeSlot.innerHTML = '';
      disclaimerBadgeSlot.appendChild(createTierBadge({
        tier: 'T4',
        lang: this.lang,
        compact: false,
        interactive: true,
        onClick: () => this.openDrawerFor('symbolic_model')
      }));
    }

    // 2. Chip Badges
    const massSlot = this.wrapper.querySelector('#c1-slot-badge-mass');
    if (massSlot) {
      massSlot.appendChild(createTierBadge({
        tier: PROTON.mass.tier, // T1
        lang: this.lang,
        compact: true,
        interactive: true,
        onClick: () => this.openDrawerFor('proton_mass')
      }));
    }

    const radiusSlot = this.wrapper.querySelector('#c1-slot-badge-radius');
    if (radiusSlot) {
      radiusSlot.appendChild(createTierBadge({
        tier: PROTON.chargeRadius.tier, // T1
        lang: this.lang,
        compact: true,
        interactive: true,
        onClick: () => this.openDrawerFor('charge_radius')
      }));
    }

    const valenceSlot = this.wrapper.querySelector('#c1-slot-badge-valence');
    if (valenceSlot) {
      valenceSlot.appendChild(createTierBadge({
        tier: PROTON.valenceQuarkMassSum.tier, // T2
        lang: this.lang,
        compact: true,
        interactive: true,
        onClick: () => this.openDrawerFor('valence_mass')
      }));
    }

    const fluxSlot = this.wrapper.querySelector('#c1-slot-badge-flux');
    if (fluxSlot) {
      fluxSlot.appendChild(createTierBadge({
        tier: CONFINEMENT.forceConstantN.tier, // T2/T3
        lang: this.lang,
        compact: true,
        interactive: true,
        onClick: () => this.openDrawerFor('flux_tubes')
      }));
    }

    const seaSlot = this.wrapper.querySelector('#c1-slot-badge-sea');
    if (seaSlot) {
      seaSlot.appendChild(createTierBadge({
        tier: PROTON.seaQuarkAsymmetry.tier, // T1/T2
        lang: this.lang,
        compact: true,
        interactive: true,
        onClick: () => this.openDrawerFor('sea_quarks')
      }));
    }
  }

  initEquilibriumPositions() {
    // Equilateral triangle centered at (0,0) with side L = 1.0 fm
    // Distance from center to vertex R = L / sqrt(3) ≈ 0.57735 fm
    const R = this.equilibriumSideFm / Math.sqrt(3);

    // Vertex 0 (Top): -90 deg
    this.quarks[0].eqX = 0;
    this.quarks[0].eqY = -R;

    // Vertex 1 (Bottom Right): +30 deg
    this.quarks[1].eqX = R * Math.cos(Math.PI / 6);
    this.quarks[1].eqY = R * Math.sin(Math.PI / 6);

    // Vertex 2 (Bottom Left): +150 deg
    this.quarks[2].eqX = -R * Math.cos(Math.PI / 6);
    this.quarks[2].eqY = R * Math.sin(Math.PI / 6);

    // Initialize current positions
    this.quarks.forEach(q => {
      q.xFm = q.eqX;
      q.yFm = q.eqY;
    });
  }

  attachEvents() {
    // Full Proton Toggle
    const fullProtonToggle = this.wrapper.querySelector('#c1-toggle-full-proton');
    if (fullProtonToggle) {
      fullProtonToggle.addEventListener('change', (e) => {
        this.isFullProton = e.target.checked;
        if (!this.isFullProton) {
          this.virtualSeaPairs = [];
        }
      });
    }

    // Pause Button
    const pauseBtn = this.wrapper.querySelector('#c1-btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        const lbl = this.wrapper.querySelector('#c1-lbl-pause');
        if (lbl) {
          lbl.textContent = this.isPaused
            ? (this.lang === 'bn' ? 'চালু করুন' : 'Resume')
            : (this.lang === 'bn' ? 'স্থির করুন' : 'Pause');
        }
      });
    }

    // Reset Button
    const resetBtn = this.wrapper.querySelector('#c1-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.quarks.forEach(q => {
          q.xFm = q.eqX;
          q.yFm = q.eqY;
          q.isDragging = false;
        });
        this.draggedQuark = null;
      });
    }

    // Disclaimer Info Button
    const infoDiscBtn = this.wrapper.querySelector('#c1-btn-info-disclaimer');
    if (infoDiscBtn) {
      infoDiscBtn.addEventListener('click', () => this.openDrawerFor('symbolic_model'));
    }

    // Canvas Pointer / Touch interactions for dragging quarks
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    window.addEventListener('mouseup', () => this.handlePointerUp());

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) this.handlePointerDown(e.touches[0]);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.draggedQuark && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => this.handlePointerUp());

    // Keyboard navigation: Space to pause, R to reset, S to toggle sea
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        pauseBtn?.click();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetBtn?.click();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        fullProtonToggle?.click();
      }
    });

    // Handle prefers-reduced-motion dynamically
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  handlePointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    // Check hit on quarks
    for (const q of this.quarks) {
      const qScreenX = center.x + (q.xFm + q.jitterX) * this.scalePxPerFm;
      const qScreenY = center.y + (q.yFm + q.jitterY) * this.scalePxPerFm;
      const dist = Math.hypot(clickX - qScreenX, clickY - qScreenY);

      if (dist <= 34) { // hit radius
        this.draggedQuark = q;
        q.isDragging = true;
        this.dragOffset.x = qScreenX - clickX;
        this.dragOffset.y = qScreenY - clickY;
        break;
      }
    }
  }

  handlePointerMove(e) {
    if (!this.draggedQuark) return;

    const rect = this.canvas.getBoundingClientRect();
    const posX = e.clientX - rect.left + this.dragOffset.x;
    const posY = e.clientY - rect.top + this.dragOffset.y;

    const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    // Convert screen coordinates back to fm
    const targetXFm = (posX - center.x) / this.scalePxPerFm;
    const targetYFm = (posY - center.y) / this.scalePxPerFm;

    // Constrain to reasonable canvas bounds (±1.4 fm)
    const maxR = 1.35;
    const currentR = Math.hypot(targetXFm, targetYFm);
    if (currentR <= maxR) {
      this.draggedQuark.xFm = targetXFm;
      this.draggedQuark.yFm = targetYFm;
    } else {
      this.draggedQuark.xFm = (targetXFm / currentR) * maxR;
      this.draggedQuark.yFm = (targetYFm / currentR) * maxR;
    }
  }

  handlePointerUp() {
    if (this.draggedQuark) {
      this.draggedQuark.isDragging = false;
      this.draggedQuark = null;
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }
  }

  update(timestamp) {
    // 1. Quantum jitter & equilibrium restitution
    const timeSec = timestamp * 0.001;

    for (let i = 0; i < this.quarks.length; i++) {
      const q = this.quarks[i];

      // Spring-like return to equilibrium if not dragged
      if (!q.isDragging) {
        const dx = q.eqX - q.xFm;
        const dy = q.eqY - q.yFm;
        q.xFm += dx * 0.06;
        q.yFm += dy * 0.06;
      }

      // Quantum jitter computation (±0.15 fm)
      if (this.isPaused || this.prefersReducedMotion) {
        q.jitterX = 0;
        q.jitterY = 0;
      } else {
        // Continuous probabilistic zero-point oscillation frequencies
        const freqX = 4.3 + i * 1.7;
        const freqY = 5.1 + i * 2.1;
        const phase = i * 2.094; // 120 deg phase shift

        q.jitterX = Math.sin(timeSec * freqX + phase) * (this.jitterAmplitudeFm * 0.75) +
                    Math.cos(timeSec * (freqX * 1.6)) * (this.jitterAmplitudeFm * 0.25);
        q.jitterY = Math.cos(timeSec * freqY + phase) * (this.jitterAmplitudeFm * 0.75) +
                    Math.sin(timeSec * (freqY * 1.4)) * (this.jitterAmplitudeFm * 0.25);
      }
    }

    // 2. Gluon Exchange Cycle (every 0.6 - 1.5 s)
    if (!this.isPaused && !this.prefersReducedMotion) {
      if (!this.activeGluonPacket && (timestamp - this.lastGluonExchangeTime > this.gluonExchangeInterval)) {
        this.triggerGluonExchange(timestamp);
      }
    }

    // Update active gluon packet progress
    if (this.activeGluonPacket) {
      const elapsed = timestamp - this.activeGluonPacket.startTime;
      this.activeGluonPacket.progress = Math.min(1.0, elapsed / this.activeGluonPacket.duration);

      // Packet completed: finalize color swap
      if (this.activeGluonPacket.progress >= 1.0) {
        const { fromIdx, toIdx, fromColor, toColor } = this.activeGluonPacket;
        // Strict color swap: color singlet r+g+b always preserved!
        this.quarks[fromIdx].color = toColor;
        this.quarks[toIdx].color = fromColor;

        this.lastExchangedGluonName = this.activeGluonPacket.gluonState;
        this.activeGluonPacket = null;
        this.lastGluonExchangeTime = timestamp;
        this.gluonExchangeInterval = 800 + Math.random() * 500; // randomized 0.8 - 1.3 s
      }
    }

    // 3. Virtual Sea Quarks simulation (Full Proton mode)
    if (this.isFullProton && !this.isPaused && !this.prefersReducedMotion) {
      this.updateVirtualSea(timestamp);
    }
  }

  triggerGluonExchange(timestamp) {
    // Pick two random distinct quarks
    const fromIdx = Math.floor(Math.random() * 3);
    let toIdx = Math.floor(Math.random() * 3);
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * 3);
    }

    const fromColor = this.quarks[fromIdx].color; // e.g. 'red'
    const toColor = this.quarks[toIdx].color;     // e.g. 'green'

    // Format gluon basis label: e.g. "r ḡ"
    const colorChar = (c) => c === 'red' ? 'r' : (c === 'green' ? 'g' : 'b');
    const gluonLabel = `${colorChar(fromColor)} ${colorChar(toColor)}̄`;

    this.activeGluonPacket = {
      fromIdx,
      toIdx,
      fromColor,
      toColor,
      gluonState: gluonLabel,
      startTime: timestamp,
      duration: 550, // ms transit time
      progress: 0
    };

    // Update HUD indicator text
    const gluonTextEl = this.wrapper.querySelector('#c1-hud-gluon-text');
    if (gluonTextEl) {
      gluonTextEl.textContent = `GLUON: ${gluonLabel}`;
    }
  }

  updateVirtualSea(timestamp) {
    // Clean expired pairs
    this.virtualSeaPairs = this.virtualSeaPairs.filter(p => timestamp - p.spawnTime < p.lifespan);

    // Spawn new pair probabilistically
    if (this.virtualSeaPairs.length < 5 && Math.random() < 0.12) {
      // Lund flavor weights: u:1, d:1, s:0.25
      const roll = Math.random();
      const flavor = roll < 0.44 ? 'u' : (roll < 0.88 ? 'd' : 's');

      // Random position inside proton radius (~0.84 fm)
      const r = Math.sqrt(Math.random()) * 0.75;
      const angle = Math.random() * Math.PI * 2;
      const cx = r * Math.cos(angle);
      const cy = r * Math.sin(angle);

      // Random color charge for pair
      const color = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];
      const antiColor = `anti-${color}`;

      // Offset distance between virtual pair (0.15 fm)
      const sep = 0.16;
      const sepAngle = Math.random() * Math.PI * 2;

      this.virtualSeaPairs.push({
        flavor,
        symbol: flavor,
        antiSymbol: `${flavor}̄`,
        color,
        antiColor,
        qX: cx + (sep / 2) * Math.cos(sepAngle),
        qY: cy + (sep / 2) * Math.sin(sepAngle),
        antiX: cx - (sep / 2) * Math.cos(sepAngle),
        antiY: cy - (sep / 2) * Math.sin(sepAngle),
        spawnTime: timestamp,
        lifespan: 400 + Math.random() * 300 // 400-700 ms lifetime
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const center = { x: w / 2, y: h / 2 };

    // Clear canvas with space backdrop
    ctx.clearRect(0, 0, w, h);

    // Deep quantum vacuum background
    const bgGrad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 320);
    bgGrad.addColorStop(0, '#0a0d17');
    bgGrad.addColorStop(0.7, '#05070c');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Current positions in fm and screen pixels
    const p0 = { x: this.quarks[0].xFm + this.quarks[0].jitterX, y: this.quarks[0].yFm + this.quarks[0].jitterY };
    const p1 = { x: this.quarks[1].xFm + this.quarks[1].jitterX, y: this.quarks[1].yFm + this.quarks[1].jitterY };
    const p2 = { x: this.quarks[2].xFm + this.quarks[2].jitterX, y: this.quarks[2].yFm + this.quarks[2].jitterY };

    const screenP0 = { x: center.x + p0.x * this.scalePxPerFm, y: center.y + p0.y * this.scalePxPerFm };
    const screenP1 = { x: center.x + p1.x * this.scalePxPerFm, y: center.y + p1.y * this.scalePxPerFm };
    const screenP2 = { x: center.x + p2.x * this.scalePxPerFm, y: center.y + p2.y * this.scalePxPerFm };

    // 1. Calculate Fermat–Torricelli Junction every frame from physics engine!
    const ftResult = calculateFermatTorricelliJunction(p0, p1, p2, this.stringTension);
    const junctionFm = ftResult.junction;
    const screenJunction = {
      x: center.x + junctionFm.x * this.scalePxPerFm,
      y: center.y + junctionFm.y * this.scalePxPerFm
    };

    // Update Telemetry HUD
    this.updateHUDValues(ftResult);

    // 2. Render Full Proton Background (Gluon Cloud & Sea Pairs)
    if (this.isFullProton) {
      this.renderGluonCloud(ctx, center, screenJunction);
      this.renderVirtualSeaPairs(ctx, center);
    }

    // 3. Render Y-shaped Flux Tubes with fuzzy Gaussian boundaries
    this.renderFluxTubes(ctx, screenJunction, [screenP0, screenP1, screenP2]);

    // 4. Render Active Gluon Packet along flux tube if exchanging
    if (this.activeGluonPacket) {
      this.renderGluonPacket(ctx, screenJunction, [screenP0, screenP1, screenP2]);
    }

    // 5. Render White Fermat–Torricelli Center Junction
    this.renderCenterJunction(ctx, screenJunction);

    // 6. Render the 3 Valence Quarks (u, u, d)
    const quarkScreenPos = [screenP0, screenP1, screenP2];
    for (let i = 0; i < this.quarks.length; i++) {
      this.renderQuark(ctx, this.quarks[i], quarkScreenPos[i]);
    }
  }

  renderFluxTubes(ctx, junction, quarkPoints) {
    // 3 flux tubes from center junction to each quark
    // Tube diameter ~0.3-0.5 fm in physical space (~50-80 px on screen) with fuzzy gaussian edge
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < quarkPoints.length; i++) {
      const qPt = quarkPoints[i];
      const qColorHex = this.colorHexMap[this.quarks[i].color] || '#38bdf8';

      // Outer faint gaussian halo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 64;
      ctx.beginPath();
      ctx.moveTo(junction.x, junction.y);
      ctx.lineTo(qPt.x, qPt.y);
      ctx.stroke();

      // Mid tube body
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(junction.x, junction.y);
      ctx.lineTo(qPt.x, qPt.y);
      ctx.stroke();

      // Colored core glow matching quark color
      ctx.strokeStyle = qColorHex;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(junction.x, junction.y);
      ctx.lineTo(qPt.x, qPt.y);
      ctx.stroke();

      // Dense white inner flux core
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(junction.x, junction.y);
      ctx.lineTo(qPt.x, qPt.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderCenterJunction(ctx, junction) {
    ctx.save();

    // Soft white glow around Fermat–Torricelli junction
    const glowGrad = ctx.createRadialGradient(junction.x, junction.y, 2, junction.x, junction.y, 24);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glowGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(junction.x, junction.y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Center brilliant white core node
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(junction.x, junction.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderQuark(ctx, q, pos) {
    ctx.save();

    const colorHex = this.colorHexMap[q.color] || '#ff2d55';
    const radius = 28; // Symbolically enlarged (T4)

    // 1. Fuzzy boundary / Quantum Wavepacket uncertainty gradient
    const fuzzyGrad = ctx.createRadialGradient(pos.x, pos.y, radius * 0.4, pos.x, pos.y, radius * 1.55);
    fuzzyGrad.addColorStop(0, colorHex);
    fuzzyGrad.addColorStop(0.65, colorHex);
    fuzzyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = fuzzyGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Quark Sphere Body (Color strictly conveys color-charge)
    ctx.globalAlpha = 1.0;
    const bodyGrad = ctx.createRadialGradient(pos.x - 7, pos.y - 7, 3, pos.x, pos.y, radius);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.25, colorHex);
    bodyGrad.addColorStop(1, '#05070c');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer subtle boundary ring
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Flavor Geometric Glyphs (Flavor NEVER conveyed by hue!)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.5;

    if (q.flavor === 'u') {
      // Up quark: Double concentric inner ring
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Down quark: Inscribed soft triangle
      ctx.beginPath();
      const rTri = 15;
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
        const tx = pos.x + rTri * Math.cos(a);
        const ty = pos.y + rTri * Math.sin(a);
        if (k === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 4. Flavor Typography Label ('u' or 'd')
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(q.symbol, pos.x, pos.y);

    // 5. Floating Electric Charge Tag beside quark (+2/3, -1/3)
    const tagOffset = { x: 38, y: -24 };
    const tagX = pos.x + tagOffset.x;
    const tagY = pos.y + tagOffset.y;

    // Tag background pill
    ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;

    const tagWidth = 54;
    const tagHeight = 22;
    ctx.beginPath();
    ctx.roundRect(tagX - tagWidth / 2, tagY - tagHeight / 2, tagWidth, tagHeight, 11);
    ctx.fill();
    ctx.stroke();

    // Tag text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText(q.chargeFrac, tagX, tagY);

    ctx.restore();
  }

  renderGluonPacket(ctx, junction, quarkPoints) {
    const p = this.activeGluonPacket;
    const startPt = quarkPoints[p.fromIdx];
    const endPt = quarkPoints[p.toIdx];

    // Follow path: startPt -> junction -> endPt
    let curX, curY;
    if (p.progress <= 0.5) {
      // First half: from start quark to junction
      const subT = p.progress / 0.5;
      curX = startPt.x + (junction.x - startPt.x) * subT;
      curY = startPt.y + (junction.y - startPt.y) * subT;
    } else {
      // Second half: from junction to destination quark
      const subT = (p.progress - 0.5) / 0.5;
      curX = junction.x + (endPt.x - junction.x) * subT;
      curY = junction.y + (endPt.y - junction.y) * subT;
    }

    // Glowing corkscrew / helical gluon packet
    ctx.save();

    const glow = ctx.createRadialGradient(curX, curY, 2, curX, curY, 18);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.3, '#38bdf8');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(curX, curY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Helical spiral ring around packet
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  renderGluonCloud(ctx, center, junction) {
    // Diffuse fluctuating gluon background field representing 36% glue energy
    ctx.save();
    const time = performance.now() * 0.002;

    const cloudGrad = ctx.createRadialGradient(junction.x, junction.y, 40, junction.x, junction.y, 220);
    cloudGrad.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
    cloudGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.05)');
    cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(junction.x, junction.y, 220, 0, Math.PI * 2);
    ctx.fill();

    // Subtle curved magnetic-like flux lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 6; k++) {
      const angle = (k * Math.PI) / 3 + Math.sin(time + k) * 0.2;
      const rOut = 140 + Math.cos(time * 0.8 + k) * 20;

      ctx.beginPath();
      ctx.moveTo(junction.x, junction.y);
      ctx.quadraticCurveTo(
        center.x + rOut * Math.cos(angle + 0.4),
        center.y + rOut * Math.sin(angle + 0.4),
        center.x + rOut * Math.cos(angle),
        center.y + rOut * Math.sin(angle)
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  renderVirtualSeaPairs(ctx, center) {
    const now = performance.now();
    ctx.save();

    for (const pair of this.virtualSeaPairs) {
      const age = now - pair.spawnTime;
      const progress = age / pair.lifespan; // 0 to 1

      // Fade-in then fade-out envelope
      const alpha = Math.sin(progress * Math.PI) * 0.85;
      if (alpha <= 0.01) continue;

      const qPos = {
        x: center.x + pair.qX * this.scalePxPerFm,
        y: center.y + pair.qY * this.scalePxPerFm
      };
      const antiPos = {
        x: center.x + pair.antiX * this.scalePxPerFm,
        y: center.y + pair.antiY * this.scalePxPerFm
      };

      // Virtual connection line (string)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(qPos.x, qPos.y);
      ctx.lineTo(antiPos.x, antiPos.y);
      ctx.stroke();

      // Render virtual quark
      const qColor = this.colorHexMap[pair.color] || '#ff2d55';
      ctx.fillStyle = qColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(qPos.x, qPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pair.symbol, qPos.x, qPos.y);

      // Render virtual antiquark with COMPLEMENTARY ANTI-COLOR (c, m, y)
      const antiColorHex = this.antiColorHexMap[pair.antiColor] || '#00e5ff';
      ctx.fillStyle = antiColorHex;
      ctx.beginPath();
      ctx.arc(antiPos.x, antiPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillText(pair.antiSymbol, antiPos.x, antiPos.y);
    }

    ctx.restore();
  }

  updateHUDValues(ft) {
    // 1. Angles display
    const angEl = this.wrapper.querySelector('#c1-val-junction');
    if (angEl && Array.isArray(ft.anglesDeg)) {
      const a0 = ft.anglesDeg[0].toFixed(1);
      const a1 = ft.anglesDeg[1].toFixed(1);
      const a2 = ft.anglesDeg[2].toFixed(1);
      angEl.textContent = `${a0}° • ${a1}° • ${a2}°`;
    }

    // 2. Confinement Energy display
    const energyEl = this.wrapper.querySelector('#c1-val-energy');
    if (energyEl && ft.confinementEnergyGeV !== undefined) {
      energyEl.textContent = `~${ft.confinementEnergyGeV.toFixed(2)} GeV (L = ${ft.totalLengthFm.toFixed(2)} fm)`;
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    this.updateLanguageStrings();
    this.updateLevelContent();
    this.mountBadges();
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

    setTxt('#c1-disclaimer-title', 'প্রথম দর্শনে নোট (FIRST-LOOK)', 'FIRST-LOOK SCIENTIFIC NOTICE');
    setTxt('#c1-disclaimer-text',
      'কোয়ার্ক বিন্দুসদৃশ (< 10⁻¹⁸ m); গোলকগুলো প্রতীকী বিবর্ধিত। রঙ = কালার-চার্জের নাম, আলোর রঙ নয়।',
      'Quarks are point-like (< 10⁻¹⁸ m); spheres are symbolically enlarged. Color = name of color charge, not color of light.'
    );

    setTxt('#c1-lbl-junction', 'ফার্মা–তরিচেল্লি জাংশন', 'FERMAT–TORRICELLI JUNCTION');
    setTxt('#c1-lbl-energy', 'কনফাইনমেন্ট শক্তি [E = σ·L]', 'CONFINEMENT ENERGY [E = σ·L]');
    setTxt('#c1-hint-text', 'মাউস বা স্পর্শ দিয়ে কোয়ার্ক টেনে স্ট্রিং টান পরীক্ষা করুন', 'Drag quarks to inspect flux tube string tension & angles');
    setTxt('#c1-lbl-full-proton', 'পূর্ণ প্রোটন (Sea + Gluon মেঘ)', 'Full Proton (Sea + Gluon Cloud)');
    setTxt('#c1-lbl-pause', this.isPaused ? 'চালু করুন' : 'স্থির করুন', this.isPaused ? 'Resume' : 'Pause');
    setTxt('#c1-lbl-reset', 'পুনর্বিন্যাস', 'Reset');
    setTxt('#c1-caption-uud', 'uud = নেট কোয়ান্টাম সংখ্যা', 'uud = Net Quantum Numbers');

    setTxt('#c1-title-ledger', 'চার্জ-খতিয়ান (Charge Ledger)', 'Charge Ledger & Conservation');
    setTxt('#c1-ledger-status-text', 'Q = +1 e সংরক্ষিত', 'Q = +1 e Conserved');
    setTxt('#c1-lbl-sum', 'মোট বৈদ্যুতিক চার্জ (Net):', 'Net Electric Charge:');
    setTxt('#c1-text-singlet',
      'কালার-সিঙ্গলেট অবস্থা (সাদা): r + g + b = ১টি বর্ণহীন ব্যারিয়ন',
      'Color-singlet state (white): r + g + b = 1 colorless baryon'
    );

    setTxt('#c1-title-chips', 'বৈজ্ঞানিক ফ্যাক্টস ও সত্যতা-স্তর', 'Scientific Facts & Truth Tiers');
    setTxt('#c1-lbl-chip-mass', 'ভর (Inertial Mass)', 'Inertial Mass');
    setTxt('#c1-lbl-chip-radius', 'চার্জ-ব্যাসার্ধ (Charge Radius)', 'Charge Radius');
    setTxt('#c1-lbl-chip-valence', 'ভ্যালেন্স কোয়ার্ক ভর অংশ', 'Valence Mass Fraction');
    setTxt('#c1-lbl-chip-flux', 'ফ্লাক্স টিউব বল (String Force)', 'Flux Tube Force');
    setTxt('#c1-lbl-chip-sea', 'সি-কোয়ার্ক ফ্ল্যাকচুয়েশন', 'Sea Quark Fluctuation');

    // Scientific values formatted directly from source of truth
    const massEl = this.wrapper.querySelector('#c1-val-chip-mass');
    if (massEl) massEl.textContent = `${PROTON.mass.value} ${PROTON.mass.unit}`;

    const radiusEl = this.wrapper.querySelector('#c1-val-chip-radius');
    if (radiusEl) radiusEl.textContent = `≈ ${PROTON.chargeRadius.value} ${PROTON.chargeRadius.unit}`;

    const valenceEl = this.wrapper.querySelector('#c1-val-chip-valence');
    if (valenceEl) valenceEl.textContent = `≈ ${PROTON.valenceQuarkMassSum.percentageApprox}% (≈ ${PROTON.valenceQuarkMassSum.value} ${PROTON.valenceQuarkMassSum.unit})`;

    const fluxEl = this.wrapper.querySelector('#c1-val-chip-flux');
    if (fluxEl) fluxEl.textContent = `F ≈ 1.5×10⁵ N (≈ 15 ton)`;

    const seaEl = this.wrapper.querySelector('#c1-val-chip-sea');
    if (seaEl) seaEl.textContent = `d̄ > ū asymmetry (T2)`;
  }

  updateLevelContent() {
    const container = this.wrapper.querySelector('#c1-level-card');
    if (!container) return;

    const isBn = this.lang === 'bn';

    if (this.level === 'basic') {
      container.innerHTML = `
        <div class="c1-level-header">
          <span class="c1-level-tag basic">${isBn ? 'সহজ স্তর' : 'Basic Level'}</span>
          <h4 class="c1-level-title">${isBn ? 'প্রোটন কীভাবে গঠিত?' : 'How is a Proton Structured?'}</h4>
        </div>
        <p class="c1-level-para">
          ${isBn
            ? 'প্রোটন কোনো নিরেট বা অভেদ্য কণা নয়। এর ভেতরে ৩টি ভ্যালেন্স কোয়ার্ক (২টি আপ, ১টি ডাউন) একটি অদৃশ্য Y-আকৃতির আঠালো স্ট্রিং (গ্লুয়ন টিউব) দ্বারা আবদ্ধ। এই কোয়ার্কগুলো প্রতি মুহূর্তে অতি ক্ষুদ্র কম্পনে আন্দোলিত হয় এবং আলোর গতিতে গ্লুয়ন বিনিময়ের মাধ্যমে রঙ বদলায়।'
            : 'A proton is not a solid billiard ball. Inside, three valence quarks (two Up, one Down) are tethered together by invisible Y-shaped color flux tubes. Quarks vibrate constantly with quantum zero-point jitter and swap color charges at lightning speed.'}
        </p>
      `;
    } else if (this.level === 'intermediate') {
      container.innerHTML = `
        <div class="c1-level-header">
          <span class="c1-level-tag intermediate">${isBn ? 'মাঝারি স্তর' : 'Intermediate Level'}</span>
          <h4 class="c1-level-title">${isBn ? 'কালার কনফাইনমেন্ট ও স্ট্রিং টান' : 'Color Confinement & String Tension'}</h4>
        </div>
        <div class="c1-level-stats">
          <div class="c1-stat-box">
            <span class="c1-stat-lbl">${isBn ? 'স্ট্রিং টান (σ)' : 'String Tension (σ)'}</span>
            <span class="c1-stat-num">${CONFINEMENT.stringTensionSigma.value} GeV/fm</span>
          </div>
          <div class="c1-stat-box">
            <span class="c1-stat-lbl">${isBn ? 'রৈখিক বল (F)' : 'Constant Force (F)'}</span>
            <span class="c1-stat-num">≈ 1.5×10⁵ N (15 ton)</span>
          </div>
          <div class="c1-stat-box">
            <span class="c1-stat-lbl">${isBn ? 'গ্লুয়ন স্টেট' : 'Gluon States'}</span>
            <span class="c1-stat-num">8 (Color Octet)</span>
          </div>
        </div>
        <p class="c1-level-para">
          ${isBn
            ? 'কোয়ার্কের দূরত্ব বাড়লেও বল হ্রাস পায় না; প্রতি ফেমটোমিটারে প্রায় ১ জিইভি শক্তি সঞ্চিত হয়। যখন দূরত্ব ১.২৫ fm অতিক্রম করে, তখন স্ট্রিংটি ছিঁড়ে ভ্যাকুয়াম থেকে নতুন কোয়ার্ক-অ্যান্টিকোয়ার্ক জোড়া তৈরি করে (Lund String Breaking)।'
            : 'Unlike electromagnetism, the strong force between quarks does not weaken with distance. It exerts a constant tension of ~15 metric tons (1 GeV/fm), pulling quarks into an invariant white color-singlet state.'}
        </p>
      `;
    } else {
      // Expert Level: Exact equations, Ji mass decomposition, Cornell potential, Fermat theorem, Yang-Mills problem
      container.innerHTML = `
        <div class="c1-level-header">
          <span class="c1-level-tag expert">${isBn ? 'বিশেষজ্ঞ স্তর' : 'Expert Level'}</span>
          <h4 class="c1-level-title">${isBn ? 'কোয়ান্টাম ক্রোমোডায়নামিক্স ও জি-ভর-বিভাজন' : 'QCD Formalism & Ji Mass Decomposition'}</h4>
        </div>
        
        <!-- Ji Mass Decomposition (T2 Lattice QCD) -->
        <div class="c1-equation-box">
          <div class="c1-eq-title">${isBn ? 'Ji ভর-বিভাজন (MS-bar, μ = 2 GeV):' : 'Ji Proton Mass Decomposition (MS-bar, μ = 2 GeV):'}</div>
          <div class="c1-formula">M_p = ⟨H_q⟩ + ⟨H_g⟩ + ⟨H_a⟩ + ⟨H_m⟩</div>
          <div class="c1-ji-bars">
            <div class="c1-ji-item"><span class="c1-ji-lbl">Quark Energy:</span> <span class="c1-ji-val">${PROTON.jiMassDecomposition.quarkEnergy.percentage}%</span></div>
            <div class="c1-ji-item"><span class="c1-ji-lbl">Glue Energy:</span> <span class="c1-ji-val">${PROTON.jiMassDecomposition.glueEnergy.percentage}%</span></div>
            <div class="c1-ji-item"><span class="c1-ji-lbl">Trace Anomaly:</span> <span class="c1-ji-val">${PROTON.jiMassDecomposition.traceAnomaly.percentage}%</span></div>
            <div class="c1-ji-item"><span class="c1-ji-lbl">Quark Mass:</span> <span class="c1-ji-val">${PROTON.jiMassDecomposition.quarkMassContribution.percentage}%</span></div>
          </div>
          <p class="c1-eq-caveat">${isBn ? PROTON.jiMassDecomposition.caveatBn : PROTON.jiMassDecomposition.caveatEn}</p>
        </div>

        <!-- Cornell Potential & Fermat Junction Equations -->
        <div class="c1-equation-box">
          <div class="c1-eq-title">${isBn ? 'কর্নেল পটেনশিয়াল ও তরিচেল্লি জাংশন শর্ত:' : 'Cornell Potential & Fermat-Torricelli Condition:'}</div>
          <div class="c1-formula">V(r) = - (4/3) α_s ħ c / r + σ r</div>
          <div class="c1-formula">min_J Σ |J - q_i| ⟹ ∠q_i J q_j = 120°  (if all α_i &lt; 120°)</div>
          <div class="c1-citation">Sources: PDG (2024/2026), Takahashi et al. Lattice QCD, Clay Millennium Mass Gap</div>
        </div>
      `;
    }
  }

  openDrawerFor(key) {
    if (!this.infoDrawer) return;

    if (key === 'symbolic_model') {
      this.infoDrawer.open({
        claimEn: 'Quark spheres and color hues in this hero interactive are pedagogical metaphors.',
        claimBn: 'এই ইন্টারঅ্যাকটিভের কোয়ার্ক গোলক এবং রঙের আভা শিক্ষামূলক প্রতীকী রূপক।',
        tier: 'T4',
        evidenceEn: 'Experimental deep inelastic scattering (HERA, LEP) bounds quark physical radius to < 10^-18 m (point-like). Quantum mechanics forbids static orbits. In quantum chromodynamics, "color" is an SU(3) gauge charge, unrelated to optical light wavelengths.',
        evidenceBn: 'উচ্চশক্তির সংঘর্ষ পরীক্ষায় (HERA, LEP) প্রমাণিত হয়েছে কোয়ার্কের ব্যাসার্ধ < ১০⁻¹⁸ মি (বিন্দুসদৃশ)। কোয়ান্টাম মেকানিক্সে কোনো স্থির কক্ষপথ নেই। কালার-চার্জ হলো SU(3) গেজ চার্জ, দৃশ্যমান আলোর তরঙ্গদৈর্ঘ্যের সাথে এর কোনো সম্পর্ক নেই।',
        sources: [
          'PDG 2024/2026: Quantum Chromodynamics Review',
          'HERA H1 and ZEUS Collaborations: Quark Radius Upper Bound',
          'Clay Mathematics Institute: Yang-Mills Existence and Mass Gap'
        ],
        unknownNoteEn: 'There is currently no rigorous mathematical proof of confinement and mass gap (Clay Millennium Prize Problem).',
        unknownNoteBn: 'কনফাইনমেন্ট এবং ম্যাস গ্যাপের এখনো কোনো কঠোর গাণিতিক প্রমাণ নেই (ক্লে মিলেনিয়াম প্রাইজ প্রবলেম)।'
      });
    } else if (key === 'proton_mass') {
      this.infoDrawer.open({
        claimEn: 'Proton inertial mass is 938.272088 ± 0.000058 MeV/c^2.',
        claimBn: 'প্রোটনের জড় ভর ৯৩৮.২৭২০৮৮ ± ০.০০০০০৫৮ MeV/c²।',
        tier: 'T1',
        evidenceEn: 'Direct precision measurements in Penning ion traps and hydrogen spectroscopy. Evaluated and published by CODATA 2022 and Particle Data Group 2024/2026.',
        evidenceBn: 'পেনিং আয়ন ট্র্যাপ ও হাইড্রোজেন বর্ণালীবিদ্যার মাধ্যমে অত্যন্ত উচ্চ নির্ভুলতায় সরাসরি পরিমাপকৃত। CODATA ২০২২ ও PDG ২০২৪/২০২৬ দ্বারা যাচাইকৃত।',
        sources: [
          'PDG 2024/2026 Summary Tables: Baryons',
          'CODATA 2022 Recommended Values of the Fundamental Physical Constants'
        ],
        unknownNoteEn: 'The exact analytical derivation of this mass from the pure QCD Lagrangian remains an unsolved Millennium Prize problem.',
        unknownNoteBn: 'বিশুদ্ধ QCD ল্যাগ্রাঞ্জিয়ান থেকে এই ভরের নিখুঁত অ্যানালিটিক্যাল সমাধান এখনো একটি অমীমাংসিত মিলেনিয়াম প্রাইজ সমস্যা।'
      });
    } else if (key === 'charge_radius') {
      this.infoDrawer.open({
        claimEn: 'Proton root-mean-square electric charge radius is ≈ 0.8414 fm.',
        claimBn: 'প্রোটনের কার্যকর চার্জ-ব্যাসার্ধ প্রায় ০.৮৪১৪ ফেমটোমিটার।',
        tier: 'T1',
        evidenceEn: 'Confirmed by muonic hydrogen Lamb shift experiments (CREMA collaboration) and updated electron-proton scattering data, resolving the historical "proton radius puzzle".',
        evidenceBn: 'মিউওনিক হাইড্রোজেন ল্যাম্ব শিফট পরীক্ষা (CREMA কোলাবোরেশন) এবং আধুনিক ইলেকট্রন-প্রোটন স্ক্যাটারিং দ্বারা সরাসরি পরিমাপকৃত।',
        sources: [
          'Pohl et al. (CREMA Collaboration), Nature 466, 213 (2010)',
          'PDG 2024/2026: Proton Charge Radius'
        ],
        unknownNoteEn: 'Non-perturbative shape fluctuations cause instantaneous charge distribution to deform from spherical symmetry.',
        unknownNoteBn: 'নন-পার্টার্বেটিভ কোয়ান্টাম কম্পনে ক্ষণিক চার্জ বিন্যাস গোলকীয় প্রতিসাম্য থেকে সামান্য বিচ্যুত হতে পারে।'
      });
    } else if (key === 'valence_mass') {
      this.infoDrawer.open({
        claimEn: 'Valence quarks (u, u, d) contribute only ≈ 9 MeV (~1%) to the total proton mass.',
        claimBn: 'ভ্যালেন্স কোয়ার্কসমূহের (u, u, d) মোট ভর প্রোটনের ভরের মাত্র প্রায় ৯ MeV (~১%)।',
        tier: 'T2',
        evidenceEn: 'Lattice QCD computations and MS-bar scheme fits determine up and down quark current masses to be ~2.16 MeV and ~4.67 MeV respectively at scale mu = 2 GeV. Over 90% of proton mass arises dynamically from gluon binding energy, quark kinetic energy, and the trace anomaly.',
        evidenceBn: 'ল্যাটিস QCD গণনা ও MS-bar স্কিমে আপ ও ডাউন কোয়ার্কের কারেন্ট ভর যথাক্রমে প্রায় ২.১৬ ও ৪.৬৭ MeV (স্কেল μ = ২ GeV)। বাকি ৯০% এর বেশি ভর আসে গতিশক্তি ও গ্লুয়ন ক্ষেত্রের ট্রেস অ্যানোমালি থেকে।',
        sources: [
          'X. Ji, Phys. Rev. Lett. 74, 1071 (1995)',
          'FLAG Review 2024 (Flavour Lattice Averaging Group)'
        ],
        unknownNoteEn: 'Mass decomposition depends on renormalization scheme and scale; claiming "99% without Higgs" is misleading due to trace anomaly contributions.',
        unknownNoteBn: 'ভর-বিভাজন স্কিম ও স্কেল-নির্ভর; ট্রেস অ্যানোমালির কারণে "৯৯% হিগস ছাড়া" দাবি করা বৈজ্ঞানিকভাবে বিভ্রান্তিকর।'
      });
    } else if (key === 'flux_tubes') {
      this.infoDrawer.open({
        claimEn: 'Baryonic quarks are held by Y-shaped flux tubes with string tension σ ≈ 0.95 GeV/fm (F ≈ 1.5×10^5 N).',
        claimBn: 'ব্যারিয়নিক কোয়ার্কসমূহ Y-আকৃতির ফ্লাক্স টিউব দ্বারা আবদ্ধ, যার স্ট্রিং টান σ ≈ ০.৯৫ GeV/fm (F ≈ ১.৫×১০⁵ N)।',
        tier: 'T3',
        evidenceEn: 'Lattice QCD simulations with SU(3) gauge fields show that color flux forms narrow tubes meeting at the Fermat-Torricelli point, preventing flux lines from spreading out.',
        evidenceBn: 'SU(3) গেজ ফিল্ডে ল্যাটিস QCD সিমুলেশনে দেখা গেছে কালার ফ্লাক্স ছড়িয়ে না পড়ে ফার্মা–তরিচেল্লি জাংশনে মিলিত সরু টিউবে সংকুচিত হয়।',
        sources: [
          'T. T. Takahashi et al., Phys. Rev. Lett. 86, 18 (2001)',
          'G. Bali, Physics Reports 343, 1-136 (2001)'
        ],
        unknownNoteEn: 'Flux tubes are an effective description; the continuum field equations for dynamical string formation lack exact closed-form solutions.',
        unknownNoteBn: 'ফ্লাক্স টিউব হলো একটি কার্যকর মডেল; স্ট্রিং গঠনের অবিচ্ছিন্ন ফিল্ড সমীকরণের কোনো বিশ্লেষণী রূপ নেই।'
      });
    } else if (key === 'sea_quarks') {
      this.infoDrawer.open({
        claimEn: 'The proton sea exhibits d_bar > u_bar flavor asymmetry.',
        claimBn: 'প্রোটনের কোয়ান্টাম সি-কোয়ার্ক মেঘে d̄ > ū ফ্লেভার অসমমিতি বিদ্যমান।',
        tier: 'T1',
        evidenceEn: 'Drell-Yan scattering experiments by the E866/NuSea and SeaQuest (E906) collaborations definitively proved that anti-down quarks outnumber anti-up quarks in the proton sea.',
        evidenceBn: 'E866/NuSea এবং সি-কোয়েস্ট (E906) ড্রেলে-ইয়ান পরীক্ষায় সরাসরি প্রমাণিত হয়েছে যে প্রোটনে অ্যান্টি-ডাউন কোয়ার্কের সংখ্যা অ্যান্টি-আপের চেয়ে বেশি।',
        sources: [
          'J. Dove et al. (SeaQuest Collaboration), Nature 590, 561-565 (2021)',
          'E866/NuSea Collaboration, Phys. Rev. D 64, 052002 (2001)'
        ],
        unknownNoteEn: 'The precise mechanism explaining why non-perturbative meson clouds or Pauli blocking generates this asymmetry remains actively debated.',
        unknownNoteBn: 'পাউলি ব্লকিং নাকি পাইওন ক্লাউডের কারণে এই অসমমিতি তৈরি হয় তা নিয়ে তাত্ত্বিক মহলে বিতর্ক চলমান।'
      });
    }
  }
}
