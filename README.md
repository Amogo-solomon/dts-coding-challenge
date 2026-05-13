# HMCTS Case Task Manager

A full-stack task management system for HMCTS caseworkers, built for the DTS Developer Technical Test.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python 3.11+, FastAPI, SQLAlchemy   |
| Database | SQLite (local)                      |
| Frontend | React 18, TypeScript, Vite          |
| Tests    | pytest (backend), Vitest (frontend) |

---

## Project Structure

```
dts-coding-challenge/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── task.py      # Task ORM model
│   │   ├── schemas/
│   │   │   └── task.py      # Pydantic request/response schemas
│   │   └── routers/
│   │       └── tasks.py     # CRUD route handlers
│   ├── tests/
│   │   └── test_tasks.py    # Full API test suite (20 tests)
│   ├── requirements.txt
│   └── pytest.ini
└── frontend/
    ├── src/
    │   ├── App.tsx           # Root component, layout, filtering
    │   ├── App.css           # GOV.UK-inspired design system
    │   ├── types/task.ts     # Shared TypeScript types
    │   ├── hooks/
    │   │   ├── taskApi.ts    # Fetch-based API service layer
    │   │   └── useTasks.ts   # State management hook
    │   ├── components/
    │   │   ├── TaskCard.tsx  # Task display with status actions
    │   │   └── TaskForm.tsx  # Validated create form
    │   └── test/
    │       └── tasks.test.ts # Hook & API unit tests
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server (auto-creates tasks.db on first run)
uvicorn app.main:app --reload --port 8000
```

API is now available at **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App is now available at **http://localhost:3000**

> The Vite dev server proxies `/api` requests to `http://localhost:8000`, so both services need to be running.

---

## API Endpoints

| Method | Path                          | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/health`                     | Health check             |
| POST   | `/api/v1/tasks/`              | Create a task            |
| GET    | `/api/v1/tasks/`              | List all tasks           |
| GET    | `/api/v1/tasks/{id}`          | Get task by ID           |
| PATCH  | `/api/v1/tasks/{id}/status`   | Update task status       |
| DELETE | `/api/v1/tasks/{id}`          | Delete a task            |

### Task Status Values

- `todo`
- `in_progress`
- `done`

### Example: Create a Task

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review hearing documents",
    "description": "Check all submissions before Friday",
    "status": "todo",
    "due_date": "2025-06-01T09:00:00Z"
  }'
```

---

## Running Tests

### Backend

```bash
cd backend
source venv/bin/activate
pytest -v
```

20 tests covering: create, read, update, delete, validation, error handling, and the health endpoint.

### Frontend

```bash
cd frontend
npm test
```

Unit tests covering the `useTasks` hook and `taskApi` service layer.

---

## Design Decisions

- **SQLite + SQLAlchemy**: Zero-config local storage with a clean ORM layer. Swapping to PostgreSQL only requires changing `DATABASE_URL`.
- **Pydantic v2 schemas**: Strict input validation with clear error messages returned to the client.
- **Vite proxy**: Avoids CORS issues in development without needing environment-specific API URLs in the frontend.
- **`useTasks` hook**: Encapsulates all API calls and local state, keeping components thin and testable.
- **GOV.UK design language**: Familiar to HMCTS users — uses the colour palette, typography hierarchy, and focus states from the GOV.UK Design System.
