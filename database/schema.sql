-- AgentMail Dashboard Database Schema
-- SQLite 3 compatible schema for email event storage

-- Email events table (auto-created by SQLAlchemy but documented here)
CREATE TABLE IF NOT EXISTS email_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    subject TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    raw_json TEXT NOT NULL,
    processed BOOLEAN DEFAULT 0 NOT NULL
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON email_events(message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sender ON email_events(sender);
CREATE INDEX IF NOT EXISTS idx_email_events_received_at ON email_events(received_at);
CREATE INDEX IF NOT EXISTS idx_email_events_processed ON email_events(processed);

-- Users table (for future authentication - Phase 2)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
