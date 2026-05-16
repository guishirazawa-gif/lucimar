/* ============================
   LUCIMAR — Main JavaScript (V3)
   Scroll engine, animations, menu
   ============================ */

(function () {
  'use strict';

  // ---- Capability / mode detection ----
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  var lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  var saveData = navigator.connection && navigator.connection.saveData;

  // Only fall back to the static placeholder when motion is unwanted or
  // the user has opted into data savings. Phones and touch devices play
  // a subsampled version of the sequence instead (see frameStride below).
  var skipFrames = saveData || reduceMotion;
  var lite = isMobile || coarsePointer || lowMemory;

  // ---- DOM refs ----
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('main-nav');
  var canvas = document.getElementById('scroll-canvas');
  var ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  var scrollSequence = document.getElementById('scroll-sequence');
  var loadingContainer = document.getElementById('scroll-loading');
  var loadingBar = document.getElementById('scroll-loading-bar');
  var heroHeadline = document.getElementById('hero-headline');

  // ---- Config ----
  var TOTAL_FRAMES = 192;
  // Mobile + low-memory devices: every 6th frame (~32 images, ~3MB) keeps
  // memory under control on iOS Safari; desktop loads all 192.
  var frameStride = lite ? 6 : 1;
  var sampledFrames = [];
  for (var s = 1; s <= TOTAL_FRAMES; s += frameStride) sampledFrames.push(s);
  if (sampledFrames[sampledFrames.length - 1] !== TOTAL_FRAMES) sampledFrames.push(TOTAL_FRAMES);
  var frameCount = sampledFrames.length;
  function framePath(i) { return 'assets/frames/frame-' + String(i).padStart(4, '0') + '.jpg'; }

  // ---- Mobile menu ----
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Canvas sizing (DPR-aware, capped) ----
  var dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  function sizeCanvas() {
    if (!canvas) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- Frame preload (desktop only) ----
  var images = [];
  var framesReady = false;

  function preloadFrames() {
    if (!canvas || !ctx) return;
    if (skipFrames) {
      canvas.classList.add('placeholder');
      return;
    }

    // Probe first frame so a missing /frames/ folder falls back gracefully.
    var probe = new Image();
    probe.onerror = function () { canvas.classList.add('placeholder'); };
    probe.onload = function () {
      canvas.classList.remove('placeholder');
      if (loadingContainer) loadingContainer.style.display = 'block';

      var loaded = 0;
      images = new Array(frameCount);
      for (var i = 0; i < frameCount; i++) {
        var img = new Image();
        img.decoding = 'async';
        img.src = framePath(sampledFrames[i]);
        img.onload = img.onerror = (function () {
          return function () {
            loaded++;
            if (loadingBar) loadingBar.style.width = (loaded / frameCount * 100) + '%';
            if (loaded === frameCount) {
              framesReady = true;
              if (loadingContainer) loadingContainer.style.display = 'none';
              drawFrame(0);
            }
          };
        })();
        images[i] = img;
      }
    };
    probe.src = framePath(sampledFrames[0]);
  }

  function drawFrame(index) {
    if (!ctx || !images[index] || !images[index].complete || !images[index].naturalWidth) return;
    var img = images[index];
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    var imgRatio = img.naturalWidth / img.naturalHeight;
    var canvasRatio = w / h;
    var drawW, drawH, drawX, drawY;
    if (canvasRatio > imgRatio) {
      drawW = w; drawH = w / imgRatio; drawX = 0; drawY = (h - drawH) / 2;
    } else {
      drawH = h; drawW = h * imgRatio; drawX = (w - drawW) / 2; drawY = 0;
    }
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // ---- Hero scroll overlays + frame sync ----
  var overlays = Array.prototype.slice.call(document.querySelectorAll('.scroll-overlay'));
  var overlayMeta = overlays.map(function (el) {
    return {
      el: el,
      at: parseFloat(el.getAttribute('data-at')) || 0,
      window: parseFloat(el.getAttribute('data-window')) || 0.12
    };
  });

  function updateHero() {
    if (!scrollSequence) return;
    var rect = scrollSequence.getBoundingClientRect();
    var max = scrollSequence.offsetHeight - window.innerHeight;
    if (max <= 0) return;
    var progress = Math.max(0, Math.min(1, -rect.top / max));

    if (framesReady && images.length) {
      var idx = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      drawFrame(idx);
    }

    for (var i = 0; i < overlayMeta.length; i++) {
      var m = overlayMeta[i];
      var dist = Math.abs(progress - m.at);
      if (dist < m.window) m.el.classList.add('active');
      else m.el.classList.remove('active');
    }
  }

  // ---- Reveal on scroll ----
  function setupRevealObserver() {
    var revealElements = document.querySelectorAll('.reveal');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        var staggerChildren = entry.target.querySelectorAll('.reveal-stagger');
        staggerChildren.forEach(function (child, i) {
          child.style.transitionDelay = (i * 0.08) + 's';
          child.classList.add('visible');
        });

        var countUps = entry.target.querySelectorAll('.count-up');
        countUps.forEach(animateCountUp);

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealElements.forEach(function (el) { observer.observe(el); });
  }

  // ---- Count-up animation ----
  function animateCountUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var isYear = el.getAttribute('data-is-year') === 'true';
    if (isNaN(target)) return;
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    var start = isYear ? target - 20 : 0;
    var duration = 1200;
    var startTime = null;
    function step(t) {
      if (!startTime) startTime = t;
      var progress = Math.min((t - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // ---- Hero headline word stagger ----
  function setupHeroWordStagger() {
    if (!heroHeadline) return;
    var words = heroHeadline.textContent.trim().split(/\s+/);
    heroHeadline.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.animationDelay = (i * 0.05) + 's';
      heroHeadline.appendChild(span);
      if (i < words.length - 1) heroHeadline.appendChild(document.createTextNode(' '));
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ---- Brand marquee: duplicate the items in-place for a seamless loop ----
  function cloneMarquee() {
    var track = document.getElementById('marquee-track');
    if (!track) return;
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      var img = clone.querySelector('img');
      if (img) img.alt = '';
      track.appendChild(clone);
    });
  }

  // ---- rAF-throttled scroll handler ----
  var rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      updateHero();
      rafPending = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Resize handler ----
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      sizeCanvas();
      updateHero();
    }, 150);
  });

  // ---- Init ----
  sizeCanvas();
  setupHeroWordStagger();
  setupRevealObserver();
  cloneMarquee();

  if (overlays.length) overlays[0].classList.add('active');

  // Defer the heaviest work (frame preload) until the browser is idle.
  var startFrames = function () { preloadFrames(); };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(startFrames, { timeout: 2000 });
  } else {
    setTimeout(startFrames, 200);
  }
})();
