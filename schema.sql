-- NoKier 2 Waitlist Database Schema
-- Run this in your Neon database console

CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50),
    queue_number INTEGER,
    favorite_policy TEXT,
    income TEXT,
    shares_count INTEGER DEFAULT 0,
    compliance JSONB,
    free_speech_upgrade BOOLEAN DEFAULT true,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON waitlist(timestamp);
CREATE INDEX IF NOT EXISTS idx_email ON waitlist(email);

-- Function to get current waitlist count
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM waitlist);
END;
$$ LANGUAGE plpgsql;
