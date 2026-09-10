/**
 * Theme switching — Light, Dark, or System.
 *
 * "system" is the default and stores nothing; picking Light or Dark sets
 * `data-theme` on <html> and remembers the choice in localStorage. The
 * matching inline script in index.html applies a saved choice before first
 * paint, so this file only handles interaction and the initial button state.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "math-app-theme";
  var VALID_CHOICES = ["light", "dark", "system"];

  var root = document.documentElement;
  var switchEl = document.querySelector(".theme-switch");

  /** localStorage throws in some privacy modes, so every access is guarded. */
  function readStoredChoice() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return VALID_CHOICES.indexOf(saved) !== -1 ? saved : "system";
    } catch (err) {
      return "system";
    }
  }

  function storeChoice(choice) {
    try {
      if (choice === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, choice);
      }
    } catch (err) {
      /* Theme still applies for this page view; it just won't be remembered. */
    }
  }

  function applyChoice(choice) {
    if (choice === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = choice;
    }

    var options = switchEl.querySelectorAll("[data-theme-choice]");
    for (var i = 0; i < options.length; i++) {
      var isSelected = options[i].dataset.themeChoice === choice;
      options[i].setAttribute("aria-checked", isSelected ? "true" : "false");
      options[i].tabIndex = isSelected ? 0 : -1;
    }
  }

  switchEl.addEventListener("click", function (event) {
    var option = event.target.closest("[data-theme-choice]");
    if (!option) return;

    var choice = option.dataset.themeChoice;
    applyChoice(choice);
    storeChoice(choice);
  });

  // Left/right arrows move between options, as expected for a radiogroup.
  switchEl.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    var step = event.key === "ArrowRight" ? 1 : -1;
    var current = VALID_CHOICES.indexOf(readCurrentChoice());
    var next = VALID_CHOICES[(current + step + VALID_CHOICES.length) % VALID_CHOICES.length];

    applyChoice(next);
    storeChoice(next);
    switchEl.querySelector('[data-theme-choice="' + next + '"]').focus();
    event.preventDefault();
  });

  function readCurrentChoice() {
    return root.dataset.theme || "system";
  }

  applyChoice(readStoredChoice());
})();
