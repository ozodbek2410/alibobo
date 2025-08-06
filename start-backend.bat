@echo off
echo Starting Alibobo Backend Server...
echo.

cd backend

echo Installing dependencies...
call npm install

echo.
echo Starting server on port 5000...
echo Backend will be available at: http://localhost:5000
echo API endpoints: http://localhost:5000/api
echo Health check: http://localhost:5000/api/health
echo.

call npm start

pause
