/**
 * CosmoPlanck Quark Section - Chapter 9: "Asymptotic freedom"
 * 
 * Scientific Fidelity & Features:
 * 1. alpha_s(Q) Running Coupling Curve:
 *    - 1-loop/threshold MS-bar renormalization-group equation (RGE).
 *    - alpha_s(M_Z) = 0.1180 +- 0.0009 benchmark (PDG 2024 / 2026 World Average).
 *    - Active flavor thresholds: n_f = 3, 4, 5, 6 at m_c, m_b, m_t.
 *    - Non-perturbative shaded region: Q <= 1.0 GeV labeled "non-perturbative: সূত্র খাটে না".
 * 2. PDG Experimental Data Points (T1):
 *    - Direct measurements from tau decays, Upsilon, DIS (HERA), e+e- jets (PETRA),
 *      Z-pole (LEP/SLD), top production, and LHC high-pT jets with error bars.
 * 3. QED vs QCD Comparison:
 *    - QED screening: alpha grows slightly from 1/137 to ~1/128 at M_Z.
 *    - QCD anti-screening: alpha_s strongly decreases as Q increases.
 * 4. Physics Story & Nobel Prize 2004:
 *    - Gross, Politzer, Wilczek: "খুব কাছে কোয়ার্ক প্রায় মুক্ত, দূরে বাঁধন শক্ত".
 * 5. Strictly zero unicode emojis across all code and UI.
 */

import {
  getAsymptoticFreedomData,
  getRunningAlphaS
} from '../data/quark-facts.js';
import { createTierBadge } from '../components/tier-badge.js';

// Clean SVG icons (strictly zero emojis)
const ICON_INFO_SVG = '<svg class="c9-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
const ICON_ATOM_SVG = '<svg class="c9-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(150 12 12)"></ellipse></svg>';
const ICON_SPARK_SVG = '<svg class="c9-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>';
const ICON_ALERT_SVG = '<svg class="c9-icon-badge alert" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICON_ARROW_LEFT_SVG = '<svg class="c9-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_ARROW_RIGHT_SVG = '<svg class="c9-icon-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const ICON_MEDAL_SVG = '<svg class="c9-icon-badge gold" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>';

export class Chapter9AsymptoticFreedom {
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
    this.afData = getAsymptoticFreedomData();
    this.selectedProbeQ = 91.2; // default at Z pole (GeV)
    this.activePointId = null;

