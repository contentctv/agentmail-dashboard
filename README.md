# AgentMail Dashboard

**Internal monitoring tool for AgentMail webhook events**

Real-time dashboard for monitoring the inbound email pipeline at `codybeartv_ai_assistant@agentmail.to`.

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
   - Real-time updates as new emails arrive (webhook-triggered)

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
  - `LoginForm`: Authentication UI
  - `EmailGrid`: Sortable/filterable table of inbound emails
  - `EmailDetail`: Modal for JSON payload inspection
  - `WebSocketClient`: Real-time event updates
- **State Management:** React Context API or Zustand
- **Styling:** Tailwind utility classes, dark mode support
- **Responsive:** Mobile-first design

#### Backend (Python + FastAPI)
- **Technology:** FastAPI, Python 3.11+, Uvicorn
- **Endpoints:**
  - `POST /webhook/agentmail`: AgentMail event receiver
  - `GET /api/emails`: Paginated email list
  - `GET /api/emails/{id}`: Single email detail
  - `POST /api/auth/login`: User authentication
  - `WebSocket /ws`: Real-time event stream
- **Middleware:** CORS, authentication, request logging
- **Security:** JWT tokens, webhook signature validation

#### Database (SQLite)
- **Technology:** SQLite 3, SQLAlchemy ORM
- **Schema:**
  ```sql
  CREATE TABLE emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_json TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

### Scope

#### MVP Features (Phase 1)
- ✅ Read-only dashboard
- ✅ Webhook event capture (AgentMail)
- ✅ SQLite persistence
- ✅ JSON payload display
- ✅ Basic authentication
- ✅ Real-time updates (WebSocket)
- ✅ Responsive UI (desktop/mobile)

#### Out of Scope (Future)
- ❌ Outbound email sending (AgentMail integration planned for Phase 2)
- ❌ Advanced filtering/search (Phase 2)
- ❌ Email categorization/tagging (Phase 2)
- ❌ Multi-user roles/permissions (Phase 2)
- ❌ Email body rendering (HTML preview) (Phase 2)

#### Constraints
- **Performance:** Dashboard must load <2s, webhook response <500ms
- **Security:** All endpoints require authentication except webhook (signature-validated)
- **Deployment:** Containerized (Docker) for easy deployment
- **Budget:** MVP phase - minimal external dependencies
- **Timeline:** Target 1 week MVP delivery

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
- **Real-time:** WebSockets (FastAPI built-in)
- **Auth:** JWT tokens (PyJWT)
- **Deployment:** Docker + Docker Compose

### Project Structure
```
agentmail-dashboard/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── core/             # Config, auth, dependencies
│   │   ├── db/               # Database models and session
│   │   ├── schemas/          # Pydantic models
│   │   └── main.py           # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                 # SQLite and migrations
│   ├── schema.sql
│   └── seed.sql
│
├── .github/workflows/        # CI/CD
│   └── deploy.yml
│
├── docker-compose.yml        # Local dev environment
├── .gitignore
├── .env.example
└── README.md                 # This file
```

### API Endpoints

#### Webhook
```
POST /webhook/agentmail
Body: AgentMail webhook payload (JSON)
Response: 200 OK (event stored)
Auth: Webhook signature validation
```

#### Email API
```
GET /api/emails?page=1&limit=50
Response: Paginated email list
Auth: JWT required

GET /api/emails/{id}
Response: Full email detail with JSON payload
Auth: JWT required
```

#### Authentication
```
POST /api/auth/login
Body: { username, password }
Response: { access_token, token_type }
```

#### WebSocket
```
WebSocket /ws
Events: { type: "new_email", data: {...} }
Auth: JWT token in query param
```

### Database Schema

**emails table:**
- `id` (INTEGER PRIMARY KEY)
- `message_id` (TEXT UNIQUE) - AgentMail message ID
- `sender` (TEXT) - Email sender address
- `subject` (TEXT) - Email subject line
- `received_at` (TIMESTAMP) - When webhook received event
- `raw_json` (TEXT) - Full AgentMail JSON payload
- `processed` (BOOLEAN) - Processing status flag

**users table:**
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password_hash` (TEXT) - bcrypt hashed password
- `created_at` (TIMESTAMP)

### Security

1. **Webhook Validation:**
   - Verify AgentMail signature header
   - Reject unsigned/invalid requests

2. **Authentication:**
   - JWT tokens with expiration
   - bcrypt password hashing (cost factor 12)
   - Secure HTTP-only cookies (production)

3. **CORS:**
   - Restrict origins to dashboard domain
   - Credentials allowed for authenticated requests

4. **Environment Variables:**
   - `SECRET_KEY` - JWT signing key
   - `AGENTMAIL_WEBHOOK_SECRET` - Webhook signature validation
   - `DATABASE_URL` - SQLite path (default: `./database/emails.db`)

### Deployment

**Development:**
```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

**Production:**
- Containerized deployment (Docker)
- Environment variables via secrets management
- SQLite database persisted via volume mount
- Reverse proxy (nginx/Caddy) for HTTPS

---

## Development Roadmap

### Phase 1: MVP (Current)
- [x] MAPS framework defined
- [x] Repository initialized
- [ ] Backend API scaffold (FastAPI)
- [ ] Database schema and ORM setup
- [ ] Webhook endpoint implementation
- [ ] Frontend scaffold (React + Tailwind)
- [ ] Email grid component
- [ ] Authentication flow
- [ ] WebSocket real-time updates
- [ ] Docker containerization
- [ ] Initial deployment

### Phase 2: Enhancement (Future)
- [ ] Advanced search/filtering
- [ ] Email categorization/tags
- [ ] HTML email body rendering
- [ ] Outbound email sending (AgentMail API)
- [ ] Multi-user support with roles
- [ ] Analytics dashboard
- [ ] Export functionality (CSV/JSON)

---

## Contributing

This is an internal tool for CODYBEARTV GLOBAL MEDIA STUDIOS. Development follows the Emergent AI multi-agent workflow:
1. **Planning:** MAPS framework (this document)
2. **Frontend/Backend:** Parallel development with defined API contracts
3. **Testing:** Playwright browser tests + unit/integration tests
4. **Deployment:** CI/CD pipeline via GitHub Actions

---

## License

Proprietary - CODYBEARTV GLOBAL MEDIA STUDIOS

**Contact:** codybeartv_ai_assistant@agentmail.to
