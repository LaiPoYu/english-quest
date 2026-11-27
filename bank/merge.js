// Merges the extra question banks (bank/A1.js … bank/C2.js) into the app.
// Each extra item: { q, o:[correct, wrong, wrong, wrong], e, zh, ipa?, n:{ t,p,f?,m,u,o?,c,tip? } }
// New ids continue after the original 10 per level/skill (e.g. A1-v11 … A1-v50),
// so progress saved for the original 120 questions keeps working.
(function () {
  const extra = window.EQ_EXTRA || {};
  window.NOTES = window.NOTES || {};
  window.TRANS = window.TRANS || {};
  window.IPA = window.IPA || {};
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const lv = extra[level];
    if (!lv) continue;
    for (const skill of ['vocab', 'grammar']) {
      const start = window.QUESTIONS.filter(q => q.level === level && q.skill === skill).length;
      (lv[skill] || []).forEach((it, i) => {
        const id = `${level}-${skill[0]}${start + i + 1}`;
        window.QUESTIONS.push({ id, level, skill, prompt: it.q, options: it.o, answer: 0, explain: it.e });
        if (it.n) window.NOTES[id] = it.n;
        if (it.zh) window.TRANS[id] = it.zh;
        if (it.ipa) window.IPA[id] = it.ipa;
      });
    }
  }
})();
