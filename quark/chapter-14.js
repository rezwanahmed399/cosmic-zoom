/**
 * CosmoPlanck Quark Section - Chapter 14: "ইতিহাস, Myth vs Fact, কুইজ ও শব্দকোষ"
 * 
 * Scientific Fidelity & Features:
 * 1. Historical Timeline (11 milestones: 1964 Gell-Mann/Zweig -> 2025 Toponium).
 * 2. 13 Myth vs Fact Cards (Detailed misconceptions debunked with strict physics & citations).
 * 3. Interactive Multi-Chapter Quiz with instant feedback, explanations, and scoring.
 * 4. Comprehensive A-Z Bilingual Glossary with search and category filters.
 * 5. Strictly zero unicode emojis across code and UI.
 */

import {
  getQuarkHistoryTimeline,
  getMythsVsFactsData,
  getQuarkQuizData,
  getQuarkGlossaryData
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_CLOCK_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
const ICON_SHIELD_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
const ICON_CHECK_SVG = '<svg class="c14-icon-badge check" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICON_CROSS_SVG = '<svg class="c14-icon-badge cross" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
const ICON_HELP_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_BOOK_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
const ICON_SEARCH_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c14-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

export class Chapter14HistoryQuizGlossary {
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

    this.timelineData = getQuarkHistoryTimeline();
    this.mythsData = getMythsVsFactsData();
    this.quizData = getQuarkQuizData();
    this.glossaryData = getQuarkGlossaryData();

    this.activeTab = 'timeline'; // 'timeline' | 'myths' | 'quiz' | 'glossary'
    
    // Quiz state
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.userAnswers = {}; // { questionId: optionId }
    this.quizCompleted = false;

    // Glossary state
    this.glossarySearchQuery = '';
    this.activeGlossaryCategory = 'all';

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-14-view';
    this.viewEl.id = 'chapter-14-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c14-header-section" aria-label="Chapter 14 Header">
        <div class="c14-header-top">
          <div class="c14-title-block">
            <div class="c14-pill-row">
              <span class="c14-chapter-badge">অধ্যায় ১৪</span>
              <span class="c14-tier-badge-wrap" id="c14-tier-header"></span>
              <span class="c14-scheme-tag">সমাপ্তি পর্ব: Synthesis & Reference</span>
            </div>
            <h2 class="c14-main-title">ইতিহাস, Myth vs Fact, কুইজ ও শব্দকোষ</h2>
            <p class="c14-subtitle">১৯৬৪ থেকে ২০২৫-এর টাইমলাইন, ১৩টি ভ্রান্তি নিরসন, বুদ্ধিবৃত্তিক কুইজ এবং পূর্ণাঙ্গ পারিভাষিক অভিধান</p>
          </div>

          <div class="c14-header-actions">
            <button class="c14-btn-outline" id="c14-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>গ্রন্থপঞ্জি ও তথ্যসূত্র</span>
            </button>
          </div>
        </div>

        <!-- MAIN NAVIGATION TABS -->
        <div class="c14-tabs-bar" role="tablist">
          <button class="c14-tab-btn active" id="c14-tab-timeline" data-tab="timeline" role="tab" aria-selected="true">
            ${ICON_CLOCK_SVG}
            <span>টাইমলাইন (Timeline)</span>
          </button>
          <button class="c14-tab-btn" id="c14-tab-myths" data-tab="myths" role="tab" aria-selected="false">
            ${ICON_SHIELD_SVG}
            <span>Myth vs Fact (১৩টি)</span>
          </button>
          <button class="c14-tab-btn" id="c14-tab-quiz" data-tab="quiz" role="tab" aria-selected="false">
            ${ICON_HELP_SVG}
            <span>কুইজ ল্যাব (Quiz)</span>
          </button>
          <button class="c14-tab-btn" id="c14-tab-glossary" data-tab="glossary" role="tab" aria-selected="false">
            ${ICON_BOOK_SVG}
            <span>শব্দকোষ (Glossary)</span>
          </button>
        </div>
      </section>

      <!-- TAB 1: TIMELINE CONTAINER -->
      <section class="c14-tab-pane active" id="pane-timeline" role="tabpanel" aria-labelledby="c14-tab-timeline">
        <div class="c14-timeline-wrapper" id="c14-timeline-container">
          <!-- Rendered via JS -->
        </div>
      </section>

      <!-- TAB 2: MYTH VS FACT CONTAINER -->
      <section class="c14-tab-pane" id="pane-myths" role="tabpanel" aria-labelledby="c14-tab-myths">
        <div class="c14-myths-header">
          <h3 class="c14-sub-heading">১৩টি সাধারণ বিভ্রান্তি ও তাদের পরীক্ষালব্ধ বৈজ্ঞানিক সত্যতা</h3>
          <p class="c14-sub-text">কার্ডে ক্লিক করে বিস্তারিত ব্যাখ্যা ও গবেষণাপত্রের প্রমাণ দেখুন</p>
        </div>
        <div class="c14-myths-grid" id="c14-myths-container">
          <!-- Rendered via JS -->
        </div>
      </section>

      <!-- TAB 3: QUIZ LAB CONTAINER -->
      <section class="c14-tab-pane" id="pane-quiz" role="tabpanel" aria-labelledby="c14-tab-quiz">
        <div class="c14-quiz-card-wrapper" id="c14-quiz-container">
          <!-- Dynamic Quiz Engine -->
        </div>
      </section>

      <!-- TAB 4: GLOSSARY CONTAINER -->
      <section class="c14-tab-pane" id="pane-glossary" role="tabpanel" aria-labelledby="c14-tab-glossary">
        <div class="c14-glossary-controls">
          <div class="c14-search-box">
            ${ICON_SEARCH_SVG}
            <input type="text" id="c14-glossary-input" placeholder="শব্দ খুঁজুন (যেমন: কনফাইনমেন্ট, গ্লুয়ন, QGP)..." aria-label="Search glossary terms" />
          </div>
        </div>
        <div class="c14-glossary-grid" id="c14-glossary-container">
          <!-- Rendered via JS -->
        </div>
      </section>

      <!-- CHAPTER NAVIGATION FOOTER -->
      <footer class="c14-footer-nav" aria-label="Chapter Navigation">
        <button class="c14-nav-btn prev" id="c14-btn-prev" type="button">
          ${ICON_ARROW_LEFT_SVG}
          <div class="c14-btn-text-wrap">
            <span class="c14-nav-dir">পূর্ববর্তী অধ্যায়</span>
            <span class="c14-nav-label">অধ্যায় ১৩: অজানা ও অমীমাংসিত</span>
          </div>
        </button>

        <div class="c14-nav-summary">
          <span class="c14-sum-pill">কোয়ার্ক ভ্রমণ সমাপ্ত</span>
          <span class="c14-sum-text">১৫টি পূর্ণাঙ্গ অধ্যায় সম্পন্ন</span>
        </div>

        <button class="c14-nav-btn next" id="c14-btn-home" type="button">
          <div class="c14-btn-text-wrap" style="text-align: right;">
            <span class="c14-nav-dir">শুরুতে ফিরুন</span>
            <span class="c14-nav-label">অধ্যায় ০: স্কেল-সিঁড়ি</span>
          </div>
          ${ICON_ARROW_RIGHT_SVG}
        </button>
      </footer>
    `;

    this.container.appendChild(this.viewEl);

    // Initialize Tier Badge
    const tierWrap = this.viewEl.querySelector('#c14-tier-header');
    if (tierWrap) {
      const badge = createTierBadge('T1', this.lang);
      tierWrap.appendChild(badge);
    }

    this.bindEvents();
    this.renderTimeline();
    this.renderMyths();
    this.renderQuiz();
    this.renderGlossary();
  }

  bindEvents() {
    // Info drawer trigger
    const infoBtn = this.viewEl.querySelector('#c14-btn-info');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.openAuditDrawer());
    }

    // Tabs switching
    const tabs = this.viewEl.querySelectorAll('.c14-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabKey = e.currentTarget.dataset.tab;
        this.switchTab(tabKey);
      });
    });

    // Glossary Search
    const searchInput = this.viewEl.querySelector('#c14-glossary-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.glossarySearchQuery = e.target.value.toLowerCase().trim();
        this.renderGlossary();
      });
    }

    // Chapter Navigation Buttons
    const prevBtn = this.viewEl.querySelector('#c14-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-13';
      });
    }

    const homeBtn = this.viewEl.querySelector('#c14-btn-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.location.hash = '#/quarks/chapter-0';
      });
    }
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;

    const tabs = this.viewEl.querySelectorAll('.c14-tab-btn');
    tabs.forEach(t => {
      const isSel = t.dataset.tab === tabKey;
      t.classList.toggle('active', isSel);
      t.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });

    const panes = this.viewEl.querySelectorAll('.c14-tab-pane');
    panes.forEach(p => {
      p.classList.toggle('active', p.id === `pane-${tabKey}`);
    });
  }

  renderTimeline() {
    const container = this.viewEl.querySelector('#c14-timeline-container');
    if (!container) return;

    container.innerHTML = '';
    const milestones = this.timelineData.milestones;

    milestones.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'c14-timeline-item';

      item.innerHTML = `
        <div class="c14-tl-marker">
          <div class="c14-tl-dot"></div>
          <div class="c14-tl-line"></div>
        </div>

        <div class="c14-tl-content">
          <div class="c14-tl-header">
            <span class="c14-tl-year">${m.year}</span>
            <span class="c14-tl-tier">${m.tier}</span>
          </div>
          <h4 class="c14-tl-title">${m.titleBn}</h4>
          <span class="c14-tl-scientists">${m.scientists}</span>
          <p class="c14-tl-desc">${m.discoveryBn}</p>
          <div class="c14-tl-citation">
            <span class="cit-lbl">মূল গবেষণা:</span>
            <span class="cit-val">${m.citation}</span>
          </div>
        </div>
      `;

      container.appendChild(item);
    });
  }

  renderMyths() {
    const container = this.viewEl.querySelector('#c14-myths-container');
    if (!container) return;

    container.innerHTML = '';
    const myths = this.mythsData;

    myths.forEach(m => {
      const card = document.createElement('article');
      card.className = 'c14-myth-card';
      card.id = `myth-${m.id}`;

      card.innerHTML = `
        <div class="c14-myth-card-top">
          <span class="c14-myth-index">ভ্রান্তি ${m.num}</span>
          <button class="c14-myth-expand-btn" type="button" aria-expanded="false">
            ব্যাখ্যা দেখুন
          </button>
        </div>

        <!-- MISCONCEPTION -->
        <div class="c14-myth-row err">
          <div class="c14-myth-icon-wrap">
            ${ICON_CROSS_SVG}
          </div>
          <div class="c14-myth-text-block">
            <span class="c14-myth-status-lbl err">ভুল ধারণা:</span>
            <p class="c14-myth-phrase err">${m.misconceptionBn}</p>
          </div>
        </div>

        <!-- REALITY -->
        <div class="c14-myth-row truth">
          <div class="c14-myth-icon-wrap">
            ${ICON_CHECK_SVG}
          </div>
          <div class="c14-myth-text-block">
            <span class="c14-myth-status-lbl truth">প্রকৃত বৈজ্ঞানিক সত্য:</span>
            <p class="c14-myth-phrase truth">${m.realityBn}</p>
          </div>
        </div>

        <!-- EXPANDABLE DETAILS -->
        <div class="c14-myth-details-drawer">
          <div class="c14-drawer-inner">
            <p class="c14-myth-full-exp">${m.explanationBn}</p>
            <div class="c14-myth-proof-strip">
              <span class="proof-label">পরীক্ষালব্ধ প্রমাণ / রেফারেন্স:</span>
              <span class="proof-val">${m.proofCitation}</span>
            </div>
          </div>
        </div>
      `;

      const expandBtn = card.querySelector('.c14-myth-expand-btn');
      const drawer = card.querySelector('.c14-myth-details-drawer');

      card.addEventListener('click', () => {
        const isOpen = card.classList.toggle('expanded');
        expandBtn.textContent = isOpen ? 'সংক্ষিপ্ত করুন' : 'ব্যাখ্যা দেখুন';
        expandBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      container.appendChild(card);
    });
  }

  renderQuiz() {
    const container = this.viewEl.querySelector('#c14-quiz-container');
    if (!container) return;

    const questions = this.quizData.questions;
    const totalQ = questions.length;

    if (this.quizCompleted) {
      const pct = Math.round((this.quizScore / totalQ) * 100);
      container.innerHTML = `
        <div class="c14-quiz-result-card">
          <div class="c14-quiz-result-badge">
            ${ICON_CHECK_SVG}
            <span>কুইজ ফলাফল সম্পন্ন</span>
          </div>
          <h3 class="c14-result-score">${this.quizScore} / ${totalQ}</h3>
          <p class="c14-result-pct">সফলতা: ${pct}%</p>
          <p class="c14-result-feedback">
            ${pct >= 80 ? 'অসাধারণ পাণ্ডিত্য! আপনি কোয়ার্ক ও কোয়ান্টাম ক্রোমোডাইনামিক্সের সূক্ষ্ম নীতিগুলো গভীরভাবে আয়ত্ত করেছেন।' :
              pct >= 50 ? 'চমৎকার পারফরম্যান্স! আপনি কোয়ার্ক জগতের অধিকাংশ মৌলিক নীতি আয়ত্ত করতে পেরেছেন।' :
              'ভালো চেষ্টা! মিথ বনাম সত্য এবং অধ্যায়গুলো পুনরায় পর্যালোচনা করে আরেকবার পরখ করুন।'}
          </p>
          <button class="c14-quiz-btn restart" id="c14-btn-quiz-restart" type="button">
            কুইজ পুনরায় দিন
          </button>
        </div>
      `;

      const restartBtn = container.querySelector('#c14-btn-quiz-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.currentQuizIndex = 0;
          this.quizScore = 0;
          this.userAnswers = {};
          this.quizCompleted = false;
          this.renderQuiz();
        });
      }
      return;
    }

    const currentQ = questions[this.currentQuizIndex];
    const answeredOpt = this.userAnswers[currentQ.id];
    const isAnswered = answeredOpt !== undefined;

    container.innerHTML = `
      <div class="c14-quiz-engine-card">
        <div class="c14-quiz-top-bar">
          <div class="c14-quiz-meta">
            <span class="c14-quiz-ch-badge">${currentQ.chapterBn}</span>
            <span class="c14-quiz-counter">প্রশ্ন ${this.currentQuizIndex + 1} / ${totalQ}</span>
          </div>
          <div class="c14-quiz-live-score">
            <span>স্কোর: ${this.quizScore}</span>
          </div>
        </div>

        <h3 class="c14-quiz-question">${currentQ.questionBn}</h3>

        <div class="c14-quiz-options-list">
          ${currentQ.options.map(opt => {
            let stateClass = '';
            if (isAnswered) {
              if (opt.isCorrect) stateClass = 'correct';
              else if (opt.id === answeredOpt) stateClass = 'incorrect';
              else stateClass = 'disabled';
            }

            return `
              <button class="c14-quiz-opt-btn ${stateClass}" data-opt-id="${opt.id}" ${isAnswered ? 'disabled' : ''} type="button">
                <span class="opt-key">${opt.id.toUpperCase()}</span>
                <span class="opt-text">${opt.textBn}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- EXPLANATION DRAWER -->
        ${isAnswered ? `
          <div class="c14-quiz-explanation-box">
            <div class="exp-title-row">
              <span class="exp-title">বৈজ্ঞানিক ব্যাখ্যা ও রেফারেন্স:</span>
            </div>
            <p class="exp-body">${currentQ.explanationBn}</p>
            <span class="exp-cite">উৎস: ${currentQ.citation}</span>
          </div>

          <div class="c14-quiz-action-row">
            <button class="c14-quiz-btn next" id="c14-btn-quiz-next" type="button">
              ${this.currentQuizIndex < totalQ - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Bind option click
    if (!isAnswered) {
      const optBtns = container.querySelectorAll('.c14-quiz-opt-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const optId = e.currentTarget.dataset.optId;
          this.userAnswers[currentQ.id] = optId;

          const chosenOpt = currentQ.options.find(o => o.id === optId);
          if (chosenOpt && chosenOpt.isCorrect) {
            this.quizScore++;
          }

          this.renderQuiz();
        });
      });
    } else {
      const nextBtn = container.querySelector('#c14-btn-quiz-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.currentQuizIndex < totalQ - 1) {
            this.currentQuizIndex++;
          } else {
            this.quizCompleted = true;
          }
          this.renderQuiz();
        });
      }
    }
  }

  renderGlossary() {
    const container = this.viewEl.querySelector('#c14-glossary-container');
    if (!container) return;

    container.innerHTML = '';
    const terms = this.glossaryData.terms;

    const filteredTerms = terms.filter(item => {
      if (!this.glossarySearchQuery) return true;
      const q = this.glossarySearchQuery;
      return (
        item.termBn.toLowerCase().includes(q) ||
        item.termEn.toLowerCase().includes(q) ||
        item.definitionBn.toLowerCase().includes(q) ||
        item.definitionEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    if (filteredTerms.length === 0) {
      container.innerHTML = `
        <div class="c14-glossary-empty">
          <p>কোনো পরিভাষা খুঁজে পাওয়া যায়নি। অন্য শব্দ দিয়ে অনুসন্ধান করুন।</p>
        </div>
      `;
      return;
    }

    filteredTerms.forEach(item => {
      const card = document.createElement('article');
      card.className = 'c14-glossary-card';

      card.innerHTML = `
        <div class="c14-glos-top">
          <div class="c14-glos-term-block">
            <h4 class="c14-glos-term-bn">${item.termBn}</h4>
            <span class="c14-glos-term-en">${item.termEn}</span>
          </div>
          <span class="c14-glos-cat">${item.category}</span>
        </div>
        <p class="c14-glos-def-bn">${item.definitionBn}</p>
        <p class="c14-glos-def-en">${item.definitionEn}</p>
      `;

      container.appendChild(card);
    });
  }

  openAuditDrawer() {
    if (!this.infoDrawer) return;

    const content = `
      <div class="audit-drawer-content">
        <h3>অধ্যায় ১৪: গ্রন্থপঞ্জি, ইতিহাস ও তথ্যসূত্র</h3>
        <p><strong>কোয়ার্ক ও QCD-র পূর্ণাঙ্গ বৈজ্ঞানিক সাহিত্য:</strong></p>
        <ul>
          <li><strong>M. Gell-Mann</strong>, <em>A Schematic Model of Baryons and Mesons</em>, Phys. Lett. 8 (1964) 214.</li>
          <li><strong>G. Zweig</strong>, <em>An SU3 Model for Strong Interaction Symmetry and its Breaking</em>, CERN Report 8182/TH.401 (1964).</li>
          <li><strong>O.W. Greenberg</strong>, <em>Spin and Unitary-Spin Independence in a Paraquark Model of Baryons and Mesons</em>, Phys. Rev. Lett. 13 (1964) 598.</li>
          <li><strong>J.D. Bjorken</strong>, <em>Asymptotic Sum Rules at Infinite Momentum</em>, Phys. Rev. 179 (1969) 1547.</li>
          <li><strong>D.J. Gross & F. Wilczek</strong>, <em>Ultraviolet Behavior of Non-Abelian Gauge Theories</em>, Phys. Rev. Lett. 30 (1973) 1343.</li>
          <li><strong>H.D. Politzer</strong>, <em>Reliable Perturbative Results for Strong Interactions?</em>, Phys. Rev. Lett. 30 (1973) 1346.</li>
          <li><strong>G.S. Bali et al.</strong>, <em>Observation of string breaking in QCD</em>, Phys. Rev. D 71 (2005) 114513.</li>
          <li><strong>Particle Data Group (PDG 2024 / 2026)</strong>, <em>Review of Particle Physics</em>, Phys. Rev. D 110 (2024) 030001.</li>
        </ul>
      </div>
    `;

    this.infoDrawer.open({
      title: 'ঐতিহাসিক গ্রন্থপঞ্জি ও তথ্যসূত্র (Tier T1)',
      content: content,
      tier: 'T1'
    });
  }

  destroy() {
    if (this.viewEl && this.viewEl.parentNode) {
      this.viewEl.parentNode.removeChild(this.viewEl);
    }
  }
}
