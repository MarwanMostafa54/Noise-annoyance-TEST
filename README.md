# Noise Annoyance Test — Vite + React + Tailwind + zustand

This repository contains a minimal Vite-powered React app scaffolded with Tailwind CSS for styling, zustand for global state, and react-router-dom for routing.

Getting started (PowerShell):

```powershell
# install dependencies
npm install

# start dev server
npm run dev
```

What was added
- `package.json` with scripts and dependencies
- `vite.config.js` — Vite config using `@vitejs/plugin-react`
- `tailwind.config.cjs` + `postcss.config.cjs` — Tailwind setup with custom colors (brand-start/brand-mid/brand-end)
- `src/` with `main.jsx`, `App.jsx`, `pages/Home.jsx`, `pages/About.jsx`, `store/useStore.js`, and `index.css`
- `index.html`, `.gitignore`, `README.md`

Next steps
- Run `npm install` then `npm run dev` and open the provided local URL.
- Optional: tweak colors in `tailwind.config.cjs` or add components.
