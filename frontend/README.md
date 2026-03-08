# AgentMail Dashboard - Frontend

React + Vite + Tailwind CSS frontend for AgentMail webhook monitoring.

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if backend is not on localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Architecture

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Components

#### `Dashboard.jsx`
Main view component. Orchestrates:
- Email list fetching
- Auto-refresh (10s interval)
- Loading/empty/error states
- Stats display (total emails, webhook status)

#### `EmailGrid.jsx`
Data table component. Features:
- Displays paginated email list
- Click to open detail modal
- Responsive grid layout
- Status badges (New/Done)

#### `DetailModal.jsx`
Modal for inspecting full JSON payload. Features:
- Fetches single email detail
- Formatted JSON display
- Copy-to-clipboard button
- Keyboard shortcut (ESC to close)

#### `EmptyState.jsx`
Friendly empty state when no emails exist.
Shows "Listening for webhooks..." message.

#### `LoadingSpinner.jsx`
Loading indicator for async operations.

#### `ErrorBoundary.jsx`
Error boundary for graceful error handling.
Catches React errors and displays fallback UI.

### API Integration

**File:** `src/api/emails.js`

**Functions:**
- `fetchEmails(page, limit)` - Get paginated email list
- `fetchEmailDetail(emailId)` - Get single email with JSON
- `pollEmails(callback, intervalMs)` - Auto-refresh polling

**API Base URL:** Configured via `VITE_API_URL` env var (default: http://localhost:8000)

## Features

### Auto-Refresh
- Enabled by default
- Polls `/api/emails` every 10 seconds
- Toggle button to enable/disable
- Shows "Last refresh" timestamp

### Email Detail View
- Click any email row to open detail modal
- Displays metadata (ID, sender, subject, timestamp)
- Shows full parsed JSON payload
- Copy-to-clipboard functionality
- Close with ESC key or X button

### Error Handling
- Loading spinners for async operations
- Error messages with retry buttons
- Empty state for no emails
- Error boundary for React errors

### Responsive Design
- Desktop-first layout (optimized for monitoring)
- Mobile-responsive grid
- Clinical, high-contrast color scheme
- Data-dense tables for efficient monitoring

## Styling

Tailwind CSS with dark theme:
- Background: `bg-gray-900`
- Cards: `bg-gray-800` with `border-gray-700`
- Text: `text-gray-100` / `text-gray-400`
- Accents: Blue (actions), Green (status), Red (errors)

## Build for Production

```bash
npm run build
```

Output: `dist/` directory

Serve with static file server:
```bash
npm run preview
```

## Environment Variables

**VITE_API_URL** - Backend API base URL (default: http://localhost:8000)

## Integration with Backend

Frontend expects backend at `http://localhost:8000` by default.

**Backend endpoints used:**
- `GET /api/emails?page=1&limit=50` - Email list
- `GET /api/emails/{id}` - Email detail

**CORS:** Backend must allow frontend origin (configured in backend CORS middleware).

## Development Tips

### Hot Module Replacement
Vite provides instant HMR. Edit any file and see changes immediately.

### Tailwind IntelliSense
Install Tailwind CSS IntelliSense extension in your editor for autocomplete.

### React DevTools
Install React DevTools browser extension for debugging.

## File Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── emails.js          # API client
│   ├── components/
│   │   ├── Dashboard.jsx      # Main view
│   │   ├── EmailGrid.jsx      # Email table
│   │   ├── DetailModal.jsx    # JSON detail modal
│   │   ├── EmptyState.jsx     # No emails state
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   └── ErrorBoundary.jsx  # Error handling
│   ├── App.jsx                # Root component
│   └── index.css              # Tailwind imports
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                       # Environment variables
```

## Testing End-to-End

1. Start backend: `cd ../backend && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Send test webhook: `cd ../backend && python test_webhook.py`
4. Open browser: http://localhost:5173
5. Verify email appears in dashboard
6. Click email to view JSON payload

## Troubleshooting

**"Failed to fetch emails" error:**
- Verify backend is running on port 8000
- Check CORS configuration in backend
- Inspect browser console for network errors

**Tailwind styles not loading:**
- Run `npm install` to ensure Tailwind is installed
- Verify `tailwind.config.js` content paths
- Check `index.css` has Tailwind directives

**Auto-refresh not working:**
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Test manual refresh button
