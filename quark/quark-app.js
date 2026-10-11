/**
 * CosmoPlanck Quark Section Router & App Shell
 * Manages section landing, chapter routing (individual URLs), navigation,
 * level switcher ("সহজ / মাঝারি / বিশেষজ্ঞ"), and upcoming chapter placeholders.
 */

import { InfoDrawer } from '../components/info-drawer.js';
import { createTierBadge } from '../components/tier-badge.js';
import { Chapter1Proton } from './chapter-1.js';
import { Chapter3ColorLab } from './chapter-3.js';
import { Chapter4FluxTubeLab } from './chapter-4.js';

export const CHAPTER_LIST = [
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
    titleBn: 'কনফাইনমেন্ট ও স্ট্রিং টান',
    titleEn: 'Confinement & String Tension',
    subtitleBn: 'দূরত্বহীন ধ্রুব বল এবং স্ট্রিং ভাঙার রহস্য',
    subtitleEn: 'Distance-Independent Force & String Breaking',
    tier: 'T2',
    isAvailable: false
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
    titleBn: 'হ্যাড্রন বর্ণালী ও কণা চিড়িয়াখানা',
    titleEn: 'Hadron Spectrum & Particle Zoo',
    subtitleBn: 'ব্যারিয়ন ও মেসন পরিবারের সম্পূর্ণ বিন্যাস',
    subtitleEn: 'Complete Mapping of Baryons & Mesons',
    tier: 'T1',
    isAvailable: false
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
        // Default to chapter-1
        this.routeChapter('chapter-1');
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

    if (chMeta.isAvailable && chapterId === 'chapter-1') {
      // Mount Chapter 1 Proton Hero Interactive!
      this.currentChapterInstance = new Chapter1Proton({
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
