import fs from 'fs';

const files = ['index.html', 'style.css', 'app.js', 'science-data.js', 'icons.js', 'audio-engine.js', 'render-engine.js', 'README.md', 'quark/chapter-0.js', 'quark/chapter-1.js', 'quark/chapter-2.js', 'quark/chapter-3.js', 'quark/chapter-4.js', 'quark/chapter-5.js', 'quark/chapter-6.js', 'quark/chapter-7.js', 'quark/quark-app.js', 'quark/quark-styles.css', 'data/quark-facts.js', 'physics/conservation-ledger.js', 'physics/fermat-torricelli.js', 'physics/hadron-lookup.js', 'physics/string-breaking.js', 'test_chapter0_scale_ladder.js', 'test_chapter2_flavor_lab.js', 'test_chapter3_color_lab.js', 'test_chapter4_flux_tube.js', 'test_chapter5_string_breaking.js', 'test_chapter6_hadron_builder.js', 'test_chapter7_mass_origin.js'];

// Comprehensive unicode emoji regex range
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;

let totalFound = 0;
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  if (matches && matches.length > 0) {
    console.log(`Found ${matches.length} emojis in ${f}:`, matches.join(' '));
    totalFound += matches.length;
  } else {
    console.log(`${f}: 0 emojis (Clean)`);
  }
});

console.log('Total emojis found:', totalFound);
process.exit(totalFound === 0 ? 0 : 1);
