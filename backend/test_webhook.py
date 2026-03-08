"""
Test script for AgentMail webhook endpoint.
Sends mock AgentMail payload to local server to verify database writes.

Usage:
    1. Start the FastAPI server: uvicorn app.main:app --reload
    2. Set AGENTMAIL_WEBHOOK_SECRET environment variable
    3. Run this script: python test_webhook.py
"""
import httpx
import os
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
WEBHOOK_SECRET = os.getenv("AGENTMAIL_WEBHOOK_SECRET", "test-secret-key")

# Mock AgentMail webhook payload
mock_payload = {
    "message_id": f"test_msg_{datetime.now().timestamp()}",
    "from": "test@example.com",
    "to": "codybeartv_ai_assistant@agentmail.to",
    "subject": "Test Email from Webhook Test Script",
    "text": "This is a test email body sent from the test_webhook.py script.",
    "html": "<p>This is a test email body sent from the test_webhook.py script.</p>",
    "received_at": datetime.now().isoformat(),
    "headers": {
        "X-Custom-Header": "Test Value"
    },
    "attachments": []
}


def test_webhook():
    """Test the AgentMail webhook endpoint."""
    print("=" * 60)
    print("AgentMail Webhook Test Script")
    print("=" * 60)
    print()
    
    # Test 1: Send webhook with valid secret
    print("Test 1: Sending webhook with valid secret...")
    print(f"Endpoint: POST {BASE_URL}/api/webhook/agentmail")
    print(f"Payload: {json.dumps(mock_payload, indent=2)}")
    print()
    
    try:
        response = httpx.post(
            f"{BASE_URL}/api/webhook/agentmail",
            json=mock_payload,
            headers={"X-Webhook-Secret": WEBHOOK_SECRET},
            timeout=10.0
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        
        if response.status_code == 201:
            print("✅ Test 1 PASSED: Webhook accepted and email stored")
            email_id = response.json().get("email_id")
            
            # Test 2: Fetch the stored email
            print()
            print("Test 2: Fetching stored email from API...")
            fetch_response = httpx.get(
                f"{BASE_URL}/api/emails/{email_id}",
                timeout=10.0
            )
            
            print(f"Status Code: {fetch_response.status_code}")
            print(f"Response: {json.dumps(fetch_response.json(), indent=2)}")
            print()
            
            if fetch_response.status_code == 200:
                print("✅ Test 2 PASSED: Email retrieved successfully")
            else:
                print("❌ Test 2 FAILED: Could not retrieve email")
        else:
            print("❌ Test 1 FAILED: Webhook rejected")
            
    except httpx.ConnectError:
        print("❌ ERROR: Could not connect to server")
        print("Make sure the FastAPI server is running:")
        print("  cd backend && uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 3: Send duplicate message_id (should fail)
    print("Test 3: Sending duplicate message_id (should fail)...")
    try:
        response = httpx.post(
            f"{BASE_URL}/api/webhook/agentmail",
            json=mock_payload,  # Same payload as Test 1
            headers={"X-Webhook-Secret": WEBHOOK_SECRET},
            timeout=10.0
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        
        if response.status_code == 400:
            print("✅ Test 3 PASSED: Duplicate message_id rejected")
        else:
            print("❌ Test 3 FAILED: Duplicate should have been rejected")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 4: Send webhook without secret (should fail)
    print("Test 4: Sending webhook without secret (should fail)...")
    try:
        response = httpx.post(
            f"{BASE_URL}/api/webhook/agentmail",
            json={**mock_payload, "message_id": f"test_msg_nosecret_{datetime.now().timestamp()}"},
            timeout=10.0
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        
        if response.status_code == 401:
            print("✅ Test 4 PASSED: Request without secret rejected")
        else:
            print("❌ Test 4 FAILED: Should have been rejected (401)")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 5: List all emails
    print("Test 5: Listing all emails...")
    try:
        response = httpx.get(
            f"{BASE_URL}/api/emails?page=1&limit=10",
            timeout=10.0
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total emails: {data.get('total')}")
        print(f"Page: {data.get('page')}")
        print(f"Items returned: {len(data.get('items', []))}")
        print()
        
        if response.status_code == 200:
            print("✅ Test 5 PASSED: Email list retrieved")
        else:
            print("❌ Test 5 FAILED: Could not retrieve email list")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    print("=" * 60)
    print("Test suite complete!")
    print("=" * 60)


if __name__ == "__main__":
    test_webhook()
