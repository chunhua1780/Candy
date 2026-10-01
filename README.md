# Year 7 Study

A home study site for a Year 7 pupil (UK, Key Stage 3). It runs on GitHub Pages and can be added to an iPad home screen like an app.

**Site:** https://chunhua1780.github.io/candy/ · **Parents:** https://chunhua1780.github.io/candy/parent.html

## What's inside

- **Maths:** a bank of 3,000 Key Stage 3 questions in 19 topics, including number, fractions, percentages, ratio, algebra, equations, sequences, graphs, angles, area, volume, probability and statistics. Each day the pupil gets a random set of 20 questions; questions answered wrongly come back. Any topic can also be practised on its own, and angle and shape questions come with diagrams.
- **Reading:** 200 Year 7 articles, about 10 minutes a day. They include stories, non-fiction, history, science, biographies, speeches and letters, and classic poems. Tap any word to hear it and see its meaning, then answer 6 comprehension questions.
- **Words:** 10 vocabulary words a week across 40 weeks of the school year, starting from week 1 on 28 Sept 2026. Each word has a meaning and an example sentence. Practice covers spelling, meanings and dictation, with spaced review.
- **Parent page:** streaks, reading minutes, maths results by topic, and custom word lists.

## Setup

The site uses the same Supabase project as Wendy's site, so no database setup is needed. Open the site, tap **Create account**, and choose a name and PIN for the pupil. Progress syncs across devices. Parents sign in on `parent.html` with the same account.

### Add to iPad home screen

Open the site in **Safari**, tap **Share**, then **Add to Home Screen**.

## Editing

- Maths bank: `python3 tools/build_maths.py` regenerates `maths-bank.js`.
- Readings: edit `tools/readings/*.js`, then run `node tools/build_readings.js`. The script checks every article and writes `readings.js`.
- Weekly words: `words7.js`.
