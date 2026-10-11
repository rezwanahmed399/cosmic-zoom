/**
 * CosmoPlanck Quark Section - Chapter 8: "রেজোলিউশন-স্লাইডার" (Parton Distribution Functions / PDFs)
 * 
 * Scientific Fidelity & Features:
 * 1. Log-scale Q^2 Slider:
 *    - PDF valid range: Q^2 >= 2.0 GeV^2 to ~10^8 GeV^2. Sourced from CERN LHAPDF (CT18NNLO).
 *    - Resolution probe wavelength: lambda ~ hbar*c / Q (Q^2 = 1 GeV^2 -> ~0.2 fm; Q^2 = 10^4 GeV^2 -> ~0.002 fm).
 * 2. Non-perturbative Threshold (Q^2 < 2 GeV^2):
 *    - Strictly renders symbolic constituent picture (3 fuzzy dots; Tier T4).
 *    - Strictly suppresses PDF curves with explicit scientific notification ("সূত্র খাটে না").
 * 3. High-Q^2 PDF Curves x*f(x, Q^2):
 *    - Real authentic curves from CT18NNLO: u_v, d_v, u_bar, d_bar, s, g (gluon / 10).
 * 4. Live Momentum Fraction Breakdown:
 *    - Valence, sea, and gluon momentum fractions directly calculated from PDF.
 *    - Highlights gluon momentum growth towards asymptotic limit 16 / (16 + 3*n_f) ~ 52%.
 * 5. Educational Drawer & Deep Insights:
 *    - SLAC-MIT DIS: Bjorken scaling & Callan-Gross spin-1/2 proof.
 *    - HERA: Rapid gluon and sea quark explosion at low x.
 *    - Definition of Bjorken x.
 *    - Warning: PDFs are determined via global fits (Tier T2).
 * 6. Strictly zero unicode emojis across code and UI.
 */

