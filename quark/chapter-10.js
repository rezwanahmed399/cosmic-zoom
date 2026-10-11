/**
 * CosmoPlanck Quark Section - Chapter 10: "কীভাবে জানলাম?" (Evidence Lab / How Do We Know?)
 * 
 * Scientific Fidelity & Features:
 * 1. R-Ratio Staircase SVG Chart:
 *    - R(sqrt(s)) = sigma(e+e- -> hadrons) / sigma(e+e- -> mu+mu-) = N_c * sum(e_q^2).
 *    - Theoretical step line (T3):
 *      - u, d, s (< 3.7 GeV): R = 2
 *      - +c (3.7 - 10.5 GeV): R = 10/3 (3.33)
 *      - +b (> 10.5 GeV): R = 11/3 (3.67)
 *    - Pedagogical Color Toggle: compares N_c = 3 (real nature) with N_c = 1 (2/3, 10/9, 11/9).
 *      Step height directly proves N_c = 3 and fractional quark charges!
 *    - Resonance spikes: rho (775 MeV), omega (782 MeV), phi (1020 MeV), J/psi (3097 MeV), psi(2S) (3686 MeV), Upsilon (9460 MeV).
 *    - Measured PDG experimental data points (T1) with vertical error bars.
 * 2. Five Comprehensive Evidence Cards:
 *    - 1. DIS scaling (SLAC 1968–69; Nobel 1990) -> Point-like partons/quarks.
 *    - 2. Two-jet angular distribution 1 + cos^2(theta) (SLAC SPEAR 1975) -> Spin-1/2 quarks.
 *    - 3. Three-jet planar events (PETRA, DESY 1979) -> Direct gluon discovery.
 *    - 4. Delta++ puzzle (Greenberg 1964; Han-Nambu 1965) -> Pauli exclusion necessitates SU(3) color.
 *    - 5. Ab initio Lattice QCD light hadron mass spectrum (BMW Collaboration, Science 322, 1224, 2008).
 * 3. Strictly zero unicode emojis across all code and UI.
 */

