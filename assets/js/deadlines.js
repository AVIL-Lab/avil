/* AI conference deadlines: live countdowns, filters, sorting, next-up panel, 12-month timeline. */
(function () {
  "use strict";
  var DAY = 86400000;

  /* ---- Time zones ---------------------------------------------------------
     Same reading rules as the source tracker on s-elim.github.io: a stage's
     date and clock time are read in the zone its data names, so a deadline is
     the same instant for every viewer. Fixed labels are minutes east of UTC;
     PT and ET follow daylight saving through Intl. No tz: viewer's clock. */
  var FIXED = { AOE: -720, UTC: 0, GMT: 0, PST: -480, PDT: -420, EST: -300, EDT: -240, CET: 60, CEST: 120, BST: 60, JST: 540, KST: 540 };
  var ZONES = { PT: "America/Los_Angeles", ET: "America/New_York" };

  function zoneOffset(zone, ms) {
    var p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 60000;
  }

  function instant(date, time, tz) {
    var d = String(date || "").split("-");
    if (d.length !== 3) return null;
    var t = String(time || "23:59").split(":");
    var y = +d[0], mo = +d[1] - 1, day = +d[2], h = +t[0] || 0, mi = +t[1] || 0;
    var wall = Date.UTC(y, mo, day, h, mi, 0);
    var key = String(tz || "").trim().toUpperCase();
    var num = /^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/.exec(key);
    if (num) {
      var mins = (+num[2]) * 60 + (+num[3] || 0);
      return wall - (num[1] === "-" ? -mins : mins) * 60000;
    }
    if (FIXED.hasOwnProperty(key)) return wall - FIXED[key] * 60000;
    if (ZONES.hasOwnProperty(key) && window.Intl) {
      try {
        var guess = wall - zoneOffset(ZONES[key], wall) * 60000;
        return wall - zoneOffset(ZONES[key], guess) * 60000;
      } catch (e) { /* fall back to the viewer's clock */ }
    }
    return new Date(y, mo, day, h, mi, 0).getTime();
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function split(ms) {
    return { d: Math.floor(ms / DAY), h: Math.floor(ms % DAY / 3600000), m: Math.floor(ms % 3600000 / 60000), s: Math.floor(ms % 60000 / 1000) };
  }

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var grid = document.getElementById("dl-grid");
    if (!grid) return;
    var esc = (window.AVIL && window.AVIL.escape) || function (s) { return s; };
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".dl"));
    var models = cards.map(function (card) {
      return {
        card: card, name: card.getAttribute("data-name"), cat: card.getAttribute("data-cat"),
        rank: card.getAttribute("data-rank"), search: card.getAttribute("data-search"),
        stageEl: card.querySelector(".dl__stage"), timeEl: card.querySelector(".dl__time"), barEl: card.querySelector(".dl__bar span"),
        stages: Array.prototype.slice.call(card.querySelectorAll(".dl__stages li")).map(function (li) {
          return { el: li, label: li.querySelector(".dl__label").textContent, at: instant(li.getAttribute("data-date"), li.getAttribute("data-time"), li.getAttribute("data-tz")) };
        }),
        next: null, key: Infinity, status: "open"
      };
    });
    var state = { cat: "all", rank: "all", q: "", dated: false, view: "cards" };

    function tick() {
      var now = Date.now();
      models.forEach(function (m) {
        var next = null, prev = null;
        m.stages.forEach(function (s) {
          s.el.classList.remove("is-done", "is-next");
          if (s.at === null) return;
          if (s.at <= now) { s.el.classList.add("is-done"); prev = s; }
          else if (!next) next = s;
        });
        m.next = next;
        m.card.classList.remove("is-urgent", "is-soon", "is-tba", "is-closed");
        if (next) {
          next.el.classList.add("is-next");
          var left = next.at - now, t = split(left);
          m.key = left;
          m.status = "open";
          m.stageEl.textContent = next.label;
          m.timeEl.innerHTML = t.d >= 1
            ? '<b>' + t.d + '</b><small>' + (t.d === 1 ? "day" : "days") + "</small> " + pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s)
            : '<b class="is-live">' + pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s) + "</b>";
          if (t.d < 7) m.card.classList.add("is-urgent"); else if (t.d < 30) m.card.classList.add("is-soon");
          m.barEl.style.width = Math.max(2, Math.min(100, (1 - left / (180 * DAY)) * 100)).toFixed(1) + "%";
        } else if (m.stages.some(function (s) { return s.at === null; })) {
          m.key = Number.MAX_SAFE_INTEGER - 1; m.status = "tba";
          m.card.classList.add("is-tba");
          m.stageEl.textContent = m.stages[m.stages.length - 1].label;
          m.timeEl.textContent = "Not announced";
          m.barEl.style.width = "0";
        } else {
          m.key = Number.MAX_SAFE_INTEGER; m.status = "closed";
          m.card.classList.add("is-closed");
          m.stageEl.textContent = prev ? prev.label : "Closed";
          m.timeEl.textContent = "Closed";
          m.barEl.style.width = "100%";
        }
      });
      nextUp(now);
    }

    function nextUp(now) {
      var open = models.filter(function (m) { return m.next; }).sort(function (a, b) { return a.key - b.key; });
      var first = open[0];
      if (!first) return;
      document.getElementById("next-name").textContent = first.name + " " + (first.card.querySelector(".dl__ed").textContent);
      document.getElementById("next-stage").textContent = first.next.label + " · " + first.next.el.querySelector(".dl__date").textContent;
      var t = split(first.key);
      ["d", "h", "m", "s"].forEach(function (u) {
        var el = document.querySelector('#next-clock [data-u="' + u + '"]');
        if (el) el.textContent = u === "d" ? t.d : pad(t[u]);
      });
      var after = document.getElementById("next-after");
      var html = open.slice(1, 4).map(function (m) {
        return '<li><a href="#conf-' + m.card.id.replace("conf-", "") + '">' + esc(m.name) + "</a><span class=\"mono\">" + Math.floor(m.key / DAY) + "d</span></li>";
      }).join("");
      if (after.innerHTML !== html) after.innerHTML = html;
    }

    function passes(m) {
      return (state.cat === "all" || m.cat === state.cat) && (state.rank === "all" || m.rank === state.rank) &&
        (!state.q || m.search.indexOf(state.q) !== -1) && (!state.dated || m.status === "open");
    }

    var lastOrder = "";
    function apply() {
      var shown = 0, counts = { all: 0, robotics: 0, vision: 0, aiml: 0, hci: 0 };
      models.forEach(function (m) {
        var ok = passes(m);
        m.card.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
        if ((state.rank === "all" || m.rank === state.rank) && (!state.dated || m.status === "open")) { counts.all++; counts[m.cat]++; }
      });
      Object.keys(counts).forEach(function (k) {
        var el = document.querySelector('[data-count="' + k + '"]');
        if (el) el.textContent = counts[k];
      });
      var ordered = models.slice().sort(function (a, b) { return a.key - b.key || a.name.localeCompare(b.name); });
      var sig = ordered.map(function (m) { return m.name; }).join("|");
      if (sig !== lastOrder) { lastOrder = sig; ordered.forEach(function (m) { grid.appendChild(m.card); }); }
      document.getElementById("dl-empty").classList.toggle("is-hidden", shown > 0);
      if (state.view === "timeline") drawTimeline();
    }

    // 12-month strip: one row per visible conference with a dated stage ahead.
    function drawTimeline() {
      var box = document.getElementById("dl-timeline");
      var now = Date.now(), end = now + 365 * DAY;
      var rows = models.filter(function (m) { return passes(m) && m.next; }).sort(function (a, b) { return a.key - b.key; });
      var start = new Date(now); start.setDate(1); start.setHours(0, 0, 0, 0);
      var ticks = "";
      for (var i = 0; i <= 12; i++) {
        var d = new Date(start.getFullYear(), start.getMonth() + i, 1).getTime();
        if (d < now || d > end) continue;
        ticks += '<span style="left:' + ((d - now) / (end - now) * 100).toFixed(2) + '%">' + new Date(d).toLocaleString("en", { month: "short" }) + (new Date(d).getMonth() === 0 ? " " + new Date(d).getFullYear() : "") + "</span>";
      }
      var html = '<div class="tl__axis"><span class="tl__name"></span><div class="tl__ticks">' + ticks + '<i class="tl__today">today</i></div></div>';
      rows.forEach(function (m) {
        var marks = m.stages.filter(function (s) { return s.at && s.at > now && s.at < end; }).map(function (s) {
          return '<a class="tl__mark' + (s === m.next ? " is-next" : "") + '" href="#' + m.card.id + '" style="left:' + ((s.at - now) / (end - now) * 100).toFixed(2) + '%" title="' + esc(m.name + " · " + s.label + " · " + s.el.querySelector(".dl__date").textContent) + '"><span class="sr-only">' + esc(s.label) + "</span></a>";
        }).join("");
        html += '<div class="tl__row cat--' + m.cat + '"><span class="tl__name">' + esc(m.name) + ' <small class="mono">' + Math.floor(m.key / DAY) + 'd</small></span><div class="tl__track">' + marks + "</div></div>";
      });
      if (!rows.length) html += '<p class="empty">No dated deadlines in the next 12 months for these filters.</p>';
      box.innerHTML = html;
    }

    var tools = document.getElementById("dl-tools");
    tools.addEventListener("click", function (e) {
      var c = e.target.closest("[data-cat]");
      if (c) {
        state.cat = c.getAttribute("data-cat");
        tools.querySelectorAll("[data-cat]").forEach(function (x) { x.classList.toggle("is-active", x === c); });
        apply(); return;
      }
      var r = e.target.closest("[data-rank] button");
      if (r) {
        state.rank = r.getAttribute("data-v");
        r.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === r)); });
        apply(); return;
      }
      var v = e.target.closest("[data-view] button");
      if (v) {
        state.view = v.getAttribute("data-v");
        v.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === v)); });
        document.getElementById("dl-timeline").classList.toggle("is-hidden", state.view !== "timeline");
        grid.classList.toggle("is-compact", state.view === "timeline");
        apply();
      }
    });
    var dated = document.getElementById("dl-dated");
    dated.addEventListener("click", function () {
      state.dated = !state.dated;
      dated.setAttribute("aria-pressed", String(state.dated));
      apply();
    });
    var q = document.getElementById("dl-q");
    q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); apply(); });

    tick();
    apply();
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("dl")) {
      setTimeout(function () { target.scrollIntoView({ block: "center" }); target.classList.add("is-linked"); }, 150);
    }
    var lastStatus = models.map(function (m) { return m.status; }).join();
    setInterval(function () {
      tick();
      var s = models.map(function (m) { return m.status; }).join();
      if (s !== lastStatus) { lastStatus = s; apply(); }
    }, 1000);
  });
})();
