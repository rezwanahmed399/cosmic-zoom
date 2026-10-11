/**
 * CosmoPlanck Quark Section - Chapter 7: "ভর কোথা থেকে আসে" (Origin of Mass)
 * 
 * Scientific Fidelity & Features:
 * 1. Two Stacked Bars:
 *    - (a) "তিন valence কোয়ার্কের নিজস্ব ভর ≈ 9 MeV ≈ 1%":
 *          u + u + d bare current quark masses (2.16 + 2.16 + 4.67 ≈ 9.0 MeV) vs remaining ~929 MeV.
 *    - (b) "Ji-বিভাজন (lattice QCD; MS-bar μ = 2 GeV; Yang et al., PRL 121, 212001, 2018)":
 *          - Quark energy ≈ 32% [32(4)(4)%]
 *          - Glue energy ≈ 36% [36(5)(4)%]
 *          - Trace anomaly ≈ 23% [23(1)(1)%]
 *          - Quark-mass contribution ≈ 9% [9(2)(1)%]
 *          - All with interactive uncertainty bands (statistical and systematic).
 * 2. Click-to-Inspect Deep Dives:
 *    - E = mc²: majority of visible mass (~90%) arises from ultra-relativistic kinetic and color field energy,
 *      not from the Higgs-dependent current quark mass.
 *    - Detailed explanation of why (a) and (b) are distinct physical quantities:
 *      (a) is bare valence quark masses in vacuum, while (b) is dynamical lattice QCD energy-momentum tensor
 *      accounting for sea quarks (uū, dd̄, ss̄) and vacuum chiral condensate <q̄q>, yielding ~9%.
 * 3. Strict Scientific Rules & Warnings:
 *    - Prominent Warning: "আনুমানিক, স্কিম-নির্ভর (T2)".
 *    - Banned Statements strictly enforced: "99% Higgs ছাড়া" phrases are prohibited as misleading.
 * 4. Zero unicode emojis across all code and UI.
 */

