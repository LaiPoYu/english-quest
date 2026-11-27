// Builds words/A1.js … words/C2.js — the Word Drill dictionary.
//
// Sources (download them into one folder, then run):
//   1. CEFR-J Vocabulary Profile 1.5 + Octanove Vocabulary Profile C1/C2 1.0
//      https://github.com/openlanguageprofiles/olp-en-cefrj   (CEFR levels)
//   2. ECDICT  https://github.com/skywind3000/ECDICT  (ecdict.csv: Chinese meanings + phonetics, MIT)
//   3. npm i opencc-js   (Simplified → Taiwan Traditional Chinese)
//
// Usage:  node tools/build-words.js <source-folder>
// Output: words/<LEVEL>.js, each setting window.EQ_WORDS[LEVEL] = [[word, pos, meaning, ipa], …]
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = process.argv[2];
if (!SRC) { console.error('usage: node tools/build-words.js <source-folder>'); process.exit(1); }
const OpenCC = require(require.resolve('opencc-js', { paths: [SRC, process.cwd()] }));
const toTW = OpenCC.Converter({ from: 'cn', to: 'twp' });

// --- tiny CSV parser (handles quotes and newlines inside quotes) ---
function parseCSV(text) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const POS_ZH = {
  noun: '名詞', verb: '動詞', adjective: '形容詞', adverb: '副詞', preposition: '介系詞', conjunction: '連接詞',
  pronoun: '代名詞', determiner: '限定詞', number: '數詞', interjection: '感嘆詞', 'modal verb': '助動詞',
  'be-verb': 'be 動詞', 'do-verb': '助動詞', 'have-verb': '助動詞', infinitive: '不定詞', 'infinitive-to': '不定詞',
};
// ECDICT line prefixes that match each CEFR part of speech
const POS_TAGS = {
  noun: ['n.'], verb: ['v.', 'vt.', 'vi.'], adjective: ['a.', 'adj.'], adverb: ['ad.', 'adv.'],
  preposition: ['prep.'], conjunction: ['conj.'], pronoun: ['pron.'], determiner: ['det.', 'a.', 'pron.', 'art.'],
  number: ['num.', 'n.', 'a.'], interjection: ['int.', 'interj.'], 'modal verb': ['aux.', 'v.', 'modal.'],
};

// --- 1. CEFR word list: lowest level per headword, all parts of speech ---
const entries = new Map(); // key -> {w, level, pos:Set}
function addList(file) {
  const rows = parseCSV(fs.readFileSync(path.join(SRC, file), 'utf8'));
  const head = rows.shift();
  const iW = head.indexOf('headword'), iP = head.indexOf('pos'), iL = head.indexOf('CEFR');
  for (const r of rows) {
    if (!r[iW]) continue;
    const w = r[iW].split('/')[0].trim();               // "a.m./A.M./am/AM" → "a.m."
    const level = (r[iL] || '').trim().toUpperCase();
    if (!LEVELS.includes(level) || !w) continue;
    const key = w.toLowerCase();
    const e = entries.get(key) || { w, level, pos: new Set() };
    if (LEVELS.indexOf(level) < LEVELS.indexOf(e.level)) e.level = level;
    if (r[iP]) e.pos.add(r[iP].trim().toLowerCase());
    entries.set(key, e);
  }
}
addList('olp-en-cefrj/cefrj-vocabulary-profile-1.5.csv');
addList('olp-en-cefrj/octanove-vocabulary-profile-c1c2-1.0.csv');

// --- 2. ECDICT lookup (only the words we need) ---
const need = new Set(entries.keys());
const dict = new Map();
{
  const rows = parseCSV(fs.readFileSync(path.join(SRC, 'ecdict.csv'), 'utf8'));
  const head = rows.shift();
  const iW = head.indexOf('word'), iPh = head.indexOf('phonetic'), iT = head.indexOf('translation');
  for (const r of rows) {
    const w = (r[iW] || '').trim();
    const key = w.toLowerCase();
    if (!need.has(key)) continue;
    // prefer the exact-case entry (e.g. "may" over "May")
    if (dict.has(key) && w !== key) continue;
    dict.set(key, { ph: r[iPh] || '', tr: (r[iT] || '').replace(/\\n/g, '\n') });
  }
}

