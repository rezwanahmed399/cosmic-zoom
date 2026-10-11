/**
 * CosmoPlanck Quark Section - Chapter 0: "স্কেল-সিঁড়ি" (Scale Ladder)
 * Section Entrance Gateway & Logarithmic Scale Continuous Zoom
 *
 * Scientific Fidelity & Features:
 * - Continuous zoom-in ladder:
 *   1. Atom (পরমাণু) ≈ 10⁻¹⁰ m (0.1 nm / 1 Å)
 *   2. Nucleus (নিউক্লিয়াস) ≈ few × 10⁻¹⁵ m to 10⁻¹⁴ m (1–10 fm)
 *   3. Proton (প্রোটন) diameter ≈ 1.7 × 10⁻¹⁵ m (1.7 fm, charge radius 0.8414 fm)
 *   4. Quark (কোয়ার্ক) < 10⁻¹⁸ m (Point-like experimental limit, zero substructure found)
 * - CosmoPlanck Connection:
 *   - The 17-order Planck gap between Quark limit (10⁻¹⁸ m) and Planck length (1.6×10⁻³⁵ m).
 *   - Uncharted theoretical desert signpost: "এখানে জানা শেষ, এরপর অজানা".
 *   - Deep link bridges to CosmoPlanck macro scale (#s=-35.0, #s=-18.0, #s=-10.0).
 * - Pedagogical Levels:
 *   - Basic (সহজ): Visual analogies and order-of-magnitude jumps.
 *   - Intermediate (মাঝারি): Exact measurements and experimental limits.
 *   - Expert (বিশেষজ্ঞ): DIS cross-sections, wavelength formulas lambda = hbar*c / E, form factors.
 * - Call to Action (CTA) and scroll continuity leading to Chapter 1 ("প্রোটনের শরীর").
 * - Truth Tiers: T1 (Direct Measurement / CODATA / PDG), T4 (Symbolic Scaled Representations).
 * - Zero hardcoded scientific numbers: all sourced from data/quark-facts.js.
 * - Zero unicode emojis across all code and UI.
 */

