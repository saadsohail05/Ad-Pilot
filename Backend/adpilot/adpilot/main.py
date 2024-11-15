from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import SQLModel, Field, create_engine, Session, select
from adpilot import setting
from typing import Annotated
from contextlib import asynccontextmanager
from adpilot.db import get_session,create_tables
# from adpilot.models import models
from adpilot.router import user


@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Creating Tables')
    create_tables()
    print("Tables Created")
    yield

app: FastAPI = FastAPI(
    lifespan=lifespan, title="Adpilot", version='1.0.0')

app.include_router(router=user.user_router)