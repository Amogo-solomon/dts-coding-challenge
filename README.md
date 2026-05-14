# HMCTS Case Task Manager

[![CI](https://github.com/Amogo-solomon/dts-coding-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/Amogo-solomon/dts-coding-challenge/actions/workflows/ci.yml)

A full-stack task management system for HMCTS caseworkers, built for the DTS Developer Technical Test. Caseworkers can create, view, update, and delete tasks to efficiently manage their workload.

---

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Backend  | Python 3.11+, FastAPI, SQLAlchemy    |
| Database | SQLite                               |
| Frontend | React 18, TypeScript, Vite           |
| Tests    | pytest (backend), Vitest (frontend)  |
| CI       | GitHub Actions                       |

---

## Project Structure

```
dts-coding-challenge/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── task.py        # Task ORM model
│   │   ├── schemas/
│   │   │   └── task.py        # Pydantic request/response schemas
│   │   └── routers/
│   │       └── tasks.py       # CRUD route handlers
│   ├── tests/
│   │   └── test_tasks.py      # 17 backend unit tests
│   ├── requirements.txt
│   └── pytest.ini
└── frontend/
    ├── src/
    │   ├── App.tsx             # Root component, layout, filtering
    │   ├── App.css             # GOV.UK-inspired design system
    │   ├── types/
    │   │   └── task.ts         # Shared TypeScript types
    │   ├── hooks/
    │   │   ├── taskApi.ts      # Fetch-based API service layer
    │   │   └── useTasks.ts     # State management hook
    │   ├── components/
    │   │   ├── TaskCard.tsx    # Task display with status actions
    │   │   └── TaskForm.tsx    # Validated create form
    │   └── test/
    │       └── tasks.test.ts   # 10 frontend unit tests
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Amogo-solomon/dts-coding-challenge.git
cd dts-coding-challenge
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the API server (auto-creates tasks.db on first run)
uvicorn app.main:app --reload --port 8000
```

The API is now available at **http://localhost:8000**

Interactive API documentation (Swagger UI): **http://localhost:8000/docs**

### 3. Frontend setup

Open a **second terminal** and run:

```bash
cd frontend

# Install dependencies
npm install --force

# Start the development server
npm run dev
```

The app is now available at **http://localhost:3000**

> The Vite dev server proxies all `/api` requests to `http://localhost:8000`, so both services must be running at the same time.

---

## API Endpoints

| Method | Path                          | Description              | Status Codes     |
|--------|-------------------------------|--------------------------|------------------|
| GET    | `/health`                     | Health check             | 200              |
| POST   | `/api/v1/tasks/`              | Create a task            | 201, 422         |
| GET    | `/api/v1/tasks/`              | List all tasks           | 200              |
| GET    | `/api/v1/tasks/{id}`          | Get a task by ID         | 200, 404         |
| PATCH  | `/api/v1/tasks/{id}/status`   | Update task status       | 200, 404, 422    |
| DELETE | `/api/v1/tasks/{id}`          | Delete a task            | 204, 404         |

### Task object

```json
{
  "id": 1,
  "title": "Review hearing documents",
  "description": "Check all submissions before Friday",
  "status": "todo",
  "due_date": "2025-06-01T09:00:00Z",
  "created_at": "2025-05-14T10:00:00Z",
  "updated_at": null
}
```

### Task status values

| Value       | Meaning     |
|-------------|-------------|
| `todo`      | Not started |
| `in_progress` | In progress |
| `done`      | Completed   |

### Example requests

**Create a task:**

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

**Update task status:**

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

**Delete a task:**

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/1
```

---

## Running Tests

### Backend — 17 tests

```bash
cd backend

# Activate virtual environment first
venv\Scripts\Activate.ps1       # Windows
source venv/bin/activate         # Mac/Linux

pytest -v
```

Expected output:

```
tests/test_tasks.py::test_create_task_success PASSED
tests/test_tasks.py::test_create_task_no_description PASSED
tests/test_tasks.py::test_create_task_missing_title PASSED
tests/test_tasks.py::test_create_task_missing_due_date PASSED
tests/test_tasks.py::test_create_task_invalid_status PASSED
tests/test_tasks.py::test_create_task_title_too_long PASSED
tests/test_tasks.py::test_get_all_tasks_empty PASSED
tests/test_tasks.py::test_get_all_tasks PASSED
tests/test_tasks.py::test_get_task_by_id PASSED
tests/test_tasks.py::test_get_task_not_found PASSED
tests/test_tasks.py::test_update_task_status PASSED
tests/test_tasks.py::test_update_status_to_done PASSED
tests/test_tasks.py::test_update_status_invalid PASSED
tests/test_tasks.py::test_update_status_task_not_found PASSED
tests/test_tasks.py::test_delete_task PASSED
tests/test_tasks.py::test_delete_task_not_found PASSED
tests/test_tasks.py::test_health_check PASSED

17 passed in 3.33s
```

### Frontend — 10 tests

```bash
cd frontend
npm test
```

---

## CI/CD Pipeline

Every push to `main` automatically triggers the GitHub Actions CI pipeline, which:

1. Runs all 17 backend pytest tests on a clean Ubuntu environment
2. Runs all 10 frontend Vitest tests on a clean Ubuntu environment

Both jobs must pass for the pipeline to succeed. You can view the latest run here:
**https://github.com/Amogo-solomon/dts-coding-challenge/actions**

---

## Design Decisions

**SQLite + SQLAlchemy**
Zero-config local storage with a clean ORM layer. Switching to PostgreSQL for production only requires changing the `DATABASE_URL` environment variable — no other code changes needed.

**Pydantic v2 schemas**
All incoming requests are validated through Pydantic schemas before reaching the database. Invalid data (empty titles, bad status values, missing due dates) returns a clear `422 Unprocessable Entity` response with field-level error details.

**Vite proxy**
The Vite dev server proxies `/api` requests to the backend, avoiding CORS issues in development without needing environment-specific API URLs hardcoded in the frontend.

**`useTasks` custom hook**
All API calls and task state live in a single custom hook, keeping the components thin and focused purely on rendering. This also makes the logic straightforward to unit test in isolation.

**GOV.UK Design System**
The UI uses the GOV.UK colour palette, typography hierarchy, and focus states — the same design language used across HMCTS digital services, making it immediately familiar to caseworkers.

**GitHub Actions CI**
Automated testing on every push ensures the codebase remains stable and gives reviewers confidence that all tests pass in a clean, reproducible environment.
