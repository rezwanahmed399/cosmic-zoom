/**
 * COSMIC TO PLANCK CONTROLLER & APPLICATION LOGIC
 * Manages user interactions, UI telemetry, audio coordination,
 * auto-cruise cinematic mode, bilingual localization, and search.
 */

import { COSMIC_OBJECTS, SCALE_DOMAINS, SCALE_COMPARISONS, SCALE_QUIZ_QUESTIONS } from './science-data.js';
import { CosmicAudioEngine } from './audio-engine.js';
import { CosmicRenderEngine } from './render-engine.js';
import { getIcon } from './icons.js';

class CosmicApp {
  constructor() {
    this.canvas = document.getElementById('viewport-canvas');
    this.renderEngine = new CosmicRenderEngine(this.canvas);
    this.audioEngine = new CosmicAudioEngine();
    this.lang = 'bn'; // Default to Bengali as requested by the user, toggleable to 'en'
    this.isAutoCruising = false;
    this.cruiseSpeed = 0.04; // orders per frame
    this.cruiseDirection = -1; // -1 = zooming into smaller scales, +1 = zooming out
    this.activeObject = null;
    this.comparisonIndex = 0;
    this.lastHashSync = 0;

    this.checkInitialHash();
    window.addEventListener('hashchange', () => this.handleHashChange());

    this.initDOM();
    this.initEvents();
    this.startLoop();

    // Initial update
    this.updateHUD();
  }