import {
  getResolutionSliderPdfData,
  getPdfAtQ2,
  RESOLUTION_SLIDER_PDF
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPARK_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_ALERT_SVG = '<svg class="c8-icon-badge alert" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_SEARCH_SVG = '<svg class="c8-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';

export class Chapter8ResolutionSlider {
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

    // Load full CT18NNLO grid dataset
    this.pdfDataset = getResolutionSliderPdfData();
    this.meta = this.pdfDataset.meta;
    this.points = this.pdfDataset.points;

    // Current slider state: log10(Q^2) from log10(0.8) to log10(1e8)
    // Default at Q^2 = 10 GeV^2 (log10 = 1.0)
    this.currentLogQ2 = 1.0;
    this.activeSlice = getPdfAtQ2(Math.pow(10, this.currentLogQ2));

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-8-view';
    this.viewEl.id = 'chapter-8-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c8-header-section" aria-label="Chapter 8 Header">
        <div class="c8-header-top">
          <div class="c8-title-block">
            <div class="c8-pill-row">
              <span class="c8-chapter-badge">অধ্যায় ৮</span>
              <span class="c8-tier-badge-wrap" id="c8-tier-header"></span>
              <span class="c8-scheme-tag">CT18NNLO (3-loop DGLAP)</span>
            </div>
            <h2 class="c8-main-title">রেজোলিউশন-স্লাইডার (PDF)</h2>
            <p class="c8-subtitle">শক্তি স্কেল Q² বৃদ্ধিতে প্রোটনের গভীর অন্তর্গঠন: ভ্যালেন্স, সী ও গ্লুয়ন প্লাবন</p>
          </div>

          <div class="c8-header-actions">
            <button class="c8-btn-outline" id="c8-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>PDF ও DIS বৈজ্ঞানিক অডিট</span>
            </button>
          </div>
        </div>

        <!-- INTRO HERO CARD -->
        <div class="c8-intro-card">
          <div class="c8-intro-quote-badge">
            ${ICON_SEARCH_SVG}
            <span>দেখা-দৈর্ঘ্য নীতি: উচ্চতর শক্তি Q মানে অতিক্ষুদ্র তরঙ্গদৈর্ঘ্য λ ≈ ħc/Q</span>
          </div>
          <p class="c8-intro-text">
            কম শক্তিতে ($Q^2 < 2\\text{ GeV}^2$) প্রোটন কেবল তিনটি অস্পষ্ট ভ্যালেন্স কোয়ার্কের সংকর (Constituent Model)। 
            কিন্তু সংঘর্ষের ভরবেগ স্কেল $Q^2$ যত বাড়ানো হয়, ফোটনের প্রোব তরঙ্গদৈর্ঘ্য তত ক্ষুদ্র হয় — ফলে প্রোটনের ভেতরের 
            অগণিত ভার্চুয়াল কোয়ার্ক-অ্যান্টিকোয়ার্ক জোড় (Sea Quarks) এবং বলবাহক গ্লুয়নের প্রচণ্ড প্লাবন স্পষ্ট ধরা পড়ে। 
            নিচের স্লাইডার ড্র্যাগ করে কোয়ান্টাম ক্রোমোডাইনামিক্সের এই পার্টন ডিস্ট্রিবিউশন ফাংশন (PDF) লাইভ পর্যবেক্ষণ করুন।
          </p>
        </div>
      </section>

      <!-- RESOLUTION CONTROLLER HUD -->
      <section class="c8-controller-section" aria-label="Resolution Probe Controller">
        <div class="c8-controller-card">
          <div class="c8-controller-header">
            <div class="c8-q2-readout-wrap">
              <span class="c8-ctrl-label">রেজোলিউশন স্কেল (Resolution Scale):</span>
              <span class="c8-q2-val" id="c8-q2-val">Q² = 10.0 GeV²</span>
              <span class="c8-q-val" id="c8-q-val">(Q = 3.16 GeV)</span>
            </div>
            <div class="c8-lambda-readout-wrap">
              <span class="c8-ctrl-label">প্রোব দেখা-দৈর্ঘ্য (Resolution λ ≈ ħc/Q):</span>
              <span class="c8-lambda-val" id="c8-lambda-val">λ ≈ 0.062 fm</span>
            </div>
          </div>

          <!-- LOG-SCALE SLIDER -->
          <div class="c8-slider-container">
            <input type="range" class="c8-range-slider" id="c8-slider" 
                   min="-0.3" max="8.0" step="0.05" value="1.0" 
                   aria-label="Resolution scale Q squared slider" />
            
            <div class="c8-slider-ticks">
              <div class="c8-tick" style="left: 0%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">০.৫ GeV²<br><small>(Constituent)</small></span>
              </div>
              <div class="c8-tick" style="left: 17%;">
                <span class="c8-tick-mark highlight"></span>
                <span class="c8-tick-lbl">২ GeV²<br><small>(PDF শুরু)</small></span>
              </div>
              <div class="c8-tick" style="left: 36%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">১০ GeV²</span>
              </div>
              <div class="c8-tick" style="left: 52%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">১০০ GeV²</span>
              </div>
              <div class="c8-tick" style="left: 68%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">১০⁴ GeV²<br><small>(HERA)</small></span>
              </div>
              <div class="c8-tick" style="left: 85%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">১০⁶ GeV²</span>
              </div>
              <div class="c8-tick" style="left: 100%;">
                <span class="c8-tick-mark"></span>
                <span class="c8-tick-lbl">১০⁸ GeV²<br><small>(LHC/Future)</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- DUAL MAIN VIEWPORT (LEFT: PROTON RESOLUTION PICTURE, RIGHT: PDF CURVES) -->
      <section class="c8-main-grid" aria-label="Proton Resolution and PDF Curves">
        <!-- LEFT PANEL: VISUAL PROTON MORPHOLOGY -->
        <div class="c8-panel proton-panel">
          <div class="c8-panel-header">
            <h3 class="c8-panel-title">প্রোটনের দেখা-রূপ (Physical Picture)</h3>
            <span class="c8-panel-tag" id="c8-picture-mode-tag">T4: প্রতীকী দৃশ্য</span>
          </div>

          <div class="c8-proton-stage" id="c8-proton-stage">
            <!-- Dynamic Canvas / SVG Container -->
          </div>

          <!-- MOMENTUM BREAKDOWN ROW -->
          <div class="c8-momentum-card" id="c8-momentum-card">
            <div class="c8-mom-header">
              <span class="c8-mom-title">ভরবেগ-ভাগ (Momentum Share Σ ∫ x f dx):</span>
              <span class="c8-mom-sum" id="c8-mom-sum-val">মোট = ১০০%</span>
            </div>
            
            <div class="c8-mom-bar-wrap">
              <div class="c8-mom-segment valence" id="c8-mom-bar-val" style="width: 35%;">
                <span class="c8-bar-text">Valence</span>
              </div>
              <div class="c8-mom-segment sea" id="c8-mom-bar-sea" style="width: 22%;">
                <span class="c8-bar-text">Sea</span>
              </div>
              <div class="c8-mom-segment gluon" id="c8-mom-bar-gluon" style="width: 43%;">
                <span class="c8-bar-text">Gluon</span>
              </div>
            </div>

            <div class="c8-mom-legend-grid">
              <div class="c8-mom-leg-item">
                <span class="c8-leg-dot val"></span>
                <span class="c8-leg-lbl">ভ্যালেন্স:</span>
                <strong class="c8-leg-val" id="c8-val-pct">৩৫.২%</strong>
              </div>
              <div class="c8-mom-leg-item">
                <span class="c8-leg-dot sea"></span>
                <span class="c8-leg-lbl">সী কোয়ার্ক:</span>
                <strong class="c8-leg-val" id="c8-sea-pct">২১.৫%</strong>
              </div>
              <div class="c8-mom-leg-item">
                <span class="c8-leg-dot gluon"></span>
                <span class="c8-leg-lbl">গ্লুয়ন:</span>
                <strong class="c8-leg-val" id="c8-gluon-pct">৪৩.৩%</strong>
              </div>
            </div>

            <div class="c8-mom-limit-note">
              <span>অ্যাসিম্পটোটিক সীমা (n_f = ৫):</span>
              <strong>গ্লুয়ন ভাগ → ১৬/(১৬ + ৩×৫) ≈ ৫১.৬%</strong>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: PDF PLOT x*f(x, Q^2) -->
        <div class="c8-panel plot-panel">
          <div class="c8-panel-header">
            <div class="c8-plot-title-wrap">
              <h3 class="c8-panel-title">পার্টন ঘনত্ব x·f(x, Q²) বনাম Bjorken x</h3>
              <span class="c8-source-pill">CT18NNLO Central</span>
            </div>
            <div class="c8-plot-legend">
              <span class="c8-curve-tag uv">u_v</span>
              <span class="c8-curve-tag dv">d_v</span>
              <span class="c8-curve-tag ubar">ū</span>
              <span class="c8-curve-tag dbar">d̄</span>
              <span class="c8-curve-tag s">s</span>
              <span class="c8-curve-tag g">g / ১০</span>
            </div>
          </div>

          <div class="c8-plot-stage" id="c8-plot-stage">
            <!-- Dynamic SVG PDF Chart -->
          </div>

          <div class="c8-sumrules-audit-bar" id="c8-sumrules-audit-bar">
            <!-- Dynamic Sum Rule Verification Pill -->
          </div>
        </div>
      </section>

      <!-- NAVIGATION FOOTER -->
      <section class="c8-nav-footer" aria-label="Chapter Navigation">
        <div class="c8-nav-actions">
          <a class="c8-nav-btn prev" href="#/quarks/chapter-7" id="c8-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c8-nav-btn-text">
              <span class="c8-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c8-nav-btn-title">অধ্যায় ৭: ভর কোথা থেকে আসে</span>
            </div>
          </a>

          <div class="c8-nav-summary-box">
            <span class="c8-nav-tag">রেজোলিউশন শিক্ষা</span>
            <p class="c8-nav-summary-desc">
              কোয়ার্ক কোনো স্থির ৩-বল বস্তু নয়; বরং অসীম তরঙ্গদৈর্ঘ্যের গভীরতায় এক আলোড়নময় কোয়ান্টাম সমুদ্র।
            </p>
          </div>

          <a class="c8-nav-btn next" href="#/quarks/chapter-9" id="c8-btn-next">
            <div class="c8-nav-btn-text" style="text-align: right;">
              <span class="c8-nav-btn-sub">পরবর্তী অধ্যায়</span>
              <span class="c8-nav-btn-title">অধ্যায় ৯: Asymptotic freedom</span>
            </div>
            ${ICON_ARROW_RIGHT_SVG}
          </a>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTier = this.viewEl.querySelector('#c8-tier-header');
    if (headerTier) {
      headerTier.appendChild(createTierBadge('T2', { lang: this.lang }));
    }

    // Bind Info Drawer
    this.viewEl.querySelector('#c8-btn-info').addEventListener('click', () => this.openInfoDrawer());

    // Bind Slider
    const slider = this.viewEl.querySelector('#c8-slider');
    slider.addEventListener('input', (e) => {
      this.currentLogQ2 = parseFloat(e.target.value);
      this.updateView();
    });

    this.updateView();
  }

  updateView() {
    const q2 = Math.pow(10, this.currentLogQ2);
    this.activeSlice = getPdfAtQ2(q2);

    // Update Controller Readouts
    const q2Readout = this.viewEl.querySelector('#c8-q2-val');
    const qReadout = this.viewEl.querySelector('#c8-q-val');
    const lambdaReadout = this.viewEl.querySelector('#c8-lambda-val');

    if (q2Readout) q2Readout.textContent = `Q² = ${q2 < 10 ? q2.toFixed(2) : q2 < 1000 ? q2.toFixed(1) : q2.toExponential(2)} GeV²`;
    if (qReadout) qReadout.textContent = `(Q = ${Math.sqrt(q2).toFixed(2)} GeV)`;
    if (lambdaReadout) {
      const lambda = 0.197327 / Math.sqrt(Math.max(0.01, q2));
      lambdaReadout.textContent = `λ ≈ ${lambda < 0.01 ? lambda.toExponential(2) : lambda.toFixed(3)} fm`;
    }

    // Render Panels
    this.renderProtonStage();
    this.renderPlotStage();
    this.renderMomentumAndSumRules();
  }

  renderProtonStage() {
    const stage = this.viewEl.querySelector('#c8-proton-stage');
    const modeTag = this.viewEl.querySelector('#c8-picture-mode-tag');
    if (!stage) return;

    if (this.activeSlice.isNonPerturbative) {
      // Q^2 < 2 GeV^2: Constituent Quark Picture (3 fuzzy dots; Tier T4)
      if (modeTag) modeTag.textContent = 'T4: প্রতীকী কনস্টিটিউয়েন্ট দৃশ্য';
      stage.innerHTML = `
        <div class="c8-constituent-view">
          <svg viewBox="0 0 320 260" class="c8-proton-svg">
            <defs>
              <radialGradient id="c8-proton-boundary" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"></stop>
                <stop offset="70%" stop-color="#1e3a8a" stop-opacity="0.12"></stop>
                <stop offset="100%" stop-color="#0f172a" stop-opacity="0"></stop>
              </radialGradient>
              <filter id="c8-fuzzy-glow">
                <feGaussianBlur stdDeviation="12" result="blur"></feGaussianBlur>
                <feMerge>
                  <feMergeNode in="blur"></feMergeNode>
                  <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
              </filter>
            </defs>

            <!-- Proton Bag Boundary -->
            <circle cx="160" cy="130" r="110" fill="url(#c8-proton-boundary)" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="6,4"></circle>

            <!-- 3 Fuzzy Constituent Blobs (T4) -->
            <!-- Up 1 -->
            <g transform="translate(120, 95)" filter="url(#c8-fuzzy-glow)">
              <circle cx="0" cy="0" r="32" fill="#ef4444" opacity="0.75"></circle>
              <text x="0" y="6" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">u</text>
            </g>

            <!-- Up 2 -->
            <g transform="translate(200, 95)" filter="url(#c8-fuzzy-glow)">
              <circle cx="0" cy="0" r="32" fill="#22c55e" opacity="0.75"></circle>
              <text x="0" y="6" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">u</text>
            </g>

            <!-- Down -->
            <g transform="translate(160, 175)" filter="url(#c8-fuzzy-glow)">
              <circle cx="0" cy="0" r="32" fill="#3b82f6" opacity="0.75"></circle>
              <text x="0" y="6" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">d</text>
            </g>
          </svg>

          <div class="c8-np-banner">
            ${ICON_ALERT_SVG}
            <div>
              <strong>Q² < ২ GeV² (নন-পার্টারবেটিভ সীমা):</strong>
              <p>কম রেজোলিউশনে প্রোটন কেবল ৩টি ঝাপসা কণার (Constituent Quarks) মতো দেখায়। কোনো সুসংজ্ঞায়িত PDF বক্ররেখা খাটে না।</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Q^2 >= 2 GeV^2: Deep Resolution View (Valence + Sea + Gluons)
      if (modeTag) modeTag.textContent = 'T2: পার্টন রিজলভড সমুদ্র';

      // Compute visual density based on logQ2
      const numGluons = Math.min(28, Math.floor(6 + this.currentLogQ2 * 3));
      const numSea = Math.min(22, Math.floor(4 + this.currentLogQ2 * 2.5));

      let seaDotsSvg = '';
      for (let i = 0; i < numSea; i++) {
        const angle = (i / numSea) * Math.PI * 2 + (i * 0.4);
        const radius = 35 + ((i * 17) % 65);
        const cx = 160 + radius * Math.cos(angle);
        const cy = 130 + radius * Math.sin(angle);
        const isAnti = i % 2 === 0;
        const col = isAnti ? '#ec4899' : '#06b6d4';
        seaDotsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${col}" opacity="0.8"></circle>`;
      }

      let gluonWavesSvg = '';
      for (let i = 0; i < numGluons; i++) {
        const angle = (i / numGluons) * Math.PI * 2;
        const x1 = 160 + 20 * Math.cos(angle);
        const y1 = 130 + 20 * Math.sin(angle);
        const x2 = 160 + 90 * Math.cos(angle + 0.3);
        const y2 = 130 + 90 * Math.sin(angle + 0.3);
        gluonWavesSvg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#eab308" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.7"></line>`;
      }

      stage.innerHTML = `
        <div class="c8-resolved-view">
          <svg viewBox="0 0 320 260" class="c8-proton-svg">
            <circle cx="160" cy="130" r="110" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" stroke-width="1.5"></circle>

            <!-- Gluon Field lines -->
            ${gluonWavesSvg}

            <!-- Sea Quarks -->
            ${seaDotsSvg}

            <!-- 3 Valence Quarks (smaller point-like centers) -->
            <g transform="translate(130, 105)">
              <circle cx="0" cy="0" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2"></circle>
              <text x="0" y="5" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">u</text>
            </g>
            <g transform="translate(190, 105)">
              <circle cx="0" cy="0" r="14" fill="#22c55e" stroke="#ffffff" stroke-width="2"></circle>
              <text x="0" y="5" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">u</text>
            </g>
            <g transform="translate(160, 165)">
              <circle cx="0" cy="0" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="2"></circle>
              <text x="0" y="5" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">d</text>
            </g>
          </svg>

          <div class="c8-resolved-tagline">
            <span>উচ্চ রেজোলিউশন প্রোব: ক্ষুদ্র λ-তে ভ্যালেন্সের পাশাপাশি প্রচুর সী ও গ্লুয়ন দৃষ্টিগোচর হয়</span>
          </div>
        </div>
      `;
    }
  }

  renderPlotStage() {
    const stage = this.viewEl.querySelector('#c8-plot-stage');
    if (!stage) return;

    if (this.activeSlice.isNonPerturbative) {
      stage.innerHTML = `
        <div class="c8-plot-empty-state">
          <div class="c8-empty-icon">${ICON_ALERT_SVG}</div>
          <h4 class="c8-empty-title">PDF বক্ররেখা অনুপস্থিত (Non-Perturbative Domain)</h4>
          <p class="c8-empty-desc">
            Q² < ২ GeV² এ কোয়ার্ক কনফাইনমেন্ট বল প্রবল হওয়ায় পার্টন ডিস্ট্রিবিউশন ফাংশন (PDF) এবং 
            DGLAP সমীকরণ গাণিতিকভাবে সংজ্ঞায়িত নয়। বৈজ্ঞানিক বিশ্বস্ততা রক্ষায় এখানে কোনো কাল্পনিক 
            বা হাতে-আঁকা বক্ররেখা প্রদর্শন করা হয়নি।
          </p>
          <button class="c8-btn-jump-q2" id="c8-btn-jump-q2" type="button">
            Q² = ২ GeV² এ নিয়ে যান
          </button>
        </div>
      `;

      const jumpBtn = stage.querySelector('#c8-btn-jump-q2');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          const slider = this.viewEl.querySelector('#c8-slider');
          if (slider) {
            slider.value = '0.35'; // log10(2.2) ~ 0.35
            this.currentLogQ2 = 0.35;
            this.updateView();
          }
        });
      }
      return;
    }

    // Render interactive SVG PDF Chart
    const w = 560;
    const h = 280;
    const padL = 50;
    const padR = 25;
    const padT = 20;
    const padB = 45;

    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // x-range: log scale from 1e-4 to 1.0
    const minLogX = -4.0;
    const maxLogX = 0.0;
    const xToCoord = (x) => {
      const logX = Math.log10(Math.max(1e-4, Math.min(1.0, x)));
      const ratio = (logX - minLogX) / (maxLogX - minLogX);
      return padL + ratio * plotW;
    };

    // y-range: x*f(x) from 0 to 1.0
    const maxY = 1.0;
    const yToCoord = (y) => {
      const clampedY = Math.max(0.0, Math.min(maxY, y));
      return padT + plotH - (clampedY / maxY) * plotH;
    };

    const xGrid = this.activeSlice.xGrid;
    const curves = this.activeSlice.curves;

    const buildPath = (dataArr) => {
      let d = '';
      for (let i = 0; i < xGrid.length; i++) {
        const x = xToCoord(xGrid[i]);
        const y = yToCoord(dataArr[i] || 0.0);
        if (i === 0) d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        else d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return d;
    };

    const pathUv = buildPath(curves.u_v);
    const pathDv = buildPath(curves.d_v);
    const pathUbar = buildPath(curves.u_bar);
    const pathDbar = buildPath(curves.d_bar);
    const pathS = buildPath(curves.s);
    const pathG10 = buildPath(curves.g_div_10);

    // Axes Ticks
    const xTicks = [
      { xVal: 1e-4, label: '10⁻⁴' },
      { xVal: 1e-3, label: '10⁻³' },
      { xVal: 1e-2, label: '10⁻²' },
      { xVal: 1e-1, label: '10⁻¹' },
      { xVal: 1.0, label: '1.0' }
    ];

    let xTicksSvg = '';
    xTicks.forEach(t => {
      const cx = xToCoord(t.xVal);
      xTicksSvg += `
        <line x1="${cx.toFixed(1)}" y1="${padT + plotH}" x2="${cx.toFixed(1)}" y2="${padT + plotH + 5}" stroke="#94a3b8" stroke-width="1.2"></line>
        <text x="${cx.toFixed(1)}" y="${padT + plotH + 18}" font-size="10.5" fill="#94a3b8" text-anchor="middle">${t.label}</text>
      `;
    });

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    let yTicksSvg = '';
    yTicks.forEach(yVal => {
      const cy = yToCoord(yVal);
      yTicksSvg += `
        <line x1="${padL - 5}" y1="${cy.toFixed(1)}" x2="${padL}" y2="${cy.toFixed(1)}" stroke="#94a3b8" stroke-width="1.2"></line>
        <text x="${padL - 8}" y="${(cy + 3.5).toFixed(1)}" font-size="10" fill="#94a3b8" text-anchor="end">${yVal.toFixed(1)}</text>
        ${yVal > 0 ? `<line x1="${padL}" y1="${cy.toFixed(1)}" x2="${padL + plotW}" y2="${cy.toFixed(1)}" stroke="#334155" stroke-dasharray="3,3" stroke-width="0.8"></line>` : ''}
      `;
    });

    stage.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" class="c8-svg-chart">
        <!-- Axes -->
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#64748b" stroke-width="1.5"></line>
        <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#64748b" stroke-width="1.5"></line>
        ${xTicksSvg}
        ${yTicksSvg}

        <!-- Curves -->
        <path d="${pathUv}" fill="none" stroke="#ef4444" stroke-width="2.6" class="c8-curve-path"></path>
        <path d="${pathDv}" fill="none" stroke="#3b82f6" stroke-width="2.6" class="c8-curve-path"></path>
        <path d="${pathUbar}" fill="none" stroke="#ec4899" stroke-width="2.0" stroke-dasharray="5,3" class="c8-curve-path"></path>
        <path d="${pathDbar}" fill="none" stroke="#8b5cf6" stroke-width="2.0" stroke-dasharray="5,3" class="c8-curve-path"></path>
        <path d="${pathS}" fill="none" stroke="#06b6d4" stroke-width="2.0" stroke-dasharray="3,2" class="c8-curve-path"></path>
        <path d="${pathG10}" fill="none" stroke="#eab308" stroke-width="2.8" class="c8-curve-path"></path>

        <!-- Labels -->
        <text x="${padL + plotW / 2}" y="${h - 6}" font-size="11.5" font-weight="700" fill="#cbd5e1" text-anchor="middle">Bjorken x (ভরবেগ ভগ্নাংশ) [লগ স্কেল]</text>
        <text x="${padL - 34}" y="${padT + plotH / 2}" font-size="11.5" font-weight="700" fill="#cbd5e1" text-anchor="middle" transform="rotate(-90 ${padL - 34} ${padT + plotH / 2})">x·f(x, Q²)</text>
      </svg>
    `;
  }

  renderMomentumAndSumRules() {
    const momCard = this.viewEl.querySelector('#c8-momentum-card');
    const auditBar = this.viewEl.querySelector('#c8-sumrules-audit-bar');
    if (!momCard || !auditBar) return;

    if (this.activeSlice.isNonPerturbative) {
      momCard.style.opacity = '0.5';
      auditBar.innerHTML = `
        <div class="c8-audit-pill warn">
          ${ICON_ALERT_SVG}
          <span>Q² < ২ GeV² এ কোয়ান্টাম যোগফল-নিয়ম (Sum Rules) সুনির্দিষ্ট নয়</span>
        </div>
      `;
      return;
    }

    momCard.style.opacity = '1.0';
    const mom = this.activeSlice.momentumFractions;
    const rules = this.activeSlice.sumRules;

    const valPctEl = this.viewEl.querySelector('#c8-val-pct');
    const seaPctEl = this.viewEl.querySelector('#c8-sea-pct');
    const gluonPctEl = this.viewEl.querySelector('#c8-gluon-pct');
    const barVal = this.viewEl.querySelector('#c8-mom-bar-val');
    const barSea = this.viewEl.querySelector('#c8-mom-bar-sea');
    const barGluon = this.viewEl.querySelector('#c8-mom-bar-gluon');

    if (valPctEl) valPctEl.textContent = `${mom.valencePercent}%`;
    if (seaPctEl) seaPctEl.textContent = `${mom.seaPercent}%`;
    if (gluonPctEl) gluonPctEl.textContent = `${mom.gluonPercent}%`;

    if (barVal) barVal.style.width = `${mom.valencePercent}%`;
    if (barSea) barSea.style.width = `${mom.seaPercent}%`;
    if (barGluon) barGluon.style.width = `${mom.gluonPercent}%`;

    // Render Sum Rule Audit Verification
    auditBar.innerHTML = `
      <div class="c8-audit-row">
        <span class="c8-audit-tag">স্বয়ংক্রিয় যাচাই (Sum Rules):</span>
        <span class="c8-rule-item">∫(u - ū) dx = <strong>${rules.int_u_minus_ubar}</strong> ≈ ২</span>
        <span class="c8-rule-item">∫(d - d̄) dx = <strong>${rules.int_d_minus_dbar}</strong> ≈ ১</span>
        <span class="c8-rule-item">∫(s - s̄) dx = <strong>${rules.int_s_minus_sbar}</strong> ≈ ০</span>
        <span class="c8-rule-item">Σ ∫ x f dx = <strong>${rules.momentum_sum}</strong> ≈ ১.০</span>
      </div>
    `;
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      title: 'অধ্যায় ৮: রেজোলিউশন-স্লাইডার ও পার্টন ডিস্ট্রিবিউশন ফাংশন (PDF)',
      tier: 'T2',
      scheme: 'CT18NNLO (3-loop DGLAP QCD Fit)',
      source: 'T.-J. Hou et al., Phys. Rev. D 103, 014013 (2021); CERN LHAPDF',
      content: `
        <h4>১. Bjorken x এর সংজ্ঞা:</h4>
        <p>
          ডিপ ইনইলাস্টিক বিক্ষেপণে (DIS) <strong>x</strong> হলো প্রোটনের মোট আলোর-গতির ভরবেগের সেই ভগ্নাংশ, 
          যা কোনো নির্দিষ্ট কোয়ার্ক বা গ্লুয়ন বহন করে ($0 < x \\le 1$)।
        </p>

        <h4>২. SLAC–MIT আবিষ্কার (১৯৬৮–৬৯):</h4>
        <p>
          বজরকেন স্কেলিং ($F_2(x, Q^2) \\to F_2(x)$) এবং ক্যালান–গ্রস সম্পর্ক ($F_2 = 2x F_1$) প্রমাণ করে 
          যে প্রোটনের ভেতরের বিক্ষেপণকারী কেন্দ্রগুলো হলো বিন্দুসদৃশ স্পিন-১/২ কণা (কোয়ার্ক বা পার্টন)।
        </p>

        <h4>৩. HERA এক্সপেরিমেন্ট (DESY):</h4>
        <p>
          অতিক্ষুদ্র $x$ অঞ্চলে ($x < 10^{-2}$) শক্তি বৃদ্ধির সাথে সাথে গ্লুয়ন ও সী কোয়ার্কের ঘনত্ব তীব্রভাবে বৃদ্ধি পায়। 
          উচ্চ শক্তিতে গ্লুয়ন মোট ভরবেগের প্রায় ৫০%-এরও বেশি বহন করে।
        </p>

        <h4>৪. বৈজ্ঞানিক সতর্কতা (Global Fit - Tier T2):</h4>
        <p>
          কোনো একক পরীক্ষায় কোয়ার্ক বা গ্লুয়ন PDF সরাসরি মাপা যায় না। বিশ্বজুড়ে বিভিন্ন ত্বরকযন্ত্রের হাজার হাজার পরিমাপ 
          একত্রে ৩-লুপ DGLAP সমীকরণ দ্বারা গ্লোবাল ফিট করে এই বক্ররেখাগুলো নির্ণয় করা হয়।
        </p>
      `
    });
  }

  setLevel(level) {
    this.level = level;
  }

  setLanguage(lang) {
    this.lang = lang;
    this.updateView();
  }

  destroy() {
    if (this.viewEl && this.viewEl.parentNode) {
      this.viewEl.parentNode.removeChild(this.viewEl);
    }
  }
}
