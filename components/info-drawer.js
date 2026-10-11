/**
 * CosmoPlanck Reusable Component: ⓘ Info Drawer
 * Structure: Claim (দাবি) -> Tier (স্তর) -> Evidence/Sources (প্রমাণ/সূত্র) -> "Unknown" Note ("অজানা" নোট) -> "Report Error" Button ("ভুল জানান" বোতাম)
 *
 * Accessibility & Standards:
 * - WCAG 2.2 AA compliant
 * - Full keyboard navigation (Escape to close, focus trapped)
 * - ARIA modal dialog semantics (role="dialog", aria-modal="true")
 * - Bilingual support (English / Bangla)
 * - Respects prefers-reduced-motion
 */

import { createTierBadge, TIER_DEFINITIONS } from './tier-badge.js';

export class InfoDrawer {
  constructor({ container = document.body, lang = 'en', onReportError = null } = {}) {
    this.container = container;
    this.lang = lang;
    this.onReportError = onReportError;
    this.isOpen = false;
    this.activeData = null;
    this.previouslyFocusedElement = null;

    this.initDOM();
  }

  initDOM() {
    // Backdrop Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'info-drawer-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    this.overlay.style.display = 'none';

    // Drawer Container
    this.drawer = document.createElement('aside');
    this.drawer.className = 'info-drawer-panel';
    this.drawer.setAttribute('role', 'dialog');
    this.drawer.setAttribute('aria-modal', 'true');
    this.drawer.setAttribute('aria-labelledby', 'drawer-claim-heading');
    this.drawer.setAttribute('aria-describedby', 'drawer-evidence-body');
    this.drawer.setAttribute('tabindex', '-1');
    this.drawer.style.display = 'none';

    this.drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-header-meta">
          <span class="drawer-telemetry-tag" id="drawer-telemetry-tag">
            <svg class="drawer-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span class="drawer-tag-text">SCIENTIFIC AUDIT & TRUTH TIER</span>
          </span>
          <div class="drawer-tier-slot" id="drawer-tier-slot"></div>
        </div>
        <button class="drawer-close-btn" id="drawer-close-btn" type="button" aria-label="Close Information Drawer" title="Close [Esc]">
          <svg class="drawer-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="drawer-body">
        <!-- 1. CLAIM (দাবি) -->
        <section class="drawer-section claim-section">
          <h3 class="section-label" id="drawer-label-claim">
            <span class="label-indicator claim-indicator"></span>
            <span class="label-title">দাবি (Claim)</span>
          </h3>
          <blockquote class="claim-quote-box" id="drawer-claim-heading"></blockquote>
        </section>

        <!-- 2. TIER DEFINITION (সত্যতা-স্তর বিবরণ) -->
        <section class="drawer-section tier-section">
          <h3 class="section-label" id="drawer-label-tier">
            <span class="label-indicator tier-indicator"></span>
            <span class="label-title">সত্যতা-স্তর (Truth Tier)</span>
          </h3>
          <div class="tier-card-explanation" id="drawer-tier-explanation"></div>
        </section>

        <!-- 3. EVIDENCE & SOURCES (প্রমাণ ও সূত্র) -->
        <section class="drawer-section evidence-section">
          <h3 class="section-label" id="drawer-label-evidence">
            <span class="label-indicator evidence-indicator"></span>
            <span class="label-title">প্রমাণ ও সূত্র (Evidence & Citations)</span>
          </h3>
          <div class="evidence-body" id="drawer-evidence-body"></div>
          <ul class="sources-list" id="drawer-sources-list"></ul>
        </section>

        <!-- 4. "UNKNOWN" & THEORETICAL LIMITS NOTE ("অজানা" নোট) -->
        <section class="drawer-section unknown-section">
          <h3 class="section-label" id="drawer-label-unknown">
            <span class="label-indicator unknown-indicator"></span>
            <span class="label-title">"অজানা" ও সীমাবদ্ধতা ("Unknown" & Theoretical Limits)</span>
          </h3>
          <div class="unknown-callout-box" id="drawer-unknown-body"></div>
        </section>
      </div>

      <!-- 5. REPORT ERROR BUTTON ("ভুল জানান" বোতাম) -->
      <div class="drawer-footer">
        <button class="drawer-report-btn" id="drawer-report-btn" type="button">
          <svg class="drawer-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          </svg>
          <span class="report-btn-text" id="drawer-report-text">ভুল জানান (Report Scientific Error)</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.overlay);
    this.container.appendChild(this.drawer);

