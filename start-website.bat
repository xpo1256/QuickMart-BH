@echo off
REM Unified launcher for QuickMart (Windows)
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"

if not exist server\node_modules (
  echo Installing backend dependencies...
  pushd server
  npm install
  popd
)

if not exist node_modules (
  echo Installing frontend dependencies...
  npm install
)

start "QuickMart Backend" cmd /k "cd /d %~dp0server && npm start"
start "QuickMart Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Launched backend and frontend in new windows.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
@echo off
REM Start both frontend (Vite) and backend (Node) in separate windows
REM Usage: double-click this file or run from cmd

cd /d "%~dp0"

echo Starting QuickMart website...

rem Start backend in a new window
start "QuickMart Backend" cmd /k "cd /d "%~dp0server" && if not exist node_modules (npm install) && npm run dev"

rem Start frontend in a new window
start "QuickMart Frontend" cmd /k "cd /d "%~dp0" && if not exist node_modules (npm install) && npm run dev"

rem Open browser to the frontend
start "" "http://localhost:5173/"

echo Launched backend and frontend. Check the opened windows for logs.
pause
