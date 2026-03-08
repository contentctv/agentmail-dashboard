# AgentMail Dashboard

**Internal monitoring tool for AgentMail webhook events**

Real-time dashboard for monitoring the inbound email pipeline at `codybeartv_ai_assistant@agentmail.to`.

---

## Quick Start (Development)

### Option 1: Automated Launch Script

```bash
# Set webhook secret (required)
export AGENTMAIL_WEBHOOK_SECRET=your-secret-here

# Launch both backend and frontend
./start-dev.sh
```

This will:
- Install dependencies (if needed)
- Create Python virtual environment
- Start FastAPI backend on port 8000
- Start Vite frontend on port 5173

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Launch

**Terminal 1 (Backend):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export AGENTMAIL_WEBHOOK_SECRET=your-secret-here
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Test Webhook

**Terminal 3 (Test Script):**
```bash
cd backend
export AGENTMAIL_WEBHOOK_SECRET=your-secret-here
python test_webhook.py
```

Expected output:
- ✅ Test 1 PASSED: Webhook accepted and email stored
- ✅ Test 2 PASSED: Email retrieved successfully
- ✅ Test 3 PASSED: Duplicate message_id rejected
- ✅ Test 4 PASSED: Request without secret rejected
- ✅ Test 5 PASSED: Email list retrieved

---

## MAPS Framework

### Mission
A lightweight, internal tool to monitor AgentMail webhook events and display them in a real-time dashboard. This system provides visibility into the inbound email pipeline for CODYBEARTV GLOBAL MEDIA STUDIOS, enabling operational monitoring and debugging of email-driven workflows.

**Business Goals:**
- Real-time visibility into inbound emails
- Webhook event logging and persistence
- JSON payload inspection for debugging
- Foundation for future email automation features

**Success Criteria:**
- Dashboard loads in <2s
- Webhook events captured with <500ms latency
- All email metadata and JSON payloads stored and retrievable
- Clean, responsive UI for desktop and mobile

### Action
Core user workflows and interaction patterns:

1. **User Authentication**
   - User navigates to dashboard
   - Logs in with secure credentials
   - Gains access to email event stream

2. **Email Monitoring**
   - Dashboard displays grid of recent inbound emails
   - Each row shows: timestamp, sender, subject, status
   - Real-time updates as new emails arrive (auto-refresh)

3. **Event Inspection**
   - User clicks on email row
   - Modal/detail view displays full parsed JSON payload
   - Includes headers, body, AgentMail metadata

**Data Flow:**
```
AgentMail Webhook → FastAPI Endpoint → SQLite Storage → React Frontend
```

### Parts

#### Frontend (React + Tailwind)
- **Technology:** React 18, Vite, Tailwind CSS
- **Components:**
  - `Dashboard`: Main view with stats and auto-refresh
  - `EmailGrid`: Data table with click-to-detail
  - `DetailModal`: JSON payload inspector with copy button
  - `EmptyState`: Friendly no-emails state
  - `ErrorBoundary`: Graceful error handling
  - `LoadingSpinner`: Async loading indicator
- **State Management:** React hooks (useState, useEffect)
- **Styling:** Tailwind utility classes, dark theme, data-dense layout
- **Responsive:** Desktop-first design optimized for monitoring

#### Backend (Python + FastAPI)
- **Technology:** FastAPI, Python 3.11+, Uvicorn
- **Endpoints:**
  - `POST /api/webhook/agentmail`: AgentMail event receiver
  - `GET /api/emails`: Paginated email list
  - `GET /api/emails/{id}`: Single email detail
  - `GET /`: Health check
- **Middleware:** CORS, logging
- **Security:** Webhook secret validation (X-Webhook-Secret header)
- **Validation:** Pydantic strict schemas (AgentMailWebhookPayload)

#### Database (SQLite)
- **Technology:** SQLite 3, SQLAlchemy ORM
- **Schema:**
  ```sql
  CREATE TABLE email_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    subject TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    raw_json TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE NOT NULL
  );
  ```
- **Indexes:** message_id, sender, received_at, processed

### Scope

#### MVP Features (Phase 1) - ✅ COMPLETE
- ✅ Read-only dashboard
- ✅ Webhook event capture (AgentMail)
- ✅ SQLite persistence
- ✅ JSON payload display
- ✅ Auto-refresh (10s interval)
- ✅ Responsive UI (desktop/mobile)
- ✅ Clinical, high-contrast Tailwind styling
- ✅ Robust error handling and loading states
- ✅ Empty state with webhook status