import {
  getEvidenceLabData,
  getRRatioTheory
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c10-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c10-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPARK_SVG = '<svg class="c10-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c10-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c10-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_CHECK_SVG = '<svg class="c10-icon-badge ok" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_MEDAL_SVG = '<svg class="c10-icon-badge gold" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>';

export class Chapter10EvidenceLab {
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

    // Load scientifically verified data from factsheet
    this.evidenceData = getEvidenceLabData();
    this.showNc1Comparison = false; // toggle for Nc=1 comparison line
    this.selectedResonanceId = null;
    this.selectedCardId = 'dis_scaling';

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-10-view';
    this.viewEl.id = 'chapter-10-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c10-header-section" aria-label="Chapter 10 Header">
        <div class="c10-header-top">
          <div class="c10-title-block">
            <div class="c10-pill-row">
              <span class="c10-chapter-badge">অধ্যায় ১০</span>
              <span class="c10-tier-badge-wrap" id="c10-tier-header"></span>
              <span class="c10-scheme-tag">Experimental Precision Lab</span>
            </div>
            <h2 class="c10-main-title">কীভাবে জানলাম? (প্রমাণ-ল্যাব)</h2>
            <p class="c10-subtitle">কোয়ার্কের অস্তিত্ব, কালার ট্রিপলেট N_c = ৩ এবং গ্লুয়নের ৫টি ঐতিহাসিক বৈজ্ঞানিক প্রমাণ</p>
          </div>

          <div class="c10-header-actions">
            <button class="c10-btn-outline" id="c10-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>ঐতিহাসিক পরীক্ষা অডিট</span>
            </button>
          </div>
        </div>

        <!-- INTRO HERO CARD -->
        <div class="c10-intro-card">
          <p class="c10-intro-text">
            যেহেতু কোনো কোয়ার্ক বা গ্লুয়নকে কখনোই খালি চোখে বা মুক্ত অবস্থায় দেখা যায় না, তবে বিজ্ঞানীরা কীভাবে 
            এত নিশ্চিত হলেন যে তাদের ভগ্নাংশ চার্জ ($+2/3, -1/3$), ঠিক ৩টি কালার চার্জ ($N_c = 3$) এবং স্পিন-১/২ রয়েছে? 
            উচ্চ-শক্তির ইলেকট্রন ও পজিট্রন সংঘর্ষে সংগৃহীত পাঁচটি যুগান্তকারী বৈজ্ঞানিক আবিষ্কার এবং বিখ্যাত 
            <strong>R-ratio সিঁড়ি</strong> নিচে অন্বেষণ করুন।
          </p>
        </div>
      </section>

      <!-- R-RATIO STAIRCASE SECTION -->
      <section class="c10-rratio-section" aria-label="R-Ratio Staircase Section">
        <div class="c10-rratio-panel">
          <div class="c10-rratio-header">
            <div class="c10-rratio-title-wrap">
              <h3 class="c10-rratio-title">R-ratio সিঁড়ি: কালার সংখ্যা N_c = ৩ এর প্রত্যক্ষ প্রমাণ</h3>
              <span class="c10-formula-tag">R(&radic;s) = &sigma;(e⁺e⁻ &rarr; hadrons) / &sigma;(e⁺e⁻ &rarr; &mu;⁺&mu;⁻) &approx; N_c &Sigma; e_q²</span>
            </div>

            <!-- CONTROLS & TOGGLES -->
            <div class="c10-rratio-controls">
              <label class="c10-nc-toggle-label" for="c10-nc-toggle">
                <input type="checkbox" id="c10-nc-toggle" class="c10-nc-checkbox" />
                <span class="c10-toggle-switch"></span>
                <span class="c10-toggle-text">কালারহীন তুলনা (N_c = ১ কল্পনা)</span>
              </label>
            </div>
          </div>

          <div class="c10-rratio-legend">
            <div class="c10-legend-item">
              <span class="c10-legend-line nc3-line"></span>
              <span class="c10-legend-txt">তাত্ত্বিক ধাপ N_c = ৩ (T3)</span>
            </div>
            <div class="c10-legend-item">
              <span class="c10-legend-dot pdg-r-dot"></span>
              <span class="c10-legend-txt">PDG পরিমাপ (T1)</span>
            </div>
            <div class="c10-legend-item">
              <span class="c10-legend-line res-peak-line"></span>
              <span class="c10-legend-txt">রেজোন্যান্স চূড়া (ρ, ω, φ, J/ψ, Υ)</span>
            </div>
            <div class="c10-legend-item nc1-legend" id="c10-nc1-legend" style="display: none;">
              <span class="c10-legend-line nc1-line"></span>
              <span class="c10-legend-txt">কালারহীন N_c = ১ (প্রত্যাখ্যাত)</span>
            </div>
          </div>

          <!-- DYNAMIC SVG R-RATIO CHART -->
          <div class="c10-rratio-svg-wrap" id="c10-rratio-svg-wrap">
            <!-- Rendered by renderRRatioChart() -->
          </div>

          <!-- TEACHING BANNER: COLOR LESSON -->
          <div class="c10-color-lesson-banner">
            <div class="c10-lesson-badge">${ICON_CHECK_SVG}</div>
            <div class="c10-lesson-content">
              <h4 class="c10-lesson-title">শিক্ষা: ধাপের উচ্চতাই কালার N_c = ৩ ও ভগ্নাংশ চার্জের প্রমাণ</h4>
              <p class="c10-lesson-text">
                ইলেকট্রন ও পজিট্রন সংঘর্ষে কোয়ার্ক জোড় তৈরির হার তাদের চার্জের বর্গের গুণফল এবং মোট কালারের সংখ্যার ($N_c$) সমানুপাতিক। 
                যদি কোয়ার্কের কোনো কালার না থাকত ($N_c = 1$), তবে ধাপের উচ্চতা হতো মাত্র <strong>২/৩ (০.৬৭)</strong>, 
                <strong>১০/৯ (১.১১)</strong>, এবং <strong>১১/৯ (১.২২)</strong>। কিন্তু পরীক্ষাগারে ধাপের উচ্চতা 
                ঠিক <strong>২</strong>, <strong>১০/৩ (৩.৩৩)</strong>, এবং <strong>১১/৩ (৩.৬৭)</strong>! 
                এই ৩ গুণ উচ্চতা অকাট্যভাবে প্রমাণ করে প্রতিটি কোয়ার্ক ঠিক ৩টি রঙে (লাল, সবুজ, নীল) বিদ্যমান!
              </p>
            </div>
          </div>

          <!-- RESONANCE DETAILS MODAL CARD (IF CLICKED) -->
          <div class="c10-resonance-detail-card" id="c10-resonance-detail-card" style="display: none;">
            <!-- Dynamically populated when resonance is clicked -->
          </div>
        </div>
      </section>

      <!-- FIVE HISTORICAL EVIDENCE CARDS GALLERY -->
      <section class="c10-evidence-section" aria-label="Five Historical Evidence Cards">
        <div class="c10-section-header">
          <div class="c10-section-title-wrap">
            <span class="c10-section-pill">ঐতিহাসিক মাইলফলক</span>
            <h3 class="c10-section-title">কোয়ার্ক ও গ্লুয়ন আবিষ্কারের ৫টি অকাট্য প্রমাণ-কার্ড</h3>
            <p class="c10-section-desc">যেকোনো কার্ডে ক্লিক করে বিস্তারিত পরীক্ষা, ডিটেক্টর সেটআপ ও তাত্ত্বিক তাৎপর্য দেখুন:</p>
          </div>
        </div>

        <div class="c10-evidence-grid">
          <!-- 1. DIS SCALING -->
          <div class="c10-evidence-card active" id="card-dis_scaling" data-card="dis_scaling" tabindex="0" role="button">
            <div class="c10-card-top">
              <span class="c10-card-num">০১</span>
              <span class="c10-card-badge nobel">${ICON_MEDAL_SVG} নোবেল ১৯৯০</span>
            </div>
            <h4 class="c10-card-title">DIS Scaling ও পার্টনের আবিষ্কার</h4>
            <div class="c10-card-meta">SLAC (১৯৬৮–১৯৬৯) | ইলেকট্রন-প্রোটন বিক্ষেপণ</div>
            <p class="c10-card-summary">
              প্রোটনের ওপর অত্যন্ত উচ্চশক্তির ইলেকট্রন ছুড়ে দেখা যায় ইলেকট্রনগুলো অস্বাভাবিক বড় কোণে ছিটকে যাচ্ছে। 
              বজরকেন স্কেলিং ($F_2(x, Q^2)$) প্রমাণ করে প্রোটন কোনো নরম বল নয় — ভেতরে বিন্দুসদৃশ চার্জিত "পার্টন" (কোয়ার্ক) রয়েছে।
            </p>
            <div class="c10-card-proof">
              <strong>প্রমাণ:</strong> বিন্দুসদৃশ অভ্যন্তরীণ গঠন ($< 10^{-18}\text{ m}$)।
            </div>
          </div>

          <!-- 2. TWO-JET ANGULAR DISTRIBUTION -->
          <div class="c10-evidence-card" id="card-two_jet_spin" data-card="two_jet_spin" tabindex="0" role="button">
            <div class="c10-card-top">
              <span class="c10-card-num">০২</span>
              <span class="c10-card-badge meas">T1 পরিমাপ</span>
            </div>
            <h4 class="c10-card-title">দুই-জেট কোণবণ্টন: স্পিন-১/২ কোয়ার্ক</h4>
            <div class="c10-card-meta">SLAC SPEAR (১৯৭৫) | Mark I ডিটেক্টর</div>
            <p class="c10-card-summary">
              $e^+e^- \to q\bar{q}$ প্রক্রিয়ায় সৃষ্ট দুটি বিরোধী কণা-জেটের কৌণিক বণ্টন ঠিক $1 + \cos^2\theta$ সূত্র মেনে চলে। 
              কোয়ার্ক যদি স্পিন-০ বোসন হতো, তবে বণ্টন হতো $\sin^2\theta$। এটি প্রমাণ করে কোয়ার্ক স্পিন-১/২ ফার্মিয়ন।
            </p>
            <div class="c10-card-proof">
              <strong>প্রমাণ:</strong> কোয়ার্কের নিজস্ব স্পিন ঠিক ১/২ (Fermion)।
            </div>
          </div>

          <!-- 3. THREE-JET GLUON DISCOVERY -->
          <div class="c10-evidence-card" id="card-three_jet_gluon" data-card="three_jet_gluon" tabindex="0" role="button">
            <div class="c10-card-top">
              <span class="c10-card-num">০৩</span>
              <span class="c10-card-badge disc">ঐতিহাসিক আবিষ্কার</span>
            </div>
            <h4 class="c10-card-title">তিন-জেটে গ্লুয়নের প্রথম প্রত্যক্ষ প্রমাণ</h4>
            <div class="c10-card-meta">PETRA, DESY (১৯৭৯) | TASSO, JADE, MARK-J</div>
            <p class="c10-card-summary">
              ইলেকট্রন-পজিট্রন সংঘর্ষে সাধারণ দুটি জেটের পাশাপাশি কিছু বিশেষ ইভেন্টে একই সমতলে ৩টি পৃথক জেট দেখা যায় ($e^+e^- \to q\bar{q}g$)। 
              তৃতীয় সমতলীয় প্ল্যানার জেটটি ছিল নির্গত হার্ড গ্লুয়নের প্রত্যক্ষ স্বাক্ষর!
            </p>
            <div class="c10-card-proof">
              <strong>প্রমাণ:</strong> সবল বলের ভরহীন ভেক্টর বলবাহক "গ্লুয়ন"-এর অস্তিত্ব।
            </div>
          </div>

          <!-- 4. DELTA++ PUZZLE & COLOR -->
          <div class="c10-evidence-card" id="card-delta_puzzle" data-card="delta_puzzle" tabindex="0" role="button">
            <div class="c10-card-top">
              <span class="c10-card-num">০৪</span>
              <span class="c10-card-badge theo">তাত্ত্বিক আবশ্যকতা (T2)</span>
            </div>
            <h4 class="c10-card-title">Delta++ ধাঁধা ও ৩টি কালার চার্জ</h4>
            <div class="c10-card-meta">গ্রিনবার্গ (১৯৬৪) | হান ও নাম্বু (১৯৬৫)</div>
            <p class="c10-card-summary">
              Δ⁺⁺ ব্যারিয়নের গঠন uuu এবং স্পিন J = 3/2 (তিনটি স্পিনই সমান্তরাল ↑↑↑)। 
              স্থানিক তরঙ্গফাংশন, ফ্লেভার ও স্পিন সবই প্রতিসম! পাউলির অপবর্জন নীতি অনুযায়ী সার্বিক তরঙ্গফাংশন অবশ্যই অ্যান্টিসিমেট্রিক হতে হবে।
            </p>
            <div class="c10-card-proof">
              <strong>প্রমাণ:</strong> ৩টি ভিন্ন কালার চার্জ (r, g, b) আবশ্যক।
            </div>
          </div>

          <!-- 5. AB INITIO LATTICE QCD -->
          <div class="c10-evidence-card" id="card-lattice_masses" data-card="lattice_masses" tabindex="0" role="button">
            <div class="c10-card-top">
              <span class="c10-card-num">০৫</span>
              <span class="c10-card-badge lqcd">Science ২০০৮</span>
            </div>
            <h4 class="c10-card-title">ল্যাটিস QCD: শূন্য থেকে হ্যাড্রন ভর</h4>
            <div class="c10-card-meta">BMW Collaboration | Science 322, 1224 (2008)</div>
            <p class="c10-card-summary">
              কোনো মুক্ত প্যারামিটার ফিট না করে (ab initio), সুপারকম্পিউটারে স্থান-কাল ল্যাটিসে QCD সমীকরণ সমাধান করে 
              প্রোটন, নিউট্রন ও অন্যান্য হ্যাড্রনের ভর কয়েক শতাংশ নির্ভুলতায় গণনা করা হয়।
            </p>
            <div class="c10-card-proof">
              <strong>প্রমাণ:</strong> QCD সমীকরণই প্রোটন ও পরমাণুর মূল ভরের উৎস।
            </div>
          </div>
        </div>

        <!-- SELECTED CARD DEEP-DIVE MODAL / DISPLAY -->
        <div class="c10-evidence-inspector" id="c10-evidence-inspector">
          <!-- Dynamically populated by renderSelectedCardDetails() -->
        </div>
      </section>

      <!-- NAVIGATION CONTINUITY HUD -->
      <section class="c10-nav-footer" aria-label="Chapter Navigation">
        <div class="c10-nav-footer-inner">
          <a class="c10-nav-btn prev" href="#/quarks/chapter-9" id="c10-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c10-nav-btn-text">
              <span class="c10-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c10-nav-btn-title">অধ্যায় ৯: Asymptotic freedom</span>
            </div>
          </a>

          <div class="c10-nav-summary-box">
            <span class="c10-nav-tag">কোয়ার্ক ও হ্যাড্রন ভ্রমণ সম্পন্ন</span>
            <p class="c10-nav-summary-desc">
              স্কেল-সিঁড়ি (০) থেকে শুরু করে প্রোটন, ফ্লেভার, কালার, ফ্লাক্স টিউব, স্ট্রিং ভাঙা, হ্যাড্রন বিল্ডার, ভর বিভাজন, 
              অ্যাসিম্পটোটিক ফ্রিডম এবং প্রমাণ-ল্যাব পর্যন্ত সমস্ত বৈজ্ঞানিক অধ্যায় সম্পন্ন হয়েছে।
            </p>
          </div>

          <a class="c10-nav-btn next home" href="#/quarks/chapter-0" id="c10-btn-home">
            <div class="c10-nav-btn-text" style="text-align: right;">
              <span class="c10-nav-btn-sub">শুরুতে ফিরুন</span>
              <span class="c10-nav-btn-title">অধ্যায় ০: স্কেল-সিঁড়ি</span>
            </div>
            ${ICON_ARROW_RIGHT_SVG}
          </a>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTier = this.viewEl.querySelector('#c10-tier-header');
    if (headerTier) {
      headerTier.appendChild(createTierBadge('T1', { lang: this.lang }));
      headerTier.appendChild(createTierBadge('T3', { lang: this.lang }));
    }

    // Bind Info Drawer
    this.viewEl.querySelector('#c10-btn-info').addEventListener('click', () => this.openInfoDrawer());

    // Bind Nc=1 comparison toggle
    const toggle = this.viewEl.querySelector('#c10-nc-toggle');
    toggle.addEventListener('change', (e) => {
      this.showNc1Comparison = e.target.checked;
      const nc1Leg = this.viewEl.querySelector('#c10-nc1-legend');
      if (nc1Leg) nc1Leg.style.display = this.showNc1Comparison ? 'flex' : 'none';
      this.renderRRatioChart();
    });

    // Bind Evidence Cards click
    const cards = this.viewEl.querySelectorAll('.c10-evidence-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const cardId = e.currentTarget.getAttribute('data-card');
        this.selectEvidenceCard(cardId);
      });
    });

    this.renderRRatioChart();
    this.renderSelectedCardDetails();
  }

  renderRRatioChart() {
    const wrap = this.viewEl.querySelector('#c10-rratio-svg-wrap');
    if (!wrap) return;

    // SVG coordinate space
    const width = 840;
    const height = 380;
    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 50;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Log-scale for sqrt(s) from 0.6 GeV to 40.0 GeV
    const minS = 0.6;
    const maxS = 40.0;
    // Linear scale for R from 0 to 6.0 (peaks reach ~5)
    const minR = 0.0;
    const maxR = 6.0;

    const sToX = (s) => {
      const clamped = Math.max(minS, Math.min(maxS, s));
      const logRatio = (Math.log10(clamped) - Math.log10(minS)) / (Math.log10(maxS) - Math.log10(minS));
      return padLeft + logRatio * plotW;
    };

    const rToY = (r) => {
      const clamped = Math.max(minR, Math.min(maxR, r));
      const ratio = (clamped - minR) / (maxR - minR);
      return padTop + plotH - ratio * plotH;
    };

    // 1. Grid & Ticks
    const sTicks = [0.8, 1.0, 2.0, 3.0, 5.0, 10.0, 20.0, 30.0, 40.0];
    const rTicks = [1.0, 2.0, 3.0, 4.0, 5.0];

    let gridLinesSvg = '';
    let xLabelsSvg = '';
    sTicks.forEach(s => {
      const x = sToX(s);
      gridLinesSvg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + plotH}" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1" />`;
      xLabelsSvg += `<text x="${x}" y="${padTop + plotH + 20}" font-size="11" font-family="'JetBrains Mono', monospace" fill="#94a3b8" text-anchor="middle">${s}</text>`;
    });

    let yLabelsSvg = '';
    rTicks.forEach(r => {
      const y = rToY(r);
      gridLinesSvg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + plotW}" y2="${y}" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1" />`;
      yLabelsSvg += `<text x="${padLeft - 10}" y="${y + 4}" font-size="11" font-family="'JetBrains Mono', monospace" fill="#94a3b8" text-anchor="end">${r.toFixed(1)}</text>`;
    });

    // 2. Theoretical Staircase Steps for Nc = 3 (T3)
    // Step 1: 0.6 to 3.7 GeV -> R = 2.0
    // Step 2: 3.7 to 10.5 GeV -> R = 3.333
    // Step 3: 10.5 to 40.0 GeV -> R = 3.667
    const x0 = sToX(minS);
    const xCharm = sToX(3.7);
    const xBottom = sToX(10.5);
    const xEnd = sToX(maxS);

    const yStep1 = rToY(2.0);
    const yStep2 = rToY(3.333);
    const yStep3 = rToY(3.667);

    const nc3StepPath = `
      M ${x0} ${yStep1}
      L ${xCharm} ${yStep1}
      L ${xCharm} ${yStep2}
      L ${xBottom} ${yStep2}
      L ${xBottom} ${yStep3}
      L ${xEnd} ${yStep3}
    `;

    // Hypothetical Nc = 1 Steps:
    // Step 1: R = 2/3 ≈ 0.667
    // Step 2: R = 10/9 ≈ 1.111
    // Step 3: R = 11/9 ≈ 1.222
    const yNc1_1 = rToY(0.667);
    const yNc1_2 = rToY(1.111);
    const yNc1_3 = rToY(1.222);

    const nc1StepPath = `
      M ${x0} ${yNc1_1}
      L ${xCharm} ${yNc1_1}
      L ${xCharm} ${yNc1_2}
      L ${xBottom} ${yNc1_2}
      L ${xBottom} ${yNc1_3}
      L ${xEnd} ${yNc1_3}
    `;

    // 3. Resonance Spikes
    const resonances = this.evidenceData.rRatio.resonances;
    const resonancePeakHeight = {
      rho: 4.8,
      omega: 3.8,
      phi: 3.9,
      'J/psi': 5.6,
      'psi(2S)': 4.6,
      Upsilon: 5.2
    };

    const resonancesSvg = resonances.map(res => {
      const x = sToX(res.massGeV);
      const baseR = getRRatioTheory(res.massGeV);
      const baseY = rToY(baseR);
      const peakY = rToY(resonancePeakHeight[res.symbol] || 4.5);
      const isSelected = this.selectedResonanceId === res.symbol;

      return `
        <g class="c10-resonance-spike-group ${isSelected ? 'selected' : ''}" 
           id="res-spike-${res.symbol}" 
           data-symbol="${res.symbol}" 
           tabindex="0" 
           role="button" 
           aria-label="Resonance ${res.name}: Mass=${res.massGeV} GeV">
          <!-- Resonance vertical peak line -->
          <line x1="${x}" y1="${baseY}" x2="${x}" y2="${peakY}" stroke="#ec4899" stroke-width="2.5" />
          <!-- Peak head triangle -->
          <polygon points="${x-4},${peakY+6} ${x+4},${peakY+6} ${x},${peakY}" fill="#ec4899" />
          <circle cx="${x}" cy="${peakY}" r="4" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5" />
          <!-- Label -->
          <text x="${x}" y="${peakY - 6}" font-size="10.5" font-family="'JetBrains Mono', monospace" font-weight="700" fill="#f43f5e" text-anchor="middle">${res.symbol}</text>
        </g>
      `;
    }).join('');

    // 4. PDG Experimental Measured Points
    const pdgPoints = this.evidenceData.rRatio.pdgMeasuredPoints;
    const pdgPointsSvg = pdgPoints.map(p => {
      const x = sToX(p.sqrt_s);
      const y = rToY(p.R);
      const yTop = rToY(p.R + p.uncertainty);
      const yBot = rToY(p.R - p.uncertainty);

      return `
        <g class="c10-pdg-r-point" tabindex="0" role="button" aria-label="Measured R=${p.R} at sqrt_s=${p.sqrt_s} GeV">
          <line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="#f59e0b" stroke-width="1.8" />
          <line x1="${x - 3}" y1="${yTop}" x2="${x + 3}" y2="${yTop}" stroke="#f59e0b" stroke-width="1.8" />
          <line x1="${x - 3}" y1="${yBot}" x2="${x + 3}" y2="${yBot}" stroke="#f59e0b" stroke-width="1.8" />
          <circle cx="${x}" cy="${y}" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.2" />
          <title>${p.facility}: √s = ${p.sqrt_s} GeV, R = ${p.R} ± ${p.uncertainty}</title>
        </g>
      `;
    }).join('');

    // Step labels
    const stepLabel1 = `<text x="${sToX(2.0)}" y="${yStep1 - 10}" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">u, d, s: R = ২</text>`;
    const stepLabel2 = `<text x="${sToX(6.0)}" y="${yStep2 - 10}" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">+c: R = ১০/৩ (৩.৩৩)</text>`;
    const stepLabel3 = `<text x="${sToX(22.0)}" y="${yStep3 - 10}" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">+b: R = ১১/৩ (৩.৬৭)</text>`;

    wrap.innerHTML = `
      <svg class="c10-svg-canvas" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="R-Ratio Staircase Chart">
        <!-- Background -->
        <rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="rgba(2, 6, 23, 0.75)" rx="6" />

        <!-- Grid Lines -->
        ${gridLinesSvg}

        <!-- Flavour Threshold Vertical Guideline -->
        <line x1="${xCharm}" y1="${padTop}" x2="${xCharm}" y2="${padTop + plotH}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.35" />
        <text x="${xCharm}" y="${padTop - 8}" font-size="9" font-family="'JetBrains Mono', monospace" fill="#38bdf8" text-anchor="middle" opacity="0.8">চার্ম থ্রেশহোল্ড (৩.৭ GeV)</text>

        <line x1="${xBottom}" y1="${padTop}" x2="${xBottom}" y2="${padTop + plotH}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.35" />
        <text x="${xBottom}" y="${padTop - 8}" font-size="9" font-family="'JetBrains Mono', monospace" fill="#38bdf8" text-anchor="middle" opacity="0.8">বটম থ্রেশহোল্ড (১০.৫ GeV)</text>

        <!-- Hypothetical Nc = 1 Line (if toggled) -->
        ${this.showNc1Comparison ? `
          <path d="${nc1StepPath}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5,4" />
          <text x="${sToX(2.0)}" y="${yNc1_1 - 6}" font-size="9.5" fill="#ef4444" font-weight="700" text-anchor="middle">Nc = ১ হলে R = ২/৩</text>
          <text x="${sToX(6.0)}" y="${yNc1_2 - 6}" font-size="9.5" fill="#ef4444" font-weight="700" text-anchor="middle">Nc = ১ হলে R = ১০/৯</text>
          <text x="${sToX(22.0)}" y="${yNc1_3 - 6}" font-size="9.5" fill="#ef4444" font-weight="700" text-anchor="middle">Nc = ১ হলে R = ১১/৯</text>
        ` : ''}

        <!-- Theoretical Steps Path (Nc = 3) -->
        <path d="${nc3StepPath}" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        ${stepLabel1}
        ${stepLabel2}
        ${stepLabel3}

        <!-- Resonances Peaks -->
        ${resonancesSvg}

        <!-- PDG Measured Points -->
        ${pdgPointsSvg}

        <!-- Axes -->
        <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.5" />
        <line x1="${padLeft}" y1="${padTop + plotH}" x2="${padLeft + plotW}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.5" />

        <!-- Axis Labels -->
        ${xLabelsSvg}
        ${yLabelsSvg}

        <!-- Titles -->
        <text x="${padLeft + plotW / 2}" y="${padTop + plotH + 42}" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">সেন্টার-অব-মাস শক্তি &radic;s (GeV) — [লগ স্কেল]</text>
        <text x="${padLeft - 38}" y="${padTop + plotH / 2}" font-size="13" font-weight="700" fill="#cbd5e1" text-anchor="middle" transform="rotate(-90 ${padLeft - 38} ${padTop + plotH / 2})">R-অনুপাত R(&radic;s)</text>
      </svg>
    `;

    // Bind resonance clicks
    wrap.querySelectorAll('.c10-resonance-spike-group').forEach(grp => {
      grp.addEventListener('click', (e) => {
        const sym = e.currentTarget.getAttribute('data-symbol');
        this.selectResonance(sym);
      });
    });
  }

  selectResonance(sym) {
    this.selectedResonanceId = sym;
    const res = this.evidenceData.rRatio.resonances.find(r => r.symbol === sym);
    const detailCard = this.viewEl.querySelector('#c10-resonance-detail-card');
    if (!detailCard || !res) return;

    detailCard.style.display = 'flex';
    detailCard.innerHTML = `
      <div class="c10-res-det-header">
        <span class="c10-res-det-sym">${res.name}</span>
        <span class="c10-res-det-mass">ভর: <strong>${res.massGeV} GeV/c²</strong></span>
        <span class="c10-res-det-width">ক্ষয় বিস্তার Γ: <strong>${(res.widthGeV * 1000).toFixed(2)} MeV</strong></span>
        <button class="c10-btn-close-res" id="c10-btn-close-res" type="button" aria-label="Close resonance detail">×</button>
      </div>
      <div class="c10-res-det-body">
        <p class="c10-res-det-desc">
          কোয়ার্ক বিন্যাস: <strong>${res.quarks}</strong>। 
          এটি একটি ভেক্টর মেসন ($J^{PC} = 1^{--}$) যার কোয়ান্টাম সংখ্যা সরাসরি ফোটনের সাথে মিলে যায় ($e^+e^- \to \gamma^* \to \text{Resonance}$)। 
          এই তীক্ষ্ণ চূড়াগুলো প্রমাণ করে নতুন কোয়ার্ক ফ্লেভারের থ্রেশহোল্ডে কোয়ার্ক-অ্যান্টিকোয়ার্ক বাউন্ড স্টেট গঠিত হয়।
        </p>
      </div>
    `;

    detailCard.querySelector('#c10-btn-close-res').addEventListener('click', () => {
      detailCard.style.display = 'none';
      this.selectedResonanceId = null;
    });

    this.renderRRatioChart();
  }

  selectEvidenceCard(cardId) {
    this.selectedCardId = cardId;
    this.viewEl.querySelectorAll('.c10-evidence-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-card') === cardId);
    });

    this.renderSelectedCardDetails();
  }

  renderSelectedCardDetails() {
    const inspectorEl = this.viewEl.querySelector('#c10-evidence-inspector');
    if (!inspectorEl) return;

    const cards = this.evidenceData.evidenceCards;
    const c = cards.find(item => item.id === this.selectedCardId) || cards[0];

    inspectorEl.innerHTML = `
      <div class="c10-insp-card">
        <div class="c10-insp-header">
          <div class="c10-insp-title-row">
            <span class="c10-insp-num-pill">${c.id}</span>
            <h4 class="c10-insp-title">${c.titleBn}</h4>
            <span class="c10-insp-title-en">(${c.titleEn})</span>
          </div>
          <div class="c10-insp-badge-row">
            ${c.nobelYear ? `<span class="c10-badge nobel">${ICON_MEDAL_SVG} নোবেল ${c.nobelYear}</span>` : ''}
            <span class="c10-badge tier">${c.tier}</span>
          </div>
        </div>

        <div class="c10-insp-meta-strip">
          <div class="c10-meta-item">
            <span class="c10-meta-lbl">পরীক্ষা / স্থাপনা:</span>
            <span class="c10-meta-val">${c.experiment || c.facility || c.theorists || c.collaboration}</span>
          </div>
          ${c.publication ? `
            <div class="c10-meta-item">
              <span class="c10-meta-lbl">গবেষণাপত্র সূত্র:</span>
              <span class="c10-meta-val">${c.publication}</span>
            </div>
          ` : ''}
          ${c.nobelLaureates ? `
            <div class="c10-meta-item">
              <span class="c10-meta-lbl">বিজ্ঞানী / গবেষক:</span>
              <span class="c10-meta-val">${c.nobelLaureates.join(', ')}</span>
            </div>
          ` : ''}
        </div>

        <div class="c10-insp-body">
          <div class="c10-insp-block">
            <h5 class="c10-block-heading">পর্যবেক্ষণ ও আবিষ্কার:</h5>
            <p class="c10-block-p">${c.keyDiscoveryBn}</p>
          </div>

          <div class="c10-insp-block proof">
            <h5 class="c10-block-heading">পদার্থবিজ্ঞান প্রমাণ ও সিদ্ধান্ত:</h5>
            <p class="c10-block-p highlight">${c.physicsProofBn}</p>
          </div>
        </div>
      </div>
    `;
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      titleBn: 'অধ্যায় ১০: কোয়ার্কের অস্তিত্বের ৫টি প্রমাণ অডিট',
      titleEn: 'Chapter 10: Five Experimental Proofs of Quarks Audit',
      tier: 'T1',
      sections: [
        {
          headingBn: 'R-অনুপাতের তাত্ত্বিক ব্যুৎপত্তি',
          headingEn: 'Theoretical Derivation of R-Ratio',
          contentBn: `
            কোয়ান্টাম ইলেক্ট্রোডাইনামিক্সে e+e- -> mu+mu- এবং e+e- -> q q_bar উভয় প্রক্রিয়াই ভার্চুয়াল ফোটন স্থানান্তরের মাধ্যমে ঘটে। 
            ফলে মোট হ্যাড্রন ক্রস-সেকশন এবং মিউয়ন ক্রস-সেকশনের অনুপাত সরাসরি কোয়ার্কের কালার সংখ্যা (Nc) এবং চার্জের বর্গের সমষ্টি:
            R = Nc * sum_{q, active} (e_q)^2
            u, d, s কোয়ার্কের জন্য: Nc * (4/9 + 1/9 + 1/9) = Nc * (6/9) = 2/3 * Nc। 
            Nc = 3 হলে R = 2; Nc = 1 হলে R = 2/3।
          `
        },
        {
          headingBn: 'বজরকেন স্কেলিং ও পার্টন মডেল (১৯৬৮–১৯৯০)',
          headingEn: 'Bjorken Scaling & The Parton Model (1968-1990)',
          contentBn: `
            SLAC-এ ফ্রিম্যান, কেন্ডাল এবং টেলর প্রোটনের গঠন ফাংশন F_2(x, Q^2) পরিমাপ করেন। 
            তারা দেখতে পান যে অত্যন্ত উচ্চ মোমেন্টাম ট্রান্সফারে F_2 কেবল x = Q^2 / (2M nu) চলকের ওপর নির্ভর করে, Q^2-এর ওপর নয়। 
            ফাইনম্যানের পার্টন মডেল অনুযায়ী এটি প্রমাণ করে প্রোটন স্থানিকভাবে অবিভাজ্য ও নরম নয়, বরং এর ভেতরে বিন্দুসদৃশ মুক্ত কোয়ার্ক রয়েছে।
          `
        },
        {
          headingBn: 'PETRA তিন-জেট ও গ্লুয়ন আবিষ্কার (১৯৭৯)',
          headingEn: 'PETRA Three-Jet Gluon Discovery (1979)',
          contentBn: `
            জার্মানির DESY-তে স্থাপিত PETRA স্টোরেজ রিংয়ে e+e- সংঘর্ষে ১৭ থেকে ৩০ GeV শক্তিতে প্রথমবারের মতো তিনটি কোপ্ল্যানার জেট দেখা যায়। 
            জেটগুলোর কৌণিক বিশ্লেষণ ও ব্রেমসস্ট্রালুং প্যাটার্ন নিশ্চিত করে তৃতীয় জেটটি ছিল স্পিন-১ ভরহীন কালার গেজ বোসন — গ্লুয়ন।
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
