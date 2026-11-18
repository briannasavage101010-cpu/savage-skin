# Savage Skincare homepage — design brief (redesign/homepage)

Written before building, 2026-11-18. The brief's own words win wherever they pin something down.

## Idea

**The page is the photo studio.** Every Lip Pod render was shot on the same blush paper sweep in
the same warm light. The page uses that sweep as its ground, so the product never sits in a box or
a card: it sits in the room, edge to edge. Everything else stays quiet so the Pod and the type do
the work.

- **Signature moment, "drawing to object":** in *How does the Lip Pod work?* the design drawing
  develops into the finished concept render as you scroll, while the three answers (it clips on,
  the tube swaps, the halves snap together) scroll past beside it. The two source images are
  pixel-aligned (checked: best overlap at 0,0 offset), so the wipe is exact. It is also the
  honest part: this is the drawing the designers work from.
- **Motion verb:** *settle, like a pendant coming to rest on its chain.* Weighted ease-out, no
  bounce, no overshoot.
- **First 3 seconds:** calm, expensive, a little cheeky. A huge serif question beside the Pod
  hanging off a phone.

## Palette (sampled from the renders, contrast computed)

| Name | Hex | Role | Contrast |
|---|---|---|---|
| Sweep | `#F7EAE4` | page ground = the renders' backdrop | ink 14.6:1 |
| Porcelain | `#FCF6F2` | raised ground (offer, FAQ, form fields) | ink 16.1:1 |
| Garnet | `#2A1519` | text, primary button, closing band | — |
| Cocoa | `#6E5156` | secondary text | 6.0:1 on Sweep |
| Rose gold | `#A9705F` | hairlines and large graphic details only (from the Pod's hardware) | 3.5:1, never small text |
| Savage pink | `#FF2D95` | brand accent, sparingly: the "now" marker, text on the dark band (5.0:1) | 2.9:1 on light, so decorative only there |

Functional variants: `#D1006E` (pink, text-safe on light, 4.5:1) for focus rings and link hover;
`#F0B5B4` (the gloss itself) as a soft selected-state fill.
No gradients, no glows, no glass blur, no tinted-grey shadows.

## Type (two families, upright only)

- **Display: Boska 500** (Fontshare, ITF Free Font License, self-hosted, 30 KB). High contrast for
  the luxury read; sharp, slightly narrow forms for the "bold, not harsh" bite; the narrow width
  lets the hero question run huge on a 390 px phone. Chosen from 8 faces rendered with the real
  headline. Not Fraunces / Instrument Serif / Playfair (the reflex serifs).
- **Text and UI: Schibsted Grotesk** 400/500/600 (already approved 2026-11-18, self-hosted, 47 KB).
- Body 17–18 px at 1.55, measure under 70 characters. Display tracking negative and set per size.
  No italics, no all-caps eyebrow labels, no monospace, no single pink accent word in headlines.

## Imagery

- Only the six real concept renders from the product brief. No AI images, no stock.
- Hero: *clipped to your phone*, full height. Exploded view + design drawing: the signature wipe.
  Gloss droplet macro: a full-bleed decorative band in the ingredients section. Bag and wrist:
  the vote.
- **Every product image keeps a visible "Concept render" label.** Edges of renders are feathered
  into the Sweep so no frame shows.
- Served as AVIF/WebP with JPEG fallback, descriptive file names, explicit width/height, hero
  preloaded, everything below the fold lazy.
- Founder photo: a clearly marked placeholder frame. Lifestyle photos: none exist yet (flagged).

## Layout (a different family per section, one 12-column grid, 4/8/16/24/40/64/104 px spacing)

```
HERO          | huge question, clean line,    |  phone + Pod photo,      |
(split)       | CTA, one text link, trust row |  full height, bleeds off |
              | "What is the Lip Pod?" answer |                          |
PROBLEM       H2 + answer (sticky) | four moments as a typographic 2x2, no cards, no numbers; punchline
HOW IT WORKS  H2 + answer, then the sticky stage: drawing -> render wipe | three question answers scroll
INGREDIENTS   specimen list (name / one plain line) | gloss macro render + the leave-out list
FOUNDER       Brianna's note in serif, small marked photo placeholder at the signature
  + STATUS    | where it is now: ONE vertical timeline, then the preorder terms, once
VOTE          two pickers side by side: how you'd wear it (3 renders), which flavor (4 type toggles)
OFFER         studio render, full bleed | price sheet: $24 vs $32 set big, the facts once, buy buttons
FAQ           H2 rail left | all nine existing questions, native <details>, right
CLOSE         garnet band: last line + CTA | the join form as a rail; giant wordmark footer
```
(As built. The first draft had a separate definition band and a large photo placeholder; the
jury review and the length target moved both.)

Radius rule: 0 on images, 2 px on controls. Hairlines only where a list needs scanning.

## Motion (genjutsu cast thesis + GSAP skills)

**Interaction thesis:** the Pod arrives once and then settles. A single orchestrated hero load
(headline lines rise from a mask, 0.9 s, `cubic-bezier(.16,1,.3,1)`, 70 ms stagger; the photo
settles from 1.06 scale over 1.6 s), one scroll-scrubbed signature (drawing to render), slow
unmask reveals on large imagery only (1.1 s, once), a 0.85x parallax drift on the hero and macro
band, a nav that condenses after 24 px of scroll, and CTA hovers where the garnet fill rolls up to
rose in 320 ms. Under reduced motion: no smooth scroll, no scrub, no intro, everything visible.

Allowed patterns: the 5-item trust row the brief asks for (rendered as a list with hairline
separators, not middle dots); "Concept render" labels on images (required by the brief); the em
dash in "Preorder the Lip Pod — $24" and in the nine FAQ answers kept word for word (the brief's
text); a slow push-in on the hero photo that runs once (the brief's "floating"), not a loop.

Engineering: CSS for the hero intro and hovers (works before any JS); GSAP 3.15 + ScrollTrigger
and Lenis load lazily after first paint, so they never touch LCP. Transform, opacity and
clip-path only. One clock (GSAP ticker drives Lenis). `gsap.matchMedia()` gates everything on
`prefers-reduced-motion`.

Changed during the build (measured, not guessed):
- The hero photo's 1.6 s "settle" on load was dropped. It is the LCP element, and it was not the
  cause of a slow LCP after all, but a load animation on the LCP image is a risk with no payoff.
  The photo still drifts on scroll and floats under the pointer on desktop.
- Only the headline font is preloaded. Preloading the body font as well pushed Lighthouse's
  simulated mobile LCP from 1.8 s to 2.7 s; without it CLS stays 0 thanks to the metric-matched
  fallback faces.
- The "What is the Lip Pod?" answer moved into the hero's lower left, where the old layout left
  a dead gap. It is the first thing under the fold on phones.

## Honesty rules this build follows

- Prices, shipping, refund policy, ingredient claims, hello@savageskincare.com, checkout links,
  form fields, SMS wording, analytics and consent behaviour: unchanged.
- The $24 / $32 / free shipping / 500-unit / refill offer is stated once. The preorder terms are
  stated once (founder + status section), linked from the offer.
- The old page showed 608 invented vote counts. They are gone. No counts or percentages are shown
  until a real tally exists (votes only reach Klaviyo with a signup today).
- No reviews, ratings, counts or certifications that don't exist. "Sourced organic wherever we can
  get it" stays worded exactly that way.

## Genericness test (what changed after reviewing this plan)

1. First instinct was cream `#F4F1EA` + serif + terracotta, the AI default. Replaced with the
   renders' own blush sweep, garnet ink and rose gold, so page and product share one light.
2. First instinct for *How it works* was three equal cards. Replaced with the sticky
   drawing-to-render stage, which only this product can have.
3. Eyebrow labels over every heading were the old page's chrome. Dropped; the question headings
   carry the structure (and the SEO).
4. Hero float as an infinite loop would be the "perpetual motion" tell. It runs once and settles.
