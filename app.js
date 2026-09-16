/**
 * Math App — a self-contained calculator.
 *
 * No build step, no dependencies, no storage. All state lives in the
 * `state` object below and is rendered into the display on every change.
 */
(function () {
  "use strict";

  var MAX_INPUT_DIGITS = 15;

  /** Every supported binary operation, keyed by the value in `data-operator`. */
  var OPERATIONS = {
    "+": function (a, b) { return a + b; },
    "-": function (a, b) { return a - b; },
    "*": function (a, b) { return a * b; },
    "/": function (a, b) {
      if (b === 0) throw new RangeError("Cannot divide by zero");
      return a / b;
    },
    "^": function (a, b) {
      var result = Math.pow(a, b);
      // e.g. (-8) ^ 0.5 has no real answer.
      if (isNaN(result)) throw new RangeError("Not a real number");
      return result;
    }
  };

  var OPERATOR_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };

  var state = {
    entry: "0",          // the number currently shown, as a raw string
    accumulator: null,   // the left-hand side of a pending operation
    operator: null,      // the pending operator key, e.g. "*"
    expression: "",      // the faded line above the entry
    replaceEntry: false, // next digit starts a new number instead of appending
    error: false
  };

  var entryEl = document.getElementById("entry");
  var expressionEl = document.getElementById("expression");
  var keypadEl = document.querySelector(".keypad");

  // --- number helpers -------------------------------------------------

  /** Trims binary floating-point noise, so 0.1 + 0.2 reads as 0.3. */
  function roundFloat(value) {
    return parseFloat(value.toPrecision(12));
  }

  /** Turns a computed number into the raw string kept in `state.entry`. */
  function toEntryString(value) {
    var rounded = roundFloat(value);
    var magnitude = Math.abs(rounded);
    if (magnitude >= 1e15 || (magnitude > 0 && magnitude < 1e-9)) {
      return rounded.toExponential(6).replace(/\.?0+e/, "e");
    }
    return String(rounded);
  }

  /** Adds thousands separators for display only; `state.entry` stays raw. */
  function withGrouping(raw) {
    if (raw.indexOf("e") !== -1 || raw.indexOf("E") !== -1) return raw;

    var negative = raw.charAt(0) === "-";
    var body = negative ? raw.slice(1) : raw;
    var parts = body.split(".");
    var grouped = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts.length > 1) grouped += "." + parts[1];

    return (negative ? "-" : "") + grouped;
  }

  function currentValue() {
    var value = parseFloat(state.entry);
    return isNaN(value) ? 0 : value;
  }

  // --- rendering ------------------------------------------------------

  function render() {
    entryEl.textContent = state.error ? state.entry : withGrouping(state.entry);
    entryEl.classList.toggle("is-error", state.error);
    expressionEl.textContent = state.expression;

    var operatorKeys = keypadEl.querySelectorAll("[data-operator]");
    for (var i = 0; i < operatorKeys.length; i++) {
      var isPending = state.operator !== null &&
        operatorKeys[i].dataset.operator === state.operator &&
        state.replaceEntry;
      operatorKeys[i].classList.toggle("is-active", isPending);
    }
  }

  function fail(message) {
    state.entry = message;
    state.accumulator = null;
    state.operator = null;
    state.expression = "";
    state.replaceEntry = true;
    state.error = true;
  }

  // --- actions --------------------------------------------------------

  function clearAll() {
    state.entry = "0";
    state.accumulator = null;
    state.operator = null;
    state.expression = "";
    state.replaceEntry = false;
    state.error = false;
  }

  function inputDigit(digit) {
    if (state.error) clearAll();

    if (state.replaceEntry) {
      state.entry = digit;
      state.replaceEntry = false;
      if (state.operator === null) state.expression = "";
    } else if (state.entry === "0") {
      state.entry = digit;
    } else if (state.entry.replace(/[-.]/g, "").length < MAX_INPUT_DIGITS) {
      state.entry += digit;
    }
  }

  function inputDecimal() {
    if (state.error) clearAll();

    if (state.replaceEntry) {
      state.entry = "0.";
      state.replaceEntry = false;
      if (state.operator === null) state.expression = "";
    } else if (state.entry.indexOf(".") === -1) {
      state.entry += ".";
    }
  }

  /** Applies the pending operation, leaving the result in `state.entry`. */
  function resolvePending() {
    var result = OPERATIONS[state.operator](state.accumulator, currentValue());
    if (!isFinite(result)) throw new RangeError("Result is out of range");
    state.entry = toEntryString(result);
  }

  function chooseOperator(operator) {
    if (state.error) return;

    // Pressing a second operator without typing a number just swaps it out.
    if (state.operator !== null && !state.replaceEntry) {
      try {
        resolvePending();
      } catch (err) {
        fail(err.message);
        return;
      }
    }

    state.accumulator = currentValue();
    state.operator = operator;
    state.replaceEntry = true;
    state.expression = withGrouping(toEntryString(state.accumulator)) + " " + OPERATOR_SYMBOLS[operator];
  }

  function equals() {
    if (state.error || state.operator === null) return;

    var left = withGrouping(toEntryString(state.accumulator));
    var symbol = OPERATOR_SYMBOLS[state.operator];
    var right = withGrouping(state.entry);

    try {
      resolvePending();
    } catch (err) {
      fail(err.message);
      return;
    }

    state.expression = left + " " + symbol + " " + right + " =";
    state.accumulator = null;
    state.operator = null;
    state.replaceEntry = true;
  }

  function negate() {
    if (state.error || state.entry === "0") return;
    state.entry = state.entry.charAt(0) === "-" ? state.entry.slice(1) : "-" + state.entry;
  }

  function percent() {
    if (state.error) return;
    state.entry = toEntryString(currentValue() / 100);
    state.replaceEntry = false;
  }

  function squareRoot() {
    if (state.error) return;

    var value = currentValue();
    if (value < 0) {
      fail("Not a real number");
      return;
    }

    // With nothing pending, show what was rooted; otherwise keep "2 +" visible.
    if (state.operator === null) state.expression = "√" + withGrouping(state.entry) + " =";
    state.entry = toEntryString(Math.sqrt(value));
    state.replaceEntry = false;
  }

  function backspace() {
    if (state.error) {
      clearAll();
      return;
    }
    if (state.replaceEntry) {
      state.entry = "0";
      state.replaceEntry = false;
      return;
    }

    state.entry = state.entry.slice(0, -1);
    if (state.entry === "" || state.entry === "-") state.entry = "0";
  }

  var ACTIONS = {
    clear: clearAll,
    backspace: backspace,
    percent: percent,
    sqrt: squareRoot,
    negate: negate,
    decimal: inputDecimal,
    equals: equals
  };

  // --- input handling -------------------------------------------------

  keypadEl.addEventListener("click", function (event) {
    var key = event.target.closest(".key");
    if (!key) return;

    if (key.dataset.digit !== undefined) {
      inputDigit(key.dataset.digit);
    } else if (key.dataset.operator !== undefined) {
      chooseOperator(key.dataset.operator);
    } else if (ACTIONS[key.dataset.action]) {
      ACTIONS[key.dataset.action]();
    }

    render();
  });

  document.addEventListener("keydown", function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    var key = event.key;
    var handled = true;

    if (key >= "0" && key <= "9") {
      inputDigit(key);
    } else if (key === "." || key === ",") {
      inputDecimal();
    } else if (OPERATIONS[key]) {
      chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
      equals();
    } else if (key === "Backspace") {
      backspace();
    } else if (key === "Escape") {
      clearAll();
    } else if (key === "%") {
      percent();
    } else if (key === "r") {
      squareRoot();
    } else {
      handled = false;
    }

    if (handled) {
      // Stops Enter from re-triggering the last focused button.
      event.preventDefault();
      render();
    }
  });

  render();
})();
