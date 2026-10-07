/**
 * COSMIC TO PLANCK 3D RENDER ENGINE (WebGL / Three.js)
 * Full 360-degree interactive spatial exploration:
 * - Three.js WebGLRenderer with logarithmicDepthBuffer
 * - 360-degree camera orbital navigation (mouse drag / touch)
 * - Continuous nested scale-proportional 3D physical objects across all 62 orders
 * - True 3D Schwarzschild relativistic black hole with dynamic lensed arcs
 * - Zero external build requirements (Native browser ES Modules)
 */

import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/jsm/controls/OrbitControls.js';
import { COSMIC_OBJECTS } from './science-data.js';

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

    // Animation Clock
    this.clock = new THREE.Clock();
    this.time = 0;

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
    this.scene.fog = new THREE.FogExp2(0x03030c, 0.003);

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
    this.renderer.toneMappingExposure = 1.25;

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
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.05, 50000);
    this.camera.position.set(0, 18, 55);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false; // Mouse wheel / pinch is reserved for 62 orders of magnitude cosmic scale navigation
    this.controls.minDistance = 6;
    this.controls.maxDistance = 250;
    this.controls.enablePan = true;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.6;
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.3);
    dirLight1.position.set(50, 70, 50);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc084fc, 0.9);
    dirLight2.position.set(-50, -30, -50);
    this.scene.add(dirLight2);

    this.corePointLight = new THREE.PointLight(0xffffff, 1.5, 300);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);
  }

  initBackgroundEnvironment() {
    // 1. 3D Starfield particles (800 stars)
    const starCount = 800;
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
      const r = Math.cbrt(Math.random()) * 800 + 150;

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
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.starField = new THREE.Points(starGeo, starMat);
    this.backgroundGroup.add(this.starField);

    // 2. Cosmic Web Filaments (Line segments in deep 3D volume)
    const filamentGeo = new THREE.BufferGeometry();
    const filamentPos = [];
    for (let i = 0; i < 70; i++) {
      const p1 = new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
      const p2 = p1.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120
      ));
      filamentPos.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    filamentGeo.setAttribute('position', new THREE.Float32BufferAttribute(filamentPos, 3));
    const filamentMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.22
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
    const photonRingGeo = new THREE.TorusGeometry(6.25, 0.08, 16, 100);
    const photonRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.bhPhotonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    this.bhPhotonRing.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.bhPhotonRing);

    // 3. Relativistic Accretion Disk (Inclined 3D Mesh with Doppler Beaming)
    const diskGeo = new THREE.RingGeometry(7.2, 18.0, 80, 8);
    this.bhDiskMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });
    this.bhDisk = new THREE.Mesh(diskGeo, this.bhDiskMat);
    this.bhDisk.rotation.x = Math.PI / 2.3; // Realistic oblique orbital inclination
    this.blackHoleGroup.add(this.bhDisk);

    // 4. Lensed Arcs (Upper & Lower bent light arcs)
    const upperArcGeo = new THREE.TorusGeometry(8.5, 1.2, 24, 80, Math.PI);
    const upperArcMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85
    });
    this.bhUpperArc = new THREE.Mesh(upperArcGeo, upperArcMat);
    this.bhUpperArc.rotation.x = 0;
    this.blackHoleGroup.add(this.bhUpperArc);

    const lowerArcGeo = new THREE.TorusGeometry(7.6, 0.9, 24, 80, Math.PI);
    const lowerArcMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.7
    });
    this.bhLowerArc = new THREE.Mesh(lowerArcGeo, lowerArcMat);
    this.bhLowerArc.rotation.x = Math.PI;
    this.blackHoleGroup.add(this.bhLowerArc);

    // 5. Relativistic Polar Jets (North & South cones starting outside shadow)
    const jetGeo = new THREE.ConeGeometry(2.4, 38, 24, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    this.northJet = new THREE.Mesh(jetGeo, jetMat);
    this.northJet.position.y = 25.5; // Starts strictly above the shadow
    this.northJet.rotation.x = Math.PI;
    this.blackHoleGroup.add(this.northJet);

    this.southJet = new THREE.Mesh(jetGeo, jetMat);
    this.southJet.position.y = -25.5; // Starts strictly below the shadow
    this.blackHoleGroup.add(this.southJet);

    // 6. 3D Educational 3-Ring Geometry Overlay
    this.overlayRingsGroup = new THREE.Group();
    this.overlayRingsGroup.renderOrder = 999;
    
    // Ring 1: Event Horizon (1.0 rs) -> Cyan
    const ehGeo = new THREE.TorusGeometry(2.4, 0.12, 16, 100);
    const ehMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false, transparent: true, opacity: 0.95 });
    const ehRing = new THREE.Mesh(ehGeo, ehMat);
    ehRing.renderOrder = 999;
    ehRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(ehRing);

    // Ring 2: Photon Sphere (1.5 rs) -> Yellow
    const psGeo = new THREE.TorusGeometry(3.6, 0.12, 16, 100);
    const psMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, depthTest: false, transparent: true, opacity: 0.95 });
    const psRing = new THREE.Mesh(psGeo, psMat);
    psRing.renderOrder = 999;
    psRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(psRing);

    // Ring 3: Apparent Shadow Edge (~2.6 rs) -> Magenta
    const shGeo = new THREE.TorusGeometry(6.25, 0.14, 16, 100);
    const shMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, depthTest: false, transparent: true, opacity: 0.95 });
    const shRing = new THREE.Mesh(shGeo, shMat);
    shRing.renderOrder = 999;
    shRing.rotation.x = Math.PI / 2;
    this.overlayRingsGroup.add(shRing);

    this.overlayRingsGroup.visible = false;
    this.blackHoleGroup.add(this.overlayRingsGroup);

    // 7. 3D Hawking Radiation Particle Swarm (for Planck mode)
    const hawkingCount = 60;
    const hawkingGeo = new THREE.BufferGeometry();
    const hawkingPos = new Float32Array(hawkingCount * 3);
    for (let i = 0; i < hawkingCount * 3; i++) {
      hawkingPos[i] = (Math.random() - 0.5) * 20;
    }
    hawkingGeo.setAttribute('position', new THREE.BufferAttribute(hawkingPos, 3));
    const hawkingMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 1.8,
      transparent: true,
      opacity: 0.8
    });
    this.hawkingPoints = new THREE.Points(hawkingGeo, hawkingMat);
    this.blackHoleGroup.add(this.hawkingPoints);
  }

  initProceduralObjects3D() {
    this.proceduralMeshes = {};

    // 1. Observable Universe (3D Luminous Sphere with Cosmic Filaments)
    const universeGeo = new THREE.SphereGeometry(15, 32, 32);
    const universeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const universeMesh = new THREE.Mesh(universeGeo, universeMat);
    this.proceduralMeshes['observable_universe'] = universeMesh;

    // 2. Milky Way Galaxy (3D Particle Spiral Galaxy with dual arms & core)
    const galaxyParticles = 1200;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyParticles * 3);
    const galaxyColors = new Float32Array(galaxyParticles * 3);
    const colCore = new THREE.Color(0xfef08a);
    const colArm = new THREE.Color(0x38bdf8);

    for (let i = 0; i < galaxyParticles; i++) {
      const r = Math.pow(Math.random(), 0.6) * 16;
      const armIndex = i % 2;
      const angle = (r * 0.45) + (armIndex * Math.PI) + (Math.random() - 0.5) * 0.6;
      const spreadY = (Math.random() - 0.5) * (3.0 / (r * 0.2 + 1));

      galaxyPos[i * 3] = Math.cos(angle) * r;
      galaxyPos[i * 3 + 1] = spreadY;
      galaxyPos[i * 3 + 2] = Math.sin(angle) * r;

      const mix = Math.min(1.0, r / 12);
      const c = colCore.clone().lerp(colArm, mix);
      galaxyColors[i * 3] = c.r;
      galaxyColors[i * 3 + 1] = c.g;
      galaxyColors[i * 3 + 2] = c.b;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    const galaxyMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.85 });
    const galaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
    this.proceduralMeshes['milky_way'] = galaxyMesh;

    // 3. Solar System (Sun + Concentric Planetary Orbits with Planet Spheres)
    const solarSystemGroup = new THREE.Group();
    const centralSunGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const centralSunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8
    });
    solarSystemGroup.add(new THREE.Mesh(centralSunGeo, centralSunMat));

    const planetData = [
      { r: 6.5, size: 0.45, color: 0x94a3b8 }, // Mercury
      { r: 9.0, size: 0.7, color: 0xfbbf24 },  // Venus
      { r: 12.0, size: 0.8, color: 0x38bdf8 }, // Earth
      { r: 15.0, size: 0.55, color: 0xef4444 }, // Mars
      { r: 19.0, size: 1.6, color: 0xd97706 }  // Jupiter
    ];

    planetData.forEach((p, idx) => {
      // Orbit Ring
      const orbitGeo = new THREE.RingGeometry(p.r - 0.05, p.r + 0.05, 64);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      solarSystemGroup.add(orbitMesh);

      // Planet Sphere
      const plGeo = new THREE.SphereGeometry(p.size, 16, 16);
      const plMat = new THREE.MeshStandardMaterial({ color: p.color });
      const plMesh = new THREE.Mesh(plGeo, plMat);
      const a = idx * 1.3;
      plMesh.position.set(Math.cos(a) * p.r, 0, Math.sin(a) * p.r);
      solarSystemGroup.add(plMesh);
    });
    this.proceduralMeshes['solar_system'] = solarSystemGroup;

    // 4. Sun (3D Glowing Plasma Sphere)
    const sunGeo = new THREE.SphereGeometry(10, 48, 48);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.4
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.proceduralMeshes['sun'] = sunMesh;

    // 5. Earth (3D Blue Marble Sphere)
    const earthGeo = new THREE.SphereGeometry(8.5, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.6,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.proceduralMeshes['earth'] = earthMesh;

    // 6. Mountain / Geo Peak (Low-poly wireframe mountain peak)
    const mountainGeo = new THREE.ConeGeometry(9.0, 14.0, 8, 4);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      wireframe: true,
      roughness: 0.8
    });
    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.y = -3;
    this.proceduralMeshes['mountain'] = mountainMesh;

    // 7. Human Figure (Stylized modernist geometric silhouette)
    const humanGroup = new THREE.Group();
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    head.position.y = 8.5;
    humanGroup.add(head);
    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 7.0, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    torso.position.y = 3.5;
    humanGroup.add(torso);
    // Arms
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 7.0, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    armL.position.set(-3.2, 4.0, 0);
    armL.rotation.z = Math.PI / 4;
    humanGroup.add(armL);
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 7.0, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    armR.position.set(3.2, 4.0, 0);
    armR.rotation.z = -Math.PI / 4;
    humanGroup.add(armR);
    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 8.0, 12), new THREE.MeshStandardMaterial({ color: 0x0369a1 }));
    legL.position.set(-1.2, -4.0, 0);
    humanGroup.add(legL);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 8.0, 12), new THREE.MeshStandardMaterial({ color: 0x0369a1 }));
    legR.position.set(1.2, -4.0, 0);
    humanGroup.add(legR);
    this.proceduralMeshes['human'] = humanGroup;

    // 8. Biological Cell (Semi-transparent membrane + nucleus + organelles)
    const cellGroup = new THREE.Group();
    const cellMembraneGeo = new THREE.SphereGeometry(8.0, 32, 32);
    const cellMembraneMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      roughness: 0.3
    });
    cellGroup.add(new THREE.Mesh(cellMembraneGeo, cellMembraneMat));

    const cellNucleusGeo = new THREE.SphereGeometry(3.2, 24, 24);
    const cellNucleusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.5
    });
    cellGroup.add(new THREE.Mesh(cellNucleusGeo, cellNucleusMat));

    // Organelles (mitochondria)
    for (let i = 0; i < 5; i++) {
      const orgGeo = new THREE.CapsuleGeometry(0.6, 1.4, 8, 12);
      const orgMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const orgMesh = new THREE.Mesh(orgGeo, orgMat);
      const a = (i / 5) * Math.PI * 2;
      orgMesh.position.set(Math.cos(a) * 5.2, (Math.random() - 0.5) * 3, Math.sin(a) * 5.2);
      orgMesh.rotation.set(Math.random(), Math.random(), Math.random());
      cellGroup.add(orgMesh);
    }
    this.proceduralMeshes['cell'] = cellGroup;

    // 9. DNA (3D Double Helix Mesh)
    const dnaGroup = new THREE.Group();
    const helixCurve1Points = [];
    const helixCurve2Points = [];
    for (let t = 0; t < 30; t++) {
      const a = (t / 30) * Math.PI * 4;
      const y = (t - 15) * 1.0;
      const x1 = Math.cos(a) * 4;
      const z1 = Math.sin(a) * 4;
      const x2 = Math.cos(a + Math.PI) * 4;
      const z2 = Math.sin(a + Math.PI) * 4;
      helixCurve1Points.push(new THREE.Vector3(x1, y, z1));
      helixCurve2Points.push(new THREE.Vector3(x2, y, z2));

      // Base pair connector rung
      if (t % 2 === 0) {
        const rungGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
        const rungMat = new THREE.MeshBasicMaterial({ color: t % 4 === 0 ? 0xef4444 : 0x10b981 });
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

    // 10. Hydrogen Atom (3D Proton Core + Volumetric Electron Cloud)
    const atomGroup = new THREE.Group();
    const nucleusGeo = new THREE.SphereGeometry(1.4, 24, 24);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    atomGroup.add(nucleus);

    const cloudCount = 600;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.pow(Math.random(), 1.5) * 11 + 2.0;

      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      cloudPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cloudPos[i * 3 + 2] = r * Math.cos(phi);
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    const cloudMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.9, transparent: true, opacity: 0.55 });
    const cloud = new THREE.Points(cloudGeo, cloudMat);
    atomGroup.add(cloud);
    this.proceduralMeshes['hydrogen_atom'] = atomGroup;

    // 11. Proton & Quarks (3D Quark Triplet with Gluon flux cage)
    const protonGroup = new THREE.Group();
    const quarkGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const uQuarkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const dQuarkMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const q1 = new THREE.Mesh(quarkGeo, uQuarkMat); q1.position.set(2.5, 1.5, 0); protonGroup.add(q1);
    const q2 = new THREE.Mesh(quarkGeo, uQuarkMat); q2.position.set(-2.5, 1.5, 0); protonGroup.add(q2);
    const q3 = new THREE.Mesh(quarkGeo, dQuarkMat); q3.position.set(0, -2.8, 0); protonGroup.add(q3);

    const gluonCageGeo = new THREE.IcosahedronGeometry(5.2, 1);
    const gluonCageMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.4 });
    const gluonCage = new THREE.Mesh(gluonCageGeo, gluonCageMat);
    protonGroup.add(gluonCage);
    this.proceduralMeshes['proton'] = protonGroup;

    // 12. Elementary Quark Point-like Quantum Wave Packet
    const quarkPointGroup = new THREE.Group();
    const corePointGeo = new THREE.SphereGeometry(1.8, 24, 24);
    const corePointMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      wireframe: true
    });
    quarkPointGroup.add(new THREE.Mesh(corePointGeo, corePointMat));
    const waveRingGeo = new THREE.TorusGeometry(3.8, 0.1, 16, 64);
    const waveRingMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.7 });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    quarkPointGroup.add(waveRing);
    this.proceduralMeshes['quark_point'] = quarkPointGroup;

    // 13. Quantum Foam (3D Topological Mesh)
    const foamGroup = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const fGeo = new THREE.SphereGeometry(Math.random() * 2.2 + 0.8, 12, 12);
      const fMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: true, transparent: true, opacity: 0.45 });
      const fSphere = new THREE.Mesh(fGeo, fMat);
      fSphere.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
      foamGroup.add(fSphere);
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

  update(dt) {
    this.time += dt;

    // Smooth inertia camera interpolation (only if not locked in black hole)
    if (this.blackHoleState === 'inactive' || this.blackHoleState === 'charging') {
      const diff = this.targetOrder - this.currentOrder;
      const k = 8.5;
      const lambda = 1 - Math.exp(-k * Math.min(dt, 0.1));
      this.zoomVelocity = diff * lambda;
      this.currentOrder += this.zoomVelocity;
      if (Math.abs(diff) < 0.0001) this.currentOrder = this.targetOrder;
    }

    this.controls.update();

    // Rotate starfield backdrop slightly for spatial presence
    if (this.starField) {
      this.starField.rotation.y = this.time * 0.015;
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

    // Scale black hole components according to mass type
    let s = 1.0;
    if (this.blackHoleMassType === 'planck') s = 0.65;
    else if (this.blackHoleMassType === 'sun') s = 1.0;
    else if (this.blackHoleMassType === 'sgra') s = 1.35;

    this.bhShadowSphere.scale.set(s, s, s);
    this.bhPhotonRing.scale.set(s, s, s);

    // Toggle disk and jets visibility
    this.bhDisk.visible = hasDisk;
    this.bhUpperArc.visible = hasDisk;
    this.bhLowerArc.visible = hasDisk;
    this.northJet.visible = hasDisk;
    this.southJet.visible = hasDisk;
    this.hawkingPoints.visible = isPlanck;

    if (hasDisk) {
      this.bhDisk.scale.set(s, s, s);
      this.bhDisk.rotation.z += dt * 0.8; // Keplerian disk spin
      this.northJet.scale.set(s, s, s);
      this.southJet.scale.set(s, s, s);

      // Relativistic Doppler Beaming in 3D:
      // When camera orbits, the approaching side appears brighter
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      const angle = Math.abs(camDir.y);
      this.bhDiskMat.opacity = 0.7 + (1.0 - angle) * 0.28;
    }

    if (isPlanck && this.hawkingPoints) {
      // 3D isotropic Hawking radiation particles pulsating outward
      const pos = this.hawkingPoints.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += (Math.random() - 0.5) * 0.4;
        pos[i + 1] += (Math.random() - 0.5) * 0.4;
        pos[i + 2] += (Math.random() - 0.5) * 0.4;
        const d = Math.hypot(pos[i], pos[i + 1], pos[i + 2]);
        if (d > 22 || d < 4) {
          pos[i] = (Math.random() - 0.5) * 8;
          pos[i + 1] = (Math.random() - 0.5) * 8;
          pos[i + 2] = (Math.random() - 0.5) * 8;
        }
      }
      this.hawkingPoints.geometry.attributes.position.needsUpdate = true;
    }

    // Toggle 3D Educational Overlay Rings
    this.overlayRingsGroup.visible = this.showGeometryOverlay;
    if (this.showGeometryOverlay) {
      this.overlayRingsGroup.scale.set(s, s, s);
    }
  }

  updateObjects3D(dt) {
    const curOrder = this.currentOrder;

    // Determine which procedural 3D model matches current scale best
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

      // Gentle spatial rotation for liveliness
      activeMesh.rotation.y += dt * 0.35;
      if (activeMesh.rotation.x !== undefined) activeMesh.rotation.x += dt * 0.12;
    }
  }

  render() {
    const dt = this.clock.getDelta();
    this.update(dt);
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
    this.camera.position.set(0, 18, 55);
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