  initDOM() {
    // Top HUD
    this.orderExpEl = document.getElementById('order-exponent');
    this.orderMetricEl = document.getElementById('order-metric');
    this.lightTimeEl = document.getElementById('light-time-value');
    this.domainBadgeEl = document.getElementById('domain-badge');

    // Object Details Panel
    this.objectCardEl = document.getElementById('object-card');
    this.objectNameEl = document.getElementById('object-name');
    this.objectSubNameEl = document.getElementById('object-subname');
    this.objectDimensionEl = document.getElementById('object-dimension');
    this.objectSummaryEl = document.getElementById('object-summary');
    this.objectFactEl = document.getElementById('object-fact');
    this.factContainerEl = document.getElementById('fact-container');

    // Controls
    this.sliderEl = document.getElementById('scale-slider');
    this.audioBtn = document.getElementById('audio-toggle-btn');
    this.audioWave = document.getElementById('audio-wave');
    this.cornerDisclaimerEl = document.getElementById('canvas-corner-disclaimer');
    this.tourBtn = document.getElementById('tour-toggle-btn');
    this.langBtn = document.getElementById('lang-toggle-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.searchModal = document.getElementById('search-modal');
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.compareModal = document.getElementById('compare-modal');

    // Advanced Scientific HUD Elements
    this.truthBadgeEl = document.getElementById('object-truth-badge');
    this.truthTextValEl = document.getElementById('truth-text-val');
    this.forceBadgeEl = document.getElementById('object-force-badge');
    this.forceTextValEl = document.getElementById('force-text-val');
    this.instrumentContentEl = document.getElementById('object-instrument');
    this.transitWalkValEl = document.getElementById('transit-walk-val');
    this.transitJetValEl = document.getElementById('transit-jet-val');
    this.transitVoyagerValEl = document.getElementById('transit-voyager-val');
    this.misconceptionContainerEl = document.getElementById('misconception-container');
    this.misconceptionHeadingEl = document.getElementById('misconception-heading');
    this.misconceptionTextEl = document.getElementById('misconception-text');
    this.rulerLabelEl = document.getElementById('ruler-label');
    this.planckWallBannerEl = document.getElementById('planck-wall-banner');
    this.forceRows = document.querySelectorAll('.force-item-row');

    // Black Hole Schwarzschild Radius Elements
    this.blackholeContainerEl = document.getElementById('blackhole-container');
    this.blackholeValEl = document.getElementById('blackhole-val');

    // Quiz Modal Elements
    this.quizBtn = document.getElementById('quiz-btn');
    this.quizBtnLabel = document.getElementById('quiz-btn-label');
    this.quizModal = document.getElementById('quiz-modal');
    this.quizTitleEl = document.getElementById('quiz-modal-title');
    this.quizContentArea = document.getElementById('quiz-content-area');
    this.closeQuizBtn = document.getElementById('close-quiz-btn');

    // Cataclysmic Black Hole Simulation Elements
    this.collapseBtn = document.getElementById('collapse-btn');
    this.collapseBtnLabel = document.getElementById('collapse-btn-label');
    this.blackholeOverlay = document.getElementById('blackhole-active-overlay');
    this.blackholePanel = document.getElementById('blackhole-telemetry-panel');
    this.evaporateBtn = document.getElementById('evaporate-btn');
    this.evaporateBtnLabel = document.getElementById('evaporate-btn-label');
    this.bhOverlayToggleBtn = document.getElementById('bh-overlay-toggle-btn');
    this.bhOverlayLabel = document.getElementById('bh-overlay-label');
    this.bhMassChips = document.querySelectorAll('.bh-mass-chip');
    this.bhModeToggleBtn = document.getElementById('bh-mode-toggle-btn');
    this.bhModeLabel = document.getElementById('bh-mode-label');
    this.bhHideCardBtn = document.getElementById('bh-hide-card-btn');
    this.bhHideBtnLabel = document.getElementById('bh-hide-btn-label');
    this.bhRestoreCardPill = document.getElementById('bh-restore-card-pill');
    this.bhRestoreLabel = document.getElementById('bh-restore-label');
    this.bhStatMass = document.getElementById('bh-stat-mass');
    this.bhStatRadius = document.getElementById('bh-stat-radius');
    this.bhStatPhoton = document.getElementById('bh-stat-photon');
    this.bhStatHawking = document.getElementById('bh-stat-hawking');
    this.bhNoticeText = document.getElementById('bh-notice-text');
    this.bhDisclaimerText = document.getElementById('bh-disclaimer-text');
    this.bhSrAnnouncements = document.getElementById('bh-sr-announcements');

    // Spacetime Strain Meter Elements (Trans-Planckian Over-Zoom)
    this.strainContainer = document.getElementById('spacetime-strain-container');
    this.strainTitleText = document.getElementById('strain-title-text');
    this.strainPercentText = document.getElementById('strain-percent-text');
    this.strainFillBar = document.getElementById('strain-fill-bar');
    this.strainSubText = document.getElementById('strain-sub-text');
    this.planckStrainCount = 0;
    this.strainDecayTimer = null;

    // Connect Render Engine Black Hole Callbacks
    this.renderEngine.onBlackHoleTriggered = () => {
      this.audioEngine.playBlackHoleCollapse();
      this.stopTour();
      document.body.classList.add('black-hole-mode');
      if (this.blackholeOverlay) {
        this.blackholeOverlay.classList.add('active');
        this.blackholeOverlay.classList.remove('card-minimized');
      }
      if (this.bhRestoreCardPill) {
        this.bhRestoreCardPill.style.display = 'none';
      }
      if (this.collapseBtn) this.collapseBtn.classList.add('active');
      this.updateBlackHoleStats();
    };

    this.renderEngine.onBlackHoleEvaporated = () => {
      this.audioEngine.playBlackHoleEvaporate();
      document.body.classList.remove('black-hole-mode');
      if (this.blackholeOverlay) {
        this.blackholeOverlay.classList.remove('active');
        this.blackholeOverlay.classList.remove('card-minimized');
      }
      if (this.bhRestoreCardPill) {
        this.bhRestoreCardPill.style.display = 'none';
      }
      if (this.collapseBtn) this.collapseBtn.classList.remove('active');
      this.updateHUD(true);
      this.updateCornerDisclaimer();
    };

    // Quick Jump Buttons Container
    this.quickJumpContainer = document.getElementById('quick-jump-container');
    this.populateQuickJumps();
    this.populateComparisons();
    this.populateQuiz();
  }

  populateQuickJumps() {
    const keyMilestones = [
      { order: 26.94, nameEn: 'Universe', nameBn: 'মহাবিশ্ব', iconKey: 'universe' },
      { order: 21.0, nameEn: 'Milky Way', nameBn: 'আকাশগঙ্গা', iconKey: 'galaxy' },
      { order: 9.14, nameEn: 'Sun', nameBn: 'সূর্য', iconKey: 'sun' },
      { order: 7.1, nameEn: 'Earth', nameBn: 'পৃথিবী', iconKey: 'earth' },
      { order: 0.23, nameEn: 'Human', nameBn: 'মানুষ', iconKey: 'human' },
      { order: -5.1, nameEn: 'Blood Cell', nameBn: 'রক্তকোষ', iconKey: 'cell' },
      { order: -9.0, nameEn: 'DNA', nameBn: 'ডিএনএ', iconKey: 'dna' },
      { order: -10.0, nameEn: 'Atom', nameBn: 'পরমাণু', iconKey: 'atom' },
      { order: -15.0, nameEn: 'Proton', nameBn: 'প্রোটন', iconKey: 'proton' },
      { order: -35.0, nameEn: 'Planck', nameBn: 'প্ল্যাঙ্ক', iconKey: 'planck' }
    ];

    this.quickJumpContainer.innerHTML = '';
    this.jumpButtons = [];

    keyMilestones.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'jump-btn';
      btn.title = `${m.nameBn} / ${m.nameEn} (${m.order > 0 ? '+' : ''}${Math.round(m.order)})`;
      btn.innerHTML = `<span class="jump-icon">${getIcon(m.iconKey)}</span><span class="jump-name">${this.lang === 'bn' ? m.nameBn : m.nameEn}</span>`;
      btn.addEventListener('click', () => {
        this.stopTour();
        this.audioEngine.playChime(600);
        this.renderEngine.setTargetOrder(m.order);
      });
      this.quickJumpContainer.appendChild(btn);
      this.jumpButtons.push({ btn, order: m.order });
    });
  }

  populateComparisons() {
    const listEl = document.getElementById('compare-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    SCALE_COMPARISONS.forEach((comp, idx) => {
      const item = document.createElement('div');
      item.className = 'compare-card';
      const objA = COSMIC_OBJECTS.find(o => o.id === comp.targetA) || { nameEn: comp.targetA, nameBn: comp.targetA };
      const objB = COSMIC_OBJECTS.find(o => o.id === comp.targetB) || { nameEn: comp.targetB, nameBn: comp.targetB };

      item.innerHTML = `
        <div class="compare-header">
          <span class="comp-badge">${this.lang === 'bn' ? objA.nameBn : objA.nameEn}</span>
          <span class="comp-ratio">× ${this.lang === 'bn' ? comp.ratioBn : comp.ratio}</span>
          <span class="comp-badge">${this.lang === 'bn' ? objB.nameBn : objB.nameEn}</span>
        </div>
        <p class="comp-desc">${this.lang === 'bn' ? comp.descBn : comp.descEn}</p>
      `;

      item.addEventListener('click', () => {
        const targetObj = COSMIC_OBJECTS.find(o => o.id === comp.targetA);
        if (targetObj) {
          this.renderEngine.setTargetOrder(targetObj.order);
          this.closeModals();
        }
      });
      listEl.appendChild(item);
    });
  }

  populateQuiz() {
    if (!this.quizContentArea) return;
    this.quizContentArea.innerHTML = '';

    if (this.quizBtnLabel) {
      this.quizBtnLabel.textContent = this.lang === 'bn' ? 'কুইজ' : 'Quiz';
    }
    if (this.quizTitleEl) {
      this.quizTitleEl.textContent = this.lang === 'bn' ? 'মহাজাগতিক স্কেল অনুমান চ্যালেঞ্জ' : 'Cosmic Scale Estimation Challenge';
    }

    SCALE_QUIZ_QUESTIONS.forEach((q, qIdx) => {
      const card = document.createElement('div');
      card.className = 'quiz-question-card';

      const qTitle = this.lang === 'bn' ? q.questionBn : q.questionEn;
      const qNum = this.lang === 'bn' ? `প্রশ্ন ০${qIdx + 1}` : `Question 0${qIdx + 1}`;

      card.innerHTML = `
        <div class="quiz-q-header">
          <span class="quiz-q-num">${qNum}</span>
          <h4 class="quiz-q-title">${qTitle}</h4>
        </div>
        <div class="quiz-options-list" id="quiz-options-${qIdx}"></div>
        <div class="quiz-feedback-box" id="quiz-feedback-${qIdx}" style="display:none;"></div>
      `;

      const optionsContainer = card.querySelector(`#quiz-options-${qIdx}`);
      const feedbackBox = card.querySelector(`#quiz-feedback-${qIdx}`);

      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = optText;

        btn.addEventListener('click', () => {
          // Disable all sibling buttons for this question
          const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
          allBtns.forEach(b => b.disabled = true);

          const isCorrect = (optIdx === q.correctIndex);
          if (isCorrect) {
            btn.classList.add('correct');
            this.audioEngine.playChime(780);
          } else {
            btn.classList.add('wrong');
            allBtns[q.correctIndex].classList.add('highlight-correct');
            this.audioEngine.playChime(320);
          }

          feedbackBox.style.display = 'flex';
          feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'success' : 'retry'}`;
          feedbackBox.innerHTML = `
            <div class="quiz-feedback-text">
              <strong>${isCorrect ? (this.lang === 'bn' ? 'সঠিক উত্তর!' : 'Correct Answer!') : (this.lang === 'bn' ? 'সঠিক তথ্য:' : 'Scientific Reality:')}</strong>
              <p>${this.lang === 'bn' ? q.explanationBn : (q.explanationEn || q.explanationBn)}</p>
            </div>
            <button class="quiz-jump-btn" type="button" title="${this.lang === 'bn' ? 'এই স্কেলে সরাসরি জুম করুন' : 'Jump directly to this scale'}">
              <span>${this.lang === 'bn' ? 'স্কেলে যান' : 'Jump to Scale'}</span>
              <span class="quiz-jump-arrow">→</span>
            </button>
          `;

          const jumpBtn = feedbackBox.querySelector('.quiz-jump-btn');
          jumpBtn.addEventListener('click', () => {
            this.stopTour();
            this.renderEngine.setTargetOrder(q.targetOrder);
            this.closeModals();
            this.audioEngine.playChime(640);
          });
        });

        optionsContainer.appendChild(btn);
      });

      this.quizContentArea.appendChild(card);
    });
  }

  checkInitialHash() {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#s=')) {
        const val = parseFloat(hash.substring(3));
        if (!isNaN(val) && val >= -35.0 && val <= 27.0) {
          this.renderEngine.targetOrder = val;
          this.renderEngine.currentOrder = val;
        }
      }
    } catch (_) {}
  }

  handleHashChange() {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#s=')) {
        const val = parseFloat(hash.substring(3));
        if (!isNaN(val) && val >= -35.0 && val <= 27.0) {
          this.renderEngine.setTargetOrder(val);
        }
      }
    } catch (_) {}
  }

  syncHash() {
    const now = performance.now();
    if (!this.lastHashSync || (now - this.lastHashSync > 600)) {
      this.lastHashSync = now;
      const orderStr = this.renderEngine.currentOrder.toFixed(1);
      try {
        history.replaceState(null, '', `#s=${orderStr}`);
      } catch (_) {}
    }
  }

  initEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.renderEngine.resize();
    });

    // Page Visibility: Pause tour and cancel compression if tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.isTouring) this.stopTour();
        if (this.isMouseDown) {
          this.isMouseDown = false;
          this.renderEngine.cancelCompression();
        }
      }
    });

    // Mouse Press & Hold Gravitational Compression on Canvas
    this.isMouseDown = false;
    this.mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.renderEngine.blackHoleState === 'active') return;
      this.isMouseDown = true;
      this.mousePos = { x: e.clientX, y: e.clientY };
      this.renderEngine.startCompression(e.clientX, e.clientY);
      this.audioEngine.playSpacetimeStress(0.2);
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
      if (this.isMouseDown && this.renderEngine.blackHoleState === 'charging') {
        this.audioEngine.playSpacetimeStress(this.renderEngine.blackHoleCharge);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.renderEngine.cancelCompression();
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && this.renderEngine.blackHoleState !== 'active') {
        this.isMouseDown = true;
        this.mousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.renderEngine.startCompression(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.renderEngine.cancelCompression();
      }
    });

    // Mouse Wheel / Trackpad smooth zooming & Trans-Planckian Over-Zoom Strain Collapse
    window.addEventListener('wheel', (e) => {
      this.stopTour();

      // If Black Hole is currently active, scrolling UP triggers evaporation and restores Planck scale!
      if (this.renderEngine.blackHoleState === 'active' || this.renderEngine.blackHoleState === 'shattering') {
        if (e.deltaY < 0) {
          this.renderEngine.triggerBlackHoleEvaporation();
        }
        return;
      }

      // Trans-Planckian Over-Zoom: If user forces past the Planck limit, accumulate strain
      if (this.renderEngine.currentOrder <= -34.5 && e.deltaY > 0) {
        clearTimeout(this.strainDecayTimer);
        this.planckStrainCount = Math.min(7, (this.planckStrainCount || 0) + 1);

        if (this.strainContainer) {
          this.strainContainer.style.display = 'flex';
          this.strainContainer.style.opacity = '1';
        }
        const pct = Math.round((this.planckStrainCount / 7) * 100);
        if (this.strainFillBar) this.strainFillBar.style.width = `${pct}%`;
        if (this.strainPercentText) {
          this.strainPercentText.textContent = `${this.lang === 'bn' ? this.toBanglaNum(pct) : pct}%`;
        }

        this.audioEngine.playSpacetimeStress(this.planckStrainCount / 7);
        this.renderEngine.strainShakeIntensity = this.planckStrainCount * 2.8;

        if (this.planckStrainCount >= 7) {
          this.planckStrainCount = 0;
          if (this.strainContainer) this.strainContainer.style.display = 'none';
          this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);
          return;
        }

        this.strainDecayTimer = setTimeout(() => {
          this.dischargeStrain();
        }, 1800);
        return;
      } else {
        if (this.planckStrainCount > 0 && e.deltaY < 0) {
          this.planckStrainCount = 0;
          if (this.strainContainer) this.strainContainer.style.display = 'none';
        }
      }

      // Normalized delta
      const delta = (e.deltaY > 0 ? -1 : 1) * Math.min(Math.abs(e.deltaY) * 0.0035, 0.9);
      this.renderEngine.addZoomDelta(delta);
      this.audioEngine.playZoomPulse(delta > 0 ? 1 : -1);
    }, { passive: true });

    // Touch Support (Pinch and Swipe)
    let touchStartY = 0;
    let touchStartDist = 0;

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      this.stopTour();
      if (this.renderEngine.blackHoleState === 'active') {
        if (e.touches.length === 1 && e.touches[0].clientY - touchStartY > 20) {
          this.renderEngine.triggerBlackHoleEvaporation();
        }
        return;
      }
      if (e.touches.length === 1) {
        const diffY = e.touches[0].clientY - touchStartY;
        touchStartY = e.touches[0].clientY;
        this.renderEngine.addZoomDelta(diffY * 0.02);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pinchDelta = (dist - touchStartDist) * 0.03;
        touchStartDist = dist;
        this.renderEngine.addZoomDelta(pinchDelta);
      }
    }, { passive: true });

    // Scale Slider input: maps 0 (Universe, +27) to 62 (Planck, -35)
    this.sliderEl.addEventListener('input', (e) => {
      this.stopTour();
      const val = parseFloat(e.target.value);
      this.renderEngine.setTargetOrder(27 - val);
    });

    // Zoom Buttons (+ / -)
    document.getElementById('zoom-in-btn').addEventListener('click', () => {
      this.stopTour();
      if (this.renderEngine.currentOrder <= -34.8) {
        this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);
        return;
      }
      this.renderEngine.addZoomDelta(-1.5);
      this.audioEngine.playZoomPulse(-1);
    });

    document.getElementById('zoom-out-btn').addEventListener('click', () => {
      this.stopTour();
      this.renderEngine.addZoomDelta(1.5);
      this.audioEngine.playZoomPulse(1);
    });

    // Audio Toggle
    this.audioBtn.addEventListener('click', () => {
      const active = this.audioEngine.toggleSound();
      this.audioBtn.classList.toggle('active', active);
      this.audioWave.style.opacity = active ? '1' : '0.3';
    });

    // Auto-Tour Toggle
    this.tourBtn.addEventListener('click', () => {
      this.toggleTour();
    });

    // Language Toggle
    this.langBtn.addEventListener('click', () => {
      this.lang = this.lang === 'bn' ? 'en' : 'bn';
      this.langBtn.textContent = this.lang === 'bn' ? 'বাংলা' : 'EN';
      this.updateCornerDisclaimer();
      if (this.collapseBtnLabel) {
        this.collapseBtnLabel.textContent = this.lang === 'bn' ? 'ব্ল্যাকহোল' : 'Black Hole';
      }
      if (this.evaporateBtnLabel) {
        this.evaporateBtnLabel.textContent = this.lang === 'bn' ? 'বাষ্পীভবন ও রিস্টোর [X]' : 'Evaporate & Return [X]';
      }
      if (this.bhHideBtnLabel) {
        this.bhHideBtnLabel.textContent = this.lang === 'bn' ? 'কার্ড লুকান' : 'Hide Card';
      }
      if (this.bhRestoreLabel) {
        this.bhRestoreLabel.textContent = this.lang === 'bn' ? 'শোয়ার্জশিল্ড তথ্য দেখুন [H]' : 'Show Data Card [H]';
      }
      if (this.strainTitleText) {
        this.strainTitleText.textContent = this.lang === 'bn'
          ? 'স্থান-কাল মহাকর্ষীয় সংকোচন টান (SPACETIME STRAIN)'
          : 'Spacetime Gravitational Strain (TRANS-PLANCKIAN)';
      }
      if (this.strainSubText) {
        this.strainSubText.textContent = this.lang === 'bn'
          ? 'মাউস হুইল দিয়ে আরো স্ক্রোল করে মহাকর্ষীয় পতন ঘটান... (Scroll more to force collapse)'
          : 'Scroll mouse wheel more to force gravitational collapse...';
      }
      if (this.bhModeLabel) {
        const isDisk = this.renderEngine.blackHoleAccretionMode === 'disk';
        this.bhModeLabel.textContent = this.lang === 'bn'
          ? (isDisk ? 'গ্যাসীয় ডিস্ক সহ' : 'বিশুদ্ধ ভ্যাকিউম')
          : (isDisk ? 'With Disk' : 'Pure Vacuum');
      }
      this.populateQuickJumps();
      this.populateComparisons();
      this.populateQuiz();
      this.updateHUD(true);
      if (this.renderEngine.blackHoleState === 'active') {
        this.updateBlackHoleStats();
      }
      this.audioEngine.playChime(520);
    });

    // Search Open / Close
    document.getElementById('search-btn').addEventListener('click', () => {
      this.searchModal.classList.toggle('active');
      if (this.searchModal.classList.contains('active')) {
        this.searchInput.focus();
        this.renderSearchResults('');
      }
    });

    document.getElementById('close-search-btn').addEventListener('click', () => {
      this.searchModal.classList.remove('active');
    });

    this.searchInput.addEventListener('input', (e) => {
      this.renderSearchResults(e.target.value);
    });

    // Compare Drawer Open / Close
    document.getElementById('compare-btn').addEventListener('click', () => {
      this.compareModal.classList.toggle('active');
    });

    document.getElementById('close-compare-btn').addEventListener('click', () => {
      this.compareModal.classList.remove('active');
    });

    // Quiz Modal Open / Close
    if (this.quizBtn) {
      this.quizBtn.addEventListener('click', () => {
        this.quizModal.classList.toggle('active');
        if (this.quizModal.classList.contains('active')) {
          this.populateQuiz();
        }
      });
    }

    if (this.closeQuizBtn) {
      this.closeQuizBtn.addEventListener('click', () => {
        this.quizModal.classList.remove('active');
      });
    }

    // Black Hole Collapse & Evaporate Buttons
    if (this.collapseBtn) {
      this.collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.renderEngine.blackHoleState === 'active' || this.renderEngine.blackHoleState === 'shattering') {
          this.renderEngine.triggerBlackHoleEvaporation();
        } else {
          this.stopTour();
          this.renderEngine.setTargetOrder(-35.0);
          this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);
        }
      });
    }

    if (this.evaporateBtn) {
      this.evaporateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderEngine.triggerBlackHoleEvaporation();
      });
    }

    if (this.bhModeToggleBtn) {
      this.bhModeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderEngine.blackHoleAccretionMode = this.renderEngine.blackHoleAccretionMode === 'disk' ? 'vacuum' : 'disk';
        const isDisk = this.renderEngine.blackHoleAccretionMode === 'disk';
        if (this.bhModeLabel) {
          this.bhModeLabel.textContent = this.lang === 'bn'
            ? (isDisk ? 'গ্যাসীয় ডিস্ক সহ' : 'বিশুদ্ধ ভ্যাকিউম')
            : (isDisk ? 'With Disk' : 'Pure Vacuum');
        }
        this.updateBlackHoleStats();
        this.audioEngine.playChime(640);
      });
    }

    // 3-Ring Geometry Overlay Toggle [O]
    if (this.bhOverlayToggleBtn) {
      this.bhOverlayToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderEngine.showGeometryOverlay = !this.renderEngine.showGeometryOverlay;
        this.bhOverlayToggleBtn.classList.toggle('active', this.renderEngine.showGeometryOverlay);
        this.audioEngine.playChime(this.renderEngine.showGeometryOverlay ? 720 : 540);
      });
    }

    // Black Hole Mass Scale Presets Switcher
    if (this.bhMassChips) {
      this.bhMassChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const mass = chip.getAttribute('data-mass');
          this.renderEngine.blackHoleMassType = mass;
          this.bhMassChips.forEach(c => c.classList.toggle('active', c === chip));
          this.updateBlackHoleStats();
          this.audioEngine.playChime(620);
        });
      });
    }

    // Black Hole Card Hide & Restore Pill Buttons
    if (this.bhHideCardBtn) {
      this.bhHideCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.blackholeOverlay) {
          this.blackholeOverlay.classList.add('card-minimized');
        }
        if (this.bhRestoreCardPill) {
          this.bhRestoreCardPill.style.display = 'inline-flex';
        }
        this.audioEngine.playChime(480);
      });
    }

    if (this.bhRestoreCardPill) {
      this.bhRestoreCardPill.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.blackholeOverlay) {
          this.blackholeOverlay.classList.remove('card-minimized');
        }
        if (this.bhRestoreCardPill) {
          this.bhRestoreCardPill.style.display = 'none';
        }
        this.audioEngine.playChime(640);
      });
    }

    // Fullscreen Toggle
    this.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === '-' || e.key === '_') {
        this.stopTour();
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.triggerBlackHoleEvaporation();
          return;
        }
        this.renderEngine.addZoomDelta(1.0);
        this.audioEngine.playZoomPulse(1);
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === '+' || e.key === '=') {
        this.stopTour();
        if (this.renderEngine.blackHoleState === 'active') return;
        if (this.renderEngine.currentOrder <= -34.75) {
          clearTimeout(this.strainDecayTimer);
          this.planckStrainCount = Math.min(7, (this.planckStrainCount || 0) + 1);
          if (this.strainContainer) {
            this.strainContainer.style.display = 'flex';
            this.strainContainer.style.opacity = '1';
          }
          const pct = Math.round((this.planckStrainCount / 7) * 100);
          if (this.strainFillBar) this.strainFillBar.style.width = `${pct}%`;
          if (this.strainPercentText) {
            this.strainPercentText.textContent = `${this.lang === 'bn' ? this.toBanglaNum(pct) : pct}%`;
          }
          this.audioEngine.playSpacetimeStress(this.planckStrainCount / 7);
          this.renderEngine.strainShakeIntensity = this.planckStrainCount * 2.8;
          if (this.planckStrainCount >= 7) {
            this.planckStrainCount = 0;
            if (this.strainContainer) this.strainContainer.style.display = 'none';
            this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);
            return;
          }
          this.strainDecayTimer = setTimeout(() => this.dischargeStrain(), 1800);
          return;
        }
        this.renderEngine.addZoomDelta(-1.0);
        this.audioEngine.playZoomPulse(-1);
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'i' || e.key === 'I') {
        if (this.renderEngine.blackHoleState === 'active' && this.blackholeOverlay) {
          const isMin = this.blackholeOverlay.classList.toggle('card-minimized');
          if (this.bhRestoreCardPill) {
            this.bhRestoreCardPill.style.display = isMin ? 'inline-flex' : 'none';
          }
          this.audioEngine.playChime(isMin ? 480 : 640);
        }
      } else if (e.key === 'o' || e.key === 'O') {
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.showGeometryOverlay = !this.renderEngine.showGeometryOverlay;
          if (this.bhOverlayToggleBtn) {
            this.bhOverlayToggleBtn.classList.toggle('active', this.renderEngine.showGeometryOverlay);
          }
          this.audioEngine.playChime(this.renderEngine.showGeometryOverlay ? 720 : 540);
        }
      } else if (e.key === '0') {
        this.stopTour();
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.triggerBlackHoleEvaporation();
        }
        this.renderEngine.setTargetOrder(0.23); // Reset to human scale
        this.audioEngine.playChime(500);
      } else if (e.key === 'b' || e.key === 'B') {
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.triggerBlackHoleEvaporation();
        } else {
          this.renderEngine.triggerBlackHoleCollapse(window.innerWidth / 2, window.innerHeight / 2);
        }
      } else if (e.key === 'x' || e.key === 'X') {
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.triggerBlackHoleEvaporation();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.renderEngine.blackHoleState === 'active') {
          this.renderEngine.triggerBlackHoleEvaporation();
        } else {
          this.toggleTour();
        }
      } else if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  updateCornerDisclaimer() {
    if (!this.cornerDisclaimerEl) return;
    this.cornerDisclaimerEl.textContent = this.lang === 'bn'
      ? 'সরলীকৃত ২ডি আপেক্ষিকীয় মডেল, আসল ছবি নয়'
      : 'Simplified 2D Relativistic Model, Not Real Image';
  }

  toBanglaNum(num) {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, d => bnDigits[d]);
  }

  dischargeStrain() {
    if (this.planckStrainCount > 0) {
      this.planckStrainCount--;
      const pct = Math.round((this.planckStrainCount / 7) * 100);
      if (this.strainFillBar) this.strainFillBar.style.width = `${pct}%`;
      if (this.strainPercentText) {
        this.strainPercentText.textContent = `${this.lang === 'bn' ? this.toBanglaNum(pct) : pct}%`;
      }
      if (this.planckStrainCount > 0) {
        this.strainDecayTimer = setTimeout(() => this.dischargeStrain(), 250);
      } else {
        if (this.strainContainer) {
          this.strainContainer.style.opacity = '0';
          setTimeout(() => {
            if (this.planckStrainCount === 0 && this.strainContainer) {
              this.strainContainer.style.display = 'none';
            }
          }, 350);
        }
      }
    }
  }

  closeModals() {
    this.searchModal.classList.remove('active');
    this.compareModal.classList.remove('active');
    if (this.quizModal) this.quizModal.classList.remove('active');
    // Escape strictly closes dialogue modals and preserves the black hole state
  }

  renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const results = COSMIC_OBJECTS.filter(obj => {
      return obj.nameEn.toLowerCase().includes(q) ||
             obj.nameBn.includes(q) ||
             obj.summaryEn.toLowerCase().includes(q) ||
             obj.summaryBn.includes(q);
    });

    this.searchResults.innerHTML = '';
    if (results.length === 0) {
      this.searchResults.innerHTML = `<div class="no-result">${this.lang === 'bn' ? 'কোনো বস্তু পাওয়া যায়নি' : 'No objects found'}</div>`;
      return;
    }

    results.forEach(obj => {
      const row = document.createElement('div');
      row.className = 'search-item';
      row.innerHTML = `
        <div class="search-item-info">
          <h4>${this.lang === 'bn' ? obj.nameBn : obj.nameEn} <span class="search-sub">(${obj.nameEn})</span></h4>
          <p>${this.lang === 'bn' ? obj.sizeFormattedBn : obj.sizeFormatted}</p>
        </div>
        <span class="search-order">10<sup>${obj.order > 0 ? '+' : ''}${Math.round(obj.order)}</sup> m</span>
      `;
      row.addEventListener('click', () => {
        this.renderEngine.setTargetOrder(obj.order);
        this.closeModals();
        this.audioEngine.playChime(640);
      });
      this.searchResults.appendChild(row);
    });
  }

  toggleTour() {
    this.isAutoCruising = !this.isAutoCruising;
    this.tourBtn.classList.toggle('active', this.isAutoCruising);
    if (this.isAutoCruising) {
      this.tourBtn.innerHTML = `<span class="tour-icon-slot">${getIcon('pause')}</span><span class="btn-text">${this.lang === 'bn' ? 'থামুন' : 'Pause'}</span>`;
      // If we are at the bottom (Planck length), reverse direction upward
      if (this.renderEngine.currentOrder <= -34.8) {
        this.cruiseDirection = 1;
      } else if (this.renderEngine.currentOrder >= 26.8) {
        this.cruiseDirection = -1;
      }
      this.audioEngine.playChime(440);
    } else {
      this.tourBtn.innerHTML = `<span class="tour-icon-slot">${getIcon('play')}</span><span class="btn-text">${this.lang === 'bn' ? 'ট্যুর শুরু' : 'Auto Tour'}</span>`;
    }
  }

  stopTour() {
    if (this.isAutoCruising) {
      this.isAutoCruising = false;
      this.tourBtn.classList.remove('active');
      this.tourBtn.innerHTML = `<span class="tour-icon-slot">${getIcon('play')}</span><span class="btn-text">${this.lang === 'bn' ? 'ট্যুর শুরু' : 'Auto Tour'}</span>`;
    }
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Handle Auto Cruise Travel
      if (this.isAutoCruising) {
        const nextOrder = this.renderEngine.targetOrder + this.cruiseSpeed * this.cruiseDirection;
        if (nextOrder <= -35.0) {
          this.cruiseDirection = 1; // Turn around to zoom back out!
        } else if (nextOrder >= 27.0) {
          this.cruiseDirection = -1;
        }
        this.renderEngine.setTargetOrder(nextOrder);
      }

      // Handle Gravitational Compression Charging while Mouse / Touch is held
      if (this.isMouseDown && this.renderEngine.blackHoleState === 'charging') {
        this.renderEngine.updateCompression(dt, true, this.mousePos.x, this.mousePos.y);
      }

      // Update 2D Render Engine
      this.renderEngine.update(dt);
      this.renderEngine.render();

      // Update UI Telemetry & Audio
      this.updateHUD();
      this.audioEngine.updateScale(this.renderEngine.currentOrder, this.renderEngine.zoomVelocity);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updateHUD(forceRefresh = false) {
    const currentOrder = this.renderEngine.currentOrder;
    this.syncHash();

    // Sync Slider: 0 at +27 (Universe), 62 at -35 (Planck)
    if (document.activeElement !== this.sliderEl) {
      this.sliderEl.value = Math.max(0, Math.min(62, 27 - currentOrder)).toFixed(2);
    }

    // Exponent Indicator
    const sign = currentOrder >= 0 ? '+' : '';
    const roundedExp = currentOrder.toFixed(1);
    this.orderExpEl.innerHTML = `10<sup>${sign}${roundedExp}</sup> m`;

    // Calculate Metric Unit Friendly Equivalent
    const meters = Math.pow(10, currentOrder);
    this.orderMetricEl.textContent = this.formatMetersMetric(meters);

    // Calculate Light Travel Time: t = d / c with comoving universe exception
    if (currentOrder >= 26.5) {
      this.lightTimeEl.textContent = this.lang === 'bn' ? 'N/A (প্রসারণশীল মহাবিশ্বের কো-মুভিং দূরত্ব)' : 'N/A (Comoving Distance)';
    } else {
      const lightSeconds = meters / 299792458;
      this.lightTimeEl.textContent = this.formatLightTransit(lightSeconds);
    }

    // Dynamic Real-Time Screen Ruler (Field of View Width = 2.5 * scale)
    if (this.rulerLabelEl) {
      const screenFieldMeters = meters * 2.5;
      this.rulerLabelEl.textContent = (this.lang === 'bn' ? 'স্ক্রিন ভিউ প্রস্থ: ' : 'Screen Field: ') + this.formatMetersMetric(screenFieldMeters);
    }

    // Planck Wall Paradox Quantum Boundary Alert
    if (this.planckWallBannerEl) {
      this.planckWallBannerEl.classList.toggle('active', currentOrder <= -34.5);
    }

    // Active Domain Classification
    const domain = SCALE_DOMAINS.find(d => currentOrder >= d.min && currentOrder <= d.max) || SCALE_DOMAINS[SCALE_DOMAINS.length - 1];
    this.domainBadgeEl.innerHTML = `<span class="domain-icon-slot">${getIcon(domain.iconKey || 'universe')}</span><span class="domain-text-slot">${this.lang === 'bn' ? domain.nameBn : domain.nameEn}</span>`;
    this.domainBadgeEl.style.borderColor = domain.color;
    this.domainBadgeEl.style.boxShadow = `0 0 12px ${domain.color}44`;

    // Highlight active quick jump milestone button
    if (this.jumpButtons) {
      let closestBtn = null;
      let minJumpDiff = Infinity;
      for (const j of this.jumpButtons) {
        const diff = Math.abs(j.order - currentOrder);
        if (diff < minJumpDiff) {
          minJumpDiff = diff;
          closestBtn = j.btn;
        }
      }
      this.jumpButtons.forEach(j => {
        j.btn.classList.toggle('active', j.btn === closestBtn && minJumpDiff < 2.5);
      });
    }

    // Find nearest landmark object
    let nearest = null;
    let minDiff = Infinity;
    for (const obj of COSMIC_OBJECTS) {
      const diff = Math.abs(obj.order - currentOrder);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = obj;
      }
    }

    // Refresh object card if changed or forced
    if (nearest && (nearest !== this.activeObject || forceRefresh)) {
      this.activeObject = nearest;
      this.objectNameEl.textContent = this.lang === 'bn' ? nearest.nameBn : nearest.nameEn;
      this.objectSubNameEl.textContent = nearest.nameEn !== (this.lang === 'bn' ? nearest.nameBn : nearest.nameEn) ? nearest.nameEn : '';
      this.objectDimensionEl.textContent = this.lang === 'bn' ? nearest.sizeFormattedBn : nearest.sizeFormatted;
      this.objectDimensionEl.style.color = nearest.accentColor;
      this.objectSummaryEl.textContent = this.lang === 'bn' ? nearest.summaryBn : nearest.summaryEn;

      // Update Scientific Truth Tag Badge
      if (this.truthBadgeEl && this.truthTextValEl) {
        this.truthBadgeEl.className = `truth-badge ${nearest.truthTag || 'verified'}`;
        this.truthTextValEl.textContent = this.lang === 'bn' ? (nearest.truthBadgeBn || 'পরিমাপকৃত') : (nearest.truthBadgeEn || 'Verified');
      }

      // Update Force Dominance Badge & Side Panel
      if (this.forceBadgeEl && this.forceTextValEl) {
        this.forceTextValEl.textContent = this.lang === 'bn' ? (nearest.dominantForceBn || 'মহাকর্ষ বল') : (nearest.dominantForceEn || 'Gravity');
      }
      if (this.forceRows) {
        this.forceRows.forEach(row => {
          row.classList.toggle('active', row.getAttribute('data-force') === nearest.dominantForce);
        });
      }

      // Update Instrument Ladder
      if (this.instrumentContentEl) {
        this.instrumentContentEl.textContent = this.lang === 'bn' ? (nearest.instrumentBn || 'অপটিক্যাল দূরবীণ') : (nearest.instrumentEn || 'Optical Telescope');
      }

      // Update Human Scale Transit Equivalents
      if (nearest.humanTransit) {
        if (this.transitWalkValEl) this.transitWalkValEl.textContent = nearest.humanTransit.walk || 'N/A';
        if (this.transitJetValEl) this.transitJetValEl.textContent = nearest.humanTransit.jet || 'N/A';
        if (this.transitVoyagerValEl) this.transitVoyagerValEl.textContent = nearest.humanTransit.voyager || 'N/A';
      }

      // Update Misconception Buster Box
      if (this.misconceptionContainerEl) {
        if (nearest.misconception) {
          this.misconceptionContainerEl.style.display = 'block';
          if (this.misconceptionHeadingEl) this.misconceptionHeadingEl.textContent = nearest.misconception.titleBn || 'ভুল ধারণা ভাঙা';
          if (this.misconceptionTextEl) this.misconceptionTextEl.textContent = nearest.misconception.realityBn || '';
        } else {
          this.misconceptionContainerEl.style.display = 'none';
        }
      }

      // Schwarzschild Black Hole Radius Box
      if (this.blackholeContainerEl && this.blackholeValEl) {
        if (nearest.blackHoleRadiusBn) {
          this.blackholeContainerEl.style.display = 'block';
          this.blackholeValEl.textContent = this.lang === 'bn' ? nearest.blackHoleRadiusBn : nearest.blackHoleRadiusEn;
        } else {
          this.blackholeContainerEl.style.display = 'none';
        }
      }

      // Fact box
      if (nearest.factEn) {
        this.factContainerEl.style.display = 'block';
        this.objectFactEl.textContent = this.lang === 'bn' ? nearest.factBn : nearest.factEn;
      } else {
        this.factContainerEl.style.display = 'none';
      }
    }
  }

  formatMetersMetric(m) {
    if (m >= 9.46e25) return this.lang === 'bn' ? `${(m / 9.46e15).toExponential(1)} আলোকবর্ষ` : `${(m / 9.46e15).toExponential(1)} Light Years`;
    if (m >= 9.46e15) return this.lang === 'bn' ? `${(m / 9.46e15).toFixed(1)} আলোকবর্ষ` : `${(m / 9.46e15).toFixed(1)} Light Years`;
    if (m >= 1.496e11) return this.lang === 'bn' ? `${(m / 1.496e11).toFixed(1)} জ্যোতির্বৈজ্ঞানিক একক (AU)` : `${(m / 1.496e11).toFixed(1)} AU`;
    if (m >= 1e9) return this.lang === 'bn' ? `${(m / 1e9).toFixed(1)} মিলিয়ন কিমি` : `${(m / 1e9).toFixed(1)} Million km`;
    if (m >= 1e3) return this.lang === 'bn' ? `${(m / 1e3).toFixed(1)} কিলোমিটার` : `${(m / 1e3).toFixed(1)} km`;
    if (m >= 1) return this.lang === 'bn' ? `${m.toFixed(2)} মিটার` : `${m.toFixed(2)} m`;
    if (m >= 1e-2) return this.lang === 'bn' ? `${(m * 100).toFixed(1)} সেন্টিমিটার` : `${(m * 100).toFixed(1)} cm`;
    if (m >= 1e-3) return this.lang === 'bn' ? `${(m * 1e3).toFixed(1)} মিলিমিটার` : `${(m * 1e3).toFixed(1)} mm`;
    if (m >= 1e-6) return this.lang === 'bn' ? `${(m * 1e6).toFixed(1)} মাইক্রন (µm)` : `${(m * 1e6).toFixed(1)} µm`;
    if (m >= 1e-9) return this.lang === 'bn' ? `${(m * 1e9).toFixed(1)} ন্যানোমিটার (nm)` : `${(m * 1e9).toFixed(1)} nm`;
    if (m >= 1e-12) return this.lang === 'bn' ? `${(m * 1e12).toFixed(1)} পিকোমিটার (pm)` : `${(m * 1e12).toFixed(1)} pm`;
    if (m >= 1e-15) return this.lang === 'bn' ? `${(m * 1e15).toFixed(1)} ফেমটোমিটার (fm)` : `${(m * 1e15).toFixed(1)} fm`;
    if (m >= 1e-18) return this.lang === 'bn' ? `${(m * 1e18).toFixed(1)} অ্যাটোমিটার (am)` : `${(m * 1e18).toFixed(1)} am`;
    return `${m.toExponential(2)} m`;
  }

  formatLightTransit(s) {
    const yearSec = 31557600;
    if (s >= yearSec * 1e9) return this.lang === 'bn' ? `${(s / (yearSec * 1e9)).toFixed(1)} বিলিয়ন বছর` : `${(s / (yearSec * 1e9)).toFixed(1)} Billion Years`;
    if (s >= yearSec * 1e6) return this.lang === 'bn' ? `${(s / (yearSec * 1e6)).toFixed(1)} মিলিয়ন বছর` : `${(s / (yearSec * 1e6)).toFixed(1)} Million Years`;
    if (s >= yearSec) return this.lang === 'bn' ? `${(s / yearSec).toFixed(1)} বছর` : `${(s / yearSec).toFixed(1)} Years`;
    if (s >= 3600) return this.lang === 'bn' ? `${(s / 3600).toFixed(1)} ঘণ্টা` : `${(s / 3600).toFixed(1)} Hours`;
    if (s >= 60) return this.lang === 'bn' ? `${(s / 60).toFixed(1)} মিনিট` : `${(s / 60).toFixed(1)} Minutes`;
    if (s >= 1) return this.lang === 'bn' ? `${s.toFixed(2)} সেকেন্ড` : `${s.toFixed(2)} Seconds`;
    if (s >= 1e-3) return this.lang === 'bn' ? `${(s * 1e3).toFixed(1)} মিলিসেকেন্ড` : `${(s * 1e3).toFixed(1)} ms`;
    if (s >= 1e-6) return this.lang === 'bn' ? `${(s * 1e6).toFixed(1)} মাইক্রোসেকেন্ড` : `${(s * 1e6).toFixed(1)} µs`;
    if (s >= 1e-9) return this.lang === 'bn' ? `${(s * 1e9).toFixed(1)} ন্যানোসেকেন্ড` : `${(s * 1e9).toFixed(1)} ns`;
    if (s >= 1e-12) return this.lang === 'bn' ? `${(s * 1e12).toFixed(1)} পিকোসেকেন্ড` : `${(s * 1e12).toFixed(1)} ps`;
    if (s >= 1e-15) return this.lang === 'bn' ? `${(s * 1e15).toFixed(1)} ফেমটোসেকেন্ড` : `${(s * 1e15).toFixed(1)} fs`;
    if (s >= 1e-18) return this.lang === 'bn' ? `${(s * 1e18).toFixed(1)} অ্যাটোসেকেন্ড` : `${(s * 1e18).toFixed(1)} as`;
    if (s >= 1e-21) return this.lang === 'bn' ? `${(s * 1e21).toFixed(1)} জেপ্টোসেকেন্ড` : `${(s * 1e21).toFixed(1)} zs`;
    if (s >= 1e-24) return this.lang === 'bn' ? `${(s * 1e24).toFixed(1)} ইয়োক্টোসেকেন্ড` : `${(s * 1e24).toFixed(1)} ys`;
    return `${s.toExponential(2)} s (Planck Time Order)`;
  }

  calculateBlackHolePhysics(object) {
    const G = 6.6743e-11;
    const c = 299792458;
    const hbar = 1.0545718e-34;
    const kB = 1.380649e-23;

    const massType = this.renderEngine ? this.renderEngine.blackHoleMassType : 'planck';

    let massKg = 2.176434e-8; // Default Planck mass
    let objNameBn = 'প্ল্যাঙ্ক ভর (কোয়ান্টাম সীমা)';
    let objNameEn = 'Planck Mass (Quantum Limit)';
    let customLifespanBn = null;
    let customLifespanEn = null;

    if (massType === 'planck') {
      massKg = 2.176434e-8;
      objNameBn = 'প্ল্যাঙ্ক ভর (কোয়ান্টাম সীমা)';
      objNameEn = 'Planck Mass (Quantum Limit)';
      customLifespanBn = '~১০⁻⁴⁰ s (আনুমানিক, ~১০⁻³৯ থেকে ১০⁻⁴³ s, তাত্ত্বিক)';
      customLifespanEn = '~10⁻⁴⁰ s (est. ~10⁻³⁹ to 10⁻⁴³ s, theoretical)';
    } else if (massType === 'sun') {
      massKg = 1.989e30;
      objNameBn = 'সূর্য (১ সৌর ভর)';
      objNameEn = 'The Sun (1 Solar Mass)';
    } else if (massType === 'sgra') {
      massKg = 8.26e36;
      objNameBn = 'স্যাজিটেরিয়াস A* (সুপারম্যাসিভ)';
      objNameEn = 'Sagittarius A* (Supermassive)';
    } else if (object) {
      if (object.id === 'earth') {
        massKg = 5.972e24;
        objNameBn = 'পৃথিবী';
        objNameEn = 'Planet Earth';
      } else if (object.massKg) {
        massKg = object.massKg;
        objNameBn = object.nameBn;
        objNameEn = object.nameEn;
      }
    }

    const rs = (2 * G * massKg) / (c * c);
    const rph = 1.5 * rs;
    const rshadow = (Math.sqrt(27) / 2) * rs;
    const TH = (hbar * Math.pow(c, 3)) / (8 * Math.PI * G * massKg * kB);
    const tEvapSec = (5120 * Math.PI * Math.pow(G, 2) * Math.pow(massKg, 3)) / (hbar * Math.pow(c, 4));
    const tEvapYrs = tEvapSec / (365.25 * 86400);

    return { massKg, objNameBn, objNameEn, rs, rph, rshadow, TH, tEvapSec, tEvapYrs, customLifespanBn, customLifespanEn, massType };
  }

  formatScientific(val, unit = '', isBn = false) {
    if (typeof val !== 'number' || isNaN(val)) return '';
    const expStr = val.toExponential(2);
    if (!isBn) return `${expStr} ${unit}`.trim();
    const [coeff, exp] = expStr.split('e');
    const bnCoeff = this.toBanglaNum(coeff);
    const expNum = parseInt(exp, 10);
    const superscripts = {
      '-': '⁻', '+': '⁺', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    const sign = expNum < 0 ? '⁻' : '';
    const absExpStr = String(Math.abs(expNum));
    const bnExp = absExpStr.split('').map(c => superscripts[c] || c).join('');
    return `${bnCoeff} × ১০${sign}${bnExp} ${unit}`.trim();
  }

  formatDistance(meters, isBn = false) {
    if (meters >= 1000) {
      const v = (meters / 1000).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} কিমি` : `${v} km`;
    }
    if (meters >= 0.01) {
      const v = (meters * 1000).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} মিমি` : `${v} mm`;
    }
    if (meters >= 1e-6) {
      const v = (meters * 1e6).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} µm` : `${v} µm`;
    }
    if (meters >= 1e-9) {
      const v = (meters * 1e9).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} nm` : `${v} nm`;
    }
    if (meters >= 1e-12) {
      const v = (meters * 1e12).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} pm` : `${v} pm`;
    }
    if (meters >= 1e-15) {
      const v = (meters * 1e15).toFixed(2);
      return isBn ? `${this.toBanglaNum(v)} fm` : `${v} fm`;
    }
    return this.formatScientific(meters, isBn ? 'মি' : 'm', isBn);
  }

  updateBlackHoleStats() {
    if (!this.bhStatRadius) return;
    const bh = this.calculateBlackHolePhysics(this.activeObject);

    const name = this.lang === 'bn' ? bh.objNameBn : bh.objNameEn;
    const isBn = this.lang === 'bn';

    if (this.bhStatMass) {
      this.bhStatMass.textContent = isBn
        ? `${this.formatScientific(bh.massKg, 'কেজি', true)} (${name})`
        : `${bh.massKg.toExponential(2)} kg (${name})`;
    }

    if (this.bhStatRadius) {
      const rsStr = this.formatDistance(bh.rs, isBn);
      const rshStr = this.formatDistance(bh.rshadow, isBn);
      this.bhStatRadius.textContent = `rs = ${rsStr} | ${isBn ? 'শ্যাডো' : 'Shadow'} ≈ ${rshStr}`;
    }

    if (this.bhStatPhoton) {
      const rphStr = this.formatDistance(bh.rph, isBn);
      this.bhStatPhoton.textContent = `${isBn ? '১.৫' : '1.5'} × rs (${rphStr})`;
    }

    if (this.bhStatHawking) {
      let tStr = '';
      if (isBn && bh.customLifespanBn) {
        tStr = bh.customLifespanBn;
      } else if (!isBn && bh.customLifespanEn) {
        tStr = bh.customLifespanEn;
      } else if (bh.tEvapYrs >= 1e6) {
        tStr = isBn
          ? `~${this.formatScientific(bh.tEvapYrs, 'বছর', true)}`
          : `~${bh.tEvapYrs.toExponential(1)} yrs`;
      } else if (bh.tEvapSec >= 1) {
        tStr = isBn
          ? `~${this.toBanglaNum(bh.tEvapSec.toFixed(1))} সেকেন্ড`
          : `~${bh.tEvapSec.toFixed(1)} s`;
      } else {
        tStr = isBn
          ? `${this.formatScientific(bh.tEvapSec, 'সেকেন্ড', true)}`
          : `${bh.tEvapSec.toExponential(2)} s`;
      }
      this.bhStatHawking.textContent = isBn
        ? `${this.formatScientific(bh.TH, 'K', true)} (${tStr})`
        : `${bh.TH.toExponential(1)} K (${tStr})`;
    }

    if (this.bhNoticeText) {
      const isPlanck = bh.massType === 'planck';
      const isDisk = this.renderEngine.blackHoleAccretionMode === 'disk';
      if (isPlanck) {
        this.bhNoticeText.textContent = this.lang === 'bn'
          ? 'প্ল্যাঙ্ক-ভরের কোয়ান্টাম ব্ল্যাকহোল: এখানে কোনো গ্যাসীয় অ্যাক্রিশন ডিস্ক বা জেট বাস্তবসম্মত নয়। ঘটনা দিগন্তের কিনারায় কোয়ান্টাম ফ্লাকচুয়েশনের ফলে ভার্চুয়াল হকিং কণা জোড়া তৈরি হচ্ছে এবং তীব্র বিকিরণে বাষ্পীভূত হচ্ছে।'
          : 'Planck-mass quantum black hole: An accretion disk or polar jet is physically impossible here. Spacetime quantum fluctuations produce virtual Hawking particle pairs at the horizon, radiating away in rapid evaporation.';
      } else {
        this.bhNoticeText.textContent = this.lang === 'bn'
          ? `মহাকর্ষীয় পতনে "${name}"-এর ভর সংকুচিত হয়ে একটি অ-ঘূর্ণায়মান শোয়ার্জশিল্ড ব্ল্যাকহোল তৈরি করেছে। আপেক্ষিকতায় আলো বেঁকে তৈরি হয়েছে ফোটন রিং (১.৫ rs) ও স্থান-কাল শ্যাডো (২.৬ rs)। ${isDisk ? 'ঘূর্ণায়মান গ্যাসীয় ডিস্কে তাপমাত্রা গ্রেডিয়েন্ট ও ডপলার বিমিং প্রতিভাত।' : 'বিশুদ্ধ ভ্যাকিউমে স্থান-কালের গ্র্যাভিটেশনাল লেন্সিং ও আলো বাঁকার দৃশ্য দৃশ্যমান।'}`
          : `Gravitational collapse compressed "${name}" into a Schwarzschild black hole. General relativity bends light into a photon ring (1.5 rs) and shadow (2.6 rs). ${isDisk ? 'Relativistic Doppler beaming and temperature gradient visible on accretion disk.' : 'Pure vacuum curvature shows pristine gravitational light deflection without matter.'}`;
      }
    }

    if (this.bhDisclaimerText) {
      this.bhDisclaimerText.textContent = this.lang === 'bn'
        ? '[তাত্ত্বিক সরলীকৃত ২ডি মডেল] | আসল ফোটন রিং এর চেয়েও সূক্ষ্ম ও ঝাপসা।'
        : '[Simplified 2D Theoretical Model] | Physical photon ring is sharper and fainter.';
    }

    // Screen reader live announcement
    if (this.bhSrAnnouncements) {
      this.bhSrAnnouncements.textContent = this.lang === 'bn'
        ? `শোয়ার্জশিল্ড ব্ল্যাকহোল সক্রিয়। সংকুচিত ভর: ${name}, শোয়ার্জশিল্ড ব্যাসার্ধ: ${this.formatDistance(bh.rs, true)}`
        : `Schwarzschild black hole active. Collapsed mass: ${name}, Event horizon radius: ${this.formatDistance(bh.rs, false)}`;
    }
  }
}

// Initialize Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.cosmicApp = new CosmicApp();
});
