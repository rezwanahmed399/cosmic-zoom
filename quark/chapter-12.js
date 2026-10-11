/**
 * CosmoPlanck Quark Section - Chapter 12: "প্রোটনের spin ধাঁধা" (Proton Spin Puzzle)
 * 
 * Scientific Fidelity & Features:
 * 1. Spin Decomposition Equation:
 *    - 1/2 = (1/2)DeltaSigma + DeltaG + L_q + L_g (Jaffe-Manohar / Ji decomposition; Tier T2).
 * 2. Quantitative Proportions & Uncertainty Bands:
 *    - (1/2)DeltaSigma ~ 25-40% (central ~30% +- 4%, 0.15 hbar).
 *    - DeltaG ~ 32-48% (central ~40% +- 8%, 0.20 hbar; measured via RHIC polarized pp).
 *    - L_q ~ 12-28% (central ~20% +- 8%, 0.10 hbar; Generalized Parton Distributions / GPDs).
 *    - L_g ~ 3-17% (central ~10% +- 7%, 0.05 hbar; unmeasured directly, constrained by lattice / sum rules).
 *    - Truth Tier: T2 (Partially unsolved mystery).
 * 3. Myth-Busting Interactive Card:
 *    - Naive Quark Model: u(up) + u(up) + d(down) = 1/2 hbar.
 *    - Historical Reality: 1987 European Muon Collaboration (EMC, CERN; Tier T1) "Spin Crisis" — quarks only account for ~25-35%!
 * 4. Interactive Component Isolation Visualizer:
 *    - SVG schematic showing proton net spin vector J = 1/2, quark intrinsic spins, gluon polarizations, and orbital angular momentum (OAM).
 * 5. Scientific Audit Drawer:
 *    - EMC (CERN 1987), COMPASS, HERMES, RHIC Spin (STAR/PHENIX), Lattice QCD, and future Electron-Ion Collider (EIC).
 * 6. Strictly zero unicode emojis across code and UI.
 */

