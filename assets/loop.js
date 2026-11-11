/* ============================================================
   Loop Methods — shared behaviors
   Scroll reveal · mobile menu · FAQ accordion
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---- Clean URLs ----
       Internal links are authored extensionless (href="about") so deployed URLs never
       contain .html. That needs a server that maps /about -> about.html (Vercel's
       cleanUrls). On a raw file server — this preview, or opening the files locally —
       no such mapping exists, so those links would 404.

       Detection: if THIS page's own URL still ends in .html, we're on a raw file server,
       so rewrite internal links to add the extension back. On Vercel the pathname is
       /about (or / for the homepage), the condition is false, and links stay clean. */
    (function () {
      if (!/\.html$/i.test(location.pathname)) return;
      document.querySelectorAll('a[href]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        // Skip absolute URLs, anchors, and anything already carrying an extension
        if (/^(?:[a-z]+:|\/\/|#|mailto:|tel:)/i.test(href)) return;
        if (href === './' || href === '/') { a.setAttribute('href', 'index.html'); return; }
        if (/\.[a-z0-9]+(?:[?#]|$)/i.test(href)) return;
        a.setAttribute('href', href.replace(/(?=$|[?#])/, '.html'));
      });
    })();

    /* ---- Scroll reveal ----
       Base state is visible. We only hide-before-reveal once JS confirms it runs
       (html.js-reveal). Above-the-fold elements reveal instantly so the hero never
       depends on the observer. An "unstick" pass force-completes any reveal whose
       CSS transition was paused (e.g. an offscreen / backgrounded iframe), so content
       is never left blank. */
    document.documentElement.classList.add('js-reveal');

    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var reveal = function (el) { el.classList.add('in'); };
    var inView = function (el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    // Above-the-fold: reveal immediately (no dependence on the observer firing).
    reveals.forEach(function (el) { if (inView(el)) reveal(el); });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
    } else {
      reveals.forEach(reveal);
    }

    // Force-complete any revealed element whose transition got paused at opacity 0.
    function unstick() {
      reveals.forEach(function (el) {
        if (el.classList.contains('in') && getComputedStyle(el).opacity === '0') {
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }
    [500, 1500].forEach(function (t) { setTimeout(unstick, t); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) setTimeout(unstick, 50);
    });
    // Last resort: nothing stays hidden after 3.5s.
    setTimeout(function () {
      reveals.forEach(function (el) {
        if (getComputedStyle(el).opacity === '0') {
          el.classList.add('in');
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 3500);

    /* ---- Testimonial carousel ---- */
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var viewport = root.querySelector('[data-carousel-viewport]');
      var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
      if (!viewport || !slides.length) return;
      var prevBtn = root.querySelector('[data-prev]');
      var nextBtn = root.querySelector('[data-next]');
      var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dot]'));
      var reduceC = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var index = 0;

      function update() {
        dots.forEach(function (d, j) {
          var on = j === index;
          d.classList.toggle('active', on);
          d.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === index ? 'false' : 'true'); });
      }
      function pitch() {
        return slides.length > 1
          ? (slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left)
          : viewport.clientWidth;
      }
      function go(i, smooth) {
        index = Math.max(0, Math.min(slides.length - 1, i));
        var delta = slides[index].getBoundingClientRect().left - viewport.getBoundingClientRect().left;
        var target = viewport.scrollLeft + delta;
        target = Math.max(0, Math.min(target, viewport.scrollWidth - viewport.clientWidth));
        viewport.scrollTo({ left: target, behavior: (smooth && !reduceC) ? 'smooth' : 'auto' });
        update();
      }
      if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1, true); });
      if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1, true); });
      dots.forEach(function (d, j) { d.addEventListener('click', function () { go(j, true); }); });

      // Sync index when the user swipes/scrolls manually
      var st;
      viewport.addEventListener('scroll', function () {
        clearTimeout(st);
        st = setTimeout(function () {
          var i = Math.round(viewport.scrollLeft / pitch());
          if (i !== index) { index = Math.max(0, Math.min(slides.length - 1, i)); update(); }
        }, 110);
      });
      // Keyboard support
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
      });
      // Auto-advance only when opted in (skip on reduced motion), pause on hover/focus
      if (root.hasAttribute('data-autoplay') && !reduceC && slides.length > 1) {
        var timer = null;
        var start = function () { stop(); timer = setInterval(function () { go(index + 1, true); }, 6000); };
        var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
        start();
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        root.addEventListener('focusin', stop);
        root.addEventListener('focusout', start);
        document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
      }
      // Keep alignment on resize
      window.addEventListener('resize', function () { go(index, false); });
      update();
    });

    /* ---- Closing CTA aurora parallax: background drifts ~10px on mouse, content static ---- */
    var ctaSection = document.querySelector('[data-cta]');
    var ctaPx = ctaSection && ctaSection.querySelector('[data-cta-parallax]');
    if (ctaPx && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
      var raf = null;
      ctaSection.addEventListener('mousemove', function (e) {
        var r = ctaSection.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - 0.5) * 2;  // -1..1
        var dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          ctaPx.style.transform = 'translate(' + (dx * 11).toFixed(1) + 'px,' + (dy * 11).toFixed(1) + 'px)';
        });
      });
      ctaSection.addEventListener('mouseleave', function () {
        ctaPx.style.transform = 'translate(0,0)';
      });
    }

    /* ---- Services page: scroll-stacking card deck (desktop only, lg+) ---- */
    (function () {
      var wrap = document.querySelector('[data-stack-wrap]');
      if (!wrap) return;
      var items = Array.prototype.slice.call(wrap.querySelectorAll('.stack-item'));
      var cards = items.map(function (it) { return it.querySelector('.stack-card'); });
      var countEl = document.querySelector('[data-stack-count]');
      var catEl = document.querySelector('[data-stack-cat]');
      var reduceStack = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var isDesktop = function () { return window.matchMedia('(min-width: 1024px)').matches; };
      if (reduceStack) return;

      var ticking = false;
      function update() {
        ticking = false;
        if (!isDesktop()) return;
        var vh = window.innerHeight;
        var activeIndex = 0;
        items.forEach(function (item, i) {
          var next = items[i + 1];
          var progress = 0;
          if (next) {
            var nextTop = next.getBoundingClientRect().top;
            var band = vh * 0.5;
            progress = 1 - Math.min(Math.max((nextTop - vh * 0.09) / band, 0), 1);
          }
          cards[i].style.setProperty('--sp', progress.toFixed(3));
          var r = item.getBoundingClientRect();
          if (r.top <= vh * 0.5) activeIndex = i;
        });
        if (countEl) countEl.textContent = (activeIndex + 1) + ' / ' + items.length;
        if (catEl) catEl.textContent = cards[activeIndex].getAttribute('data-cat') || '';
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    })();

    /* ---- Premium quote carousel: fade + translate + parallax slide engine ---- */
    document.querySelectorAll('[data-qcar]').forEach(function (root) {
      var stage = root.querySelector('[data-qcar-stage]');
      var slides = Array.prototype.slice.call(root.querySelectorAll('.qcar-slide'));
      if (!stage || slides.length === 0) return;
      var prevBtn = root.querySelector('[data-prev]');
      var nextBtn = root.querySelector('[data-next]');
      var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dot]'));
      var reduceQ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var index = 0;

      // Match stage height to the active slide (slides are absolutely positioned)
      function sizeStage() {
        // active slide is position:relative, so it reports its true content height
        var active = slides[index];
        var h = active.offsetHeight || active.scrollHeight;
        if (h) stage.style.height = h + 'px';
      }

      function render(dir) {
        slides.forEach(function (s, j) {
          if (j === index) {
            s.style.setProperty('--qc-from', (dir >= 0 ? 28 : -28) + 'px');
            s.classList.add('active');
            s.setAttribute('aria-hidden', 'false');
          } else {
            // park inactive slides on the side they'll exit toward
            s.style.setProperty('--qc-from', (dir >= 0 ? -28 : 28) + 'px');
            s.classList.remove('active');
            s.setAttribute('aria-hidden', 'true');
          }
        });
        dots.forEach(function (d, j) {
          var on = j === index;
          d.classList.toggle('active', on);
          d.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        var counter = root.querySelector('[data-qcar-count]');
        if (counter) {
          var pad = function (n) { return (n < 10 ? '0' : '') + n; };
          counter.innerHTML = '<span class="text-white/80">' + pad(index + 1) + '</span> / ' + pad(slides.length);
        }
        sizeStage();
      }

      function go(i, dir) {
        var n = slides.length;
        var next = ((i % n) + n) % n;
        if (next === index) return;
        var d = (typeof dir === 'number') ? dir : (next > index ? 1 : -1);
        index = next;
        render(d);
      }

      if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1, 1); restart(); });
      if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1, -1); restart(); });
      dots.forEach(function (d, j) { d.addEventListener('click', function () { go(j); restart(); }); });

      // Keyboard
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, 1); restart(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, -1); restart(); }
      });

      // Swipe (pointer)
      var startX = null, startY = null, dragging = false;
      stage.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; dragging = true; });
      stage.addEventListener('pointerup', function (e) {
        if (!dragging || startX === null) return;
        dragging = false;
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) go(index + 1, 1); else go(index - 1, -1);
          restart();
        }
        startX = startY = null;
      });
      stage.addEventListener('pointercancel', function () { dragging = false; startX = startY = null; });

      // Autoplay ~5.5s, only while in view; pause on hover/focus/hidden
      var timer = null;
      var inView = true;
      function start() {
        if (reduceQ || slides.length < 2 || !root.hasAttribute('data-autoplay') || !inView) return;
        stop(); timer = setInterval(function () { go(index + 1, 1); }, 5500);
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function restart() { stop(); start(); }
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', start);
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { inView = e.isIntersecting; if (inView) start(); else stop(); });
        }, { threshold: 0.4 }).observe(root);
      }

      window.addEventListener('resize', sizeStage);
      // Re-measure once fonts/images settle
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeStage);
      slides.forEach(function (s) {
        s.querySelectorAll('img').forEach(function (img) {
          if (!img.complete) img.addEventListener('load', sizeStage);
        });
      });
      [200, 700, 1600].forEach(function (t) { setTimeout(sizeStage, t); });

      render(1);
      start();
    });

    /* ---- How We Work timeline: draw line + light nodes in sequence on scroll-in ---- */
    var timeline = document.querySelector('[data-timeline]');
    if (timeline) {
      var nodes = Array.prototype.slice.call(timeline.querySelectorAll('.tl-node'));
      var reduceTl = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var litAll = function () { timeline.classList.add('run'); nodes.forEach(function (n) { n.classList.add('lit'); }); };
      if (reduceTl || !('IntersectionObserver' in window)) {
        litAll();
      } else {
        var tlDone = false;
        var runTl = function () {
          if (tlDone) return; tlDone = true;
          timeline.classList.add('run');
          nodes.forEach(function (n, i) { setTimeout(function () { n.classList.add('lit'); }, 200 + i * 380); });
          // Failsafe if timers/transitions are throttled.
          setTimeout(litAll, 200 + nodes.length * 380 + 600);
        };
        var tlio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { runTl(); tlio.disconnect(); } });
        }, { threshold: 0.35 });
        tlio.observe(timeline);
      }
    }

    /* ---- Stats count-up on scroll into view (respects reduced-motion + paused rAF) ---- */
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count-target]'));
    if (counters.length) {
      var reduceCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceCount || !('IntersectionObserver' in window)) {
        counters.forEach(function (el) { el.textContent = el.getAttribute('data-count-target'); });
      } else {
        var runCount = function (el) {
          var target = parseInt(el.getAttribute('data-count-target'), 10) || 0;
          var dur = 1300, start = null;
          el.textContent = '0';
          var step = function (ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toString();
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          // Fallback: guarantee the final value even if rAF is throttled/paused.
          setTimeout(function () { el.textContent = target.toString(); }, dur + 400);
        };
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
          });
        }, { threshold: 0.35 });
        // Don't pre-zero: untriggered counters keep their real target as the static base.
        counters.forEach(function (el) { cio.observe(el); });
      }
    }

    /* ---- Hero background video: autoplay muted; show #000 poster on reduced-motion ---- */
    var heroVideo = document.querySelector('[data-hero-video]');
    if (heroVideo) {
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        // Don't autoplay or download footage — keep the solid poster frame.
        heroVideo.removeAttribute('autoplay');
        heroVideo.removeAttribute('src');
        try { heroVideo.pause(); heroVideo.load(); } catch (e) {}
      } else {
        var p = heroVideo.play && heroVideo.play();
        if (p && typeof p.catch === 'function') p.catch(function () {/* poster stays */});
      }
    }

    /* ---- Mobile menu ---- */
    var menuBtn = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('[data-acc-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc-item');
        if (!item) return;
        var isOpen = item.classList.contains('open');
        var group = item.parentElement;
        if (group) {
          group.querySelectorAll('.acc-item.open').forEach(function (other) {
            if (other !== item) {
              other.classList.remove('open');
              var ob = other.querySelector('[data-acc-trigger]');
              if (ob) ob.setAttribute('aria-expanded', 'false');
            }
          });
        }
        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });
  });

  /* ---- Shared site modals: "Get in Touch" (replaces the Contact page) + "Careers" ----
     Injected once here so every page that loads loop.js gets both, without duplicating the
     markup per file. Any link whose href resolves to contact.html opens the Get in Touch
     modal instead of navigating; any [data-open-careers] element opens the Careers modal. */
  (function () {
    var checkSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 10 6 10-6M2 7v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"/></svg>';
    var briefcaseSvg = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';
    var sparkSvg = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 3.8L17.5 8l-3.9 1.2L12 13l-1.6-3.8L6.5 8l3.9-1.2zM19 14l.8 1.9 1.9.6-1.9.6L19 19l-.8-1.9-1.9-.6 1.9-.6z"/></svg>';
    var phoneSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var extLinkSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';
    var mailSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>';
    var pinSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    var arrowSvg = '<svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var closeSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    var gtHtml = '' +
      '<div class="gt-backdrop" data-gt-backdrop></div>' +
      '<div class="gt-modal" data-gt-modal role="dialog" aria-modal="true" aria-label="Get in touch">' +
        '<div class="gt-panel" data-gt-panel>' +
          '<button type="button" class="gt-close" data-gt-close aria-label="Close">' + closeSvg + '</button>' +
          '<h2 class="gt-title">Let\u2019s Build What\u2019s Next.</h2>' +
          '<div class="gt-tracks">' +
            '<div class="ct-card p-5"><div class="relative flex items-center gap-4">' +
              '<div class="ct-icon-wrap shrink-0"><span class="ct-icon-glow" aria-hidden="true"></span><span class="ct-icon-ring-outer" aria-hidden="true"></span><span class="ct-icon-ring-mid" aria-hidden="true"></span><span class="ct-icon">' + briefcaseSvg + '</span></div>' +
              '<div class="min-w-0"><p class="text-xs uppercase tracking-widest text-accent font-medium">Custom Solutions &amp; Services</p>' +
              '<div class="mt-2.5 flex flex-col gap-2"><a href="mailto:sales@loopmethods.com" class="ct-link-row">' + mailSvg + 'sales@loopmethods.com</a>' +
              '<a href="tel:+917503596900" class="ct-link-row">' + phoneSvg + '+91 75035 96900</a></div></div>' +
            '</div></div>' +
            '<div class="ct-card hyrix p-5"><div class="relative flex items-center gap-4">' +
              '<div class="ct-icon-wrap shrink-0"><span class="ct-icon-glow" aria-hidden="true"></span><span class="ct-icon-ring-outer" aria-hidden="true"></span><span class="ct-icon-ring-mid" aria-hidden="true"></span><span class="ct-icon">' + sparkSvg + '</span></div>' +
              '<div class="min-w-0"><p class="text-xs uppercase tracking-widest font-medium" style="color:#e879f9;">HYRIX AI</p>' +
              '<div class="mt-2.5 flex flex-col gap-2"><a href="mailto:info@hyrixai.com" class="ct-link-row">' + mailSvg + 'info@hyrixai.com</a>' +
              '<a href="https://recruit-ai-ochre.vercel.app/" target="_blank" rel="noopener noreferrer" class="ct-link-row">' + extLinkSvg + 'Visit HYRIX AI</a></div></div>' +
            '</div></div>' +
          '</div>' +
          '<form data-gt-form novalidate class="mt-6">' +
            '<div class="grid sm:grid-cols-2 gap-4">' +
              '<div class="f-field" data-field="name"><label class="f-label" for="gt-name">Name</label><input class="f-input" id="gt-name" name="name" type="text" placeholder="Jane Doe" required /><p class="f-error">Please enter your name.</p></div>' +
              '<div class="f-field" data-field="email"><label class="f-label" for="gt-email">Email</label><input class="f-input" id="gt-email" name="email" type="email" placeholder="jane@company.com" required /><p class="f-error">Please enter a valid email address.</p></div>' +
            '</div>' +
            '<div class="f-field mt-4" data-field="company"><label class="f-label" for="gt-company">Company</label><input class="f-input" id="gt-company" name="company" type="text" placeholder="Company name" required /><p class="f-error">Please enter your company name.</p></div>' +
            '<div class="f-field mt-4" data-field="message"><label class="f-label" for="gt-message">Project Brief / Message</label><textarea class="f-textarea" id="gt-message" name="message" placeholder="Tell us what you\u2019re building, your timeline, and where you need help." required></textarea><p class="f-error">Tell us a little about your project.</p></div>' +
            '<button type="submit" class="group mt-5 inline-flex items-center gap-2 rounded-full bg-accent text-white px-7 py-3 text-sm font-medium hover:brightness-110 transition-all duration-300">Send Message ' + arrowSvg + '</button>' +
            '<p class="gt-form-note" data-gt-note>We\u2019ll get back to you within 24 hours to schedule your walkthrough.</p>' +
            '<p class="gt-form-note hidden" data-gt-success style="color:#34d399;">Thanks \u2014 your message is on its way.</p>' +
          '</form>' +
          '<div class="gt-offices">' +
            '<div class="gt-office"><span class="gt-office-pin">' + pinSvg + '</span><div><p class="text-sm font-semibold text-white">Noida, India</p><p class="text-xs text-white/55">Sector-127</p></div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var carHtml = '' +
      '<div class="gt-backdrop" data-car-backdrop></div>' +
      '<div class="gt-modal" data-car-modal role="dialog" aria-modal="true" aria-label="Careers at Loop Methods">' +
        '<div class="gt-panel gt-panel-sm" data-car-panel>' +
          '<button type="button" class="gt-close" data-car-close aria-label="Close">' + closeSvg + '</button>' +
          '<div class="careers-icon-wrap"><span class="careers-icon-glow" aria-hidden="true"></span><span class="careers-icon-ring-outer" aria-hidden="true"></span><span class="careers-icon-ring-mid" aria-hidden="true"></span><span class="careers-icon">' + briefcaseSvg + '</span></div>' +
          '<h2 class="gt-title mt-5">Join the Team</h2>' +
          '<p class="mt-3 text-sm text-white/65 leading-relaxed">We\u2019re not actively hiring for specific roles right now, but we\u2019re always open to meeting great engineers, designers, and strategists. Send us your resume and we\u2019ll keep you in mind.</p>' +
          '<a href="mailto:careers@loopmethods.com" class="careers-email">' + mailSvg + 'careers@loopmethods.com</a>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', gtHtml + carHtml);

    var reduceM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function wireModal(backdropSel, modalSel, closeSel) {
      var backdrop = document.querySelector(backdropSel);
      var modal = document.querySelector(modalSel);
      if (!backdrop || !modal) return null;
      var lastFocused = null;
      function open() {
        backdrop.classList.add('open');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        lastFocused = document.activeElement;
        requestAnimationFrame(function () {
          var c = modal.querySelector(closeSel);
          if (c) c.focus();
        });
      }
      function close() {
        backdrop.classList.remove('open');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      }
      modal.querySelectorAll(closeSel).forEach(function (b) { b.addEventListener('click', close); });
      backdrop.addEventListener('click', close);
      return { open: open, close: close, modal: modal };
    }

    var gt = wireModal('[data-gt-backdrop]', '[data-gt-modal]', '[data-gt-close]');
    var car = wireModal('[data-car-backdrop]', '[data-car-modal]', '[data-car-close]');

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (gt && gt.modal.classList.contains('open')) gt.close();
      if (car && car.modal.classList.contains('open')) car.close();
    });

    // Intercept any link that routes to the (now-removed) contact page.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && /(^|\/)contact\.html(#.*)?$|^#contact$/.test(a.getAttribute('href'))) {
        e.preventDefault();
        if (gt) gt.open();
      }
    });
    document.querySelectorAll('[data-open-careers]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); if (car) car.open(); });
    });

    // Get in Touch form validation + submit (mirrors the former Contact page behavior)
    var gtForm = document.querySelector('[data-gt-form]');
    if (gtForm) {
      var gtSuccess = document.querySelector('[data-gt-success]');
      var gtNote = document.querySelector('[data-gt-note]');
      function validateField(field) {
        var input = field.querySelector('.f-input, .f-textarea');
        var valid = input.checkValidity();
        field.classList.toggle('invalid', !valid);
        return valid;
      }
      gtForm.querySelectorAll('.f-field').forEach(function (field) {
        var input = field.querySelector('.f-input, .f-textarea');
        input.addEventListener('blur', function () { validateField(field); });
        input.addEventListener('input', function () { if (field.classList.contains('invalid')) validateField(field); });
      });
      gtForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var allValid = true;
        gtForm.querySelectorAll('.f-field').forEach(function (field) { if (!validateField(field)) allValid = false; });
        if (!allValid) {
          var firstInvalid = gtForm.querySelector('.f-field.invalid .f-input, .f-field.invalid .f-textarea');
          if (firstInvalid) firstInvalid.focus();
          return;
        }
        gtForm.reset();
        if (gtSuccess) { gtSuccess.classList.remove('hidden'); }
        if (gtNote) gtNote.classList.add('hidden');
      });
    }
  })();

  /* ---- Shared case-detail modal ----
     ONE modal for every case-study trigger on the site: Home's Featured Cases,
     the Case Studies grid, and Related Case Study cards on service-detail pages.
     Injected here rather than duplicated per page.

     Triggers are any element carrying [data-case-trigger] or [data-cs-card]. Content is
     read from data-* on the trigger, normalising the two content shapes in use:
       Home:         data-challenge / data-solution / data-offers (pipe-separated bullets)
       Case Studies: data-problem   / data-solution / data-result (paragraph)
     Blocks whose data is absent are hidden, so one markup tree serves both. */
  (function () {
    var triggers = document.querySelectorAll('[data-case-trigger], [data-cs-card]');
    if (!triggers.length) return;

    var closeSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    var checkSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

    document.body.insertAdjacentHTML('beforeend', '' +
      '<div class="cd-backdrop" data-cd-backdrop></div>' +
      '<div class="cd-modal" data-cd-modal role="dialog" aria-modal="true" aria-label="Case study details">' +
        '<div class="cd-panel" data-cd-panel>' +
          '<button type="button" class="cd-close" data-cd-close aria-label="Close case study">' + closeSvg + '</button>' +
          '<div class="cd-cover"><img data-cd-img alt="" /><span class="cd-cat" data-cd-cat></span></div>' +
          '<div class="cd-body">' +
            '<h3 class="text-2xl md:text-3xl font-semibold tracking-tight text-white" data-cd-title></h3>' +
            '<p class="mt-3 text-sm md:text-base text-white/80 leading-relaxed" data-cd-desc></p>' +
            '<div class="mt-7" data-cd-block="challenge"><p class="cd-label">Challenge</p><p class="cd-text" data-cd-challenge></p></div>' +
            '<div class="mt-6" data-cd-block="solution"><p class="cd-label">Solution</p><p class="cd-text" data-cd-solution></p></div>' +
            '<div class="mt-6" data-cd-block="offers"><p class="cd-label">What It Offers</p><div class="cd-offers mt-2" data-cd-offers></div></div>' +
            '<div class="mt-6" data-cd-block="result"><p class="cd-label">Result</p><p class="cd-text" data-cd-result></p></div>' +
          '</div>' +
        '</div>' +
      '</div>');

    var backdrop = document.querySelector('[data-cd-backdrop]');
    var modal = document.querySelector('[data-cd-modal]');
    var panel = modal.querySelector('[data-cd-panel]');
    var imgEl = modal.querySelector('[data-cd-img]');
    var catEl = modal.querySelector('[data-cd-cat]');
    var titleEl = modal.querySelector('[data-cd-title]');
    var descEl = modal.querySelector('[data-cd-desc]');
    var challengeEl = modal.querySelector('[data-cd-challenge]');
    var solutionEl = modal.querySelector('[data-cd-solution]');
    var offersEl = modal.querySelector('[data-cd-offers]');
    var resultEl = modal.querySelector('[data-cd-result]');
    var reduceM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lastFocused = null;

    function setBlock(name, hasContent) {
      var b = modal.querySelector('[data-cd-block="' + name + '"]');
      if (b) b.classList.toggle('hidden', !hasContent);
    }

    function openFrom(card) {
      var d = card.dataset;
      // Case Studies cards carry no data-img — fall back to the card's own cover image
      var src = d.img;
      if (!src) { var inner = card.querySelector('img'); if (inner) src = inner.getAttribute('src'); }
      if (src) imgEl.src = src; else imgEl.removeAttribute('src');
      imgEl.alt = (d.title || '') + ' project cover';
      catEl.textContent = d.cat || d.catLabel || '';
      titleEl.textContent = d.title || '';
      descEl.textContent = d.desc || '';

      var challenge = d.challenge || d.problem || '';
      challengeEl.textContent = challenge;
      setBlock('challenge', !!challenge);

      solutionEl.textContent = d.solution || '';
      setBlock('solution', !!d.solution);

      var offers = (d.offers || '').split('|').filter(Boolean);
      offersEl.innerHTML = offers.map(function (o) {
        return '<div class="cd-offer">' + checkSvg + '<span>' + o + '</span></div>';
      }).join('');
      setBlock('offers', offers.length > 0);

      resultEl.textContent = d.result || '';
      setBlock('result', !!d.result);

      // Grow-from-source: bias the panel's transform-origin toward the clicked card.
      if (!reduceM) {
        var r = card.getBoundingClientRect();
        panel.style.transformOrigin =
          (((r.left + r.width / 2) / window.innerWidth) * 100) + '% ' +
          (((r.top + r.height / 2) / window.innerHeight) * 100) + '%';
      } else {
        panel.style.transformOrigin = '';
      }

      backdrop.classList.add('open');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      lastFocused = document.activeElement;
      if (panel) panel.scrollTop = 0;
      requestAnimationFrame(function () {
        var c = modal.querySelector('[data-cd-close]');
        if (c) c.focus();
      });
    }

    function close() {
      backdrop.classList.remove('open');
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener('click', function () { openFrom(trigger); });
      if (trigger.getAttribute('role') === 'button' || trigger.hasAttribute('tabindex')) {
        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFrom(trigger); }
        });
      }
    });

    modal.querySelector('[data-cd-close]').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  })();
})();
