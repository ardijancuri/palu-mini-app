-- Create database schema for Paluminiapp
-- Simplified schema: only token addresses and like counts

-- Drop existing tables if they exist
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
