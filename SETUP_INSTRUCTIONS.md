# Database Setup Instructions

## Option 1: PostgreSQL Installation (Recommended)

### Manual Installation Steps:

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the latest version (e.g., PostgreSQL 15.x)
   - Run the installer as Administrator

2. **During Installation:**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set superuser password (remember this!)
   - Set port to 5432 (default)
   - Choose locale (default is fine)

3. **After Installation:**
   - PostgreSQL service will start automatically
   - pgAdmin 4 will be available for database management

4. **Create Database:**
   ```bash
   # Open Command Prompt as Administrator
   # Navigate to PostgreSQL bin directory (usually):
   cd "C:\Program Files\PostgreSQL\15\bin"
   
   # Create database
   createdb -U postgres paluminiapp
   
   # Run schema
   psql -U postgres -d paluminiapp -f "C:\path\to\your\project\react-app\server\config\schema.sql"
   ```

5. **Environment Variables:**
   Create `.env` file in `react-app/` directory:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=paluminiapp
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   PORT=3000
   ```

## Option 2: SQLite (Easier Setup)

If you prefer a simpler setup without installing PostgreSQL, I can modify the code to use SQLite instead. SQLite is a file-based database that doesn't require a separate server installation.

Would you like me to:
1. Help you install PostgreSQL manually, or
2. Convert the code to use SQLite instead?

## Testing the Setup

After installation, test with:
```bash
cd react-app
npm install
npm run server
```

The server should start and connect to the database successfully.
