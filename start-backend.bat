@echo off
REM QuickMart Backend Server Starter
REM This script starts the Node.js backend server

echo.
echo ============================================
echo  QuickMart Bahrain - Backend Server
echo ============================================
echo.

cd server

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
