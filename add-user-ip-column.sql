-- Migration: Add user_ip column to existing chat_messages table
-- Run this in your Supabase SQL Editor

-- Add user_ip column if it doesn't exist
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS user_ip INET;