import {
  PROTON,
  getJiMassDecomposition,
  getProtonMassOrigin
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c7-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c7-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPARK_SVG = '<svg class="c7-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_ALERT_SVG = '<svg class="c7-icon-badge alert" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c7-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_CHECK_SVG = '<svg class="c7-icon-badge ok" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

export class Chapter7MassOrigin {
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
    this.massOriginData = getProtonMassOrigin();
    this.jiData = getJiMassDecomposition();

    // Active inspected Ji component: 'quarkEnergy' (default)
    this.activeComponentId = 'quarkEnergy';

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-7-view';
    this.viewEl.id = 'chapter-7-view';

    const protonTotalMass = this.massOriginData.totalProtonMass.value;
    const valenceSum = this.massOriginData.valenceSum.value;
    const valencePercentage = (this.massOriginData.valenceSum.fractionOfProtonMass * 100).toFixed(2);
    const missingPercentage = (100 - parseFloat(valencePercentage)).toFixed(2);
    const missingMassVal = (protonTotalMass - valenceSum).toFixed(1);

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c7-header-section" aria-label="Chapter 7 Header">
        <div class="c7-header-top">
          <div class="c7-title-block">
            <div class="c7-pill-row">
              <span class="c7-chapter-badge">অধ্যায় ৭</span>
              <span class="c7-tier-badge-wrap" id="c7-tier-header"></span>
              <span class="c7-scheme-tag">MS-bar (μ = 2 GeV) Lattice QCD</span>
            </div>
            <h2 class="c7-main-title">ভর কোথা থেকে আসে</h2>
            <p class="c7-subtitle">প্রোটন ভর বিভাজন, হিগস মেকানিজম বনাম QCD কনফাইনমেন্ট শক্তি (E = mc²)</p>
          </div>

          <div class="c7-header-actions">
            <button class="c7-btn-outline" id="c7-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>তথ্য ও ল্যাটিস অডিট</span>
            </button>
          </div>
        </div>

        <!-- STRICT WARNING BANNER -->
        <div class="c7-warning-banner" role="alert">
          <div class="c7-warning-icon">${ICON_ALERT_SVG}</div>
          <div class="c7-warning-content">
            <div class="c7-warning-title">সতর্কতা: আনুমানিক ও স্কিম-নির্ভর (T2)</div>
            <p class="c7-warning-text">
              ভর বিভাজন একটি তাত্ত্বিক স্কেল-নির্ভর ব্যবচ্ছেদ ($\mu = 2\text{ GeV}$)। 
              পপুলার সায়েন্সে বহুল প্রচলিত <strong>"৯৯% ভর হিগস ছাড়া" ধরনের অতি-সরলীকরণ বৈজ্ঞানিকভাবে নিষিদ্ধ</strong>। 
              ল্যাটিস QCD-তে কোয়ান্টাম সি-কোয়ার্ক ও ভ্যাকুয়াম কাইরাল কনডেনসেটের হিগস-সংশ্লিষ্ট ভর অবদান প্রায় ৯%।
            </p>
          </div>
        </div>

        <!-- INTRO CONTEXT CARD -->
        <div class="c7-intro-card">
          <p class="c7-intro-text">
            আমাদের চেনা দৃশ্যমান জগতের ৯৯%-এরও বেশি ভর পরমাণুর নিউক্লিয়াসে পুঞ্জীভূত, যা গঠিত মূলত প্রোটন ও নিউট্রন দিয়ে। 
            কিন্তু আশ্চর্য বিষয় হলো, তিনটি কোয়ার্কের নিজস্ব ভর যোগ করলে তা মোট প্রোটন ভরের (৯৩৮.৩ MeV) 
            মাত্র <strong>১% (প্রায় ৯ MeV)</strong>। বাকি ভর কোনো রহস্যময় কণা যোগ করেনি — এটি আইনস্টাইনের 
            <strong>$E = mc^2$</strong> সূত্র অনুযায়ী কোয়ার্কের প্রচণ্ড আপেক্ষিক গতিবেগ ও গ্লুয়ন ক্ষেত্রশক্তির প্রত্যক্ষ রূপ!
          </p>
        </div>
      </section>

      <!-- TWO STACKED BARS SECTION -->
      <section class="c7-bars-section" aria-label="Mass Decomposition Stacked Bars">
        
        <!-- BAR A: THREE VALENCE QUARKS (1% VS 99%) -->
        <div class="c7-bar-panel" id="c7-panel-bar-a">
          <div class="c7-bar-header">
            <div class="c7-bar-title-wrap">
              <span class="c7-bar-letter-tag">বার (a)</span>
              <h3 class="c7-bar-title">তিন valence কোয়ার্কের নিজস্ব ভর ≈ ৯ MeV ≈ ১%</h3>
            </div>
            <span class="c7-bar-meta-badge">প্রাথমিক কারেন্ট-কোয়ার্ক ছবি (T2)</span>
          </div>

          <p class="c7-bar-desc">
            $u$ কোয়ার্কের ভর $\approx 2.16\text{ MeV}$, $u$ কোয়ার্ক $\approx 2.16\text{ MeV}$ এবং $d$ কোয়ার্ক $\approx 4.67\text{ MeV}$। 
            এদের সরাসরি যোগফল মাত্র $\approx 9.0\text{ MeV}/c^2$ ($0.96\% \approx 1\%$)।
          </p>

          <!-- VISUAL STACKED BAR A -->
          <div class="c7-stacked-bar-track">
            <!-- Valence 1% segment -->
            <div class="c7-bar-seg valence-seg" style="width: 4.5%;" title="Valence Quarks: ~9 MeV (0.96%)">
              <span class="c7-seg-label">u+u+d (১%)</span>
            </div>
            <!-- Missing 99% segment -->
            <div class="c7-bar-seg missing-seg" style="width: 95.5%;" title="Missing Dynamical Energy: ~929 MeV (99.04%)">
              <span class="c7-seg-label">অদৃশ্য / সঞ্চিত QCD গতি ও ক্ষেত্রশক্তি (~৯২৯ MeV ≈ ৯৯%)</span>
            </div>
          </div>

          <div class="c7-bar-legend">
            <div class="c7-legend-item">
              <span class="c7-legend-dot val-dot"></span>
              <span class="c7-legend-txt">ভ্যালেন্স কোয়ার্কের কারেন্ট ভর: <strong>${valenceSum} MeV/c² (${valencePercentage}%)</strong></span>
            </div>
            <div class="c7-legend-item">
              <span class="c7-legend-dot missing-dot"></span>
              <span class="c7-legend-txt">গতি ও কনফাইনমেন্ট ক্ষেত্রশক্তি: <strong>${missingMassVal} MeV/c² (${missingPercentage}%)</strong></span>
            </div>
            <div class="c7-legend-item right">
              <span class="c7-legend-total">মোট প্রোটন ভর: <strong>${protonTotalMass} MeV/c²</strong> (PDG 2024)</span>
            </div>
          </div>
        </div>

        <!-- BAR B: MODERN JI MASS DECOMPOSITION (LATTICE QCD) -->
        <div class="c7-bar-panel highlight" id="c7-panel-bar-b">
          <div class="c7-bar-header">
            <div class="c7-bar-title-wrap">
              <span class="c7-bar-letter-tag modern">বার (b)</span>
              <h3 class="c7-bar-title">Ji-বিভাজন (lattice QCD; MS-bar μ = 2 GeV; Yang et al., PRL 121, 212001, 2018)</h3>
            </div>
            <div class="c7-tier-badge-wrap" id="c7-tier-ji"></div>
          </div>

          <p class="c7-bar-desc">
            ল্যাটিস QCD-তে এনার্জি-মোমেন্টাম টেনসর $T^{\mu\nu}$-এর সম্পূর্ণ কোয়ান্টাম ব্যবচ্ছেদ। 
            যেকোনো সেগমেন্টে ক্লিক করে বিস্তারিত অনিশ্চয়তা ও কোয়ান্টাম মেকানিজম পরীক্ষা করুন:
          </p>

          <!-- VISUAL STACKED BAR B WITH UNCERTAINTIES -->
          <div class="c7-stacked-bar-track ji-track" role="tablist" aria-label="Ji Mass Decomposition Components">
            <!-- 1. Quark Energy: 32% -->
            <button class="c7-bar-seg ji-seg quark-energy-seg active" 
                    id="seg-quarkEnergy" 
                    data-comp="quarkEnergy" 
                    style="width: 32%;" 
                    type="button" 
                    role="tab" 
                    aria-selected="true" 
                    title="Quark Energy: 32(4)(4)%">
              <span class="c7-seg-label">Quark Energy 32%</span>
              <span class="c7-seg-unc">±4(stat)±4(syst)</span>
            </button>

            <!-- 2. Glue Energy: 36% -->
            <button class="c7-bar-seg ji-seg glue-energy-seg" 
                    id="seg-glueEnergy" 
                    data-comp="glueEnergy" 
                    style="width: 36%;" 
                    type="button" 
                    role="tab" 
                    aria-selected="false" 
                    title="Glue Energy: 36(5)(4)%">
              <span class="c7-seg-label">Glue Energy 36%</span>
              <span class="c7-seg-unc">±5(stat)±4(syst)</span>
            </button>

            <!-- 3. Trace Anomaly: 23% -->
            <button class="c7-bar-seg ji-seg trace-anomaly-seg" 
                    id="seg-traceAnomaly" 
                    data-comp="traceAnomaly" 
                    style="width: 23%;" 
                    type="button" 
                    role="tab" 
                    aria-selected="false" 
                    title="Trace Anomaly: 23(1)(1)%">
              <span class="c7-seg-label">Trace Anomaly 23%</span>
              <span class="c7-seg-unc">±1(stat)±1(syst)</span>
            </button>

            <!-- 4. Quark Mass: 9% -->
            <button class="c7-bar-seg ji-seg quark-mass-seg" 
                    id="seg-quarkMassContribution" 
                    data-comp="quarkMassContribution" 
                    style="width: 9%;" 
                    type="button" 
                    role="tab" 
                    aria-selected="false" 
                    title="Quark Mass: 9(2)(1)%">
              <span class="c7-seg-label">Quark Mass 9%</span>
              <span class="c7-seg-unc">±2±1</span>
            </button>
          </div>

          <!-- UNCERTAINTIES SUMMARY ROW -->
          <div class="c7-unc-grid">
            <div class="c7-unc-card active" data-unc-target="quarkEnergy">
              <span class="c7-unc-title">কোয়ার্ক গতিশক্তি</span>
              <span class="c7-unc-val">32(4)(4)%</span>
              <span class="c7-unc-sub">≈ ৩০২ MeV/c²</span>
            </div>
            <div class="c7-unc-card" data-unc-target="glueEnergy">
              <span class="c7-unc-title">গ্লুয়ন ক্ষেত্রশক্তি</span>
              <span class="c7-unc-val">36(5)(4)%</span>
              <span class="c7-unc-sub">≈ ৩৩৮ MeV/c²</span>
            </div>
            <div class="c7-unc-card" data-unc-target="traceAnomaly">
              <span class="c7-unc-title">ট্রেস অ্যানোমালি</span>
              <span class="c7-unc-val">23(1)(1)%</span>
              <span class="c7-unc-sub">≈ ২১৬ MeV/c²</span>
            </div>
            <div class="c7-unc-card" data-unc-target="quarkMassContribution">
              <span class="c7-unc-title">কোয়ার্ক-ভর অংশ</span>
              <span class="c7-unc-val">9(2)(1)%</span>
              <span class="c7-unc-sub">≈ ৮৪ MeV/c²</span>
            </div>
          </div>
        </div>

      </section>

      <!-- INTERACTIVE COMPONENT DETAILS INSPECTOR -->
      <section class="c7-inspector-section" aria-label="Component Deep Dive">
        <div class="c7-inspector-card" id="c7-inspector-card">
          <!-- Rendered dynamically by renderComponentDetails() -->
        </div>
      </section>

      <!-- WHY (a) AND (b) ARE DIFFERENT PHYSICAL QUANTITIES -->
      <section class="c7-comparison-deepdive" aria-label="Why A and B are Different">
        <div class="c7-deepdive-card">
          <div class="c7-deepdive-header">
            <span class="c7-deepdive-pill">পদার্থবিজ্ঞান ব্যবচ্ছেদ</span>
            <h3 class="c7-deepdive-title">(a) ও (b) দুটি আলাদা রাশি — কেন এরা আলাদা?</h3>
          </div>

          <div class="c7-deepdive-grid">
            <div class="c7-box-perspective">
              <h4 class="c7-box-persp-title">বার (a): বিচ্ছিন্ন শূন্যস্থান কারেন্ট ভর (১%)</h4>
              <p class="c7-box-persp-desc">
                বার (a)-তে কেবল ৩টি ভ্যালেন্স কোয়ার্কের ($u, u, d$) শূন্যস্থানে নিজস্ব ভর বিবেচনা করা হয় 
                ($2.16 + 2.16 + 4.67 \approx 9\text{ MeV}$)। এটি একটি সাধারণ পাটিগণিতীয় যোগফল। 
                এতে কোয়ান্টাম ভ্যাকুয়াম ফ্লাকচুয়েশন, সি-কোয়ার্ক (sea quarks) কিংবা কাইরাল কনডেনসেটের কোনো অস্তিত্ব ধরা হয় না।
              </p>
            </div>

            <div class="c7-box-perspective highlight">
              <h4 class="c7-box-persp-title">বার (b): ফুল ডাইনামিক্যাল ল্যাটিস QCD টেনসর (৯%)</h4>
              <p class="c7-box-persp-desc">
                বার (b)-এর Ji-বিভাজনে ফুল ডাইনামিক্যাল ল্যাটিস এনার্জি-মোমেন্টাম টেনসর ব্যবচ্ছেদ করা হয়েছে। 
                প্রোটন কেবল ৩টি শান্ত কোয়ার্কের সমষ্টি নয়; ভেতরে ক্রমাগত ভার্চুয়াল গ্লুয়ন এবং ভার্চুয়াল সি-কোয়ার্ক 
                ($u\bar{u}, d\bar{d}, s\bar{s}$) সৃষ্টি ও ধ্বংস হচ্ছে। সি-কোয়ার্ক এবং কাইরাল কনডেনসেট 
                $\langle \bar{q}q \rangle$-এর অবদান যুক্ত থাকায় কোয়ার্ক-ভরের সামগ্রিক হিস্যা দাঁড়ায় <strong>প্রায় ৯%</strong> (≈ ৮৪ MeV)।
              </p>
            </div>
          </div>

          <div class="c7-emc2-conclusion">
            <div class="c7-emc2-formula-badge">E = mc²</div>
            <p class="c7-emc2-text">
              <strong>উপসংহার:</strong> প্রোটনের অবশিষ্ট প্রায় <strong>৯০% ভর ($৩২\% + ৩৬\% + ২৩\% = ৯১\%$)</strong> 
              সরাসরি QCD-র তীব্র গতিশক্তি ও কালার ক্ষেত্রশক্তি থেকে উৎপন্ন। আপনি যা কিছু স্পর্শ করেন, 
              তার ভর আসলে আবদ্ধ কোয়ান্টাম শক্তির গতিশীল রূপ!
            </p>
          </div>
        </div>
      </section>

      <!-- NAVIGATION CONTINUITY HUD -->
      <section class="c7-nav-footer" aria-label="Chapter Navigation">
        <div class="c7-nav-footer-inner">
          <a class="c7-nav-btn prev" href="#/quarks/chapter-6" id="c7-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c7-nav-btn-text">
              <span class="c7-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c7-nav-btn-title">অধ্যায় ৬: Hadron Builder</span>
            </div>
          </a>

          <div class="c7-nav-summary-box">
            <span class="c7-nav-tag">সম্পূর্ণ কোয়ার্ক ভিজ্যুয়ালাইজেশন সম্পন্ন</span>
            <p class="c7-nav-summary-desc">
              স্কেল-সিঁড়ি (০), প্রোটনের শরীর (১), Flavor ল্যাব (২), কালার ল্যাব (৩), Flux Tube ল্যাব (৪), টেনে ছেঁড়া (৫), 
              Hadron Builder (৬), এবং ভর কোথা থেকে আসে (৭) — সবকয়টি অধ্যায় সক্রিয় ও পরীক্ষিত।
            </p>
          </div>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTier = this.viewEl.querySelector('#c7-tier-header');
    if (headerTier) {
      headerTier.appendChild(createTierBadge('T1', { lang: this.lang }));
      headerTier.appendChild(createTierBadge('T2', { lang: this.lang }));
    }
    const jiTier = this.viewEl.querySelector('#c7-tier-ji');
    if (jiTier) {
      jiTier.appendChild(createTierBadge('T2', { lang: this.lang }));
    }

    // Bind Info Drawer
    this.viewEl.querySelector('#c7-btn-info').addEventListener('click', () => this.openInfoDrawer());

    // Bind segment buttons
    const segBtns = this.viewEl.querySelectorAll('.c7-bar-seg.ji-seg');
    segBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const compId = e.currentTarget.getAttribute('data-comp');
        this.selectComponent(compId);
      });
    });

    // Bind unc cards
    const uncCards = this.viewEl.querySelectorAll('.c7-unc-card');
    uncCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-unc-target');
        this.selectComponent(target);
      });
    });

    this.renderComponentDetails();
  }

  selectComponent(compId) {
    this.activeComponentId = compId;

    // Update active class on bar segments
    this.viewEl.querySelectorAll('.c7-bar-seg.ji-seg').forEach(btn => {
      const isMatch = btn.getAttribute('data-comp') === compId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // Update active class on unc cards
    this.viewEl.querySelectorAll('.c7-unc-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-unc-target') === compId);
    });

    this.renderComponentDetails();
  }

  renderComponentDetails() {
    const inspectorEl = this.viewEl.querySelector('#c7-inspector-card');
    if (!inspectorEl) return;

    const components = this.jiData.components;
    const comp = components[this.activeComponentId] || components.quarkEnergy;
    const totalMass = this.massOriginData.totalProtonMass.value;
    const approxMeV = ((comp.percentage / 100) * totalMass).toFixed(1);

    inspectorEl.innerHTML = `
      <div class="c7-insp-header">
        <div class="c7-insp-title-row">
          <span class="c7-insp-color-pill" style="background: ${comp.colorHex};"></span>
          <h4 class="c7-insp-title">${comp.nameBn}</h4>
          <span class="c7-insp-title-en">(${comp.nameEn})</span>
        </div>
        <div class="c7-insp-stat-badge">
          <span class="c7-insp-pct">${comp.notation}</span>
          <span class="c7-insp-mev">≈ ${approxMeV} MeV/c²</span>
        </div>
      </div>

      <div class="c7-insp-body">
        <p class="c7-insp-desc">${comp.descriptionBn}</p>
        
        <div class="c7-insp-meta-grid">
          <div class="c7-insp-meta-box">
            <span class="c7-insp-meta-lbl">মোট ভরের শতাংশ:</span>
            <span class="c7-insp-meta-val">${comp.percentage}%</span>
          </div>
          <div class="c7-insp-meta-box">
            <span class="c7-insp-meta-lbl">পরিসংখ্যানিক অনিশ্চয়তা (stat):</span>
            <span class="c7-insp-meta-val">±${comp.statUncertainty}%</span>
          </div>
          <div class="c7-insp-meta-box">
            <span class="c7-insp-meta-lbl">পদ্ধতিগত অনিশ্চয়তা (syst):</span>
            <span class="c7-insp-meta-val">±${comp.systUncertainty}%</span>
          </div>
          <div class="c7-insp-meta-box">
            <span class="c7-insp-meta-lbl">ল্যাটিস কম্পিউটেশন স্কিম:</span>
            <span class="c7-insp-meta-val">MS-bar (μ = 2 GeV)</span>
          </div>
        </div>

        <div class="c7-insp-citation-row">
          <span class="c7-insp-cite-lbl">গবেষণাপত্র সূত্র:</span>
          <span class="c7-insp-cite-txt">${this.jiData.fullCitation}</span>
        </div>
      </div>
    `;
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      titleBn: 'অধ্যায় ৭: প্রোটন ভর বিভাজন ও ল্যাটিস QCD অডিট',
      titleEn: 'Chapter 7: Proton Mass Decomposition & Lattice QCD Audit',
      tier: 'T2',
      sections: [
        {
          headingBn: 'Ji-ভর বিভাজনের তাত্ত্বিক ভিত্তি',
          headingEn: 'Theoretical Foundation of Ji Mass Decomposition',
          contentBn: `
            ১৯৯৫ সালে জিয়াংডং জি (Xiangdong Ji, Phys. Rev. Lett. 74, 1071) প্রোটনের এনার্জি-মোমেন্টাম 
            টেনসরকে ($T^{\mu\nu}$) গেজ-ইনভ্যারিয়েন্ট ৪টি অংশে বিভাজনের প্রস্তাব দেন:
            M = M_q + M_g + M_m + M_a
            যেখানে:
            • M_q = কোয়ার্ক গতিশক্তি ও কোয়ার্ক ফিল্ডের শক্তি (৩২%)
            • M_g = গ্লুয়ন ক্ষেত্রশক্তি (৩৬%)
            • M_a = কোয়ান্টাম স্কেল অসঙ্গতি বা ট্রেস অ্যানোমালি (২৩%)
            • M_m = হিগস মেকানিজম থেকে উৎপন্ন কোয়ার্ক-ভরের অবদান (৯%)
          `
        },
        {
          headingBn: 'স্কেল নির্ভরতা ও রিনর্মালাইজেশন স্কিম',
          headingEn: 'Scale Dependence and Renormalization Scheme',
          contentBn: `
            যেহেতু শক্তিশালী মিথস্ক্রিয়ার কাপলিং কনস্ট্যান্ট $\\alpha_s(\\mu)$ এনার্জি স্কেলের সাথে পরিবর্তিত হয়, 
            তাই কোয়ার্ক গতিশক্তি ও গ্লুয়ন ক্ষেত্রশক্তির মধ্যে আপেক্ষিক অনুপাত রিনর্মালাইজেশন স্কেল $\\mu$-এর ওপর নির্ভর করে। 
            ইয়াং ও তাঁর সহকর্মীদের ২০১৮ সালের ল্যাটিস বিশ্লেষণে $\\overline{\\text{MS}}$ স্কিম এবং স্ট্যান্ডার্ড রেফারেন্স স্কেল 
            $\\mu = 2\\text{ GeV}$ নির্ধারণ করা হয়েছে।
          `
        },
        {
          headingBn: 'হিগস মেকানিজম ও দৃশ্যমান মহাবিশ্বের ভর',
          headingEn: 'Higgs Mechanism and Visible Universe Mass',
          contentBn: `
            হিগস ফিল্ড মৌলিক কোয়ার্ক ও লেপটনকে ভর দেয় (ইউকাওয়া মিথস্ক্রিয়ার মাধ্যমে)। 
            কিন্তু এটি কেবল মুক্ত কণার জন্য সরাসরি কার্যকর। দৃশ্যমান মহাবিশ্বে প্রোটনের মোট ভরের মাত্র প্রায় ৯% হিগস-সংশ্লিষ্ট, 
            আর অবশিষ্ট ৯১% ভর কনফাইনমেন্টের আবদ্ধ গতিশক্তি ও কোয়ান্টাম ট্রেস অ্যানোমালি ($E = mc^2$) থেকে উৎপন্ন।
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
