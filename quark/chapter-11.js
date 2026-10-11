/**
 * CosmoPlanck Quark Section - Chapter 11: "আদি মহাবিশ্ব ও কোয়ার্ক-গ্লুয়ন প্লাজমা" (QGP)
 * 
 * Scientific Fidelity & Features:
 * 1. Temperature-Time Interactive Slider:
 *    - Transition temperature: T_c = 156.5 +- 1.5 MeV ~ 1.82 x 10^12 K (Lattice QCD: HotQCD 2019 & Wuppertal-Budapest; Tier T2).
 *    - Cosmic epoch: universe age t ~ 10-30 microseconds (~ 10^-5 s).
 *    - Before T_c: deconfined Quark-Gluon Plasma (QGP).
 *    - After T_c: Hadronization Era (confinement into protons, neutrons, pions).
 * 2. Scientific Fidelity on Phase Nature:
 *    - Smooth crossover at zero net baryon density (mu_B ~ 0), not a sharp 1st-order transition (Tier T2).
 * 3. Heavy-Ion Laboratories:
 *    - RHIC (BNL) & LHC (ALICE): "nearly perfect fluid" behavior with minimal shear viscosity eta/s ~ 1/4pi (T1/T2).
 * 4. Speculation Badge:
 *    - Cold dense quark matter in neutron star cores is empirically unknown / speculative.
 * 5. Strictly zero unicode emojis across code and UI.
 */

