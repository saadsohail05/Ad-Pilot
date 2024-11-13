from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from adpilot.models.user import User
from adpilot.db import get_session
from typing import List

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get("/", response_model=List[User])
async def get_user(session: Session = Depends(get_session)):
    statement = select(User)
    users = session.exec(statement).all()
    return users
