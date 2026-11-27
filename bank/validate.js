// Dev check: node bank/validate.js — verifies every question and its notes.
global.window = {};
const path = require('path');
const dir = __dirname;
require(path.join(dir, '..', 'questions.js'));
require(path.join(dir, '..', 'notes.js'));
for (const lv of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
  try { require(path.join(dir, lv + '.js')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
}
require(path.join(dir, 'merge.js'));
const Q = window.QUESTIONS;
const problems = [];
const seenPrompt = new Map();
for (const q of Q) {
  const where = q.id;
  if (!q.prompt || typeof q.prompt !== 'string') problems.push(where + ': no prompt');
  if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(where + ': needs 4 options');
  else {
    const low = q.options.map(o => String(o).trim().toLowerCase());
    if (new Set(low).size !== 4) problems.push(where + ': duplicate options ' + q.options.join(' | '));
    if (low.some(o => !o)) problems.push(where + ': empty option');
  }
  if (!q.explain) problems.push(where + ': no explanation');
  const key = q.prompt.toLowerCase().replace(/\s+/g, ' ');
  if (seenPrompt.has(key)) problems.push(where + ': same prompt as ' + seenPrompt.get(key));
  seenPrompt.set(key, where);
  const n = window.NOTES[q.id];
  if (!n) problems.push(where + ': no notes');
  else {
    for (const k of ['t', 'p', 'm']) if (!n[k]) problems.push(where + ': notes missing ' + k);
    if (!Array.isArray(n.u) || !n.u.length) problems.push(where + ': notes need u');
    for (const u of n.u || []) if (!Array.isArray(u) || u.length !== 4 || u.some(x => !x)) problems.push(where + ': bad u entry ' + JSON.stringify(u));
    for (const o of n.o || []) if (!Array.isArray(o) || o.length !== 3 || o.some(x => !x)) problems.push(where + ': bad o entry ' + JSON.stringify(o));
    for (const c of n.c || []) if (!Array.isArray(c) || c.length !== 2 || c.some(x => !x)) problems.push(where + ': bad c entry ' + JSON.stringify(c));
  }
  if (!window.TRANS[q.id]) problems.push(where + ': no translation');
  if (q.skill === 'vocab' && !window.IPA[q.id]) problems.push(where + ': no IPA');
}
const count = {};
for (const q of Q) count[q.level + ' ' + q.skill] = (count[q.level + ' ' + q.skill] || 0) + 1;
console.log('total', Q.length, JSON.stringify(count));
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'all checks passed');
process.exitCode = problems.length ? 1 : 0;
