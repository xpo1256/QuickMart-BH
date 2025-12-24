# Admin: product + DB helper

Quick helpers to manage products and verify DB connectivity.

Files
- `createProduct.js` — CLI script to POST a product JSON to the backend.
- `testDbConnection.js` — test connection to MongoDB using `MONGODB_URI`.

Usage

- Test DB connection (uses `server/.env` MONGODB_URI or pass URI):
```bash
node server/admin/testDbConnection.js
# or
node server/admin/testDbConnection.js "mongodb+srv://user:pass@..."
```

- Create product (example):
1. Create `product.json` with fields like `name`, `price`, `images`, `stock`.
2. Run:
```bash
node server/admin/createProduct.js server/admin/product.json
```

Admin auth
----------

For safety, admin endpoints require an admin API key. Set `ADMIN_API_KEY` in `server/.env` to a strong secret.
When calling admin endpoints (create/update/delete products) provide the header `x-admin-key: <ADMIN_API_KEY>` or include `?adminKey=<ADMIN_API_KEY>` in the URL for the `createProduct.js` script.

Example curl (replace with your key):
```bash
curl -X POST http://localhost:5000/api/admin/products \
   -H "Content-Type: application/json" \
   -H "x-admin-key: your_admin_key_here" \
   -d '{"name":"Example","price":9.99,"images":["https://.../img.jpg"],"stock":10}'
```

Curl examples

- List products:
```bash
curl http://localhost:5000/api/products
```

- Create product (replace values):
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Example","price":9.99,"images":["https://.../img.jpg"],"stock":10}'
```

Fixing MongoDB Atlas auth (common causes of `bad auth`)

1. Verify credentials:
   - In MongoDB Atlas, go to Database Access → Database Users and confirm the username and password for the user you used in `MONGODB_URI`.
   - If the password contains special characters (space, @, :, /, ?, #, %), URL-encode it before placing in the URI. Example in Node:

```js
// encode password
const encoded = encodeURIComponent('p@ss/w:ord?');
// use in URI: mongodb+srv://username:${encoded}@cluster0.../...
```

2. Network access:
   - In Atlas, go to Network Access → IP Whitelist and add your public IP (or 0.0.0.0/0 for testing only).

3. Database name & SRV string:
   - Ensure the user has access to the target database. If your URI includes a specific DB name, ensure the user has permissions.

4. Test locally using `testDbConnection.js` above to get full error message.

Security note: do not commit credentials to public repos. Keep `server/.env` private.
