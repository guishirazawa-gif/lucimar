# Lucimar — Materiais para Construção

Single-page marketing website for a family-owned hardware store in Mongaguá, SP, Brazil.

## Placeholders to replace

| Placeholder | Location | What to add |
|---|---|---|
| Logo | `#logo-placeholder` in header + footer | Replace text logo with `assets/logo.png` (200×80px) |
| Scroll video frames | `assets/frames/` | JPEG sequence: `frame-0001.jpg` through `frame-0060.jpg`, 1280px wide, quality 75 |
| Reviews | `#avaliacoes` | Replace 3 placeholder cards with real Google Reviews embed |

## Expected frame format

```
assets/frames/frame-0001.jpg
assets/frames/frame-0002.jpg
...
assets/frames/frame-0060.jpg

Format: JPEG
Width: 1280px
Quality: 75
```

Until real frames are added, the hero section shows an animated CSS gradient placeholder. The scroll engine is fully wired — dropping frames into the folder activates them automatically.

## Deploy to GitHub Pages

```bash
git init && git add -A && git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USER/lucimar-site.git
git push -u origin main
```

Then enable GitHub Pages in repo Settings → Pages → Source: `main` branch, root folder.

## File overview

| File | Description |
|---|---|
| `index.html` | Complete single-page site with all sections (Header, Hero, Trust bar, Products, Brands, About, Reviews, Contact, Footer) |
| `css/style.css` | All styles: layout, brand colours, animations, responsive breakpoints, `prefers-reduced-motion` fallbacks |
| `js/main.js` | Scroll-driven canvas engine, IntersectionObserver reveals, count-up numbers, hero word stagger, mobile menu |
| `assets/logo.png` | Logo placeholder (drop real file here) |
| `assets/frames/` | Directory for scroll video frame sequence |
| `CLAUDE.md` | Project specification and single source of truth |