// --- 3. clean a Chinese meaning ---
function pickMeaning(tr, posSet) {
  const lines = tr.split('\n').map(s => s.trim()).filter(s => s && !/^\[/.test(s)); // drop [网络] [医] …
  if (!lines.length) return '';
  const wanted = [...posSet].flatMap(p => POS_TAGS[p] || []);
  const tagOf = l => (l.match(/^([a-z]+\.)\s*/) || [])[1];
  let chosen = lines.filter(l => wanted.includes(tagOf(l)));
  if (!chosen.length) chosen = [lines[0]];
  const senses = [];
  for (const l of chosen.slice(0, 2)) {
    const body = l.replace(/^[a-z]+\.\s*/, '');
    for (let s of body.split(/[,，;；]\s*/)) {
      s = s.replace(/^(?:[a-z]+\.\s*)+/, '').replace(/<[^>]*>/g, '').replace(/\[[^\]]*\]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '').replace(/^[的地得]\s*/, '').trim();
      if (!s || /[a-zA-Z]{3,}/.test(s) || s.length > 12) continue;
      if (!senses.includes(s)) senses.push(s);
      if (senses.length >= 3) break;
    }
    if (senses.length >= 3) break;
  }
  return toTW(senses.join('、'));
}
// ECDICT uses an older ASCII-ish notation; convert it to standard (British) IPA.
function ipaOf(ph) {
  if (!ph) return '';
  let s = ph.split(/[;；]/)[0].trim();                       // first variant only
  s = s.replace(/'/g, 'ˈ').replace(/,/g, 'ˌ').replace(/^\.|(?<=[\s/])\./g, 'ˌ').replace(/\./g, 'ˌ')
    .replace(/ә/g, 'ə').replace(/:/g, 'ː').replace(/\^/g, 'ɡ').replace(/g/g, 'ɡ')
    .replace(/єə/g, 'eə').replace(/є/g, 'e').replace(/ɒː/g, 'ɔː')
    .replace(/ai/g, 'aɪ').replace(/ei/g, 'eɪ').replace(/ɔi/g, 'ɔɪ').replace(/iə/g, 'ɪə').replace(/uə/g, 'ʊə')
    .replace(/əu/g, 'əʊ').replace(/au/g, 'aʊ')
    .replace(/i(?!ː)(?=.)/g, 'ɪ')                           // short i (keep final happy-i)
    .replace(/u(?!ː)/g, 'ʊ');
  if (/[^a-zæɑɒɔəɜɪʊʌθðʃʒŋɡˈˌːeɛ\s-]/i.test(s)) return '';  // anything unexpected → no IPA
  return '/' + s + '/';
}

// --- 4. write per-level files ---
const out = Object.fromEntries(LEVELS.map(l => [l, []]));
let missing = 0;
for (const [key, e] of entries) {
  const d = dict.get(key);
  const m = d ? pickMeaning(d.tr, e.pos) : '';
  if (!m) { missing++; continue; }
  const pos = [...e.pos].map(p => POS_ZH[p] || p).filter((v, i, a) => a.indexOf(v) === i).join('／');
  let ipa = ipaOf(d.ph);
  if (ipa && !e.w.includes(' ') && /\s/.test(ipa)) ipa = '';   // two pronunciations run together
  out[e.level].push([e.w, pos, m, ipa]);
}
const dir = path.join(__dirname, '..', 'words');
fs.mkdirSync(dir, { recursive: true });
for (const l of LEVELS) {
  out[l].sort((a, b) => a[0].localeCompare(b[0]));
  const header = l === 'C1' || l === 'C2'
    ? '// Word list: Octanove Vocabulary Profile C1/C2 (CC BY-SA 4.0) + CEFR-J; meanings: ECDICT (MIT). This file is CC BY-SA 4.0.\n'
    : '// Word list: CEFR-J Vocabulary Profile 1.5 (Tono Laboratory, TUFS); meanings: ECDICT (MIT).\n';
  fs.writeFileSync(path.join(dir, l + '.js'),
    header + 'window.EQ_WORDS = window.EQ_WORDS || {};\nwindow.EQ_WORDS.' + l + ' = ' + JSON.stringify(out[l]).replace(/\],\[/g, '],\n[') + ';\n');
}
console.log(Object.fromEntries(LEVELS.map(l => [l, out[l].length])), 'skipped (no meaning):', missing);
