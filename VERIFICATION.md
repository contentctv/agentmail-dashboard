# AgentMail Dashboard - End-to-End Verification Guide

**Goal:** Test complete webhook pipeline from AgentMail → ngrok tunnel → FastAPI backend → React frontend

---

## Prerequisites

- AgentMail account with access to Webhooks tab
- Email address: `codybeartv_ai_assistant@agentmail.to`
- Webhook secret: `test-secret-key` (or your custom secret)

---

## Terminal Commands

### Terminal 1: Start FastAPI Backend

```bash
cd /root/clawd/agentmail-dashboard/backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Set webhook secret (IMPORTANT: Use same secret in AgentMail console)
export AGENTMAIL_WEBHOOK_SECRET=test-secret-key

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Starting AgentMail Dashboard API...
INFO:     Database initialized successfully
```

**Leave this terminal running.**

---

### Terminal 2: Start React Frontend

```bash
cd /root/clawd/agentmail-dashboard/frontend

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Leave this terminal running.**

**Open browser:** http://localhost:5173  
**Expected:** Dashboard shows "Listening for inbound AgentMail webhooks..." (empty state)

---

### Terminal 3: Start ngrok Tunnel

```bash
# Start ngrok tunnel to port 8000 (FastAPI backend)
ngrok http 8000
```

**Expected output:**
```
ngrok

Session Status                online
Account                       your-account (Plan: Free)
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL:** `https://xxxx-xxxx-xxxx.ngrok-free.app`

**Leave this terminal running.**

---

## AgentMail Webhook Configuration

### Step 1: Access AgentMail Console
1. Log in to your AgentMail account
2. Navigate to **Webhooks** tab

### Step 2: Create Webhook
1. Click **"Add Webhook"** or **"Create New Webhook"**
2. Fill in the form:

   **Webhook URL:**
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app/api/webhook/agentmail
   ```
   *(Replace `xxxx-xxxx-xxxx.ngrok-free.app` with your actual ngrok URL)*

   **HTTP Method:** `POST`

   **Headers:**
   - Name: `X-Webhook-Secret`
   - Value: `test-secret-key`

   **Events to Subscribe:**
   - Select: `email.received` or `message.inbound` (or "All Events")

3. Click **"Save"** or **"Create Webhook"**

### Step 3: Test Webhook (Optional)
If AgentMail provides a "Test Webhook" button:
1. Click **"Test Webhook"**
2. Check Terminal 1 (FastAPI) for incoming request logs
3. Expected log:
   ```
   INFO:     Stored email event: ID=1, message_id=test_msg_xxx
   ```

---

## End-to-End Verification

### 1. Send Test Email
Send an email **TO:**
```
codybeartv_ai_assistant@agentmail.to
```

**FROM:** Any valid email address

**Subject:** `Test Email for Dashboard`

**Body:** `This is a test to verify the AgentMail webhook pipeline.`

### 2. Check Backend Logs (Terminal 1)
Watch for incoming webhook request:
```
INFO:     Stored email event: ID=1, message_id=msg_abc123xyz
```

### 3. Check Frontend Dashboard (Browser)
1. Open http://localhost:5173
2. Wait up to 10 seconds (auto-refresh interval)
3. **Expected:** Email appears in the grid:
   - ID: `#1`
   - Sender: Your email address
   - Subject: `Test Email for Dashboard`
   - Received: Timestamp
   - Status: `New`

### 4. Inspect JSON Payload
1. Click on the email row
2. **Expected:** Detail modal opens showing:
   - Metadata (ID, message_id, sender, subject, timestamp)
   - Full JSON payload from AgentMail
   - "Copy JSON" button works

### 5. Verify Auto-Refresh
1. Send another test email
2. Watch dashboard auto-refresh within 10 seconds
3. New email appears without manual refresh

---

## Troubleshooting

### Backend Not Receiving Webhooks

**Check ngrok tunnel:**
```bash
# Open ngrok web interface
open http://127.0.0.1:4040
```
- View all incoming requests
- Check if AgentMail is sending webhooks

**Check webhook secret:**
- Ensure `AGENTMAIL_WEBHOOK_SECRET` matches the header value in AgentMail console
- Backend returns `401 Unauthorized` if secret is wrong

**Check ngrok URL:**
- Verify URL in AgentMail includes `/api/webhook/agentmail` path
- Example: `https://xxxx.ngrok-free.app/api/webhook/agentmail`

### Frontend Not Showing Emails

**Check browser console:**
- Press F12 → Console tab
- Look for CORS errors or API errors

**Check CORS:**
- Backend should allow all origins (configured in `main.py`)
- If restricted, add frontend origin to CORS middleware

**Test backend directly:**
```bash
curl http://localhost:8000/api/emails
```
Expected: JSON response with email list

### Email Not Arriving

**Check AgentMail console:**
- Look for delivery status
- Check spam/junk folder
- Verify email address: `codybeartv_ai_assistant@agentmail.to`

**Check AgentMail webhook logs:**
- Most providers show webhook delivery history
- Look for HTTP status codes (201 = success, 401 = auth error)

---

## Success Criteria ✅

- [ ] FastAPI backend running on port 8000
- [ ] React frontend running on port 5173
- [ ] ngrok tunnel active with HTTPS URL
- [ ] AgentMail webhook configured with correct URL + secret
- [ ] Test email sent to `codybeartv_ai_assistant@agentmail.to`
- [ ] Email appears in dashboard grid
- [ ] Click email → JSON payload modal opens
- [ ] Auto-refresh works (10s interval)
- [ ] No errors in browser console or backend logs

---

## Cleanup

**Stop all services:**
- Terminal 1: `Ctrl+C` (stop FastAPI)
- Terminal 2: `Ctrl+C` (stop Vite)
- Terminal 3: `Ctrl+C` (stop ngrok)

**Optional: Delete test emails from database:**
```bash
cd /root/clawd/agentmail-dashboard
rm database/emails.db
```

---

## Next Steps

Once verification is complete:
1. **Phase 2 Features:** User auth, WebSocket real-time, advanced filtering
2. **Deployment:** Docker containerization, production hosting
3. **CI/CD:** GitHub Actions pipeline for automated testing

---

**Questions? Check Terminal 1 (FastAPI logs) and ngrok web UI (http://127.0.0.1:4040) for debugging.**
