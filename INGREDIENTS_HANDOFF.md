# Savage Skin — Ingredients Page Handoff

Paste this whole file into a new chat to pick up where we left off (especially to
**test other hero visuals** for the `/ingredients` page).

---

## TL;DR for the new chat

The `/ingredients` page is a scroll experience: a glass dropper bottle sinks
through the formula while ingredient **labels + a color wash** sync to scroll.
The hero visual is a **pre-rendered video, sliced into image frames** and
scrubbed on a `<canvas>` (smooth on desktop; mobile uses an autoplay video
fallback). Brianna wants to try **other generated clips** in this slot.

The page is **LIVE** at https://savageskincare.com/ingredients/ (linked from the
nav "Ingredients").

---

## Project basics

- **Local path:** `~/Desktop/Savage Skin/savage-skin/` — the folder name has a
  **trailing space**. Always `cd ~/Desktop/Savage*/savage-skin` (glob) or escape
  it: `cd ~/Desktop/Savage\ Skin/savage-skin`.
- **User:** Brianna — solo founder, non-engineer. Give exact paste-ready
  commands, one block at a time; explain in plain language; don't propose
  framework/tooling rewrites.
- **Dev server:** `npm run dev` → open the local link → click **Ingredients**
  (or go to `/ingredients/`). View on a **desktop-width** window — the smooth
  canvas scrubber only runs above 760px; narrower uses the video fallback.
- **Build:** `npm run build` (Vite 4, vanilla JS, no framework — keep it that way).
- **Working branch:** `launch-readiness`. The live site deploys from **`main`**
  via GitHub Actions → GitHub Pages.
- **Deploy command (what we use):**
  ```bash
  cd ~/Desktop/Savage*/savage-skin
  git add <specific paths>            # NEVER `git add .` — see gotchas
  git commit -m "..."
  git push origin launch-readiness            # update feature branch
  git push origin launch-readiness:main       # deploy to live
  gh run list --branch main --limit 1         # confirm the build goes green
  ```

---

## How the ingredients page is built

| File | Role |
|---|---|
| `ingredients/index.html` | The page. Has `<canvas id="ingFrames">` (desktop scrubber), `<video id="ingVideo">` (mobile fallback), `<div id="ingTint">` (color wash), product switcher, scroll container. |
| `src/ingredients-page.js` | Orchestrator: builds the switcher + per-ingredient label cards, maps scroll→progress, drives the color wash (`applyTint`), syncs the active label. |
| `src/ingredients-video.js` | The hero controller. **Desktop:** preloads JPG frames and flips them on the canvas as you scroll. **Mobile/reduced-motion:** autoplay-loop video. Holds `FRAME_COUNT` + `PLACEHOLDER_VIDEO`. |
| `src/ingredients-data.js` | Per-product ingredient list: `name`, `pct`, `type` (liquid/powder), `color`, `effect`. **Copy is a DRAFT — Brianna to correct.** |
| `src/styles.css` | Search `/ingredients —` for the page styles (`.ing-*`, `.ing-tint`). |
| `public/ingredient-descent.mp4` | The current hero clip. |
| `public/ingredient-frames/f_001.jpg …` | The clip sliced to frames (currently **121**). |

---

## ▶ How to test a NEW hero visual (the main task)

### 1. Generate a clip (Higgsfield video MCP, costs credits)
The connected video MCP tool is `…__generate_video` (provider: Higgsfield).
- **Check balance first:** call `…__balance`. Brianna is on the **starter** plan.
- **Model:** use `cinematic_studio_3_0` (Cinema Studio 3.0). *Veo 3.1 looks even
  better but is gated to the Plus plan — don't use it on starter.*
- **Cost:** ~**30 credits per 6-second clip**. Preflight with `get_cost: true`.
- **ALWAYS pass `aspect_ratio` and `duration` explicitly** (omitting them
  defaults to 16:9 / 15s, which costs more). Use `aspect_ratio: "16:9"`,
  `duration: 6`.
