# English Quest (MVP)

Gamified English practice web app, with vocabulary and grammar from CEFR A1 to C2.

## How to run
No install or build step. Pick one:
- Double-click `index.html` to open it in a browser.
- Or start a local server: `python3 -m http.server 8000`, then open http://localhost:8000. Phones on the same Wi-Fi can open it at the computer's IP address.

## Install as an app (PWA)
Open the site over **https** (for example GitHub Pages) or on `localhost`:
- **Android / Chrome / Edge**: tap **Install** on the card at the top of the Learn page, or use the browser menu → *Install app*.
- **iPhone / iPad**: in Safari, tap Share → **Add to Home Screen**. The app shows these steps when you tap Install.
- **Desktop Chrome / Edge**: click the install icon in the address bar.

Once installed, the app opens full-screen and works **offline**. When a new version is published, a "New version available" message appears; tap it to update.

> Opening `index.html` by double-clicking (`file://`) works, but you can't install it and it won't work offline. Use a local server or GitHub Pages.

## Cloud sync across devices (Supabase)
With `config.js` filled in, accounts use **email + password** and progress syncs between phone and computer.
Without it, the app runs in local-only mode.

1. Create a free project at https://supabase.com.
2. **SQL Editor** → paste `supabase/schema.sql` → **Run**. This creates the `progress` table with row-level security.
3. **Authentication → Sign In / Providers → Email**: turn off *Confirm email* so you can log in right after signing up. If you leave it on, also set **Authentication → URL Configuration → Site URL** to your GitHub Pages address.
4. **Project Settings → API**: copy the *Project URL* and the *anon / publishable* key into `config.js`. Both are safe to publish.
5. Bump `VERSION` in `sw.js`, then commit and push.

How sync works: every change is saved on the device first, then uploaded about 1.5 seconds later. When the app opens or comes back to the foreground, it downloads the newest copy, so the most recently changed copy wins. It works offline and uploads when you're back online. The first time you log in to the cloud on a device that has an old local account, the app offers to import that progress.

## Features
- **Login / register**: In cloud mode, accounts use Supabase Auth (email + password) and progress syncs across devices. In local mode, accounts live in the browser (passwords are stored as salted SHA-256 hashes).
- **Placement test**: Adaptive, 3 questions per level from A1 up. Passing a level (2 of 3 correct) moves you to the next one. Your recommended level is the first level you don't pass.
- **Choose your level**: Change it any time from the level chip at the top or from the Level path.
- **Lessons**: Vocabulary, Grammar, or Mixed. Each lesson has 8 questions and 3 hearts. A wrong answer is asked again once at the end of the lesson. Questions you haven't mastered come first.
- **Gamification**: XP (10 per first-try answer, 5 per retried answer, +5 for a perfect lesson), combos, daily goal, day streak, 14 achievements.
- **Word Drill (🔤 Words tab)**: **8,632 words** sorted by CEFR level (A1 1,057 · A2 1,244 · B1 2,143 · B2 2,394 · C1 913 · C2 881). Modes: English → 中文, 中文 → English, **Spelling 拼字** (see the Chinese, type the English word; the first letter is shown, 💡 reveals more), and Mixed. **A word is mastered after 3 correct answers and is never quizzed again.** Weak words come first. The word list has search and filters (New / Learning / Mastered). The 300 hand-written words keep their own meanings, examples and notes.
- **Mistakes book**: Every wrong answer is saved. Answer a question correctly in Review to clear it.
- **Profile**: Accuracy, weekly XP chart, achievements, recent lessons, daily-goal setting, retake the placement test.
- **Detailed notes (📖 詳細解說)**: After each answer, a dropdown shows the Chinese meaning, forms, core patterns with example sentences and translations, other meanings, how the other options differ, and tips. Notes are also in the Mistakes book. The app remembers whether you like it open.
- **Pronunciation + translation**: After each answer you can tap 🔊 to hear the answer and the full sentence (🐢 plays it slowly) and see the Chinese translation. The notes add IPA phonetics and a 🔊 for each example. Audio uses the device's built-in English voice, so it works offline.
- Keyboard: press `1`–`4` to choose an answer and `Enter` to check or continue.

## Files
- `index.html`: entry page
- `styles.css`: styles (supports dark mode, works on phone and desktop)
- `questions.js`: original question bank (6 levels × 2 skills × 10 questions = 120 questions)
- `bank/A1.js` … `bank/C2.js`: 480 more original questions (40 vocabulary + 40 grammar per level, everyday-life and workplace topics). Each question carries its own notes, translation and IPA. `bank/merge.js` adds them to the app, and `node bank/validate.js` checks them. **Total: 600 questions.**
- `notes.js`: detailed Chinese study notes, IPA (`IPA`), and Chinese translations (`TRANS`) for every question, keyed by question id (e.g. `A2-v6`)
- `app.js`: app logic, including cloud login and sync
- `config.js`: Supabase URL + anon key (empty = local-only mode)
- `supabase/schema.sql`: database table and security rules
- `vendor/supabase/`: supabase-js 2.119.0 browser bundle (MIT), stored in the repo so the app works offline
- `pwa.js`: service worker registration, install prompt, update and offline notices
- `sw.js`: service worker (offline cache). **Bump `VERSION` whenever you change app files.**
- `manifest.webmanifest`, `icons/`: app name, colors, icons

## Adding questions
The easiest way: append an item to `bank/<LEVEL>.js` (`vocab` or `grammar`) in this format: `{ q, o: [correct, wrong, wrong, wrong], e, zh, ipa, n: { t, p, m, u, c } }`. Then run `node bank/validate.js` and bump `VERSION` in `sw.js`.

To add to the original bank instead, add a row to `BANK.<level>.<skill>` in `questions.js`:
`["prompt with ___", ["correct", "wrong1", "wrong2", "wrong3"], 0, "explanation"]`
The answer index is the third value. Options are shuffled automatically when shown.
Then add a matching entry to `notes.js` with the new id (for example `A1-v11`), and bump `VERSION` in `sw.js`.

## Known limitations
- If both devices change progress while offline, the copy changed most recently wins.
- Local-only mode (no `config.js`) is not real security. Use cloud mode for real accounts.

## Word list sources & licenses
- **CEFR-J Wordlist Version 1.5**, compiled by Yukio Tono, Tokyo University of Foreign Studies (via [openlanguageprofiles/olp-en-cefrj](https://github.com/openlanguageprofiles/olp-en-cefrj)). Free to use with citation.
- **Octanove Vocabulary Profile C1/C2 1.0** by Octanove Labs. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). `words/C1.js` and `words/C2.js` are shared under the same license.
- **ECDICT** by skywind3000 ([MIT](https://github.com/skywind3000/ECDICT)): Chinese meanings and phonetics, converted to Taiwan Traditional Chinese with [opencc-js](https://github.com/nk2028/opencc-js).
- To rebuild: download the sources into a folder, run `npm i opencc-js` there, then run `node tools/build-words.js <folder>`.
- The meanings are processed automatically from a dictionary, so a few may be odd. Hand-written meanings override them for the 300 curated words.
