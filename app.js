'use strict';

/* ---------- constants ---------- */
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_INFO = {
  A1: { name: 'Beginner', desc: 'Everyday words and very simple sentences.' },
  A2: { name: 'Elementary', desc: 'Routine topics, past and future basics.' },
  B1: { name: 'Intermediate', desc: 'Work and travel, opinions, common phrasal verbs.' },
  B2: { name: 'Upper Intermediate', desc: 'Abstract topics, passives, all conditionals.' },
  C1: { name: 'Advanced', desc: 'Nuanced vocabulary and inversion structures.' },
  C2: { name: 'Proficient', desc: 'Near-native precision and formal style.' },
};
const SKILLS = {
  vocab: { name: 'Vocabulary', icon: '📘', color: 'blue' },
  grammar: { name: 'Grammar', icon: '🧩', color: 'purple' },
  mixed: { name: 'Mixed Practice', icon: '🎯', color: 'orange' },
};
const LESSON_SIZE = 8;
const MAX_HEARTS = 3;
const ACHIEVEMENTS = [
  { id: 'placement', icon: '🧭', name: 'Pathfinder', desc: 'Finish the placement test', test: d => d.placementDone },
  { id: 'first', icon: '🌱', name: 'First Steps', desc: 'Complete your first lesson', test: d => d.stats.lessons >= 1 },
  { id: 'perfect', icon: '💎', name: 'Flawless', desc: 'Finish a lesson with no mistakes', test: d => d.stats.perfect >= 1 },
  { id: 'lessons10', icon: '📚', name: 'Bookworm', desc: 'Complete 10 lessons', test: d => d.stats.lessons >= 10 },
  { id: 'streak3', icon: '🔥', name: 'On Fire', desc: 'Reach a 3-day streak', test: d => d.longestStreak >= 3 },
  { id: 'streak7', icon: '🏆', name: 'Unstoppable', desc: 'Reach a 7-day streak', test: d => d.longestStreak >= 7 },
  { id: 'xp100', icon: '⚡', name: 'Charged Up', desc: 'Earn 100 XP', test: d => d.xp >= 100 },
  { id: 'xp500', icon: '🚀', name: 'Rocket', desc: 'Earn 500 XP', test: d => d.xp >= 500 },
  { id: 'combo8', icon: '🎯', name: 'Sharpshooter', desc: 'Get 8 right in a row', test: d => d.stats.bestCombo >= 8 },
  { id: 'review10', icon: '🩹', name: 'Fixer', desc: 'Clear 10 mistakes in review', test: d => d.stats.cleared >= 10 },
  { id: 'goal', icon: '✅', name: 'Goal Getter', desc: 'Hit your daily XP goal', test: d => d.stats.goalsHit >= 1 },
  { id: 'c2', icon: '👑', name: 'Summit', desc: 'Complete a C2 lesson', test: d => d.stats.c2 >= 1 },
];
const QMAP = Object.fromEntries(window.QUESTIONS.map(q => [q.id, q]));

/* ---------- utils ---------- */
const app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pad = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dateKey(new Date());
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
const blankify = s => esc(s).replace(/___/g, '<span class="blank"></span>');

const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

async function hashPw(salt, pw) {
  const txt = salt + ':' + pw;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
  return 'f' + (h >>> 0).toString(16);
}

/* ---------- state ---------- */
let user = null;     // username
let data = null;     // user progress
let tab = 'learn';
let S = null;        // active quiz session
let sheet = null;    // open bottom sheet
let lastResult = null;

function newData() {
  return {
    created: today(), level: 'A1', placementDone: false,
    xp: 0, streak: 0, longestStreak: 0, lastActive: null,
    dailyGoal: 30, daily: {}, history: [], mistakes: {}, mastered: {}, achievements: {},
    stats: { answered: 0, correct: 0, lessons: 0, perfect: 0, bestCombo: 0, cleared: 0, goalsHit: 0, c2: 0 },
  };
}
function normalize(obj) {
  const d = Object.assign(newData(), obj || {});
  d.stats = Object.assign(newData().stats, d.stats);
  return d;
}
const loadData = u => normalize(store.get('eq_data_' + u, {}));
// Every change stamps updatedAt, saves locally, then (in cloud mode) syncs shortly after.
function save() {
  if (!user) return;
  data.updatedAt = Date.now();
  store.set('eq_data_' + user, data);
  schedulePush();
}
const currentStreak = () => (!data.lastActive || daysBetween(data.lastActive, today()) > 1) ? 0 : data.streak;
const todayXp = () => data.daily[today()] || 0;

/* ---------- auth ---------- */
async function register(name, pw) {
  const users = store.get('eq_users', {});
  if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) return 'Username: 3–20 letters, numbers or _.';
  if (pw.length < 4) return 'Password must be at least 4 characters.';
  const key = name.toLowerCase();
  if (users[key]) return 'That username is taken.';
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  users[key] = { display: name, salt, hash: await hashPw(salt, pw) };
  store.set('eq_users', users);
  login(key); return null;
}
async function signIn(name, pw) {
  const users = store.get('eq_users', {});
  const u = users[name.toLowerCase()];
  if (!u || (await hashPw(u.salt, pw)) !== u.hash) return 'Wrong username or password.';
  login(name.toLowerCase()); return null;
}
function login(key) {
  user = key; data = loadData(key); store.set('eq_session', key); tab = 'learn';
  render();
}
async function logout() {
  if (CLOUD && cloudUser) { try { await CLOUD.auth.signOut(); } catch { /* offline: local sign-out still happens */ } }
  clearTimeout(pushTimer);
  store.del('eq_session'); store.del('eq_cloud_last');
  user = null; data = null; S = null; cloudUser = null; lastResult = null; sheet = null; setSync('idle');
  render();
}
function displayName() {
  if (cloudUser) return (cloudUser.user_metadata && cloudUser.user_metadata.username) || (cloudUser.email || 'learner').split('@')[0];
  return (store.get('eq_users', {})[user] || {}).display || user;
}