- **Prompt recipe that worked** (boundless liquid + graceful spin + layers):
  > Hyperrealistic macro cinematic shot, camera fully immersed INSIDE a boundless
  > body of liquid that fills the entire frame edge to edge. NO container, no
  > glass walls, no jar, no tank, no visible edges. A frosted glass serum dropper
  > bottle sinks straight downward in slow motion, rotating very slowly and
  > gracefully with no abrupt flips, descending through distinct color zones —
  > amber-gold, then pale blue, then blush, then pale violet — with gentle ripples
  > and suspended droplets. Volumetric backlight, shallow depth of field, dark
  > elegant premium beauty commercial, seamless continuous downward descent.
- Poll with `…__job_display` (id from the generate call) until `completed`; grab
  `results.rawUrl`.
- Top-ups (if low): `…__show_plans_and_credits` (intent `topup`); the **500-credit
  pack ($26)** is plenty (~16 clips). Don't push the $190 pack.

### 2. Wire the clip in (paste-ready)
```bash
cd ~/Desktop/Savage*/savage-skin

# a) download the rendered clip — replace RAW_URL with results.rawUrl
curl -fsSL "RAW_URL" -o public/ingredient-descent.mp4

# b) re-encode so EVERY frame is a keyframe (this is what makes scrubbing smooth)
ffmpeg -y -i public/ingredient-descent.mp4 -an -c:v libx264 -preset slow -crf 20 \
  -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  public/_tmp.mp4 && mv public/_tmp.mp4 public/ingredient-descent.mp4

# c) re-slice into frames, then print the new frame count
rm -rf public/ingredient-frames && mkdir -p public/ingredient-frames
ffmpeg -y -i public/ingredient-descent.mp4 -vf "fps=20,scale=1280:-2" -q:v 5 \
  public/ingredient-frames/f_%03d.jpg
ls public/ingredient-frames/*.jpg | wc -l
```
Then in **`src/ingredients-video.js`**:
- set `FRAME_COUNT` to the number printed above, and
- bump the cache-buster `?v=N` on BOTH `FRAME_SRC` and `PLACEHOLDER_VIDEO`
  (e.g. `?v=3`) so browsers fetch the new files.

### 3. Test + deploy
```bash
npm run dev    # open /ingredients/ in a DESKTOP-width window, scroll slowly
```
Then deploy with the block in "Project basics."
Commit paths: `public/ingredient-descent.mp4 public/ingredient-frames src/ingredients-video.js`

> `ffmpeg` is installed (via Homebrew). If a new machine lacks it: `brew install ffmpeg`.

---

## Tuning knobs

- **Color wash strength:** `applyTint()` in `src/ingredients-page.js` sets opacity
  up to `0.7`; blend mode is `mix-blend-mode: soft-light` on `.ing-tint` in
  `styles.css`. Raise the `0.7` or switch to `overlay`/`color` for stronger.
- **Ingredient names / colors / order / %:** `src/ingredients-data.js`
  (**still draft copy — needs Brianna's corrections**).
- **Bottle look & motion:** comes from the *generated clip* (the prompt), not code.

---

## Current state

- ✅ `/ingredients` page LIVE; smooth desktop scrubbing; mobile autoplay fallback.
- ✅ Hero clip = boundless liquid, graceful slow spin (Brianna's favorite take).
- ✅ Color wash + labels synced to scroll; product switcher (5 products).
- ⚠️ **One shared clip for all 5 products** — the switcher changes the labels +
  color wash, but the video is the same. Per-product clips would need a clip +
  frame set per product and a small refactor of `ingredients-video.js`.
- ⚠️ **Ingredient copy is DRAFT** in `src/ingredients-data.js` — correct it.
- 💳 Higgsfield credits: check with `…__balance` (was ~170 after the last clip).

## Gotchas learned this session

- **Don't `git add .`** — `blog/` and `scripts/` are uncommitted, in-progress
  work. Sweeping them in breaks the build. Stage specific paths only.
- **Blog IS published now** (Journal nav/footer links work). The site uses the
  pre-generated `blog/**/index.html` (committed). To edit/add posts: the markdown
  sources live in **`~/Desktop/Savage Skin/Blog/*.md` (OUTSIDE the repo)**; run
  `npm run blog` to regenerate, then commit the updated `blog/` files.
- **Video scrubbing must use the frame/canvas approach** — seeking a `<video>`
  on scroll stutters. That's why we slice to JPGs.
- The live preview tool in chat renders at phone width — judge the desktop
  experience on Brianna's real screen, not in-chat screenshots.
