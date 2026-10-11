/**
 * CosmoPlanck Quark Section - Chapter 13: "অজানা ও অমীমাংসিত" (Unsolved Mysteries & Frontiers of QCD)
 * 
 * Scientific Fidelity & Features:
 * 1. 10 Core Frontiers & Mysteries with Strict Status Tags:
 *    1) Confinement-এর কঠোর প্রমাণ ও Mass Gap (Clay Millennium Problem) -> অমীমাংসিত (Unsolved)
 *    2) প্রোটন-spin বণ্টন -> আংশিক জানা (Partially Known)
 *    3) Exotic হ্যাড্রনের গঠন (মেসন-অণু বনাম কম্প্যাক্ট) -> বিতর্কিত (Debated)
 *    4) Glueball (বিশুদ্ধ গ্লুয়ন অবস্থা) -> অনুমিত (Hypothesized)
 *    5) QCD phase diagram-এর critical point -> অজানা (Unknown)
 *    6) Strong CP সমস্যা (θ-পদ প্রায় শূন্য; axion প্রস্তাব) -> অমীমাংসিত (Unsolved)
 *    7) কোয়ার্কে গঠন আছে কি? (< 10^-18 m সীমা) -> অজানা (Unknown)
 *    8) ঘন কোয়ার্ক-পদার্থ (CFL, কালার সুপারকন্ডাক্টিভিটি) -> অনুমান (Speculative)
 *    9) Toponium-ব্যাখ্যা (CMS/ATLAS 2025 tt_bar থ্রেশহোল্ড) -> চলমান (Ongoing)
 *    10) Intrinsic charm (NNPDF, Nature 2022) -> ইঙ্গিত / বিতর্কিত (Evidence / Debated)
 * 2. CosmoPlanck "জানা-অজানা" Theme Continuity:
 *    - Connects subatomic quark frontiers to the 17-order Planck desert and cosmological origins.
 * 3. Interactive Filtering:
 *    - Filter by status (all, unsolved, debated, unknown, speculative, ongoing).
 * 4. Audit Drawer:
 *    - Formal academic references (Clay Millennium, PRL, Nature, PDG).
 * 5. Strictly zero unicode emojis across code and UI.
 */

