/* News filters, gallery filters, shared lightbox with keyboard, swipe and deep links. */
(function () {
  "use strict";
  var AVIL = window.AVIL || {};

  function initNews() {
    var tools = document.getElementById("news-tools");
    if (!tools) return;
    var items = Array.prototype.slice.call(document.querySelectorAll(".news-item"));
    var years = document.querySelectorAll(".news-year");
    var q = document.getElementById("news-q");
    var yearSel = document.getElementById("news-year");
    var empty = document.getElementById("news-empty");
    var state = { tag: "all", year: "all", q: "" };
    function apply() {
      var n = 0;
      items.forEach(function (it) {
        var ok = (state.tag === "all" || it.getAttribute("data-tag") === state.tag) &&
          (state.year === "all" || it.getAttribute("data-year") === state.year) &&
          (!state.q || it.getAttribute("data-search").indexOf(state.q) !== -1);
        it.classList.toggle("is-hidden", !ok);
        if (ok) n++;
      });
      years.forEach(function (y) { y.classList.toggle("is-hidden", !y.querySelector(".news-item:not(.is-hidden)")); });
      empty.classList.toggle("is-hidden", n > 0);
    }
    tools.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tag]");
      if (!b) return;
      state.tag = b.getAttribute("data-tag");
      tools.querySelectorAll("[data-tag]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      apply();
    });
    yearSel.addEventListener("change", function () { state.year = yearSel.value; apply(); });
    q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); apply(); });
  }

  function initGallery() {
    var tools = document.getElementById("gallery-tools");
    if (!tools) return;
    var shots = document.querySelectorAll(".shot");
    var tagSel = document.getElementById("gallery-tag");
    var state = { year: "all", tag: "all" };
    function apply() {
      shots.forEach(function (s) {
        var y = +s.getAttribute("data-year");
        var okY = state.year === "all" || (state.year === "past" ? y <= 2021 : String(y) === state.year);
        var okT = state.tag === "all" || s.getAttribute("data-tag") === state.tag;
        s.classList.toggle("is-hidden", !(okY && okT));
      });
    }
    tools.addEventListener("click", function (e) {
      var b = e.target.closest("[data-year]");
      if (!b) return;
      state.year = b.getAttribute("data-year");
      tools.querySelectorAll("[data-year]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      apply();
    });
    tagSel.addEventListener("change", function () { state.tag = tagSel.value; apply(); });
  }

  function initLightbox() {
    var box = document.getElementById("lightbox");
    var dataEl = document.getElementById("photo-data");
    if (!box || !dataEl) return;
    var photos = JSON.parse(dataEl.textContent);
    var img = box.querySelector(".lightbox__img");
    var tag = box.querySelector(".lightbox__tag");
    var when = box.querySelector(".lightbox__when");
    var count = box.querySelector(".lightbox__count");
    var text = box.querySelector(".lightbox__text");
    var cur = 0, order = [], lastFocus = null;

    function visibleOrder() {
      var links = Array.prototype.slice.call(document.querySelectorAll(".js-lightbox"))
        .filter(function (a) { return !a.closest(".is-hidden"); })
        .map(function (a) { return +a.getAttribute("data-index"); });
      return links.length ? links : photos.map(function (_, i) { return i; });
    }
    function show(i) {
      var p = photos[order[i]];
      if (!p) return;
      cur = i;
      img.src = p.src;
      img.alt = p.en;
      tag.className = "tag lightbox__tag tag--" + p.tag;
      tag.textContent = p.tag;
      when.textContent = p.when;
      count.textContent = (i + 1) + " / " + order.length;
      text.textContent = AVIL.lang && AVIL.lang() === "ko" ? p.ko : p.en;
      if (history.replaceState) history.replaceState(null, "", "#" + p.id);
      [order[i - 1], order[i + 1]].forEach(function (k) { if (photos[k]) { var pre = new Image(); pre.src = photos[k].src; } });
    }
    function open(index) {
      order = visibleOrder();
      var at = order.indexOf(index);
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      show(at === -1 ? 0 : at);
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function step(d) { show((cur + d + order.length) % order.length); }

    document.addEventListener("click", function (e) {
      var a = e.target.closest(".js-lightbox");
      if (!a) return;
      e.preventDefault();
      open(+a.getAttribute("data-index"));
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__nav--prev").addEventListener("click", function () { step(-1); });
    box.querySelector(".lightbox__nav--next").addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lightbox__figure")) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Tab") {
        var f = box.querySelectorAll("button");
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    var x0 = null;
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      x0 = null;
    });
    document.addEventListener("avil:lang", function () { if (!box.hidden) show(cur); });

    // Deep link: /gallery/#<photo id> opens that photo.
    var id = location.hash.slice(1);
    if (id && !/^e-/.test(id)) {
      var k = photos.findIndex(function (p) { return p.id === id; });
      if (k !== -1) open(k);
    }
  }

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () { [initNews, initGallery, initLightbox].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } }); });
})();
