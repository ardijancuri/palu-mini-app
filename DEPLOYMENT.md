# Deployment Guide

This guide will help you deploy your PALU Mini App to Vercel (frontend) and Supabase (backend).

## Prerequisites

- GitHub account
- Vercel account
- Supabase account

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `paluminiapp` or your preferred name
3. Make it public (required for free Vercel deployment)
4. Don't initialize with README (we already have one)

## Step 2: Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: PALU Mini App"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be created
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `server/config/schema.sql` and run it
5. Go to Settings > Database to get your connection details

## Step 4: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. Configure environment variables:

### Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```
DB_URL=your-supabase-connection-string
NODE_ENV=production
```

To get your Supabase connection string:
1. Go to Supabase Dashboard > Settings > Database
2. Copy the "Connection string" under "Connection parameters"
3. Replace `[YOUR-PASSWORD]` with your database password

## Step 5: Configure Vercel for Full-Stack

Since your app has both frontend and backend, you need to configure Vercel to handle both:

1. In your Vercel project settings, go to "Functions"
2. Create a new serverless function for your API routes
3. Or use Vercel's API routes feature

### Option A: Vercel API Routes (Recommended)

Create `api/` directory in your project root and move your server logic there.

### Option B: Separate Backend Deployment

Deploy your backend separately to:
- Railway
- Render
- Heroku
- Or another Node.js hosting service

## Step 6: Update Frontend API URLs

Update your frontend to use the production API URL instead of localhost.

## Step 7: Test Your Deployment

1. Visit your Vercel deployment URL
2. Test all functionality
3. Check browser console for errors
4. Verify database connections

## Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure all required env vars are set in Vercel
2. **CORS Issues**: Configure CORS properly for production
3. **Database Connection**: Verify Supabase connection string
4. **Build Errors**: Check Vercel build logs for issues

### Getting Help

- Check Vercel deployment logs
- Check Supabase logs
- Review browser console for errors
- Test API endpoints directly

## Production Checklist

- [ ] GitHub repository created and code pushed
- [ ] Supabase project created and schema applied
- [ ] Vercel project deployed
- [ ] Environment variables configured
- [ ] API endpoints working
- [ ] Database connections working
- [ ] Frontend loading correctly
- [ ] All features tested in production
