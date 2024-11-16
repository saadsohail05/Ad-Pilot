from fastapi import APIRouter
from typing import Annotated
from adpilot.models import Register_User
from fastapi import Depends
from adpilot.db import get_session
from adpilot.auth import hash_password, get_user_from_db, oauth_scheme,current_user
from sqlmodel import Session
from fastapi import HTTPException
from adpilot.models import User

user_router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@user_router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]

@user_router.post("/register")
async def register_user(
    new_user: Annotated[Register_User, Depends()],
    session: Annotated[Session, Depends(get_session)]
):
    db_user = get_user_from_db(session, new_user.username, new_user.email)
    if db_user:
        raise HTTPException(status_code=409, detail="User with these credentials already exists")
    user = User(
        username=new_user.username,
        email=new_user.email,
        password=hash_password(new_user.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": f"User with {user.username} successfully registered"}

@user_router.get('/me')
async def user_profile (current_user:Annotated[User, Depends(current_user)]):

    return current_user