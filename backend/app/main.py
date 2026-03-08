"""
FastAPI main application.
AgentMail Dashboard backend API.
"""
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import logging

from app.database import get_db, init_db
from app.models import EmailEvent
from app.schemas import (
    AgentMailWebhookPayload,
    EmailEventResponse,
    EmailEventDetailResponse,
    EmailListResponse,
    WebhookResponse
)
from app.security import verify_webhook_secret

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AgentMail Dashboard API",
    description="Backend API for monitoring AgentMail webhook events",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware (configure for production with specific origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Initialize database on application startup.
    Creates tables if they don't exist.
    """
    logger.info("Starting AgentMail Dashboard API...")
    init_db()
    logger.info("Database initialized successfully")


@app.get("/")
async def root():
    """
    Root endpoint - API health check.
    """
    return {
        "status": "ok",
        "service": "AgentMail Dashboard API",
        "version": "1.0.0"
    }


@app.post(
    "/api/webhook/agentmail",
    response_model=WebhookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="AgentMail Webhook Receiver",
    description="Receives inbound email events from AgentMail webhooks"
)
async def receive_agentmail_webhook(
    payload: AgentMailWebhookPayload,
    db: Session = Depends(get_db),
    _secret: str = Depends(verify_webhook_secret)
):
    """
    AgentMail webhook endpoint.
    
    Receives validated JSON payloads from AgentMail, stores them in the database,
    and returns a success response.
    
    Security: Requires valid X-Webhook-Secret header.
    
    Args:
        payload: Validated AgentMail webhook payload (Pydantic schema)
        db: Database session (injected dependency)
        _secret: Validated webhook secret (injected security dependency)
        
    Returns:
        WebhookResponse with success status and email ID
        
    Raises:
        HTTPException 400: If message_id already exists (duplicate)
        HTTPException 500: If database write fails
    """
    try:
        # Check if message already exists (prevent duplicates)
        existing = db.query(EmailEvent).filter(
            EmailEvent.message_id == payload.message_id
        ).first()
        
        if existing:
            logger.warning(f"Duplicate message_id received: {payload.message_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Message with ID {payload.message_id} already exists"
            )
        
        # Create new email event record
        email_event = EmailEvent(
            message_id=payload.message_id,
            sender=payload.from_email,
            subject=payload.subject,
            raw_json=json.dumps(payload.model_dump(by_alias=True)),
            processed=False
        )
        
        # Save to database
        db.add(email_event)
        db.commit()
        db.refresh(email_event)
        
        logger.info(f"Stored email event: ID={email_event.id}, message_id={payload.message_id}")
        
        return WebhookResponse(
            success=True,
            message="Email event stored successfully",
            email_id=email_event.id
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate check)
        raise
        
    except Exception as e:
        logger.error(f"Error storing email event: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store email event: {str(e)}"
        )


@app.get(
    "/api/emails",
    response_model=EmailListResponse,
    summary="List Email Events",
    description="Retrieve paginated list of email events"
)
async def list_emails(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of email events.
    
    Returns email events ordered by received_at (newest first).
    Supports pagination via page and limit query parameters.
    
    Args:
        page: Page number (1-indexed)
        limit: Number of items per page (1-100)
        db: Database session (injected dependency)
        
    Returns:
        EmailListResponse with total count and paginated items
    """
    try:
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get total count
        total = db.query(EmailEvent).count()
        
        # Get paginated results (newest first)
        emails = db.query(EmailEvent)\
            .order_by(EmailEvent.received_at.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()
        
        # Convert to response models
        items = [EmailEventResponse.model_validate(email) for email in emails]
        
        return EmailListResponse(
            total=total,
            page=page,
            limit=limit,
            items=items
        )
        
    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch emails: {str(e)}"
        )


@app.get(
    "/api/emails/{email_id}",
    response_model=EmailEventDetailResponse,
    summary="Get Email Detail",
    description="Retrieve single email event with full JSON payload"
)
async def get_email_detail(
    email_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed email event including full JSON payload.
    
    Args:
        email_id: Email event ID
        db: Database session (injected dependency)
        
    Returns:
        EmailEventDetailResponse with full event data
        
    Raises:
        HTTPException 404: If email_id not found
    """
    try:
        email = db.query(EmailEvent).filter(EmailEvent.id == email_id).first()
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email with ID {email_id} not found"
            )
        
        return EmailEventDetailResponse.model_validate(email)
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error fetching email detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch email detail: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
