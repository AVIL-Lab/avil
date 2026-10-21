/* AVIL core: theme, language, navigation, reveal, search palette, toast. */
(function () {
  "use strict";
  var d = document.documentElement;
  d.classList.add("js");
  var AVIL = window.AVIL = window.AVIL || {};
  AVIL.base = AVIL.base || "";

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
    return value;
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---- Toast + copy ----------------------------------------------------- */
  var toastEl, toastTimer;
  AVIL.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
  };
  AVIL.copy = function (text, msg) {
    function done() { AVIL.toast(msg || "Copied"); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { AVIL.toast("Copy failed"); }
      ta.remove();
    }
  };
  AVIL.lang = function () { return d.getAttribute("data-lang") === "ko" ? "ko" : "en"; };
  AVIL.escape = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---- Theme ------------------------------------------------------------- */
  function isDark() {
    return d.getAttribute("data-theme") === "dark";
  }
  function initTheme() {
    document.querySelectorAll(".js-theme").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        d.setAttribute("data-theme", next);
        store("avil-theme", next);
      });
    });
  }

  /* ---- Language ---------------------------------------------------------- */
  function setLang(lang) {
    d.setAttribute("data-lang", lang);
    d.setAttribute("lang", lang);
    store("avil-lang", lang);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    document.dispatchEvent(new CustomEvent("avil:lang", { detail: lang }));
  }
  function initLang() {
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
    });
    setLang(AVIL.lang());
  }

  /* ---- Navigation -------------------------------------------------------- */
  function initNav() {
    var header = document.querySelector(".site-header");
    var nav = document.getElementById("site-nav");
    var menuBtn = document.querySelector(".js-menu");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
      });
    }
    document.querySelectorAll(".nav__trigger").forEach(function (btn) {
      var item = btn.closest(".nav__item--menu");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });
    document.addEventListener("click", function (e) {
      document.querySelectorAll(".nav__item--menu.is-open").forEach(function (item) {
        if (!item.contains(e.target)) {
          item.classList.remove("is-open");
          item.querySelector(".nav__trigger").setAttribute("aria-expanded", "false");
        }
      });
    });
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---- Reveal ------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Search palette ---------------------------------------------------- */
  var TYPE_LABEL = {
    page: "Pages", member: "Members", alumni: "Alumni", pub: "Publications",
    project: "Projects", news: "News", conf: "Conference deadlines", journal: "Journals"
  };
  var TYPE_ORDER = ["page", "member", "alumni", "project", "pub", "news", "conf", "journal"];

  function initPalette() {
    var root = document.getElementById("palette");
    if (!root) return;
    var input = document.getElementById("palette-input");
    var list = document.getElementById("palette-results");
    var index = null, loading = null, active = 0, lastFocus = null;

    function load() {
      if (index || loading) return loading;
      loading = fetch(AVIL.base + "/search.json").then(function (r) { return r.json(); })
        .then(function (data) {
          index = data.map(function (x) {
            x.hay = (x.title + " " + (x.sub || "") + " " + (x.extra || "")).toLowerCase();
            return x;
          });
          render();
        }).catch(function () { list.innerHTML = '<li class="palette__empty">Search index unavailable.</li>'; });
      return loading;
    }

    function open() {
      lastFocus = document.activeElement;
      root.hidden = false;
      document.body.style.overflow = "hidden";
      input.value = "";
      input.focus();
      load();
      render();
    }
    function close() {
      root.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function highlight(text, terms) {
      var out = AVIL.escape(text);
      terms.forEach(function (t) {
        if (t.length < 2) return;
        var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        out = out.replace(re, "<mark>$1</mark>");
      });
      return out;
    }

    function score(item, terms, q) {
      var s = 0;
      for (var i = 0; i < terms.length; i++) {
        var pos = item.hay.indexOf(terms[i]);
        if (pos === -1) return -1;
        s += pos === 0 ? 6 : 1;
      }
      var tl = item.title.toLowerCase();
      if (tl.indexOf(q) === 0) s += 10;
      else if (tl.indexOf(q) !== -1) s += 5;
      if (item.t === "page") s += 4;
      if (item.t === "member") s += 3;
      return s;
    }

    function render() {
      if (!index) { list.innerHTML = '<li class="palette__empty">Loading&hellip;</li>'; return; }
      var q = input.value.trim().toLowerCase();
      var results;
      if (!q) {
        results = index.filter(function (x) { return x.t === "page"; });
      } else {
        var terms = q.split(/\s+/);
        results = index.map(function (x) { return { x: x, s: score(x, terms, q) }; })
          .filter(function (r) { return r.s >= 0; })
          .sort(function (a, b) { return b.s - a.s; })
          .slice(0, 60).map(function (r) { return r.x; });
      }
      if (!results.length) {
        list.innerHTML = '<li class="palette__empty">No results for &ldquo;' + AVIL.escape(q) + '&rdquo;</li>';
        return;
      }
      var terms2 = q ? q.split(/\s+/) : [];
      var groups = {};
      results.forEach(function (r) { (groups[r.t] = groups[r.t] || []).push(r); });
      var html = "", n = 0;
      TYPE_ORDER.forEach(function (t) {
        if (!groups[t]) return;
        html += '<li class="palette__group" role="presentation">' + TYPE_LABEL[t] + "</li>";
        groups[t].slice(0, t === "pub" ? 12 : 8).forEach(function (r) {
          html += '<li class="palette__item" role="option" data-i="' + (n++) + '"><a href="' +
            AVIL.escape(r.url.indexOf("http") === 0 ? r.url : AVIL.base + r.url) + '"' +
            (r.url.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "") + "><strong>" +
            highlight(r.title, terms2) + "</strong>" + (r.sub ? "<span>" + highlight(r.sub, terms2) + "</span>" : "") +
            "</a></li>";
        });
      });
      list.innerHTML = html;
      active = 0;
      mark();
    }

    function items() { return list.querySelectorAll(".palette__item"); }
    function mark() {
      items().forEach(function (el, i) {
        el.classList.toggle("is-active", i === active);
        el.setAttribute("aria-selected", String(i === active));
        if (i === active) el.scrollIntoView({ block: "nearest" });
      });
    }

    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      var all = items();
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(all.length - 1, active + 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); mark(); }
      else if (e.key === "Enter") {
        var a = all[active] && all[active].querySelector("a");
        if (a) { e.preventDefault(); a.click(); }
      }
    });
    root.addEventListener("click", function (e) { if (e.target.closest(".js-close-palette")) close(); });
    document.addEventListener("keydown", function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); root.hidden ? open() : close(); }
      else if (e.key === "/" && !typing && root.hidden) { e.preventDefault(); open(); }
      else if (e.key === "Escape" && !root.hidden) close();
    });
    document.querySelectorAll(".js-open-palette").forEach(function (b) { b.addEventListener("click", open); });
    if (/Mac|iPhone|iPad/.test(navigator.platform || "")) {
      document.querySelectorAll(".tool__kbd").forEach(function (k) { k.textContent = "⌘K"; });
    }
  }

  /* ---- Copy buttons (data-copy="text") ------------------------------------ */
  function initCopy() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]");
      if (!b) return;
      e.preventDefault();
      AVIL.copy(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg") || "Copied");
    });
  }

  /* ---- Lab-member names in author lists ----------------------------------- */
  // Wraps every spelling listed in #lab-names in <b class="lab-author"> inside
  // .js-authors elements. Longest names first, and a match may not touch another
  // Latin letter, so "Kim S" never fires inside "Kim SD".
  var nameRe = null;
  AVIL.markAuthors = function (root) {
    if (nameRe === null) {
      var src = document.getElementById("lab-names");
      var names = [];
      try { names = src ? JSON.parse(src.textContent) : []; } catch (e) { names = []; }
      names = names.filter(Boolean).sort(function (a, b) { return b.length - a.length; })
        .map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
      nameRe = names.length ? new RegExp("(^|[^A-Za-z\\u00C0-\\u024F])(" + names.join("|") + ")(?![A-Za-z\\u00C0-\\u024F])", "g") : false;
    }
    if (!nameRe) return;
    (root || document).querySelectorAll(".js-authors:not([data-marked])").forEach(function (el) {
      el.setAttribute("data-marked", "");
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var text = node.nodeValue;
        nameRe.lastIndex = 0;
        if (!nameRe.test(text)) return;
        nameRe.lastIndex = 0;
        var span = document.createElement("span");
        span.innerHTML = AVIL.escape(text).replace(nameRe, '$1<b class="lab-author">$2</b>');
        node.parentNode.replaceChild(span, node);
      });
    });
  };

  /* ---- Ambient dots ---------------------------------------------------------
     Pastel dots drifting behind the page and stepping aside for the cursor,
     ported from initAmbientBubbles() on s-elim.github.io (same palette, speeds
     and repulsion). Off for reduced motion; paused while the tab is hidden. */
  function initAmbientDots() {
    var canvas = document.getElementById("ambient-dots");
    if (!canvas || !canvas.getContext) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var PALETTE = [
      { r: 159, g: 191, b: 174 }, { r: 184, g: 222, b: 203 }, { r: 246, g: 207, b: 197 },
      { r: 173, g: 197, b: 230 }, { r: 250, g: 216, b: 212 }, { r: 228, g: 169, b: 155 },
      { r: 247, g: 222, b: 215 }
    ];
    var width = 0, height = 0, particles = [], animId = null;
    var mouse = { x: -1000, y: -1000, active: false }, mouseTimer = null;

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function particle(initial) {
      var radius = Math.random() < 0.65 ? 2.6 + Math.random() * 2.8 : 5.6 + Math.random() * 3.8;
      var speed = 0.12 + Math.random() * 0.22, angle = Math.random() * Math.PI * 2;
      return {
        x: initial ? Math.random() * width : (Math.random() < 0.5 ? -radius : width + radius),
        y: Math.random() * height,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: radius,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: 0.42 + Math.random() * 0.26, phase: Math.random() * Math.PI * 2,
        wobble: 0.006 + Math.random() * 0.010
      };
    }
    function populate() {
      particles = [];
      var n = Math.max(20, Math.min(45, Math.floor(width * height / 32000)));
      for (var i = 0; i < n; i++) particles.push(particle(true));
    }
    function step() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.phase += p.wobble;
        var vx = p.vx + Math.cos(p.phase) * 0.08, vy = p.vy + Math.sin(p.phase) * 0.08;
        if (mouse.active) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 && dist > 1) {
            var push = (1 - dist / 80) * 0.35;
            vx += dx / dist * push;
            vy += dy / dist * push;
          }
        }
        p.x += vx; p.y += vy;
        var pad = p.radius + 15;
        if (p.x < -pad) p.x = width + pad; else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad; else if (p.y > height + pad) p.y = -pad;
      }
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      var dark = isDark();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i], c = p.color, a = dark ? Math.min(0.75, p.alpha * 1.15) : p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + a.toFixed(3) + ")";
        ctx.fill();
      }
    }
    function tick() { step(); draw(); animId = requestAnimationFrame(tick); }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var ow = width || 1, oh = height || 1;
        resize();
        particles.forEach(function (p) { p.x = p.x / ow * width; p.y = p.y / oh * height; });
      }, 150);
    }, { passive: true });
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(function () { mouse.active = false; }, 1200);
    }, { passive: true });
    window.addEventListener("mouseout", function (e) { if (!e.relatedTarget) mouse.active = false; });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (animId) { cancelAnimationFrame(animId); animId = null; } }
      else if (!animId) animId = requestAnimationFrame(tick);
    });

    resize();
    populate();
    animId = requestAnimationFrame(tick);
  }

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } }
  onReady(function () {
    [initTheme, initLang, initNav, initReveal, initPalette, initCopy, initAmbientDots, function () { AVIL.markAuthors(); }].forEach(safe);
  });
})();
