import { COSMIC_OBJECTS, SCALE_DOMAINS, SCALE_COMPARISONS } from './science-data.js';
import { SVG_ICONS, getIcon } from './icons.js';
import { CosmicAudioEngine } from './audio-engine.js';
import { CosmicRenderEngine } from './render-engine.js';

console.log('Verification Success!');
console.log('Objects count:', COSMIC_OBJECTS.length);
console.log('Scale domains count:', SCALE_DOMAINS.length);
console.log('Comparisons count:', SCALE_COMPARISONS.length);
console.log('Icons count:', Object.keys(SVG_ICONS).length);
