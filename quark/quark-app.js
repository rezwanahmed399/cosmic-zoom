/**
 * CosmoPlanck Quark Section Router & App Shell
 * Manages section landing, chapter routing (individual URLs), navigation,
 * level switcher ("সহজ / মাঝারি / বিশেষজ্ঞ"), and upcoming chapter placeholders.
 */

import { InfoDrawer } from '../components/info-drawer.js';
import { createTierBadge } from '../components/tier-badge.js';
import { Chapter0ScaleLadder } from './chapter-0.js';
import { Chapter1Proton } from './chapter-1.js';
import { Chapter2FlavorLab } from './chapter-2.js';
import { Chapter3ColorLab } from './chapter-3.js';
import { Chapter4FluxTubeLab } from './chapter-4.js';
import { Chapter5StringBreaking } from './chapter-5.js';
import { Chapter6HadronBuilder } from './chapter-6.js';
import { Chapter7MassOrigin } from './chapter-7.js';
import { Chapter8ResolutionSlider } from './chapter-8.js';
import { Chapter9AsymptoticFreedom } from './chapter-9.js';
import { Chapter10EvidenceLab } from './chapter-10.js';
import { Chapter11QGP } from './chapter-11.js';
import { Chapter12SpinPuzzle } from './chapter-12.js';
import { Chapter13Unsolved } from './chapter-13.js';
import { Chapter14HistoryQuizGlossary } from './chapter-14.js';