#### Out of Scope (Future)
- ❌ User authentication (Phase 2)
- ❌ Outbound email sending (Phase 2)
- ❌ Advanced filtering/search (Phase 2)
- ❌ Email categorization/tagging (Phase 2)
- ❌ WebSocket real-time updates (Phase 2)
- ❌ Email body rendering (HTML preview) (Phase 2)

#### Constraints
- **Performance:** Dashboard loads <2s, webhook response <500ms
- **Security:** Webhook endpoint requires X-Webhook-Secret header
- **Deployment:** Containerized (Docker) for easy deployment
- **Budget:** MVP phase - minimal external dependencies
- **Timeline:** ✅ 1-day MVP delivery achieved

#### Target Audience
- **Primary:** CODYBEARTV development team
- **Secondary:** Operations/support staff monitoring email pipeline
- **Environment:** Internal tool, accessed via secure network

---

## Architecture

### Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** FastAPI (Python 3.11+) + Uvicorn
- **Database:** SQLite 3 + SQLAlchemy ORM
- **API Integration:** Fetch API with auto-refresh polling
- **Security:** Webhook secret validation

### Project Structure
```
agentmail-dashboard/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.jsx        # Main view
│   │   │   ├── EmailGrid.jsx        # Data table
│   │   │   ├── DetailModal.jsx      # JSON inspector
│   │   │   ├── EmptyState.jsx       # No-emails state
│   │   │   ├── LoadingSpinner.jsx   # Loading UI
│   │   │   └── ErrorBoundary.jsx    # Error handling
│   │   ├── api/              # API client
│   │   │   └── emails.js     # Fetch utilities
│   │   ├── App.jsx           # Root component
│   │   ├── index.css         # Tailwind imports
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # (future routes)
│   │   ├── main.py           # FastAPI app + routes
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   ├── database.py       # DB session management
│   │   └── security.py       # Webhook secret validation
│   ├── requirements.txt
│   ├── test_webhook.py       # Test script
│   └── README.md
│
├── database/                 # SQLite and schema
│   └── schema.sql            # SQL schema documentation
│
├── .github/workflows/        # CI/CD (future)
│
├── start-dev.sh              # Launch script
├── .gitignore
├── .env.example
└── README.md                 # This file
```

### API Endpoints

#### POST /api/webhook/agentmail
Receives AgentMail webhook events.

**Headers:**
- `X-Webhook-Secret: <your-secret>` (required)

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
  "items": [...]
}
```

#### GET /api/emails/{id}
Get single email with full JSON payload.

---

## Security

### Webhook Validation
All webhook requests must include `X-Webhook-Secret` header matching `AGENTMAIL_WEBHOOK_SECRET` environment variable.

### Data Validation
Pydantic schemas enforce strict validation on all inbound JSON payloads. Invalid data is rejected with 422 status code.

### Database
SQLAlchemy ORM with type-safe models. All SQL queries use parameterized statements (SQL injection protection).

---

## Development Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] MAPS framework defined
- [x] Repository initialized
- [x] Backend API scaffold (FastAPI)
- [x] Database schema and ORM setup
- [x] Webhook endpoint implementation
- [x] Frontend scaffold (React + Tailwind)
- [x] Email grid component
- [x] Detail modal with JSON display
- [x] Auto-refresh and error handling
- [x] Test script for verification
- [x] Launch script for dev environment

### Phase 2: Enhancement (Future)
- [ ] User authentication (JWT)
- [ ] WebSocket real-time updates
- [ ] Advanced search/filtering
- [ ] Email categorization/tags
- [ ] HTML email body rendering
- [ ] Outbound email sending (AgentMail API)
- [ ] Multi-user support with roles
- [ ] Analytics dashboard
- [ ] Export functionality (CSV/JSON)
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## Contributing

This is an internal tool for CODYBEARTV GLOBAL MEDIA STUDIOS. Development follows the Emergent AI multi-agent workflow:
1. **Planning:** MAPS framework (this document)
2. **Frontend/Backend:** Parallel development with defined API contracts
3. **Testing:** Test scripts + manual verification
4. **Deployment:** CI/CD pipeline via GitHub Actions (Phase 2)

---

## License

Proprietary - CODYBEARTV GLOBAL MEDIA STUDIOS

**Contact:** codybeartv_ai_assistant@agentmail.to

---

## Commits

- **87ee4b3** - Initial commit: Project structure and MAPS framework
- **96fd22b** - Step 3: FastAPI backend implementation
- **0310206** - Step 4: React frontend with Tailwind CSS
