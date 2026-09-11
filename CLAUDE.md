# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

A self-contained browser calculator. **No build step, no dependencies, no
database, no backend.** Static files only — opening `index.html` in a browser
is the whole runtime. Keep it that way: do not add a bundler, a framework, or
a package manager without being asked.

| File | Purpose |
| --- | --- |
| `index.html` | Display and keypad markup |
| `styles.css` | Theme tokens, layout, key styles |
| `app.js` | Calculator state, operations, input handling |
| `theme.js` | Theme selection and persistence |

## GitHub identity — read this before any git or `gh` command

This repo is owned by the **school** account `gdiazcasanas`, but the machine's
default GitHub identity is the **personal** account `redeemefy`. They are split
across two different mechanisms, and only one of them works for writes.

**`git` works.** The remote is `git@github-lipscomb:gdiazcasanas/math-app.git`.
`github-lipscomb` is an SSH alias in `~/.ssh/config` pointing at
`id_ed25519_lipscomb`, which authenticates as `gdiazcasanas`. Push, fetch,
branch deletion — all fine.

> Never repoint the remote at plain `github.com`. That host uses `id_ed25519` =
> `redeemefy`, which has **pull-only** access here, and pushes will be rejected.

**`gh` does not work for writes.** The CLI holds an OAuth token for `redeemefy`,
entirely separate from SSH. Any API write against this repo fails with
`GraphQL: must be a collaborator` — including `gh pr create`, `gh pr merge`,
and `gh issue create`.

So: **do not reach for `gh` to open a PR.** Push the branch, then hand over a
browser link:

```
https://github.com/gdiazcasanas/math-app/compare/main...<branch>?expand=1
```

The permanent fix is for the user to run `gh auth login --hostname github.com
--git-protocol ssh` in an interactive terminal and pick `gdiazcasanas`. Offer
it, but it cannot be run from a non-interactive session.

Commit identity is set per-repo to `Gilberto Diaz <gdiazcasanas@lipscomb.edu>`
(the global setting is a different address). Leave it alone.

## Workflow

Work on a feature branch cut from `main`, never commit directly to `main`. The
user merges on GitHub, then asks for branch cleanup. Verify a merge with
`git merge-base --is-ancestor <sha> origin/main` before deleting anything, and
use `git branch -d` (never `-D`).

## Verifying changes

There are no tests and no test runner. Verify UI changes by actually running
the app, not by reading the code:

```bash
python3 -m http.server 8765
```

`.claude/launch.json` defines a `math-app` config so the Browser pane can serve
the folder directly. Opening `index.html` as a `file://` URL renders it as a
static snapshot with CSS and JS stripped — always serve over HTTP instead.

Two things that have previously caused false conclusions:

- Screenshots can be captured **mid-transition**. Keys animate over 0.12s, so a
  screenshot taken immediately after a click may show stale or half-faded
  colors. Wait ~1s, or read the DOM, before concluding something is broken.
- Batched clicks can outrun rendering. Read `#entry` / `#expression`
  `textContent` to confirm state rather than trusting a screenshot alone.

The calculator logic can be exercised by dispatching `keydown` events at
`document` and reading `#entry`.

## Conventions

- Vanilla ES5-style JS in an IIFE with `"use strict"` — match the existing
  style, no modules or transpilation.
- Operations live in the `OPERATIONS` lookup in `app.js`; add a symbol to
  `OPERATOR_SYMBOLS` and a `data-operator` button to extend.
- Evaluation is **left-to-right, no operator precedence** (`2 + 3 × 4` = `20`).
  This is deliberate pocket-calculator behavior — confirm before changing it.
- Colors go through CSS custom properties. Any new token must be defined in the
  base `:root` block **and** in both dark blocks
  (`@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and
  `:root[data-theme="dark"]`), or the theme switcher will break.
- Wrap every `localStorage` access in `try`/`catch`; blocked storage must
  degrade gracefully rather than throw.
