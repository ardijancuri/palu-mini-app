-- Add Community token addresses to the community_tokens table
INSERT INTO community_tokens (address, like_count) VALUES
('0x64FF4F3739daC4040C510C6a6b2190ac32ff4444', 0),
('0xa524b11473b7ce7eb1dc883a585e64471a734444', 0),
('0x58fc1d27d5acbfae0565b581b75da96c6c374444', 0),
('0x380bf199b3173cf7b3b321848ae1c5014a124444', 0),
('0x27B02Bc573023e0173854ff64b7beaf8A3c04444', 0),
('0x36765928c3d4aBf286f2B67120C093c26a284444', 0),
('0xb75a7e8876df49a74cc4c76c6bda161a8ea4b483', 0)
ON CONFLICT (address) DO NOTHING;
