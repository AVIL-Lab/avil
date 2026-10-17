/* Projects: gantt filters and today marker, equipment filter. */
(function () {
  "use strict";

  function initGantt() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".gantt__row"));
    if (!rows.length) return;
    var q = document.getElementById("gantt-q");
    var funder = document.getElementById("gantt-funder");
    var seg = document.querySelector("[data-gantt-status]");
    var count = document.getElementById("gantt-count");
    var empty = document.getElementById("gantt-empty");
    var state = { q: "", status: "all", funder: "all" };

    function apply() {
      var n = 0;
      rows.forEach(function (r) {
        var ok = (state.status === "all" || r.getAttribute("data-status") === state.status) &&
          (state.funder === "all" || r.getAttribute("data-funder") === state.funder) &&
          (!state.q || r.getAttribute("data-search").indexOf(state.q) !== -1);
        r.classList.toggle("is-hidden", !ok);
        if (ok) n++;
      });
      count.textContent = n === rows.length ? rows.length + " projects" : n + " of " + rows.length + " projects";
      empty.classList.toggle("is-hidden", n > 0);
    }
    q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); apply(); });
    funder.addEventListener("change", function () { state.funder = funder.value; apply(); });
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]");
      if (!b) return;
      state.status = b.getAttribute("data-v");
      seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      apply();
    });
    if (location.hash === "#past") { state.status = "past"; seg.querySelector('[data-v="past"]').click(); }
    apply();

    // Place the "now" line on the same 2010-2031 month scale the bars use.
    var gantt = document.querySelector(".gantt");
    var from = parseInt(getComputedStyle(gantt).getPropertyValue("--from"), 10) || 2010;
    var to = parseInt(getComputedStyle(gantt).getPropertyValue("--to"), 10) || 2031;
    var now = new Date();
    var pos = ((now.getFullYear() - from) * 12 + now.getMonth() + now.getDate() / 31) / ((to - from) * 12);
    var line = document.getElementById("gantt-now");
    if (line && pos > 0 && pos < 1) { line.style.left = (pos * 100).toFixed(2) + "%"; line.style.display = "block"; }
  }

  function initEquipment() {
    var bar = document.getElementById("equip-filter");
    if (!bar) return;
    var items = document.querySelectorAll(".equip__item");
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      var cat = b.getAttribute("data-cat");
      bar.querySelectorAll("[data-cat]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      items.forEach(function (it) { it.classList.toggle("is-hidden", cat !== "all" && it.getAttribute("data-cat") !== cat); });
    });
  }

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () { [initGantt, initEquipment].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } }); });
})();
