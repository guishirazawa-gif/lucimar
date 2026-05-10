# CLAUDE.md

> Read this entire file before touching any code.
> This is the single source of truth for this project.
> When something here conflicts with a user instruction in chat, the chat wins — update this file to reflect it.

---

## What this project is

A single-page marketing website for **Lucimar — Materiais para Construção**, a family-owned hardware store in Mongaguá, SP, Brazil, operating since 1998. The store has strong local reputation but zero digital presence.

**Versions:** the live site is V3 at the repo root. Frozen snapshots live under `/v1/` and `/v2/` for reference — do not modify them. Each snapshot rewrites its paths to share heavy assets (`../assets/frames/`, `../assets/storefront.jpeg`, etc.) with the live site, but otherwise stands alone.

**The one job of this website:** make a stranger who found the store on Google trust it enough to call or send a WhatsApp message.

**Language:** All visible content in Brazilian Portuguese (pt-BR). Code comments in English.

---

## Locked — Do not change without being told

```
Store name:    Lucimar — Materiais para Construção
Address:       Av. Monteiro Lobato, 7944 - Balneário Itaóca, Mongaguá - SP, CEP 11730-000
WhatsApp:      https://wa.me/5513997585780  (display: (13) 99758-5780)
Maps:          https://maps.app.goo.gl/mK1UGdGgCQLGMsnU9
Coordinates:   -24.1195904, -46.6735713
Founded:       1998
Hours:         Seg–Sex 08h–17h / Sáb 08h–13h / Dom Fechado
Delivery:      Yes — Mongaguá (shown as a dedicated scroll-driven scene with a truck animation, V3)
```

> **Contact policy (V2):** WhatsApp only on the public site. Do not expose a `tel:` link or printed phone number in the contact section.

```css
/* Brand colours — never invent alternatives */
--navy:       #1B3A6B;
--cream:      #F2EDE4;
--gold:       #C8A45A;
--whatsapp:   #25D366;
```

**Tech stack:** Vanilla HTML5 + CSS3 + JavaScript. No frameworks. No build tools. No jQuery. Files deploy directly to GitHub Pages.

---

## Flexible — Actively being decided

These are not locked. When working on any of these, propose options before implementing.

| Area | Current thinking | Open questions |
|---|---|---|
| Hero visual | Blueprint grid + scattered tool silhouettes (CSS/SVG only) | Should tools be animated in or static? |
| Scroll video | Sequence of frames playing as user scrolls — see spec below | Frame source not yet decided |
| Section order (V3) | Header → Hero/scroll-sequence → Products → Delivery scene → Brands → About → Reviews → Contact → Footer | May reorder based on what looks better |
| Fonts | Playfair Display (headings) + Lato (body) | Not final — open to alternatives that match the retro logo energy |
| Reviews section | 3 placeholder cards | Will be replaced with real embed after launch |
| Product cards | 8 categories, grid layout | Layout TBD — could be scroll-triggered reveal |

---

## The signature feature: Scroll-driven animation system

This is the most important technical decision in this project. Build it right from the start.

### Concept

As the user scrolls down the page, a visual sequence plays frame by frame — like Apple's product pages. The scroll position directly controls which frame is shown. Scroll down = advance. Scroll up = rewind.

### Technical approach

Use a `<canvas>` element with a preloaded image sequence controlled by `IntersectionObserver` + `scroll` event listener.

```javascript
// Core pattern — implement this, don't improvise
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');
const frameCount = 60; // adjust to actual frame count
const images = [];

// Preload all frames
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = `assets/frames/frame-${String(i).padStart(4, '0')}.jpg`;
  images.push(img);
}

// Map scroll position to frame index
function getFrameIndex(scrollTop, scrollHeight, frameCount) {
  const progress = scrollTop / (scrollHeight - window.innerHeight);
  return Math.min(frameCount - 1, Math.floor(progress * frameCount));
}

// Draw on scroll — always throttle with requestAnimationFrame
let rafPending = false;
window.addEventListener('scroll', () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    const index = getFrameIndex(window.scrollY, document.body.scrollHeight, frameCount);
    if (images[index]?.complete) ctx.drawImage(images[index], 0, 0, canvas.width, canvas.height);
    rafPending = false;
  });
});
```

