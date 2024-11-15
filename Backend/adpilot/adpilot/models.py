from sqlmodel import SQLModel, Field
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi import Form

class Register_User(OAuth2PasswordRequestForm):
    email: Annotated[
            str,
            Form(),
        ]

class User(SQLModel,table=True):
    id: int = Field(default=None,primary_key=True)
    username: str
    email: str
    password: str
    
