# math-app

A self-contained calculator that runs entirely in the browser. No build step, no
dependencies, no database — just three static files.

## Running it

Open `index.html` in any modern browser:

```bash
open index.html
```

That's the whole setup. Nothing to install.

## Features

- Add, subtract, multiply, divide
- Powers (`xʸ`) — `2 ^ 10` is `1,024`, `9 ^ 0.5` is `3`
- Percent, sign toggle, backspace, and clear
- Full keyboard support — digits, `+` `-` `*` `/` `^`, `Enter`, `Backspace`, `Esc`
- Thousands separators and floating-point cleanup, so `0.1 + 0.2` reads as `0.3`
- Divide-by-zero and out-of-range results surface as errors instead of `Infinity`,
  and a negative number raised to a fractional power shows `Not a real number`
  instead of `NaN`
- Switchable light / dark / system theme, remembered between visits

Operations are evaluated strictly left to right with no operator precedence, like
a pocket calculator: `2 + 3 ^ 2 =` is `25`, not `11`, and `2 + 3 × 4 =` is `20`.

## Themes

The control in the header picks between three modes:

| Mode | Behavior |
| --- | --- |
| ☀ Light | Always light, even if the OS is in dark mode |
| ☾ Dark | Always dark, even if the OS is in light mode |
| ⚙ System | Follows the OS setting; this is the default |

Light and Dark are saved to `localStorage` under `math-app-theme` and applied by
an inline script in `<head>`, so a saved theme never flashes the wrong colors on
load. System is the default and stores nothing. Every storage access is wrapped
in `try`/`catch` — in a private window the theme still switches, it just isn't
remembered.

## Layout

| File | Purpose |
| --- | --- |
| `index.html` | Markup for the display and keypad |
| `styles.css` | Theming, layout, and key styles |
| `app.js` | Calculator state, operations, and input handling |
| `theme.js` | Theme selection and persistence |

## Adding an operation

Operations live in a single lookup table in `app.js`:

```js
var OPERATIONS = {
  "+": function (a, b) { return a + b; },
  // ...
};
```

Add an entry there, give it a symbol in `OPERATOR_SYMBOLS`, and add a button with
a matching `data-operator` attribute in `index.html`.