import {
  getProtonSpinPuzzleData,
  PROTON_SPIN_PUZZLE
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c12-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c12-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPIN_SVG = '<svg class="c12-icon-badge spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.42"></path></svg>';
const ICON_ALERT_SVG = '<svg class="c12-icon-badge alert" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c12-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c12-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_CHART_SVG = '<svg class="c12-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';

export class Chapter12SpinPuzzle {
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

    this.spinData = getProtonSpinPuzzleData();
    this.activeFilter = 'all'; // 'all' | 'quark_spin' | 'gluon_spin' | 'orbital'
    this.showUncertainties = false;

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-12-view';
    this.viewEl.id = 'chapter-12-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c12-header-section" aria-label="Chapter 12 Header">
        <div class="c12-header-top">
          <div class="c12-title-block">
            <div class="c12-pill-row">
              <span class="c12-chapter-badge">অধ্যায় ১২</span>
              <span class="c12-tier-badge-wrap" id="c12-tier-header"></span>
              <span class="c12-scheme-tag">Jaffe-Manohar & Ji Sum Rule (T2)</span>
            </div>
            <h2 class="c12-main-title">প্রোটনের spin ধাঁধা (The Proton Spin Puzzle)</h2>
            <p class="c12-subtitle">১/২ = ১/২ ΔΣ + ΔG + L_q + L_g সমীকরণ, ১৯৮৭-র EMC স্পিন ক্রাইসিস ও আধুনিক অমীমাংসিত রহস্য</p>
          </div>

          <div class="c12-header-actions">
            <button class="c12-btn-outline" id="c12-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>EMC, RHIC ও EIC অডিট</span>
            </button>
          </div>
        </div>

        <!-- FORMULA HERO CARD -->
        <div class="c12-formula-card">
          <div class="c12-formula-badge">
            ${ICON_SPIN_SVG}
            <span>স্পিন বিভাজন সূত্র: J = ½ ħ</span>
          </div>
          <div class="c12-equation-display">
            <div class="c12-eq-lhs">
              <span class="eq-symbol">J_p</span>
              <span class="eq-op">=</span>
              <span class="eq-num">½</span>
              <span class="eq-op">=</span>
            </div>
            <div class="c12-eq-terms">
              <span class="eq-term term-qs" data-id="quark_spin" title="কোয়ার্ক অভ্যন্তরীণ স্পিন">
                ½ΔΣ <small>(≈৩০%)</small>
              </span>
              <span class="eq-plus">+</span>
              <span class="eq-term term-gs" data-id="gluon_spin" title="গ্লুয়ন পোলারাইজেশন">
                ΔG <small>(≈৪০%)</small>
              </span>
              <span class="eq-plus">+</span>
              <span class="eq-term term-qo" data-id="quark_orbital" title="কোয়ার্ক কক্ষীয় কৌণিক ভরবেগ">
                L_q <small>(≈২০%)</small>
              </span>
              <span class="eq-plus">+</span>
              <span class="eq-term term-go" data-id="gluon_orbital" title="গ্লুয়ন কক্ষীয় কৌণিক ভরবেগ">
                L_g <small>(≈১০%)</small>
              </span>
            </div>
          </div>
          <p class="c12-formula-desc">
            প্রোটনের মোট স্পিন ১/২ কেবল তার মধ্যকার ৩টি কোয়ার্কের নিজস্ব স্পিনের যোগফল নয়। 
            বরং এটি কোয়ার্ক স্পিন, গ্লুয়ন পোলারাইজেশন এবং কোয়ার্ক ও গ্লুয়নদের প্রচণ্ড গতির কক্ষীয় কৌণিক ভরবেগের এক জটিল কোয়ান্টাম সমাহার।
          </p>
        </div>
      </section>

      <!-- MYTH BUSTING HERO SECTION -->
      <section class="c12-myth-section" aria-label="Proton Spin Myth Busting Card">
        <div class="c12-myth-card">
          <div class="c12-myth-side naive-side">
            <div class="c12-myth-header">
              <span class="c12-myth-tag err">সরল ভ্রান্ত ধারণা (ভুল)</span>
              <h4>ভ্যালেন্স কোয়ার্ক মডেলের সরল অনুমান</h4>
            </div>
            <div class="c12-spin-mini-diagram naive-diagram">
              <div class="quark-spin-pill up">u <span class="arrow-up">&uarr;</span> (+½)</div>
              <div class="quark-spin-pill up">u <span class="arrow-up">&uarr;</span> (+½)</div>
              <div class="quark-spin-pill down">d <span class="arrow-down">&darr;</span> (-½)</div>
              <div class="quark-spin-eq">= ½ &uarr;</div>
            </div>
            <p class="c12-myth-text">
              “দুইটি আপ কোয়ার্ক স্পিন-আপ (+১/২, +১/২) এবং একটি ডাউন কোয়ার্ক স্পিন-ডাউন (-১/২) করলেই মোট স্পিন ১/২ হয়ে যাবে।” 
              — বহু পাঠ্যবইয়ের এই সরল ছবি বাস্তবে একেবারেই ভুল!
            </p>
          </div>

          <div class="c12-myth-divider">
            <div class="c12-vs-badge">বনাম</div>
          </div>

          <div class="c12-myth-side reality-side">
            <div class="c12-myth-header">
              <span class="c12-myth-tag truth">প্রকৃত বৈজ্ঞানিক সত্য (T1 / T2)</span>
              <h4>১৯৮৭-র EMC স্পিন ক্রাইসিস ও আধুনিক কোয়ান্টাম সত্য</h4>
            </div>
            <div class="c12-reality-highlight">
              <span class="reality-percent">মাত্র ≈ ২৫% – ৩৫%</span>
              <span class="reality-label">কোয়ার্কদের নিজস্ব স্পিনের অবদান!</span>
            </div>
            <p class="c12-myth-text">
              ১৯৮৭ সালে সার্ন-এ European Muon Collaboration (EMC) পোলারাইজড ডিপ-ইনইলাস্টিক বিক্ষেপণে পরীক্ষা করে অবিসংবাদিতভাবে প্রমাণ করে: 
              <strong>ভ্যালেন্স কোয়ার্করা প্রোটনের মোট স্পিনের মাত্র এক-তৃতীয়াংশের মতো বহন করে!</strong> বাকি ৭০% স্পিন আসে গ্লুয়ন ও কোয়ান্টাম কক্ষীয় আবর্তন (OAM) থেকে।
            </p>
          </div>
        </div>
      </section>

      <!-- INTERACTIVE STACKED BAR & CONTROLS -->
      <section class="c12-breakdown-section" aria-label="Spin Breakdown and Uncertainty Analysis">
        <div class="c12-panel-header-row">
          <div>
            <h3 class="c12-sec-title">স্পিন উপাদানের অনুপাত ও অনিশ্চয়তা ব্যান্ড</h3>
            <p class="c12-sec-subtitle">মোট ১/২ ħ স্পিনের শতকরার অংশীদারিত্ব ও পরীক্ষালব্ধ সহনসীমা</p>
          </div>
          <div class="c12-view-controls">
            <button class="c12-filter-btn active" id="c12-btn-all" data-filter="all">সব উপাদান</button>
            <button class="c12-filter-btn" id="c12-btn-qs" data-filter="quark_spin">কোয়ার্ক স্পিন</button>
            <button class="c12-filter-btn" id="c12-btn-gs" data-filter="gluon_spin">গ্লুয়ন স্পিন</button>
            <button class="c12-filter-btn" id="c12-btn-orb" data-filter="orbital">কক্ষীয় গতি (L)</button>
            <button class="c12-toggle-btn" id="c12-btn-toggle-bands" title="Toggle experimental error bands">
              ${ICON_CHART_SVG}
              <span id="c12-lbl-bands">অনিশ্চয়তা ব্যান্ড দেখুন</span>
            </button>
          </div>
        </div>

        <!-- STACKED PERCENTAGE BAR -->
        <div class="c12-stacked-container">
          <div class="c12-stacked-bar" id="c12-stacked-bar">
            <!-- Dynamic segments -->
          </div>
          <div class="c12-bar-axis">
            <span>০%</span>
            <span>২৫%</span>
            <span>৫০%</span>
            <span>৭৫%</span>
            <span>১০০% (J = ½)</span>
          </div>
        </div>

        <!-- MAIN CARDS GRID: 4 COMPONENTS -->
        <div class="c12-components-grid" id="c12-components-grid">
          <!-- Rendered via JS -->
        </div>
      </section>

      <!-- SCHEMATIC VISUALIZATION PANEL -->
      <section class="c12-schematic-section" aria-label="Proton Spin Schematic Visualization">
        <div class="c12-schematic-panel">
          <div class="c12-schematic-header">
            <div>
              <h3 class="c12-sec-title">প্রোটনের সামগ্রিক স্পিন কোয়ান্টাম কাঠামো</h3>
              <p class="c12-sec-subtitle">কোয়ার্ক, গ্লুয়ন ও কক্ষীয় ঘূর্ণনের সমবেত ভেক্টর চিত্র (প্রতীকী T4)</p>
            </div>
            <div class="c12-schematic-legend">
              <span class="legend-item"><span class="dot qs"></span> কোয়ার্ক স্পিন (½ΔΣ)</span>
              <span class="legend-item"><span class="dot gs"></span> গ্লুয়ন স্পিন (ΔG)</span>
              <span class="legend-item"><span class="dot oam"></span> কক্ষীয় কৌণিক ভরবেগ (L)</span>
              <span class="legend-item"><span class="dot net"></span> লব্ধি স্পিন J_p (½)</span>
            </div>
          </div>

          <div class="c12-stage-viewport" id="c12-stage-viewport">
            <!-- Dynamic SVG Stage -->
          </div>

          <div class="c12-stage-footer" id="c12-stage-footer">
            <div class="c12-footer-alert">
              ${ICON_ALERT_SVG}
              <div class="c12-alert-text">
                <strong>গবেষণার বর্তমান অবস্থা (T2):</strong> 
                RHIC-এর পোলারাইজড প্রোটন সংঘর্ষে $\\Delta G$ পরিমাপ আংশিক হলেও, কোয়ার্ক ও গ্লুয়নের কক্ষীয় কৌণিক ভরবেগ ($L_q$ ও $L_g$) 
                সরাসরি মাপা অত্যন্ত কঠিন। আগামী দশকে ব্রুকহেভেন ন্যাশনাল ল্যাবরেটরির <strong>Electron-Ion Collider (EIC)</strong> এই রহস্যের চূড়ান্ত সমাধান করবে বলে আশা করা হচ্ছে।
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CHAPTER NAVIGATION FOOTER -->
      <footer class="c12-footer-nav" aria-label="Chapter Navigation">
        <button class="c12-nav-btn prev" id="c12-btn-prev" type="button">
          ${ICON_ARROW_LEFT_SVG}
          <div class="c12-btn-text-wrap">
            <span class="c12-nav-dir">পূর্ববর্তী অধ্যায়</span>
            <span class="c12-nav-label">অধ্যায় ১১: আদি মহাবিশ্ব ও QGP</span>
          </div>
        </button>

        <div class="c12-nav-summary">
          <span class="c12-sum-pill">কোয়ার্ক সিরিজ সমাপ্ত</span>
          <span class="c12-sum-text">১৩টি পূর্ণাঙ্গ অধ্যায় সম্পন্ন</span>
        </div>

        <button class="c12-nav-btn next" id="c12-btn-home" type="button">
          <div class="c12-btn-text-wrap" style="text-align: right;">
            <span class="c12-nav-dir">প্রথম অধ্যায়ে ফিরুন</span>
            <span class="c12-nav-label">অধ্যায় ০: স্কেল-সিঁড়ি</span>
          </div>
          ${ICON_ARROW_RIGHT_SVG}
        </button>
      </footer>
    `;

    this.container.appendChild(this.viewEl);

    // Initialize Tier Badge
    const tierWrap = this.viewEl.querySelector('#c12-tier-header');
    if (tierWrap) {
      const badge = createTierBadge('T2', this.lang);
      tierWrap.appendChild(badge);
    }

    this.bindEvents();
    this.renderStackedBar();
    this.renderComponentCards();
    this.renderSchematic();
  }

  bindEvents() {
    // Info drawer trigger
    const infoBtn = this.viewEl.querySelector('#c12-btn-info');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.openAuditDrawer());
    }

    // Filter buttons
    const filterBtns = this.viewEl.querySelectorAll('.c12-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.activeFilter = filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderStackedBar();
        this.renderComponentCards();
        this.renderSchematic();
      });
    });

    // Toggle uncertainty bands
    const toggleBandsBtn = this.viewEl.querySelector('#c12-btn-toggle-bands');
    if (toggleBandsBtn) {
      toggleBandsBtn.addEventListener('click', () => {
        this.showUncertainties = !this.showUncertainties;
        toggleBandsBtn.classList.toggle('active', this.showUncertainties);
        const lbl = this.viewEl.querySelector('#c12-lbl-bands');
        if (lbl) {
          lbl.textContent = this.showUncertainties ? 'কেন্দ্রীয় মান দেখুন' : 'অনিশ্চয়তা ব্যান্ড দেখুন';
        }
        this.renderStackedBar();
        this.renderComponentCards();
      });
    }

    // Formula terms click to filter
    const terms = this.viewEl.querySelectorAll('.c12-eq-terms .eq-term');
    terms.forEach(term => {
      term.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const filterMap = {
          'quark_spin': 'quark_spin',
          'gluon_spin': 'gluon_spin',
          'quark_orbital': 'orbital',
          'gluon_orbital': 'orbital'
        };
        const targetFilter = filterMap[id] || 'all';
        this.activeFilter = (this.activeFilter === targetFilter) ? 'all' : targetFilter;
        
        filterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === this.activeFilter);
        });

        this.renderStackedBar();
        this.renderComponentCards();
        this.renderSchematic();
      });
    });

    // Chapter Navigation Buttons
    const prevBtn = this.viewEl.querySelector('#c12-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-11';
      });
    }

    const homeBtn = this.viewEl.querySelector('#c12-btn-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-0';
      });
    }
  }

  renderStackedBar() {
    const bar = this.viewEl.querySelector('#c12-stacked-bar');
    if (!bar) return;

    const comps = this.spinData.components;
    bar.innerHTML = '';

    comps.forEach(comp => {
      const seg = document.createElement('div');
      seg.className = `c12-bar-seg seg-${comp.id}`;
      seg.style.width = `${comp.percentage}%`;

      const isDimmed = (this.activeFilter !== 'all') && (
        (this.activeFilter === 'quark_spin' && comp.id !== 'quark_spin') ||
        (this.activeFilter === 'gluon_spin' && comp.id !== 'gluon_spin') ||
        (this.activeFilter === 'orbital' && comp.id !== 'quark_orbital' && comp.id !== 'gluon_orbital')
      );

      if (isDimmed) {
        seg.classList.add('dimmed');
      }

      seg.innerHTML = `
        <span class="seg-label">${comp.symbol}</span>
        <span class="seg-val">${this.showUncertainties ? `${comp.rangePercent[0]}-${comp.rangePercent[1]}%` : `${comp.percentage}%`}</span>
      `;

      seg.addEventListener('click', () => {
        this.activeFilter = comp.id.includes('orbital') ? 'orbital' : comp.id;
        const filterBtns = this.viewEl.querySelectorAll('.c12-filter-btn');
        filterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === this.activeFilter);
        });
        this.renderStackedBar();
        this.renderComponentCards();
        this.renderSchematic();
      });

      bar.appendChild(seg);
    });
  }

  renderComponentCards() {
    const grid = this.viewEl.querySelector('#c12-components-grid');
    if (!grid) return;

    const comps = this.spinData.components;
    grid.innerHTML = '';

    comps.forEach(comp => {
      const isHighlighted = (this.activeFilter === 'all') || (
        (this.activeFilter === 'quark_spin' && comp.id === 'quark_spin') ||
        (this.activeFilter === 'gluon_spin' && comp.id === 'gluon_spin') ||
        (this.activeFilter === 'orbital' && (comp.id === 'quark_orbital' || comp.id === 'gluon_orbital'))
      );

      const card = document.createElement('div');
      card.className = `c12-comp-card card-${comp.id} ${isHighlighted ? 'active' : 'dimmed'}`;

      const rangeWidth = comp.rangePercent[1] - comp.rangePercent[0];
      const rangeLeft = comp.rangePercent[0];

      card.innerHTML = `
        <div class="c12-comp-top">
          <div class="c12-comp-symbol-wrap">
            <span class="c12-comp-symbol">${comp.symbol}</span>
            <span class="c12-comp-tier">T2</span>
          </div>
          <div class="c12-comp-pct-wrap">
            <span class="c12-comp-pct">${comp.percentage}%</span>
            <span class="c12-comp-hbar">(${comp.value} ħ)</span>
          </div>
        </div>

        <h4 class="c12-comp-title">${comp.nameBn}</h4>

        <div class="c12-comp-band-wrap">
          <div class="c12-band-track">
            <div class="c12-band-range" style="left: ${rangeLeft}%; width: ${rangeWidth}%;"></div>
            <div class="c12-band-marker" style="left: ${comp.percentage}%;"></div>
          </div>
          <div class="c12-band-labels">
            <span>সীমা: ${comp.rangePercent[0]}% – ${comp.rangePercent[1]}%</span>
            <span>অনিশ্চয়তা: ±${comp.uncertainty}%</span>
          </div>
        </div>

        <div class="c12-comp-meta">
          <span class="meta-label">পরীক্ষালব্ধ উৎস:</span>
          <span class="meta-val">${comp.sources}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.activeFilter = comp.id.includes('orbital') ? 'orbital' : comp.id;
        const filterBtns = this.viewEl.querySelectorAll('.c12-filter-btn');
        filterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === this.activeFilter);
        });
        this.renderStackedBar();
        this.renderComponentCards();
        this.renderSchematic();
      });

      grid.appendChild(card);
    });
  }

  renderSchematic() {
    const stage = this.viewEl.querySelector('#c12-stage-viewport');
    if (!stage) return;

    const filter = this.activeFilter;
    const showQuarks = (filter === 'all' || filter === 'quark_spin');
    const showGluons = (filter === 'all' || filter === 'gluon_spin');
    const showOrbit = (filter === 'all' || filter === 'orbital');

    stage.innerHTML = `
      <svg class="c12-stage-svg" viewBox="0 0 800 380" role="img" aria-label="Proton Spin Vector Composition Diagram">
        <defs>
          <radialGradient id="c12-proton-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"></stop>
            <stop offset="70%" stop-color="#1e3a8a" stop-opacity="0.08"></stop>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0"></stop>
          </radialGradient>

          <filter id="c12-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur"></feGaussianBlur>
            <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
          </filter>

          <marker id="arrow-net" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"></path>
          </marker>
          <marker id="arrow-qs" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ec4899"></path>
          </marker>
          <marker id="arrow-gs" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981"></path>
          </marker>
          <marker id="arrow-orb" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f59e0b"></path>
          </marker>
        </defs>

        <!-- PROTON BOUNDARY MESH (0.84 fm) -->
        <circle cx="400" cy="190" r="160" fill="url(#c12-proton-bg)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"></circle>
        <text x="400" y="365" text-anchor="middle" fill="#64748b" font-size="12" font-family="monospace">
          প্রোটন ব্যাসার্ধ ≈ ০.৮৪ fm | মোট স্পিন J = ½ ħ
        </text>

        <!-- ORBITAL ANGULAR MOMENTUM VECTORS (L_q & L_g) -->
        <g class="c12-orbit-layer" style="opacity: ${showOrbit ? '1' : '0.15'}; transition: opacity 0.3s ease;">
          <ellipse cx="400" cy="190" rx="130" ry="50" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.8"></ellipse>
          <path d="M 270 190 A 130 50 0 0 1 530 190" fill="none" stroke="#f59e0b" stroke-width="3" marker-end="arrow-orb"></path>
          
          <ellipse cx="400" cy="190" rx="90" ry="34" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"></ellipse>
          <path d="M 490 190 A 90 34 0 0 1 310 190" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="arrow-orb"></path>
          
          <text x="545" y="195" fill="#f59e0b" font-size="13" font-weight="bold">L_q + L_g (≈ ৩০%)</text>
        </g>

        <!-- GLUON POLARIZATION VECTORS (Delta G) -->
        <g class="c12-gluon-layer" style="opacity: ${showGluons ? '1' : '0.15'}; transition: opacity 0.3s ease;">
          <!-- Spring-like swirling gluon polarization arrows -->
          <path d="M 360 210 Q 370 160 380 120" fill="none" stroke="#10b981" stroke-width="3.5" marker-end="arrow-gs"></path>
          <path d="M 440 210 Q 430 160 420 120" fill="none" stroke="#10b981" stroke-width="3.5" marker-end="arrow-gs"></path>
          
          <!-- Gluon exchange spirals -->
          <circle cx="370" cy="150" r="14" fill="#064e3b" stroke="#10b981" stroke-width="1.5" opacity="0.8"></circle>
          <text x="370" y="154" text-anchor="middle" fill="#34d399" font-size="10" font-weight="bold">g</text>

          <circle cx="430" cy="150" r="14" fill="#064e3b" stroke="#10b981" stroke-width="1.5" opacity="0.8"></circle>
          <text x="430" y="154" text-anchor="middle" fill="#34d399" font-size="10" font-weight="bold">g</text>

          <text x="400" y="105" text-anchor="middle" fill="#10b981" font-size="13" font-weight="bold">ΔG (≈ ৪০%)</text>
        </g>

        <!-- QUARK INTRINSIC SPIN LAYER (1/2 DeltaSigma) -->
        <g class="c12-quark-layer" style="opacity: ${showQuarks ? '1' : '0.15'}; transition: opacity 0.3s ease;">
          <!-- u1 quark -->
          <circle cx="340" cy="220" r="22" fill="#831843" stroke="#ec4899" stroke-width="2.5" filter="url(#c12-glow)"></circle>
          <text x="340" y="226" text-anchor="middle" fill="#fdf2f8" font-size="15" font-weight="bold">u</text>
          <line x1="340" y1="200" x2="340" y2="155" stroke="#ec4899" stroke-width="3" marker-end="arrow-qs"></line>

          <!-- u2 quark -->
          <circle cx="460" cy="220" r="22" fill="#831843" stroke="#ec4899" stroke-width="2.5" filter="url(#c12-glow)"></circle>
          <text x="460" y="226" text-anchor="middle" fill="#fdf2f8" font-size="15" font-weight="bold">u</text>
          <line x1="460" y1="200" x2="460" y2="155" stroke="#ec4899" stroke-width="3" marker-end="arrow-qs"></line>

          <!-- d quark -->
          <circle cx="400" cy="260" r="20" fill="#1e293b" stroke="#94a3b8" stroke-width="2"></circle>
          <text x="400" y="265" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="bold">d</text>
          <line x1="400" y1="278" x2="400" y2="310" stroke="#94a3b8" stroke-width="2.5" marker-end="arrow-qs" transform="rotate(180 400 294)"></line>

          <text x="320" y="265" fill="#ec4899" font-size="13" font-weight="bold">½ΔΣ (≈ ৩০%)</text>
        </g>

        <!-- NET PROTON SPIN VECTOR (J_p = 1/2) -->
        <g class="c12-net-spin-layer">
          <line x1="240" y1="240" x2="240" y2="100" stroke="#38bdf8" stroke-width="5" marker-end="arrow-net"></line>
          <text x="240" y="85" text-anchor="middle" fill="#38bdf8" font-size="15" font-weight="bold">J_p = ½ ħ</text>
          <text x="240" y="260" text-anchor="middle" fill="#94a3b8" font-size="11">লব্ধি মোট স্পিন</text>
        </g>
      </svg>
    `;
  }

  openAuditDrawer() {
    if (!this.infoDrawer) return;

    const content = `
      <div class="audit-drawer-content">
        <h3>প্রোটন স্পিন ধাঁধার বৈজ্ঞানিক অডিট ও তথ্যসূত্র</h3>
        <p><strong>তাত্ত্বিক ফ্রেমওয়ার্ক:</strong> Jaffe-Manohar & Ji Angular Momentum Sum Rules</p>
        <p><strong>সত্যতা-স্তর (Truth Tier):</strong> T2 (আংশিক অমীমাংসিত রহস্য / Partially Unsolved)</p>
        
        <h4>মূল গবেষণাপত্র ও পরীক্ষা:</h4>
        <ul>
          <li>
            <strong>১. European Muon Collaboration (EMC, CERN, ১৯৮৭):</strong><br>
            <em>J. Ashman et al., Phys. Lett. B 206 (1988) 364.</em><br>
            পোলারাইজড মিউয়ন বিচ্ছুরণে প্রথম আবিষ্কৃত হয় যে কোয়ার্কদের স্পিন অবদান মাত্র ≈ ০.১২ ± ০.১৭, যা ঐতিহাসিক "স্পিন ক্রাইসিস"-এর সূচনা করে।
          </li>
          <li>
            <strong>২. COMPASS (CERN) & HERMES (DESY):</strong><br>
            আধা-ইনক্লুসিভ ডিপ-ইনইলাস্টিক বিক্ষেপণে (SIDIS) বিভিন্ন ফ্লেভারের কোয়ার্কের পোলারাইজেশন সূক্ষ্মভাবে মাপা হয়।
          </li>
          <li>
            <strong>৩. RHIC স্পিন প্রোগ্রাম (STAR & PHENIX, BNL):</strong><br>
            <em>D. de Florian et al. (DSSV Global Fit), Phys. Rev. Lett. 113 (2014) 012001.</em><br>
            পোলারাইজড প্রোটন-প্রোটন সংঘর্ষে জেট ও পাইয়ন উৎপাদনের মাধ্যমে প্রথম নিশ্চিত প্রমাণ পাওয়া যায় যে গ্লুয়ন পোলারাইজেশন ΔG অশূন্য এবং উল্লেখযোগ্য (≈ ৪০%)।
          </li>
          <li>
            <strong>৪. ল্যাটিস QCD ও জি-সাম রুল (Ji Sum Rule, ১৯৯৭):</strong><br>
            <em>X. Ji, Phys. Rev. Lett. 78 (1997) 610; C. Alexandrou et al. (ETMC), Phys. Rev. D 101 (2020) 094513.</em><br>
            গেজ-ইনভ্যারিয়েন্ট পদ্ধতিতে কোয়ার্ক ও গ্লুয়ন কক্ষীয় কৌণিক ভরবেগ (L_q ও L_g) গণনার তাত্ত্বিক ভিত্তি।
          </li>
          <li>
            <strong>৫. ভবিষ্যৎ পরীক্ষাগার: Electron-Ion Collider (EIC, BNL):</strong><br>
            ২০৩০-এর দশকে ব্রুকহেভেন ন্যাশনাল ল্যাবে নির্মাণাধীন EIC অতিউচ্চ রেজোলিউশনে প্রোটনের অভ্যন্তরীণ ত্রিমাত্রিক টমোগ্রাফি (GPDs) করে কক্ষীয় ভরবেগ L-এর সঠিক মান নিরূপণ করবে।
          </li>
        </ul>
      </div>
    `;

    this.infoDrawer.open({
      title: 'প্রোটনের স্পিন ধাঁধা — বৈজ্ঞানিক অডিট (Tier T2)',
      content: content,
      tier: 'T2'
    });
  }

  destroy() {
    if (this.viewEl && this.viewEl.parentNode) {
      this.viewEl.parentNode.removeChild(this.viewEl);
    }
  }
}
