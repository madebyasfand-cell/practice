/* =========================================================
   THE PERFECT DAY — main.js
   Plain JavaScript, no build step, no dependencies.
   ========================================================= */

(function () {
  "use strict";

  // ---- Data: one entry per time-of-day period ----------
  // t   : position along the sky arc, 0 (start) -> 1 (end)
  // dot : hex color used for this period's timeline marker
  var PERIODS = [
    {
      id: "dawn",
      label: "Dawn",
      timeLabel: "Early Morning",
      t: 0.06,
      dot: "#FFB86B",
      activities: [
        "Watch the sunrise",
        "Slow coffee ritual",
        "Stretch and breathe",
        "Write three lines in a journal"
      ]
    },
    {
      id: "day",
      label: "Day",
      timeLabel: "Midday",
      t: 0.5,
      dot: "#4FD8FF",
      activities: [
        "Walk somewhere new",
        "Lunch with a friend",
        "Work on a passion project",
        "Read in the sun"
      ]
    },
    {
      id: "dusk",
      label: "Dusk",
      timeLabel: "Evening",
      t: 0.86,
      dot: "#FF6FAE",
      activities: [
        "Golden hour walk",
        "Cook a proper dinner",
        "Watch the sky change color",
        "Call someone you love"
      ]
    },
    {
      id: "night",
      label: "Night",
      timeLabel: "Late Night",
      t: 0.97,
      dot: "#7B61FF",
      activities: [
        "Stargaze for a while",
        "Take a warm bath",
        "Read one chapter",
        "Fall asleep early"
      ]
    }
  ];

  var MAX_PER_PERIOD = 2;

  // ---- State --------------------------------------------
  var currentPeriodId = "dawn";
  var selections = { dawn: [], day: [], dusk: [], night: [] };
  var noteTimer = null;

  // ---- DOM references ------------------------------------
  var body = document.body;
  var tabsEl = document.getElementById("tabs");
  var indicatorEl = document.getElementById("tabsIndicator");
  var skyEl = document.querySelector(".sky");
  var orbEl = document.getElementById("orb");
  var pickerTitleEl = document.getElementById("pickerTitle");
  var chipsEl = document.getElementById("chips");
  var noteBarEl = document.getElementById("noteBar");
  var revealBtn = document.getElementById("revealBtn");
  var resetBtn = document.getElementById("resetBtn");
  var resultEl = document.getElementById("result");
  var timelineEl = document.getElementById("timeline");

  function getPeriod(id) {
    for (var i = 0; i < PERIODS.length; i++) {
      if (PERIODS[i].id === id) return PERIODS[i];
    }
    return PERIODS[0];
  }

  // ---- Sky arc: move the sun/moon orb along a simple arc --
  function updateOrb(t) {
    var rect = skyEl.getBoundingClientRect();
    var orbSize = orbEl.offsetWidth || 26;
    var usableWidth = rect.width - orbSize - 24; // side padding
    var groundLine = rect.height * 0.72;
    var amplitude = rect.height * 0.5;

    var left = 12 + t * usableWidth;
    // parabola: high at t=0.5 (midday), low near the edges (dawn/night)
    var top = groundLine - amplitude * 4 * t * (1 - t) - orbSize / 2;

    orbEl.style.left = left + "px";
    orbEl.style.top = top + "px";
  }

  // ---- Tabs: move the sliding highlight behind the active tab
  function updateIndicator(index) {
    indicatorEl.style.transform = "translateX(" + index * 100 + "%)";
  }

  // ---- Render the activity chips for the active period ----
  function renderChips() {
    var period = getPeriod(currentPeriodId);
    pickerTitleEl.textContent = period.label;
    chipsEl.innerHTML = "";

    period.activities.forEach(function (activity) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = activity;

      var isSelected = selections[period.id].indexOf(activity) !== -1;
      if (isSelected) btn.classList.add("is-selected");

      btn.addEventListener("click", function () {
        toggleActivity(period.id, activity);
      });

      chipsEl.appendChild(btn);
    });
  }

  function showNote(message) {
    noteBarEl.textContent = message;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      noteBarEl.textContent = "\u00A0";
    }, 2200);
  }

  function toggleActivity(periodId, activity) {
    var list = selections[periodId];
    var index = list.indexOf(activity);

    if (index !== -1) {
      list.splice(index, 1);
    } else if (list.length >= MAX_PER_PERIOD) {
      showNote("You can pick up to " + MAX_PER_PERIOD + " for this time of day.");
      return;
    } else {
      list.push(activity);
    }
    renderChips();
  }

  // ---- Switch the active period (tab click) ---------------
  function setPeriod(periodId) {
    currentPeriodId = periodId;
    var period = getPeriod(periodId);
    var index = PERIODS.indexOf(period);

    body.setAttribute("data-period", periodId);
    updateIndicator(index);
    updateOrb(period.t);
    renderChips();

    var buttons = tabsEl.querySelectorAll(".tabs__btn");
    buttons.forEach(function (btn) {
      var active = btn.getAttribute("data-period") === periodId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  // ---- Build the final timeline from all selections -------
  function revealDay() {
    timelineEl.innerHTML = "";
    var totalCount = 0;

    PERIODS.forEach(function (period) {
      selections[period.id].forEach(function (activity) {
        totalCount++;
        var li = document.createElement("li");
        li.className = "timeline__item";
        li.style.setProperty("--dot", period.dot);

        var time = document.createElement("span");
        time.className = "timeline__time";
        time.textContent = period.timeLabel;

        var text = document.createElement("span");
        text.className = "timeline__activity";
        text.textContent = activity;

        li.appendChild(time);
        li.appendChild(text);
        timelineEl.appendChild(li);
      });
    });

    if (totalCount === 0) {
      var empty = document.createElement("li");
      empty.className = "timeline__empty";
      empty.textContent = "Pick at least one thing you'd love to do, then reveal your day.";
      timelineEl.appendChild(empty);
    }

    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetAll() {
    selections = { dawn: [], day: [], dusk: [], night: [] };
    resultEl.hidden = true;
    timelineEl.innerHTML = "";
    setPeriod("dawn");
  }

  // ---- Wire up events --------------------------------------
  tabsEl.querySelectorAll(".tabs__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPeriod(btn.getAttribute("data-period"));
    });
  });

  revealBtn.addEventListener("click", revealDay);
  resetBtn.addEventListener("click", resetAll);

  window.addEventListener("resize", function () {
    updateOrb(getPeriod(currentPeriodId).t);
  });

  // ---- Initial paint ----------------------------------------
  setPeriod("dawn");
})();
