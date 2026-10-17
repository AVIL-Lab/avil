/* Home: band viewer, stat count-up, sensing explorer tabs, project progress. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initBandView() {
    var fig = document.querySelector(".bandview");
    if (!fig) return;
    var stage = fig.querySelector(".bandview__stage");
    var range = fig.querySelector(".bandview__range");
    var label = document.getElementById("band-label");
    var names = { thermal: "Thermal", nir: "NIR false color", hsi: "HSI band", edge: "Edge map" };
    var touched = false;

    function setSplit(v) { stage.style.setProperty("--split", v + "%"); }
    range.addEventListener("input", function () { touched = true; setSplit(range.value); });

    fig.querySelectorAll("[data-band]").forEach(function (b) {
      if (b === fig) return;
      b.addEventListener("click", function () {
        var band = b.getAttribute("data-band");
        fig.setAttribute("data-band", band);
        fig.querySelectorAll(".bandview__bands button").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        if (label) label.textContent = names[band] || band;
      });
    });

    // A slow sweep hints that the divider moves; it stops at the first touch.
    if (!reduce) {
      var t0 = null;
      var step = function (t) {
        if (touched) return;
        if (t0 === null) t0 = t;
        var v = 52 + 22 * Math.sin((t - t0) / 1600);
        range.value = v.toFixed(1);
        setSplit(v.toFixed(1));
        if (t - t0 < 9000) requestAnimationFrame(step);
      };
      ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
        stage.addEventListener(ev, function () { touched = true; }, { passive: true });
      });
      requestAnimationFrame(step);
    }
  }

  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10) || 0, t0 = null;
        var tick = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1100);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initExplorer() {
    var root = document.querySelector("[data-explorer]");
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role=tab]"));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (j === null) return;
        e.preventDefault();
        select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
  }

  // "2024-03" -> Date at the start (or end) of that month.
  function monthDate(s, end) {
    var p = String(s || "").split("-");
    if (p.length < 2) return null;
    var y = +p[0], m = +p[1] - 1;
    return end ? new Date(y, m + 1, 0, 23, 59) : new Date(y, m, 1);
  }
  window.AVIL = window.AVIL || {};
  window.AVIL.progress = function (card) {
    var a = monthDate(card.getAttribute("data-start")), b = monthDate(card.getAttribute("data-end"), true);
    if (!a || !b) return null;
    var now = Date.now();
    return Math.max(0, Math.min(1, (now - a) / (b - a)));
  };

  function initProgress() {
    document.querySelectorAll(".proj-mini[data-start]").forEach(function (card) {
      var p = window.AVIL.progress(card);
      if (p === null) return;
      var fill = card.querySelector(".progress__fill");
      var pct = card.querySelector(".proj-mini__pct");
      requestAnimationFrame(function () { fill.style.width = (p * 100).toFixed(1) + "%"; });
      if (pct) pct.textContent = Math.round(p * 100) + "% elapsed";
    });
  }

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    [initBandView, initCounters, initExplorer, initProgress].forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) console.error(e); }
    });
  });
})();
