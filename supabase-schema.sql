-- Supabase Schema for PALU Mini App Chat
-- Run this in your Supabase SQL Editor

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read messages
CREATE POLICY "Anyone can read chat messages" ON chat_messages
    FOR SELECT USING (true);

-- Create policy to allow anyone to insert messages
CREATE POLICY "Anyone can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
