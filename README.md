# Cosmic Zoom | The Cosmic to Planck Scale Journey

An interactive, scientifically rigorous web application exploring the universe across **62 orders of magnitude** — from the boundary of the **Observable Universe ($10^{27}\text{ m}$)** down to the fundamental **Planck Length ($10^{-35}\text{ m}$)**.

Built with Vanilla JavaScript, HTML5 Canvas, Web Audio API, and pure SVG iconography.

---

## Key Features

1. **High-Performance 2D Canvas Engine**
   - Pure HTML5 2D Canvas rendering with buttery smooth 60/120fps procedural generation.
   - Cinematic relativistic rendering: gravitational lensing, accretion disk with Doppler beaming, and quantum foam.

2. **Continuous 62 Orders of Magnitude Zoom Engine**
   - Seamless logarithmic camera transitions spanning from $+27.0$ down to $-35.0$.
   - Frame-rate independent exponential smoothing damping ($\lambda = 1 - e^{-k \cdot \Delta t}$) supporting 60Hz, 120Hz, and variable refresh rate screens.
   - Deep URL hash linking (`#s=27.0` to `#s=-35.0`) for sharing exact scale positions.

3. **38 Scientifically Grounded Landmark Objects**
   - Detailed astronomical, planetary, biological, atomic, and quantum landmark objects.
   - Exact scientific metrics: physical sizes, comoving distances, light-transit times, and observation instrument ladder tags.
   - Explicit distinction between physical measurement (STM, spectroscopy) and theoretical quantum probability clouds ($|\psi|^2$).
   - Particle physics "desert" scales represented as energy-equivalent probing distances ($\lambda = \hbar c / E$) in GeV.

4. **Governing Force of Structure Panel**
   - Real-time HUD tracking the fundamental physical force governing stability at each scale:
     - **Gravity & Dark Energy** ($10^{27}$ to $10^{11}\text{ m}$)
     - **Electromagnetism** ($10^{10}$ to $10^{-13}\text{ m}$, binding planets, mountains, human bodies, cells, molecules, and atoms)
     - **Strong Nuclear Force** ($10^{-14}$ to $10^{-18}\text{ m}$, binding hadrons and nucleons)
     - **Weak & Electroweak Unification** ($10^{-18}$ to $10^{-27}\text{ m}$)
     - **Quantum Gravity / Planck Scale** ($10^{-28}$ to $10^{-35}\text{ m}$)

5. **Schwarzschild Black Hole Simulation (General Relativity)**
   - Dynamic gravitational collapse trigger on the active landmark object's mass (e.g., Sun, Earth, Human body, Planck mass).
   - Exact Schwarzschild concentric geometry:
     - Event Horizon ($r_s = 2GM/c^2 = 1.0 \, r_s$)
     - Photon Sphere / Photon Ring ($r_{\text{ph}} = 1.5 \, r_s$)
     - Apparent Gravitational Shadow ($r_{\text{shadow}} \approx 2.6 \, r_s$)
     - Innermost Stable Circular Orbit (ISCO = $3.0 \, r_s$)
   - Live Accretion Mode Toggle: switch between gas accretion with relativistic Doppler beaming & polar jets, and pure vacuum gravitational lensing.
   - Real-time Hawking thermodynamics telemetry: Hawking Temperature ($T_H$) and evaporation lifespan ($t_{\text{evap}}$) with time-lapse transparency.

6. **Procedural Multi-Layer Ambient Canvas Engine**
   - Custom rendering per scale: cosmic web filaments, galactic spirals, starfields, planetary surfaces, cell membranes, DNA double helixes, quantum probability clouds, and Planck quantum foam.
   - Planck Wall barrier with visual quantum jitter and auditory vacuum fluctuation hum.

7. **Generative Web Audio Synthesizer**
   - Procedural soundscapes with sub-bass cosmic drones, harmonic mid-frequency pads, and high-frequency quantum vacuum noise.
   - Safe dual-stage limiter: Web Audio DynamicsCompressor paired with post-compressor safety gain ceiling ($0.35$).
   - Audible harmonics included for full fidelity on mobile phone and laptop speakers.

8. **Accessibility & Design System**
   - Zero emojis policy: 100% custom SVG vector icons.
   - Full support for `prefers-reduced-motion` (WCAG 2.3.1 compliance).
   - Live screen reader announcements (`aria-live="polite"`).
   - Bilingual support: Complete Bengali and English localization.

---

## Controls & Navigation

- **Zoom In / Out:** Mouse Wheel, Trackpad pinch, or On-screen Slider.
- **Milestone Quick Jump:** Click any icon along the bottom milestone bar.
- **Search:** Search icon in header or shortcut to open full indexed object search.
- **Scale Comparator:** Side-by-side comparative visualization tool.
- **Quiz Challenge:** Interactive scale knowledge challenge mode.
- **Keyboard Shortcuts:**
  - `Arrow Up` / `Page Up` / `-`: Zoom out towards Cosmic scale
  - `Arrow Down` / `Page Down` / `+`: Zoom in towards Planck scale
  - `0`: Reset to Human scale ($10^0\text{ m}$)
  - `B`: Trigger Gravitational Collapse on current object / toggle black hole
  - `O`: Toggle Schwarzschild 3-ring educational geometry overlay
  - `H`: Toggle Black Hole data telemetry card visibility
  - `X`: Trigger Hawking Evaporation and restore space
  - `Space`: Toggle automated scale cruise tour
  - `Escape`: Close dialogue modals

---

## Local Development

Run locally using Node.js:

```bash
# Clone the repository
git clone https://github.com/rezwanahmed399/cosmic-zoom.git

# Enter project directory
cd cosmic-zoom

# Start local server
npm start
```

Open `http://localhost:5173` in any modern web browser.

---

## Test Suite

Verify ESM modules, SVG icon integrity, and zero emoji invariant:

```bash
npm test
```

---

## License

MIT License. Developed for advanced scientific education and interactive physics exploration.
