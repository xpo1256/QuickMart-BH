# Deploy QuickMart on Render — Recommended: Separate Backend Service

This guide shows how to avoid the HTTP 508 Loop Detected error by running frontend and backend as separate services on Render.

Overview (recommended)
- Create two Render services:
  - Backend: Web Service (runs the Express API from `server`).
  - Frontend: Static Site (builds the Vite app and serves `dist`).

Backend service (Web Service)
- Repository root or folder: **server**
- Build command: leave default or `npm install --include=dev`
- Start command: `npm run start` (in `server/package.json` this runs `node src/index.js`)
- Environment variables to set in Render (at minimum):
  - `MONGODB_URI` = your MongoDB connection string
  - `ADMIN_API_KEY` = admin key (required in production)
  - `JWT_SECRET` = JWT secret
  - Any `AWS_` / `S3_BUCKET` / payment gateway secrets used by the server

Frontend service (Static Site)
- Service type: **Static Site** (do NOT use `vite preview` in production)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_API_URL` = `https://<your-backend>.onrender.com` (Backend origin, without `/api`)

Why this prevents 508
- Running `vite preview` (a server that accepts arbitrary requests) in the frontend service caused Render to receive `/api` requests and route them back into the same service, creating a proxy/loop and triggering HTTP 508. Hosting the backend as its own Web Service ensures `/api/*` requests reach the backend origin.

Validation steps
1. Deploy the backend first and note its public URL (e.g. `https://quickmart-bh-backend.onrender.com`).
2. In the frontend Static Site settings, set `VITE_API_URL` to that backend origin (no trailing `/api`).
3. Redeploy the frontend. Open the site and verify network calls to `/api/products` succeed.

Local testing
- Start backend locally (from `server`):
  ```powershell
  cd server
  npm run dev
  ```
- Check endpoints:
  ```powershell
  curl.exe -i "http://localhost:5000/api/products"
  curl.exe -i "http://localhost:5000/api/admin/check"
  ```

If you want me to instead make the repo run the backend and serve the built frontend from a single service (Option B), I can patch the server to serve `dist` and update the root `start` script.