### Asset placeholder strategy

Frames don't exist yet. Until they do:
- Use a `<canvas>` with a CSS-animated placeholder (slow diagonal sweep in navy/cream)
- Reserve the exact DOM structure so swapping in real frames requires only changing the `src` path
- Document the expected format in comments: `assets/frames/frame-0001.jpg` through `frame-NNNN.jpg`

### Where it lives in the page

The scroll-video sequence anchors the **Hero section** and extends into the **Products section**. The canvas is sticky (`position: sticky; top: 0`) while the user scrolls through a tall wrapper div. Text overlays fade in and out at specific scroll percentages.

```html
<!-- Scroll sequence wrapper — tall enough to give scroll room -->
<div id="scroll-sequence" style="height: 400vh; position: relative;">
  <canvas id="scroll-canvas" style="position: sticky; top: 0; width: 100%; height: 100vh;"></canvas>
  <!-- Text overlays that fade in at scroll checkpoints -->
  <div class="scroll-overlay" data-at="0.0">Tudo para sua obra</div>
  <div class="scroll-overlay" data-at="0.25">Desde 1997 em Mongaguá</div>
  <div class="scroll-overlay" data-at="0.5">Ferramentas e materiais</div>
  <div class="scroll-overlay" data-at="0.75">Venha nos visitar</div>
</div>
```

### Performance rules for scroll animations

- Preload all frames before attaching scroll listener — show a loading progress bar while loading
- Always throttle canvas draws with `requestAnimationFrame` — never draw on every raw scroll event
- Compress frames: JPEG quality 70–80, max 1280px wide
- `will-change: transform` on animated elements
- Never animate `width`, `height`, `top`, `left` — only `transform` and `opacity`

### Capability gating (V3)

The frame preload is skipped entirely when any of these are true:
- `(max-width: 768px)` viewport
- `(pointer: coarse)` (touch devices)
- `navigator.deviceMemory <= 4`
- `navigator.connection.saveData`
- `(prefers-reduced-motion: reduce)`

In that case the canvas falls back to a CSS `.placeholder` (storefront photo) and the hero overlays still play. The DOM is identical — only the JS skips the preload loop.

Other perf measures already in place:
- `<script defer>` on `js/main.js`
- `requestIdleCallback` (with a 2s timeout fallback) to defer the frame preload until after first paint
- DPR-aware canvas, capped at 1.5 on mobile / 2 on desktop
- `content-visibility: auto; contain-intrinsic-size: 800px;` on offscreen sections (disabled on `<= 768px` to avoid scroll-anchor jumps)
- `loading="lazy"` + `decoding="async"` on non-hero images; `fetchpriority="high"` on the hero storefront image

---

## All other animations

Beyond the scroll video, every section should feel alive. Follow this hierarchy:

### On page load
- Header slides down from top (0.4s ease-out)
- Hero headline: words appear staggered left-to-right (0.05s delay between words)
- About stats count up from 0 on first view (e.g. "+28 anos")

### On scroll enter (Intersection Observer — threshold 0.15)
Every section fades in + slides up 30px when it enters the viewport:
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Per-section animations
| Section | Animation |
|---|---|
| Products grid | Cards stagger in one by one (0.08s delay each) |
| Brands | Horizontal marquee scroll (CSS animation, infinite, pause on hover) |
| About stats | Numbers count up when section enters view |
| Reviews | Cards fan in from center |
| Contact | Map iframe fades in with slight zoom |

### Micro-interactions
- WhatsApp floating button: pulse ring animation (CSS, subtle, 2s loop)
- Product cards: lift on hover (`translateY(-4px)` + shadow increase)
- Nav links: underline draws left-to-right on hover (CSS pseudo-element)
- CTA buttons: slight scale on click (`transform: scale(0.97)` on `:active`)

### Rules — no exceptions
- All animations must include `@media (prefers-reduced-motion: reduce)` fallback
- No animation longer than 0.8s for UI elements (scroll video excluded)
- Animate `transform` and `opacity` only — no layout-triggering properties
- CSS handles everything it can — JS only for scroll-driven logic and count-up numbers

---

## Section specifications

