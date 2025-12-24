
  # E-commerce Website for Bahrain

  This is a code bundle for E-commerce Website for Bahrain. The original project is available at https://www.figma.com/design/uRP0gvIy4r2WArPmF4ZlfA/E-commerce-Website-for-Bahrain.

  ## Running the website (Windows)

  - Quick one-command (recommended): double-click `start-website.bat` in the repository root.

  - PowerShell helper: open PowerShell in the repo root and run:

```powershell
./run-website.ps1
```

  - Manual steps:
    1. Install frontend deps: `npm install` (repo root).
    2. Install backend deps: `cd server && npm install`.
    3. Ensure `server/.env` contains `MONGODB_URI` and `ADMIN_API_KEY`.
    4. Start backend: `cd server && npm start` (server listens on port 5000).
    5. Start frontend: `npm run dev` (Vite dev server on port 5173).

  ## Troubleshooting

  - If admin login shows "failed to fetch", make sure both servers are running and that `FRONTEND_URL` in `server/.env` is `http://localhost:5173`.
  - If you changed ports, update `FRONTEND_URL` and `PORT` in `server/.env`.
  - To check backend health, visit: `http://localhost:5000/api/health`

  