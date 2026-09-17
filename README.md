# Birthday Garden

An interactive birthday countdown that unlocks at midnight on **8 October 2026**
in the visitor's local timezone. The reveal includes an animated flower garden,
confetti, a photo wall, and a birthday letter.

## Add your photos

Put four photos in `public/photos/` with these exact names:

- `01.jpg`
- `02.jpg`
- `03.jpg`
- `04.jpg`

Until those files exist, the site automatically displays the included illustrated
placeholders. Landscape and portrait images both work; portrait photos crop best.
Update the captions and alt text in `src/components/MemoryCollage.jsx`.

## Customize the message

Edit the birthday letter and hero copy in `src/App.jsx`.

## Preview

```powershell
npm install
npm run dev
```

The normal URL shows the countdown. To preview the unlocked birthday experience
before October 8, add `?preview=birthday` to the URL:

```text
http://localhost:5173/?preview=birthday
```

## Production

```powershell
npm run lint
npm run build
```

The repository remains configured for Vercel:

- Build command: `npm run build`
- Output directory: `dist`
