from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Form
from typing import Annotated
from adpilot.models import Register_User, User
from adpilot.db import get_session
from adpilot.auth import hash_password, get_user_from_db, oauth_scheme, current_user
from sqlmodel import Session
from adpilot.email import send_verification_email, verify_token
import requests
# from adpilot.utils import email_exists  # Import the function from utils

user_router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@user_router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]

@user_router.post("/register", response_model=dict)
async def register_user(
    new_user: Register_User,
    session: Annotated[Session, Depends(get_session)],
    background_tasks: BackgroundTasks
):
    # if not email_exists(new_user.email):
    #     raise HTTPException(status_code=400, detail="Email address does not exist")
    
    db_user = get_user_from_db(session, new_user.username, new_user.email)
    if db_user:
        raise HTTPException(status_code=409, detail="User with these credentials already exists")
    user = User(
        username=new_user.username,
        email=new_user.email,
        password=hash_password(new_user.password),
        is_verified=False

    )
    session.add(user)
    session.commit()
    session.refresh(user)
    background_tasks.add_task(send_verification_email, user.email)
    return {"message": f"User with {user.username} successfully registered. Verification email sent."}

@user_router.get('/me')
async def user_profile(current_user: Annotated[User, Depends(current_user)]):
    return current_user

@user_router.post("/send-verification-email", response_model=dict)
async def send_verification_email_endpoint(
    email: str,
    background_tasks: BackgroundTasks,
    session: Annotated[Session, Depends(get_session)]
):
    user = get_user_from_db(session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    background_tasks.add_task(send_verification_email, email)
    return {"message": "Verification email sent"}

@user_router.post("/verify-email", response_model=dict)
async def verify_email(
    verification_code: Annotated[int, Form()],
    session: Annotated[Session, Depends(get_session)]
):
    email = verify_token(verification_code)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    user = get_user_from_db(session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = True
    session.add(user)
    session.commit()
    return {"message": "Email successfully verified"}