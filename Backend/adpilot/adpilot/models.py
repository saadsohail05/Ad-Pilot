from sqlmodel import SQLModel, Field
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, Optional
from fastapi import Form
from pydantic import BaseModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str 
    last_name: str 
    username: str 
    email: str 
    password: str 
    is_verified: bool = Field(default=False)

class Register_User (BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str
    is_verified: bool = False

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