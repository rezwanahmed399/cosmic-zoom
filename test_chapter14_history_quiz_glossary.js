/**
 * Unit & Integration Test Suite for Chapter 14: "ইতিহাস, Myth vs Fact, কুইজ ও শব্দকোষ"
 *
 * Verifies:
 * 1. Historical Timeline:
 *    - Exactly 11 milestones from 1964 Gell-Mann/Zweig to 2025 Toponium (CMS/ATLAS).
 * 2. Myth vs Fact:
 *    - Exactly 13 misconception-debunking cards with physical proofs & citations.
 * 3. Quiz Lab:
 *    - Multi-chapter questions with answer keys, explanations, and citations.
 * 4. Bilingual Glossary:
 *    - Comprehensive terms (Bengali + English) with concise definitions and categories.
 * 5. Chapter routing integrity in CHAPTER_LIST.
 * 6. Zero unicode emojis across files.
 */

import assert from 'assert';
import fs from 'fs';
import {
  getQuarkHistoryTimeline,
  getMythsVsFactsData,
  getQuarkQuizData,
  getQuarkGlossaryData
} from './data/quark-facts.js';
import { CHAPTER_LIST } from './quark/quark-app.js';

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${description}`);
    console.error(err);
    failed++;
  }
}

console.log('--- Testing Chapter 14: History, Myths vs Facts, Quiz & Glossary ---');

// 1. TIMELINE INTEGRITY (11 MILESTONES)
it('Timeline contains exactly 11 historical milestones (1964 to 2025)', () => {
  const data = getQuarkHistoryTimeline();
  assert(data, 'Timeline data must be defined');
  assert.strictEqual(data.milestones.length, 11, 'Must have exactly 11 milestones');

  const years = data.milestones.map(m => String(m.year));
  assert(years.includes('1964'), '1964 Gell-Mann & Zweig must exist');
  assert(years.some(y => y.includes('1964') && y.includes('65')), '1964-65 Color charge must exist');
  assert(years.some(y => y.includes('1968') && y.includes('69')), '1968-69 SLAC DIS must exist');
  assert(years.includes('1973'), '1973 Asymptotic Freedom must exist');
  assert(years.includes('1974'), '1974 J/psi Charm must exist');
  assert(years.includes('1977'), '1977 Upsilon Bottom must exist');
  assert(years.includes('1979'), '1979 Gluon PETRA must exist');
  assert(years.includes('1995'), '1995 Top Quark Fermilab must exist');
  assert(years.includes('2005'), '2005 String Breaking Bali et al must exist');
  assert(years.includes('2015'), '2015 Pentaquark LHCb must exist');
  assert(years.includes('2025'), '2025 Toponium CMS/ATLAS must exist');
});

// 2. MYTH VS FACT (13 CARDS)
it('Myths vs Facts contains exactly 13 misconceptions debunked with evidence', () => {
  const data = getMythsVsFactsData();
  assert(data, 'Myths data must be defined');
  const myths = Array.isArray(data) ? data : data.myths;
  assert.strictEqual(myths.length, 13, 'Must have exactly 13 myths');

  // Verify all 13 myth ids myth_01 .. myth_13
  for (let i = 1; i <= 13; i++) {
    const id = `myth_${String(i).padStart(2, '0')}`;
    assert(myths.some(m => m.id === id), `Myth ${id} must exist`);
  }

  // Verify each myth contains misconceptionBn, realityBn, explanationBn, and proofCitation
  myths.forEach(m => {
    assert(m.misconceptionBn && m.misconceptionBn.length > 5, `Myth ${m.id} must have misconception description`);
    assert(m.realityBn && m.realityBn.length > 5, `Fact ${m.id} must have reality description`);
    assert(m.explanationBn && m.explanationBn.length > 10, `Explanation ${m.id} must have details`);
    assert(m.proofCitation && m.proofCitation.length > 3, `Proof citation ${m.id} must exist`);
  });
});

// 3. QUIZ LAB INTEGRITY
it('Quiz data contains questions with answer keys, explanations and citations', () => {
  const quiz = getQuarkQuizData();
  assert(quiz, 'Quiz data must be defined');
  assert(quiz.questions.length >= 10, 'Quiz must have sufficient questions across chapters');

  quiz.questions.forEach(q => {
    assert(q.id, 'Question must have id');
    assert(q.questionBn, 'Question must have Bengali text');
    assert(Array.isArray(q.options) && q.options.length >= 3, 'Question must have at least 3 options');
    assert(q.options.some(opt => opt.isCorrect === true), `Question ${q.id} must have a correct option`);
    assert(q.explanationBn, 'Question must have explanation');
    assert(q.citation, 'Question must have scientific citation');
  });
});

// 4. BILINGUAL GLOSSARY (A-Z)
it('Glossary contains rich bilingual terms with concise definitions and categories', () => {
  const glossary = getQuarkGlossaryData();
  assert(glossary, 'Glossary data must be defined');
  assert(glossary.terms.length >= 20, 'Glossary must have at least 20 terms');

  const termsEn = glossary.terms.map(t => t.termEn.toLowerCase());
  assert(termsEn.some(t => t.includes('confinement')), 'Must include Confinement');
  assert(termsEn.some(t => t.includes('asymptotic freedom')), 'Must include Asymptotic Freedom');
  assert(termsEn.some(t => t.includes('gluon')), 'Must include Gluon');
  assert(termsEn.some(t => t.includes('quark-gluon plasma')), 'Must include Quark-Gluon Plasma');
  assert(termsEn.some(t => t.includes('string breaking')), 'Must include String Breaking');
});

// 5. CHAPTER ROUTING INTEGRITY
it('Chapter 14 is registered in CHAPTER_LIST with valid hash', () => {
  const ch14 = CHAPTER_LIST.find(c => c.id === 'chapter-14');
  assert(ch14, 'Chapter 14 must exist in CHAPTER_LIST');
  assert.strictEqual(ch14.hash, '#/quarks/chapter-14');
  assert.strictEqual(ch14.isAvailable, true);
  assert.strictEqual(ch14.titleBn, 'ইতিহাস, Myth vs Fact ও শব্দকোষ');
});

// 6. ZERO EMOJI IN CODE
it('Zero unicode emojis in Chapter 14 files', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/u;
  const content = fs.readFileSync('quark/chapter-14.js', 'utf8');
  const matches = content.match(new RegExp(emojiRegex, 'gu'));
  assert(!matches || matches.length === 0, `Found emojis in quark/chapter-14.js: ${matches}`);
});

console.log(`\nChapter 14 Test Suite Summary: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
