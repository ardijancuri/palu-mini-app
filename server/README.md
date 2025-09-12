# Database Setup Instructions

## Prerequisites
- PostgreSQL installed and running
- Node.js dependencies installed (`npm install`)

## Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE paluminiapp;
   ```

2. **Run Schema**
   ```bash
   psql -U your_username -d paluminiapp -f server/config/schema.sql
   ```

3. **Environment Variables**
   Create a `.env` file in the `react-app` directory with:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=paluminiapp
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

## API Endpoints

### Tokens
- `GET /api/tokens` - Get all tokens with like counts
- `POST /api/tokens` - Create/update a token

### Likes
- `GET /api/tokens/{address}/likes` - Get like count and user's like status
- `POST /api/tokens/{address}/like` - Add a like
- `DELETE /api/tokens/{address}/like` - Remove a like

### External API (Original)
- `GET /api/token/{address}` - Get token data from external API
- `GET /api/token?address={address}` - Legacy format

## Running the Server

```bash
# Install dependencies
npm install

# Run server only
npm run server

# Run both React dev server and backend server
npm run dev:full
```
