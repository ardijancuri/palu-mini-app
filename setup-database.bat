@echo off
echo Setting up PostgreSQL database for Paluminiapp...
echo.

echo Step 1: Creating database 'paluminiapp'...
"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres paluminiapp
if %errorlevel% neq 0 (
    echo Error creating database. Please check your PostgreSQL password.
    echo You can also create the database manually using pgAdmin or psql.
    pause
    exit /b 1
)

echo.
echo Step 2: Running database schema...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d paluminiapp -f "server\config\schema.sql"
if %errorlevel% neq 0 (
    echo Error running schema. Please check the file path and permissions.
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
echo Next steps:
echo 1. Create a .env file in the react-app directory with your database credentials
echo 2. Run: npm install
echo 3. Run: npm run server
echo.
pause
