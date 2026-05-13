import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


VALID_TASK = {
    "title": "Review case files",
    "description": "Review all case files for hearing on Friday",
    "status": "todo",
    "due_date": "2030-12-31T10:00:00",
}


# --- CREATE ---

def test_create_task_success(client):
    response = client.post("/api/v1/tasks/", json=VALID_TASK)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == VALID_TASK["title"]
    assert data["status"] == "todo"
    assert "id" in data


def test_create_task_no_description(client):
    payload = {**VALID_TASK, "description": None}
    response = client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 201
    assert response.json()["description"] is None


def test_create_task_missing_title(client):
    payload = {**VALID_TASK, "title": ""}
    response = client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 422


def test_create_task_missing_due_date(client):
    payload = {k: v for k, v in VALID_TASK.items() if k != "due_date"}
    response = client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 422


def test_create_task_invalid_status(client):
    payload = {**VALID_TASK, "status": "banana"}
    response = client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 422


def test_create_task_title_too_long(client):
    payload = {**VALID_TASK, "title": "x" * 201}
    response = client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 422


# --- READ ---

def test_get_all_tasks_empty(client):
    response = client.get("/api/v1/tasks/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_tasks(client):
    client.post("/api/v1/tasks/", json=VALID_TASK)
    client.post("/api/v1/tasks/", json={**VALID_TASK, "title": "Second task"})
    response = client.get("/api/v1/tasks/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task_by_id(client):
    created = client.post("/api/v1/tasks/", json=VALID_TASK).json()
    response = client.get(f"/api/v1/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_task_not_found(client):
    response = client.get("/api/v1/tasks/9999")
    assert response.status_code == 404


# --- UPDATE STATUS ---

def test_update_task_status(client):
    created = client.post("/api/v1/tasks/", json=VALID_TASK).json()
    response = client.patch(
        f"/api/v1/tasks/{created['id']}/status",
        json={"status": "in_progress"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_update_status_to_done(client):
    created = client.post("/api/v1/tasks/", json=VALID_TASK).json()
    response = client.patch(
        f"/api/v1/tasks/{created['id']}/status",
        json={"status": "done"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_update_status_invalid(client):
    created = client.post("/api/v1/tasks/", json=VALID_TASK).json()
    response = client.patch(
        f"/api/v1/tasks/{created['id']}/status",
        json={"status": "invalid"},
    )
    assert response.status_code == 422


def test_update_status_task_not_found(client):
    response = client.patch("/api/v1/tasks/9999/status", json={"status": "done"})
    assert response.status_code == 404


# --- DELETE ---

def test_delete_task(client):
    created = client.post("/api/v1/tasks/", json=VALID_TASK).json()
    response = client.delete(f"/api/v1/tasks/{created['id']}")
    assert response.status_code == 204
    # Confirm it's gone
    assert client.get(f"/api/v1/tasks/{created['id']}").status_code == 404


def test_delete_task_not_found(client):
    response = client.delete("/api/v1/tasks/9999")
    assert response.status_code == 404


# --- HEALTH ---

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
