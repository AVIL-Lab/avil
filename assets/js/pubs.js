/* Publications: search, region/type/topic/year filters, histogram, sort, export, URL state. */
(function () {
  "use strict";
  var AVIL = window.AVIL || {};

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var list = document.getElementById("pub-list");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".pub"));
    var groups = Array.prototype.slice.call(list.querySelectorAll(".pub-year"));
    var q = document.getElementById("pub-q");
    var topicSel = document.getElementById("pub-topic");
    var fromSel = document.getElementById("pub-from");
    var toSel = document.getElementById("pub-to");
    var sortBtn = document.getElementById("pub-sort");
    var histo = document.getElementById("pub-histo");
    var countEl = document.getElementById("pub-count");
    var empty = document.getElementById("pub-empty");
    var topics = [];
    try { topics = JSON.parse(document.getElementById("topics").textContent); } catch (e) { topics = []; }

    var models = items.map(function (el) {
      var text = el.querySelector(".pub__body").textContent.replace(/\s+/g, " ").trim();
      var title = (el.querySelector(".pub__title") || el.querySelector(".pub__text")).textContent;
      var y = parseInt(el.getAttribute("data-year"), 10);
      return {
        el: el, region: el.getAttribute("data-region"), type: el.getAttribute("data-type"),
        year: isNaN(y) ? null : y, hay: text.toLowerCase(), title: title, cite: el.querySelector(".pub__copy").getAttribute("data-copy"),
        topics: topics.filter(function (t) {
          var low = title.toLowerCase();
          return (t.words || []).some(function (w) { return low.indexOf(w) !== -1; }) ||
                 (t.acronyms || []).some(function (a) { return title.indexOf(a) !== -1; });
        }).map(function (t) { return t.key; })
      };
    });

    var years = models.map(function (m) { return m.year; }).filter(Boolean);
    var minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);
    for (var y = maxY; y >= minY; y--) {
      fromSel.add(new Option(String(y), String(y)));
      toSel.add(new Option(String(y), String(y)));
    }
    fromSel.value = String(minY);
    toSel.value = String(maxY);

    var state = { q: "", region: "all", type: "all", topic: "all", from: minY, to: maxY, newest: true };

    function readURL() {
      var p = new URLSearchParams(location.search);
      if (p.get("q")) state.q = p.get("q");
      ["region", "type", "topic"].forEach(function (k) { if (p.get(k)) state[k] = p.get(k); });
      if (p.get("from")) state.from = +p.get("from");
      if (p.get("to")) state.to = +p.get("to");
      if (p.get("sort") === "oldest") state.newest = false;
    }
    function writeURL() {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      ["region", "type", "topic"].forEach(function (k) { if (state[k] !== "all") p.set(k, state[k]); });
      if (state.from !== minY) p.set("from", state.from);
      if (state.to !== maxY) p.set("to", state.to);
      if (!state.newest) p.set("sort", "oldest");
      var s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
    }
    function syncControls() {
      q.value = state.q;
      topicSel.value = state.topic;
      fromSel.value = String(state.from);
      toSel.value = String(state.to);
      document.querySelectorAll("#pub-tools [data-filter]").forEach(function (seg) {
        var k = seg.getAttribute("data-filter");
        seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === state[k])); });
      });
      document.querySelectorAll("[data-preset]").forEach(function (b) {
        var pr = b.getAttribute("data-preset").split(",");
        b.classList.toggle("is-active", state.region === pr[0] && state.type === pr[1]);
      });
      sortBtn.querySelector("span").textContent = state.newest ? "Newest first" : "Oldest first";
    }

    function passes(m, ignoreYear) {
      if (state.region !== "all" && m.region !== state.region) return false;
      if (state.type !== "all" && m.type !== state.type) return false;
      if (state.topic !== "all" && m.topics.indexOf(state.topic) === -1) return false;
      if (!ignoreYear && m.year && (m.year < state.from || m.year > state.to)) return false;
      if (!ignoreYear && !m.year && (state.from !== minY || state.to !== maxY)) return false;
      if (state.q) {
        var terms = state.q.toLowerCase().split(/\s+/);
        for (var i = 0; i < terms.length; i++) if (m.hay.indexOf(terms[i]) === -1 && String(m.year) !== terms[i]) return false;
      }
      return true;
    }

    function drawHisto() {
      var counts = {};
      for (var y = minY; y <= maxY; y++) counts[y] = { i: 0, d: 0 };
      models.forEach(function (m) { if (m.year && passes(m, true)) counts[m.year][m.region === "international" ? "i" : "d"]++; });
      var peak = 1;
      Object.keys(counts).forEach(function (k) { peak = Math.max(peak, counts[k].i + counts[k].d); });
      var html = "";
      for (y = minY; y <= maxY; y++) {
        var c = counts[y], tot = c.i + c.d, out = y < state.from || y > state.to;
        html += '<button type="button" class="histo__bar' + (out ? " is-out" : "") + '" data-year="' + y + '" aria-label="' + y + ": " + tot + ' papers">' +
          '<span class="histo__tip">' + y + " · " + tot + "</span>" +
          (c.i ? '<span class="histo__seg histo__seg--intl" style="height:' + (c.i / peak * 100).toFixed(1) + '%"></span>' : "") +
          (c.d ? '<span class="histo__seg histo__seg--dom" style="height:' + (c.d / peak * 100).toFixed(1) + '%"></span>' : "") +
          '<span class="histo__year">' + y + "</span></button>";
      }
      histo.innerHTML = html;
    }

    function highlight(m) {
      m.el.querySelectorAll("mark").forEach(function (mk) { mk.replaceWith(document.createTextNode(mk.textContent)); });
      if (!state.q) return;
      var terms = state.q.split(/\s+/).filter(function (t) { return t.length > 1; });
      if (!terms.length) return;
      var re = new RegExp("(" + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "ig");
      var title = m.el.querySelector(".pub__title");
      if (title) title.innerHTML = AVIL.escape(title.textContent).replace(re, "<mark>$1</mark>");
    }

    function apply() {
      var shown = 0;
      models.forEach(function (m) {
        var ok = passes(m, false);
        m.el.classList.toggle("is-hidden", !ok);
        if (ok) { shown++; highlight(m); }
      });
      groups.forEach(function (g) {
        var n = g.querySelectorAll(".pub:not(.is-hidden)").length;
        g.classList.toggle("is-hidden", n === 0);
        g.querySelector(".pub-year__n").textContent = n + (n === 1 ? " paper" : " papers");
      });
      var ordered = groups.slice().sort(function (a, b) {
        var ya = parseInt(a.getAttribute("data-year-group"), 10) || 0, yb = parseInt(b.getAttribute("data-year-group"), 10) || 0;
        if (!ya) return 1;
        if (!yb) return -1;
        return state.newest ? yb - ya : ya - yb;
      });
      ordered.forEach(function (g) { list.appendChild(g); });
      countEl.textContent = shown === models.length ? models.length + " papers" : shown + " of " + models.length + " papers";
      empty.classList.toggle("is-hidden", shown > 0);
      drawHisto();
      syncControls();
      writeURL();
    }

    var timer;
    q.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = q.value.trim(); apply(); }, 120);
    });
    document.querySelectorAll("#pub-tools [data-filter]").forEach(function (seg) {
      seg.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (!b) return;
        state[seg.getAttribute("data-filter")] = b.getAttribute("data-v");
        apply();
      });
    });
    document.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var pr = b.getAttribute("data-preset").split(",");
        var same = state.region === pr[0] && state.type === pr[1];
        state.region = same ? "all" : pr[0];
        state.type = same ? "all" : pr[1];
        apply();
      });
    });
    topicSel.addEventListener("change", function () { state.topic = topicSel.value; apply(); });
    fromSel.addEventListener("change", function () { state.from = +fromSel.value; if (state.from > state.to) state.to = state.from; apply(); });
    toSel.addEventListener("change", function () { state.to = +toSel.value; if (state.to < state.from) state.from = state.to; apply(); });
    sortBtn.addEventListener("click", function () { state.newest = !state.newest; apply(); });
    histo.addEventListener("click", function (e) {
      var b = e.target.closest("[data-year]");
      if (!b) return;
      var y = +b.getAttribute("data-year");
      if (state.from === y && state.to === y) { state.from = minY; state.to = maxY; }
      else { state.from = y; state.to = y; }
      apply();
    });
    document.getElementById("pub-reset").addEventListener("click", function () {
      state = { q: "", region: "all", type: "all", topic: "all", from: minY, to: maxY, newest: true };
      apply();
    });
    document.getElementById("pub-export").addEventListener("click", function () {
      var rows = models.filter(function (m) { return !m.el.classList.contains("is-hidden"); })
        .map(function (m) { return (m.year || "n.d.") + "\t" + m.cite; });
      var blob = new Blob([rows.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "avil_publications.txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      if (AVIL.toast) AVIL.toast(rows.length + " citations exported");
    });

    readURL();
    apply();
  });
})();
