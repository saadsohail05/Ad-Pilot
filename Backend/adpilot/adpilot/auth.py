from passlib.context import CryptContext
from fastapi import Depends
from typing import Annotated
from adpilot.db import get_session
from sqlalchemy import select
from adpilot.models import User
from sqlmodel import Session
from fastapi.security import OAuth2PasswordBearer




oauth_scheme=OAuth2PasswordBearer(tokenUrl="/token")



pwd_context = CryptContext(schemes="bcrypt")

def hash_password(password):
    return pwd_context.hash(password)


def get_user_from_db(session: Annotated[Session, Depends(get_session)],
                     username: str | None = None,
                     email: str | None = None):
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    print(user)
    if not user:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        if user:
            return user

    return user
