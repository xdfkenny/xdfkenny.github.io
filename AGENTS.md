# Repository Notes

## Project Shape
- This is a static GitHub Pages portfolio: `index.html` is the shipped entrypoint, with root-level `styles.css` and `script.js` loaded directly.
- There is no package manifest, build step, test runner, linter, formatter, or CI config in this repo; do not add Node tooling unless the user asks.
- The deployed source is the repo root, so changes to HTML/CSS/JS are the deliverable rather than generated output.

## Gotchas
- `README.md` is partly stale: it describes music and Chongyun sections that are not in the current `index.html`; trust the actual page files when they conflict.
- `index.html` links to `/website1` and `/website2`, but those pages/directories are not present locally; verify intent before treating them as existing routes.
- Asset filenames include spaces, uppercase names, and binaries under `assets/`; keep exact spelling/case in paths for GitHub Pages.

## Verification
- There are no repo-provided commands to run; do not claim build, lint, or tests passed unless you added or ran an explicit check.
- Use a static server from the repo root rather than `file://` when checking navigation; links use site-root URLs such as `/#`, `/website1`, and `/website2`.
- If Python is available, `python -m http.server 8000` is enough for a focused manual check at `http://localhost:8000/`.
