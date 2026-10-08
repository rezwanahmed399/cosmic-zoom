import { COSMIC_OBJECTS, SCALE_DOMAINS, SCALE_COMPARISONS, SCALE_QUIZ_QUESTIONS } from './science-data.js';

const BENGALI_REGEX = /[\u0980-\u09FF]/;

let failures = [];

// 1. Check all COSMIC_OBJECTS English properties
COSMIC_OBJECTS.forEach(obj => {
  if (BENGALI_REGEX.test(obj.nameEn)) failures.push(`COSMIC_OBJECT ${obj.id} nameEn has Bengali: ${obj.nameEn}`);
  if (BENGALI_REGEX.test(obj.sizeFormatted)) failures.push(`COSMIC_OBJECT ${obj.id} sizeFormatted has Bengali: ${obj.sizeFormatted}`);
  if (BENGALI_REGEX.test(obj.summaryEn)) failures.push(`COSMIC_OBJECT ${obj.id} summaryEn has Bengali: ${obj.summaryEn}`);
  if (BENGALI_REGEX.test(obj.truthBadgeEn)) failures.push(`COSMIC_OBJECT ${obj.id} truthBadgeEn has Bengali: ${obj.truthBadgeEn}`);
  if (BENGALI_REGEX.test(obj.dominantForceEn)) failures.push(`COSMIC_OBJECT ${obj.id} dominantForceEn has Bengali: ${obj.dominantForceEn}`);
  if (BENGALI_REGEX.test(obj.instrumentEn)) failures.push(`COSMIC_OBJECT ${obj.id} instrumentEn has Bengali: ${obj.instrumentEn}`);
  if (obj.factEn && BENGALI_REGEX.test(obj.factEn)) failures.push(`COSMIC_OBJECT ${obj.id} factEn has Bengali: ${obj.factEn}`);
  if (obj.blackHoleRadiusEn && BENGALI_REGEX.test(obj.blackHoleRadiusEn)) failures.push(`COSMIC_OBJECT ${obj.id} blackHoleRadiusEn has Bengali: ${obj.blackHoleRadiusEn}`);

  if (obj.humanTransitEn) {
    if (BENGALI_REGEX.test(obj.humanTransitEn.walk)) failures.push(`COSMIC_OBJECT ${obj.id} humanTransitEn.walk has Bengali: ${obj.humanTransitEn.walk}`);
    if (BENGALI_REGEX.test(obj.humanTransitEn.jet)) failures.push(`COSMIC_OBJECT ${obj.id} humanTransitEn.jet has Bengali: ${obj.humanTransitEn.jet}`);
    if (BENGALI_REGEX.test(obj.humanTransitEn.voyager)) failures.push(`COSMIC_OBJECT ${obj.id} humanTransitEn.voyager has Bengali: ${obj.humanTransitEn.voyager}`);
  } else {
    failures.push(`COSMIC_OBJECT ${obj.id} missing humanTransitEn!`);
  }

  if (obj.misconception) {
    if (!obj.misconception.titleEn) failures.push(`COSMIC_OBJECT ${obj.id} misconception missing titleEn!`);
    else if (BENGALI_REGEX.test(obj.misconception.titleEn)) failures.push(`COSMIC_OBJECT ${obj.id} misconception.titleEn has Bengali: ${obj.misconception.titleEn}`);

    if (!obj.misconception.realityEn) failures.push(`COSMIC_OBJECT ${obj.id} misconception missing realityEn!`);
    else if (BENGALI_REGEX.test(obj.misconception.realityEn)) failures.push(`COSMIC_OBJECT ${obj.id} misconception.realityEn has Bengali: ${obj.misconception.realityEn}`);
  }
});

// 2. Check SCALE_DOMAINS
SCALE_DOMAINS.forEach(d => {
  if (BENGALI_REGEX.test(d.nameEn)) failures.push(`SCALE_DOMAIN ${d.id} nameEn has Bengali: ${d.nameEn}`);
});

// 3. Check SCALE_COMPARISONS
SCALE_COMPARISONS.forEach(c => {
  if (BENGALI_REGEX.test(c.descEn)) failures.push(`SCALE_COMPARISON descEn has Bengali: ${c.descEn}`);
  if (BENGALI_REGEX.test(c.ratio)) failures.push(`SCALE_COMPARISON ratio has Bengali: ${c.ratio}`);
});

// 4. Check SCALE_QUIZ_QUESTIONS
SCALE_QUIZ_QUESTIONS.forEach((q, idx) => {
  if (BENGALI_REGEX.test(q.questionEn)) failures.push(`QUIZ Q${idx} questionEn has Bengali: ${q.questionEn}`);
  if (!q.optionsEn) failures.push(`QUIZ Q${idx} missing optionsEn!`);
  else {
    q.optionsEn.forEach((opt, oIdx) => {
      if (BENGALI_REGEX.test(opt)) failures.push(`QUIZ Q${idx} option ${oIdx} has Bengali: ${opt}`);
    });
  }
  if (!q.explanationEn) failures.push(`QUIZ Q${idx} missing explanationEn!`);
  else if (BENGALI_REGEX.test(q.explanationEn)) failures.push(`QUIZ Q${idx} explanationEn has Bengali: ${q.explanationEn}`);
});

if (failures.length > 0) {
  console.error(`Found ${failures.length} Bengali characters in English data:`);
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log('Zero Bengali Check Passed! 100% pure English verified across all science datasets.');
  process.exit(0);
}