import {
  getQgpCosmologyData,
  QGP_COSMOLOGY
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c11-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c11-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPARK_SVG = '<svg class="c11-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_FLAME_SVG = '<svg class="c11-icon-badge flame" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c11-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c11-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

export class Chapter11QGP {
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

    this.qgpData = getQgpCosmologyData();
    // Default temperature T = 156.5 MeV (critical point)
    this.currentT_MeV = 156.5;

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-11-view';
    this.viewEl.id = 'chapter-11-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c11-header-section" aria-label="Chapter 11 Header">
        <div class="c11-header-top">
          <div class="c11-title-block">
            <div class="c11-pill-row">
              <span class="c11-chapter-badge">অধ্যায় ১১</span>
              <span class="c11-tier-badge-wrap" id="c11-tier-header"></span>
              <span class="c11-scheme-tag">Lattice QCD (HotQCD 2019)</span>
            </div>
            <h2 class="c11-main-title">আদি মহাবিশ্ব ও কোয়ার্ক-গ্লুয়ন প্লাজমা</h2>
            <p class="c11-subtitle">বিগ ব্যাং-এর প্রথম ২০ মাইক্রোসেকেন্ড, চরম তাপমাত্রা ও কসমিক হ্যাড্রোনাইজেশন</p>
          </div>

          <div class="c11-header-actions">
            <button class="c11-btn-outline" id="c11-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>HotQCD ও RHIC অডিট</span>
            </button>
          </div>
        </div>

        <!-- INTRO HERO CARD -->
        <div class="c11-intro-card">
          <div class="c11-intro-quote-badge">
            ${ICON_FLAME_SVG}
            <span>সংকট তাপমাত্রা: T_c ≈ ১৫৬.৫ MeV (১.৮×১০¹² K) | বয়স: t ≈ ১০–৩০ মাইক্রোসেকেন্ড</span>
          </div>
          <p class="c11-intro-text">
            বিগ ব্যাং-এর ঠিক প্রথম কয়েক মাইক্রোসেকেন্ডে সমগ্র মহাবিশ্বের তাপমাত্রা ছিল ট্রিলিয়ন ডিগ্রিরও বেশি। 
            সেই চরম উষ্ণতায় প্রোটন বা নিউট্রন বলে কিছুর অস্তিত্ব ছিল না — সমস্ত কোয়ার্ক ও গ্লুয়ন মুক্তভাবে এক 
            উত্তপ্ত কোয়ান্টাম সমুদ্রে সাঁতার কাটছিল, যার নাম <strong>কোয়ার্ক-গ্লুয়ন প্লাজমা (QGP)</strong>। 
            মহাবিশ্ব প্রসারিত হয়ে শীতল হতে হতে যখন তাপমাত্রা $T_c \\approx ১৫৬.৫\\text{ MeV}$-এ নেমে আসে, তখন কোয়ার্করা 
            চিরতরে প্রোটন ও নিউট্রনের ভেতর বন্দি হয়ে পড়ে।
          </p>
        </div>
      </section>

      <!-- TEMPERATURE / TIME SLIDER HUD -->
      <section class="c11-controller-section" aria-label="Temperature and Time Slider">
        <div class="c11-ctrl-card">
          <div class="c11-ctrl-top">
            <div class="c11-temp-block">
              <span class="c11-ctrl-label">মহাবিশ্বের তাপমাত্রা T:</span>
              <span class="c11-temp-val" id="c11-temp-val">১৫৬.৫ MeV</span>
              <span class="c11-kelvin-val" id="c11-kelvin-val">(১.৮২ × ১০¹² K)</span>
            </div>
            <div class="c11-time-block">
              <span class="c11-ctrl-label">মহাবিশ্বের বয়স t:</span>
              <span class="c11-time-val" id="c11-time-val">≈ ১৫ মাইক্রোসেকেন্ড (১০⁻⁵ s)</span>
            </div>
            <div class="c11-state-badge" id="c11-state-badge">
              সংকট বিন্দু (T_c Crossover)
            </div>
          </div>

          <div class="c11-slider-wrap">
            <input type="range" class="c11-temp-slider" id="c11-temp-slider" 
                   min="80" max="300" step="1" value="156.5" 
                   aria-label="Universe temperature slider in MeV" />
            
            <div class="c11-slider-ticks">
              <span style="left: 0%;">৮০ MeV<br><small>(হ্যাড্রন যুগ)</small></span>
              <span style="left: 34.8%;" class="crit">T_c = ১৫৬.৫ MeV<br><small>(মসৃণ ক্রসওভার)</small></span>
              <span style="left: 65%;">২২০ MeV<br><small>(QGP প্লাজমা)</small></span>
              <span style="left: 100%;">৩০০ MeV<br><small>(আদি বিগ ব্যাং)</small></span>
            </div>
          </div>
        </div>
      </section>

      <!-- DUAL VISUALIZATION & SCIENTIFIC CARDS SECTION -->
      <section class="c11-main-grid" aria-label="QGP Visual Simulation and Lab Evidence">
        <!-- LEFT: COSMIC PLASMA CANVAS / STAGE -->
        <div class="c11-panel stage-panel">
          <div class="c11-panel-header">
            <h3 class="c11-panel-title">পদার্থের অবস্থা ভিজুয়ালাইজেশন</h3>
            <span class="c11-phase-tag" id="c11-phase-tag">চিরাল ও ডিকনফাইনমেন্ট পর্যায়</span>
          </div>

          <div class="c11-plasma-stage" id="c11-plasma-stage">
            <!-- Dynamic SVG Simulation -->
          </div>

          <div class="c11-phase-summary" id="c11-phase-summary">
            <!-- Dynamic description of current state -->
          </div>
        </div>

        <!-- RIGHT: SCIENTIFIC FACTS & LAB DISCOVERIES -->
        <div class="c11-panel lab-panel">
          <div class="c11-panel-header">
            <h3 class="c11-panel-title">পরীক্ষাগার ও তাত্ত্বিক সত্যতা</h3>
            <span class="c11-source-pill">RHIC (BNL) & LHC ALICE</span>
          </div>

          <div class="c11-cards-stack">
            <!-- Card 1: Smooth Crossover -->
            <div class="c11-card crossover">
              <div class="c11-card-head">
                <span class="c11-card-num">০১</span>
                <h4 class="c11-card-title">মসৃণ ক্রসওভার (Smooth Crossover)</h4>
                <span class="c11-badge-tier">T2: HotQCD</span>
              </div>
              <p class="c11-card-desc">
                শূন্য নেট-ব্যারিয়ন ঘনত্বে ($\mu_B = 0$) QGP থেকে হ্যাড্রনে রূপান্তর কোনো ধারালো বা ল্যাটেন্ট হিটযুক্ত 
                ফার্স্ট-অর্ডার ফেজ ট্রানজিশন নয়; বরং তাপমাত্রা কমার সাথে সাথে চিরাল প্রতিসাম্য ও কনফাইনমেন্টের এক 
                <strong>মসৃণ রূপান্তর (Smooth Crossover)</strong> ঘটে।
              </p>
            </div>

            <!-- Card 2: Nearly Perfect Fluid -->
            <div class="c11-card fluid">
              <div class="c11-card-head">
                <span class="c11-card-num">০২</span>
                <h4 class="c11-card-title">"প্রায় নিখুঁত তরল" (Nearly Perfect Fluid)</h4>
                <span class="c11-badge-tier t1">T1: RHIC / ALICE</span>
              </div>
              <p class="c11-card-desc">
                বিজ্ঞানীদল পূর্বে ধারণা করেছিলেন QGP হয়তো আদর্শ গ্যাসের মতো আচরণ করবে। কিন্তু ব্রুকহ্যাভেন (RHIC) ও 
                CERN (LHC ALICE)-এ গোল্ড ও লেড আয়ন সংঘর্ষে দেখা যায় যে এটি সর্বনিম্ন সান্দ্রতার 
                ($\eta/s \approx 1/4\pi$) এক তীব্র-মিথস্ক্রিয়াকারী প্রায় নিখুঁত তরল (sQGP)!
              </p>
            </div>

            <!-- Card 3: Neutron Star Speculation -->
            <div class="c11-card speculation">
              <div class="c11-card-head">
                <span class="c11-card-num">০৩</span>
                <h4 class="c11-card-title">নিউট্রন তারার কেন্দ্র: অজানা কোয়ার্ক পদার্থ</h4>
                <span class="c11-badge-tier spec">অনুমান / অজানা</span>
              </div>
              <p class="c11-card-desc">
                উচ্চ তাপমাত্রার বিপরীতে, অতি-উচ্চ ঘনত্ব ও শীতল অবস্থায় (উচ্চ $\mu_B$) নিউট্রন তারার অতি-ঘন মজ্জায় 
                কোয়ার্ক পদার্থ বা কালার সুপারকন্ডাক্টিং অবস্থা (CFL) বিদ্যমান কিনা, তা এখনো 
                <strong>পরীক্ষামূলকভাবে অজানা ও অমীমাংসিত</strong>।
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- NAVIGATION FOOTER -->
      <section class="c11-nav-footer" aria-label="Chapter Navigation">
        <div class="c11-nav-actions">
          <a class="c11-nav-btn prev" href="#/quarks/chapter-10" id="c11-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c11-nav-btn-text">
              <span class="c11-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c11-nav-btn-title">অধ্যায় ১০: কীভাবে জানলাম?</span>
            </div>
          </a>

          <div class="c11-nav-summary-box">
            <span class="c11-nav-tag">কসমিক হ্যাড্রোনাইজেশন সম্পন্ন</span>
            <p class="c11-nav-summary-desc">
              মহাবিশ্ব শীতল হয়ে তৈরি করল আজকের সমস্ত দৃশ্যমান পরমাণু ও নিউক্লিয়াস। কিন্তু সেই প্রোটনের স্পিন কীভাবে গঠিত?
            </p>
          </div>

          <a class="c11-nav-btn next" href="#/quarks/chapter-12" id="c11-btn-next">
            <div class="c11-nav-btn-text" style="text-align: right;">
              <span class="c11-nav-btn-sub">পরবর্তী অধ্যায়</span>
              <span class="c11-nav-btn-title">অধ্যায় ১২: প্রোটনের spin ধাঁধা</span>
            </div>
            ${ICON_ARROW_RIGHT_SVG}
          </a>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTier = this.viewEl.querySelector('#c11-tier-header');
    if (headerTier) {
      headerTier.appendChild(createTierBadge('T2', { lang: this.lang }));
      headerTier.appendChild(createTierBadge('T1', { lang: this.lang }));
    }

    // Bind Info Drawer
    this.viewEl.querySelector('#c11-btn-info').addEventListener('click', () => this.openInfoDrawer());

    // Bind Temperature Slider
    const slider = this.viewEl.querySelector('#c11-temp-slider');
    slider.addEventListener('input', (e) => {
      this.currentT_MeV = parseFloat(e.target.value);
      this.updateView();
    });

    this.updateView();
  }

  updateView() {
    const T = this.currentT_MeV;
    const Tc = 156.5;

    // Estimate Kelvin and Universe time
    const kelvin = (T * 1e6 * 1.60218e-19) / 1.380649e-23;
    // Cosmic time roughly scales as t ~ 1 / T^2
    const timeMicroseconds = 15.0 * Math.pow(Tc / T, 2);

    const tempVal = this.viewEl.querySelector('#c11-temp-val');
    const kelvinVal = this.viewEl.querySelector('#c11-kelvin-val');
    const timeVal = this.viewEl.querySelector('#c11-time-val');
    const badge = this.viewEl.querySelector('#c11-state-badge');

    if (tempVal) tempVal.textContent = `${T.toFixed(1)} MeV`;
    if (kelvinVal) kelvinVal.textContent = `(${kelvin.toExponential(2)} K)`;
    if (timeVal) {
      timeVal.textContent = timeMicroseconds < 1000
        ? `≈ ${timeMicroseconds.toFixed(1)} মাইক্রোসেকেন্ড`
        : `≈ ${(timeMicroseconds / 1000).toFixed(2)} মিলিসেকেন্ড`;
    }

    if (badge) {
      if (Math.abs(T - Tc) <= 4.0) {
        badge.className = 'c11-state-badge critical';
        badge.textContent = 'সংকট বিন্দু (T_c Crossover)';
      } else if (T > Tc) {
        badge.className = 'c11-state-badge qgp';
        badge.textContent = 'ডিকনফাইনড প্লাজমা (QGP Era)';
      } else {
        badge.className = 'c11-state-badge hadron';
        badge.textContent = 'হ্যাড্রন যুগ (Hadron Era)';
      }
    }

    this.renderPlasmaStage();
  }

  renderPlasmaStage() {
    const stage = this.viewEl.querySelector('#c11-plasma-stage');
    const desc = this.viewEl.querySelector('#c11-phase-summary');
    if (!stage) return;

    const T = this.currentT_MeV;
    const Tc = 156.5;
    const isQGP = T > Tc + 4;
    const isHadron = T < Tc - 4;

    const w = 480;
    const h = 260;

    if (isQGP) {
      // QGP Soup: Quarks and Gluons freely floating, colorful swirling soup
      let particlesSvg = '';
      const numQuarks = Math.min(36, Math.floor(18 + (T - Tc) * 0.12));
      const colors = ['#ef4444', '#22c55e', '#3b82f6', '#06b6d4', '#ec4899', '#eab308'];

      for (let i = 0; i < numQuarks; i++) {
        const x = 30 + ((i * 47) % (w - 60));
        const y = 30 + ((i * 31) % (h - 60));
        const col = colors[i % colors.length];
        const isGluon = i % 3 === 0;

        if (isGluon) {
          particlesSvg += `<circle cx="${x}" cy="${y}" r="4" fill="#eab308" opacity="0.85"></circle>`;
        } else {
          particlesSvg += `<circle cx="${x}" cy="${y}" r="6.5" fill="${col}" stroke="#ffffff" stroke-width="1.2" opacity="0.9"></circle>`;
        }
      }

      stage.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="c11-stage-svg qgp-active">
          <rect width="${w}" height="${h}" rx="12" fill="#180c05"></rect>
          <g filter="blur(20px)" opacity="0.4">
            <circle cx="160" cy="130" r="100" fill="#f97316"></circle>
            <circle cx="320" cy="110" r="90" fill="#ef4444"></circle>
          </g>
          ${particlesSvg}
        </svg>
      `;

      if (desc) {
        desc.innerHTML = `
          <div class="c11-desc-box qgp">
            <strong>উত্তপ্ত প্লাজমা পর্যায় (T > T_c):</strong>
            <p>কালার কনফাইনমেন্ট সম্পূর্ণ বিলুপ্ত। কোয়ার্ক ও গ্লুয়নরা স্বাধীনভাবে প্রায় নিখুঁত তরল (sQGP) হিসেবে বিচরণ করছে। চিরাল প্রতিসাম্য পুনঃপ্রতিষ্ঠিত।</p>
          </div>
        `;
      }
    } else if (isHadron) {
      // Hadronic Gas: Quarks bound in triplets (protons/neutrons) and pairs (pions)
      stage.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="c11-stage-svg hadron-active">
          <rect width="${w}" height="${h}" rx="12" fill="#090d16"></rect>

          <!-- Bound Proton 1 -->
          <g transform="translate(110, 80)">
            <circle cx="0" cy="0" r="32" fill="rgba(59, 130, 246, 0.15)" stroke="#60a5fa" stroke-width="1.5"></circle>
            <circle cx="-10" cy="-8" r="6" fill="#ef4444"></circle>
            <circle cx="10" cy="-8" r="6" fill="#22c55e"></circle>
            <circle cx="0" cy="12" r="6" fill="#3b82f6"></circle>
            <text x="0" y="44" font-size="11" font-weight="700" fill="#93c5fd" text-anchor="middle">প্রোটন p (uud)</text>
          </g>

          <!-- Bound Neutron 1 -->
          <g transform="translate(250, 90)">
            <circle cx="0" cy="0" r="32" fill="rgba(34, 197, 94, 0.15)" stroke="#4ade80" stroke-width="1.5"></circle>
            <circle cx="-10" cy="-8" r="6" fill="#ef4444"></circle>
            <circle cx="10" cy="-8" r="6" fill="#3b82f6"></circle>
            <circle cx="0" cy="12" r="6" fill="#3b82f6"></circle>
            <text x="0" y="44" font-size="11" font-weight="700" fill="#86efac" text-anchor="middle">নিউট্রন n (udd)</text>
          </g>

          <!-- Bound Pion 1 -->
          <g transform="translate(380, 150)">
            <ellipse cx="0" cy="0" rx="26" ry="18" fill="rgba(236, 72, 153, 0.15)" stroke="#f472b6" stroke-width="1.5"></ellipse>
            <circle cx="-10" cy="0" r="5.5" fill="#ef4444"></circle>
            <circle cx="10" cy="0" r="5.5" fill="#06b6d4"></circle>
            <text x="0" y="32" font-size="10.5" font-weight="700" fill="#fbcfe8" text-anchor="middle">পায়ন π (ud̄)</text>
          </g>

          <!-- Bound Proton 2 -->
          <g transform="translate(180, 190)">
            <circle cx="0" cy="0" r="28" fill="rgba(59, 130, 246, 0.15)" stroke="#60a5fa" stroke-width="1.5"></circle>
            <circle cx="-8" cy="-6" r="5" fill="#ef4444"></circle>
            <circle cx="8" cy="-6" r="5" fill="#22c55e"></circle>
            <circle cx="0" cy="10" r="5" fill="#3b82f6"></circle>
            <text x="0" y="40" font-size="10.5" font-weight="700" fill="#93c5fd" text-anchor="middle">প্রোটন p</text>
          </g>
        </svg>
      `;

      if (desc) {
        desc.innerHTML = `
          <div class="c11-desc-box hadron">
            <strong>হ্যাড্রন পর্যায় (T < T_c):</strong>
            <p>কনফাইনমেন্ট বল প্রবল হওয়ায় সমস্ত মুক্ত কালার চার্জ ধ্বংস হয়ে গেছে। কোয়ার্করা এখন ৩টি করে বা জোড়ায় জোড়ায় আবদ্ধ হয়ে প্রোটন, নিউট্রন ও মেসন তৈরি করেছে।</p>
          </div>
        `;
      }
    } else {
      // Transition Crossover State: Fluctuating clusters forming and dissolving
      stage.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="c11-stage-svg crossover-active">
          <rect width="${w}" height="${h}" rx="12" fill="#130e14"></rect>
          <g filter="blur(16px)" opacity="0.35">
            <circle cx="200" cy="120" r="90" fill="#a855f7"></circle>
          </g>
          <text x="${w / 2}" y="110" font-size="16" font-weight="800" fill="#e9d5ff" text-anchor="middle">T_c ≈ ১৫৬.৫ MeV (মসৃণ ক্রসওভার)</text>
          <text x="${w / 2}" y="140" font-size="12" fill="#cbd5e1" text-anchor="middle">কোয়ার্ক-গ্লুয়ন প্লাজমা থেকে হ্যাড্রন গ্যাসে অবিচ্ছিন্ন রূপান্তর</text>
        </svg>
      `;

      if (desc) {
        desc.innerHTML = `
          <div class="c11-desc-box crossover">
            <strong>সংকট তাপমাত্রা (T ≈ T_c):</strong>
            <p>HotQCD ল্যাটিস সমীকরণ অনুযায়ী এটি কোনো ধারালো স্ফটিকীকরণ নয়, বরং মসৃণ ক্রসওভার যেখানে হ্যাড্রন ক্লাস্টার তৈরি ও ভাঙার ভারসাম্য ঘটছে।</p>
          </div>
        `;
      }
    }
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      title: 'অধ্যায় ১১: আদি মহাবিশ্ব ও কোয়ার্ক-গ্লুয়ন প্লাজমা (QGP)',
      tier: 'T2',
      scheme: 'Lattice QCD (HotQCD 2019 & Wuppertal-Budapest)',
      source: 'Bazavov et al., Phys. Lett. B 795 (2019) 15; Borsanyi et al., JHEP 1009 (2010) 073',
      content: `
        <h4>১. সংকট তাপমাত্রা T_c:</h4>
        <p>
          ল্যাটিস QCD-র আধুনিকতম গণনা (HotQCD 2019) অনুসারে ট্রানজিশন তাপমাত্রা $T_c = 156.5 \\pm 1.5\\text{ MeV}$ ($1.82 \\times 10^{12}\\text{ K}$)। 
          চিরাল সংবেদনশীলতা (chiral susceptibility) এই তাপমাত্রায় সর্বোচ্চ চূড়ায় পৌঁছায়।
        </p>

        <h4>২. কসমিক টাইমলাইন (বিগ ব্যাং-এর পর):</h4>
        <p>
          মহাবিশ্বের বিস্তার ও ফ্রিডম্যান সমীকরণ প্রয়োগ করে দেখা যায়, মহাবিশ্বের বয়স যখন প্রায় ১০ থেকে ৩০ মাইক্রোসেকেন্ড ছিল, 
          তখন তাপমাত্রা নেমে এসে কসমিক হ্যাড্রোনাইজেশন সম্পন্ন হয়।
        </p>

        <h4>৩. ল্যাবরেটরি পরীক্ষা (RHIC ও ALICE):</h4>
        <p>
          ব্রুকহ্যাভেনের RHIC ত্বরকযন্ত্র এবং সার্নের LHC (ALICE)-এ ভারী সোনার বা সীসার নিউক্লিয়াসকে আলোর গতির ৯৯.৯৯৯%-এ মুখোমুখি 
          সংঘর্ষ ঘটিয়ে পরীক্ষাগারে ক্ষুদ্রাতিক্ষুদ্র QGP তৈরি করা হয়েছে।
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