export const CHAPTER_LIST = [
  {
    id: 'chapter-0',
    hash: '#/quarks/chapter-0',
    numberBn: '০',
    numberEn: '0',
    titleBn: 'স্কেল-সিঁড়ি',
    titleEn: 'Scale Ladder',
    subtitleBn: 'পরমাণু থেকে কোয়ার্ক ও প্ল্যাঙ্ক সীমার ব্যবধান',
    subtitleEn: 'From Atom to Quark & The 17-Order Planck Gap',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-1',
    hash: '#/quarks/chapter-1',
    numberBn: '১',
    numberEn: '1',
    titleBn: 'প্রোটনের শরীর',
    titleEn: "The Proton's Body",
    subtitleBn: 'ভ্যালেন্স কোয়ার্ক, Y-টিউব ও গ্লুয়ন বিনিময়',
    subtitleEn: 'Valence Quarks, Y-Tubes & Gluon Exchange',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-2',
    hash: '#/quarks/chapter-2',
    numberBn: '২',
    numberEn: '2',
    titleBn: 'Flavor ল্যাব',
    titleEn: 'Flavor Lab',
    subtitleBn: '৬ কোয়ার্ক, ৮ ঘাতের ভর ব্যবধান ও নিউট্রন ক্ষয়',
    subtitleEn: '6 Quarks, 8-Order Mass Span & Neutron Decay',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-3',
    hash: '#/quarks/chapter-3',
    numberBn: '৩',
    numberEn: '3',
    titleBn: 'কালার ল্যাব',
    titleEn: 'Color Lab',
    subtitleBn: 'রঙ-চাকা, সাদা বানাও খেলা ও ৮টি গ্লুয়ন',
    subtitleEn: 'Color Wheel, Make White Lab & 8 Gluons',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-4',
    hash: '#/quarks/chapter-4',
    numberBn: '৪',
    numberEn: '4',
    titleBn: 'Flux Tube ল্যাব',
    titleEn: 'Flux Tube Lab',
    subtitleBn: 'ক্ষেত্ররেখা সংকোচন, মেসন V(r) ও ব্যারিয়ন Y-ল্যাব',
    subtitleEn: 'Field Line Compression, Meson V(r) & Baryon Y-Lab',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-5',
    hash: '#/quarks/chapter-5',
    numberBn: '৫',
    numberEn: '5',
    titleBn: 'টেনে ছেঁড়া (মোড A)',
    titleEn: 'String Breaking (Mode A)',
    subtitleBn: 'ধীর টান, ফ্লাক্স টিউব সংকট ও হ্যাড্রোনাইজেশন',
    subtitleEn: 'Slow Pull, Flux Tube Criticality & Hadronization',
    tier: 'T3',
    isAvailable: true
  },
  {
    id: 'chapter-6',
    hash: '#/quarks/chapter-6',
    numberBn: '৬',
    numberEn: '6',
    titleBn: 'Hadron Builder',
    titleEn: 'Hadron Builder',
    subtitleBn: 'কোয়ার্ক স্লট, কালার-সিঙ্গলেট যাচাই ও এক্সোটিক গ্যালারি',
    subtitleEn: 'Quark Slots, Color-Singlet Validation & Exotic Gallery',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-7',
    hash: '#/quarks/chapter-7',
    numberBn: '৭',
    numberEn: '7',
    titleBn: 'ভর কোথা থেকে আসে',
    titleEn: 'Origin of Mass',
    subtitleBn: 'প্রোটন ভর বিভাজন, হিগস বনাম QCD কনফাইনমেন্ট শক্তি (E = mc²)',
    subtitleEn: 'Proton Mass Decomposition, Higgs vs QCD Confinement (E = mc²)',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-8',
    hash: '#/quarks/chapter-8',
    numberBn: '৮',
    numberEn: '8',
    titleBn: 'রেজোলিউশন-স্লাইডার',
    titleEn: 'Resolution Slider (PDF)',
    subtitleBn: 'Q² বৃদ্ধি, x·f(x, Q²) পার্টন ডিস্ট্রিবিউশন ফাংশন ও গ্লুয়ন ভরবেগ',
    subtitleEn: 'Q² Evolution, x·f(x, Q²) Parton Distributions & Gluon Momentum',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-9',
    hash: '#/quarks/chapter-9',
    numberBn: '৯',
    numberEn: '9',
    titleBn: 'Asymptotic freedom',
    titleEn: 'Asymptotic Freedom',
    subtitleBn: 'উচ্চ শক্তিতে কোয়ার্কের স্বাধীনতা, রানিং কাপলিং α_s(Q) ও ২০০৪ নোবেল',
    subtitleEn: 'Quark Freedom at High Energy, Running Coupling alpha_s(Q) & 2004 Nobel',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-10',
    hash: '#/quarks/chapter-10',
    numberBn: '১০',
    numberEn: '10',
    titleBn: 'কীভাবে জানলাম?',
    titleEn: 'How Do We Know? (Evidence Lab)',
    subtitleBn: 'R-ratio সিঁড়ি (N_c = ৩ এর প্রমাণ) এবং ৫টি ঐতিহাসিক অকাট্য পরীক্ষা',
    subtitleEn: 'R-Ratio Staircase (Proof of N_c = 3) & 5 Historic Experiments',
    tier: 'T1',
    isAvailable: true
  },
  {
    id: 'chapter-11',
    hash: '#/quarks/chapter-11',
    numberBn: '১১',
    numberEn: '11',
    titleBn: 'আদি মহাবিশ্ব ও QGP',
    titleEn: 'Early Universe & QGP',
    subtitleBn: 'T_c ≈ ১৫৬.৫ MeV সংকট বিন্দু, মসৃণ ক্রসওভার ও কসমিক হ্যাড্রোনাইজেশন',
    subtitleEn: 'T_c ≈ 156.5 MeV Crossover & Quark-Gluon Plasma',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-12',
    hash: '#/quarks/chapter-12',
    numberBn: '১২',
    numberEn: '12',
    titleBn: 'প্রোটনের spin ধাঁধা',
    titleEn: 'Proton Spin Puzzle',
    subtitleBn: '১/২ = ১/২ ΔΣ + ΔG + L_q + L_g, EMC স্পিন ক্রাইসিস ও আধুনিক রহস্য',
    subtitleEn: '1/2 = 1/2 ΔΣ + ΔG + L_q + L_g, EMC Spin Crisis & Modern Mystery',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-13',
    hash: '#/quarks/chapter-13',
    numberBn: '১৩',
    numberEn: '13',
    titleBn: 'অজানা ও অমীমাংসিত',
    titleEn: 'Unsolved Mysteries',
    subtitleBn: 'কনফাইনমেন্ট প্রমাণ, ম্যাস গ্যাপ, এক্সোটিক গঠন ও প্ল্যাঙ্ক সীমার অমীমাংসিত প্রশ্ন',
    subtitleEn: 'Confinement Proof, Mass Gap, Exotic Structures & Unsolved Frontiers',
    tier: 'T2',
    isAvailable: true
  },
  {
    id: 'chapter-14',
    hash: '#/quarks/chapter-14',
    numberBn: '১৪',
    numberEn: '14',
    titleBn: 'ইতিহাস, Myth vs Fact ও শব্দকোষ',
    titleEn: 'History, Myths, Quiz & Glossary',
    subtitleBn: 'ঐতিহাসিক টাইমলাইন, ১৩টি ভ্রান্তি নিরসন, ইন্টারঅ্যাক্টিভ কুইজ ও শব্দকোষ',
    subtitleEn: 'Historical Timeline, 13 Myths vs Facts, Interactive Quiz & Glossary',
    tier: 'T1',
    isAvailable: true
  }
];

