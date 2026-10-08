/**
 * COSMIC TO PLANCK 3D RENDER ENGINE (WebGL / Three.js)
 * Full 360-degree interactive spatial exploration:
 * - Three.js WebGLRenderer with logarithmicDepthBuffer
 * - 360-degree camera orbital navigation (mouse drag / touch)
 * - Auto-rotation with user interaction pause/resume
 * - High-fidelity procedural 3D models with canvas textures and volumetric lighting
 * - True 3D Schwarzschild relativistic black hole with dynamic lensed arcs
 * - Zero external build requirements (Native browser ES Modules)
 */

import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/jsm/controls/OrbitControls.js';
import { COSMIC_OBJECTS } from './science-data.js';

/* ================= PROCEDURAL TEXTURE GENERATORS ================= */

function createGlowParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.2, 'rgba(224, 242, 254, 0.9)');
  gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Royal Ocean
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0f4c81');
  oceanGrad.addColorStop(1, '#0a2342');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Continental landmasses
  ctx.fillStyle = '#22543d';
  // North America
  ctx.beginPath();
  ctx.ellipse(240, 160, 120, 75, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(320, 320, 75, 115, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(640, 150, 190, 85, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 275, 95, 105, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 345, 70, 48, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Desert and plateau highlights
  ctx.fillStyle = '#b7791f';
  ctx.beginPath();
  ctx.ellipse(535, 230, 70, 40, 0, 0, Math.PI * 2); // Sahara
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(680, 170, 65, 30, 0, 0, Math.PI * 2); // Central Asia
  ctx.fill();

  // Polar ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 38);
  ctx.fillRect(0, 462, 1024, 50);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

  for (let i = 0; i < 45; i++) {
    const x = (i * 24 + 30) % 1024;
    const y = 140 + Math.sin(i * 0.45) * 85;
    const r = 28 + (i % 5) * 14;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.8, r * 0.75, Math.sin(i) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 40; i++) {
    const x = (i * 28 + 90) % 1024;
    const y = 325 + Math.cos(i * 0.4) * 75;
    const r = 24 + (i % 4) * 12;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.7, r * 0.65, -Math.cos(i) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createSunTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.3, '#fbbf24');
  grad.addColorStop(0.65, '#ea580c');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 20 + 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createSaturnRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.12, 'rgba(226, 192, 141, 0.85)');
  grad.addColorStop(0.55, 'rgba(190, 160, 120, 0.9)');
  grad.addColorStop(0.60, 'rgba(10, 10, 15, 0.08)'); // Cassini Division
  grad.addColorStop(0.66, 'rgba(210, 180, 135, 0.8)');
  grad.addColorStop(0.96, 'rgba(180, 150, 110, 0.35)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* ================= MAIN 3D RENDER ENGINE ================= */

export class CosmicRenderEngine3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Viewport & Scale State
    this.currentOrder = 27.0; // Observable Universe
    this.targetOrder = 27.0;
    this.zoomVelocity = 0;

    // Black Hole State
    this.blackHoleState = 'inactive'; // 'inactive' | 'charging' | 'shattering' | 'active' | 'evaporating'
    this.blackHoleTimer = 0;
    this.blackHoleMassType = 'planck'; // 'planck' | 'sun' | 'sgra'
    this.blackHoleAccretionMode = 'disk'; // 'disk' | 'vacuum'
    this.showGeometryOverlay = false;

    // Auto-Rotation and User Interaction States
    this.autoRotateEnabled = true;
    this.isInteracting = false;
    this.lastInteractionTime = performance.now();

    // Procedural Texture Cache
    this.glowTexture = createGlowParticleTexture();
    this.earthTexture = createEarthTexture();
    this.cloudTexture = createCloudTexture();
    this.sunTexture = createSunTexture();
    this.saturnRingTexture = createSaturnRingTexture();

    // Time Tracking
    this.time = 0;
    this.lastTime = performance.now();

    // Three.js Core Systems
    this.initScene();
    this.initCameraAndControls();
    this.initLighting();
    this.initBackgroundEnvironment();
    this.initBlackHole3D();
    this.initProceduralObjects3D();

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.0025);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    // Scene Graph Hierarchies
    this.backgroundGroup = new THREE.Group();
    this.objectGroup = new THREE.Group();
    this.blackHoleGroup = new THREE.Group();

    this.scene.add(this.backgroundGroup);
    this.scene.add(this.objectGroup);
    this.scene.add(this.blackHoleGroup);
    this.blackHoleGroup.visible = false;
  }

  initCameraAndControls() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.05, 60000);
    // Cinematic oblique starting angle
    this.camera.position.set(32, 22, 50);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enableZoom = true; // Enables true 3D spatial zoom
    this.controls.minDistance = 14;
    this.controls.maxDistance = 120;
    this.controls.enablePan = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.75;

    // Interaction Listeners on Canvas
    this.canvas.addEventListener('pointerdown', () => {
      this.isInteracting = true;
      this.controls.autoRotate = false;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', () => {
      if (this.isInteracting) {
        this.isInteracting = false;
        this.lastInteractionTime = performance.now();
        this.canvas.style.cursor = 'grab';
      }
    });
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(60, 80, 60);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc084fc, 0.95);
    dirLight2.position.set(-60, -40, -60);
    this.scene.add(dirLight2);

    this.corePointLight = new THREE.PointLight(0xffffff, 1.8, 350);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);
  }

  initBackgroundEnvironment() {
    // 1. Deep 3D Starfield particles with soft glow texture
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xfef08a),
      new THREE.Color(0xc084fc),
      new THREE.Color(0x38bdf8)
    ];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 900 + 160;

      const sinPhi = Math.sin(phi);
      starPos[i * 3] = r * sinPhi * Math.cos(theta);
      starPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 3.2,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starField = new THREE.Points(starGeo, starMat);
    this.backgroundGroup.add(this.starField);

    // 2. Cosmic Web Filaments in deep volume
    const filamentGeo = new THREE.BufferGeometry();
    const filamentPos = [];
    for (let i = 0; i < 90; i++) {
      const p1 = new THREE.Vector3(
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 600
      );
      const p2 = p1.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 140
      ));
      filamentPos.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    filamentGeo.setAttribute('position', new THREE.Float32BufferAttribute(filamentPos, 3));
    const filamentMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.28
    });
    this.filaments = new THREE.LineSegments(filamentGeo, filamentMat);
    this.backgroundGroup.add(this.filaments);
  }

  initBlackHole3D() {
    // 1. Central Event Horizon Shadow Sphere (Pure Pitch-Black)
    const shadowGeo = new THREE.SphereGeometry(6.2, 48, 48);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.bhShadowSphere = new THREE.Mesh(shadowGeo, shadowMat);
    this.blackHoleGroup.add(this.bhShadowSphere);

    // 2. Luminous Photon Ring (Razor-sharp glowing toroid at shadow rim)
    const photonRingGeo = new THREE.TorusGeometry(6.25, 0.1, 16, 120);
    const photonRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.bhPhotonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    this.bhPhotonRing.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.bhPhotonRing);

    // 3. Relativistic Accretion Disk (Inclined 3D Mesh with Doppler Beaming)
    const diskGeo = new THREE.RingGeometry(7.0, 19.5, 96, 8);
    this.bhDiskMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94
    });
    this.bhDisk = new THREE.Mesh(diskGeo, this.bhDiskMat);
    this.bhDisk.rotation.x = Math.PI / 2.3; // Realistic oblique orbital inclination
    this.blackHoleGroup.add(this.bhDisk);

    // 4. Lensed Arcs (Upper & Lower bent light arcs)
    const upperArcGeo = new THREE.TorusGeometry(8.6, 1.3, 24, 96, Math.PI);
    const upperArcMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.88
    });
    this.bhUpperArc = new THREE.Mesh(upperArcGeo, upperArcMat);
    this.bhUpperArc.rotation.x = 0;
    this.blackHoleGroup.add(this.bhUpperArc);

    const lowerArcGeo = new THREE.TorusGeometry(7.7, 0.95, 24, 96, Math.PI);
    const lowerArcMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.75
    });
    this.bhLowerArc = new THREE.Mesh(lowerArcGeo, lowerArcMat);
    this.bhLowerArc.rotation.x = Math.PI;
    this.blackHoleGroup.add(this.bhLowerArc);

    // 5. Relativistic Polar Jets
    const jetGeo = new THREE.ConeGeometry(2.5, 42, 24, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    });

    this.northJet = new THREE.Mesh(jetGeo, jetMat);
    this.northJet.position.y = 27.5;
    this.northJet.rotation.x = Math.PI;
    this.blackHoleGroup.add(this.northJet);

    this.southJet = new THREE.Mesh(jetGeo, jetMat);
    this.southJet.position.y = -27.5;
    this.blackHoleGroup.add(this.southJet);

    // 6. Educational 3-Ring Geometry Overlay
    this.overlayRingsGroup = new THREE.Group();
    this.overlayRingsGroup.renderOrder = 999;

    const ehGeo = new THREE.TorusGeometry(2.4, 0.12, 16, 100);
    const ehMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false, transparent: true, opacity: 0.95 });
    const ehRing = new THREE.Mesh(ehGeo, ehMat);
    ehRing.renderOrder = 999;
    ehRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(ehRing);

    const psGeo = new THREE.TorusGeometry(3.6, 0.12, 16, 100);
    const psMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, depthTest: false, transparent: true, opacity: 0.95 });
    const psRing = new THREE.Mesh(psGeo, psMat);
    psRing.renderOrder = 999;
    psRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(psRing);

    const shGeo = new THREE.TorusGeometry(6.25, 0.14, 16, 100);
    const shMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, depthTest: false, transparent: true, opacity: 0.95 });
    const shRing = new THREE.Mesh(shGeo, shMat);
    shRing.renderOrder = 999;
    shRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(shRing);

    this.overlayRingsGroup.visible = false;
    this.blackHoleGroup.add(this.overlayRingsGroup);

    // 7. Hawking Radiation Particles
    const hawkingCount = 80;
    const hawkingGeo = new THREE.BufferGeometry();
    const hawkingPos = new Float32Array(hawkingCount * 3);
    for (let i = 0; i < hawkingCount * 3; i++) {
      hawkingPos[i] = (Math.random() - 0.5) * 22;
    }
    hawkingGeo.setAttribute('position', new THREE.BufferAttribute(hawkingPos, 3));
    const hawkingMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 2.2,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.hawkingPoints = new THREE.Points(hawkingGeo, hawkingMat);
    this.blackHoleGroup.add(this.hawkingPoints);
  }

  initProceduralObjects3D() {
    this.proceduralMeshes = {};

    // 1. Observable Universe (Volumetric Cosmic Web + Filaments + CMB Shell)
    const universeGroup = new THREE.Group();
    // CMB Shell
    const cmbGeo = new THREE.SphereGeometry(18, 36, 36);
    const cmbMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    universeGroup.add(new THREE.Mesh(cmbGeo, cmbMat));

    // Supercluster Nodes
    const clusterCount = 1400;
    const clusterGeo = new THREE.BufferGeometry();
    const clusterPos = new Float32Array(clusterCount * 3);
    const clusterColors = new Float32Array(clusterCount * 3);
    const c1 = new THREE.Color(0x38bdf8);
    const c2 = new THREE.Color(0xa855f7);

    for (let i = 0; i < clusterCount; i++) {
      const r = Math.pow(Math.random(), 0.75) * 16.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      clusterPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      clusterPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      clusterPos[i * 3 + 2] = r * Math.cos(phi);

      const col = c1.clone().lerp(c2, Math.random());
      clusterColors[i * 3] = col.r;
      clusterColors[i * 3 + 1] = col.g;
      clusterColors[i * 3 + 2] = col.b;
    }
    clusterGeo.setAttribute('position', new THREE.BufferAttribute(clusterPos, 3));
    clusterGeo.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));
    const clusterMat = new THREE.PointsMaterial({
      size: 1.8,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    universeGroup.add(new THREE.Points(clusterGeo, clusterMat));

    // Internal connecting web lines
    const webLinesGeo = new THREE.BufferGeometry();
    const webPositions = [];
    for (let i = 0; i < 70; i++) {
      const i1 = Math.floor(Math.random() * clusterCount) * 3;
      const i2 = Math.floor(Math.random() * clusterCount) * 3;
      webPositions.push(clusterPos[i1], clusterPos[i1 + 1], clusterPos[i1 + 2]);
      webPositions.push(clusterPos[i2], clusterPos[i2 + 1], clusterPos[i2 + 2]);
    }
    webLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(webPositions, 3));
    const webMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 });
    universeGroup.add(new THREE.LineSegments(webLinesGeo, webMat));
    this.proceduralMeshes['observable_universe'] = universeGroup;

    // 2. Milky Way Galaxy (4,000 Glowing Particle Spiral Galaxy)
    const galaxyParticles = 4200;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyParticles * 3);
    const galaxyColors = new Float32Array(galaxyParticles * 3);
    const colCore = new THREE.Color(0xfef08a);
    const colArm = new THREE.Color(0x38bdf8);
    const colHII = new THREE.Color(0xf43f5e);

    for (let i = 0; i < galaxyParticles; i++) {
      const r = Math.pow(Math.random(), 0.55) * 17.5;
      const armIndex = i % 2;
      const angle = (r * 0.42) + (armIndex * Math.PI) + (Math.random() - 0.5) * 0.5;
      const spreadY = (Math.random() - 0.5) * (2.8 / (r * 0.18 + 1));

      galaxyPos[i * 3] = Math.cos(angle) * r;
      galaxyPos[i * 3 + 1] = spreadY;
      galaxyPos[i * 3 + 2] = Math.sin(angle) * r;

      let c = colArm;
      if (r < 3.5) {
        c = colCore.clone().lerp(new THREE.Color(0xf97316), Math.random() * 0.4);
      } else if (Math.random() < 0.15) {
        c = colHII; // Hydrogen-alpha star-forming region
      }
      galaxyColors[i * 3] = c.r;
      galaxyColors[i * 3 + 1] = c.g;
      galaxyColors[i * 3 + 2] = c.b;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    const galaxyMat = new THREE.PointsMaterial({
      size: 1.6,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const galaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
    this.proceduralMeshes['milky_way'] = galaxyMesh;

    // 3. Solar System (Sun with Coronal Aura + Orbit Rings + Textured Planets with Saturn Rings)
    const solarSystemGroup = new THREE.Group();
    // Central Sun
    const sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 32),
      new THREE.MeshStandardMaterial({
        map: this.sunTexture,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.95
      })
    );
    solarSystemGroup.add(sunCore);

    // Planets
    const planetData = [
      { r: 6.2, size: 0.4, color: 0x94a3b8 }, // Mercury
      { r: 8.8, size: 0.65, color: 0xfbbf24 }, // Venus
      { r: 12.0, size: 0.75, color: 0x38bdf8, isEarth: true }, // Earth
      { r: 15.2, size: 0.5, color: 0xef4444 }, // Mars
      { r: 19.8, size: 1.7, color: 0xd97706 }, // Jupiter
      { r: 24.5, size: 1.35, color: 0xe2c08d, isSaturn: true } // Saturn
    ];

    planetData.forEach((p, idx) => {
      // Orbit Ring
      const orbitGeo = new THREE.RingGeometry(p.r - 0.04, p.r + 0.04, 80);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      solarSystemGroup.add(orbitMesh);

      // Planet Sphere
      const plGeo = new THREE.SphereGeometry(p.size, 24, 24);
      let plMat;
      if (p.isEarth) {
        plMat = new THREE.MeshStandardMaterial({ map: this.earthTexture, roughness: 0.6 });
      } else {
        plMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.5 });
      }
      const plMesh = new THREE.Mesh(plGeo, plMat);
      const a = idx * 1.25;
      plMesh.position.set(Math.cos(a) * p.r, 0, Math.sin(a) * p.r);
      solarSystemGroup.add(plMesh);

      // Saturn 3D Rings
      if (p.isSaturn) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.4, p.size * 2.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          map: this.saturnRingTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88
        });
        const saturnRings = new THREE.Mesh(ringGeo, ringMat);
        saturnRings.rotation.x = Math.PI / 2.3;
        saturnRings.position.copy(plMesh.position);
        solarSystemGroup.add(saturnRings);
      }
    });
    this.proceduralMeshes['solar_system'] = solarSystemGroup;

    // 4. Sun (High-Resolution Plasma Star with Coronal Aura)
    const sunGroup = new THREE.Group();
    const mainSun = new THREE.Mesh(
      new THREE.SphereGeometry(9.5, 48, 48),
      new THREE.MeshStandardMaterial({
        map: this.sunTexture,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.95,
        roughness: 0.3
      })
    );
    sunGroup.add(mainSun);

    // Glowing Coronal Aura Shell
    const coronaGeo = new THREE.SphereGeometry(11.2, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    sunGroup.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Coronal Magnetic Prominence Ring
    const promGeo = new THREE.TorusGeometry(9.8, 0.4, 16, 64, Math.PI * 0.7);
    const promMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.8 });
    const promMesh = new THREE.Mesh(promGeo, promMat);
    promMesh.rotation.z = 0.5;
    sunGroup.add(promMesh);
    this.proceduralMeshes['sun'] = sunGroup;

    // 5. Earth (Realistic Textured Marble + Rotating Cloud Layer + Atmosphere Fresnel Rim)
    const earthGroup = new THREE.Group();
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(8.5, 48, 48),
      new THREE.MeshStandardMaterial({
        map: this.earthTexture,
        roughness: 0.45,
        metalness: 0.1
      })
    );
    earthGroup.add(earthMesh);

    // Rotating Clouds Layer
    this.earthClouds = new THREE.Mesh(
      new THREE.SphereGeometry(8.65, 48, 48),
      new THREE.MeshStandardMaterial({
        map: this.cloudTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      })
    );
    earthGroup.add(this.earthClouds);

    // Atmospheric Blue Fresnel Glow Rim
    const atmoGeo = new THREE.SphereGeometry(9.2, 36, 36);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    earthGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
    this.proceduralMeshes['earth'] = earthGroup;

    // 6. Mountain / Peak (Alpine low-poly ridge with contour grid)
    const mountainGroup = new THREE.Group();
    const mountainGeo = new THREE.ConeGeometry(9.0, 14.0, 10, 5);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      wireframe: true,
      roughness: 0.8
    });
    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.y = -3;
    mountainGroup.add(mountainMesh);

    // Snow Cap
    const snowGeo = new THREE.ConeGeometry(4.0, 6.0, 10, 2);
    const snowMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const snowMesh = new THREE.Mesh(snowGeo, snowMat);
    snowMesh.position.y = 1.0;
    mountainGroup.add(snowMesh);
    this.proceduralMeshes['mountain'] = mountainGroup;

    // 7. Human Figure (Stylized Modernist Holographic Silhouette)
    const humanGroup = new THREE.Group();
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const holoSolid = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), holoMat);
    head.position.y = 8.5; humanGroup.add(head);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 7.0, 16), holoSolid);
    torso.position.y = 3.5; humanGroup.add(torso);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 7.0, 12), holoMat);
    armL.position.set(-3.2, 4.0, 0); armL.rotation.z = Math.PI / 4; humanGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 7.0, 12), holoMat);
    armR.position.set(3.2, 4.0, 0); armR.rotation.z = -Math.PI / 4; humanGroup.add(armR);

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 8.0, 12), holoSolid);
    legL.position.set(-1.2, -4.0, 0); humanGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 8.0, 12), holoSolid);
    legR.position.set(1.2, -4.0, 0); humanGroup.add(legR);

    // Metric 1.7m holographic caliper ring
    const groundRing = new THREE.Mesh(
      new THREE.RingGeometry(4.0, 4.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    groundRing.position.y = -8.0;
    groundRing.rotation.x = Math.PI / 2;
    humanGroup.add(groundRing);
    this.proceduralMeshes['human'] = humanGroup;

    // 8. Biological Cell (Translucent Iridescent Membrane + Nucleus + Mitochondria)
    const cellGroup = new THREE.Group();
    const cellMembraneGeo = new THREE.SphereGeometry(8.2, 36, 36);
    const cellMembraneMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.38,
      roughness: 0.2
    });
    cellGroup.add(new THREE.Mesh(cellMembraneGeo, cellMembraneMat));

    const cellNucleusGeo = new THREE.SphereGeometry(3.4, 24, 24);
    const cellNucleusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.4,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.3
    });
    cellGroup.add(new THREE.Mesh(cellNucleusGeo, cellNucleusMat));

    for (let i = 0; i < 6; i++) {
      const orgGeo = new THREE.CapsuleGeometry(0.65, 1.5, 8, 12);
      const orgMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
      const orgMesh = new THREE.Mesh(orgGeo, orgMat);
      const a = (i / 6) * Math.PI * 2;
      orgMesh.position.set(Math.cos(a) * 5.4, (Math.random() - 0.5) * 3, Math.sin(a) * 5.4);
      orgMesh.rotation.set(Math.random(), Math.random(), Math.random());
      cellGroup.add(orgMesh);
    }
    this.proceduralMeshes['cell'] = cellGroup;

    // 9. DNA (True 3D Smooth Double Helix with Color-Coded Nucleotide Base Pairs)
    const dnaGroup = new THREE.Group();
    const helixCurve1Points = [];
    const helixCurve2Points = [];
    for (let t = 0; t < 34; t++) {
      const a = (t / 34) * Math.PI * 4;
      const y = (t - 17) * 0.95;
      const x1 = Math.cos(a) * 4.2;
      const z1 = Math.sin(a) * 4.2;
      const x2 = Math.cos(a + Math.PI) * 4.2;
      const z2 = Math.sin(a + Math.PI) * 4.2;
      helixCurve1Points.push(new THREE.Vector3(x1, y, z1));
      helixCurve2Points.push(new THREE.Vector3(x2, y, z2));

      // Color-coded base pair connector rungs (A-T green/red, G-C yellow/blue)
      if (t % 2 === 0) {
        const rungGeo = new THREE.CylinderGeometry(0.22, 0.22, 8.4, 8);
        const col = (t % 4 === 0) ? 0xef4444 : (t % 4 === 2 ? 0x10b981 : 0x38bdf8);
        const rungMat = new THREE.MeshBasicMaterial({ color: col });
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = a;
        dnaGroup.add(rung);
      }
    }
    const c1Geo = new THREE.BufferGeometry().setFromPoints(helixCurve1Points);
    const c2Geo = new THREE.BufferGeometry().setFromPoints(helixCurve2Points);
    const backboneMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    dnaGroup.add(new THREE.Line(c1Geo, backboneMat));
    dnaGroup.add(new THREE.Line(c2Geo, backboneMat));
    this.proceduralMeshes['dna'] = dnaGroup;

    // 10. Hydrogen Atom (Luminous Proton + 3D Volumetric Electron Cloud)
    const atomGroup = new THREE.Group();
    const nucleusGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    atomGroup.add(new THREE.Mesh(nucleusGeo, nucleusMat));

    const cloudCount = 1200;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.pow(Math.random(), 1.6) * 12 + 2.2;

      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      cloudPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cloudPos[i * 3 + 2] = r * Math.cos(phi);
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    const cloudMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.4,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    atomGroup.add(new THREE.Points(cloudGeo, cloudMat));
    this.proceduralMeshes['hydrogen_atom'] = atomGroup;

    // 11. Proton & Quarks (3 Vibrating Quarks + Oscillating Gluon Flux Tube)
    const protonGroup = new THREE.Group();
    const quarkGeo = new THREE.SphereGeometry(1.3, 24, 24);
    const uQuarkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const dQuarkMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    this.q1 = new THREE.Mesh(quarkGeo, uQuarkMat); this.q1.position.set(2.6, 1.6, 0); protonGroup.add(this.q1);
    this.q2 = new THREE.Mesh(quarkGeo, uQuarkMat); this.q2.position.set(-2.6, 1.6, 0); protonGroup.add(this.q2);
    this.q3 = new THREE.Mesh(quarkGeo, dQuarkMat); this.q3.position.set(0, -2.9, 0); protonGroup.add(this.q3);

    const gluonCageGeo = new THREE.IcosahedronGeometry(5.4, 1);
    const gluonCageMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.45 });
    protonGroup.add(new THREE.Mesh(gluonCageGeo, gluonCageMat));
    this.proceduralMeshes['proton'] = protonGroup;

    // 12. Elementary Quark Point-like Quantum Wave Packet
    const quarkPointGroup = new THREE.Group();
    const corePointGeo = new THREE.SphereGeometry(2.0, 24, 24);
    const corePointMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      wireframe: true
    });
    quarkPointGroup.add(new THREE.Mesh(corePointGeo, corePointMat));

    const waveRingGeo = new THREE.TorusGeometry(4.0, 0.12, 16, 64);
    const waveRingMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.75 });
    quarkPointGroup.add(new THREE.Mesh(waveRingGeo, waveRingMat));
    this.proceduralMeshes['quark_point'] = quarkPointGroup;

    // 13. Quantum Foam (Pulsating 3D Spacetime Topology at Planck Scale)
    const foamGroup = new THREE.Group();
    this.foamSpheres = [];
    for (let i = 0; i < 30; i++) {
      const fGeo = new THREE.SphereGeometry(Math.random() * 2.4 + 0.8, 12, 12);
      const fMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: true, transparent: true, opacity: 0.5 });
      const fSphere = new THREE.Mesh(fGeo, fMat);
      fSphere.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18
      );
      foamGroup.add(fSphere);
      this.foamSpheres.push(fSphere);
    }
    this.proceduralMeshes['quantum_foam'] = foamGroup;

    // Add all procedural meshes to the object group
    for (const key in this.proceduralMeshes) {
      this.objectGroup.add(this.proceduralMeshes[key]);
      this.proceduralMeshes[key].visible = false;
    }
  }

  setTargetOrder(order) {
    this.targetOrder = Math.max(-35.0, Math.min(27.0, order));
  }

  addZoomDelta(delta) {
    this.targetOrder = Math.max(-35.0, Math.min(27.0, this.targetOrder + delta));
  }

  toggleAutoRotate() {
    this.autoRotateEnabled = !this.autoRotateEnabled;
    this.controls.autoRotate = this.autoRotateEnabled;
    return this.autoRotateEnabled;
  }

  update(dt) {
    this.time += dt;

    // Smooth inertia camera scale interpolation
    if (this.blackHoleState === 'inactive' || this.blackHoleState === 'charging') {
      const diff = this.targetOrder - this.currentOrder;
      const k = 8.5;
      const lambda = 1 - Math.exp(-k * Math.min(dt, 0.1));
      this.zoomVelocity = diff * lambda;
      this.currentOrder += this.zoomVelocity;
      if (Math.abs(diff) < 0.0001) this.currentOrder = this.targetOrder;
    }

    // Auto-rotation resume logic after user interaction idle timeout
    if (!this.isInteracting && this.autoRotateEnabled) {
      if (performance.now() - this.lastInteractionTime > 3000) {
        this.controls.autoRotate = true;
      }
    }

    this.controls.update();

    // Rotate starfield backdrop slightly for spatial presence
    if (this.starField) {
      this.starField.rotation.y = this.time * 0.015;
    }

    // Rotate Earth clouds independently
    if (this.earthClouds) {
      this.earthClouds.rotation.y += dt * 0.08;
    }

    // Dynamic proton quarks oscillation
    if (this.q1 && this.q2 && this.q3) {
      this.q1.position.x = 2.6 + Math.sin(this.time * 6) * 0.3;
      this.q2.position.x = -2.6 + Math.cos(this.time * 6) * 0.3;
      this.q3.position.y = -2.9 + Math.sin(this.time * 8) * 0.3;
    }

    // Quantum foam bubbling
    if (this.foamSpheres) {
      this.foamSpheres.forEach((sph, idx) => {
        const sc = 1.0 + Math.sin(this.time * 4 + idx) * 0.25;
        sph.scale.set(sc, sc, sc);
      });
    }

    // Black Hole Updates
    if (this.blackHoleState === 'active') {
      this.blackHoleGroup.visible = true;
      this.objectGroup.visible = false;
      this.updateBlackHole3D(dt);
    } else {
      this.blackHoleGroup.visible = false;
      this.objectGroup.visible = true;
      this.updateObjects3D(dt);
    }
  }

  updateBlackHole3D(dt) {
    const isPlanck = this.blackHoleMassType === 'planck';
    const hasDisk = !isPlanck && this.blackHoleAccretionMode === 'disk';

    let s = 1.0;
    if (this.blackHoleMassType === 'planck') s = 0.65;
    else if (this.blackHoleMassType === 'sun') s = 1.0;
    else if (this.blackHoleMassType === 'sgra') s = 1.35;

    this.bhShadowSphere.scale.set(s, s, s);
    this.bhPhotonRing.scale.set(s, s, s);

    this.bhDisk.visible = hasDisk;
    this.bhUpperArc.visible = hasDisk;
    this.bhLowerArc.visible = hasDisk;
    this.northJet.visible = hasDisk;
    this.southJet.visible = hasDisk;
    this.hawkingPoints.visible = isPlanck;

    if (hasDisk) {
      this.bhDisk.scale.set(s, s, s);
      this.bhDisk.rotation.z += dt * 0.9;
      this.northJet.scale.set(s, s, s);
      this.southJet.scale.set(s, s, s);

      // Relativistic Doppler Beaming
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      const angle = Math.abs(camDir.y);
      this.bhDiskMat.opacity = 0.72 + (1.0 - angle) * 0.26;
    }

    if (isPlanck && this.hawkingPoints) {
      const pos = this.hawkingPoints.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += (Math.random() - 0.5) * 0.45;
        pos[i + 1] += (Math.random() - 0.5) * 0.45;
        pos[i + 2] += (Math.random() - 0.5) * 0.45;
        const d = Math.hypot(pos[i], pos[i + 1], pos[i + 2]);
        if (d > 24 || d < 4) {
          pos[i] = (Math.random() - 0.5) * 8;
          pos[i + 1] = (Math.random() - 0.5) * 8;
          pos[i + 2] = (Math.random() - 0.5) * 8;
        }
      }
      this.hawkingPoints.geometry.attributes.position.needsUpdate = true;
    }

    this.overlayRingsGroup.visible = this.showGeometryOverlay;
    if (this.showGeometryOverlay) {
      this.overlayRingsGroup.scale.set(s, s, s);
    }
  }

  updateObjects3D(dt) {
    const curOrder = this.currentOrder;

    for (const key in this.proceduralMeshes) {
      this.proceduralMeshes[key].visible = false;
    }

    let targetMeshKey = null;

    if (curOrder >= 23.5) targetMeshKey = 'observable_universe';
    else if (curOrder >= 17.5) targetMeshKey = 'milky_way';
    else if (curOrder >= 11.5) targetMeshKey = 'solar_system';
    else if (curOrder >= 7.5) targetMeshKey = 'sun';
    else if (curOrder >= 3.5) targetMeshKey = 'earth';
    else if (curOrder >= -1.5) targetMeshKey = 'human';
    else if (curOrder >= -6.5) targetMeshKey = 'cell';
    else if (curOrder >= -9.0) targetMeshKey = 'dna';
    else if (curOrder >= -12.0) targetMeshKey = 'hydrogen_atom';
    else if (curOrder >= -16.0) targetMeshKey = 'proton';
    else if (curOrder >= -26.0) targetMeshKey = 'quark_point';
    else targetMeshKey = 'quantum_foam';

    if (targetMeshKey && this.proceduralMeshes[targetMeshKey]) {
      const activeMesh = this.proceduralMeshes[targetMeshKey];
      activeMesh.visible = true;

      // Gentle spatial rotation for natural physical depth
      activeMesh.rotation.y += dt * 0.38;
      if (activeMesh.rotation.x !== undefined) activeMesh.rotation.x += dt * 0.12;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  resetCamera() {
    this.camera.position.set(32, 22, 50);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  triggerBlackHoleCollapse() {
    this.blackHoleState = 'active';
    this.blackHoleGroup.visible = true;
    this.objectGroup.visible = false;
    this.resetCamera();
  }

  triggerBlackHoleEvaporation() {
    this.blackHoleState = 'inactive';
    this.blackHoleGroup.visible = false;
    this.objectGroup.visible = true;
    this.resetCamera();
  }
}
