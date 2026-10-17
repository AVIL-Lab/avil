/* Q1 journals: filters, sorting, card/table views, impact-factor dot plot. */
(function () {
  "use strict";
  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var grid = document.getElementById("jr-grid");
    if (!grid) return;
    var esc = (window.AVIL && window.AVIL.escape) || function (s) { return s; };
    var models = Array.prototype.slice.call(grid.querySelectorAll(".jr")).map(function (el) {
      return {
        el: el, cat: el.getAttribute("data-cat"), jif: parseFloat(el.getAttribute("data-jif")) || 0,
        pct: parseFloat(el.getAttribute("data-pct")) || 100, pub: el.getAttribute("data-pub"),
        name: el.getAttribute("data-name"), abbr: el.getAttribute("data-abbr"), search: el.getAttribute("data-search"),
        issn: el.querySelector(".jr__meta .mono").textContent, field: el.querySelector(".jr__meta dd").textContent.trim(),
        pctText: el.querySelector(".jr__pct").textContent
      };
    });
    var maxJif = Math.ceil(models.reduce(function (m, x) { return Math.max(m, x.jif); }, 0));
    var state = { cat: "all", q: "", min: 0, pct: 100, pub: "all", sort: "jif", view: "cards" };
    var tbody = document.querySelector("#jr-table tbody");

    // Dot plot on a square-root scale so the many journals between IF 3 and 12 spread out.
    function xpos(v) { return 1.5 + Math.sqrt(v / maxJif) * 96; }
    function drawPlot() {
      var ticks = [0, 2, 5, 10, 15, 20, 30].filter(function (t) { return t <= maxJif; });
      document.getElementById("jr-ticks").innerHTML = ticks.map(function (t) {
        return '<span style="left:' + xpos(t).toFixed(2) + '%">' + t + "</span>";
      }).join("");
      document.querySelectorAll(".jr-plot__row").forEach(function (row) {
        var cat = row.getAttribute("data-cat");
        var track = row.querySelector(".jr-plot__track");
        track.innerHTML = models.filter(function (m) { return m.cat === cat; }).map(function (m, i) {
          return '<a class="jr-dot" data-id="' + m.el.id + '" href="#' + m.el.id + '" style="left:' + xpos(m.jif).toFixed(2) + "%;top:" + (18 + (i % 3) * 11) + 'px">' +
            '<span class="jr-dot__tip">' + esc(m.abbr || m.name) + " · IF " + m.jif + "</span></a>";
        }).join("");
      });
    }

    function passes(m) {
      return (state.cat === "all" || m.cat === state.cat) && m.jif >= state.min && m.pct <= state.pct &&
        (state.pub === "all" || m.pub === state.pub) && (!state.q || m.search.indexOf(state.q) !== -1);
    }

    function apply() {
      var shown = models.filter(passes);
      var ordered = models.slice().sort(function (a, b) {
        if (state.sort === "name") return a.name.localeCompare(b.name);
        if (state.sort === "pct") return a.pct - b.pct || b.jif - a.jif;
        return b.jif - a.jif || a.name.localeCompare(b.name);
      });
      ordered.forEach(function (m) { m.el.classList.toggle("is-hidden", !passes(m)); grid.appendChild(m.el); });
      document.querySelectorAll(".jr-dot").forEach(function (d) {
        var m = models.find(function (x) { return x.el.id === d.getAttribute("data-id"); });
        d.classList.toggle("is-out", !passes(m));
      });
      if (state.view === "table") {
        tbody.innerHTML = ordered.filter(passes).map(function (m) {
          return '<tr class="cat--' + m.cat + '"><th scope="row"><a href="https://portal.issn.org/resource/ISSN/' + esc(m.issn) + '" target="_blank" rel="noopener">' + esc(m.name) + "</a>" +
            (m.abbr ? ' <span class="muted">' + esc(m.abbr) + "</span>" : "") + "</th><td>" + esc(m.field) + "</td><td>" + esc(m.pub) +
            '</td><td class="num mono">' + m.jif + "</td><td>" + esc(m.pctText) + '</td><td class="mono">' + esc(m.issn) + "</td></tr>";
        }).join("");
      }
      document.getElementById("jr-count").textContent = shown.length === models.length ? models.length + " journals" : shown.length + " of " + models.length;
      document.getElementById("jr-empty").classList.toggle("is-hidden", shown.length > 0);
    }

    var tools = document.getElementById("jr-tools");
    tools.addEventListener("click", function (e) {
      var c = e.target.closest("[data-cat]");
      if (c) {
        state.cat = c.getAttribute("data-cat");
        tools.querySelectorAll("[data-cat]").forEach(function (x) { x.classList.toggle("is-active", x === c); });
        apply(); return;
      }
      var s = e.target.closest("[data-sort] button");
      if (s) {
        state.sort = s.getAttribute("data-v");
        s.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === s)); });
        apply(); return;
      }
      var v = e.target.closest("[data-view] button");
      if (v) {
        state.view = v.getAttribute("data-v");
        v.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === v)); });
        grid.classList.toggle("is-hidden", state.view === "table");
        document.getElementById("jr-table-wrap").classList.toggle("is-hidden", state.view !== "table");
        apply();
      }
    });
    var q = document.getElementById("jr-q");
    q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); apply(); });
    var min = document.getElementById("jr-min"), minV = document.getElementById("jr-min-v");
    min.addEventListener("input", function () { state.min = parseFloat(min.value) || 0; minV.textContent = state.min; apply(); });
    document.getElementById("jr-pct").addEventListener("change", function (e) { state.pct = +e.target.value; apply(); });
    document.getElementById("jr-pub").addEventListener("change", function (e) { state.pub = e.target.value; apply(); });

    document.getElementById("jr-plot").addEventListener("click", function (e) {
      var d = e.target.closest(".jr-dot");
      if (!d) return;
      e.preventDefault();
      var card = document.getElementById(d.getAttribute("data-id"));
      if (card.classList.contains("is-hidden") || state.view === "table") {
        state = { cat: "all", q: "", min: 0, pct: 100, pub: "all", sort: state.sort, view: "cards" };
        q.value = ""; min.value = 0; minV.textContent = "0";
        document.getElementById("jr-pct").value = "100"; document.getElementById("jr-pub").value = "all";
        tools.querySelector('[data-view] button[data-v="cards"]').click();
        tools.querySelector('[data-cat="all"]').click();
      }
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.remove("is-linked"); void card.offsetWidth; card.classList.add("is-linked");
    });

    drawPlot();
    apply();
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("jr")) setTimeout(function () { target.scrollIntoView({ block: "center" }); target.classList.add("is-linked"); }, 150);
  });
})();
