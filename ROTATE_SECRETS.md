<<<<<<< HEAD
# Secret Rotation and Action Plan

These secrets were present in the repository and MUST be rotated immediately:

- MongoDB connection string (MONGODB_URI)
- TAP_SECRET_KEY and TAP_PUBLIC_KEY
- PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET
- EMAIL_PASSWORD / EMAIL_USER
- ADMIN_API_KEY
- JWT_SECRET

Steps to rotate per service

1. MongoDB (atlas):
   - Create a new database user with a strong password and least privileges.
   - Update network access to restrict to server IPs or VPC.
   - Update the `MONGODB_URI` on your host/CI and restart the backend.
   - Revoke the old user credentials.

2. Tap (checkout):
   - In Tap dashboard, generate new secret keys.
   - Add your production return URL `https://your-domain.com/payment-success` and webhook URL `https://your-domain.com/api/payments/tap/webhook` in the Tap merchant settings.
   - Replace `TAP_SECRET_KEY` in server environment (do NOT commit); test with sandbox keys first.

3. PayPal:
   - Rotate client secret in PayPal Developer dashboard.
   - Ensure `PAYPAL_MODE` is set to `sandbox` for tests.
   - Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in server environment.

4. Email provider:
   - Change password or create a dedicated transactional email account (SendGrid, Mailgun, Postmark, etc.).
   - Update `EMAIL_USER`/`EMAIL_PASSWORD` in server environment.

5. Admin and JWT secrets:
   - Generate a new `ADMIN_API_KEY` and `JWT_SECRET` (use a secure random generator).
   - Update server environment and any CI secrets.

6. Rotate any other leaked secrets and remove `.env` from repo history.

Removing secrets from git history (optional but recommended):
- Use `git filter-repo` or `git filter-branch` to rewrite history and remove committed `.env` files.
- If you cannot rewrite history (shared repo), rotate all secrets immediately and add `.env` to `.gitignore`.

After rotation:
- Verify the app in staging using sandbox payment keys and a tunnel or staging domain.
- Test full E2E flows (create order, initiate payment, check webhook delivery, confirm order update and email).

=======
# Secret Rotation and Action Plan

These secrets were present in the repository and MUST be rotated immediately:

- MongoDB connection string (MONGODB_URI)
- TAP_SECRET_KEY and TAP_PUBLIC_KEY
- PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET
- EMAIL_PASSWORD / EMAIL_USER
- ADMIN_API_KEY
- JWT_SECRET

Steps to rotate per service

1. MongoDB (atlas):
   - Create a new database user with a strong password and least privileges.
   - Update network access to restrict to server IPs or VPC.
   - Update the `MONGODB_URI` on your host/CI and restart the backend.
   - Revoke the old user credentials.

2. Tap (checkout):
   - In Tap dashboard, generate new secret keys.
   - Add your production return URL `https://your-domain.com/payment-success` and webhook URL `https://your-domain.com/api/payments/tap/webhook` in the Tap merchant settings.
   - Replace `TAP_SECRET_KEY` in server environment (do NOT commit); test with sandbox keys first.

3. PayPal:
   - Rotate client secret in PayPal Developer dashboard.
   - Ensure `PAYPAL_MODE` is set to `sandbox` for tests.
   - Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in server environment.

4. Email provider:
   - Change password or create a dedicated transactional email account (SendGrid, Mailgun, Postmark, etc.).
   - Update `EMAIL_USER`/`EMAIL_PASSWORD` in server environment.

5. Admin and JWT secrets:
   - Generate a new `ADMIN_API_KEY` and `JWT_SECRET` (use a secure random generator).
   - Update server environment and any CI secrets.

6. Rotate any other leaked secrets and remove `.env` from repo history.

Removing secrets from git history (optional but recommended):
- Use `git filter-repo` or `git filter-branch` to rewrite history and remove committed `.env` files.
- If you cannot rewrite history (shared repo), rotate all secrets immediately and add `.env` to `.gitignore`.

After rotation:
- Verify the app in staging using sandbox payment keys and a tunnel or staging domain.
- Test full E2E flows (create order, initiate payment, check webhook delivery, confirm order update and email).

>>>>>>> master
