# Server (Backend) — Quick Overview

This folder contains the backend API for the QuickMart Bahrain project.

Layout
- `src/` — application source code (entrypoint `src/index.js`, config, models)
- `bin/` — maintenance scripts you can run directly (moved from `src/scripts`)
- `tools/` — small maintenance helpers (moved from `admin/`)
- `data/` — sample data (e.g. `sample_products.json`)
- `storage/` — runtime uploads (avatars, products)

Important notes
- The main server entry is `src/index.js`. `package.json` scripts use this file.
-- Some helper scripts were moved from `src/scripts` → `bin/` for clarity:
  - `bin/test-mongo.js`
  - `bin/list-products.js`
- Old wrapper files under `src/scripts/` and the old `src/server.js` were removed.

Run the server (development)
```bash
npm --prefix server install
npm --prefix server run dev
```

Run a script (example)
```bash
node server/bin/test-mongo.js
node server/bin/list-products.js
```

If you want any files renamed or moved (for example renaming `admin/` → `tools/`), tell me which and I'll update code references and `README.md` accordingly.