export class QuarkApp {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.mountPoint - DOM element where the section is rendered
   * @param {'en'|'bn'} [options.lang='en'] - UI language
   * @param {Function} [options.onExit] - Callback when user exits back to macro cosmic zoom
   */
  constructor({ mountPoint, lang = 'en', onExit = null }) {
    this.mountPoint = mountPoint;
    this.lang = lang;
    this.onExit = onExit;

    // Pedagogy level: 'basic' (সহজ), 'intermediate' (মাঝারি), 'expert' (বিশেষজ্ঞ)
    this.level = 'basic';
    this.activeChapterId = 'chapter-1';
    this.currentChapterInstance = null;

    // Shared scientific audit ⓘ InfoDrawer
    this.infoDrawer = new InfoDrawer({
      container: document.body,
      lang: this.lang,
      onReportError: (data) => this.handleReportError(data)
    });

    this.initDOM();
    this.initRouter();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'quark-section-root';
    this.container.id = 'quark-section-root';

    this.container.innerHTML = `
      <!-- TOP QUARK HEADER & NAVIGATION HUD -->
      <header class="quark-header">
        <div class="quark-header-left">
          <!-- Back to Cosmic Zoom Button -->
          <button class="quark-nav-back-btn" id="quark-btn-exit" type="button" aria-label="Back to Cosmic Zoom">
            <svg class="quark-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            <span class="quark-back-text" id="quark-lbl-back">কসমিক জুমে ফিরুন</span>
          </button>

          <div class="quark-brand-block">
            <div class="quark-brand-badge">
              <span class="quark-brand-icon">
                <svg class="quark-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <circle cx="6" cy="6" r="2"></circle>
                  <circle cx="18" cy="6" r="2"></circle>
                  <circle cx="12" cy="18" r="2"></circle>
                  <line x1="12" y1="12" x2="6" y2="6"></line>
                  <line x1="12" y1="12" x2="18" y2="6"></line>
                  <line x1="12" y1="12" x2="12" y2="18"></line>
                </svg>
              </span>
              <h1 class="quark-brand-title">CosmoPlanck / কোয়ার্ক জগত</h1>
            </div>
            <p class="quark-brand-subtitle" id="quark-lbl-subtitle">অতিপারমাণবিক স্কেলের বৈজ্ঞানিক ভিজুয়ালাইজেশন</p>
          </div>
        </div>

        <div class="quark-header-right">
          <!-- Pedagogy Level Switcher (সহজ / মাঝারি / বিশেষজ্ঞ) -->
          <div class="quark-level-switcher" role="radiogroup" aria-label="Scientific detail level">
            <span class="quark-level-title" id="quark-lbl-level-prompt">স্তর:</span>
            <div class="quark-level-pill-group">
              <button class="quark-level-btn active" id="quark-lvl-basic" type="button" role="radio" aria-checked="true" data-level="basic">
                সহজ
              </button>
              <button class="quark-level-btn" id="quark-lvl-intermediate" type="button" role="radio" aria-checked="false" data-level="intermediate">
                মাঝারি
              </button>
              <button class="quark-level-btn" id="quark-lvl-expert" type="button" role="radio" aria-checked="false" data-level="expert">
                বিশেষজ্ঞ
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- CHAPTER ROUTE NAVIGATION BAR -->
      <nav class="quark-chapters-nav" aria-label="Quark Chapters Navigation">
        <div class="quark-nav-scroll" id="quark-chapters-nav-list"></div>
      </nav>

      <!-- MAIN CHAPTER VIEWPORT CONTAINER -->
      <main class="quark-main-viewport" id="quark-main-viewport" tabindex="-1">
        <!-- Rendered dynamically by routeChapter() -->
      </main>
    `;

    this.mountPoint.appendChild(this.container);

    // Event listeners
    this.container.querySelector('#quark-btn-exit').addEventListener('click', () => {
      this.closeSection();
    });

    // Level buttons
    const lvlBtns = this.container.querySelectorAll('.quark-level-btn');
    lvlBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.currentTarget.getAttribute('data-level');
        this.setLevel(selected);
      });
    });

    this.renderChaptersNav();
    this.updateLanguageStrings();
  }

  renderChaptersNav() {
    const listEl = this.container.querySelector('#quark-chapters-nav-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const isBn = this.lang === 'bn';

    CHAPTER_LIST.forEach(ch => {
      const btn = document.createElement('a');
      btn.className = `quark-ch-tab ${ch.id === this.activeChapterId ? 'active' : ''} ${!ch.isAvailable ? 'disabled' : ''}`;
      btn.href = ch.hash;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', ch.id === this.activeChapterId ? 'true' : 'false');
      btn.id = `tab-${ch.id}`;

      btn.innerHTML = `
        <span class="quark-tab-num">${isBn ? ch.numberBn : ch.numberEn}</span>
        <span class="quark-tab-meta">
          <span class="quark-tab-title">${isBn ? ch.titleBn : ch.titleEn}</span>
          ${!ch.isAvailable ? `<span class="quark-tab-tag soon">${isBn ? 'শীঘ্রই' : 'Soon'}</span>` : ''}
        </span>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = ch.hash;
      });

      listEl.appendChild(btn);
    });
  }

  initRouter() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash || '';

    if (hash.startsWith('#/quarks')) {
      this.show();

      // Route chapter
      const parts = hash.split('/');
      const chParam = parts[2]; // e.g. 'chapter-1'

      if (chParam && CHAPTER_LIST.some(c => c.id === chParam)) {
        this.routeChapter(chParam);
      } else {
        // Default to chapter-0 (the section entrance gateway)
        this.routeChapter('chapter-0');
      }
    }
  }

  show() {
    if (this.mountPoint) this.mountPoint.style.display = 'block';
    this.container.style.display = 'flex';
  }

  hide() {
    if (this.mountPoint) this.mountPoint.style.display = 'none';
    this.container.style.display = 'none';
  }

  closeSection() {
    this.hide();
    if (this.currentChapterInstance && typeof this.currentChapterInstance.destroy === 'function') {
      this.currentChapterInstance.destroy();
      this.currentChapterInstance = null;
    }

    if (typeof this.onExit === 'function') {
      this.onExit();
    } else {
      window.location.hash = '#s=0.0';
    }
  }

  routeChapter(chapterId) {
    this.activeChapterId = chapterId;
    this.renderChaptersNav();

    const viewport = this.container.querySelector('#quark-main-viewport');
    if (!viewport) return;

    // Clean previous instance
    if (this.currentChapterInstance && typeof this.currentChapterInstance.destroy === 'function') {
      this.currentChapterInstance.destroy();
      this.currentChapterInstance = null;
    }
    viewport.innerHTML = '';

    const chMeta = CHAPTER_LIST.find(c => c.id === chapterId);
    if (!chMeta) return;

    if (chMeta.isAvailable && chapterId === 'chapter-0') {
      // Mount Chapter 0 Scale Ladder Gateway!
      this.currentChapterInstance = new Chapter0ScaleLadder({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-1') {
      // Mount Chapter 1 Proton Hero Interactive!
      this.currentChapterInstance = new Chapter1Proton({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-2') {
      // Mount Chapter 2 Flavor Lab!
      this.currentChapterInstance = new Chapter2FlavorLab({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-3') {
      // Mount Chapter 3 Color Lab!
      this.currentChapterInstance = new Chapter3ColorLab({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-4') {
      // Mount Chapter 4 Flux Tube Lab!
      this.currentChapterInstance = new Chapter4FluxTubeLab({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-5') {
      // Mount Chapter 5 String Breaking (Mode A)!
      this.currentChapterInstance = new Chapter5StringBreaking({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-6') {
      // Mount Chapter 6 Hadron Builder!
      this.currentChapterInstance = new Chapter6HadronBuilder({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-7') {
      // Mount Chapter 7 Origin of Mass!
      this.currentChapterInstance = new Chapter7MassOrigin({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-8') {
      // Mount Chapter 8 Resolution Slider (PDF)!
      this.currentChapterInstance = new Chapter8ResolutionSlider({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-9') {
      // Mount Chapter 9 Asymptotic Freedom!
      this.currentChapterInstance = new Chapter9AsymptoticFreedom({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-10') {
      // Mount Chapter 10 Evidence Lab!
      this.currentChapterInstance = new Chapter10EvidenceLab({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-11') {
      // Mount Chapter 11 Early Universe & QGP!
      this.currentChapterInstance = new Chapter11QGP({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-12') {
      // Mount Chapter 12 Proton Spin Puzzle!
      this.currentChapterInstance = new Chapter12SpinPuzzle({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-13') {
      // Mount Chapter 13 Unsolved Mysteries!
      this.currentChapterInstance = new Chapter13Unsolved({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else if (chMeta.isAvailable && chapterId === 'chapter-14') {
      // Mount Chapter 14 History, Myths, Quiz & Glossary!
      this.currentChapterInstance = new Chapter14HistoryQuizGlossary({
        container: viewport,
        lang: this.lang,
        level: this.level,
        infoDrawer: this.infoDrawer
      });
    } else {
      // Render "শীঘ্রই" (Coming Soon) Rich Placeholder Card
      this.renderPlaceholderChapter(viewport, chMeta);
    }

    viewport.focus();
  }

  renderPlaceholderChapter(viewport, chMeta) {
    const isBn = this.lang === 'bn';

    const placeholder = document.createElement('div');
    placeholder.className = 'quark-placeholder-view';

    placeholder.innerHTML = `
      <div class="quark-placeholder-card">
        <div class="quark-placeholder-icon">
          <svg class="quark-svg-icon large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        
        <span class="quark-placeholder-pill">${isBn ? 'নির্মাণাধীন অধ্যায়' : 'Under Construction'}</span>
        
        <h2 class="quark-placeholder-title">
          ${isBn ? `অধ্যায় ${chMeta.numberBn}: ${chMeta.titleBn}` : `Chapter ${chMeta.numberEn}: ${chMeta.titleEn}`}
        </h2>
        
        <p class="quark-placeholder-subtitle">
          ${isBn ? chMeta.subtitleBn : chMeta.subtitleEn}
        </p>

        <div class="quark-placeholder-spec-box">
          <h4 class="quark-spec-box-title">${isBn ? 'এই অধ্যায়ের লক্ষ্য ও বৈজ্ঞানিক ভিত্তি:' : 'Chapter Objectives & Scientific Scope:'}</h4>
          <ul class="quark-spec-list">
            <li>${isBn ? 'নিখুঁত কোয়ান্টাম ক্রোমোডায়নামিক্স (QCD) ল্যাগ্রাঞ্জিয়ান মডেলিং' : 'Precision Quantum Chromodynamics (QCD) Lagrangian modeling'}</li>
            <li>${isBn ? 'ল্যাটিস QCD ও কণা পদার্থবিজ্ঞান রিভিউ (PDG 2024/2026) নির্ভর তথ্য' : 'Grounded in Lattice QCD & Particle Data Group (PDG 2024/2026) reviews'}</li>
            <li>${isBn ? 'WCAG 2.2 AA অ্যাক্সেসিবল কালারব্লাইন্ড-সেফ ও কাইনেটিক ইন্টারঅ্যাকটিভিটি' : 'WCAG 2.2 AA accessible colorblind-safe & kinetic interactivity'}</li>
          </ul>
        </div>

        <div class="quark-placeholder-actions">
          <a class="quark-btn-primary" href="#/quarks/chapter-1">
            <svg class="quark-svg-icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            <span>${isBn ? 'অধ্যায় ১: প্রোটনের শরীরে ফিরে যান' : "Return to Chapter 1: The Proton's Body"}</span>
          </a>
        </div>
      </div>
    `;

    viewport.appendChild(placeholder);
  }

  setLevel(level) {
    this.level = level;

    // Update active button classes
    const lvlBtns = this.container.querySelectorAll('.quark-level-btn');
    lvlBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-level') === level;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // Notify active chapter
    if (this.currentChapterInstance && typeof this.currentChapterInstance.setLevel === 'function') {
      this.currentChapterInstance.setLevel(level);
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    this.infoDrawer.setLanguage(lang);
    this.updateLanguageStrings();
    this.renderChaptersNav();

    if (this.currentChapterInstance && typeof this.currentChapterInstance.setLanguage === 'function') {
      this.currentChapterInstance.setLanguage(lang);
    }
  }

  updateLanguageStrings() {
    const isBn = this.lang === 'bn';

    const setTxt = (sel, bn, en) => {
      const el = this.container.querySelector(sel);
      if (el) el.textContent = isBn ? bn : en;
    };

    setTxt('#quark-lbl-back', 'কসমিক জুমে ফিরুন', 'Back to Cosmic Zoom');
    setTxt('#quark-lbl-subtitle', 'অতিপারমাণবিক স্কেলের বৈজ্ঞানিক ভিজুয়ালাইজেশন', 'Scientific Visualizations of Subatomic Scales');
    setTxt('#quark-lbl-level-prompt', 'স্তর:', 'Level:');

    setTxt('#quark-lvl-basic', 'সহজ', 'Basic');
    setTxt('#quark-lvl-intermediate', 'মাঝারি', 'Intermediate');
    setTxt('#quark-lvl-expert', 'বিশেষজ্ঞ', 'Expert');
  }

  handleReportError(data) {
    // Custom report logger
    console.info('CosmoPlanck Scientific Feedback Logged:', data);
  }
}
