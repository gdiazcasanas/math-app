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
- Scientific functions: power (`xʸ`) and square root (`√`)
- Percent, sign toggle, backspace, and clear
- Full keyboard support — digits, `+` `-` `*` `/` `^`, `r` for `√`, `Enter`,
  `Backspace`, `Esc`
- Thousands separators and floating-point cleanup, so `0.1 + 0.2` reads as `0.3`
- Divide-by-zero, out-of-range, and non-real results surface as errors instead of
  `Infinity` or `NaN`
- Switchable light / dark / system theme, remembered between visits

## Scientific functions

### Power

`xʸ` is a binary operator like `+` or `×`: enter the base, press `xʸ`, enter the
exponent, then `=`. The keyboard shortcut is `^`.

| Input | Result |
| --- | --- |
| `2 xʸ 8 =` | `256` |
| `9 xʸ 0.5 =` | `3` (a square root) |
| `2 xʸ 3 ± =` | `0.125` |

Use the `±` key for a negative base or exponent — typing `-` starts a subtraction
instead, since evaluation is left-to-right.

Two results are rejected rather than shown as `Infinity` or `NaN`:

- An overflow such as `8 xʸ 99999` reports *Result is out of range*
- A negative base with a fractional exponent, such as `-8 xʸ 0.5`, has no real
  root and reports *Result is not a real number*

### Square root

`√` is unary: it applies to the number on screen the moment you press it, the
way `%` does. No `=` needed. The keyboard shortcut is `r`.

| Input | Result |
| --- | --- |
| `144 √` | `12` |
| `2 + 9 √ =` | `5` — the root resolves before the addition |
| `-9 √` | *Result is not a real number* |

`9 xʸ 0.5` gets you the same answer as `9 √`, but the dedicated key saves you
from thinking in fractional exponents.

Because the result stays editable — again matching `%` — typing a digit straight
after `√` appends to it rather than starting a new number.

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
a matching `data-operator` attribute in `index.html`. The keyboard handler picks
it up automatically — pressing the key that matches the lookup selects it.

That lookup is for **binary** operations only; every entry takes `(a, b)`. A
unary function like `√` goes in the `ACTIONS` map instead, alongside `percent`
and `negate`, transforming `state.entry` in place. Unary keys get no free
keyboard wiring, so they also need a branch in the `keydown` handler.

Note that evaluation is left-to-right with **no operator precedence**, the way a
pocket calculator behaves. `2 + 3 × 4` is `20`, and `2 + 3 xʸ 2` is `25`.
