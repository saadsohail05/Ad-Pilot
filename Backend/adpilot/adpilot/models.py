from sqlmodel import SQLModel, Field
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, Optional
from fastapi import Form
from pydantic import BaseModel

class User (SQLModel, table=True):
        id: int = Field(default=None, primary_key=True)
        username: str
        email: str
        password: str
        is_verified: bool = Field(default=False)

class Register_User (BaseModel):
    username: Annotated[
        str,
        Form(),
    ]
    email: Annotated[
        str,
        Form(),
    ]
    password: Annotated[
        str,
        Form(),
    ]
    is_verified: Annotated[
        bool,
        Form(),
    ]

class Token (BaseModel):
    access_token: Optional[str] = None
    token_type: str
    refresh_token: Optional[str] = None
    is_verified: bool
    email: str

class TokenData (BaseModel):
        username:str

class RefreshTokenData (BaseModel):
        email:str