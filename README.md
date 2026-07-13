# 📊 db-grid

**Excel-like React data grid — formulas, clipboard, fill handle, grouping, pivot, sparklines, SSRM.**  
One package: `@deepbratt55/db-grid`. MIT · free demo on GitHub Pages.

---

![license](https://img.shields.io/github/license/deepbratt/db-grid)
![stars](https://img.shields.io/github/stars/deepbratt/db-grid?style=social)

**Live demo:** https://deepbratt.github.io/db-grid/  
**Package docs:** [`packages/db-grid/README.md`](./packages/db-grid/README.md) → `@deepbratt55/db-grid`

---

## 📦 Install

```bash
npm install @deepbratt55/db-grid react react-dom
```

```tsx
import { DbGrid } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';

<DbGrid
  rowData={rows}
  columnDefs={cols}
  theme="db-light"
  enableRangeSelection
  enableFillHandle
  enableFormulaBar
  style={{ height: 480, width: '100%' }}
/>
```

Import styles once:

```ts
import '@deepbratt55/db-grid/styles.css';
```

Full feature guide and recipes: **[`@deepbratt55/db-grid` README](./packages/db-grid/README.md)**.

---

## ✨ Features at a glance

- Excel ranges, fill handle, formula bar, undo/redo
- Sort / filter / floating filters / quick filter
- Grouping, aggregations, pivot, tree data
- Sparklines + cell flash for live trading UIs
- CSV + Excel export, clipboard copy/paste
- Server-side row model (SSRM)
- Themes: `db-light`, `db-dark`, quartz, alpine, balham, material
- React 18 & 19 · TypeScript

---

## 🏷 Hashtags (reach)

`#React` `#TypeScript` `#DataGrid` `#Excel` `#Spreadsheet` `#AGGrid` `#Virtualization` `#PivotTable` `#OpenSource` `#MIT` `#FinTech` `#TradingUI`

---

## 🖥 Local demo

```bash
npm install
npm run dev:demo
```

- Demo (home use cases): http://localhost:5173  
- Static Pages build: `npm run build:pages`

## 🚀 npm publish (CI/CD)

Merges to `main` that touch `packages/db-grid/**` run **Publish `@deepbratt55/db-grid`**.

| Commit messages in the merge | Version bump |
|------------------------------|--------------|
| `feat:` / `feature:` | **minor** |
| `BREAKING CHANGE` / `breaking:` | **major** |
| anything else (default) | **patch** |

### Auth (required) — `@deepbratt55/db-grid` + Trusted Publishing

Package: **`@deepbratt55/db-grid`** under your personal npm user **`deepbratt55`** (no extra org).

npm restricts Bypass-2FA tokens, so CI uses [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC) with GitHub repo `deepbratt/db-grid`:

1. Log into npm as **deepbratt55** → `npm whoami` must print `deepbratt55`.
2. **One-time** local publish of `1.0.0` with authenticator OTP:
   ```bash
   npm run build -w @deepbratt55/db-grid
   npm publish -w @deepbratt55/db-grid --access public --otp=YOUR_OTP
   ```
3. On https://www.npmjs.com/package/@deepbratt55/db-grid → **Settings → Trusted Publisher**:
   - **GitHub user/org:** `deepbratt`
   - **Repository:** `db-grid`
   - **Workflow filename:** `publish.yml`
   - Allow **`npm publish`**
4. Remove `NPM_TOKEN` from GitHub secrets (unused / blocked for publish).

Optional: **`RELEASE_GITHUB_TOKEN`** so version bumps can push to protected `main`.

Manual run: Actions → **Publish @deepbratt55/db-grid** → Run workflow.

## License

[MIT](./LICENSE) © [Deep Bratt](https://github.com/deepbratt)
