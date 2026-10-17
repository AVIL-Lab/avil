/* Professor career filter and members search / role / interest filters. */
(function () {
  "use strict";

  function initCareer() {
    var seg = document.querySelector("[data-career-filter]");
    var list = document.querySelector("[data-career]");
    if (!seg || !list) return;
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-kind]");
      if (!b) return;
      var kind = b.getAttribute("data-kind");
      seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      list.querySelectorAll(".timeline__item").forEach(function (li) {
        li.classList.toggle("is-dim", kind !== "all" && li.getAttribute("data-kind") !== kind);
      });
    });
  }

  function initMembers() {
    var tools = document.querySelector("[data-member-tools]");
    if (!tools) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".member"));
    var groups = document.querySelectorAll(".member-group");
    var search = document.getElementById("member-search");
    var countEl = document.getElementById("member-count");
    var empty = document.getElementById("member-empty");
    var interestCount = document.getElementById("interest-count");
    var state = { role: "all", q: "", interests: [] };

    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ints = (c.getAttribute("data-interests") || "").split("|");
        var ok = (state.role === "all" || c.getAttribute("data-role") === state.role) &&
          (!state.q || c.getAttribute("data-search").indexOf(state.q) !== -1) &&
          state.interests.every(function (i) { return ints.indexOf(i) !== -1; });
        c.classList.toggle("is-hidden", !ok);
        c.querySelectorAll(".member__interests li").forEach(function (li) {
          li.classList.toggle("is-match", state.interests.indexOf(li.textContent.trim().toLowerCase()) !== -1);
        });
        if (ok) shown++;
      });
      groups.forEach(function (g) {
        g.classList.toggle("is-hidden", !g.querySelector(".member:not(.is-hidden)"));
      });
      if (countEl) countEl.textContent = shown === cards.length ? cards.length + " members" : shown + " of " + cards.length + " members";
      if (empty) empty.classList.toggle("is-hidden", shown > 0);
      if (interestCount) interestCount.textContent = state.interests.length ? state.interests.length : "";
    }

    tools.addEventListener("click", function (e) {
      var r = e.target.closest("[data-role]");
      if (r) {
        state.role = r.getAttribute("data-role");
        tools.querySelectorAll("[data-role]").forEach(function (x) { x.classList.toggle("is-active", x === r); });
        apply();
        return;
      }
      var i = e.target.closest("[data-interest]");
      if (i) {
        var key = i.getAttribute("data-interest");
        var at = state.interests.indexOf(key);
        if (at === -1) state.interests.push(key); else state.interests.splice(at, 1);
        i.setAttribute("aria-pressed", String(at === -1));
        apply();
      }
    });
    if (search) search.addEventListener("input", function () { state.q = search.value.trim().toLowerCase(); apply(); });
    document.addEventListener("click", function (e) {
      var d = document.querySelector(".interest-picker[open]");
      if (d && !d.contains(e.target)) d.removeAttribute("open");
    });
    apply();
  }

  // "About me" pop-ups: native <dialog> gives focus handling and Esc for free.
  function initAbout() {
    document.addEventListener("click", function (e) {
      var open = e.target.closest("[data-about-open]");
      if (open) {
        var d = document.getElementById(open.getAttribute("data-about-open"));
        if (d && d.showModal) { d.showModal(); }
        return;
      }
      if (e.target.closest("[data-about-close]")) {
        var dlg = e.target.closest("dialog");
        if (dlg) dlg.close();
        return;
      }
      // A click on the backdrop lands on the <dialog> itself, outside its inner box.
      if (e.target.tagName === "DIALOG" && e.target.classList.contains("about-dialog")) e.target.close();
    });
  }

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () { [initCareer, initMembers, initAbout].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } }); });
})();
