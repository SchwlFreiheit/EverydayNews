# EverydayNews architecture

This repository uses one canonical site implementation.

## Canonical files

- `index.html` — page shell only
- `assets/styles.css` — all presentation
- `assets/app.js` — one renderer and interactions
- `data/articles-a.js` ... `data/articles-d.js` — structured article data
- `tools/validate.mjs` — structural and content checks

The old `parts/` files are legacy only and are not loaded by the site.

## Hard rules

1. Do not build the page by concatenating HTML fragments.
2. Do not use `document.write`, global DOM rewriting, `TreeWalker`, or blanket text replacement.
3. Do not add a new `parts/NNN.html` patch to change live behavior.
4. Terms are explained only when an article author explicitly marks them with `[[term-key|visible label]]`.
5. Semantic color is explicit in article text with `<<core|...>>`, `<<proof|...>>`, `<<warn|...>>`, or `<<risk|...>>`.
6. Existing clear terminology must not be automatically replaced.
7. List titles are short identifiers, not compressed summaries.
8. Overview, explanation, and detail are separate authored content, not the same body with appended paragraphs.
9. New articles are added as structured data and must pass `node tools/validate.mjs`.
10. Automation must not change architecture or renderer while adding ordinary articles.

Any future migration of these rules requires an intentional architecture change, not a patch layered on top.