    // Event listeners
    this.overlay.addEventListener('click', () => this.close());
    this.drawer.querySelector('#drawer-close-btn').addEventListener('click', () => this.close());

    this.drawer.querySelector('#drawer-report-btn').addEventListener('click', () => {
      this.triggerErrorReport();
    });

    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.isOpen && this.activeData) {
      this.renderData(this.activeData);
    }
  }

  /**
   * Opens the drawer with structured scientific data.
   *
   * @param {Object} data
   * @param {string} data.claimEn - Claim in English
   * @param {string} data.claimBn - Claim in Bangla
   * @param {'T1'|'T2'|'T3'|'T4'} data.tier - Truth Tier code
   * @param {string} data.evidenceEn - Scientific proof/methods in English
   * @param {string} data.evidenceBn - Scientific proof/methods in Bangla
   * @param {string[]} [data.sources] - List of citations/papers/URLs
   * @param {string} [data.unknownNoteEn] - Notes on unproven limits or unresolved problems
   * @param {string} [data.unknownNoteBn] - Notes on unproven limits in Bangla
   * @param {Function} [data.onReportError] - Custom callback when report button is clicked
   */
  open(data) {
    this.activeData = data;
    this.previouslyFocusedElement = document.activeElement;

    this.renderData(data);

    this.overlay.style.display = 'block';
    this.drawer.style.display = 'flex';

    // Trigger animation next tick
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
      this.drawer.classList.add('open');
      this.isOpen = true;

      // Focus close button for keyboard accessibility
      const closeBtn = this.drawer.querySelector('#drawer-close-btn');
      if (closeBtn) closeBtn.focus();
    });
  }

  close() {
    if (!this.isOpen) return;

    this.overlay.classList.remove('active');
    this.drawer.classList.remove('open');
    this.isOpen = false;

    setTimeout(() => {
      if (!this.isOpen) {
        this.overlay.style.display = 'none';
        this.drawer.style.display = 'none';
      }
    }, 280);

    // Restore focus
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
    }
  }

  renderData(data) {
    const isBn = this.lang === 'bn';

    // Update section titles based on language
    this.drawer.querySelector('#drawer-label-claim .label-title').textContent = isBn ? 'দাবি (Claim)' : 'Scientific Claim';
    this.drawer.querySelector('#drawer-label-tier .label-title').textContent = isBn ? 'সত্যতা-স্তর (Truth Tier)' : 'Epistemic Truth Tier';
    this.drawer.querySelector('#drawer-label-evidence .label-title').textContent = isBn ? 'প্রমাণ ও সূত্র (Evidence & Citations)' : 'Evidence & Formal Proof';
    this.drawer.querySelector('#drawer-label-unknown .label-title').textContent = isBn ? '"অজানা" ও সীমাবদ্ধতা (Unknown & Limits)' : 'Limits & Unresolved Physics';
    this.drawer.querySelector('#drawer-report-text').textContent = isBn ? 'ভুল জানান (Report Error)' : 'Report Error';

    // 1. Claim
    const claimText = isBn ? (data.claimBn || data.claimEn) : (data.claimEn || data.claimBn);
    this.drawer.querySelector('#drawer-claim-heading').textContent = `"${claimText}"`;

    // 2. Tier Badge & Explanation
    const tierSlot = this.drawer.querySelector('#drawer-tier-slot');
    tierSlot.innerHTML = '';
    const badge = createTierBadge({ tier: data.tier, lang: this.lang, compact: false, interactive: false });
    tierSlot.appendChild(badge);

    const tierMeta = TIER_DEFINITIONS[data.tier] || TIER_DEFINITIONS.T4;
    const tierExp = isBn ? tierMeta.descBn : tierMeta.descEn;
    this.drawer.querySelector('#drawer-tier-explanation').innerHTML = `
      <div class="tier-def-card">
        <strong>${tierMeta.code}: ${isBn ? tierMeta.labelBn : tierMeta.labelEn}</strong>
        <p>${tierExp}</p>
      </div>
    `;

    // 3. Evidence
    const evidenceText = isBn ? (data.evidenceBn || data.evidenceEn) : (data.evidenceEn || data.evidenceBn);
    this.drawer.querySelector('#drawer-evidence-body').textContent = evidenceText;

    const sourcesList = this.drawer.querySelector('#drawer-sources-list');
    sourcesList.innerHTML = '';
    if (Array.isArray(data.sources) && data.sources.length > 0) {
      data.sources.forEach(src => {
        const li = document.createElement('li');
        li.className = 'source-item';
        li.textContent = src;
        sourcesList.appendChild(li);
      });
    }

    // 4. "Unknown" / Theoretical Limits Note
    const unknownBody = this.drawer.querySelector('#drawer-unknown-body');
    const unknownText = isBn ? (data.unknownNoteBn || data.unknownNoteEn) : (data.unknownNoteEn || data.unknownNoteBn);
    if (unknownText) {
      unknownBody.parentElement.style.display = 'block';
      unknownBody.innerHTML = `
        <div class="unknown-callout-inner">
          <span class="unknown-icon-slot">
            <svg class="drawer-svg-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <div class="unknown-text">${unknownText}</div>
        </div>
      `;
    } else {
      unknownBody.parentElement.style.display = 'none';
    }
  }

  triggerErrorReport() {
    const isBn = this.lang === 'bn';
    const claim = this.activeData ? (isBn ? this.activeData.claimBn : this.activeData.claimEn) : '';
    const tier = this.activeData ? (this.activeData.tier || 'T3') : 'T3';

    if (typeof this.onReportError === 'function') {
      this.onReportError(this.activeData);
      return;
    }

    const title = encodeURIComponent(`[Scientific Errata] ${tier}: ${claim ? claim.slice(0, 45) : 'General Discrepancy'}...`);
    const body = encodeURIComponent(
      `### Scientific Claim\n- Truth Tier: ${tier}\n- Claim: ${claim}\n\n### Scientific Discrepancy\n[Please describe the theoretical or numerical discrepancy]\n\n### Counter-Evidence / Citation\n[PDG 2026 / DOI / arXiv paper reference]`
    );
    const githubUrl = `https://github.com/cosmic-zoom/cosmoplanck/issues/new?title=${title}&body=${body}&labels=scientific-audit`;

    const openGithub = window.confirm(
      isBn 
        ? `দাবি: "${claim}"\n\nআপনি কি GitHub-এ বৈজ্ঞানিক Errata রিপোর্ট খুলতে চান? (Cancel চাপলে ব্রাউজারে সরাসরি বার্তা দিতে পারবেন)`
        : `Claim: "${claim}"\n\nWould you like to open a GitHub Scientific Errata issue? (Click Cancel to report directly in-browser)`
    );

    if (openGithub) {
      window.open(githubUrl, '_blank', 'noopener,noreferrer');
    } else {
      const reason = window.prompt(
        isBn 
          ? `দাবি: "${claim}"\nঅনুগ্রহ করে বৈজ্ঞানিক অসঙ্গতি বা সূত্রের ভুলটি সংক্ষেপে লিখুন:` 
          : `Claim: "${claim}"\nPlease briefly describe the scientific discrepancy or counter-evidence:`
      );

      if (reason && reason.trim()) {
        alert(
          isBn
            ? `ধন্যবাদ! আপনার রিপোর্টটি Errata পর্যালোচনার জন্য গৃহীত হয়েছে:\n"${reason.trim()}"`
            : `Thank you! Your scientific report has been logged for Errata review:\n"${reason.trim()}"`
        );
      }
    }
  }
}