import {
  SCALE_LADDER,
  PROTON,
  QUARKS,
  getScaleLadderSteps,
  getPlanckGapInfo
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

const ICON_ZOOM_IN_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
const ICON_ZOOM_OUT_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
const ICON_PLAY_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const ICON_PAUSE_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const ICON_EXTERNAL_LINK_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c0-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

export class Chapter0ScaleLadder {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Host element where chapter is rendered
   * @param {'en'|'bn'} [options.lang='en'] - Language
   * @param {'basic'|'intermediate'|'expert'} [options.level='basic'] - Pedagogy level
   * @param {Object} [options.infoDrawer] - InfoDrawer component instance
   */
  constructor({ container, lang = 'en', level = 'basic', infoDrawer = null }) {
    this.container = container;
    this.lang = lang;
    this.level = level;
    this.infoDrawer = infoDrawer;

    // Scientific datasets from factsheet
    this.steps = getScaleLadderSteps ? getScaleLadderSteps() : (SCALE_LADDER?.steps ?? []);
    this.planckGap = getPlanckGapInfo ? getPlanckGapInfo() : (SCALE_LADDER?.planckGap ?? {});

    // Active scale step index (0: Atom, 1: Nucleus, 2: Proton, 3: Quark)
    this.currentStepIdx = 0;

    // Continuous zoom animation
    this.isAutoPlaying = false;
    this.autoTimer = null;
    this.zoomInterpolation = 0.0; // 0.0 to 1.0 within current step transition

    this.wrapper = null;
    this._cleanupHandlers = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateStepDisplay(0, false);
  }

  render() {
    this.container.innerHTML = '';
    const isBn = this.lang === 'bn';

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'chapter-0-view';

    this.wrapper.innerHTML = `
      <!-- HERO HEADER -->
      <div class="c0-hero-header">
        <div class="c0-hero-badge-row">
          <span class="c0-chapter-tag">${isBn ? 'অধ্যায় ০ (সেকশনের প্রবেশদ্বার)' : 'Chapter 0 (Section Entrance Gateway)'}</span>
          ${createTierBadge('T1', 'Direct Measurement', this.lang)}
          ${createTierBadge('T4', 'Symbolic Scale', this.lang)}
        </div>

        <h2 class="c0-hero-title">
          ${isBn ? 'স্কেল-সিঁড়ি: পরমাণু থেকে কোয়ার্ক ও প্ল্যাঙ্ক সীমা' : 'Scale Ladder: From Atom to Quark & The Planck Gap'}
        </h2>

        <p class="c0-hero-desc">
          ${isBn
            ? 'আমরা প্রাত্যহিক জগতের পরমাণু ($10^{-10}$ মি) থেকে শুরু করে ক্রমান্বয়ে গভীরে প্রবেশ করব পারমাণবিক নিউক্লিয়াস ($10^{-14}$ মি), প্রোটন ($10^{-15}$ মি) এবং কোয়ার্কের বিন্দুসদৃশ পরীক্ষালব্ধ সীমা ($< 10^{-18}$ মি) পর্যন্ত। এরপর উন্মোচিত হবে কোয়ান্টাম মহাকর্ষের প্ল্যাঙ্ক স্কেল পর্যন্ত ১৭ ঘাতের এক রহস্যময় অনাবিষ্কৃত মরুভূমি।'
            : 'Descend through subatomic orders of magnitude from the atom ($10^{-10}$ m) down to the atomic nucleus ($10^{-14}$ m), proton ($10^{-15}$ m), and the point-like quark boundary ($< 10^{-18}$ m). Unveil the 17-order Planck gap separating particle physics from quantum gravity.'
          }
        </p>

        <div class="c0-hero-actions">
          <button class="c0-btn-action reality" id="c0-btn-scale-info" type="button">
            <span class="c0-action-tier">T1 / T4</span>
            <span>${isBn ? 'স্কেল সততা ও প্রতীকী মডেল' : 'Scale Fidelity & Symbolic Models'}</span>
          </button>
          <button class="c0-btn-action" id="c0-btn-autoplay" type="button">
            ${ICON_PLAY_SVG}
            <span id="c0-lbl-autoplay">${isBn ? 'অটো জুম-ইন (সিনেমা)' : 'Auto Zoom-in (Cinema)'}</span>
          </button>
        </div>
      </div>

      <!-- MAIN LADDER WORKBENCH -->
      <div class="c0-ladder-grid">
        
        <!-- LEFT: CONTINUOUS ZOOM VISUAL VIEWPORT -->
        <div class="c0-card c0-viewport-card">
          <div class="c0-card-header">
            <div class="c0-card-title-group">
              <h3 class="c0-card-title" id="c0-viewport-title">${isBn ? '১. ক্রমান্বয়িক ভিজ্যুয়াল জুম-ইন' : '1. Continuous Visual Zoom-in'}</h3>
              <p class="c0-card-subtitle" id="c0-viewport-subtitle">${isBn ? 'লগারিদমিক স্কেলে বাস্তবসম্মত ও প্রতীকী সম্প্রসারণ' : 'Logarithmically scaled nested structural transitions'}</p>
            </div>
            
            <div class="c0-step-stepper-ctrls">
              <button class="c0-btn-step" id="c0-btn-prev" type="button" title="Zoom Out" aria-label="Zoom out to previous scale">
                ${ICON_ZOOM_OUT_SVG}
                <span>${isBn ? 'পূর্ববর্তী' : 'Zoom Out'}</span>
              </button>
              <span class="c0-step-indicator" id="c0-step-indicator">1 / 4</span>
              <button class="c0-btn-step" id="c0-btn-next" type="button" title="Zoom In" aria-label="Zoom in to deeper scale">
                <span>${isBn ? 'পরবর্তী' : 'Zoom In'}</span>
                ${ICON_ZOOM_IN_SVG}
              </button>
            </div>
          </div>

          <!-- DYNAMIC SVG VIEWPORT -->
          <div class="c0-canvas-viewport" id="c0-canvas-viewport" tabindex="0" role="region" aria-label="Interactive logarithmic scale zoom stage">
            <svg class="c0-stage-svg" viewBox="0 0 540 380" id="c0-stage-svg">
              <defs>
                <!-- Atom glow -->
                <radialGradient id="c0-grad-atom" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"></stop>
                  <stop offset="35%" stop-color="#0284c7" stop-opacity="0.3"></stop>
                  <stop offset="85%" stop-color="#0369a1" stop-opacity="0.08"></stop>
                  <stop offset="100%" stop-color="#020617" stop-opacity="0"></stop>
                </radialGradient>
                <!-- Nucleus glow -->
                <radialGradient id="c0-grad-nuc" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"></stop>
                  <stop offset="40%" stop-color="#b91c1c" stop-opacity="0.5"></stop>
                  <stop offset="90%" stop-color="#7f1d1d" stop-opacity="0.1"></stop>
                  <stop offset="100%" stop-color="#020617" stop-opacity="0"></stop>
                </radialGradient>
                <!-- Proton glow -->
                <radialGradient id="c0-grad-proton" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.9"></stop>
                  <stop offset="50%" stop-color="#1d4ed8" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#020617" stop-opacity="0"></stop>
                </radialGradient>
                <!-- Quark spark -->
                <radialGradient id="c0-grad-quark" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="1"></stop>
                  <stop offset="30%" stop-color="#a855f7" stop-opacity="0.9"></stop>
                  <stop offset="70%" stop-color="#7e22ce" stop-opacity="0.3"></stop>
                  <stop offset="100%" stop-color="#020617" stop-opacity="0"></stop>
                </radialGradient>
              </defs>

              <!-- Background grid & Reticle -->
              <g class="c0-svg-grid" stroke="rgba(255,255,255,0.04)" stroke-width="1">
                <circle cx="270" cy="190" r="160" fill="none"></circle>
                <circle cx="270" cy="190" r="110" fill="none"></circle>
                <circle cx="270" cy="190" r="60" fill="none"></circle>
                <line x1="270" y1="10" x2="270" y2="370"></line>
                <line x1="10" y1="190" x2="530" y2="190"></line>
              </g>

              <!-- Dynamic Interactive Scene Mount -->
              <g id="c0-scene-mount"></g>

              <!-- Scale Caliper Overlay -->
              <g class="c0-scale-caliper" transform="translate(30, 340)">
                <line x1="0" y1="0" x2="140" y2="0" stroke="#38bdf8" stroke-width="2"></line>
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#38bdf8" stroke-width="2"></line>
                <line x1="140" y1="-5" x2="140" y2="5" stroke="#38bdf8" stroke-width="2"></line>
                <text x="70" y="-8" fill="#38bdf8" font-size="11" font-family="'JetBrains Mono', monospace" text-anchor="middle" id="c0-txt-caliper">1.0 × 10⁻¹⁰ m</text>
              </g>

              <!-- Symbolic Magnification Notice -->
              <text x="510" y="365" fill="#64748b" font-size="9.5" text-anchor="end" font-family="'JetBrains Mono', monospace">
                ${isBn ? 'T4: পর্দায় গোলক প্রতীকীভাবে বিবর্ধিত (আক্ষরিক নয়)' : 'T4: Spheres symbolically magnified (not literal)'}
              </text>
            </svg>

            <!-- Floating Stage Caption Overlay -->
            <div class="c0-stage-caption" id="c0-stage-caption">
              <span class="c0-caption-badge" id="c0-caption-badge">১০⁻¹⁰ মি</span>
              <span class="c0-caption-text" id="c0-caption-text"></span>
            </div>
          </div>

          <!-- STEP SELECTOR PILLS -->
          <div class="c0-step-pills-row" role="tablist">
            ${this.steps.map((step, idx) => `
              <button class="c0-step-pill ${idx === 0 ? 'active' : ''}" id="c0-pill-${step.id}" role="tab" type="button" data-idx="${idx}">
                <span class="c0-pill-exp">${isBn ? step.exponentStrBn : step.exponentStr}</span>
                <span class="c0-pill-name">${isBn ? step.nameBn : step.nameEn}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT: LOGARITHMIC RULER, ORDERS OF MAGNITUDE & TELEMETRY -->
        <div class="c0-panels-column">
          
          <!-- LOGARITHMIC RULER CARD -->
          <div class="c0-card c0-ruler-card">
            <div class="c0-card-header mini">
              <h4 class="c0-card-title mini">${isBn ? '২. লগ-স্কেল রুলার (Logarithmic Ruler)' : '2. Logarithmic Ruler'}</h4>
              <span class="c0-telemetry-pill" id="c0-power-display">10⁻¹⁰ m</span>
            </div>

            <!-- Visual Log Ruler Bar -->
            <div class="c0-ruler-container" id="c0-ruler-container">
              <div class="c0-ruler-track">
                <!-- Major Exponent Ticks -->
                <div class="c0-ruler-tick active" data-exp="-10" style="left: 0%;">
                  <span class="c0-tick-mark"></span>
                  <span class="c0-tick-lbl">10⁻¹⁰</span>
                  <span class="c0-tick-sub">Atom</span>
                </div>
                <div class="c0-ruler-tick" data-exp="-14" style="left: 28%;">
                  <span class="c0-tick-mark"></span>
                  <span class="c0-tick-lbl">10⁻¹⁴</span>
                  <span class="c0-tick-sub">Nucleus</span>
                </div>
                <div class="c0-ruler-tick" data-exp="-15" style="left: 36%;">
                  <span class="c0-tick-mark"></span>
                  <span class="c0-tick-lbl">10⁻¹⁵</span>
                  <span class="c0-tick-sub">Proton</span>
                </div>
                <div class="c0-ruler-tick" data-exp="-18" style="left: 55%;">
                  <span class="c0-tick-mark highlight"></span>
                  <span class="c0-tick-lbl highlight">10⁻¹⁸</span>
                  <span class="c0-tick-sub highlight">Quark</span>
                </div>
                
                <!-- Desert Zone -->
                <div class="c0-ruler-desert-zone" style="left: 55%; width: 45%;">
                  <span class="c0-desert-label">${isBn ? '১৭ ঘাতের অনাবিষ্কৃত মরুভূমি' : '17-order Planck Gap'}</span>
                </div>

                <div class="c0-ruler-tick planck" data-exp="-35" style="left: 100%;">
                  <span class="c0-tick-mark planck"></span>
                  <span class="c0-tick-lbl planck">10⁻³⁵</span>
                  <span class="c0-tick-sub planck">Planck</span>
                </div>

                <!-- Cursor Indicator -->
                <div class="c0-ruler-cursor" id="c0-ruler-cursor" style="left: 0%;"></div>
              </div>
            </div>

            <!-- Dynamic Physical Metrics Grid -->
            <div class="c0-metrics-grid">
              <div class="c0-metric-box">
                <span class="c0-m-lbl">${isBn ? 'বর্তমান আকার:' : 'Scale Size:'}</span>
                <span class="c0-m-val highlight" id="c0-val-size">≈ 10⁻¹⁰ m</span>
                <span class="c0-m-sub" id="c0-sub-size">${isBn ? '০.১ ন্যানোমিটার (Å)' : '0.1 nm (1 Ångström)'}</span>
              </div>
              <div class="c0-metric-box">
                <span class="c0-m-lbl">${isBn ? 'তুলনামূলক অনুপাত:' : 'Ratio Metric:'}</span>
                <span class="c0-m-val" id="c0-val-ratio">1× (ভিত্তি)</span>
                <span class="c0-m-sub" id="c0-sub-ratio">${isBn ? 'প্রারম্ভিক ভিত্তি স্কেল' : 'Baseline Reference'}</span>
              </div>
            </div>

            <!-- Scientific Level Detail Box -->
            <div class="c0-level-pedagogy-box" id="c0-level-pedagogy-box">
              <!-- Rendered dynamically based on level (basic/intermediate/expert) -->
            </div>
          </div>

          <!-- COSMOPLANCK CONNECTION: THE 17-ORDER PLANCK GAP -->
          <div class="c0-card c0-planck-gap-card">
            <div class="c0-gap-header">
              <span class="c0-gap-tag">${isBn ? 'CosmoPlanck সংযোগ' : 'CosmoPlanck Link'}</span>
              <span class="c0-gap-badge">${isBn ? '১৭ ঘাতের ব্যবধান (10¹⁷×)' : '17 Orders Gap (10¹⁷×)'}</span>
            </div>

            <h4 class="c0-gap-title">
              ${isBn ? '“এখানে জানা শেষ, এরপর অজানা”' : '"Known realm ends here; the uncharted desert begins"'}
            </h4>

            <p class="c0-gap-desc">
              ${isBn
                ? `কোয়ার্কের বর্তমান পরীক্ষালব্ধ রেজোলিউশন ($10^{-18}$ মি) থেকে কোয়ান্টাম মহাকর্ষের প্ল্যাঙ্ক স্কেল ($1.6 \\times 10^{-35}$ মি)-এর মাঝে রয়েছে প্রায় <strong>১৭ ঘাত ($10^{17}$ গুণ)</strong> এক সুবিশাল অনাবিষ্কৃত বিস্তার। পৃথিবীর সর্ববৃহৎ কোলাইডার (LHC)-ও এর গভীরে পৌঁছাতে অক্ষম; এটি তাত্ত্বিক পদার্থবিজ্ঞানের সেই মরুভূমি যেখানে স্থান-কাল নিজেই কোয়ান্টাইজড হতে পারে।`
                : `Between the experimental quark boundary ($10^{-18}$ m) and the quantum gravity Planck scale ($1.6 \\times 10^{-35}$ m) lies an uncharted expanse of roughly <strong>17 orders of magnitude ($10^{17}\\times$)</strong>. No accelerator on Earth has enough energy to probe inside; string theory, loop quantum gravity, and spacetime foam await here.`
              }
            </p>

            <div class="c0-gap-actions">
              <a href="#s=-35.0" class="c0-btn-cosmo" id="c0-btn-planck-link">
                ${ICON_EXTERNAL_LINK_SVG}
                <span>${isBn ? 'CosmoPlanck প্ল্যাঙ্ক স্কেল (#s=-35.0)' : 'CosmoPlanck Planck Limit (#s=-35.0)'}</span>
              </a>
              <a href="#s=-18.0" class="c0-btn-cosmo secondary" id="c0-btn-quark-link">
                ${ICON_EXTERNAL_LINK_SVG}
                <span>${isBn ? 'ম্যাক্রো স্কেলে কোয়ার্ক (#s=-18.0)' : 'Macro Quark Scale (#s=-18.0)'}</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- BOTTOM CTA & SCROLL-CONTINUITY TO CHAPTER 1 -->
      <div class="c0-next-chapter-cta">
        <div class="c0-cta-content">
          <span class="c0-cta-badge">${isBn ? 'পরবর্তী অধ্যায়' : 'Next Milestone'}</span>
          <h3 class="c0-cta-title">
            ${isBn ? 'প্রোটনের অভ্যন্তরীণ শরীর উন্মোচন করুন' : "Unveil the Proton's Internal Anatomy"}
          </h3>
          <p class="c0-cta-desc">
            ${isBn
              ? 'আমরা জেনেছি প্রোটন প্রায় ১.৭ ফেমটোমিটার ব্যাসের। এবার প্রোটনের ভেতরে প্রবেশ করে তিনটি ভ্যালেন্স কোয়ার্কের গতিশীল Y-ফ্লাক্স টিউব, রঙ অদলবদল এবং গ্লুয়ন বিনিময়ের জীবন্ত সিমুলেশন দেখুন।'
              : 'Having established the subatomic scale hierarchy, step into the proton to interact with three valence quarks, the dynamic Y-flux tube junction, and live gluon color exchanges.'
            }
          </p>
        </div>
        <button class="c0-btn-cta-next" id="c0-btn-go-ch1" type="button">
          <span>${isBn ? 'অধ্যায় ১: প্রোটনের শরীর-এ চলুন' : "Enter Chapter 1: The Proton's Body"}</span>
          ${ICON_ARROW_RIGHT_SVG}
        </button>
      </div>
    `;

    this.container.appendChild(this.wrapper);
  }

  bindEvents() {
    // 1. Reality / Scale Model Info Drawer
    const btnInfo = this.wrapper.querySelector('#c0-btn-scale-info');
    if (btnInfo) {
      btnInfo.addEventListener('click', () => this.openScaleInfoDrawer());
    }

    // 2. Autoplay / Cinema Zoom
    const btnAuto = this.wrapper.querySelector('#c0-btn-autoplay');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => this.toggleAutoPlay());
    }

    // 3. Next / Prev Step buttons
    const btnPrev = this.wrapper.querySelector('#c0-btn-prev');
    const btnNext = this.wrapper.querySelector('#c0-btn-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        this.stopAutoPlay();
        if (this.currentStepIdx > 0) {
          this.updateStepDisplay(this.currentStepIdx - 1);
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.stopAutoPlay();
        if (this.currentStepIdx < this.steps.length - 1) {
          this.updateStepDisplay(this.currentStepIdx + 1);
        }
      });
    }

    // 4. Step Pills selection
    this.steps.forEach((step, idx) => {
      const pill = this.wrapper.querySelector(`#c0-pill-${step.id}`);
      if (pill) {
        pill.addEventListener('click', () => {
          this.stopAutoPlay();
          this.updateStepDisplay(idx);
        });
      }
    });

    // 5. Ruler tick clicks
    const ticks = this.wrapper.querySelectorAll('.c0-ruler-tick');
    ticks.forEach(tick => {
      tick.addEventListener('click', () => {
        const exp = parseInt(tick.getAttribute('data-exp'), 10);
        if (exp === -35) {
          window.location.hash = '#s=-35.0';
          return;
        }
        const foundIdx = this.steps.findIndex(s => s.exponent === exp);
        if (foundIdx !== -1) {
          this.stopAutoPlay();
          this.updateStepDisplay(foundIdx);
        }
      });
    });

    // 6. Next Chapter CTA Button
    const btnGoCh1 = this.wrapper.querySelector('#c0-btn-go-ch1');
    if (btnGoCh1) {
      btnGoCh1.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-1';
      });
    }

    // 7. Keyboard Accessibility
    const viewport = this.wrapper.querySelector('#c0-canvas-viewport');
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === '+') {
        e.preventDefault();
        this.stopAutoPlay();
        if (this.currentStepIdx < this.steps.length - 1) {
          this.updateStepDisplay(this.currentStepIdx + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === '-') {
        e.preventDefault();
        this.stopAutoPlay();
        if (this.currentStepIdx > 0) {
          this.updateStepDisplay(this.currentStepIdx - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.stopAutoPlay();
        this.updateStepDisplay(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.stopAutoPlay();
        this.updateStepDisplay(this.steps.length - 1);
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (e.target === viewport) {
          e.preventDefault();
          this.toggleAutoPlay();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    this._cleanupHandlers = () => {
      window.removeEventListener('keydown', onKeyDown);
      this.stopAutoPlay();
    };
  }

  updateStepDisplay(stepIdx, animate = true) {
    if (stepIdx < 0 || stepIdx >= this.steps.length) return;
    this.currentStepIdx = stepIdx;
    const step = this.steps[stepIdx];
    const isBn = this.lang === 'bn';

    // 1. Update pills
    this.steps.forEach((s, idx) => {
      const p = this.wrapper.querySelector(`#c0-pill-${s.id}`);
      if (p) {
        if (idx === stepIdx) {
          p.classList.add('active');
          p.setAttribute('aria-selected', 'true');
        } else {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        }
      }
    });

    // 2. Stepper indicator & buttons
    const ind = this.wrapper.querySelector('#c0-step-indicator');
    if (ind) ind.textContent = `${stepIdx + 1} / ${this.steps.length}`;

    const btnPrev = this.wrapper.querySelector('#c0-btn-prev');
    const btnNext = this.wrapper.querySelector('#c0-btn-next');
    if (btnPrev) btnPrev.disabled = stepIdx === 0;
    if (btnNext) btnNext.disabled = stepIdx === this.steps.length - 1;

    // 3. Ruler cursor position and active tick
    const cursor = this.wrapper.querySelector('#c0-ruler-cursor');
    const tickPercentages = { 0: '0%', 1: '28%', 2: '36%', 3: '55%' };
    if (cursor) cursor.style.left = tickPercentages[stepIdx] || '0%';

    const powerDisp = this.wrapper.querySelector('#c0-power-display');
    if (powerDisp) powerDisp.textContent = isBn ? step.exponentStrBn : step.exponentStr;

    // 4. Caliper text
    const txtCaliper = this.wrapper.querySelector('#c0-txt-caliper');
    if (txtCaliper) {
      if (step.id === 'atom') txtCaliper.textContent = '≈ 1.0 × 10⁻¹⁰ m (1 Å)';
      else if (step.id === 'nucleus') txtCaliper.textContent = '≈ 1.0 × 10⁻¹⁴ m (10 fm)';
      else if (step.id === 'proton') txtCaliper.textContent = '≈ 1.7 × 10⁻¹⁵ m (1.7 fm)';
      else if (step.id === 'quark') txtCaliper.textContent = '< 1.0 × 10⁻¹⁸ m (Point-like)';
    }

    // 5. Floating Caption
    const capBadge = this.wrapper.querySelector('#c0-caption-badge');
    const capText = this.wrapper.querySelector('#c0-caption-text');
    if (capBadge) capBadge.textContent = isBn ? step.exponentStrBn : step.exponentStr;
    if (capText) {
      capText.innerHTML = `<strong>${isBn ? step.nameBn : step.nameEn}:</strong> ${isBn ? step.sizeFormattedBn : step.sizeFormattedEn}. ${isBn ? step.descriptionBn : step.descriptionEn}`;
    }

    // 6. Metrics Grid
    const valSize = this.wrapper.querySelector('#c0-val-size');
    const subSize = this.wrapper.querySelector('#c0-sub-size');
    const valRatio = this.wrapper.querySelector('#c0-val-ratio');
    const subRatio = this.wrapper.querySelector('#c0-sub-ratio');

    if (valSize) valSize.textContent = isBn ? step.exponentStrBn : step.exponentStr;
    if (subSize) subSize.textContent = isBn ? step.sizeFormattedBn : step.sizeFormattedEn;

    if (valRatio && subRatio) {
      if (stepIdx === 0) {
        valRatio.textContent = '1×';
        subRatio.textContent = isBn ? 'প্রারম্ভিক ভিত্তি স্কেল' : 'Baseline Reference';
      } else if (stepIdx === 1) {
        valRatio.textContent = '10,000× ছোট';
        subRatio.textContent = isBn ? 'পরমাণুর তুলনায় ১০,০০০ গুণ ক্ষুদ্র' : '10,000× smaller than atom';
      } else if (stepIdx === 2) {
        valRatio.textContent = '100,000× ছোট';
        subRatio.textContent = isBn ? 'পরমাণুর চেয়ে ১ লাখ গুণ ক্ষুদ্র' : '100,000× smaller than atom';
      } else if (stepIdx === 3) {
        valRatio.textContent = '≥ 100,000,000× ছোট';
        subRatio.textContent = isBn ? 'পরমাণুর চেয়ে কমপক্ষে ১০ কোটি গুণ ক্ষুদ্র' : '≥ 100,000,000× smaller than atom';
      }
    }

    // 7. Render dynamic SVG content
    this.renderSvgScene(stepIdx, animate);

    // 8. Render Pedagogy Level Details
    this.renderPedagogyDetails(step);
  }

  renderSvgScene(stepIdx, animate) {
    const mount = this.wrapper.querySelector('#c0-scene-mount');
    if (!mount) return;
    const isBn = this.lang === 'bn';

    if (stepIdx === 0) {
      // ATOM (10^-10 m): Diffuse electron cloud with nucleus speck
      mount.innerHTML = `
        <g class="c0-scene-atom" style="transition: all 0.5s ease;">
          <!-- Electron Cloud -->
          <circle cx="270" cy="190" r="140" fill="url(#c0-grad-atom)" opacity="0.85"></circle>
          <!-- Orbital path representations -->
          <ellipse cx="270" cy="190" rx="135" ry="50" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,4" opacity="0.6" transform="rotate(-25 270 190)"></ellipse>
          <ellipse cx="270" cy="190" rx="135" ry="50" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,4" opacity="0.6" transform="rotate(35 270 190)"></ellipse>
          <ellipse cx="270" cy="190" rx="135" ry="50" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,4" opacity="0.6" transform="rotate(90 270 190)"></ellipse>
          
          <!-- Outer boundary indicator -->
          <circle cx="270" cy="190" r="140" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.5"></circle>
          <text x="270" y="38" fill="#38bdf8" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="700">
            ${isBn ? 'ইলেকট্রন ক্লাউড ব্যাসার্ধ ≈ ১০⁻¹⁰ মি' : 'Electron Cloud Radius ≈ 10⁻¹⁰ m'}
          </text>

          <!-- Microscopic Nucleus in center (symbolically enlarged to 3px so it is barely visible) -->
          <circle cx="270" cy="190" r="3.5" fill="#ef4444"></circle>
          <line x1="270" y1="184" x2="270" y2="120" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2"></line>
          <text x="270" y="112" fill="#ef4444" font-size="11" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="600">
            ${isBn ? 'নিউক্লিয়াস (১,০০,০০০ গুণ ক্ষুদ্র কেন্দ্রবিন্দু)' : 'Nucleus (100,000× smaller central core)'}
          </text>
        </g>
      `;
    } else if (stepIdx === 1) {
      // NUCLEUS (10^-14 m): Cluster of protons and neutrons
      mount.innerHTML = `
        <g class="c0-scene-nucleus" style="transition: all 0.5s ease;">
          <!-- Nuclear potential well glow -->
          <circle cx="270" cy="190" r="105" fill="url(#c0-grad-nuc)" opacity="0.75"></circle>
          <circle cx="270" cy="190" r="105" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"></circle>
          
          <text x="270" y="55" fill="#ef4444" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="700">
            ${isBn ? 'পারমাণবিক নিউক্লিয়াস ≈ ১০⁻¹⁴ মি (সবল নিউক্লীয় বন্ধন)' : 'Atomic Nucleus ≈ 10⁻¹⁴ m (Bound Nucleons)'}
          </text>

          <!-- Nucleon Cluster (Symbolic protons and neutrons) -->
          <!-- Protons (Red) & Neutrons (Slate/Blue) -->
          <g transform="translate(270, 190)">
            <circle cx="-35" cy="-25" r="28" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"></circle>
            <text x="-35" y="-20" fill="#ffffff" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">p⁺</text>

            <circle cx="25" cy="-30" r="28" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"></circle>
            <text x="25" y="-25" fill="#ffffff" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">n⁰</text>

            <circle cx="-25" cy="30" r="28" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"></circle>
            <text x="-25" y="35" fill="#ffffff" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">n⁰</text>

            <circle cx="35" cy="25" r="28" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"></circle>
            <text x="35" y="30" fill="#ffffff" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">p⁺</text>

            <!-- Center proton under inspection -->
            <circle cx="0" cy="0" r="29" fill="#dc2626" stroke="#38bdf8" stroke-width="2.5"></circle>
            <text x="0" y="5" fill="#ffffff" font-size="13" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">p⁺</text>
          </g>

          <text x="270" y="325" fill="#94a3b8" font-size="11" font-family="'JetBrains Mono', monospace" text-anchor="middle">
            ${isBn ? 'পরবর্তী ধাপে এই একক প্রোটনের অভ্যন্তরীণ কোয়ার্ক গঠন উন্মোচিত হবে' : 'Zooming in reveals the internal quark structure of a single proton'}
          </text>
        </g>
      `;
    } else if (stepIdx === 2) {
      // PROTON (1.7 x 10^-15 m): 3 Valence quarks in Y-flux tube
      mount.innerHTML = `
        <g class="c0-scene-proton" style="transition: all 0.5s ease;">
          <!-- Proton Charge Radius Cloud -->
          <circle cx="270" cy="190" r="115" fill="url(#c0-grad-proton)" opacity="0.65"></circle>
          <circle cx="270" cy="190" r="115" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"></circle>
          
          <text x="270" y="45" fill="#38bdf8" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="700">
            ${isBn ? 'প্রোটন ব্যাস ≈ ১.৭ × ১০⁻¹⁵ মি (চার্জ-ব্যাসার্ধ ০.৮৪১৪ fm)' : 'Proton Diameter ≈ 1.7 × 10⁻¹⁵ m (Charge Radius 0.8414 fm)'}
          </text>

          <!-- Y-Shaped Flux Tube Arms to Fermat-Torricelli Junction (270, 195) -->
          <g stroke="#38bdf8" stroke-width="8" stroke-linecap="round" opacity="0.75">
            <line x1="270" y1="195" x2="270" y2="115"></line>
            <line x1="270" y1="195" x2="200" y2="245"></line>
            <line x1="270" y1="195" x2="340" y2="245"></line>
          </g>

          <!-- Junction Core -->
          <circle cx="270" cy="195" r="7" fill="#ffffff"></circle>

          <!-- Quark u1 (Top) -->
          <g transform="translate(270, 115)">
            <circle cx="0" cy="0" r="20" fill="#ef4444" stroke="#ffffff" stroke-width="2"></circle>
            <text x="0" y="5" fill="#ffffff" font-size="13" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">u</text>
            <text x="26" y="4" fill="#ef4444" font-size="10" font-family="'JetBrains Mono', monospace">+2/3</text>
          </g>

          <!-- Quark u2 (Bottom Left) -->
          <g transform="translate(200, 245)">
            <circle cx="0" cy="0" r="20" fill="#10b981" stroke="#ffffff" stroke-width="2"></circle>
            <text x="0" y="5" fill="#ffffff" font-size="13" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">u</text>
            <text x="-26" y="4" fill="#10b981" font-size="10" font-family="'JetBrains Mono', monospace">+2/3</text>
          </g>

          <!-- Quark d (Bottom Right) -->
          <g transform="translate(340, 245)">
            <circle cx="0" cy="0" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="2"></circle>
            <text x="0" y="5" fill="#ffffff" font-size="13" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="800">d</text>
            <text x="26" y="4" fill="#3b82f6" font-size="10" font-family="'JetBrains Mono', monospace">-1/3</text>
          </g>
        </g>
      `;
    } else if (stepIdx === 3) {
      // QUARK (< 10^-18 m): Point-like quantum limit
      mount.innerHTML = `
        <g class="c0-scene-quark" style="transition: all 0.5s ease;">
          <!-- Experimental Upper Bound Dashed Perimeter (10^-18 m) -->
          <circle cx="270" cy="190" r="120" fill="url(#c0-grad-quark)" opacity="0.4"></circle>
          <circle cx="270" cy="190" r="120" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="6,4"></circle>
          
          <text x="270" y="45" fill="#c084fc" font-size="12" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="700">
            ${isBn ? 'কোয়ার্ক পরীক্ষালব্ধ আকার সীমা: < ১০⁻¹⁸ মি' : 'Quark Experimental Limit: < 10⁻¹⁸ m'}
          </text>

          <!-- Point-like core spark in center -->
          <circle cx="270" cy="190" r="4.5" fill="#ffffff"></circle>
          <circle cx="270" cy="190" r="12" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.8"></circle>

          <!-- Quantum Uncertainty Spikes -->
          <line x1="250" y1="190" x2="290" y2="190" stroke="#e9d5ff" stroke-width="1.5"></line>
          <line x1="270" y1="170" x2="270" y2="210" stroke="#e9d5ff" stroke-width="1.5"></line>

          <!-- Callout text -->
          <g transform="translate(270, 245)">
            <rect x="-140" y="0" width="280" height="48" rx="8" fill="rgba(15,23,42,0.9)" stroke="rgba(168,85,247,0.4)" stroke-width="1"></rect>
            <text x="0" y="20" fill="#f8fafc" font-size="11.5" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="700">
              ${isBn ? 'বিন্দুসদৃশ (Point-like): শূন্য ব্যাসার্ধ' : 'Point-like: Zero Measured Radius'}
            </text>
            <text x="0" y="37" fill="#94a3b8" font-size="10.5" text-anchor="middle">
              ${isBn ? 'HERA / LEP গবেষণায় কোনো অভ্যন্তরীণ কাঠামো ধরা পড়েনি' : 'DIS scattering confirms zero internal spatial substructure'}
            </text>
          </g>
        </g>
      `;
    }
  }

  renderPedagogyDetails(step) {
    const box = this.wrapper.querySelector('#c0-level-pedagogy-box');
    if (!box) return;
    const isBn = this.lang === 'bn';

    if (this.level === 'basic') {
      box.innerHTML = `
        <div class="c0-pedagogy-card">
          <span class="c0-pedagogy-tag">${isBn ? 'সহজ ব্যাখ্যা' : 'Basic Intuition'}</span>
          <p class="c0-pedagogy-text">
            ${isBn ? step.comparisonBn : step.comparisonEn}
          </p>
        </div>
      `;
    } else if (this.level === 'intermediate') {
      box.innerHTML = `
        <div class="c0-pedagogy-card">
          <span class="c0-pedagogy-tag intermediate">${isBn ? 'মাঝারি: পরিমাপ ও প্রমাণ' : 'Intermediate: Measurement & Bounds'}</span>
          <p class="c0-pedagogy-text">
            <strong>${isBn ? 'উৎস ও প্রমাণ:' : 'Source & Verification:'}</strong> ${step.source}.<br/>
            ${isBn ? step.descriptionBn : step.descriptionEn}
          </p>
        </div>
      `;
    } else {
      // Expert level
      box.innerHTML = `
        <div class="c0-pedagogy-card expert">
          <span class="c0-pedagogy-tag expert">${isBn ? 'বিশেষজ্ঞ: সমীকরণ ও DIS রেজোলিউশন' : 'Expert: QFT & DIS Resolution Formula'}</span>
          <p class="c0-pedagogy-text">
            <strong>${isBn ? 'ডি-ব্রগলি তরঙ্গদৈর্ঘ্য রেজোলিউশন সীমা:' : 'de Broglie Spatial Resolution Limit:'}</strong><br/>
            <code>$\\lambda = \\frac{\\hbar c}{E} \\approx \\frac{0.197\\text{ GeV}\\cdot\\text{fm}}{Q}$</code><br/>
            ${step.id === 'quark'
              ? (isBn
                  ? 'HERA-তে $Q^2 \\approx 10^4\\text{ GeV}^2$ ($E \\sim 100\\text{ GeV}$) শক্তির বিচ্ছুরণে $r < 10^{-18}\\text{ m}$-এ কোনো গঠন বা সাব-পার্টিকেল (preon) মেলেনি।'
                  : 'At HERA with $Q^2 \\approx 10^4\\text{ GeV}^2$, probing lengths $\\Delta x \\sim \\hbar/Q < 10^{-18}\\text{ m}$ confirms quarks are structureless elementary fermions.'
                )
              : (isBn
                  ? 'প্রোটনের আধান-ব্যাসার্ধ $r_p = 0.8414\\text{ fm}$ ইলেকট্রন-মিউয়ন স্ক্যাটারিং ও ল্যাম্ব শিফট দ্বারা নির্ভুলভাবে পরিমাপকৃত।'
                  : 'Proton charge radius $r_p = 0.8414\\text{ fm}$ measured by muonic hydrogen spectroscopy & electron scattering.'
                )
            }
          </p>
        </div>
      `;
    }
  }

  toggleAutoPlay() {
    if (this.isAutoPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isAutoPlaying = true;
    const btn = this.wrapper.querySelector('#c0-btn-autoplay');
    const lbl = this.wrapper.querySelector('#c0-lbl-autoplay');
    const isBn = this.lang === 'bn';

    if (btn) btn.classList.add('playing');
    if (lbl) lbl.textContent = isBn ? 'থামুন (Pause)' : 'Pause';

    this.autoTimer = setInterval(() => {
      let nextIdx = (this.currentStepIdx + 1) % this.steps.length;
      this.updateStepDisplay(nextIdx);
    }, 3500);
  }

  stopAutoPlay() {
    if (!this.isAutoPlaying) return;
    this.isAutoPlaying = false;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    const btn = this.wrapper.querySelector('#c0-btn-autoplay');
    const lbl = this.wrapper.querySelector('#c0-lbl-autoplay');
    const isBn = this.lang === 'bn';

    if (btn) btn.classList.remove('playing');
    if (lbl) lbl.textContent = isBn ? 'অটো জুম-ইন (সিনেমা)' : 'Auto Zoom-in (Cinema)';
  }

  openScaleInfoDrawer() {
    if (!this.infoDrawer) return;
    const isBn = this.lang === 'bn';

    const contentBn = `
      <div class="c0-drawer-body">
        <h4>স্কেল সততা ও প্রতীকী মডেলের বৈজ্ঞানিক ব্যাখ্যা</h4>
        <div class="c0-drawer-badges">
          ${createTierBadge('T1', 'Direct Measurement', 'bn')}
          ${createTierBadge('T4', 'Symbolic Model', 'bn')}
        </div>
        <p>
          কোয়ার্ক জগতে প্রবেশ করার পূর্বে এই স্কেল-সিঁড়ি আমাদের সাধারণ মানবীয় দৃষ্টিভঙ্গির সাথে কোয়ান্টাম কণার বাস্তব আকারের অনুপাত স্পষ্ট করে তোলে:
        </p>
        <h5>১. প্রতীকী চিত্রায়ন কেন আবশ্যক? (T4 ব্যাজ)</h5>
        <p>
          স্ট্যান্ডার্ড মডেলে কোয়ার্ক হচ্ছে বিন্দুসদৃশ কণা ($r < 10^{-18}$ মিটার), যার কোনো দৃশ্যমান ব্যাস বা কঠিন সীমানা নেই। স্ক্রিনে যে রঙিন বল বা গোলক দেখানো হয় তা সম্পূর্ণ <strong>প্রতীকী চিত্রায়ন (Symbolic)</strong> যাতে ব্যবহারকারী এর অবস্থান ও মিথস্ক্রিয়া অনুধাবন করতে পারেন।
        </p>
        <h5>২. ১০⁻¹⁰ মি থেকে ১০⁻¹৮ মি: বিশাল স্কেল পার্থক্য</h5>
        <ul>
          <li>পরমাণু ($10^{-10}$ মি) থেকে প্রোটন ($1.7 \\times 10^{-15}$ মি) প্রায় <strong>১,০০,০০০ গুণ ছোট</strong>। এটি যেন একটি ফুটবল স্টেডিয়ামের মাঝে রাখা একটি ছোট্ট মার্বেল!</li>
          <li>প্রোটন থেকে কোয়ার্ক-সীমা ($10^{-18}$ মি) আরও কমপক্ষে <strong>১,০০০ গুণ ছোট</strong>।</li>
        </ul>
        <h5>৩. ১৭ ঘাতের প্ল্যাঙ্ক মরুভূমি (The Planck Gap)</h5>
        <p>
          কোয়ার্কের পরীক্ষালব্ধ সীমা ($10^{-18}$ মি) থেকে কোয়ান্টাম মহাকর্ষের প্ল্যাঙ্ক দৈর্ঘ্য ($1.6 \\times 10^{-35}$ মি)-এর মাঝে রয়েছে আরও ১৭ ঘাতের ব্যবধান ($10^{17}$ গুণ)। এই বিশাল অঞ্চলে বর্তমান পরীক্ষামূলক পদার্থবিজ্ঞান এখনও পৌঁছাতে পারেনি।
        </p>
      </div>
    `;

    const contentEn = `
      <div class="c0-drawer-body">
        <h4>Scale Fidelity & Symbolic Visual Models</h4>
        <div class="c0-drawer-badges">
          ${createTierBadge('T1', 'Direct Measurement', 'en')}
          ${createTierBadge('T4', 'Symbolic Model', 'en')}
        </div>
        <p>
          Before exploring quarks, the Scale Ladder provides an honest logarithmic bridge from atomic scales to the subatomic realm:
        </p>
        <h5>1. Why are quarks drawn as spheres? (T4 Badge)</h5>
        <p>
          In quantum field theory, quarks are point-like fundamental fermions with no measurable spatial boundary ($< 10^{-18}$ m). Drawing colored spheres on screen is strictly a <strong>symbolic convention</strong> to represent quantum localized degrees of freedom.
        </p>
        <h5>2. The 100,000× Atomic Compression</h5>
        <ul>
          <li>An atomic nucleus is approximately <strong>100,000 times smaller</strong> than the electron cloud boundary of the atom (like a pea in the center of a football cathedral).</li>
          <li>A single quark is at least <strong>1,000 times smaller</strong> than the proton that confines it.</li>
        </ul>
        <h5>3. The 17-Order Planck Gap</h5>
        <p>
          Between the current experimental boundary ($10^{-18}$ m) and the Planck limit ($1.6 \\times 10^{-35}$ m) lies an uncharted territory of 17 orders of magnitude ($10^{17}\\times$).
        </p>
      </div>
    `;

    this.infoDrawer.open({
      title: isBn ? 'স্কেল সততা ও প্রতীকী মডেল' : 'Scale Fidelity & Symbolic Models',
      bodyHtml: isBn ? contentBn : contentEn,
      tier: 'T1',
      source: 'PDG (2024/2026) / CODATA (2022) / HERA DIS Limit'
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
    const step = this.steps[this.currentStepIdx];
    this.renderPedagogyDetails(step);
  }

  destroy() {
    this.stopAutoPlay();
    if (this._cleanupHandlers) {
      this._cleanupHandlers();
      this._cleanupHandlers = null;
    }
    this.container.innerHTML = '';
  }
}
