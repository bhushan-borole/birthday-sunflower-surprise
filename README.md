# A Little More Than Words

A birthday note that becomes a sunflower garden, built with React, Motion and an adapted
open-source CSS plant animation. There are no candles, gift-box mini-games,
draggable card walls, autoplay music or WebGL requirements.
The entire experience stays in dark mode, with deep-rose backgrounds, cream text
and soft pink accents, including the message scenes and portrait popup.

## Experience

The normal URL counts down to **local midnight on 8 October 2026**, using the same
deep-rose palette, blush-pink numerals and blooming golden sunflowers as the finale.
The floral decoration automatically respects OS reduced-motion settings. At zero:

1. A 3.6-second romantic reveal draws a glowing heart, sends petals drifting outward
   and reveals "Today is all about you."
2. The portrait popup then opens automatically with a gentle entrance.
3. Closing it, pressing Escape, or choosing **Step inside** starts the story.
4. **Begin / Continue / Back** move through personal messages and two photo-led
   chapters at the reader's pace. Each supplied couple photograph gets its own
   full, uncropped frame with a short romantic message.
5. The finale grows sunflowers from small buds: two rings of golden petals unfurl,
   revealing dark seed centres with golden-angle spiral patterns.

**Skip to flowers** goes directly to the finale. **Replay** restarts the story,
not the reveal or welcome dialog. Reloading the unlocked page plays the reveal again.
**Open my surprise** skips the reveal directly to the portrait. The OS reduced-motion
setting replaces the moving reveal with a brief 0.8-second still dedication.
The OS reduced-motion setting shows the fully bloomed garden without animation;
there are no on-screen motion controls. No personal pictures or messages are sent anywhere.

## Local preview

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

Before the birthday, review the welcome popup and story at:

`http://127.0.0.1:4173/?preview=birthday`

The preview bypass applies to that URL only; it never persists or changes the date.

## Photographs and copy

- The welcome dialog uses the user-supplied **`src/img/popup.jpg`**, bundled locally
  by Vite. The crop uses `object-position: center 62%` to keep the face in frame.
- The two couple-photo chapters use **`src/img/Image (4).jpg`** followed by
  **`src/img/Image (5).jpg`**. They are bundled locally, displayed without cropping,
  tinting or filters, and are separate from the solo portrait used by the popup.
  The desktop layout alternates photograph and copy; phones use a vertical layout.
- Optional additional photographs are `public/photos/01.jpg` through `04.jpg`.
  Existing files are discovered by Vite and appended after the supplied photos;
  restart the server after adding them. Missing optional images and the old
  illustrated placeholders are never rendered.
- Captions, birthday date and story text are in `src/App.jsx`.
- The popup's message and portrait import are in `src/components/BirthdayWelcome.jsx`.
- A failed image shows an explicit message and never blocks navigation.

## GitHub references and attribution

- [faahim/happy-birthday](https://github.com/faahim/happy-birthday) inspired the
  sequential birthday-message concept. The React story and wording here are original;
  no code, recipient information or media from that project was copied.
- [gmpsankalpa/Flower-animation](https://github.com/gmpsankalpa/Flower-animation)
  supplies the actual flower growth, leaves and glowing-light choreography.
  Copyright (c) 2024 GMP Sankalpa, **MIT license**.
  Pinned source: `345fc7886294d05fcaf08e3b3f95b9c198eab54e`.
  The full license ships at `public/licenses/Flower-animation.txt`.
  The HTML was adapted to a React component, and the compiled CSS was scoped to
  `.bloom-garden`, given container-relative sizing and a warm botanical palette.
  Reduced-motion states, responsive framing and story integration are local additions.
  Upstream audio, scripts and unrelated assets were not imported.
- [Motion](https://motion.dev/) (`framer-motion`, MIT) handles scene transitions.
- [Lucide](https://lucide.dev/) (ISC) supplies interface icons.

### Sunflower design

The sunflower heads in `src/components/SunflowerHead.jsx` are original SVG artwork:
36 petals per flower, a dark centre, and 144 seeds placed using the golden angle.
Local CSS stages the bud opening, staggered petal unfurling and seed-centre reveal.
The existing MIT-licensed garden continues to provide growing stems, leaves and lights.
Both the countdown and story finale use the same sunflower component.

GitHub options reviewed before choosing this approach:

- [Tendril](https://github.com/TonkaTuff/tendril) (MIT) is a real dependency-free
  Canvas 2D plant library with sunflower and sunflower-field modes. Its dot-based,
  sun-following rendering is not a layered petal-opening animation.
- [SunFlowers-Animation](https://github.com/NermeenKamal/SunFlowers-Animation)
  (MIT) is an image-based garden/watering demo, rather than a reusable bloom library.

Neither project's code or assets were copied or installed. The original SVG heads
fit the existing garden without another runtime dependency. The sunflower changes
do not alter the upstream CSS or its attribution.

The upstream CSS and license can be regenerated from the pinned source with
`node scripts/vendor-flowers.mjs`. This development-only command downloads only
the stylesheet and license; the delivered website does not contact GitHub.
Local layout and accessibility adjustments are in `src/styles/garden.css`.

## Checks and production

```powershell
npm run lint
npm test
npm run build
```

Playwright uses installed Microsoft Edge on Windows. Elsewhere, first run
`npx playwright install chromium`. Tests cover midnight popup ordering, portrait
loading/failure, focus trapping, keyboard navigation, sequence/replay, actual
flower growth, reduced motion and phone/tablet/desktop layouts. Screenshots and
failure traces are in the ignored `test-results` directory.

Vercel remains configured for `npm run build` with `dist` as output. Building does
not deploy the site.