/* ---------- cloud accounts + sync (Supabase) ---------- */
// Enabled when config.js has a Supabase URL + anon key. Otherwise the app stays in local-only mode.
const CLOUD = (() => {
  const c = window.EQ_CONFIG || {};
  if (!c.supabaseUrl || !c.supabaseAnonKey || !window.supabase) return null;
  try { return window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } }); }
  catch (err) { console.warn('Supabase init failed', err); return null; }
})();
let cloudUser = null;
let sync = { state: 'idle', at: null, err: '' };
let pushTimer = null;
let pulling = false;

function setSync(state, err = '') {
  sync = { state, at: state === 'synced' ? new Date() : sync.at, err };
  const el = document.getElementById('syncStatus');
  if (el) el.innerHTML = syncLabel();
}
function syncLabel() {
  if (!CLOUD) return '📱 This device only';
  const t = sync.at ? ` · ${pad(sync.at.getHours())}:${pad(sync.at.getMinutes())}` : '';
  return ({
    idle: '☁️ Cloud', syncing: '🔄 Syncing…', synced: `✅ Synced${t}`,
    offline: '📴 Offline. Will sync when online', error: `⚠️ Sync failed${sync.err ? ': ' + esc(sync.err) : ''}`,
  })[sync.state] || '';
}

async function cloudRegister(email, name, pw) {
  if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) return 'Username: 3–20 letters, numbers or _.';
  if (pw.length < 6) return 'Password must be at least 6 characters.';
  const { data: r, error } = await CLOUD.auth.signUp({ email, password: pw, options: { data: { username: name } } });
  if (error) return error.message;
  if (!r.session) { authMode = 'login'; renderAuth('', 'Account created! Check your email and click the confirmation link, then log in here.'); return null; }
  await cloudLogin(r.user);
  return null;
}
async function cloudSignIn(email, pw) {
  const { data: r, error } = await CLOUD.auth.signInWithPassword({ email, password: pw });
  if (error) return /invalid login/i.test(error.message) ? 'Wrong email or password.' : error.message;
  await cloudLogin(r.user);
  return null;
}
async function cloudLogin(u) {
  cloudUser = u;
  user = 'sb_' + u.id;
  data = loadData(user);
  tab = 'learn';
  store.set('eq_cloud_last', { id: u.id, email: u.email, user_metadata: u.user_metadata || {} });
  render();
  await pull({ first: true });
}

// Download the cloud copy; newest copy wins (by updatedAt).
async function pull({ first = false } = {}) {
  if (!CLOUD || !cloudUser || pulling) return;
  if (!navigator.onLine) return setSync('offline');
  pulling = true; setSync('syncing');
  try {
    const { data: row, error } = await CLOUD.from('progress').select('data').eq('user_id', cloudUser.id).maybeSingle();
    if (error) throw error;
    const remote = row && row.data;
    const localT = data.updatedAt || 0;
    if (!remote) {
      if (first) maybeImportLegacy();
      pulling = false; return push();
    }
    const remoteT = remote.updatedAt || 0;
    if (remoteT > localT) {
      if (S) { setSync('synced'); return; }          // never swap data in the middle of a lesson
      data = normalize(remote);
      store.set('eq_data_' + user, data);
      setSync('synced');
      render();
    } else if (remoteT < localT) {
      pulling = false; return push();
    } else setSync('synced');
  } catch (err) {
    setSync('error', friendlyErr(err));
  } finally { pulling = false; }
}
async function push() {
  if (!CLOUD || !cloudUser) return;
  if (!navigator.onLine) return setSync('offline');
  setSync('syncing');
  try {
    const { error } = await CLOUD.from('progress').upsert({ user_id: cloudUser.id, data, updated_at: new Date().toISOString() });
    if (error) throw error;
    setSync('synced');
  } catch (err) { setSync('error', friendlyErr(err)); }
}
function schedulePush() {
  if (!CLOUD || !cloudUser) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushTimer = null; push(); }, 1500);
}
function friendlyErr(err) {
  const m = (err && (err.message || err.error_description)) || String(err);
  if (/jwt|token|auth/i.test(m)) return 'please log out and log in again';
  if (/fetch|network/i.test(m)) return 'network problem';
  if (/relation .*progress|does not exist/i.test(m)) return 'database table missing (run supabase/schema.sql)';
  return m.slice(0, 80);
}
// First cloud login on a device that has old local-only progress → offer to bring it along.
function maybeImportLegacy() {
  if (data.placementDone || data.xp > 0) return;
  const users = store.get('eq_users', {});
  let best = null;
  for (const k of Object.keys(users)) {
    const d = store.get('eq_data_' + k, null);
    if (d && (d.xp > 0 || d.placementDone) && (!best || d.xp > best.d.xp)) best = { k, d, name: users[k].display || k };
  }
  if (!best) return;
  if (!confirm(`This device has progress from your old local account "${best.name}" (${best.d.xp} XP, level ${best.d.level}).\n\nImport it into your cloud account?`)) return;
  data = normalize(best.d);
  data.updatedAt = Date.now();
  store.set('eq_data_' + user, data);
  render();
}
window.addEventListener('online', () => pull());
// Coming back to the app → fetch changes from the other device. Leaving → send pending changes now.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return pull();
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; push(); }
});

