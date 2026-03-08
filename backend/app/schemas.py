"""
Pydantic schemas for strict data validation.
Defines the structure of AgentMail webhook payloads and API responses.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class AgentMailWebhookPayload(BaseModel):
    """
    Strict schema for inbound AgentMail webhook payloads.
    
    Based on AgentMail webhook documentation:
    https://docs.agentmail.to/webhooks
    
    Only accepts validated JSON matching this structure.
    """
    # Message identifier (required)
    message_id: str = Field(..., min_length=1, max_length=255, description="Unique message ID from AgentMail")
    
    # Email metadata (required)
    from_email: EmailStr = Field(..., alias="from", description="Sender email address")
    to_email: EmailStr = Field(..., alias="to", description="Recipient email address")
    subject: Optional[str] = Field(None, max_length=500, description="Email subject line")
    
    # Email body
    text: Optional[str] = Field(None, description="Plain text email body")
    html: Optional[str] = Field(None, description="HTML email body")
    
    # Timestamps
    received_at: Optional[datetime] = Field(None, description="When AgentMail received the email")
    
    # Additional metadata (optional)
    headers: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Email headers")
    attachments: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Email attachments")
    
    @field_validator("message_id")
    @classmethod
    def validate_message_id(cls, v: str) -> str:
        """Ensure message_id is not empty after stripping whitespace."""
        if not v or not v.strip():
            raise ValueError("message_id cannot be empty")
        return v.strip()
    
    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from subject if present."""
        return v.strip() if v else None
    
    class Config:
        # Allow using 'from' and 'to' as field names via alias
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "message_id": "msg_abc123xyz",
                "from": "sender@example.com",
                "to": "codybeartv_ai_assistant@agentmail.to",
                "subject": "Test Email",
                "text": "This is a test email body.",
                "html": "<p>This is a test email body.</p>",
                "received_at": "2026-03-08T06:30:00Z",
                "headers": {"X-Custom-Header": "value"},
                "attachments": []
            }
        }


class EmailEventResponse(BaseModel):
    """
    API response schema for email events.
    Returned by GET /api/emails endpoint.
    """
    id: int
    message_id: str
    sender: str
    subject: Optional[str]
    received_at: datetime
    processed: bool
    
    class Config:
        from_attributes = True  # Pydantic v2 compatibility for ORM models


class EmailEventDetailResponse(EmailEventResponse):
    """
    Extended response schema including full JSON payload.
    Returned by GET /api/emails/{id} endpoint.
    """
    raw_json: str
    
    class Config:
        from_attributes = True


class EmailListResponse(BaseModel):
    """
    Paginated list response for email events.
    """
    total: int
    page: int
    limit: int
    items: List[EmailEventResponse]


class WebhookResponse(BaseModel):
    """
    Response for webhook endpoint.
    """
    success: bool
    message: str
    email_id: Optional[int] = None
