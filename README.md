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
- Percent, sign toggle, backspace, and clear
- Full keyboard support — digits, `+` `-` `*` `/`, `Enter`, `Backspace`, `Esc`
- Thousands separators and floating-point cleanup, so `0.1 + 0.2` reads as `0.3`
- Divide-by-zero and out-of-range results surface as errors instead of `Infinity`
- Light and dark themes, following your system preference

## Layout

| File | Purpose |
| --- | --- |
| `index.html` | Markup for the display and keypad |
| `styles.css` | Theming, layout, and key styles |
| `app.js` | Calculator state, operations, and input handling |

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
