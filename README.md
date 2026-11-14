# Doodle Words ✏️📖

A reading game for first graders who love to draw.

1. **Opening scene.** Hand-drawn characters walk, fly, parachute and ride a conveyor belt into an open book (about 4 seconds, plays once).
2. **"What is your name?"** The child types their name and taps **Next**. The right page flips over like a real book.
3. **Word pages (endless).** Each page shows one short, decodable word (`cat`, `dig`, `bus`, `fish`…) with tap-to-hear letter sounds, **Hear it** and **Sound it out**, plus a simple sentence. The right page is a crayon drawing box. **Next** flips to a new word.
4. **I'm done! 🎬** Claude Opus (`claude-opus-5-5`) looks at the drawings and directs a 15–30 second movie: title, story order, an easy-to-read caption about each picture, and the motion, effects and colors. The browser animates the movie and records it, and the child can **Save movie** (mp4 or webm) and **Save drawings** (a .zip of PNGs).

If the API isn't configured or is unreachable, the movie still plays using a built-in storyboard.

## Project layout

| Path | What it is |
|---|---|
| `index.html`, `css/styles.css` | Book layout (two-page spread; stacks top/bottom on phones) |
| `js/intro.js` | Animated SVG opening scene |
| `js/app.js` | Flow, page-flip animation, word pages |
| `js/words.js` | First-grade word bank + phonics sounds |
| `js/pad.js` | Drawing pad (crayons, sizes, eraser, undo) |
| `js/movie.js` | Movie renderer + recorder, Opus storyboard client |
| `js/sound.js` | Page-flip sound, music, read-aloud (speech synthesis) |
| `api/storyboard.js` | Vercel serverless function that calls Claude Opus |

There's no build step; it's plain HTML/CSS/JS plus one Node function.

## Deploy on Vercel

1. In Vercel: **Add New → Project → Import** `lucyzhang04/Illustrator_2`. Framework preset: **Other**. Leave build settings empty.
2. **Settings → Environment Variables**: add `ANTHROPIC_API_KEY` (from console.anthropic.com). Optional: `STORYBOARD_EFFORT` = `low` (default, fastest) / `medium` / `high`.
3. Deploy. Every push to `main` redeploys automatically.

## Run locally

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run dev   # http://localhost:3000
```

## Not in v1 (planned)

Logins and saved progress, more reading levels and age groups, sentences, and a native app.
