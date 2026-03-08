"""
SQLAlchemy ORM models for AgentMail Dashboard.
Defines database schema for email events.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class EmailEvent(Base):
    """
    Email event table - stores inbound emails from AgentMail webhook.
    
    Tracks sender, subject, timestamp, and full JSON payload for debugging.
    """
    __tablename__ = "email_events"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # AgentMail message identifier (unique constraint)
    message_id = Column(String(255), unique=True, nullable=False, index=True)
    
    # Email metadata
    sender = Column(String(255), nullable=False, index=True)
    subject = Column(Text, nullable=True)
    
    # Timestamps
    received_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Full JSON payload from AgentMail (stored as TEXT for SQLite compatibility)
    raw_json = Column(Text, nullable=False)
    
    # Processing status flag
    processed = Column(Boolean, default=False, nullable=False, index=True)
    
    def __repr__(self):
        return f"<EmailEvent(id={self.id}, sender='{self.sender}', subject='{self.subject[:50]}...')>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "message_id": self.message_id,
            "sender": self.sender,
            "subject": self.subject,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "processed": self.processed,
            "raw_json": self.raw_json
        }
