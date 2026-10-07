/**
 * COSMIC TO PLANCK RENDER ENGINE
 * High-performance dual-layer Canvas rendering system:
 * - Dynamic procedural background (CMB, nebulas, cellular fluid, quantum foam)
 * - Continuous nested scale-proportional physical objects
 * - Smooth camera interpolation & optical zoom transitions
 */

import { COSMIC_OBJECTS, SCALE_DOMAINS } from './science-data.js';

export class CosmicRenderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Viewport & Scale State
    this.currentOrder = 27.0; // Observable Universe
    this.targetOrder = 27.0;
    this.zoomVelocity = 0;

    // Gravitational Collapse & Black Hole Simulation State
    this.blackHoleState = 'inactive'; // 'inactive' | 'charging' | 'shattering' | 'active' | 'evaporating'
    this.blackHoleCharge = 0; // 0.0 to 1.0
    this.blackHoleTimer = 0;
    this.blackHoleCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.shatterShards = [];
    this.accretionSparks = [];
    this.jetSparks = [];
    this.blackHoleLensingAngle = 0;
    this.blackHoleAccretionMode = 'disk'; // 'disk' | 'vacuum'
    this.strainShakeIntensity = 0;
    this.onBlackHoleTriggered = null;
    this.onBlackHoleEvaporated = null;

    // Animation & Physics Time
    this.time = 0;
    this.lastTimestamp = performance.now();

    // Procedural Particle Seeds
    this.stars = [];
    this.cosmicWebNodes = [];
    this.quantumFoamNodes = [];
    this.dnaBasePairs = [];
    this.dustParticles = [];

    this.initParticles();
    this.resize();
  }

  initParticles() {
    // 1. Cosmic Web Nodes
    this.cosmicWebNodes = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * 450;
      this.cosmicWebNodes.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: Math.random() * 2.5 + 1,
        brightness: Math.random() * 0.6 + 0.4
      });
    }

    // 2. Starfield Particles
    this.stars = [];
    for (let i = 0; i < 350; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 50,
        radius: Math.random() * 1.6 + 0.4,
        color: ['#ffffff', '#93c5fd', '#fef08a', '#fca5a5', '#c4b5fd'][Math.floor(Math.random() * 5)]
      });
    }

    // 3. DNA Base Pairs Structure
    this.dnaBasePairs = [];
    const pairTypes = [
      { name: 'A-T', color1: '#ef4444', color2: '#3b82f6' },
      { name: 'T-A', color1: '#3b82f6', color2: '#ef4444' },
      { name: 'G-C', color1: '#10b981', color2: '#f59e0b' },
      { name: 'C-G', color1: '#f59e0b', color2: '#10b981' }
    ];
    for (let i = 0; i < 40; i++) {
      this.dnaBasePairs.push({
        yOffset: (i - 20) * 16,
        phase: (i / 40) * Math.PI * 4,
        type: pairTypes[i % pairTypes.length]
      });
    }

    // 4. Quantum Foam Topological Vertices
    this.quantumFoamNodes = [];
    for (let i = 0; i < 70; i++) {
      this.quantumFoamNodes.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 600,
        r: Math.random() * 25 + 10,
        speed: Math.random() * 0.04 + 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 5. Cytoplasmic / Ambient Micro Dust
    this.dustParticles = [];
    for (let i = 0; i < 60; i++) {
      this.dustParticles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8
      });
    }
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  setTargetOrder(order) {
    this.targetOrder = Math.max(-35.0, Math.min(27.0, order));
  }

  addZoomDelta(delta) {
    // Delta smooth multiplier
    this.targetOrder = Math.max(-35.0, Math.min(27.0, this.targetOrder + delta));
  }

  update(dt) {
    this.time += dt;

    // Smooth inertia camera interpolation (only if not locked in black hole)
    // Frame-rate independent exponential smoothing: lambda = 1 - exp(-k * dt)
    if (this.blackHoleState === 'inactive' || this.blackHoleState === 'charging') {
      const diff = this.targetOrder - this.currentOrder;
      const k = 8.5; // Damping rate (independent of 60Hz/120Hz/144Hz)
      const lambda = 1 - Math.exp(-k * Math.min(dt, 0.1));
      this.zoomVelocity = diff * lambda;
      this.currentOrder += this.zoomVelocity;

      if (Math.abs(diff) < 0.0001) {
        this.currentOrder = this.targetOrder;
      }
    }

    // Update Black Hole Simulation
    this.updateBlackHole(dt);
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Screen Shake calculations: Planck Wall jitter + Gravitational Stress shake
    // Respects prefers-reduced-motion to prevent vestibular distress
    let shakeX = 0;
    let shakeY = 0;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      if (this.currentOrder <= -34.2) {
        const shakeIntensity = Math.min(3.0, (-this.currentOrder - 34.2) * 3.5);
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeY = (Math.random() - 0.5) * shakeIntensity;
      }
      if (this.strainShakeIntensity > 0) {
        shakeX += (Math.random() - 0.5) * this.strainShakeIntensity;
        shakeY += (Math.random() - 0.5) * this.strainShakeIntensity;
        this.strainShakeIntensity = Math.max(0, this.strainShakeIntensity - dt * 10);
      }
      if (this.blackHoleState === 'charging') {
        const stressShake = this.blackHoleCharge * 4.5;
        shakeX += (Math.random() - 0.5) * stressShake;
        shakeY += (Math.random() - 0.5) * stressShake;
      } else if (this.blackHoleState === 'shattering') {
        const shatterShake = (1 - this.blackHoleTimer / 1.2) * 12.0;
        shakeX += (Math.random() - 0.5) * shatterShake;
        shakeY += (Math.random() - 0.5) * shatterShake;
      } else if (this.blackHoleState === 'active') {
        // Subtle gravitational wave breathing tremor
        const waveTremor = Math.sin(this.time * 8) * 0.8;
        shakeX += (Math.random() - 0.5) * waveTremor;
        shakeY += (Math.random() - 0.5) * waveTremor;
      }
    }

    const cx = w / 2 + shakeX;
    const cy = h / 2 + shakeY;

    // 1. Clear Frame
    ctx.clearRect(0, 0, w, h);

    // 2. Render Scale-Adaptive Ambient Background
    this.renderBackground(ctx, w, h, cx, cy);

    // 3. Render Objects or Black Hole
    if (this.blackHoleState === 'active') {
      this.renderBlackHole(ctx, this.blackHoleCenter.x + shakeX, this.blackHoleCenter.y + shakeY);
    } else if (this.blackHoleState === 'shattering') {
      this.renderShatterFX(ctx, this.blackHoleCenter.x + shakeX, this.blackHoleCenter.y + shakeY);
    } else if (this.blackHoleState === 'evaporating') {
      this.renderEvaporationFX(ctx, this.blackHoleCenter.x + shakeX, this.blackHoleCenter.y + shakeY);
    } else {
      // Normal Objects in Scale Proximity
      this.renderObjects(ctx, cx, cy);
      // Metric Grid / Reticle Overlays
      this.drawReticleGrid(ctx, cx, cy);
    }

    // 4. Render Compression Reticle if charging
    if (this.blackHoleState === 'charging') {
      this.renderCompressionReticle(ctx, this.blackHoleCenter.x, this.blackHoleCenter.y);
    }
  }

  /**
   * Procedural Background based on current scale domain
   */
  renderBackground(ctx, w, h, cx, cy) {
    const order = this.currentOrder;

    // Determine domain color accents
    let bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.7);

    if (order >= 21) {
      // Cosmic Horizon (Cosmic Microwave Background / Dark Matter)
      bgGrad.addColorStop(0, '#0a0d24');
      bgGrad.addColorStop(0.5, '#060714');
      bgGrad.addColorStop(1, '#020308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Render Cosmic Microwave Background Grain & Filaments
      this.renderCosmicBackground(ctx, cx, cy);
    } else if (order >= 11) {
      // Galactic & Stellar Space
      bgGrad.addColorStop(0, '#091534');
      bgGrad.addColorStop(0.5, '#04091a');
      bgGrad.addColorStop(1, '#010207');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderStarfield(ctx, cx, cy);
    } else if (order >= 5) {
      // Solar System & Earth Orbit
      bgGrad.addColorStop(0, '#0c1a2e');
      bgGrad.addColorStop(0.6, '#050c18');
      bgGrad.addColorStop(1, '#01040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderStarfield(ctx, cx, cy);
    } else if (order >= -3) {
      // Terrestrial / Human Scale
      const tNorm = Math.max(0, Math.min(1, (order + 3) / 7)); // -3 to 4
      const r = Math.floor(6 + tNorm * 10);
      const g = Math.floor(15 + tNorm * 22);
      const b = Math.floor(25 + tNorm * 35);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, w, h);

      // Sci-fi laboratory holographic ground grid
      this.renderLabGrid(ctx, cx, cy);
    } else if (order >= -7) {
      // Cellular / Microscopic Fluid
      bgGrad.addColorStop(0, '#1c0f24');
      bgGrad.addColorStop(0.5, '#0e0817');
      bgGrad.addColorStop(1, '#05020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderCellularFluid(ctx, cx, cy);
    } else if (order >= -10) {
      // Nanoscale / Molecular
      bgGrad.addColorStop(0, '#061a24');
      bgGrad.addColorStop(0.5, '#030d14');
      bgGrad.addColorStop(1, '#01050a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderElectronCloudBackground(ctx, cx, cy);
    } else if (order >= -18) {
      // Nuclear / Strong Force
      bgGrad.addColorStop(0, '#260a0a');
      bgGrad.addColorStop(0.5, '#120404');
      bgGrad.addColorStop(1, '#050101');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderStrongForceField(ctx, cx, cy);
    } else {
      // Quantum Foam & Planck Scale
      bgGrad.addColorStop(0, '#190a2a');
      bgGrad.addColorStop(0.5, '#0a0314');
      bgGrad.addColorStop(1, '#020005');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      this.renderQuantumFoamBackground(ctx, cx, cy);
    }
  }

  renderCosmicBackground(ctx, cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const t = this.time * 0.05;

    // Faint cosmic web filaments in backdrop
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < this.cosmicWebNodes.length; i++) {
      const n1 = this.cosmicWebNodes[i];
      for (let j = i + 1; j < this.cosmicWebNodes.length; j++) {
        const n2 = this.cosmicWebNodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.moveTo(cx + n1.x, cy + n1.y);
          ctx.lineTo(cx + n2.x, cy + n2.y);
        }
      }
    }
    ctx.stroke();

    // Glowing cluster nodes
    for (const node of this.cosmicWebNodes) {
      const pulse = Math.sin(t + node.x * 0.01) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(167, 139, 250, ${node.brightness * pulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(cx + node.x, cy + node.y, node.size * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderStarfield(ctx, cx, cy) {
    ctx.save();
    for (const star of this.stars) {
      const parallax = 1000 / (star.z + 50);
      const sx = cx + star.x * parallax * 0.3;
      const sy = cy + star.y * parallax * 0.3;
      const twinkle = Math.sin(this.time * 2 + star.x) * 0.3 + 0.7;

      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.min(1, (1000 - star.z) / 1000) * twinkle * 0.75;
      ctx.beginPath();
      ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderLabGrid(ctx, cx, cy) {
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;

    const spacing = 60;
    const offsetX = (this.time * 5) % spacing;

    for (let x = -this.width; x < this.width * 2; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderCellularFluid(ctx, cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.dustParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -400) p.x = 400;
      if (p.x > 400) p.x = -400;
      if (p.y < -400) p.y = 400;
      if (p.y > 400) p.y = -400;

      const alpha = Math.sin(this.time + p.x) * 0.2 + 0.3;
      ctx.fillStyle = `rgba(236, 72, 153, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, p.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderElectronCloudBackground(ctx, cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 320);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderStrongForceField(ctx, cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = Math.sin(this.time * 6) * 0.15 + 0.85;
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260 * pulse);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    grad.addColorStop(0.5, 'rgba(220, 38, 38, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 260 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderQuantumFoamBackground(ctx, cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const t = this.time * 3;

    // Bubbling spacetime topology
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.22)';
    ctx.lineWidth = 1.4;

    for (const node of this.quantumFoamNodes) {
      const rad = node.r + Math.sin(t * node.speed + node.phase) * 12;
      const nx = cx + node.x + Math.sin(t * 0.5 + node.phase) * 10;
      const ny = cy + node.y + Math.cos(t * 0.5 + node.phase) * 10;

      ctx.beginPath();
      ctx.arc(nx, ny, Math.max(1, rad), 0, Math.PI * 2);
      ctx.stroke();

      // Connecting micro-wormhole links
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Main nested scale rendering loop
   */
  renderObjects(ctx, cx, cy) {
    const currentOrder = this.currentOrder;
    let closestObj = null;
    let closestDiff = Infinity;
    let closestRadius = 0;
    let closestAlpha = 0;

    // Loop through each object in scientific database
    for (const obj of COSMIC_OBJECTS) {
      // Delta order determines optical size and visibility
      const orderDiff = obj.order - currentOrder;

      // Object is visible only when within comfortable zoom range (~ -3.5 to +3.5 orders)
      if (orderDiff >= -3.5 && orderDiff <= 3.5) {
        // Apparent on-screen diameter in pixels
        const baseRadius = 140; // Reference pixel radius when orderDiff = 0
        const scaleFactor = Math.pow(10, orderDiff);
        const onScreenRadius = baseRadius * scaleFactor;

        // Opacity envelope: Fades in as it approaches from distance, reaches full brightness,
        // and dissolves gracefully as the camera penetrates into its interior
        let alpha = 1.0;
        if (orderDiff > 1.8) {
          alpha = Math.max(0, 1 - (orderDiff - 1.8) / 1.7);
        } else if (orderDiff < -1.8) {
          alpha = Math.max(0, 1 - (-orderDiff - 1.8) / 1.7);
        }

        if (alpha > 0.01 && onScreenRadius > 1) {
          ctx.save();
          ctx.globalAlpha = alpha;

          // Dispatch specific visual procedural renderer
          this.drawObjectVisual(ctx, obj, cx, cy, onScreenRadius, orderDiff);

          ctx.restore();

          // Track the single closest object for clean callout tag
          const absDiff = Math.abs(orderDiff);
          if (absDiff < 1.0 && absDiff < closestDiff) {
            closestDiff = absDiff;
            closestObj = obj;
            closestRadius = onScreenRadius;
            closestAlpha = alpha;
          }
        }
      }
    }

    // Draw single clean callout tag for the primary in-focus object
    if (closestObj && closestAlpha > 0.1) {
      this.drawObjectTag(ctx, closestObj, cx, cy, closestRadius, closestAlpha);
    }
  }

  drawObjectVisual(ctx, obj, cx, cy, r, orderDiff) {
    const t = this.time;

    switch (obj.renderType) {
      case 'observable_universe':
        this.drawObservableUniverse(ctx, cx, cy, r, t);
        break;
      case 'super_wall':
      case 'cosmic_web':
        this.drawCosmicWebObject(ctx, cx, cy, r, t, obj.accentColor);
        break;
      case 'laniakea':
      case 'supercluster':
        this.drawLaniakea(ctx, cx, cy, r, t);
        break;
      case 'virgo_cluster':
      case 'local_group':
        this.drawGalaxyCluster(ctx, cx, cy, r, t, obj.accentColor);
        break;
      case 'spiral_galaxy':
      case 'milky_way':
        this.drawMilkyWay(ctx, cx, cy, r, t);
        break;
      case 'galaxy_arm':
      case 'nebula':
        this.drawNebula(ctx, cx, cy, r, t, obj.accentColor);
        break;
      case 'star_system':
      case 'stellar_neighborhood':
      case 'oort_cloud':
        this.drawOortCloud(ctx, cx, cy, r, t);
        break;
      case 'kuiper_belt':
      case 'heliosphere':
      case 'solar_system_outer':
      case 'inner_solar_system':
      case 'orbit_ring':
        this.drawSolarSystem(ctx, cx, cy, r, t, obj.renderType);
        break;
      case 'sun_star':
        this.drawSun(ctx, cx, cy, r, t);
        break;
      case 'jupiter_planet':
        this.drawJupiter(ctx, cx, cy, r, t);
        break;
      case 'earth_globe':
        this.drawEarth(ctx, cx, cy, r, t);
        break;
      case 'moon_sphere':
        this.drawMoon(ctx, cx, cy, r, t);
        break;
      case 'karman_line':
      case 'mountain':
      case 'skyscrapers':
        this.drawTerrestrial(ctx, cx, cy, r, obj);
        break;
      case 'blue_whale':
        this.drawBlueWhale(ctx, cx, cy, r, t);
        break;
      case 'human_silhouette':
      case 'human_figure':
        this.drawHuman(ctx, cx, cy, r, t);
        break;
      case 'human_heart':
        this.drawHeart(ctx, cx, cy, r, t);
        break;
      case 'honeybee':
      case 'insect':
      case 'sand_grain':
      case 'dust_mite':
      case 'hair_fiber':
        this.drawMicroObject(ctx, cx, cy, r, obj);
        break;
      case 'red_blood_cell':
      case 'rbc_cell':
        this.drawRedBloodCell(ctx, cx, cy, r, t);
        break;
      case 'bacterium':
      case 'bacteria':
        this.drawBacterium(ctx, cx, cy, r, t);
        break;
      case 'virus_capsid':
        this.drawVirus(ctx, cx, cy, r, t);
        break;
      case 'membrane_gate':
      case 'protein_folding':
        this.drawMembrane(ctx, cx, cy, r, t);
        break;
      case 'dna_helix':
        this.drawDNAHelix(ctx, cx, cy, r, t);
        break;
      case 'buckyball':
        this.drawBuckyball(ctx, cx, cy, r, t);
        break;
      case 'hydrogen_atom':
      case 'inner_orbitals':
      case 'hydrogen_cloud':
        this.drawHydrogenAtom(ctx, cx, cy, r, t);
        break;
      case 'compton_wave':
        this.drawComptonWave(ctx, cx, cy, r, t);
        break;
      case 'uranium_nucleus':
      case 'atomic_nucleus':
        this.drawNucleus(ctx, cx, cy, r, t);
        break;
      case 'proton_quarks':
      case 'gluon_flux':
        this.drawProtonQuarks(ctx, cx, cy, r, t);
        break;
      case 'point_particles':
      case 'fundamental_point':
      case 'lhc_frontier':
      case 'lhc_limit':
      case 'higgs_field':
      case 'physics_desert':
      case 'gut_symmetry':
      case 'gut_unification':
        this.drawQuarksPoint(ctx, cx, cy, r, t, obj.accentColor);
        break;
      case 'quantum_foam':
      case 'inflation_field':
        this.drawQuantumFoamDetail(ctx, cx, cy, r, t);
        break;
      case 'planck_string':
      case 'planck_limit':
        this.drawPlanckString(ctx, cx, cy, r, t);
        break;
      default:
        this.drawGenericSphere(ctx, cx, cy, r, obj.accentColor);
        break;
    }
  }

  // ================= SPECIFIC PROCEDURAL RENDERERS =================

  drawObservableUniverse(ctx, cx, cy, r, t) {
    ctx.save();
    // Cosmic Microwave Background Outer Sphere
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
    grad.addColorStop(0.85, 'rgba(99, 102, 241, 0.25)');
    grad.addColorStop(0.98, 'rgba(239, 68, 68, 0.6)'); // CMB redshift horizon
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Luminous cosmic sphere border
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Thousands of tiny galaxy clusters swarming inside
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 120; i++) {
      const angle = (i / 120) * Math.PI * 2 + Math.sin(i * 3) * 0.2;
      const dist = (Math.sin(i * 7) * 0.45 + 0.5) * (r * 0.85);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.8, r * 0.008), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCosmicWebObject(ctx, cx, cy, r, t, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.015);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.02;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const cpX = cx + Math.cos(a + 0.4) * (r * 0.6);
      const cpY = cy + Math.sin(a + 0.4) * (r * 0.6);
      const epX = cx + Math.cos(a) * r;
      const epY = cy + Math.sin(a) * r;
      ctx.quadraticCurveTo(cpX, cpY, epX, epY);
      ctx.stroke();
    }

    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.4);
    coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    coreGlow.addColorStop(0.4, color);
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawLaniakea(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = Math.max(1, r * 0.012);

    // Streamlines flowing to the Great Attractor center
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const len = r * (0.6 + Math.sin(i * 2 + t * 0.5) * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.quadraticCurveTo(cx + Math.cos(a + 0.5) * (len * 0.5), cy + Math.sin(a + 0.5) * (len * 0.5), cx, cy);
      ctx.stroke();
    }

    // Great Attractor focal glow
    const gaGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.25);
    gaGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gaGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.8)');
    gaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gaGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGalaxyCluster(ctx, cx, cy, r, t, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + t * 0.03;
      const dist = (Math.sin(i * 5) * 0.35 + 0.55) * r;
      const gx = cx + Math.cos(angle) * dist;
      const gy = cy + Math.sin(angle) * dist;
      const size = Math.max(2, r * 0.06 * (Math.sin(i) * 0.4 + 0.6));

      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, size * 2.5);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      g.addColorStop(0.4, color);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMilkyWay(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Central Supermassive Galactic Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreGrad.addColorStop(0.2, 'rgba(253, 230, 138, 0.9)');
    coreGrad.addColorStop(0.6, 'rgba(96, 165, 250, 0.4)');
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 2 Majestic Logarithmic Spiral Arms
    const arms = 2;
    const armPts = 70;
    const rotSpeed = t * 0.15;

    for (let a = 0; a < arms; a++) {
      const armOffset = (a * Math.PI * 2) / arms + rotSpeed;
      for (let p = 0; p < armPts; p++) {
        const theta = (p / armPts) * Math.PI * 3 + armOffset;
        const radius = (p / armPts) * r;
        const px = cx + Math.cos(theta) * radius;
        const py = cy + Math.sin(theta) * radius * 0.6; // tilted perspective

        const ptSize = Math.max(1.5, (1 - p / armPts) * (r * 0.04));
        ctx.fillStyle = p % 2 === 0 ? 'rgba(147, 197, 253, 0.6)' : 'rgba(251, 191, 36, 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, ptSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawNebula(ctx, cx, cy, r, t, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.7, 'rgba(129, 140, 248, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Baby stars in nebula
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + Math.sin(i * 4);
      const d = (Math.sin(i * 2 + t) * 0.3 + 0.4) * r;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawOortCloud(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Icy planetesimals & comets
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + t * 0.01;
      const d = r * (0.9 + Math.sin(i * 7) * 0.1);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSolarSystem(ctx, cx, cy, r, t, type) {
    ctx.save();
    // Central Sun Dot
    const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(4, r * 0.08));
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.5, '#f59e0b');
    sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(4, r * 0.08), 0, Math.PI * 2);
    ctx.fill();

    // Planetary Orbits
    const orbits = type === 'solar_system_outer' 
      ? [{ rPct: 0.35, color: '#f59e0b', name: 'Jupiter' }, { rPct: 0.65, color: '#fde047', name: 'Saturn' }]
      : [{ rPct: 0.3, color: '#94a3b8', name: 'Mercury' }, { rPct: 0.5, color: '#fb923c', name: 'Venus' }, { rPct: 0.75, color: '#38bdf8', name: 'Earth' }, { rPct: 0.95, color: '#ef4444', name: 'Mars' }];

    for (const orb of orbits) {
      const orbR = r * orb.rPct;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.stroke();

      // Planet Position on Orbit
      const pAngle = t * (1.5 / orb.rPct);
      const px = cx + Math.cos(pAngle) * orbR;
      const py = cy + Math.sin(pAngle) * orbR;

      ctx.fillStyle = orb.color;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.5, r * 0.035), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSun(ctx, cx, cy, r, t) {
    ctx.save();
    // Solar Corona & Flare Rays
    const corona = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.6);
    corona.addColorStop(0, 'rgba(251, 146, 60, 0.8)');
    corona.addColorStop(0.5, 'rgba(234, 88, 12, 0.35)');
    corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Sun Photosphere Disk
    const sunDisk = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
    sunDisk.addColorStop(0, '#ffffff');
    sunDisk.addColorStop(0.3, '#fef08a');
    sunDisk.addColorStop(0.7, '#f97316');
    sunDisk.addColorStop(1, '#c2410c');
    ctx.fillStyle = sunDisk;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Prominence Flares
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.7)';
    ctx.lineWidth = Math.max(1.5, r * 0.04);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.sin(t * 2 + i) * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (r * 1.25), cy + Math.sin(a) * (r * 1.25));
      ctx.stroke();
    }
    ctx.restore();
  }

  drawJupiter(ctx, cx, cy, r, t) {
    ctx.save();
    // Gas giant atmospheric bands
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const jupGrad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    jupGrad.addColorStop(0, '#78350f');
    jupGrad.addColorStop(0.2, '#fed7aa');
    jupGrad.addColorStop(0.4, '#ea580c');
    jupGrad.addColorStop(0.6, '#fed7aa');
    jupGrad.addColorStop(0.8, '#c2410c');
    jupGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = jupGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Great Red Spot
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.35, cy + r * 0.25, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Atmosphere Ring Border
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawEarth(ctx, cx, cy, r, t) {
    ctx.save();
    // Atmospheric Glow
    const atmosGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.25);
    atmosGlow.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
    atmosGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = atmosGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Ocean Globe
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    ocean.addColorStop(0, '#0284c7');
    ocean.addColorStop(0.7, '#0369a1');
    ocean.addColorStop(1, '#075985');
    ctx.fillStyle = ocean;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Continents (Green/Gold Landmasses)
    ctx.fillStyle = '#15803d';
    const rot = t * 0.1;
    for (let c = 0; c < 5; c++) {
      const ca = (c / 5) * Math.PI * 2 + rot;
      const clx = cx + Math.cos(ca) * (r * 0.5);
      const cly = cy + Math.sin(c * 2) * (r * 0.4);
      ctx.beginPath();
      ctx.ellipse(clx, cly, r * 0.3, r * 0.2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud Swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.3, r * 0.7, r * 0.15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.25, r * 0.6, r * 0.12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawMoon(ctx, cx, cy, r, t) {
    ctx.save();
    const moonGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    moonGrad.addColorStop(0, '#f8fafc');
    moonGrad.addColorStop(0.7, '#94a3b8');
    moonGrad.addColorStop(1, '#475569');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
    const craters = [{ x: -0.3, y: -0.2, r: 0.18 }, { x: 0.2, y: 0.3, r: 0.22 }, { x: -0.1, y: 0.4, r: 0.14 }];
    for (const c of craters) {
      ctx.beginPath();
      ctx.arc(cx + c.x * r, cy + c.y * r, c.r * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTerrestrial(ctx, cx, cy, r, obj) {
    ctx.save();
    ctx.strokeStyle = obj.accentColor;
    ctx.lineWidth = 2.5;

    if (obj.renderType === 'mountain') {
      // Everest Triangle Peak
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.8);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snow cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx - r * 0.3, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Skyscraper / Burj Khalifa Spire
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.2);
      ctx.lineTo(cx + r * 0.2, cy + r * 0.9);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBlueWhale(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    const sway = Math.sin(t * 2) * (r * 0.08);

    // Streamlined whale body
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tail Fluke
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy);
    ctx.lineTo(cx - r * 1.2, cy - r * 0.35 + sway);
    ctx.lineTo(cx - r * 1.1, cy + sway);
    ctx.lineTo(cx - r * 1.2, cy + r * 0.35 + sway);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawHuman(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.7, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Torso & Body
    ctx.beginPath();
    ctx.roundRect(cx - r * 0.22, cy - r * 0.45, r * 0.44, r * 0.8, 8);
    ctx.fill();
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.rect(cx - r * 0.2, cy + r * 0.35, r * 0.16, r * 0.7);
    ctx.rect(cx + r * 0.04, cy + r * 0.35, r * 0.16, r * 0.7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawHeart(ctx, cx, cy, r, t) {
    ctx.save();
    const pulse = Math.sin(t * 4) * 0.08 + 1;
    const hr = r * pulse;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cx, cy + hr * 0.7);
    ctx.bezierCurveTo(cx - hr, cy, cx - hr * 0.7, cy - hr * 0.8, cx, cy - hr * 0.2);
    ctx.bezierCurveTo(cx + hr * 0.7, cy - hr * 0.8, cx + hr, cy, cx, cy + hr * 0.7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawMicroObject(ctx, cx, cy, r, obj) {
    ctx.save();
    ctx.strokeStyle = obj.accentColor;
    ctx.fillStyle = 'rgba(217, 119, 6, 0.3)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawRedBloodCell(ctx, cx, cy, r, t) {
    ctx.save();
    // Biconcave Erythrocyte Shape
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#991b1b'); // Dark center dimple
    grad.addColorStop(0.6, '#ef4444'); // Raised rim
    grad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.7, Math.sin(t) * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  drawBacterium(ctx, cx, cy, r, t) {
    ctx.save();
    // Rod-shaped capsule
    ctx.fillStyle = 'rgba(16, 185, 129, 0.75)';
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(cx - r * 0.9, cy - r * 0.4, r * 1.8, r * 0.8, r * 0.4);
    ctx.fill();
    ctx.stroke();

    // Flagella tail
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy);
    const wave = Math.sin(t * 8) * (r * 0.2);
    ctx.bezierCurveTo(cx - r * 1.3, cy + wave, cx - r * 1.6, cy - wave, cx - r * 2.0, cy + wave);
    ctx.stroke();
    ctx.restore();
  }

  drawVirus(ctx, cx, cy, r, t) {
    ctx.save();
    // Capsid sphere
    const capsidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.7);
    capsidGrad.addColorStop(0, '#f43f5e');
    capsidGrad.addColorStop(1, '#9f1239');
    ctx.fillStyle = capsidGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Spike Glycoproteins (Coronavirus Spikes)
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = Math.max(1.5, r * 0.05);
    ctx.fillStyle = '#f43f5e';
    const spikes = 14;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2 + t * 0.2;
      const sx = cx + Math.cos(a) * (r * 0.7);
      const sy = cy + Math.sin(a) * (r * 0.7);
      const ex = cx + Math.cos(a) * r;
      const ey = cy + Math.sin(a) * r;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Spike Club Head
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(2, r * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMembrane(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    // Lipid bilayer
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawDNAHelix(ctx, cx, cy, r, t) {
    ctx.save();
    // 3D Rotating Double Helix
    const rotSpeed = t * 1.5;
    const strandWidth = r * 0.6;

    for (let i = 0; i < 28; i++) {
      const y = cy + (i - 14) * (r * 0.08);
      const phase = (i / 28) * Math.PI * 4 + rotSpeed;

      const x1 = cx + Math.cos(phase) * strandWidth;
      const x2 = cx - Math.cos(phase) * strandWidth;
      const depth = Math.sin(phase);

      // Base pair rung
      ctx.strokeStyle = depth > 0 ? 'rgba(236, 72, 153, 0.8)' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = Math.max(1.5, (depth + 1.2) * 2);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Backbone Spheres (Sugar-phosphate)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x1, y, Math.max(2, (depth + 1.5) * 2.5), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x2, y, Math.max(2, (-depth + 1.5) * 2.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBuckyball(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';

    // Hexagonal / pentagonal cage vertices
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t + Math.PI / 6;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (r * 0.7), cy + Math.sin(a) * (r * 0.7));
    }
    ctx.stroke();
    ctx.restore();
  }

  drawHydrogenAtom(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Quantum Electron Cloud Wavefunction (Schrödinger Orbitals)
    const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    cloud.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    cloud.addColorStop(0.3, 'rgba(14, 165, 233, 0.4)');
    cloud.addColorStop(0.7, 'rgba(2, 132, 199, 0.15)');
    cloud.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Bohr Orbit Boundary Ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Orbiting Electron Wave Packet
    const eAngle = t * 4;
    const ex = cx + Math.cos(eAngle) * (r * 0.7);
    const ey = cy + Math.sin(eAngle) * (r * 0.7);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(2, r * 0.04), 0, Math.PI * 2);
    ctx.fill();

    // Nucleus Dot at Dead Center
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(3, r * 0.06), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawComptonWave(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -r; x <= r; x += 4) {
      const y = Math.sin((x / r) * Math.PI * 6 + t * 6) * (r * 0.4);
      if (x === -r) ctx.moveTo(cx + x, cy + y);
      else ctx.lineTo(cx + x, cy + y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawNucleus(ctx, cx, cy, r, t) {
    ctx.save();
    // Dense clustering of Protons (Red) & Neutrons (Blue)
    const nucleons = 18;
    for (let i = 0; i < nucleons; i++) {
      const a = (i / nucleons) * Math.PI * 2 + Math.sin(i * 3 + t * 2) * 0.3;
      const d = (Math.cos(i * 5) * 0.35 + 0.5) * (r * 0.7);
      const nx = cx + Math.cos(a) * d;
      const ny = cy + Math.sin(a) * d;
      const nRadius = Math.max(3, r * 0.22);

      const isProton = i % 2 === 0;
      ctx.fillStyle = isProton ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(nx, ny, nRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawProtonQuarks(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Strong Force Confinement Bag
    const bag = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bag.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    bag.addColorStop(0.7, 'rgba(234, 179, 8, 0.15)');
    bag.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bag;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3 Valence Quarks: Up, Up, Down (Equilateral triangle)
    const quarkAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    const qCoords = [];
    const qDist = r * 0.55;

    for (let i = 0; i < 3; i++) {
      const a = quarkAngles[i] + t * 1.5;
      const wobble = Math.sin(t * 8 + i) * (r * 0.08);
      const qx = cx + Math.cos(a) * (qDist + wobble);
      const qy = cy + Math.sin(a) * (qDist + wobble);
      qCoords.push({ x: qx, y: qy, label: i < 2 ? 'u' : 'd' });
    }

    // Vibrating Gluon Flux Tubes (Springs between quarks)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = Math.max(2, r * 0.035);
    for (let i = 0; i < 3; i++) {
      const q1 = qCoords[i];
      const q2 = qCoords[(i + 1) % 3];
      ctx.beginPath();
      ctx.moveTo(q1.x, q1.y);
      // Oscillating gluon mid-point
      const mx = (q1.x + q2.x) / 2 + Math.sin(t * 12 + i) * (r * 0.15);
      const my = (q1.y + q2.y) / 2 + Math.cos(t * 12 + i) * (r * 0.15);
      ctx.quadraticCurveTo(mx, my, q2.x, q2.y);
      ctx.stroke();
    }

    // Render Quarks
    for (let i = 0; i < 3; i++) {
      const q = qCoords[i];
      const qGrad = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 0.2);
      qGrad.addColorStop(0, '#ffffff');
      qGrad.addColorStop(0.5, i < 2 ? '#38bdf8' : '#ec4899');
      qGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = qGrad;
      ctx.beginPath();
      ctx.arc(q.x, q.y, Math.max(4, r * 0.2), 0, Math.PI * 2);
      ctx.fill();

      // Quark Label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, r * 0.14)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(q.label, q.x, q.y);
    }
    ctx.restore();
  }

  drawQuarksPoint(ctx, cx, cy, r, t, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pointGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    pointGrad.addColorStop(0, '#ffffff');
    pointGrad.addColorStop(0.4, color);
    pointGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pointGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawQuantumFoamDetail(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;

    // Spacetime bubbling topological foam
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + t;
      const rad = (Math.sin(t * 3 + i) * 0.3 + 0.6) * r;
      const bx = cx + Math.cos(a) * (r * 0.4);
      const by = cy + Math.sin(a) * (r * 0.4);

      ctx.beginPath();
      ctx.arc(bx, by, Math.max(2, rad * 0.4), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPlanckString(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Multidimensional Calabi-Yau projection & Vibrating String Loop
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = Math.max(2.5, r * 0.04);
    ctx.beginPath();

    const pts = 60;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      // Complex harmonic string vibration (String Theory harmonics)
      const rHarmonic = r * (0.65 + Math.sin(a * 4 + t * 6) * 0.2 + Math.cos(a * 7 - t * 4) * 0.12);
      const px = cx + Math.cos(a) * rHarmonic;
      const py = cy + Math.sin(a) * rHarmonic;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Central Quantum Singularity Sparkle
    const singularity = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3);
    singularity.addColorStop(0, '#ffffff');
    singularity.addColorStop(0.5, '#a855f7');
    singularity.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = singularity;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGenericSphere(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * HUD Holographic Target Indicator
   */
  drawReticleGrid(ctx, cx, cy) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1;

    // Crosshairs
    const armLen = 30;
    ctx.beginPath();
    ctx.moveTo(cx - armLen, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + armLen, cy);
    ctx.moveTo(cx, cy - armLen);
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + armLen);
    ctx.stroke();

    // Subtle scale circle
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawObjectTag(ctx, obj, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * 1.2);

    // Callout line from object to side tag
    const tagX = cx + Math.min(this.width * 0.35, Math.max(r + 40, 160));
    const tagY = cy - 40;

    ctx.strokeStyle = obj.accentColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tagX - 15, tagY);
    ctx.lineTo(tagX + 130, tagY);
    ctx.stroke();

    // Callout Dot
    ctx.fillStyle = obj.accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Callout text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 13px system-ui';
    ctx.fillText(obj.nameEn, tagX, tagY - 14);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 11px system-ui';
    ctx.fillText(obj.sizeFormatted, tagX, tagY + 16);

    ctx.restore();
  }

  // =========================================================================
  // GRAVITATIONAL COMPRESSION, SHATTER & BLACK HOLE SUBSYSTEM
  // =========================================================================

  startCompression(x, y) {
    if (this.blackHoleState === 'active' || this.blackHoleState === 'shattering') return;
    this.blackHoleState = 'charging';
    this.blackHoleCharge = 0.05;
    this.blackHoleCenter = { x, y };
  }

  updateCompression(dt, isHolding, x, y) {
    if (this.blackHoleState !== 'charging') return;
    if (isHolding) {
      this.blackHoleCenter.x += (x - this.blackHoleCenter.x) * 0.15;
      this.blackHoleCenter.y += (y - this.blackHoleCenter.y) * 0.15;
      this.blackHoleCharge = Math.min(1.0, this.blackHoleCharge + dt * 0.92);
      if (this.blackHoleCharge >= 1.0) {
        this.triggerBlackHoleCollapse(this.blackHoleCenter.x, this.blackHoleCenter.y);
      }
    } else {
      this.blackHoleCharge -= dt * 1.5;
      if (this.blackHoleCharge <= 0) {
        this.blackHoleCharge = 0;
        this.blackHoleState = 'inactive';
      }
    }
  }

  cancelCompression() {
    if (this.blackHoleState === 'charging') {
      this.blackHoleState = 'inactive';
      this.blackHoleCharge = 0;
    }
  }

  triggerBlackHoleCollapse(x = this.width / 2, y = this.height / 2) {
    this.blackHoleState = 'shattering';
    this.blackHoleTimer = 0;
    this.blackHoleCharge = 1.0;
    this.blackHoleCenter = { x, y };

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shardCount = prefersReducedMotion ? 20 : 130;
    const maxSpeed = prefersReducedMotion ? 40 : 140;

    // Spawn geometric shatter shards (WCAG-compliant quantity)
    this.shatterShards = [];
    const colors = ['#ffffff', '#38bdf8', '#818cf8', '#c084fc', '#f59e0b', '#f43f5e'];
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 380 + 30;
      const speed = Math.random() * maxSpeed + 20;
      this.shatterShards.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 8,
        size: Math.random() * 18 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        polySides: Math.floor(Math.random() * 3) + 3
      });
    }

    // Initialize 160 accretion sparks
    this.accretionSparks = [];
    for (let i = 0; i < 160; i++) {
      this.accretionSparks.push({
        radius: Math.random() * 210 + 65,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.8 + 0.7),
        size: Math.random() * 2.8 + 1.0,
        opacity: Math.random() * 0.7 + 0.3,
        verticalOffset: (Math.random() - 0.5) * 12
      });
    }

    // Initialize 50 polar jet sparks
    this.jetSparks = [];
    for (let i = 0; i < 50; i++) {
      this.jetSparks.push({
        distY: Math.random() * 450 + 60,
        xSpread: (Math.random() - 0.5) * 14,
        speed: Math.random() * 350 + 200,
        dir: Math.random() > 0.5 ? 1 : -1,
        size: Math.random() * 2.5 + 1.2
      });
    }

    if (this.onBlackHoleTriggered) {
      this.onBlackHoleTriggered();
    }
  }

  triggerBlackHoleEvaporation() {
    if (this.blackHoleState !== 'active') return;
    this.blackHoleState = 'evaporating';
    this.blackHoleTimer = 0;
  }

  updateBlackHole(dt) {
    if (this.blackHoleState === 'inactive') return;

    this.blackHoleLensingAngle += dt * 1.5;

    if (this.blackHoleState === 'shattering') {
      this.blackHoleTimer += dt;
      const bx = this.blackHoleCenter.x;
      const by = this.blackHoleCenter.y;

      // Gravitational attraction pulling all shards towards singularity
      for (const shard of this.shatterShards) {
        const dx = bx - shard.x;
        const dy = by - shard.y;
        const dist = Math.hypot(dx, dy) + 20;
        const force = 40000 / (dist * dist);

        shard.vx += (dx / dist) * force * dt * 60;
        shard.vy += (dy / dist) * force * dt * 60;
        shard.x += shard.vx * dt;
        shard.y += shard.vy * dt;
        shard.rot += shard.rotSpeed * dt;
        shard.size = Math.max(1, shard.size * (1 - dt * 0.6));
      }

      // Transition to stable active black hole
      if (this.blackHoleTimer >= 1.2) {
        this.blackHoleState = 'active';
        this.blackHoleTimer = 0;
      }
    } else if (this.blackHoleState === 'active') {
      this.blackHoleTimer += dt;

      // Accretion disk differential Keplerian rotation
      for (const s of this.accretionSparks) {
        const angSpeed = (24 / Math.sqrt(s.radius)) * s.speed;
        s.angle += angSpeed * dt;
        // Infalling spiral drift
        s.radius -= dt * 12;
        if (s.radius < 62) {
          s.radius = 230 + Math.random() * 40;
        }
      }

      // Polar jet particles shooting outward
      for (const j of this.jetSparks) {
        j.distY += j.speed * dt;
        j.xSpread += (Math.random() - 0.5) * 1.5;
        if (j.distY > 550) {
          j.distY = 60;
          j.xSpread = (Math.random() - 0.5) * 8;
        }
      }
    } else if (this.blackHoleState === 'evaporating') {
      this.blackHoleTimer += dt;
      if (this.blackHoleTimer >= 1.1) {
        this.blackHoleState = 'inactive';
        this.blackHoleTimer = 0;
        if (this.onBlackHoleEvaporated) {
          this.onBlackHoleEvaporated();
        }
      }
    }
  }

  renderCompressionReticle(ctx, x, y) {
    ctx.save();
    const charge = Math.min(1.0, this.blackHoleCharge);
    const pulse = Math.sin(this.time * 12) * 4;

    // Distorted gravitational stress lines
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 + charge * 0.5})`;
    ctx.lineWidth = 1.2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const r1 = 30 + charge * 40;
      const r2 = 90 + charge * 80;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
      ctx.stroke();
    }

    // Outer progress ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Charged arc
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x, y, 55, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
    ctx.stroke();

    // Singularity center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 4 + pulse * 0.5 + charge * 8, 0, Math.PI * 2);
    ctx.fill();

    // Telemetry text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e9d5ff';
    ctx.font = '700 11px system-ui';
    ctx.textAlign = 'center';
    const pct = Math.floor(charge * 100);
    ctx.fillText(`মহাকর্ষীয় সংকোচন: ${pct}%`, x, y + 80);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`DENSITY CRITICAL`, x, y + 94);

    ctx.restore();
  }

  renderShatterFX(ctx, bx, by) {
    ctx.save();
    // Central blinding implosion flash
    const flashProgress = Math.min(1.0, this.blackHoleTimer / 0.5);
    const flashRadius = (1 - flashProgress) * 450 + 80;
    const flashGrad = ctx.createRadialGradient(bx, by, 0, bx, by, flashRadius);
    flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    flashGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
    flashGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)');
    flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(bx, by, flashRadius, 0, Math.PI * 2);
    ctx.fill();

    // Render shattering geometric crystal shards
    for (const s of this.shatterShards) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = s.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      for (let p = 0; p < s.polySides; p++) {
        const a = (p / s.polySides) * Math.PI * 2;
        const px = Math.cos(a) * (s.size * (p % 2 === 0 ? 1 : 0.6));
        const py = Math.sin(a) * (s.size * (p % 2 === 0 ? 1 : 0.6));
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  renderBlackHole(ctx, cx, cy) {
    ctx.save();

    // ================= SCHWARZSCHILD EXACT GEOMETRY SCALES =================
    // 1. Schwarzschild Radius r_s = 2GM/c^2 (Physical Event Horizon boundary)
    const rs = 38; 
    // 2. Photon Sphere r_ph = 1.5 * r_s (Where light orbits in circular paths)
    const r_photon = rs * 1.5; // 57px
    // 3. Apparent Black Hole Shadow Radius r_shadow = sqrt(27)/2 * r_s ≈ 2.598 * r_s
    // (Critical impact parameter b_c = 3*sqrt(3)*M below which photons fall into horizon)
    const r_shadow = rs * (Math.sqrt(27) / 2); // 98.7px
    // 4. Innermost Stable Circular Orbit (ISCO) = 3.0 * r_s
    const r_isco = rs * 3.0; // 114px

    const hasAccretionDisk = this.blackHoleAccretionMode === 'disk';

    // ================= 1. RELATIVISTIC POLAR JETS (ONLY IF ACCRETION DISK ACTIVE) =================
    if (hasAccretionDisk) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const jetGrad = ctx.createLinearGradient(cx - 15, cy, cx + 15, cy);
      jetGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      jetGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      jetGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      // Upward Jet
      ctx.fillStyle = jetGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - rs * 0.9);
      ctx.lineTo(cx - 36, cy - 580);
      ctx.lineTo(cx + 36, cy - 580);
      ctx.lineTo(cx + 8, cy - rs * 0.9);
      ctx.closePath();
      ctx.fill();

      // Downward Jet
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + rs * 0.9);
      ctx.lineTo(cx - 36, cy + 580);
      ctx.lineTo(cx + 36, cy + 580);
      ctx.lineTo(cx + 8, cy + rs * 0.9);
      ctx.closePath();
      ctx.fill();

      // Jet particles
      ctx.fillStyle = '#bae6fd';
      for (const j of this.jetSparks) {
        const jy = cy + j.dir * j.distY;
        const jx = cx + j.xSpread;
        ctx.beginPath();
        ctx.arc(jx, jy, j.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ================= 2. GRAVITATIONAL LENSING BACKGROUND WARP GLOW =================
    ctx.save();
    const lensGlow = ctx.createRadialGradient(cx, cy, r_shadow, cx, cy, 320);
    lensGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    lensGlow.addColorStop(0.3, 'rgba(245, 158, 11, 0.2)');
    lensGlow.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
    lensGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lensGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ================= 3. REAR ACCRETION DISK (WARPED OVER & UNDER BY GRAVITATIONAL DEFLECTION) =================
    if (hasAccretionDisk) {
      // Upper Warped Arc (Light bent over the top of the shadow)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 160, Math.PI * 0.95, Math.PI * 2.05, false);
      ctx.arc(cx, cy - 8, r_shadow + 2, Math.PI * 2.05, Math.PI * 0.95, true);
      ctx.closePath();
      const upperDiskGrad = ctx.createRadialGradient(cx, cy - 8, r_shadow, cx, cy - 8, 170);
      upperDiskGrad.addColorStop(0, '#ffffff');
      upperDiskGrad.addColorStop(0.2, '#fde047');
      upperDiskGrad.addColorStop(0.5, '#f97316');
      upperDiskGrad.addColorStop(0.85, '#991b1b');
      upperDiskGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
      ctx.fillStyle = upperDiskGrad;
      ctx.fill();

      // Lower Warped Arc (Light bent under the bottom of the shadow)
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 135, 0, Math.PI, false);
      ctx.arc(cx, cy + 8, r_shadow + 2, Math.PI, 0, true);
      ctx.closePath();
      const lowerDiskGrad = ctx.createRadialGradient(cx, cy + 8, r_shadow, cx, cy + 8, 145);
      lowerDiskGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      lowerDiskGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.5)');
      lowerDiskGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
      lowerDiskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lowerDiskGrad;
      ctx.fill();
      ctx.restore();
    } else {
      // PURE VACUUM LENSING: Background starlight deflection rings (Einstein light bending)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, r_shadow + 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, r_shadow + 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ================= 4. HORIZONTAL ACCRETION DISK (FRONT EQUATORIAL PLANE) =================
    if (hasAccretionDisk) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.0, 0.32); // Inclined equatorial disk view

      // Relativistic Doppler Beaming Gradient (Approaching left side is blueshifted & brighter, receding right side is redshifted & dimmer)
      const diskLinGrad = ctx.createLinearGradient(-280, 0, 280, 0);
      diskLinGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      diskLinGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.9)');
      diskLinGrad.addColorStop(0.55, 'rgba(249, 115, 22, 0.7)');
      diskLinGrad.addColorStop(0.85, 'rgba(220, 38, 38, 0.35)');
      diskLinGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');

      ctx.fillStyle = diskLinGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 280, 0, Math.PI * 2);
      ctx.arc(0, 0, r_isco, 0, Math.PI * 2, true);
      ctx.fill();

      // Accretion Disk Gas Filaments & Plasma Sparks
      ctx.globalCompositeOperation = 'lighter';
      for (const spark of this.accretionSparks) {
        const sx = Math.cos(spark.angle) * spark.radius;
        const sy = Math.sin(spark.angle) * spark.radius + spark.verticalOffset;
        const isApproaching = sx < 0; // Left side
        ctx.fillStyle = isApproaching ? '#ffffff' : '#f97316';
        ctx.globalAlpha = isApproaching ? spark.opacity : spark.opacity * 0.45;
        ctx.beginPath();
        ctx.arc(sx, sy, spark.size * (isApproaching ? 1.4 : 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ================= 5. THE APPARENT BLACK HOLE SHADOW BOUNDARY (r_shadow ≈ 2.6 r_s) =================
    ctx.save();
    ctx.fillStyle = '#010101';
    ctx.beginPath();
    ctx.arc(cx, cy, r_shadow, 0, Math.PI * 2);
    ctx.fill();

    // Shadow outer boundary line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.restore();

    // ================= 6. THE PHOTON RING / PHOTON SPHERE (r_ph = 1.5 r_s) =================
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, r_photon, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary delicate sub-ring
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 1.0;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r_photon + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ================= 7. THE EVENT HORIZON (r_s = 1.0 r_s) =================
    // Pure pitch-black interior
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, rs, 0, Math.PI * 2);
    ctx.fill();

    // Event Horizon demarcation line
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  renderEvaporationFX(ctx, cx, cy) {
    ctx.save();
    const p = Math.min(1.0, this.blackHoleTimer / 1.0);
    const rs = 38;
    const rad = Math.max(0, (1 - p) * rs);

    // Soft Hawking Radiation Dissolution
    const shockRadius = p * 500 + 40;
    const shockGrad = ctx.createRadialGradient(cx, cy, rad, cx, cy, shockRadius);
    shockGrad.addColorStop(0, `rgba(255, 255, 255, ${(1 - p) * 0.8})`);
    shockGrad.addColorStop(0.3, `rgba(56, 189, 248, ${(1 - p) * 0.5})`);
    shockGrad.addColorStop(0.7, `rgba(168, 85, 247, ${(1 - p) * 0.25})`);
    shockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = shockGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
    ctx.fill();

    // Shrinking Event Horizon
    if (rad > 0.5) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
