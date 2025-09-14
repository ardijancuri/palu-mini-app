# Supabase Chat Setup Guide

This guide will help you set up the live chat functionality using Supabase, which works perfectly with Vercel deployment.

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Wait for the project to be ready (2-3 minutes)

### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
3. Copy your **anon public** key (starts with `eyJhbGciOiJIUzI1NiIs...`)

### 3. Set Up Environment Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Table
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL from `supabase-schema.sql` file
3. This creates the `chat_messages` table with proper permissions

### 5. Update Your App
Replace the WebSocket chat with Supabase chat:

```jsx
// In src/pages/WaitingRoom.jsx
import SupabaseChat from '../components/SupabaseChat';

// Replace <Chat /> with:
<SupabaseChat 
  isMinimized={isChatMinimized}
  onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
/>
```

## 🎯 Benefits of Supabase Chat

### ✅ **Production Ready**
- Works with Vercel deployment
- No need for separate server
- Automatic scaling

### ✅ **Real-time Features**
- Instant message delivery
- Live subscriptions
- No WebSocket connection issues

### ✅ **Database Features**
- Persistent message storage
- Built-in authentication (if needed)
- Row Level Security (RLS)

### ✅ **Developer Experience**
- Easy setup and configuration
- Built-in dashboard
- Automatic API generation

## 🔧 Advanced Configuration

### Row Level Security (RLS)
The schema includes RLS policies that allow:
- Anyone to read messages
- Anyone to send messages
- Optional: Users can delete their own messages

### Customization Options
- Modify message retention policies
- Add user authentication
- Implement message moderation
- Add message reactions/emojis

## 🚀 Deployment

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Deploy as usual
3. Chat will work immediately in production!

### Environment Variables in Vercel
1. Go to your Vercel project settings
2. Add these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy your project

## 🎉 Result

After setup, you'll have:
- ✅ Real-time chat working in production
- ✅ Persistent message storage
- ✅ No WebSocket connection errors
- ✅ Scalable infrastructure
- ✅ Professional chat experience

The chat will work seamlessly across all environments (development and production)!