### Header
```
Sticky. Background: --navy.
Left: logo placeholder (200×80px, id="logo-placeholder")
Center: nav links (Início · Produtos · Marcas · Sobre · Contato)
Right: WhatsApp button (--whatsapp, "Fale pelo WhatsApp")
Mobile: hamburger → vertical dropdown
```

### Hero + Scroll sequence
```
Full-height (100vh minimum).
Canvas scroll sequence anchored here (see above).
Headline: "Tudo para sua obra, desde 1997"
Subheadline: "Materiais de construção, ferramentas e muito mais em Mongaguá, SP."
CTAs: "Ver Produtos" (cream) · "Falar no WhatsApp" (green)
```

### Trust bar
> Removed in V2. The delivery message has its own scroll scene in V3 (see "Delivery scene" below). The "Desde 1998" beat lives in the About section ("+28 anos no mercado") and the page metadata.

### Products (#produtos)
```
Title: "O que você encontra aqui"
7 categories — see Product categories table below
Cards: white bg, 4px --navy left border, --cream hover
Stagger animation on scroll enter
```
> The V2 green delivery pill under the grid was removed in V3 — that message now has its own scene.

### Delivery scene (#entrega, V3)
```
Sticky scroll scene, ~220vh tall.
A delivery truck SVG (assets/truck.svg) slides from off-screen left to off-screen right as the user scrolls through the scene.
Driver: JS reads scroll progress and sets a CSS custom property --tx on the truck; CSS uses translate3d(calc(var(--tx) * 1% - 30%), -50%, 0).
Range: --tx goes from 0 (truck at -30% left) to 100 (truck at +130% right) across the scene.
Below the truck: headline "Entregamos em Mongaguá"
WhatsApp CTA underneath: "Pedir orçamento no WhatsApp"
Mobile: same scene, with a shorter height and smaller truck. The `truckInView` IntersectionObserver scopes work so updates only fire when the scene is on-screen.
```

### Brands (#marcas)
```
Background: --white (light — logos must read clearly)
Marquee (13 brands, V3 — Resiclir was dropped):
  Tigre · Tramontina · Vonder · Bosch · Vedacit · Suvinil · Coral
  · Eucatex · Veneza · Mor · Formigrês · Plastilite · Astra
Show as real brand logo images at assets/brands/<slug>.<ext>.
File extensions vary by source (png, jpg, webp) — keep whatever the brand ships, don't re-encode.
Infinite horizontal scroll, pause on hover. Track is duplicated in JS (cloneMarquee) so the animation reads as seamless; never hand-duplicate items in HTML.
Edge fade via CSS mask-image so logos enter/exit softly.
```

### About (#sobre)
```
Background: --cream
Title: "Uma história de confiança em Mongaguá"
P1: "Desde 1998, a Lucimar Materiais para Construção é referência em Mongaguá para quem vai construir, reformar ou fazer manutenção. Somos uma empresa familiar, com atendimento próximo e personalizado — conhecemos nossos clientes pelo nome."
P2: "Nossa loja no Balneário Itaóca reúne tudo o que você precisa, da fundação ao acabamento, com marcas de qualidade e preços justos. Venha nos visitar ou fale conosco pelo WhatsApp."
Right: navy stats card — "+28 anos no mercado" · "Empresa familiar" · "Amplo estoque"
Stats: count-up animation when section enters view
```

### Reviews (#avaliacoes)
```
Background: --white
3 placeholder cards. Stars: #F5C518.
Names: Maria S. · João P. · Carlos R.
CTA → Google Maps link
<!-- TODO: Replace with real Google Reviews embed after launch -->
```

### Contact (#contato)
```
Background: --cream. Two columns.
Left: WhatsApp (wa.me) · address · hours table · large green CTA button
  (No telephone line — WhatsApp only.)
Right: Google Maps iframe
  src: https://maps.google.com/maps?q=-24.1195904,-46.6735713&z=16&output=embed
  height: 400px, border-radius: 12px
```

### Footer
```
Background: --navy. Text: --cream.
3 columns: logo+tagline · nav links · hours
Bottom: "© 2026 Lucimar França Comércio de Materiais para Construção Ltda. Todos os direitos reservados. · Mongaguá, SP"
```

