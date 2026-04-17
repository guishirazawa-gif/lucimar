/* ============================
   LUCIMAR — Main JavaScript
   Scroll engine, animations, menu
   ============================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scrollSequence = document.getElementById('scroll-sequence');
  const loadingContainer = document.getElementById('scroll-loading');
  const loadingBar = document.getElementById('scroll-loading-bar');
  const heroHeadline = document.getElementById('hero-headline');

  // ---- Config ----
  // Expected frame format: assets/frames/frame-0001.jpg through frame-NNNN.jpg
  // JPEG, 1280px wide, quality 70-80
  const frameCount = 192;
  const framePath = (i) => `assets/frames/frame-${String(i).padStart(4, '0')}.jpg`;

  // ---- Mobile menu ----
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a nav link
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Scroll-driven canvas animation ----
  var images = [];
  var framesReady = false;

  function sizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function preloadFrames() {
    if (!canvas || !ctx) return;

    // Try loading the first frame to check if frames exist
    var testImg = new Image();
    testImg.onerror = function () {
      // Frames don't exist yet — show CSS placeholder
      canvas.classList.add('placeholder');
    };
    testImg.onload = function () {
      // First frame exists — load all frames
      canvas.classList.remove('placeholder');
      if (loadingContainer) loadingContainer.style.display = 'block';

      var loaded = 0;
      images = [];

      for (var i = 1; i <= frameCount; i++) {
        var img = new Image();
        img.src = framePath(i);
        img.onload = function () {
          loaded++;
          if (loadingBar) {
            loadingBar.style.width = ((loaded / frameCount) * 100) + '%';
          }
          if (loaded === frameCount) {
            framesReady = true;
            if (loadingContainer) loadingContainer.style.display = 'none';
            drawFrame(0);
          }
        };
        img.onerror = function () {
          loaded++;
          if (loaded === frameCount) {
            framesReady = true;
            if (loadingContainer) loadingContainer.style.display = 'none';
          }
        };
        images.push(img);
      }
    };
    testImg.src = framePath(1);
  }

  function drawFrame(index) {
    if (!ctx || !images[index] || !images[index].complete || !images[index].naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw frame covering full canvas (cover mode)
    var imgRatio = images[index].naturalWidth / images[index].naturalHeight;
    var canvasRatio = canvas.width / canvas.height;
    var drawW, drawH, drawX, drawY;
    if (canvasRatio > imgRatio) {
      drawW = canvas.width;
      drawH = canvas.width / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawH) / 2;
    } else {
      drawH = canvas.height;
      drawW = canvas.height * imgRatio;
      drawX = (canvas.width - drawW) / 2;
      drawY = 0;
    }
    ctx.drawImage(images[index], drawX, drawY, drawW, drawH);
  }

  // ---- Scroll overlay management ----
  var overlays = document.querySelectorAll('.scroll-overlay');

  function updateScrollSequence() {
    if (!scrollSequence) return;

    var rect = scrollSequence.getBoundingClientRect();
    var sequenceHeight = scrollSequence.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / sequenceHeight));

    // Update canvas frame
    if (framesReady && images.length > 0) {
      var frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      drawFrame(frameIndex);
    }

    // Update text overlays
    overlays.forEach(function (overlay) {
      var at = parseFloat(overlay.getAttribute('data-at'));
      var distance = Math.abs(progress - at);
      // Show overlay when within 0.12 range of its target
      if (distance < 0.12) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    });
  }

  // ---- Reveal on scroll (Intersection Observer) ----
  function setupRevealObserver() {
    var revealElements = document.querySelectorAll('.reveal');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Trigger stagger children
          var staggerChildren = entry.target.querySelectorAll('.reveal-stagger');
          staggerChildren.forEach(function (child, i) {
            child.style.transitionDelay = (i * 0.08) + 's';
            child.classList.add('visible');
          });

          // Trigger count-up animations
          var countUps = entry.target.querySelectorAll('.count-up');
          countUps.forEach(function (el) {
            animateCountUp(el);
          });

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---- Count-up animation ----
  function animateCountUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var isYear = el.getAttribute('data-is-year') === 'true';
    if (isNaN(target)) return;

    // Don't re-animate
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    var start = isYear ? target - 20 : 0;
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(start + (target - start) * eased);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // ---- Hero headline word stagger ----
  function setupHeroWordStagger() {
    if (!heroHeadline) return;
    var text = heroHeadline.textContent.trim();
    var words = text.split(/\s+/);
    heroHeadline.innerHTML = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.animationDelay = (i * 0.05) + 's';
      heroHeadline.appendChild(span);
      // Add space between words
      if (i < words.length - 1) {
        heroHeadline.appendChild(document.createTextNode('\u00A0'));
      }
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
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---- rAF-throttled scroll handler ----
  var rafPending = false;
  window.addEventListener('scroll', function () {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      updateScrollSequence();
      rafPending = false;
    });
  });

  // ---- Resize handler ----
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      sizeCanvas();
      updateScrollSequence();
    }, 150);
  });

  // ---- Init ----
  sizeCanvas();
  preloadFrames();
  setupHeroWordStagger();
  setupRevealObserver();

  // Initial overlay state
  if (overlays.length > 0) {
    overlays[0].classList.add('active');
  }
})();