/* ---------- quiz engine ---------- */
const prep = (q, retry = false) => ({ q, retry, opts: shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer }))) });

function lessonPool(level, skill) {
  const pool = window.QUESTIONS.filter(q => q.level === level && (skill === 'mixed' || q.skill === skill));
  const fresh = shuffle(pool.filter(q => !data.mastered[q.id]));
  const known = shuffle(pool.filter(q => data.mastered[q.id]));
  return [...fresh, ...known].slice(0, LESSON_SIZE);
}
function placementBlock(lvIdx) {
  const lv = LEVELS[lvIdx];
  const [a, b] = shuffle(['vocab', 'grammar']);
  const pick = (sk, n) => shuffle(window.QUESTIONS.filter(q => q.level === lv && q.skill === sk)).slice(0, n);
  return shuffle([...pick(a, 2), ...pick(b, 1)]).map(q => prep(q));
}

function startLesson(skill) {
  S = base('lesson', lessonPool(data.level, skill).map(q => prep(q)));
  S.level = data.level; S.skill = skill; S.hearts = MAX_HEARTS;
  render();
}
function startReview() {
  const ids = Object.keys(data.mistakes).filter(id => QMAP[id]);
  if (!ids.length) return;
  S = base('review', shuffle(ids).slice(0, 10).map(id => prep(QMAP[id])));
  render();
}
function startPlacement() {
  S = base('placement', placementBlock(0));
  S.p = { lv: 0, passed: -1, blockCorrect: 0, blockCount: 0, results: [] };
  render();
}
function base(mode, items) {
  return { mode, items, i: 0, hearts: Infinity, sel: null, checked: false, ok: null,
    firstTry: 0, wrong: 0, combo: 0, bestCombo: 0, xp: 0, cleared: 0 };
}

function check() {
  if (!S || S.checked || S.sel == null) return;
  const item = S.items[S.i];
  const ok = item.opts[S.sel].ok;
  const id = item.q.id;
  S.checked = true; S.ok = ok;
  data.stats.answered++;
  if (ok) {
    data.stats.correct++;
    data.mastered[id] = true;
    S.combo++; S.bestCombo = Math.max(S.bestCombo, S.combo);
    if (S.mode !== 'placement') S.xp += item.retry ? 5 : 10;
    if (!item.retry) S.firstTry++;
    if (S.mode === 'review' && data.mistakes[id]) { delete data.mistakes[id]; data.stats.cleared++; S.cleared++; }
  } else {
    S.combo = 0; S.wrong++;
    const m = data.mistakes[id] || { count: 0 };
    data.mistakes[id] = { count: m.count + 1, last: today() };
    if (S.mode === 'lesson') {
      S.hearts--;
      if (!item.retry && S.hearts > 0) S.items.push(prep(item.q, true));
    }
  }
  data.stats.bestCombo = Math.max(data.stats.bestCombo, S.bestCombo);
  save();
  if (navigator.vibrate && !ok) { try { navigator.vibrate(60); } catch { /* ignore */ } }
  render();
}

function next() {
  if (!S || !S.checked) return;
  if (S.mode === 'placement') {
    const p = S.p;
    p.blockCount++; if (S.ok) p.blockCorrect++;
    if (p.blockCount === 3) {
      const pass = p.blockCorrect >= 2;
      p.results.push({ level: LEVELS[p.lv], correct: p.blockCorrect, pass });
      if (pass) p.passed = p.lv;
      if (pass && p.lv < LEVELS.length - 1) {
        p.lv++; p.blockCorrect = 0; p.blockCount = 0;
        S.items.push(...placementBlock(p.lv));
      } else return finishPlacement();
    }
  } else if (S.mode === 'lesson' && S.hearts <= 0) {
    return finishLesson(true);
  }
  S.i++; S.sel = null; S.checked = false; S.ok = null;
  if (S.i >= S.items.length) return S.mode === 'placement' ? finishPlacement() : finishLesson(false);
  render();
}

function addXp(xp) {
  const before = todayXp();
  data.xp += xp;
  data.daily[today()] = before + xp;
  if (before < data.dailyGoal && before + xp >= data.dailyGoal) data.stats.goalsHit++;
}
function touchStreak() {
  const t = today();
  if (data.lastActive === t) return;
  data.streak = (data.lastActive && daysBetween(data.lastActive, t) === 1) ? data.streak + 1 : 1;
  data.lastActive = t;
  data.longestStreak = Math.max(data.longestStreak, data.streak);
}
function newAchievements() {
  const got = [];
  for (const a of ACHIEVEMENTS) if (!data.achievements[a.id] && a.test(data)) { data.achievements[a.id] = today(); got.push(a); }
  return got;
}

function finishLesson(failed) {
  const s = S;
  const perfect = !failed && s.mode === 'lesson' && s.wrong === 0;
  if (perfect) s.xp += 5;
  addXp(s.xp);
  touchStreak();
  if (!failed) {
    if (s.mode === 'lesson') data.stats.lessons++;
    if (perfect) data.stats.perfect++;
    if (s.mode === 'lesson' && s.level === 'C2') data.stats.c2++;
  }
  const total = s.items.filter(x => !x.retry).length;
  data.history.unshift({ date: today(), mode: s.mode, level: s.level || '—', skill: s.skill || 'review', correct: s.firstTry, total, xp: s.xp, failed });
  data.history = data.history.slice(0, 50);
  const ach = newAchievements();
  save();
  lastResult = { kind: 'lesson', failed, perfect, xp: s.xp, correct: s.firstTry, total, combo: s.bestCombo, cleared: s.cleared, mode: s.mode, ach };
  S = null; render();
}
function finishPlacement() {
  const p = S.p;
  const recIdx = p.passed >= LEVELS.length - 1 ? LEVELS.length - 1 : p.passed + 1;
  data.placementDone = true;
  data.level = LEVELS[recIdx];
  const ach = newAchievements();
  save();
  lastResult = { kind: 'placement', level: LEVELS[recIdx], results: p.results, ach };
  S = null; render();
}
function quit() {
  if (S.mode === 'placement' && !data.placementDone) {
    if (!confirm('Skip the placement test? You will start at A1 and can change your level any time.')) return;
    data.placementDone = true; save();
  } else if (!confirm('Quit this lesson? XP from this lesson will be lost.')) return;
  S = null; render();
}

