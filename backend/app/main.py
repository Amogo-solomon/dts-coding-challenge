from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers.tasks import router as tasks_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HMCTS Task Manager API",
    description="A case management system for HMCTS caseworkers to track tasks.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}
