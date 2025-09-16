-- Create database schema for Paluminiapp
-- Simplified schema: only token addresses and like counts

-- Drop existing tables if they exist
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_tokens CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;

-- Create tokens table (simplified)
CREATE TABLE tokens (
    address VARCHAR(255) PRIMARY KEY,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table (for tracking individual likes)
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(255) NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
    user_ip VARCHAR(45), -- IPv6 addresses can be up to 45 characters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Removed UNIQUE constraint to allow multiple likes per token
);

-- Create indexes for better performance
CREATE INDEX idx_likes_token_address ON likes(token_address);
CREATE INDEX idx_likes_user_ip ON likes(user_ip);

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tokens SET like_count = like_count + 1 WHERE address = NEW.token_address;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tokens SET like_count = like_count - 1 WHERE address = OLD.token_address;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update like count
CREATE TRIGGER update_like_count_insert
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

CREATE TRIGGER update_like_count_delete
    AFTER DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

-- Create community_tokens table (separate from main tokens)
CREATE TABLE community_tokens (
    address VARCHAR(255) PRIMARY KEY,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_likes table (for tracking community token likes)
CREATE TABLE community_likes (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(255) NOT NULL REFERENCES community_tokens(address) ON DELETE CASCADE,
    user_ip VARCHAR(45), -- IPv6 addresses can be up to 45 characters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for community tables
CREATE INDEX idx_community_likes_token_address ON community_likes(token_address);
CREATE INDEX idx_community_likes_user_ip ON community_likes(user_ip);

-- Create function to update community like count
CREATE OR REPLACE FUNCTION update_community_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_tokens SET like_count = like_count + 1 WHERE address = NEW.token_address;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_tokens SET like_count = like_count - 1 WHERE address = OLD.token_address;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update community like count
CREATE TRIGGER update_community_like_count_insert
    AFTER INSERT ON community_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_community_like_count();

CREATE TRIGGER update_community_like_count_delete
    AFTER DELETE ON community_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_community_like_count();

-- Create chat_messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
