# Tools (formerly `admin`)

This folder contains small maintenance and admin helper scripts. It was renamed from `admin/` to `tools/` to be clearer.

Files
- `createProduct.js` — CLI script to POST a product JSON to the backend.
- `testDbConnection.js` / `testDbConnection.cjs` — test connection to MongoDB using `MONGODB_URI`.
- `insertProductDirect.cjs` — insert `sample_product.json` directly into the DB.
- `sample_product.json` — a sample product JSON for testing.

Usage examples

Test DB connection (uses `server/.env` MONGODB_URI or pass URI):

```bash
node server/tools/testDbConnection.js
# or
node server/tools/testDbConnection.js "mongodb+srv://user:pass@..."
```

Create product (example):

```bash
node server/tools/createProduct.js server/tools/sample_product.json
```

Security

Admin endpoints still require `ADMIN_API_KEY` (set in `server/.env`). The helper scripts will read `server/.env` for the key.