    this.initDOM();
  }

  initDOM() {
    this.viewEl = document.createElement('div');
    this.viewEl.className = 'chapter-9-view';
    this.viewEl.id = 'chapter-9-view';

    this.viewEl.innerHTML = `
      <!-- CHAPTER HEADER & BREADCRUMBS -->
      <section class="c9-header-section" aria-label="Chapter 9 Header">
        <div class="c9-header-top">
          <div class="c9-title-block">
            <div class="c9-pill-row">
              <span class="c9-chapter-badge">অধ্যায় ৯</span>
              <span class="c9-tier-badge-wrap" id="c9-tier-header"></span>
              <span class="c9-scheme-tag">RGE MS-bar (4-loop threshold)</span>
            </div>
            <h2 class="c9-main-title">Asymptotic freedom</h2>
            <p class="c9-subtitle">উচ্চ শক্তিতে কোয়ার্কের স্বাধীনতা, রানিং কাপলিং α_s(Q) ও ২০০৪ নোবেল আবিষ্কার</p>
          </div>

          <div class="c9-header-actions">
            <button class="c9-btn-outline" id="c9-btn-info" type="button" aria-label="Open scientific audit drawer">
              ${ICON_INFO_SVG}
              <span>তাত্ত্বিক ও PDG অডিট</span>
            </button>
          </div>
        </div>

        <!-- INTRO HERO CARD -->
        <div class="c9-intro-card">
          <div class="c9-intro-quote-badge">
            ${ICON_SPARK_SVG}
            <span>মূল নীতি: "খুব কাছে কোয়ার্ক প্রায় মুক্ত, দূরে বাঁধন শক্ত"</span>
          </div>
          <p class="c9-intro-text">
            সাধারণ বিদ্যুতে (QED) দুটি আধান যত কাছে আসে, তাদের আকর্ষণ বা বিকর্ষণ তত প্রবল হয়। 
            কিন্তু সবল নিউক্লীয় মিথস্ক্রিয়ায় (QCD) ঘটে ঠিক এর বিপরীত বিস্ময়! কোয়ার্কগুলো যখন অত্যন্ত কাছাকাছি 
            থাকে (উচ্চ শক্তি $Q$), তখন শক্তিশালী বলের কাপলিং ধ্রুবক $\\alpha_s$ দ্রুত কমতে থাকে — কোয়ার্করা যেন 
            কোনো বল ছাড়াই মুক্ত কণার মতো চলে। একেই বলা হয় <strong>Asymptotic Freedom (অ্যাসিম্পটোটিক ফ্রিডম)</strong>। 
            তবে তাদের পরস্পরের থেকে দূরে টানলে কালার ফিল্ড তীব্র হয়ে ওঠে এবং তাদের চিরতরে হ্যাড্রনের ভেতর বন্দি করে রাখে (কনফাইনমেন্ট)।
          </p>
        </div>
      </section>

      <!-- RUNNING COUPLING CHART SECTION -->
      <section class="c9-chart-section" aria-label="Running Coupling Alpha_s(Q) Chart">
        <div class="c9-chart-panel">
          <div class="c9-chart-header">
            <div class="c9-chart-title-wrap">
              <h3 class="c9-chart-title">α_s(Q) রানিং কাপলিং বক্ররেখা বনাম শক্তি স্কেল Q</h3>
              <span class="c9-chart-tag">PDG 2024 World Average: α_s(M_Z) = ${this.afData.alphaS_MZ.value} ± 0.0009</span>
            </div>
            <div class="c9-chart-legend">
              <div class="c9-legend-item">
                <span class="c9-legend-line theory-line"></span>
                <span class="c9-legend-txt">তাত্ত্বিক RGE বক্ররেখা (T2)</span>
              </div>
              <div class="c9-legend-item">
                <span class="c9-legend-dot data-dot"></span>
                <span class="c9-legend-txt">PDG পরীক্ষালব্ধ পরিমাপ (T1)</span>
              </div>
              <div class="c9-legend-item">
                <span class="c9-legend-box nonpert-box"></span>
                <span class="c9-legend-txt">Non-perturbative (Q ≲ ১ GeV)</span>
              </div>
            </div>
          </div>

          <!-- DYNAMIC SVG CHART CONTAINER -->
          <div class="c9-svg-wrap" id="c9-svg-wrap">
            <!-- Rendered by renderSvgChart() -->
          </div>

          <!-- PROBE CONTROLLER ROW -->
          <div class="c9-probe-controller">
            <div class="c9-slider-block">
              <div class="c9-slider-labels">
                <label for="c9-probe-slider" class="c9-slider-title">শক্তি স্কেল Q অন্বেষণ করুন (Probe Energy Scale):</label>
                <span class="c9-probe-q-val" id="c9-probe-q-readout">Q = ${this.selectedProbeQ} GeV</span>
              </div>
              <input type="range" class="c9-slider" id="c9-probe-slider" min="0.3" max="500" step="0.5" value="${this.selectedProbeQ}" />
              <div class="c9-slider-ticks">
                <span>১ GeV</span>
                <span>m_c (১.২৭)</span>
                <span>m_b (৪.১৮)</span>
                <span>M_Z (৯১.২)</span>
                <span>m_t (১৭৩)</span>
                <span>৫০০ GeV</span>
              </div>
            </div>

            <div class="c9-probe-readout-card" id="c9-probe-readout-card">
              <!-- Dynamically rendered probe status -->
            </div>
          </div>
        </div>
      </section>

      <!-- COMPARISON: QED VS QCD SECTION -->
      <section class="c9-comparison-section" aria-label="QED vs QCD Coupling Comparison">
        <div class="c9-comp-card">
          <div class="c9-comp-header">
            <span class="c9-comp-pill">মৌলিক বলের বৈপরীত্য</span>
            <h3 class="c9-comp-title">কেন QCD-তে কাপলিং কমে, কিন্তু QED-তে বাড়ে?</h3>
          </div>

          <div class="c9-comp-grid">
            <!-- QED BOX -->
            <div class="c9-box-force qed">
              <div class="c9-force-header">
                <div class="c9-force-icon-tag qed">QED</div>
                <div class="c9-force-title-wrap">
                  <h4 class="c9-force-title">কোয়ান্টাম ইলেক্ট্রোডাইনামিক্স (তড়িৎ-চুম্বকীয় বল)</h4>
                  <span class="c9-force-sub">ভ্যাকুয়াম স্ক্রিনিং (Screening Effect)</span>
                </div>
              </div>

              <div class="c9-force-metric">
                <span class="c9-metric-lbl">কাপলিং মান:</span>
                <span class="c9-metric-val">α ≈ ১/১৩৭ (নিম্ন শক্তি) → ≈ ১/১২৮ (M_Z-এ)</span>
              </div>

              <p class="c9-force-desc">
                তড়িৎক্ষেত্রে শূন্যস্থান নিস্তেজ থাকে না; ভার্চুয়াল ইলেকট্রন-পজিট্রন ($e^+ e^-$) জোড় সৃষ্টি হয়। 
                এই ভার্চুয়াল ডাইপোলগুলো মূল আধানকে ঢেকে বা <strong>স্ক্রিন (screen)</strong> করে ফেলে। 
                ফলে উচ্চ শক্তিতে মূল আধানের যত কাছাকাছি যাওয়া হয়, পর্দা ভেদ করার কারণে কার্যকরী আধান ও বলের শক্তি <strong>সামান্য বৃদ্ধি পায়</strong>।
              </p>
            </div>

            <!-- QCD BOX -->
            <div class="c9-box-force qcd">
              <div class="c9-force-header">
                <div class="c9-force-icon-tag qcd">QCD</div>
                <div class="c9-force-title-wrap">
                  <h4 class="c9-force-title">কোয়ান্টাম ক্রোমোডাইনামিক্স (সবল নিউক্লীয় বল)</h4>
                  <span class="c9-force-sub">গ্লুয়ন অ্যান্টি-স্ক্রিনিং (Anti-Screening Effect)</span>
                </div>
              </div>

              <div class="c9-force-metric">
                <span class="c9-metric-lbl">কাপলিং মান:</span>
                <span class="c9-metric-val qcd">α_s ≈ ০.৫ (১ GeV) → ০.১১৮০ (M_Z-এ)</span>
              </div>

              <p class="c9-force-desc">
                ফোটনের কোনো বৈদ্যুতিক চার্জ নেই, কিন্তু <strong>গ্লুয়ন নিজেই কালার-চার্জ বহন করে</strong> (নন-অ্যাবেলিয়ান গেজ গ্রুপ $SU(3)$)। 
                ভার্চুয়াল গ্লুয়নগুলো চার্জকে আড়াল না করে উল্টো চারিদিকে ছড়িয়ে দেয় (অ্যান্টি-স্ক্রিনিং)। 
                বিটা-ফাংশনে গ্লুয়ন স্ব-মিথস্ক্রিয়ার ধনাত্মক অংশ (+১১) কোয়ার্ক স্ক্রিনিংয়ের চেয়ে বহুগুণ শক্তিশালী ($\beta_0 = 11 - \frac{2}{3}n_f > 0$); 
                তাই কাছে গেলে কালার চার্জ <strong>নাটকীয়ভাবে হ্রাস পায়</strong>!
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- NOBEL PRIZE 2004 STORY CARD -->
      <section class="c9-nobel-section" aria-label="Nobel Prize 2004">
        <div class="c9-nobel-card">
          <div class="c9-nobel-badge-row">
            ${ICON_MEDAL_SVG}
            <span class="c9-nobel-year">নোবেল পুরস্কার ২০০৪ (পদার্থবিজ্ঞান)</span>
          </div>
          <h3 class="c9-nobel-title">ডেভিড গ্রস, ডেভিড পলিৎজার এবং ফ্র্যাঙ্ক উইলচেক</h3>
          <p class="c9-nobel-citation">
            <em>"সবল মিথস্ক্রিয়া তত্ত্বে অ্যাসিম্পটোটিক ফ্রিডম আবিষ্কারের জন্য (১৯৭৩)"</em>
          </p>
          <p class="c9-nobel-story">
            ১৯৬০-এর দশকের শেষভাগে স্ল্যাকের (SLAC) পরীক্ষায় দেখা গিয়েছিল প্রোটনের গভীরে কোয়ার্কগুলো কার্যত মুক্ত কণার মতো ছিটকে যাচ্ছে। 
            তৎকালীন কোনো ফিল্ড থিওরি এই অদ্ভুত আচরণের ব্যাখ্যা দিতে পারছিল না। ১৯৭৩ সালে মাত্র ২১ বছর বয়সী শিক্ষার্থী ফ্র্যাঙ্ক উইলচেক 
            ও তাঁর শিক্ষক ডেভিড গ্রস প্রিন্সটনে, এবং স্বাধীনভাবে হার্ভার্ডে ডেভিড পলিৎজার ইয়াং-মিলস ফিল্ডের রিনর্মালাইজেশন গ্রুপ গণনা করেন 
            এবং প্রমাণ করেন যে কেবলমাত্র নন-অ্যাবেলিয়ান গেজ তত্ত্বেই নেগেটিভ বিটা-ফাংশন ($\beta < 0$) সম্ভব! এই যুগান্তকারী আবিষ্কার 
            কোয়ান্টাম ক্রোমোডাইনামিক্সকে প্রতিষ্ঠিত করে।
          </p>
        </div>
      </section>

      <!-- NAVIGATION CONTINUITY HUD -->
      <section class="c9-nav-footer" aria-label="Chapter Navigation">
        <div class="c9-nav-footer-inner">
          <a class="c9-nav-btn prev" href="#/quarks/chapter-7" id="c9-btn-prev">
            ${ICON_ARROW_LEFT_SVG}
            <div class="c9-nav-btn-text">
              <span class="c9-nav-btn-sub">পূর্ববর্তী অধ্যায়</span>
              <span class="c9-nav-btn-title">অধ্যায় ৭: ভর কোথা থেকে আসে</span>
            </div>
          </a>

          <div class="c9-nav-summary-box">
            <span class="c9-nav-tag">সবল মিথস্ক্রিয়ার দ্বৈত রূপ</span>
            <p class="c9-nav-summary-desc">
              ক্ষুদ্র দূরত্বে অ্যাসিম্পটোটিক স্বাধীনতা আর দীর্ঘ দূরত্বে কনফাইনমেন্ট — কীভাবে পরীক্ষার মাধ্যমে প্রমাণিত হলো কোয়ার্ক ও গ্লুয়নের এই অদ্ভুত জগত?
            </p>
          </div>

          <a class="c9-nav-btn next" href="#/quarks/chapter-10" id="c9-btn-next">
            <div class="c9-nav-btn-text" style="text-align: right;">
              <span class="c9-nav-btn-sub">পরবর্তী অধ্যায়</span>
              <span class="c9-nav-btn-title">অধ্যায় ১০: কীভাবে জানলাম? (প্রমাণ-ল্যাব)</span>
            </div>
            ${ICON_ARROW_RIGHT_SVG}
          </a>
        </div>
      </section>
    `;

    this.container.appendChild(this.viewEl);

    // Bind tier badges
    const headerTier = this.viewEl.querySelector('#c9-tier-header');
    if (headerTier) {
      headerTier.appendChild(createTierBadge('T1', { lang: this.lang }));
      headerTier.appendChild(createTierBadge('T2', { lang: this.lang }));
    }

    // Bind Info Drawer
    this.viewEl.querySelector('#c9-btn-info').addEventListener('click', () => this.openInfoDrawer());

    // Bind Energy Probe Slider
    const slider = this.viewEl.querySelector('#c9-probe-slider');
    slider.addEventListener('input', (e) => {
      this.selectedProbeQ = parseFloat(e.target.value);
      this.updateProbe();
    });

    this.renderSvgChart();
    this.updateProbe();
  }

  renderSvgChart() {
    const wrap = this.viewEl.querySelector('#c9-svg-wrap');
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

    // Scale mapping functions (log scale in Q from 0.4 to 1000 GeV, linear in alpha_s from 0 to 0.55)
    const minQ = 0.4;
    const maxQ = 1000.0;
    const minAlpha = 0.0;
    const maxAlpha = 0.55;

    const qToX = (q) => {
      const clampedQ = Math.max(minQ, Math.min(maxQ, q));
      const logRatio = (Math.log10(clampedQ) - Math.log10(minQ)) / (Math.log10(maxQ) - Math.log10(minQ));
      return padLeft + logRatio * plotW;
    };

    const alphaToY = (a) => {
      const clampedA = Math.max(minAlpha, Math.min(maxAlpha, a));
      const ratio = (clampedA - minAlpha) / (maxAlpha - minAlpha);
      return padTop + plotH - ratio * plotH;
    };

    // 1. Shaded non-perturbative region (Q <= 1.0 GeV)
    const npBoundaryX = qToX(1.0);
    const npRectWidth = npBoundaryX - padLeft;

    // 2. Generate curve points for RGE theoretical curve (Q from 1.0 to 1000 GeV)
    let curvePathD = '';
    const numSteps = 120;
    for (let i = 0; i <= numSteps; i++) {
      const logQ = Math.log10(1.0) + (i / numSteps) * (Math.log10(maxQ) - Math.log10(1.0));
      const q = Math.pow(10, logQ);
      const res = getRunningAlphaS(q);
      const x = qToX(q);
      const y = alphaToY(res.alphaS);
      if (i === 0) {
        curvePathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        curvePathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }

    // Extrapolated non-perturbative dashed line (Q from 0.4 to 1.0)
    let npCurvePathD = '';
    for (let i = 0; i <= 20; i++) {
      const logQ = Math.log10(0.4) + (i / 20) * (Math.log10(1.0) - Math.log10(0.4));
      const q = Math.pow(10, logQ);
      const res = getRunningAlphaS(q);
      const x = qToX(q);
      const y = alphaToY(Math.min(0.52, res.alphaS));
      if (i === 0) {
        npCurvePathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        npCurvePathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }

    // 3. Grid lines & Axis labels
    const qTicks = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const alphaTicks = [0.1, 0.2, 0.3, 0.4, 0.5];

    let gridLinesSvg = '';
    let xLabelsSvg = '';
    qTicks.forEach(q => {
      const x = qToX(q);
      gridLinesSvg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + plotH}" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1" />`;
      xLabelsSvg += `<text x="${x}" y="${padTop + plotH + 20}" font-size="11" font-family="'JetBrains Mono', monospace" fill="#94a3b8" text-anchor="middle">${q}</text>`;
    });

    let yLabelsSvg = '';
    alphaTicks.forEach(a => {
      const y = alphaToY(a);
      gridLinesSvg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + plotW}" y2="${y}" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1" />`;
      yLabelsSvg += `<text x="${padLeft - 10}" y="${y + 4}" font-size="11" font-family="'JetBrains Mono', monospace" fill="#94a3b8" text-anchor="end">${a.toFixed(1)}</text>`;
    });

    // Threshold markers (m_c = 1.27, m_b = 4.18, m_t = 172.6)
    const thresholdMarkers = [
      { name: 'm_c (n_f=4)', q: 1.27 },
      { name: 'm_b (n_f=5)', q: 4.18 },
      { name: 'm_t (n_f=6)', q: 172.6 }
    ].map(th => {
      const x = qToX(th.q);
      return `
        <line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + plotH}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />
        <text x="${x}" y="${padTop - 8}" font-size="9" font-family="'JetBrains Mono', monospace" fill="#38bdf8" text-anchor="middle" opacity="0.8">${th.name}</text>
      `;
    }).join('');

    // 4. PDG Experimental Data Points with error bars
    const pdgPointsSvg = this.afData.pdgDataPoints.map(p => {
      const x = qToX(p.Q);
      const y = alphaToY(p.alphaS);
      const yTop = alphaToY(p.alphaS + p.uncertainty);
      const yBot = alphaToY(p.alphaS - p.uncertainty);

      return `
        <g class="c9-pdg-point-group" id="pdg-point-${p.id}" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.nameBn}: Q=${p.Q} GeV, alpha_s=${p.alphaS}">
          <!-- Error bar line -->
          <line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="#f59e0b" stroke-width="2" />
          <line x1="${x - 4}" y1="${yTop}" x2="${x + 4}" y2="${yTop}" stroke="#f59e0b" stroke-width="2" />
          <line x1="${x - 4}" y1="${yBot}" x2="${x + 4}" y2="${yBot}" stroke="#f59e0b" stroke-width="2" />
          <!-- Point circle -->
          <circle cx="${x}" cy="${y}" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
          <title>${p.nameBn} (${p.facility}): Q = ${p.Q} GeV, α_s = ${p.alphaS} ± ${p.uncertainty}</title>
        </g>
      `;
    }).join('');

    // Probe marker vertical line
    const probeX = qToX(this.selectedProbeQ);
    const probeRes = getRunningAlphaS(this.selectedProbeQ);
    const probeY = alphaToY(probeRes.alphaS);

    wrap.innerHTML = `
      <svg class="c9-svg-canvas" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Running Coupling alpha_s(Q) chart">
        <defs>
          <!-- Pattern for non-perturbative region -->
          <pattern id="c9-hatch-pattern" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(244, 63, 94, 0.25)" stroke-width="2" />
          </pattern>
          <linearGradient id="c9-curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#818cf8" />
          </linearGradient>
        </defs>

        <!-- Plot Background -->
        <rect x="${padLeft}" y="${padTop}" width="${plotW}" height="${plotH}" fill="rgba(2, 6, 23, 0.7)" rx="6" />

        <!-- Grid Lines -->
        ${gridLinesSvg}

        <!-- Non-Perturbative Shadow Region (Q <= 1 GeV) -->
        <rect x="${padLeft}" y="${padTop}" width="${npRectWidth}" height="${plotH}" fill="url(#c9-hatch-pattern)" />
        <line x1="${npBoundaryX}" y1="${padTop}" x2="${npBoundaryX}" y2="${padTop + plotH}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,4" />
        <rect x="${padLeft + 4}" y="${padTop + 14}" width="${npRectWidth - 8}" height="42" fill="rgba(15, 23, 42, 0.85)" rx="4" />
        <text x="${padLeft + npRectWidth / 2}" y="${padTop + 30}" font-size="10.5" font-weight="700" fill="#f43f5e" text-anchor="middle">non-perturbative</text>
        <text x="${padLeft + npRectWidth / 2}" y="${padTop + 46}" font-size="9" fill="#fda4af" text-anchor="middle">সূত্র খাটে না (কনফাইনমেন্ট)</text>

        <!-- Threshold Markers -->
        ${thresholdMarkers}

        <!-- Theoretical Curve (T2) -->
        <path d="${curvePathD}" fill="none" stroke="url(#c9-curve-grad)" stroke-width="3.5" stroke-linecap="round" />
        <!-- Extrapolated non-perturbative curve (dashed) -->
        <path d="${npCurvePathD}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,3" opacity="0.6" />

        <!-- PDG Experimental Data Points (T1) -->
        ${pdgPointsSvg}

        <!-- Interactive Energy Probe Marker -->
        <g class="c9-probe-marker-group" id="c9-probe-marker" transform="translate(0, 0)">
          <line id="c9-probe-line" x1="${probeX}" y1="${padTop}" x2="${probeX}" y2="${padTop + plotH}" stroke="#34d399" stroke-width="2" stroke-dasharray="4,2" />
          <circle id="c9-probe-dot" cx="${probeX}" cy="${probeY}" r="6" fill="#34d399" stroke="#ffffff" stroke-width="2" />
        </g>

        <!-- Axes -->
        <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.5" />
        <line x1="${padLeft}" y1="${padTop + plotH}" x2="${padLeft + plotW}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.5" />

        <!-- Axis Labels -->
        ${xLabelsSvg}
        ${yLabelsSvg}

        <!-- Axis Title Labels -->
        <text x="${padLeft + plotW / 2}" y="${padTop + plotH + 42}" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">শক্তি স্কেল Q (GeV) — [লগ স্কেল]</text>
        <text x="${padLeft - 40}" y="${padTop + plotH / 2}" font-size="13" font-weight="700" fill="#cbd5e1" text-anchor="middle" transform="rotate(-90 ${padLeft - 40} ${padTop + plotH / 2})">সবল কাপলিং ধ্রুবক α_s(Q)</text>
      </svg>
    `;

    // Bind click events on PDG points
    const pointGroups = wrap.querySelectorAll('.c9-pdg-point-group');
    pointGroups.forEach(g => {
      g.addEventListener('click', (e) => {
        const ptId = e.currentTarget.getAttribute('data-id');
        this.selectDataPoint(ptId);
      });
    });
  }

  selectDataPoint(ptId) {
    this.activePointId = ptId;
    const pt = this.afData.pdgDataPoints.find(p => p.id === ptId);
    if (!pt) return;

    // Set slider to this point's Q
    this.selectedProbeQ = pt.Q;
    const slider = this.viewEl.querySelector('#c9-probe-slider');
    if (slider) slider.value = pt.Q;

    this.updateProbe(pt);
  }

  updateProbe(activePoint = null) {
    const qReadout = this.viewEl.querySelector('#c9-probe-q-readout');
    if (qReadout) {
      qReadout.textContent = `Q = ${this.selectedProbeQ} GeV`;
    }

    const res = getRunningAlphaS(this.selectedProbeQ);
    const approxDistFm = (0.197327 / this.selectedProbeQ).toFixed(3); // hbar*c ≈ 0.1973 GeV*fm

    // Update Probe Marker in SVG
    const wrap = this.viewEl.querySelector('#c9-svg-wrap');
    if (wrap) {
      const padLeft = 60;
      const padRight = 30;
      const padTop = 30;
      const padBottom = 50;
      const plotW = 840 - padLeft - padRight;
      const plotH = 380 - padTop - padBottom;

      const minQ = 0.4;
      const maxQ = 1000.0;
      const minAlpha = 0.0;
      const maxAlpha = 0.55;

      const clampedQ = Math.max(minQ, Math.min(maxQ, this.selectedProbeQ));
      const logRatio = (Math.log10(clampedQ) - Math.log10(minQ)) / (Math.log10(maxQ) - Math.log10(minQ));
      const probeX = padLeft + logRatio * plotW;

      const clampedA = Math.max(minAlpha, Math.min(maxAlpha, res.alphaS));
      const ratio = (clampedA - minAlpha) / (maxAlpha - minAlpha);
      const probeY = padTop + plotH - ratio * plotH;

      const probeLine = wrap.querySelector('#c9-probe-line');
      const probeDot = wrap.querySelector('#c9-probe-dot');
      if (probeLine && probeDot) {
        probeLine.setAttribute('x1', probeX);
        probeLine.setAttribute('x2', probeX);
        probeDot.setAttribute('cx', probeX);
        probeDot.setAttribute('cy', probeY);
      }
    }

    // Render Probe Readout Card
    const readoutCard = this.viewEl.querySelector('#c9-probe-readout-card');
    if (!readoutCard) return;

    let regimeBadge = '';
    let regimeDesc = '';

    if (res.isNonPerturbative) {
      regimeBadge = '<span class="c9-regime-badge nonpert">Non-Perturbative (কনফাইনমেন্ট রাজত্ব)</span>';
      regimeDesc = 'শক্তি অত্যন্ত কম ($Q \\lesssim 1\\text{ GeV}$); কোয়ার্করা অত্যন্ত দূরে অবস্থান করে। এখানে কাপলিং অত্যন্ত শক্তিশালী ($> 0.5$) হওয়ায় সাধারণ পারটারবেশন থিওরি ভেঙে পড়ে। ল্যাটিস QCD অপরিহার্য।';
    } else if (this.selectedProbeQ < 10) {
      regimeBadge = '<span class="c9-regime-badge bound">Transition Regime (সীমাবদ্ধ অঞ্চল)</span>';
      regimeDesc = 'মধ্যম শক্তি স্কেল; কাপলিং দ্রুত হ্রাস পাচ্ছে। চার্ম ($m_c$) এবং বটম ($m_b$) কোয়ার্ক থ্রেশহোল্ড সক্রিয়।';
    } else {
      regimeBadge = '<span class="c9-regime-badge free">Asymptotically Free (কোয়ার্ক প্রায় মুক্ত)</span>';
      regimeDesc = 'উচ্চ শক্তি স্কেল; কালার কাপলিং তীব্রভাবে দুর্বল ($\\alpha_s \\approx 0.118$)। কোয়ার্করা পয়েন্ট-লাইক মুক্ত কণার মতো স্বাধীনভাবে আচরণ করে।';
    }

    readoutCard.innerHTML = `
      <div class="c9-readout-header">
        <div class="c9-readout-title-row">
          <span class="c9-readout-title">রিয়েল-টাইম কাপলিং স্থিতি (Probe Readout):</span>
          ${regimeBadge}
        </div>
      </div>

      <div class="c9-readout-stats-grid">
        <div class="c9-stat-box">
          <span class="c9-stat-lbl">সবল কাপলিং ধ্রুবক α_s:</span>
          <span class="c9-stat-val qcd">${res.alphaS}</span>
        </div>
        <div class="c9-stat-box">
          <span class="c9-stat-lbl">সমতুল্য স্থানিক বিস্তার (r ~ ħc/Q):</span>
          <span class="c9-stat-val">≈ ${approxDistFm} fm</span>
        </div>
        <div class="c9-stat-box">
          <span class="c9-stat-lbl">সক্রিয় ফ্লেভার সংখ্যা (n_f):</span>
          <span class="c9-stat-val">${res.nf} কোয়ার্ক</span>
        </div>
        <div class="c9-stat-box">
          <span class="c9-stat-lbl">বিটা-ফাংশন দিক:</span>
          <span class="c9-stat-val green">β₀ = ${(11 - (2/3)*res.nf).toFixed(2)} (Anti-screening)</span>
        </div>
      </div>

      <p class="c9-readout-desc">${regimeDesc}</p>

      ${activePoint ? `
        <div class="c9-point-highlight-card">
          <div class="c9-pt-hl-title">
            <span class="c9-pt-hl-icon">${ICON_ATOM_SVG}</span>
            <span>নির্বাচিত PDG পরিমাপ: <strong>${activePoint.nameBn}</strong> (${activePoint.facility})</span>
            <span class="c9-pt-hl-tier">T1</span>
          </div>
          <div class="c9-pt-hl-data">
            <span>স্কেল: <strong>${activePoint.Q} GeV</strong></span> | 
            <span>পরিমাপিত α_s: <strong>${activePoint.alphaS} ± ${activePoint.uncertainty}</strong></span>
          </div>
        </div>
      ` : ''}
    `;
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;

    this.infoDrawer.open({
      titleBn: 'অধ্যায় ৯: Asymptotic Freedom বৈজ্ঞানিক অডিট',
      titleEn: 'Chapter 9: Asymptotic Freedom & RGE Audit',
      tier: 'T1',
      sections: [
        {
          headingBn: 'রিনর্মালাইজেশন গ্রুপ সমীকরণ (RGE)',
          headingEn: 'Renormalization Group Equation (RGE)',
          contentBn: `
            কোয়ান্টাম ক্রোমোডাইনামিক্সে কাপলিং ধ্রুবক স্থির নয়; এটি এনার্জি স্কেল Q-এর সাথে বিটা-ফাংশন অনুযায়ী পরিবর্তিত হয়:
            Q d(alpha_s)/dQ = beta(alpha_s) = - 2 beta_0 (alpha_s^2 / 4pi) - 2 beta_1 (alpha_s^3 / (4pi)^2) - ...
            যেখানে 1-loop গুণাঙ্ক:
            beta_0 = 11 - (2/3) n_f
            যেহেতু প্রকৃতিতে সক্রিয় ফ্লেভার n_f <= 6, তাই beta_0 সর্বদা ধনাত্মক (beta < 0)।
            ফলে শক্তি বাড়লে (Q বৃদ্ধি পেলে) কাপলিং সূচকীয়ভাবে হ্রাস পায় — এটিই অ্যাসিম্পটোটিক ফ্রিডম।
          `
        },
        {
          headingBn: 'নন-অ্যাবেলিয়ান গেজ সিমেট্রি ও গ্লুয়ন সেলফ-ইন্টারঅ্যাকশন',
          headingEn: 'Non-Abelian Gauge Symmetry & Gluon Self-Interaction',
          contentBn: `
            QED-তে গেজ গ্রুপ U(1) অ্যাবেলিয়ান; ফোটনের কোনো তড়িৎ আধান নেই, তাই ফোটন একে অপরের সাথে সরাসরি মিথস্ক্রিয়া করে না। 
            কিন্তু QCD-তে গেজ গ্রুপ SU(3) কালার নন-অ্যাবেলিয়ান; ৮টি গ্লুয়ন নিজেরাও কালার চার্জ বহন করে এবং ত্রি-গ্লুয়ন ও চতুর্-গ্লুয়ন ভার্টেক্সে মিথস্ক্রিয়া করে। 
            এই গ্লুয়ন স্ব-মিথস্ক্রিয়াই বিটা ফাংশনে ধনাত্মক +11 পদটি প্রদান করে, যা কোয়ার্কের স্ক্রিনিং প্রভাবকে অতিক্রম করে অ্যান্টি-স্ক্রিনিং সৃষ্টি করে।
          `
        },
        {
          headingBn: 'PDG 2024 ওয়ার্ল্ড অ্যাভারেজ রেফারেন্স',
          headingEn: 'PDG 2024 World Average Reference',
          contentBn: `
            পার্টিকেল ডাটা গ্রুপ (PDG 2024 / 2026) বিভিন্ন উচ্চ-শক্তি পরীক্ষার সমন্বয়ে Z বোসন ভর স্কেলে স্ট্যান্ডার্ড রেফারেন্স নির্ধারণ করেছে:
            alpha_s(M_Z = 91.1876 GeV) = 0.1180 +- 0.0009 (MS-bar স্কিম)।
            Q <= 1 GeV অঞ্চলে শক্তিশালী কাপলিংয়ের কারণে পারটারবেটিভ QCD অকার্যকর হয়ে পড়ে এবং নন-পারটারবেটিভ ল্যাটিস সিমুলেশন প্রযোজ্য হয়।
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
