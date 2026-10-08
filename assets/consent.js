/* ============================================================
   Loop Methods — cookie consent module (window.LoopConsent)

   One source of truth for consent across the site: the banner, the
   preferences modal, the footer "Cookie Settings" link and the tables on
   /cookie-policy all read from CATEGORIES below.

   Storage: first-party localStorage + first-party cookie, both holding
   { v: policy version, t: timestamp, necessary, preferences, analytics, marketing }.
   The banner re-prompts when VERSION changes or the choice is >12 months old.

   Gating optional scripts — author them inert and they load only once allowed:
     <script type="text/plain" data-consent="analytics" src="https://…"></script>
     <script type="text/plain" data-consent="marketing">…inline…</script>
   Or from code:  LoopConsent.onChange(function (c) { if (c.analytics) … })
   Withdrawing a category clears its known cookies; its scripts stop loading
   from the next page view (a script already running can't be unloaded).

   Browser Global Privacy Control / Do Not Track: optional categories start
   OFF (they always do) and the preferences modal says the signal was seen.
   ============================================================ */
(function () {
  'use strict';

  var VERSION = '2026-10';
  var KEY = 'loop_consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var OPTIONAL = ['preferences', 'analytics', 'marketing'];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  // Raw file server (preview / opened locally) has no clean-URL rewriting.
  var rawFiles = /\.html$/i.test(location.pathname);
  function page(slug) { return rawFiles ? slug + '.html' : slug; }

  var ICON = {
    cookie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01"/></svg>',
    necessary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    preferences: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
    analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>',
    marketing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg class="ck-g-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    dash: '<svg class="ck-g-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
    arrow: '<svg class="ck-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* Keep this list in step with what the live site actually sets — re-run a
     cookie scan before launch. `planned: true` marks rows that are listed for
     transparency but not active on the site today. */
  var CATEGORIES = [
    { id: 'necessary', name: 'Strictly Necessary', locked: true,
      desc: 'Required for the site to work, including security and remembering the cookie choice you make here.',
      cookies: [
        { name: 'loop_consent', provider: 'Loop Methods (first-party)', purpose: 'Stores your cookie choices, the policy version and the date you chose.', duration: '12 months' }
      ] },
    { id: 'preferences', name: 'Preferences',
      desc: 'Remembers settings you choose on the site, such as language.',
      cookies: [],
      empty: 'We don\u2019t set any preference cookies today. If we add one, it will be listed here before it\u2019s used.' },
    { id: 'analytics', name: 'Analytics',
      desc: 'Helps us understand how visitors use the site so we can improve it. Data is aggregated.',
      cookies: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Tells new visitors from returning ones.', duration: '2 years', planned: true },
        { name: '_ga_*', provider: 'Google Analytics', purpose: 'Keeps a visit counted as one session.', duration: '2 years', planned: true }
      ] },
    { id: 'marketing', name: 'Marketing',
      desc: 'Used to show relevant content and measure campaigns on other platforms.',
      cookies: [
        { name: 'li_sugr', provider: 'LinkedIn Insight Tag', purpose: 'Measures visits from our LinkedIn campaigns.', duration: '3 months', planned: true },
        { name: 'bcookie', provider: 'LinkedIn Insight Tag', purpose: 'Recognises your browser for LinkedIn ads.', duration: '1 year', planned: true }
      ] }
  ];
  var CLEAR = {
    preferences: [],
    analytics: ['_ga', '_gid', '_gat'],
    marketing: ['li_', 'lidc', 'bcookie', 'bscookie', 'UserMatchHistory', 'AnalyticsSyncHistory', '_gcl']
  };

  /* ---------------- State ---------------- */
  function valid(c) { return c && c.v === VERSION && c.t && (Date.now() - c.t) <= MAX_AGE_MS; }
  function readCookie() {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + KEY + '=([^;]*)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
  }
  function read() {
    var c = null;
    try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!valid(c)) c = readCookie();
    return valid(c) ? c : null;
  }
  var current = read();
  var listeners = [];

  function save(choice) {
    var prev = current;
    var c = { v: VERSION, t: Date.now(), necessary: true };
    OPTIONAL.forEach(function (k) { c[k] = !!choice[k]; });
    current = c;
    var json = JSON.stringify(c);
    try { localStorage.setItem(KEY, json); } catch (e) {}
    document.cookie = KEY + '=' + encodeURIComponent(json) + '; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    OPTIONAL.forEach(function (k) { if (!c[k] && (!prev || prev[k])) clearCategory(k); });
    activate();
    listeners.forEach(function (fn) { try { fn(copy()); } catch (e) {} });
    try { document.dispatchEvent(new CustomEvent('loopconsent:change', { detail: copy() })); } catch (e) {}
    hideBanner();
  }
  function copy() { return current ? JSON.parse(JSON.stringify(current)) : null; }

  function activate() {
    if (!current) return;
    var nodes = document.querySelectorAll('script[type="text/plain"][data-consent]:not([data-consent-loaded])');
    Array.prototype.forEach.call(nodes, function (s) {
      if (!current[s.getAttribute('data-consent')]) return;
      var n = document.createElement('script');
      Array.prototype.forEach.call(s.attributes, function (a) {
        if (a.name !== 'type' && a.name !== 'data-consent') n.setAttribute(a.name, a.value);
      });
      if (!s.getAttribute('src')) n.text = s.text;
      s.setAttribute('data-consent-loaded', '');
      s.parentNode.insertBefore(n, s.nextSibling);
    });
  }

  function clearCategory(cat) {
    var prefixes = CLEAR[cat] || [];
    if (!prefixes.length) return;
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!name || !prefixes.some(function (p) { return name.indexOf(p) === 0; })) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; Path=/' + (d ? '; Domain=' + d : '');
      });
    });
  }

  /* ---------------- Helpers ---------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function cookieRows(list, withCategory, catName) {
    return list.map(function (k) {
      return '<tr>' +
        '<td data-label="Cookie"><span class="ck-code">' + esc(k.name) + '</span></td>' +
        '<td data-label="Provider">' + esc(k.provider) + '</td>' +
        (withCategory ? '<td data-label="Category">' + esc(catName) + '</td>' : '') +
        '<td data-label="Purpose">' + esc(k.purpose) + (k.planned ? '<br /><span class="ck-tag">Not active yet</span>' : '') + '</td>' +
        '<td data-label="Duration">' + esc(k.duration) + '</td>' +
        '</tr>';
    }).join('');
  }
  function tableHTML(cat) {
    if (!cat.cookies.length) return '<p class="ck-empty">' + esc(cat.empty) + '</p>';
    return '<table class="ck-table"><thead><tr><th scope="col">Cookie</th><th scope="col">Provider</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead><tbody>' +
      cookieRows(cat.cookies, false) + '</tbody></table>';
  }

  /* ---------------- Banner ---------------- */
  var banner, bannerTimer;
  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'ck-banner';
    banner.hidden = true;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'ck-b-title');
    banner.setAttribute('aria-describedby', 'ck-b-desc');
    banner.innerHTML =
      '<div class="ck-b-head">' +
        '<span class="ck-badge">' + ICON.cookie + '</span>' +
        '<div>' +
          '<p class="ck-b-title" id="ck-b-title">We value your privacy</p>' +
          '<p class="ck-b-desc" id="ck-b-desc">We use cookies to keep the site working, remember your preferences and understand how it\u2019s used. You choose what we can use. <a class="ck-link" href="' + page('cookie-policy') + '">Read our Cookie Policy</a></p>' +
        '</div>' +
      '</div>' +
      '<div class="ck-actions">' +
        '<button type="button" class="ck-btn ck-btn-primary" data-ck="accept">Accept All</button>' +
        '<button type="button" class="ck-btn ck-btn-light" data-ck="reject">Reject Non-Essential</button>' +
        '<button type="button" class="ck-btn ck-btn-ghost" data-ck="manage">Manage Preferences</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var a = b.getAttribute('data-ck');
      if (a === 'accept') acceptAll();
      else if (a === 'reject') rejectAll();
      else if (a === 'manage') openPreferences(b);
    });
  }
  function showBanner() {
    if (!banner) buildBanner();
    banner.hidden = false;
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { banner.classList.add('is-in'); syncSuppression(); }, reduceMotion ? 0 : 700);
  }
  function hideBanner() {
    if (!banner || banner.hidden) return;
    clearTimeout(bannerTimer);
    banner.classList.remove('is-in');
    setTimeout(function () { if (current) banner.hidden = true; }, reduceMotion ? 0 : 400);
  }
  // Never sit on top of a site modal (Contact, Case Study, Careers, role detail, Preferences).
  var MODAL_OPEN = '.gt-modal.open, .cd-modal.open, .careers-modal.open, [data-rm-modal].open, .ck-modal.open';
  function syncSuppression() {
    if (!banner) return;
    banner.classList.toggle('is-suppressed', !!document.querySelector(MODAL_OPEN));
  }

  /* ---------------- Preferences modal ---------------- */
  var modal, backdrop, panel, lastFocus, prevOverflow;
  function buildModal() {
    backdrop = document.createElement('div');
    backdrop.className = 'ck-backdrop';
    modal = document.createElement('div');
    modal.className = 'ck-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ck-pref-title');
    modal.setAttribute('aria-describedby', 'ck-pref-sub');

    var rows = CATEGORIES.map(function (c) {
      var nameId = 'ck-n-' + c.id, descId = 'ck-d-' + c.id, tblId = 'ck-t-' + c.id;
      var ctl = c.locked
        ? '<span class="ck-always" id="ck-a-' + c.id + '">Always active</span>' +
          '<button type="button" class="ck-switch" role="switch" aria-checked="true" aria-disabled="true" aria-labelledby="' + nameId + '" aria-describedby="ck-a-' + c.id + '"><span class="ck-knob">' + ICON.check + ICON.dash + '</span></button>'
        : '<button type="button" class="ck-switch" role="switch" aria-checked="false" data-ck-cat="' + c.id + '" aria-labelledby="' + nameId + '" aria-describedby="' + descId + '"><span class="ck-knob">' + ICON.check + ICON.dash + '</span></button>';
      return '<div class="ck-row' + (c.locked ? ' is-on' : '') + '" data-ck-row="' + c.id + '">' +
        '<div class="ck-row-top">' +
          '<span class="ck-badge ck-badge-sm">' + ICON[c.id] + '</span>' +
          '<div><p class="ck-row-name" id="' + nameId + '">' + esc(c.name) + '</p><p class="ck-row-desc" id="' + descId + '">' + esc(c.desc) + '</p></div>' +
          '<div class="ck-ctl">' + ctl + '</div>' +
        '</div>' +
        '<button type="button" class="ck-more" aria-expanded="false" aria-controls="' + tblId + '">View cookies ' + ICON.chevron + '</button>' +
        '<div class="ck-tbl" id="' + tblId + '" hidden>' + tableHTML(c) + '</div>' +
      '</div>';
    }).join('');

    modal.innerHTML =
      '<div class="ck-panel" tabindex="-1">' +
        '<span class="ck-grab" aria-hidden="true"></span>' +
        '<button type="button" class="ck-close" data-ck-close aria-label="Close cookie preferences">' + ICON.close + '</button>' +
        '<h2 class="ck-h" id="ck-pref-title">Cookie Preferences</h2>' +
        '<p class="ck-sub" id="ck-pref-sub">Choose which cookies we can use. You can change this anytime.</p>' +
        (privacySignal ? '<p class="ck-signal">Your browser is sending a privacy signal, so optional cookies start switched off.</p>' : '') +
        '<div class="ck-rows">' + rows + '</div>' +
        '<div class="ck-foot">' +
          '<button type="button" class="ck-btn ck-btn-primary" data-ck-save>Save My Choices</button>' +
          '<button type="button" class="ck-btn ck-btn-light" data-ck-all>Accept All</button>' +
          '<button type="button" class="ck-btn ck-btn-ghost" data-ck-none>Reject Non-Essential</button>' +
        '</div>' +
        '<p class="ck-links"><a class="ck-link" href="' + page('cookie-policy') + '">Cookie Policy</a><a class="ck-link" href="' + page('privacy-policy') + '">Privacy Policy</a></p>' +
      '</div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    panel = modal.querySelector('.ck-panel');

    modal.addEventListener('click', function (e) {
      if (e.target === modal) { closePreferences(); return; }
      var sw = e.target.closest('.ck-switch[data-ck-cat]');
      if (sw) { setSwitch(sw, sw.getAttribute('aria-checked') !== 'true'); return; }
      var more = e.target.closest('.ck-more');
      if (more) {
        var open = more.getAttribute('aria-expanded') !== 'true';
        more.setAttribute('aria-expanded', String(open));
        document.getElementById(more.getAttribute('aria-controls')).hidden = !open;
        return;
      }
      if (e.target.closest('[data-ck-close]')) { closePreferences(); return; }
      if (e.target.closest('[data-ck-save]')) {
        var choice = {};
        Array.prototype.forEach.call(modal.querySelectorAll('.ck-switch[data-ck-cat]'), function (s) {
          choice[s.getAttribute('data-ck-cat')] = s.getAttribute('aria-checked') === 'true';
        });
        save(choice); closePreferences(); toast('Your cookie preferences have been saved.');
        return;
      }
      if (e.target.closest('[data-ck-all]')) { acceptAll(); closePreferences(); toast('Your cookie preferences have been saved.'); return; }
      if (e.target.closest('[data-ck-none]')) { rejectAll(); closePreferences(); toast('Your cookie preferences have been saved.'); }
    });
    backdrop.addEventListener('click', closePreferences);
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closePreferences(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(panel.querySelectorAll('button:not([aria-disabled="true"]), a[href]'), function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Swipe down to close (mobile full-screen sheet), only when scrolled to the top.
    var startY = null, dy = 0;
    panel.addEventListener('touchstart', function (e) {
      if (window.innerWidth > 640 || panel.scrollTop > 0) { startY = null; return; }
      startY = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (startY === null) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      if (!reduceMotion) panel.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    panel.addEventListener('touchend', function () {
      if (startY === null) return;
      panel.style.transform = '';
      if (dy > 110) closePreferences();
      startY = null;
    });
  }
  function setSwitch(sw, on) {
    sw.setAttribute('aria-checked', String(on));
    var row = sw.closest('.ck-row');
    if (row) row.classList.toggle('is-on', on);
  }
  function openPreferences(opener) {
    if (!modal) buildModal();
    lastFocus = opener && opener.focus ? opener : document.activeElement;
    Array.prototype.forEach.call(modal.querySelectorAll('.ck-switch[data-ck-cat]'), function (s) {
      setSwitch(s, !!(current && current[s.getAttribute('data-ck-cat')]));
    });
    Array.prototype.forEach.call(modal.querySelectorAll('.ck-more'), function (m) {
      m.setAttribute('aria-expanded', 'false');
      document.getElementById(m.getAttribute('aria-controls')).hidden = true;
    });
    panel.scrollTop = 0;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    backdrop.classList.add('open');
    modal.classList.add('open');
    syncSuppression();
    setTimeout(function () { var c = modal.querySelector('[data-ck-close]'); if (c) c.focus(); }, 60);
  }
  function closePreferences() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = prevOverflow || '';
    syncSuppression();
    var target = lastFocus;
    if (target && (!document.body.contains(target) || (banner && banner.contains(target) && current))) target = null;
    if (target && target.focus) target.focus();
    lastFocus = null;
  }

  /* ---------------- Toast ---------------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ck-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastTimer);
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------------- Public actions ---------------- */
  function acceptAll() { save({ preferences: true, analytics: true, marketing: true }); }
  function rejectAll() { save({ preferences: false, analytics: false, marketing: false }); }

  /* ---------------- Cookie Policy page renderers ---------------- */
  function renderPolicy() {
    var cards = document.querySelector('[data-ck-cards]');
    if (cards) {
      cards.innerHTML = CATEGORIES.map(function (c) {
        return '<div class="legal-card">' +
          '<div class="legal-card-head"><span class="ck-badge ck-badge-sm">' + ICON[c.id] + '</span>' +
          '<div><p class="legal-card-name">' + esc(c.name) + '</p><p class="legal-card-status">' + (c.locked ? 'Always active' : 'Optional \u00b7 off until you allow it') + '</p></div></div>' +
          '<p class="legal-card-desc">' + esc(c.desc) + '</p></div>';
      }).join('');
    }
    var tbl = document.querySelector('[data-ck-table]');
    if (tbl && tbl.getAttribute('data-ck-table') === 'compact') {
      var rows = [];
      CATEGORIES.forEach(function (c) { c.cookies.forEach(function (k) { rows.push(k); }); });
      tbl.innerHTML = '<table class="ck-table ck-table-compact"><caption class="ck-sr">Cookies used on this site</caption><thead><tr><th scope="col">Cookie</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead><tbody>' +
        rows.map(function (k) {
          return '<tr><td data-label="Cookie"><span class="ck-code">' + esc(k.name) + '</span>' + (k.planned ? '<br /><span class="ck-tag">Not active yet</span>' : '') + '</td>' +
            '<td data-label="Purpose">' + esc(k.purpose) + '</td><td data-label="Duration">' + esc(k.duration) + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else if (tbl) {
      tbl.innerHTML = '<table class="ck-table ck-table-policy"><thead><tr><th scope="col">Cookie</th><th scope="col">Provider</th><th scope="col">Category</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead><tbody>' +
        CATEGORIES.map(function (c) { return cookieRows(c.cookies, true, c.name); }).join('') +
        '</tbody></table>';
    }
  }

  /* ---------------- Init ---------------- */
  function init() {
    // Footer "Cookie Settings", policy-page buttons, anything with [data-cookie-settings]
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      openPreferences(t);
    });
    // Mark the current legal page in the footer row
    var here = location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/i, '');
    Array.prototype.forEach.call(document.querySelectorAll('.ft-legal-links a[href]'), function (a) {
      if (a.getAttribute('href').replace(/\.html$/i, '') === here) a.setAttribute('aria-current', 'page');
    });
    renderPolicy();
    if ('MutationObserver' in window) {
      new MutationObserver(syncSuppression).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    // Saved choices are always honoured (scripts load per category). The banner shows on the
    // first page of a browser session and on a manual refresh — never when moving between
    // pages. To restore once-per-12-months, show it only when !current.
    if (current) activate();
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    var isReload = nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
    var seen = false;
    try { seen = sessionStorage.getItem('loop_banner_seen') === '1'; sessionStorage.setItem('loop_banner_seen', '1'); } catch (e) {}
    if (!seen || isReload) showBanner();
  }

  window.LoopConsent = {
    version: VERSION,
    categories: CATEGORIES,
    get: copy,
    has: function (cat) { return cat === 'necessary' || !!(current && current[cat]); },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    open: function () { openPreferences(); },
    // Shows the banner without reading or changing any saved choice (for review/QA).
    previewBanner: function () { showBanner(); },
    acceptAll: acceptAll,
    rejectAll: rejectAll
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
