# AGENTS.md

This is a **Preact 11** app (not React), built with Vite and `@preact/preset-vite`.

Preact docs for agents: https://preactjs.com/llms.txt, an index of Markdown pages such as https://preactjs.com/guide/v11/hooks.md

## Differences from React (Preact 11 without compat)

- Text inputs: use `onInput`. `onChange` only fires once the value is committed.
- Numeric styles get no `px`: write `style={{ width: '200px' }}`, not `{ width: 200 }`.
- `defaultProps` is ignored; use default parameter values.
- `ref` is a regular prop on function components; `forwardRef` isn't needed.
- `render(vnode, parent)` has no third argument.
- SVG attributes keep their SVG names: `stroke-width`, not `strokeWidth`.
- Prefer `class` over `className`.

## Commands

- `npm run dev`: dev server at http://localhost:5173/
- `npm run build`: production build to `dist/`
- `npm run preview`: serve the production build at http://localhost:4173/