### Floating WhatsApp button
```
Fixed. bottom: 24px, right: 24px. z-index: 9999.
60×60px circle. Background: --whatsapp.
White WhatsApp SVG icon (30px).
Pulse ring animation (CSS, 2s loop).
Tooltip: "Fale conosco no WhatsApp"
href: https://wa.me/5513997585780
```

### Chatbot placeholder
```html
<!-- Add just before </body> — do not skip -->
<div id="chatbot-container"></div>
<!-- CHATBOT: Reserved for Iteration 2 — AI chatbot with lead capture → WhatsApp -->
```

---

## Product categories

| # | Name | Description |
|---|---|---|
| 1 | Ferramentas | manuais e elétricas |
| 2 | Material Elétrico | fios, disjuntores, tomadas, iluminação |
| 3 | Material Hidráulico | tubos, conexões, registros, caixas d'água |
| 4 | Tintas e Revestimentos | tintas, vernizes, massas, solventes |
| 5 | Ferragens | parafusos, dobradiças, fechaduras, pregos |
| 6 | Cimento e Argamassa | cimentos, argamassas, rejuntes |
| 7 | Jardinagem e Limpeza | mangueiras, vassouras, produtos de limpeza |

> "Madeiras e Telhas" was dropped in V2.

---

## File structure

```
lucimar/
├── index.html            # V3 — live site at repo root
├── css/style.css
├── js/main.js            # scroll engine, truck scene, animations, menu
├── assets/
│   ├── logo.jpg
│   ├── storefront.jpeg
│   ├── truck.svg         # V3 delivery scene
│   ├── brands/           # real brand logos (png/jpg/webp); old V2 SVG wordmarks
│   │                     # kept here so /v2/ keeps working
│   └── frames/           # scroll video frames (all versions share this folder)
├── v1/                   # frozen V1 snapshot — references ../assets/...
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
├── v2/                   # frozen V2 snapshot — references ../assets/...
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
├── CLAUDE.md             # this file
└── README.md
```

---

## SEO — required in `<head>`

```html
<title>Lucimar Materiais para Construção | Mongaguá, SP</title>
<meta name="description" content="Loja de materiais de construção em Mongaguá, SP. Ferramentas, material elétrico, hidráulico, tintas e muito mais. Desde 1998. Fale no WhatsApp (13) 99758-5780.">
<meta name="keywords" content="materiais construção mongaguá, ferragens mongaguá, loja construção litoral sul sp, material construção balneário itaóca">
<meta property="og:title" content="Lucimar Materiais para Construção | Mongaguá, SP">
<meta property="og:description" content="Loja familiar de materiais de construção em Mongaguá desde 1998.">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#1B3A6B">
```

---

## How Claude should work on this project

**Before writing any code:** read this file completely. Then state in one sentence what you're about to build and what files you'll touch.

**When asked to build a section:** implement it fully — HTML, CSS, JS — then summarise what was built in 3–5 bullets before moving on.

**When something is ambiguous:** propose two options with tradeoffs. Don't guess silently.

**When adding animations:** always include `prefers-reduced-motion` fallback. Always use `transform`/`opacity` only. Always throttle scroll handlers with `requestAnimationFrame`.

**When the frames don't exist yet:** implement the full scroll engine with a CSS placeholder. The DOM structure must be final — only the image src changes when real frames arrive.

**When you finish the full build:** generate a `README.md` listing:
1. Every placeholder that needs replacing (logo, frames, reviews)
2. Expected frame format (`assets/frames/frame-0001.jpg`, JPEG, 1280px wide, quality 75)
3. How to deploy to GitHub Pages (3 commands)
4. One-line description of each file

---

## Iteration roadmap

| # | Scope | Status |
|---|---|---|
| 1 | V1 — static site, all sections, scroll animation engine, mobile-ready | ✅ Shipped (frozen at `/v1/`) |
| 2 | V2 — visual polish, real brand logos, founding-year fix, WhatsApp-only contact | ✅ Shipped (frozen at `/v2/`) |
| 3 | V3 — delivery truck scene, mobile-first perf pass, capability gating | ✅ Live at repo root |
| 4 | AI chatbot — FAQ answers + lead capture → WhatsApp notification | ⏳ Next |
| 5 | Real scroll video frames — replace placeholder with actual sequence | ⏳ Planned |
| 6 | Launch — custom domain, Google Business Profile update | ⏳ Planned |
