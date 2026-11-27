# English Quest (MVP)

Gamified English practice web app, with vocabulary and grammar from CEFR A1 to C2.

## How to run
No install or build step. Pick one:
- Double-click `index.html` to open it in a browser.
- Or start a local server: `python3 -m http.server 8000`, then open http://localhost:8000. Phones on the same Wi-Fi can open it at the computer's IP address.

## Features
- **Login / register**: Accounts live in the browser (localStorage). Passwords are stored as salted SHA-256 hashes.
- **Placement test**: Adaptive, 3 questions per level from A1 up. Passing a level (2 of 3 correct) moves you to the next one. Your recommended level is the first level you don't pass.
- **Choose your level**: Change it any time from the level chip at the top or from the Level path.
- **Lessons**: Vocabulary, Grammar, or Mixed. Each lesson has 8 questions and 3 hearts. A wrong answer is asked again once at the end of the lesson. Questions you haven't mastered come first.
- **Gamification**: XP (10 per first-try answer, 5 per retried answer, +5 for a perfect lesson), combos, daily goal, day streak, 12 achievements.
- **Mistakes book**: Every wrong answer is saved. Answer a question correctly in Review to clear it.
- **Profile**: Accuracy, weekly XP chart, achievements, recent lessons, daily-goal setting, retake the placement test.
- Keyboard: press `1`–`4` to choose an answer and `Enter` to check or continue.

## Files
- `index.html`: entry page
- `styles.css`: styles (supports dark mode, works on phone and desktop)
- `questions.js`: question bank (6 levels × 2 skills × 10 questions = 120 questions)
- `app.js`: app logic

## Adding questions
In `questions.js`, add a row to `BANK.<level>.<skill>`:
`["prompt with ___", ["correct", "wrong1", "wrong2", "wrong3"], 0, "explanation"]`
The answer index is the third value. Options are shuffled automatically when shown.

## Known limitations
- Data is stored only in this browser on this device. Cross-device sync needs a backend such as Supabase or Firebase.
- This is a personal MVP. The local login is not real security.
