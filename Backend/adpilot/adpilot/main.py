from fastapi import FastAPI
from contextlib import asynccontextmanager
from adpilot.db import create_tables
from adpilot.routers import users

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan, title="Adpilot", description="Adpilot API", version="0.1.0")

# Include routers
app.include_router(users.router, prefix="/user", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "Welcome to Adpilot!"}
