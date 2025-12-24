<<<<<<< HEAD
# Publish Checklist — QuickMart Bahrain

This checklist helps prepare the project for public deployment. Do NOT store secrets in the repository.

1. Immediate safety
   - Remove real `.env` files from repo and add them to `.gitignore` (done).
   - Rotate all compromised credentials (DB user, Tap, PayPal, email password, admin key, JWT secret).
   - Do not paste real keys into public chat or commit history.

2. Environment configuration (on host)
   - Set `NODE_ENV=production`.
   - Set `PORT` (e.g., 5000) and `VITE_API_URL` to your production API endpoint.
   - Configure `MONGODB_URI`, `JWT_SECRET`, `ADMIN_API_KEY`, `EMAIL_*`, and payment keys as environment variables.

3. Payment providers
   - Register `https://your-domain.com/payment-success` as return URL.
   - Register `https://your-domain.com/api/payments/tap/webhook` (and PayPal/Razorpay webhooks) in provider dashboards.
   - Test with sandbox keys first; only use live keys after testing webhooks and return URLs.

4. Build & deploy
   - Frontend:
     ```bash
     npm install
     npm run build
     ```
   - Backend: run via a process manager (PM2/systemd) with `NODE_ENV=production` and correct env vars.
   - Serve built frontend assets using a static host or reverse proxy (NGINX).

5. Security & logging
   - Ensure `.env` files are ignored by `.gitignore` (done).
   - Ensure logs (morgan/console) do not print secrets (we removed direct key prints).
   - Use HTTPS and set cookies with `secure: true` in production.
   - Limit database user privileges and restrict IP access.

6. Testing & smoke tests
   - End-to-end: create an order, perform payment flow (PayPal/Razorpay/Tap), verify webhook updates order status, and confirm confirmation email.
   - Check admin login and protected routes.

7. Documentation
   - Add production env variables to `server/.env.example` and `src/.env.example` (done).
   - Update `BACKEND_SETUP.md` / `README.md` with deploy steps and required env vars.

If you want, I can:
- Rotate the keys you provided locally (I cannot contact external providers to rotate them — you must rotate via the provider dashboards).
- Run a local frontend build now and report errors.
- Update `BACKEND_SETUP.md` with the production steps.

=======
# Publish Checklist — QuickMart Bahrain

This checklist helps prepare the project for public deployment. Do NOT store secrets in the repository.

1. Immediate safety
   - Remove real `.env` files from repo and add them to `.gitignore` (done).
   - Rotate all compromised credentials (DB user, Tap, PayPal, email password, admin key, JWT secret).
   - Do not paste real keys into public chat or commit history.

2. Environment configuration (on host)
   - Set `NODE_ENV=production`.
   - Set `PORT` (e.g., 5000) and `VITE_API_URL` to your production API endpoint.
   - Configure `MONGODB_URI`, `JWT_SECRET`, `ADMIN_API_KEY`, `EMAIL_*`, and payment keys as environment variables.

3. Payment providers
   - Register `https://your-domain.com/payment-success` as return URL.
   - Register `https://your-domain.com/api/payments/tap/webhook` (and PayPal/Razorpay webhooks) in provider dashboards.
   - Test with sandbox keys first; only use live keys after testing webhooks and return URLs.

4. Build & deploy
   - Frontend:
     ```bash
     npm install
     npm run build
     ```
   - Backend: run via a process manager (PM2/systemd) with `NODE_ENV=production` and correct env vars.
   - Serve built frontend assets using a static host or reverse proxy (NGINX).

5. Security & logging
   - Ensure `.env` files are ignored by `.gitignore` (done).
   - Ensure logs (morgan/console) do not print secrets (we removed direct key prints).
   - Use HTTPS and set cookies with `secure: true` in production.
   - Limit database user privileges and restrict IP access.

6. Testing & smoke tests
   - End-to-end: create an order, perform payment flow (PayPal/Razorpay/Tap), verify webhook updates order status, and confirm confirmation email.
   - Check admin login and protected routes.

7. Documentation
   - Add production env variables to `server/.env.example` and `src/.env.example` (done).
   - Update `BACKEND_SETUP.md` / `README.md` with deploy steps and required env vars.

If you want, I can:
- Rotate the keys you provided locally (I cannot contact external providers to rotate them — you must rotate via the provider dashboards).
- Run a local frontend build now and report errors.
- Update `BACKEND_SETUP.md` with the production steps.

>>>>>>> master
