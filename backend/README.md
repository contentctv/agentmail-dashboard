# AgentMail Dashboard - Backend

FastAPI backend for AgentMail webhook monitoring.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp ../.env.example .env
# Edit .env and set:
# - AGENTMAIL_WEBHOOK_SECRET (must match AgentMail configuration)
# - DATABASE_URL (default: sqlite:///./database/emails.db)
```

### 3. Run Server

```bash
# Development mode (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Test Webhook

```bash
# Set webhook secret
export AGENTMAIL_WEBHOOK_SECRET=your-secret-here

# Run test script
python test_webhook.py
```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Architecture

### Files

- `app/main.py` - FastAPI application and route handlers
- `app/models.py` - SQLAlchemy ORM models (EmailEvent)
- `app/schemas.py` - Pydantic validation schemas
- `app/database.py` - Database session management
- `app/security.py` - Webhook secret validation
- `test_webhook.py` - Test script for webhook endpoint

### Endpoints

#### POST /api/webhook/agentmail
Receives AgentMail webhook events.

**Headers:**
- `X-Webhook-Secret: <your-secret>`

**Request Body:**
```json
{
  "message_id": "msg_abc123",
  "from": "sender@example.com",
  "to": "codybeartv_ai_assistant@agentmail.to",
  "subject": "Test Email",
  "text": "Email body",
  "html": "<p>Email body</p>",
  "received_at": "2026-03-08T06:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email event stored successfully",
  "email_id": 1
}
```

#### GET /api/emails
List email events (paginated).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)

**Response:**
```json
{
  "total": 100,
  "page": 1,
  "limit": 50,
  "items": [
    {
      "id": 1,
      "message_id": "msg_abc123",
      "sender": "sender@example.com",
      "subject": "Test Email",
      "received_at": "2026-03-08T06:30:00Z",
      "processed": false
    }
  ]
}
```

#### GET /api/emails/{id}
Get single email with full JSON payload.

**Response:**
```json
{
  "id": 1,
  "message_id": "msg_abc123",
  "sender": "sender@example.com",
  "subject": "Test Email",
  "received_at": "2026-03-08T06:30:00Z",
  "processed": false,
  "raw_json": "{...full AgentMail payload...}"
}
```

## Security

### Webhook Validation
All webhook requests must include `X-Webhook-Secret` header matching `AGENTMAIL_WEBHOOK_SECRET` environment variable.

### Data Validation
Pydantic schemas enforce strict validation on all inbound JSON payloads. Invalid data is rejected with 422 status code.

### Database
SQLAlchemy ORM with type-safe models. All SQL queries use parameterized statements (SQL injection protection).

## Database Schema

**email_events table:**
- `id` (INTEGER PRIMARY KEY)
- `message_id` (VARCHAR UNIQUE) - Prevents duplicates
- `sender` (VARCHAR)
- `subject` (TEXT)
- `received_at` (TIMESTAMP)
- `raw_json` (TEXT) - Full AgentMail JSON
- `processed` (BOOLEAN)

**Indexes:**
- `message_id` (unique)
- `sender`
- `received_at`
- `processed`

## Testing

Run the test script to verify webhook integration:

```bash
export AGENTMAIL_WEBHOOK_SECRET=test-secret-key
python test_webhook.py
```

**Expected output:**
- ✅ Test 1 PASSED: Webhook accepted
- ✅ Test 2 PASSED: Email retrieved
- ✅ Test 3 PASSED: Duplicate rejected
- ✅ Test 4 PASSED: Unauthorized rejected
- ✅ Test 5 PASSED: Email list retrieved

## Production Deployment

1. Set strong webhook secret
2. Use PostgreSQL instead of SQLite (update DATABASE_URL)
3. Enable HTTPS (reverse proxy)
4. Configure CORS for frontend domain only
5. Use production ASGI server (Gunicorn + Uvicorn workers)

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```