/* ---------- views ---------- */
function render() {
  if (!user) return renderAuth();
  if (S) return renderQuiz();
  if (lastResult) return lastResult.kind === 'placement' ? renderPlacementResult() : renderLessonResult();
  if (!data.placementDone) return renderPlacementIntro();
  renderMain();
}

let authMode = 'login';
function renderAuth(err = '', info = '') {
  const reg = authMode === 'register';
  const fields = CLOUD
    ? `<label>Email<input name="e" type="email" autocomplete="email" required></label>
       ${reg ? '<label>Username<input name="u" autocomplete="nickname" required maxlength="20" placeholder="Shown on your profile"></label>' : ''}
       <label>Password<input name="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required minlength="6"></label>`
    : `<label>Username<input name="u" autocomplete="username" required maxlength="20"></label>
       <label>Password<input name="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required></label>`;
  app.innerHTML = `
  <div class="center-screen">
    <div class="auth">
      <div class="logo">🦉</div>
      <h1>English Quest</h1>
      <p class="muted">Bite-sized vocabulary &amp; grammar, A1 to C2.</p>
      <form id="authForm" class="card form">
        ${fields}
        ${err ? `<div class="error">${esc(err)}</div>` : ''}
        ${info ? `<div class="info">${esc(info)}</div>` : ''}
        <button class="btn btn-green" type="submit">${reg ? 'Create account' : 'Log in'}</button>
      </form>
      <button class="link" data-act="toggleAuth">${reg ? 'Already have an account? Log in' : 'New here? Create an account'}</button>
      <p class="fine">${CLOUD ? '☁️ Log in with the same email on your phone and computer. Your progress syncs automatically.' : 'Accounts and progress are saved in this browser on this device.'}</p>
    </div>
  </div>`;
}
function renderLoading() {
  app.innerHTML = '<div class="center-screen"><div class="intro"><div class="logo big pop">🦉</div><p class="muted">Loading…</p></div></div>';
}

function renderPlacementIntro() {
  app.innerHTML = `
  <div class="center-screen">
    <div class="intro">
      <div class="logo big">🧭</div>
      <h1>Hi ${esc(displayName())}! Let's find your level</h1>
      <p class="muted">A short adaptive test. It starts easy and gets harder as you go: 3 questions per level, A1 → C2. It takes about 3–6 minutes.</p>
      <button class="btn btn-green" data-act="placement">Start placement test</button>
      <button class="btn btn-ghost" data-act="skipPlacement">Skip, I'll pick my level</button>
    </div>
  </div>`;
}