import {
  getUnsolvedMysteriesData,
  UNSOLVED_MYSTERIES
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_COMPASS_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>';
const ICON_ALERT_SVG = '<svg class="c13-icon-badge alert" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_FILTER_SVG = '<svg class="c13-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';

export class Chapter13Unsolved {
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

    this.mysteriesData = getUnsolvedMysteriesData();
    this.activeFilter = 'all'; // 'all' | 'unsolved' | 'debated' | 'unknown' | 'speculative' | 'ongoing'

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-13-view';
    this.viewEl.id = 'chapter-13-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c13-header-section" aria-label="Chapter 13 Header">
        <div class="c13-header-top">
          <div class="c13-title-block">
            <div class="c13-pill-row">
              <span class="c13-chapter-badge">অধ্যায় ১৩</span>
              <span class="c13-tier-badge-wrap" id="c13-tier-header"></span>
              <span class="c13-scheme-tag">Frontiers of QCD & Particle Physics</span>
            </div>
            <h2 class="c13-main-title">অজানা ও অমীমাংসিত রহস্য (Unsolved Mysteries)</h2>
            <p class="c13-subtitle">কসমোপ্ল্যাঙ্কের “জানা-অজানা” থিম: বিজ্ঞানের সীমানা যেখানে শেষ, এরপর শুরু অনন্ত জিজ্ঞাসা</p>
          </div>

          <div class="c13-header-actions">
            <button class="c13-btn-outline" id="c13-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>মিলেনিয়াম প্রাইজ ও QCD অডিট</span>
            </button>
          </div>
        </div>

        <!-- HERO INTRO CARD -->
        <div class="c13-intro-card">
          <div class="c13-intro-quote-badge">
            ${ICON_COMPASS_SVG}
            <span>১০টি মুক্ত প্রশ্ন | গণিতের $১,০০০,০০০ মিলেনিয়াম পুরস্কার থেকে লার্জ হ্যাড্রন কোলাইডার</span>
          </div>
          <p class="c13-intro-text">
            স্ট্যান্ডার্ড মডেল বিজ্ঞানের ইতিহাসে সবচেয়ে সফল ও অভ্রান্ত প্রমাণিত তত্ত্বগুলোর একটি। 
            তবুও কোয়ার্ক ও সবল বলের গভীরে এমন কিছু বিস্ময়কর শূন্যস্থান রয়েছে, যার সমাধান আধুনিক পদার্থবিজ্ঞানের 
            সবচেয়ে বড় রহস্য। কনফাইনমেন্টের গাণিতিক প্রমাণ থেকে শুরু করে প্রোটন স্পিন, গ্লুবল ও ডার্ক ম্যাটার অ্যাক্সিয়ন—এখানেই 
            গবেষণার তপ্ত সীমান্ত।
          </p>
        </div>
      </section>

      <!-- FILTER CONTROLS BAR -->
      <section class="c13-filter-section" aria-label="Filter Mysteries by Scientific Status">
        <div class="c13-filter-bar">
          <div class="c13-filter-label">
            ${ICON_FILTER_SVG}
            <span>অবস্থা অনুযায়ী ফিল্টার:</span>
          </div>
          <div class="c13-filter-buttons">
            <button class="c13-flt-btn active" data-filter="all">সব রহস্য (১০)</button>
            <button class="c13-flt-btn" data-filter="unsolved">অমীমাংসিত (২)</button>
            <button class="c13-flt-btn" data-filter="debated">বিতর্কিত (২)</button>
            <button class="c13-flt-btn" data-filter="unknown">অজানা (২)</button>
            <button class="c13-flt-btn" data-filter="speculative">অনুমান / অনুমিত (২)</button>
            <button class="c13-flt-btn" data-filter="partially_known">আংশিক জানা (১)</button>
            <button class="c13-flt-btn" data-filter="ongoing">চলমান গবেষণা (১)</button>
          </div>
        </div>
      </section>

      <!-- 10 CARDS GRID -->
      <section class="c13-grid-section" aria-label="10 Unsolved Frontiers Cards Grid">
        <div class="c13-cards-grid" id="c13-cards-grid">
          <!-- Rendered via JS -->
        </div>
      </section>

      <!-- CHAPTER NAVIGATION FOOTER -->
      <footer class="c13-footer-nav" aria-label="Chapter Navigation">
        <button class="c13-nav-btn prev" id="c13-btn-prev" type="button">
          ${ICON_ARROW_LEFT_SVG}
          <div class="c13-btn-text-wrap">
            <span class="c13-nav-dir">পূর্ববর্তী অধ্যায়</span>
            <span class="c13-nav-label">অধ্যায় ১২: প্রোটনের spin ধাঁধা</span>
          </div>
        </button>

        <div class="c13-nav-summary">
          <span class="c13-sum-pill">জানা শেষ, এরপর অজানা</span>
          <span class="c13-sum-text">১০টি সীমান্ত ও অমীমাংসিত তত্ত্ব</span>
        </div>

        <button class="c13-nav-btn next" id="c13-btn-next" type="button">
          <div class="c13-btn-text-wrap" style="text-align: right;">
            <span class="c13-nav-dir">পরবর্তী অধ্যায়</span>
            <span class="c13-nav-label">অধ্যায় ১৪: ইতিহাস, Myth vs Fact ও শব্দকোষ</span>
          </div>
          ${ICON_ARROW_RIGHT_SVG}
        </button>
      </footer>
    `;

    this.container.appendChild(this.viewEl);

    // Initialize Tier Badge
    const tierWrap = this.viewEl.querySelector('#c13-tier-header');
    if (tierWrap) {
      const badge = createTierBadge('T2', this.lang);
      tierWrap.appendChild(badge);
    }

    this.bindEvents();
    this.renderCards();
  }

  bindEvents() {
    // Info drawer trigger
    const infoBtn = this.viewEl.querySelector('#c13-btn-info');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.openAuditDrawer());
    }

    // Filter buttons
    const filterBtns = this.viewEl.querySelectorAll('.c13-flt-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.activeFilter = filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderCards();
      });
    });

    // Chapter Navigation Buttons
    const prevBtn = this.viewEl.querySelector('#c13-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-12';
      });
    }

    const nextBtn = this.viewEl.querySelector('#c13-btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-14';
      });
    }
  }

  renderCards() {
    const grid = this.viewEl.querySelector('#c13-cards-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const items = this.mysteriesData.items;

    const filteredItems = items.filter(item => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'unsolved') return item.statusTag === 'unsolved';
      if (this.activeFilter === 'debated') return item.statusTag === 'debated';
      if (this.activeFilter === 'unknown') return item.statusTag === 'unknown';
      if (this.activeFilter === 'speculative') return (item.statusTag === 'speculative' || item.statusTag === 'hypothesized');
      if (this.activeFilter === 'partially_known') return item.statusTag === 'partially_known';
      if (this.activeFilter === 'ongoing') return item.statusTag === 'ongoing';
      return true;
    });

    filteredItems.forEach(item => {
      const card = document.createElement('article');
      card.className = `c13-card status-${item.statusTag}`;
      card.id = `card-${item.id}`;

      const bountyHtml = item.bounty ? `
        <div class="c13-bounty-badge">
          ${ICON_ALERT_SVG}
          <span>${item.bounty}</span>
        </div>
      ` : '';

      card.innerHTML = `
        <div class="c13-card-top">
          <div class="c13-num-wrap">
            <span class="c13-num">${item.num}</span>
            <span class="c13-status-tag tag-${item.statusTag}">${item.statusBn}</span>
            <span class="c13-card-tier">${item.tier}</span>
          </div>
          ${bountyHtml}
        </div>

        <h3 class="c13-card-title">${item.titleBn}</h3>
        <span class="c13-card-subtitle-en">${item.titleEn}</span>

        <p class="c13-card-desc">${item.descriptionBn}</p>

        <div class="c13-card-details">
          <div class="c13-detail-row">
            <span class="detail-label">গবেষণাগার / প্রতিষ্ঠান:</span>
            <span class="detail-val">${item.institution}</span>
          </div>
          <p class="c13-physics-deep">${item.physicsDetailsBn}</p>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  openAuditDrawer() {
    if (!this.infoDrawer) return;

    const content = `
      <div class="audit-drawer-content">
        <h3>অজানা ও অমীমাংসিত QCD রহস্যের একাডেমিক অডিট</h3>
        <p><strong>বৈজ্ঞানিক দর্শন:</strong> সত্য ও প্রমাণের প্রতি অবিচল নিষ্ঠা — যা জানা যায়নি তাকে সুস্পষ্টভাবে 'অজানা' ও 'বিতর্কিত' হিসেবে চিহ্নিত করা।</p>
        <p><strong>সত্যতা-স্তর (Truth Tier):</strong> T2 (Theoretical Frontiers & Experimental Inquiries)</p>
        
        <h4>প্রধান তথ্যসূত্র ও রেফারেন্স:</h4>
        <ul>
          <li>
            <strong>১. ইয়াং-মিলস অস্তিত্ব ও ম্যাস গ্যাপ (Clay Millennium Problem):</strong><br>
            <em>Arthur Jaffe and Edward Witten, Clay Mathematics Institute Millennium Prize Problem Description (2000).</em><br>
            গণিতবিদদের জন্য উন্মুক্ত এক মিলিয়ন ডলারের চ্যালেঞ্জ।
          </li>
          <li>
            <strong>২. প্রোটন স্পিন ধাঁধা (EMC & RHIC Spin):</strong><br>
            <em>J. Ashman et al. (EMC), Phys. Lett. B 206 (1988) 364; D. de Florian et al., PRL 113 (2014) 012001.</em>
          </li>
          <li>
            <strong>৩. এক্সোটিক টেট্রাকোয়ার্ক ও পেন্টাকোয়ার্কের প্রকৃতি:</strong><br>
            <em>R. Aaij et al. (LHCb Collaboration), Phys. Rev. Lett. 122 (2019) 222001; Phys. Rev. Lett. 115 (2015) 072001.</em>
          </li>
          <li>
            <strong>৪. ল্যাটিস QCD গ্লুবল স্পেকট্রাম:</strong><br>
            <em>C.J. Morningstar & M. Peardon, Phys. Rev. D 60 (1999) 034509; BESIII Collaboration searches.</em>
          </li>
          <li>
            <strong>৫. স্ট্রং সিপি সমস্যা ও অ্যাক্সিয়ন:</strong><br>
            <em>R.D. Peccei & H.R. Quinn, Phys. Rev. Lett. 38 (1977) 1440; S. Weinberg, Phys. Rev. Lett. 40 (1978) 223.</em>
          </li>
          <li>
            <strong>৬. প্রোটনে Intrinsic Charm-এর প্রমাণ:</strong><br>
            <em>The NNPDF Collaboration, "Evidence for the intrinsic charm quark in the proton", Nature 608 (2022) 483-487.</em>
          </li>
          <li>
            <strong>৭. Toponium tt̄ থ্রেশহোল্ড সংকেত (২০২৪-২০২৫):</strong><br>
            <em>CMS Collaboration, CMS-PAS-TOP-24-001; ATLAS Collaboration, ATLAS-CONF-2025-002 (CERN).</em>
          </li>
        </ul>
      </div>
    `;

    this.infoDrawer.open({
      title: 'QCD অজানা দিগন্ত — বৈজ্ঞানিক অডিট (Tier T2)',
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
