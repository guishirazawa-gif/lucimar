# CLAUDE.md

> Read this entire file before touching any code.
> This is the single source of truth for this project.
> When something here conflicts with a user instruction in chat, the chat wins — update this file to reflect it.

---

## What this project is

A single-page marketing website for **Lucimar — Materiais para Construção**, a family-owned hardware store in Mongaguá, SP, Brazil, operating since 1997. The store has strong local reputation but zero digital presence.

**The one job of this website:** make a stranger who found the store on Google trust it enough to call or send a WhatsApp message.

**Language:** All visible content in Brazilian Portuguese (pt-BR). Code comments in English.

---

## Locked — Do not change without being told

```
Store name:    Lucimar — Materiais para Construção
Address:       Av. Monteiro Lobato, 7944 - Balneário Itaóca, Mongaguá - SP, CEP 11730-000
Phone:         (13) 3448-7000
WhatsApp:      https://wa.me/551334487000
Maps:          https://maps.app.goo.gl/mK1UGdGgCQLGMsnU9
Coordinates:   -24.1195904, -46.6735713
Founded:       1997
Hours:         Seg–Sex 08h–17h / Sáb 08h–13h / Dom Fechado
Delivery:      Yes — Mongaguá e região
```

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
| Section order | Header → Hero → Trust bar → Products → Brands → About → Reviews → Contact → Footer | May reorder based on what looks better |
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
- On mobile: reduce frame count by half or fall back to a CSS animation
- `will-change: transform` on animated elements
- Never animate `width`, `height`, `top`, `left` — only `transform` and `opacity`

---

## All other animations

Beyond the scroll video, every section should feel alive. Follow this hierarchy:

### On page load
- Header slides down from top (0.4s ease-out)
- Hero headline: words appear staggered left-to-right (0.05s delay between words)
- Trust bar items count up from 0 (e.g. "27 anos" counts up on first view)

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
```
Background: --gold. Text: --navy.
4 items: 🏗️ Desde 1997 · 📍 Em Mongaguá, SP · 🚚 Entrega em Mongaguá e região · 💬 WhatsApp
Desktop: horizontal row. Mobile: 2×2 grid.
```

### Products (#produtos)
```
Title: "O que você encontra aqui"
8 categories — see Product categories table below
Cards: white bg, 4px --navy left border, --cream hover
Stagger animation on scroll enter
```

### Brands (#marcas)
```
Background: --navy
Marquee: Tigre · Tramontina · Vonder · Bosch · Vedacit · Quartzolit · Suvinil · Coral · Sika · Schneider Electric · 3M · Fame
Pill badges: --cream bg, --navy text, infinite horizontal scroll, pause on hover
```

### About (#sobre)
```
Background: --cream
Title: "Uma história de confiança em Mongaguá"
P1: "Desde 1997, a Lucimar Materiais para Construção é referência em Mongaguá para quem vai construir, reformar ou fazer manutenção. Somos uma empresa familiar, com atendimento próximo e personalizado — conhecemos nossos clientes pelo nome."
P2: "Nossa loja no Balneário Itaóca reúne tudo o que você precisa, da fundação ao acabamento, com marcas de qualidade e preços justos. Venha nos visitar ou fale conosco pelo WhatsApp."
Right: navy stats card — "+27 anos no mercado" · "Empresa familiar" · "Amplo estoque"
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
Left: phone (tel:) · WhatsApp (wa.me) · address · hours table · large green CTA button
Right: Google Maps iframe
  src: https://maps.google.com/maps?q=-24.1195904,-46.6735713&z=16&output=embed
  height: 400px, border-radius: 12px
```

### Footer
```
Background: --navy. Text: --cream.
3 columns: logo+tagline · nav links · hours
Bottom: "© 2025 Lucimar França Comércio de Materiais para Construção Ltda. Todos os direitos reservados. · Mongaguá, SP"
```

### Floating WhatsApp button
```
Fixed. bottom: 24px, right: 24px. z-index: 9999.
60×60px circle. Background: --whatsapp.
White WhatsApp SVG icon (30px).
Pulse ring animation (CSS, 2s loop).
Tooltip: "Fale conosco no WhatsApp"
href: https://wa.me/551334487000
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
| 7 | Madeiras e Telhas | ripas, caibros, telhas cerâmicas |
| 8 | Jardinagem e Limpeza | mangueiras, vassouras, produtos de limpeza |

---

## File structure

```
lucimar-site/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js           # scroll engine, animations, menu
├── assets/
│   ├── logo.png          # placeholder — drop real file here
│   └── frames/           # scroll video frames go here
│       ├── frame-0001.jpg
│       └── ...
├── CLAUDE.md             # this file
└── README.md
```

---

## SEO — required in `<head>`

```html
<title>Lucimar Materiais para Construção | Mongaguá, SP</title>
<meta name="description" content="Loja de materiais de construção em Mongaguá, SP. Ferramentas, material elétrico, hidráulico, tintas e muito mais. Desde 1997. Ligue (13) 3448-7000.">
<meta name="keywords" content="materiais construção mongaguá, ferragens mongaguá, loja construção litoral sul sp, material construção balneário itaóca">
<meta property="og:title" content="Lucimar Materiais para Construção | Mongaguá, SP">
<meta property="og:description" content="Loja familiar de materiais de construção em Mongaguá desde 1997.">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
| 1 | Static site — all sections, scroll animation engine, mobile-ready | 🔨 In progress |
| 2 | AI chatbot — FAQ answers + lead capture → WhatsApp notification | ⏳ Next |
| 3 | Real scroll video frames — replace placeholder with actual sequence | ⏳ Planned |
| 4 | Launch — GitHub Pages, domain, Google Business Profile update | ⏳ Planned |
