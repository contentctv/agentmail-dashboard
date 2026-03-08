"""
Security dependencies for FastAPI.
Implements webhook secret validation.
"""
from fastapi import Header, HTTPException, status
import os


WEBHOOK_SECRET = os.getenv("AGENTMAIL_WEBHOOK_SECRET")


async def verify_webhook_secret(
    x_webhook_secret: str = Header(None, alias="X-Webhook-Secret")
) -> str:
    """
    Security dependency for webhook endpoints.
    
    Validates that the X-Webhook-Secret header matches the configured secret.
    Rejects requests without valid authorization.
    
    Args:
        x_webhook_secret: Secret key from request header
        
    Returns:
        The validated secret
        
    Raises:
        HTTPException: 401 if secret is missing or invalid
    """
    if not WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured on server"
        )
    
    if not x_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Webhook-Secret header"
        )
    
    if x_webhook_secret != WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret"
        )
    
    return x_webhook_secret