function renderQuiz() {
  const item = S.items[S.i];
  const q = item.q;
  let progress;
  if (S.mode === 'placement') progress = ((S.p.lv * 3 + S.p.blockCount + (S.checked ? 1 : 0)) / 18) * 100;
  else progress = ((S.i + (S.checked ? 1 : 0)) / S.items.length) * 100;
  const tag = S.mode === 'placement' ? `Placement · Level ${q.level}`
    : S.mode === 'review' ? `Review · ${q.level} ${SKILLS[q.skill].name}`
    : `${q.level} · ${SKILLS[q.skill].name}`;
  const hearts = S.mode === 'lesson'
    ? `<div class="hearts" title="Hearts">${'❤️'.repeat(Math.max(S.hearts, 0))}${'🤍'.repeat(MAX_HEARTS - Math.max(S.hearts, 0))}</div>`
    : `<div class="hearts small">${S.mode === 'placement' ? '🧭' : '🩹'}</div>`;
  const opts = item.opts.map((o, i) => {
    let cls = 'opt';
    if (S.checked) { if (o.ok) cls += ' correct'; else if (i === S.sel) cls += ' wrong'; else cls += ' dim'; }
    else if (i === S.sel) cls += ' selected';
    return `<button class="${cls}" data-act="pick" data-i="${i}" ${S.checked ? 'disabled' : ''}><span class="key">${i + 1}</span><span>${esc(o.t)}</span></button>`;
  }).join('');
  const right = item.opts.find(o => o.ok).t;
  const foot = S.checked
    ? `<footer class="quiz-foot ${S.ok ? 'is-ok' : 'is-bad'}">
        <div class="fb">
          <div class="fb-title">${S.ok ? (S.combo >= 3 ? `🔥 ${S.combo} in a row!` : pickPraise()) : 'Not quite'}</div>
          <div class="fb-ans">${S.ok ? '✓ ' : 'Correct answer: '}<b>${esc(right)}</b> ${sayBtn(right)}</div>
          ${sentenceRow(q)}
          <div class="fb-ex">${esc(q.explain)}</div>
          ${noteHtml(q)}
        </div>
        <button class="btn ${S.ok ? 'btn-green' : 'btn-red'}" data-act="next" autofocus>Continue</button>
      </footer>`
    : `<footer class="quiz-foot"><div class="fb"></div><button class="btn btn-green" data-act="check" ${S.sel == null ? 'disabled' : ''}>Check</button></footer>`;
  app.innerHTML = `
  <div class="quiz">
    <header class="quiz-top">
      <button class="icon-btn" data-act="quit" aria-label="Quit">✕</button>
      <div class="bar"><div style="width:${Math.min(progress, 100)}%"></div></div>
      ${hearts}
    </header>
    <main class="quiz-body">
      ${item.retry ? '<div class="retry">↺ Previous mistake</div>' : ''}
      <div class="tag">${esc(tag)}</div>
      <h2 class="prompt">${blankify(q.prompt)}</h2>
      <div class="opts">${opts}</div>
    </main>
    ${foot}
  </div>`;
}
/* ---------- detailed notes (dropdown) ---------- */
function noteHtml(q, remember = true) {
  const n = window.NOTES && window.NOTES[q.id];
  if (!n) return '';
  const isGrammar = n.p.startsWith('文法');
  const head = isGrammar
    ? `<b class="n-word">${esc(n.t)}</b>（${esc(n.p)}）：<b>${esc(n.m)}</b>`
    : `<b class="n-word">${esc(n.t)}</b>${window.IPA && IPA[q.id] ? ` <span class="ipa">${esc(IPA[q.id])}</span>` : ''} ${sayBtn(n.t)}（${esc(n.p)}${n.f ? `，${n.p.includes('動詞') ? '三態' : '變化'}為 <i>${esc(n.f)}</i>` : ''}）的中文意思是<b>${esc(n.m)}</b>。`;
  const ex = (e, zh) => `<div class="n-ex">${/[A-Za-z]{2}/.test(e) ? sayBtn(e, 'mini') : ''}<i>${esc(e)}</i>（${esc(zh)}）</div>`;
  let html = `<div class="n-head">${head}</div>`;
  if (n.u && n.u.length) html += `<h4>${isGrammar ? '句型結構' : '核心用法與句型'}</h4><ul>${n.u.map(([pat, d, e, zh]) => `<li><b>${esc(pat)}</b>${d ? '：' + esc(d) : ''}${ex(e, zh)}</li>`).join('')}</ul>`;
  if (n.o && n.o.length) html += `<h4>${isGrammar ? '延伸用法' : '其他常見意思'}</h4><ul>${n.o.map(([d, e, zh]) => `<li><b>${esc(d)}</b>${ex(e, zh)}</li>`).join('')}</ul>`;
  if (n.c && n.c.length) html += `<h4>${isGrammar ? '易混淆比較' : '與其他選項的差別'}</h4><ul>${n.c.map(([w, zh]) => `<li><b>${esc(w)}</b>：${esc(zh)}</li>`).join('')}</ul>`;
  if (n.tip) html += `<h4>小提醒</h4><p class="n-tip">💡 ${esc(n.tip)}</p>`;
  const open = remember && store.get('eq_note_open', false) ? ' open' : '';
  return `<details class="note"${open}${remember ? ' data-remember="1"' : ''}><summary>📖 詳細解說</summary><div class="note-body">${html}</div></details>`;
}

/* ---------- pronunciation (built-in text-to-speech) + translation ---------- */
const TTS = (() => {
  const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voice = null;
  const pick = () => {
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /^en[-_]US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny|Ava|Allison/i.test(v.name))
      || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  };
  if (ok) { pick(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', pick); }
  return {
    ok,
    speak(text, slow) {
      if (!ok) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = slow ? 0.6 : 0.95;
      speechSynthesis.speak(u);
    },
  };
})();
const sayBtn = (text, cls = '', slow = false) => TTS.ok
  ? `<button class="say ${cls}" data-act="say" data-text="${esc(text)}" data-slow="${slow ? 1 : 0}" aria-label="${slow ? 'Play slowly' : 'Play'}" title="${slow ? 'Slow' : 'Listen'}">${slow ? '🐢' : '🔊'}</button>`
  : '';
const fullSentence = q => q.prompt.includes('___') ? q.prompt.replace(/___/g, q.options[q.answer]) : null;
function sentenceRow(q, compact = false) {
  const full = fullSentence(q);
  const zh = window.TRANS && TRANS[q.id];
  if (!full && !zh) return '';
  return `<div class="sent ${compact ? 'compact' : ''}">
    ${full && !compact ? `<div class="sent-en">${sayBtn(full)}${sayBtn(full, '', true)}<span>${esc(full)}</span></div>` : ''}
    ${full && compact ? `<div class="sent-en">${sayBtn(full, 'mini')}<span>${esc(full)}</span></div>` : ''}
    ${zh ? `<div class="sent-zh">🇹🇼 ${esc(zh)}</div>` : ''}
  </div>`;
}

const PRAISE = ['Nice!', 'Correct!', 'Great job!', 'Awesome!', 'You got it!'];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

function achList(ach) {
  if (!ach.length) return '';
  return `<div class="new-ach"><div class="label">Achievement unlocked</div>${ach.map(a => `<div class="ach-pill">${a.icon} <b>${esc(a.name)}</b> <span class="muted">· ${esc(a.desc)}</span></div>`).join('')}</div>`;
}

function renderLessonResult() {
  const r = lastResult;
  const acc = r.total ? Math.round((r.correct / r.total) * 100) : 0;
  const head = r.failed ? ['💔', 'Out of hearts', 'Mistakes were saved to your review list. Try again!']
    : r.mode === 'review' ? ['🩹', 'Review complete', `You cleared ${r.cleared} question${r.cleared === 1 ? '' : 's'} from your mistakes.`]
    : r.perfect ? ['💎', 'Perfect lesson!', '+5 bonus XP for no mistakes.']
    : ['🎉', 'Lesson complete!', 'Keep the streak going.'];
  app.innerHTML = `
  <div class="center-screen">
    <div class="result">
      <div class="logo big pop">${head[0]}</div>
      <h1>${head[1]}</h1>
      <p class="muted">${head[2]}</p>
      <div class="stat-row">
        <div class="stat yellow"><div class="s-label">Total XP</div><div class="s-val">⚡ ${r.xp}</div></div>
        <div class="stat green"><div class="s-label">Accuracy</div><div class="s-val">🎯 ${acc}%</div></div>
        <div class="stat orange"><div class="s-label">Streak</div><div class="s-val">🔥 ${currentStreak()}</div></div>
      </div>
      <div class="goal-line">Daily goal: ${Math.min(todayXp(), data.dailyGoal)} / ${data.dailyGoal} XP</div>
      ${achList(r.ach)}
      <button class="btn btn-green" data-act="done">Continue</button>
    </div>
  </div>`;
}

function renderPlacementResult() {
  const r = lastResult;
  const rows = r.results.map(x => `<div class="pr-row ${x.pass ? 'pass' : 'fail'}"><b>${x.level}</b><span>${'●'.repeat(x.correct)}${'○'.repeat(3 - x.correct)}</span><span>${x.pass ? 'Passed' : 'Your challenge zone'}</span></div>`).join('');
  app.innerHTML = `
  <div class="center-screen">
    <div class="result">
      <div class="logo big pop">🎓</div>
      <h1>Your level: ${r.level}</h1>
      <p class="muted">${esc(LEVEL_INFO[r.level].name)} · ${esc(LEVEL_INFO[r.level].desc)}</p>
      <div class="card pr">${rows}</div>
      <p class="fine">You'll start at the level where questions begin to feel challenging. You can change it any time.</p>
      ${achList(r.ach)}
      <button class="btn btn-green" data-act="done">Start learning at ${r.level}</button>
      <button class="btn btn-ghost" data-act="openLevels">Choose a different level</button>
    </div>
  </div>`;
}

function topBar() {
  return `
  <header class="topbar">
    <button class="chip level-chip" data-act="openLevels">${data.level} <span>▾</span></button>
    <div class="chip" title="Day streak">🔥 ${currentStreak()}</div>
    <div class="chip" title="Total XP">⚡ ${data.xp}</div>
    <div class="chip" title="Mistakes to review">🩹 ${Object.keys(data.mistakes).length}</div>
  </header>`;
}
function tabBar() {
  const t = (id, icon, label) => `<button class="tab ${tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}"><span>${icon}</span>${label}</button>`;
  return `<nav class="tabbar">${t('learn', '🏠', 'Learn')}${t('review', '🩹', 'Review')}${t('profile', '👤', 'Profile')}</nav>`;
}
function mastery(level, skill) {
  const pool = window.QUESTIONS.filter(q => q.level === level && (skill === 'mixed' || q.skill === skill));
  const m = pool.filter(q => data.mastered[q.id]).length;
  return { m, n: pool.length, pct: pool.length ? Math.round((m / pool.length) * 100) : 0 };
}

function renderMain() {
  let body = '';
  if (tab === 'learn') body = viewLearn();
  else if (tab === 'review') body = viewReview();
  else body = viewProfile();
  app.innerHTML = `<div class="main">${topBar()}<div class="content">${body}</div>${tabBar()}</div>${sheet === 'levels' ? levelSheet() : sheet === 'ios' ? iosSheet() : ''}`;
}

function viewLearn() {
  const goalPct = Math.min(100, Math.round((todayXp() / data.dailyGoal) * 100));
  const lv = data.level;
  const cards = ['vocab', 'grammar', 'mixed'].map(sk => {
    const m = mastery(lv, sk);
    return `
    <button class="skill ${SKILLS[sk].color}" data-act="lesson" data-skill="${sk}">
      <div class="skill-icon">${SKILLS[sk].icon}</div>
      <div class="skill-main">
        <div class="skill-name">${SKILLS[sk].name}</div>
        <div class="mini-bar"><div style="width:${m.pct}%"></div></div>
        <div class="skill-sub">${m.m}/${m.n} mastered · ${LESSON_SIZE} questions</div>
      </div>
      <div class="skill-go">▶</div>
    </button>`;
  }).join('');
  const path = LEVELS.map(l => {
    const m = mastery(l, 'mixed');
    return `<button class="node ${l === lv ? 'cur' : ''} ${m.pct === 100 ? 'done' : ''}" data-act="setLevel" data-level="${l}">
      <svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="16" class="ring-bg"/>${m.pct ? `<circle cx="18" cy="18" r="16" class="ring-fg" stroke-dasharray="${m.pct} 100" pathLength="100"/>` : ''}</svg>
      <span>${l}</span></button>`;
  }).join('');
  return `
  ${installCard()}
  <section class="card goal">
    <div class="goal-head"><b>Daily goal</b><span>${Math.min(todayXp(), data.dailyGoal)} / ${data.dailyGoal} XP</span></div>
    <div class="bar yellow"><div style="width:${goalPct}%"></div></div>
    ${goalPct >= 100 ? '<div class="fine">Goal reached today. 🎉</div>' : ''}
  </section>
  <section class="hero">
    <div class="hero-level">${lv}</div>
    <div><div class="hero-name">${esc(LEVEL_INFO[lv].name)}</div><div class="muted small">${esc(LEVEL_INFO[lv].desc)}</div></div>
  </section>
  <section class="skills">${cards}</section>
  <h3 class="section-title">Level path</h3>
  <section class="path">${path}</section>`;
}

function viewReview() {
  const ids = Object.keys(data.mistakes).filter(id => QMAP[id])
    .sort((a, b) => data.mistakes[b].count - data.mistakes[a].count);
  if (!ids.length) return `<div class="empty"><div class="logo big">✨</div><h2>No mistakes to review</h2><p class="muted">Wrong answers from lessons show up here so you can practise them again.</p></div>`;
  const list = ids.map(id => {
    const q = QMAP[id], m = data.mistakes[id];
    return `<div class="card mistake">
      <div class="m-top"><span class="tag">${q.level} · ${SKILLS[q.skill].name}</span><span class="m-count">✗ ${m.count}</span></div>
      <div class="m-q">${blankify(q.prompt)}</div>
      <div class="m-a">✓ ${esc(q.options[q.answer])} ${sayBtn(q.options[q.answer], 'mini')}</div>
      ${sentenceRow(q, true)}
      <div class="m-ex muted small">${esc(q.explain)}</div>
      ${noteHtml(q, false)}
    </div>`;
  }).join('');
  return `
  <section class="card review-cta">
    <div><b>${ids.length} question${ids.length === 1 ? '' : 's'} to review</b><div class="muted small">Answer one correctly to clear it from the list.</div></div>
    <button class="btn btn-green" data-act="review">Review ${Math.min(ids.length, 10)}</button>
  </section>
  ${list}`;
}

function viewProfile() {
  const acc = data.stats.answered ? Math.round((data.stats.correct / data.stats.answered) * 100) : 0;
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const maxXp = Math.max(data.dailyGoal, ...days.map(d => data.daily[dateKey(d)] || 0));
  const chart = days.map(d => {
    const v = data.daily[dateKey(d)] || 0;
    return `<div class="col" title="${v} XP"><div class="col-v">${v || ''}</div><div class="col-bar ${v ? '' : 'zero'}" style="height:${Math.round((v / maxXp) * 100)}%"></div><div class="col-l">${'SMTWTFS'[d.getDay()]}</div></div>`;
  }).join('');
  const ach = ACHIEVEMENTS.map(a => `<div class="ach ${data.achievements[a.id] ? 'got' : ''}" title="${esc(a.desc)}"><div class="ach-i">${a.icon}</div><div class="ach-n">${esc(a.name)}</div><div class="ach-d">${esc(a.desc)}</div></div>`).join('');
  const hist = data.history.slice(0, 10).map(h => `<div class="h-row"><span>${h.date.slice(5)}</span><span>${h.mode === 'review' ? '🩹 Review' : `${h.level} ${SKILLS[h.skill] ? SKILLS[h.skill].name : ''}`}</span><span>${h.correct}/${h.total}${h.failed ? ' 💔' : ''}</span><span>+${h.xp} XP</span></div>`).join('') || '<div class="muted small">No lessons yet.</div>';
  const goalOpts = [10, 20, 30, 50, 80].map(g => `<option value="${g}" ${g === data.dailyGoal ? 'selected' : ''}>${g} XP / day</option>`).join('');
  return `
  <section class="profile-head">
    <div class="avatar">${esc(displayName()[0].toUpperCase())}</div>
    <div><h2>${esc(displayName())}</h2><div class="muted small">${cloudUser && cloudUser.email ? esc(cloudUser.email) + ' · ' : ''}Joined ${data.created} · Level ${data.level}</div></div>
  </section>
  <section class="grid4">
    <div class="stat orange"><div class="s-val">🔥 ${currentStreak()}</div><div class="s-label">Day streak</div></div>
    <div class="stat yellow"><div class="s-val">⚡ ${data.xp}</div><div class="s-label">Total XP</div></div>
    <div class="stat green"><div class="s-val">🎯 ${acc}%</div><div class="s-label">Accuracy</div></div>
    <div class="stat blue"><div class="s-val">📚 ${data.stats.lessons}</div><div class="s-label">Lessons</div></div>
  </section>
  <h3 class="section-title">This week</h3>
  <section class="card chart">${chart}</section>
  <h3 class="section-title">Achievements · ${Object.keys(data.achievements).length}/${ACHIEVEMENTS.length}</h3>
  <section class="ach-grid">${ach}</section>
  <h3 class="section-title">Recent lessons</h3>
  <section class="card hist">${hist}</section>
  <h3 class="section-title">Settings</h3>
  <section class="card settings">
    <label class="row">Daily goal <select data-change="goal">${goalOpts}</select></label>
    <div class="row">Longest streak <b>🔥 ${data.longestStreak}</b></div>
    <div class="row sync-row"><span>Sync</span><span id="syncStatus" class="small">${syncLabel()}</span></div>
    ${CLOUD && cloudUser ? '<button class="btn btn-ghost" data-act="syncNow">🔄 Sync now</button>' : ''}
    ${installRow()}
    <button class="btn btn-ghost" data-act="placement">Retake placement test</button>
    <button class="btn btn-ghost danger" data-act="logout">Log out</button>
  </section>`;
}

/* ---------- install (PWA) ---------- */
const installMode = () => (window.PWA ? window.PWA.installMode() : null);
function installCard() {
  const mode = installMode();
  if (!mode || store.get('eq_install_dismissed', false)) return '';
  return `
  <section class="card install-card">
    <img src="icons/icon-192.png" alt="" class="install-icon">
    <div class="install-txt"><b>Install English Quest</b><div class="muted small">Open it from your home screen and practise offline.</div></div>
    <div class="install-btns">
      <button class="btn btn-green btn-sm" data-act="install">Install</button>
      <button class="link small" data-act="dismissInstall">Not now</button>
    </div>
  </section>`;
}
function installRow() {
  if (window.PWA && window.PWA.isStandalone()) return '<div class="row">App <b>✅ Installed</b></div>';
  if (!installMode()) return '';
  return '<button class="btn btn-ghost" data-act="install">📲 Install app</button>';
}
function iosSheet() {
  return `<div class="overlay" data-act="closeSheet"></div>
  <div class="sheet" role="dialog" aria-label="Install on iPhone"><div class="sheet-handle"></div>
    <h3>Install on iPhone / iPad</h3>
    <ol class="ios-steps">
      <li>Open this page in <b>Safari</b>.</li>
      <li>Tap the <b>Share</b> button <span class="ios-ico">⬆︎</span> in the toolbar.</li>
      <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
      <li>Tap <b>Add</b>. English Quest appears on your home screen.</li>
    </ol>
    <button class="btn btn-green" data-act="closeSheet">Got it</button>
  </div>`;
}
window.pwaRefresh = () => { if (user && data && data.placementDone && !S && !lastResult) render(); };

function levelSheet() {
  const rows = LEVELS.map(l => {
    const m = mastery(l, 'mixed');
    return `<button class="lv-row ${l === data.level ? 'on' : ''}" data-act="setLevel" data-level="${l}">
      <span class="lv-badge">${l}</span>
      <span class="lv-txt"><b>${esc(LEVEL_INFO[l].name)}</b><span class="muted small">${esc(LEVEL_INFO[l].desc)}</span></span>
      <span class="small muted">${m.pct}%</span></button>`;
  }).join('');
  return `<div class="overlay" data-act="closeSheet"></div>
  <div class="sheet" role="dialog" aria-label="Choose level"><div class="sheet-handle"></div><h3>Choose your level</h3>${rows}</div>`;
}

/* ---------- events ---------- */
const actions = {
  toggleAuth() { authMode = authMode === 'login' ? 'register' : 'login'; renderAuth(); },
  placement() { startPlacement(); },
  skipPlacement() { data.placementDone = true; save(); sheet = 'levels'; render(); },
  pick(el) { if (S && !S.checked) { S.sel = Number(el.dataset.i); render(); } },
  say(el) {
    TTS.speak(el.dataset.text, el.dataset.slow === '1');
    el.classList.add('playing'); setTimeout(() => el.classList.remove('playing'), 900);
  },
  check, next, quit,
  done() { lastResult = null; render(); },
  openLevels() { lastResult = null; sheet = 'levels'; render(); },
  closeSheet() { sheet = null; render(); },
  setLevel(el) { data.level = el.dataset.level; save(); sheet = null; render(); },
  tab(el) { tab = el.dataset.tab; window.scrollTo(0, 0); render(); },
  lesson(el) { startLesson(el.dataset.skill); },
  review() { startReview(); },
  logout() { if (confirm('Log out?')) logout(); },
  async syncNow() { clearTimeout(pushTimer); await pull(); },
  async install() {
    if (installMode() === 'ios') { sheet = 'ios'; render(); return; }
    if (window.PWA) await window.PWA.install();
  },
  dismissInstall() { store.set('eq_install_dismissed', true); render(); },
};
app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && actions[el.dataset.act]) actions[el.dataset.act](el);
});
// remember whether the learner likes the notes open during lessons
app.addEventListener('toggle', e => {
  if (e.target.matches && e.target.matches('details.note[data-remember]')) store.set('eq_note_open', e.target.open);
}, true);
app.addEventListener('change', e => {
  if (e.target.dataset.change === 'goal') { data.dailyGoal = Number(e.target.value); save(); render(); }
});
app.addEventListener('submit', async e => {
  if (e.target.id !== 'authForm') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const name = String(f.get('u') || '').trim(), pw = String(f.get('p')), email = String(f.get('e') || '').trim();
  const btn = e.target.querySelector('button[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Please wait…'; }
  let err;
  try {
    if (CLOUD) {
      if (!navigator.onLine) err = 'You are offline. Connect to the internet to log in.';
      else err = authMode === 'register' ? await cloudRegister(email, name, pw) : await cloudSignIn(email, pw);
    } else err = authMode === 'register' ? await register(name, pw) : await signIn(name, pw);
  } catch (ex) { err = friendlyErr(ex); }
  if (err) renderAuth(err);
});
document.addEventListener('keydown', e => {
  if (!S || e.target.tagName === 'INPUT') return;
  if (!S.checked && /^[1-4]$/.test(e.key)) { const i = Number(e.key) - 1; if (i < S.items[S.i].opts.length) { S.sel = i; render(); } }
  else if (e.key === 'Enter') { e.preventDefault(); S.checked ? next() : check(); }
});

/* ---------- boot ---------- */
(async function boot() {
  if (!CLOUD) {
    const s = store.get('eq_session', null);
    if (s && store.get('eq_users', {})[s]) { user = s; data = loadData(s); }
    return render();
  }
  renderLoading();
  let session = null;
  try { session = (await CLOUD.auth.getSession()).data.session; } catch { /* offline */ }
  if (session) return cloudLogin(session.user);
  // Offline with an expired token: keep the learner in, using the local copy; it syncs once back online.
  const last = store.get('eq_cloud_last', null);
  if (last && !navigator.onLine) {
    cloudUser = last; user = 'sb_' + last.id; data = loadData(user); setSync('offline');
    return render();
  }
  render();
})();
