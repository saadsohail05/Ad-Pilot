from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import SQLModel, Field, create_engine, Session, select
from adpilot import setting
from typing import Annotated
from contextlib import asynccontextmanager
from adpilot.db import get_session, create_tables
from adpilot.router import user
from adpilot.auth import authenticate_user, create_access_token, EXPIRY_TIME, create_refresh_token, validate_refresh_token, get_user_from_db
from adpilot.models import User, Token, RefreshTokenData, TokenData, Register_User
from fastapi.middleware.cors import CORSMiddleware
from adpilot.email import send_verification_email
import subprocess


@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Starting Redis server')
    redis_process = subprocess.Popen(['redis-server'])
    print('Creating Tables')
    create_tables()
    print("Tables Created")
    yield
    print('Stopping Redis server')
    redis_process.terminate()

app: FastAPI = FastAPI(
    lifespan=lifespan, title="Adpilot", version='1.0.0')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to the specific origins you want to allow
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specify allowed methods
    allow_headers=["Content-Type", "Authorization"],  # Specify allowed headers
)

app.include_router(user.user_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Adpilot!"}

        
# login . username, password
@app.post('/token', response_model=Token)
async def login(form_data:Annotated[OAuth2PasswordRequestForm, Depends()],
                session:Annotated[Session, Depends(get_session)]):
    try:
        user = authenticate_user(form_data.username, form_data.password, session)
        
        expire_time = timedelta(minutes=EXPIRY_TIME)
        access_token = create_access_token({"sub": user.username}, expire_time)
        refresh_expire_time = timedelta(days=7)
        refresh_token = create_refresh_token({"sub": user.email}, refresh_expire_time)

        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=refresh_token,
            is_verified=True,
            email=user.email
        )
        
    except HTTPException as e:
        if e.status_code == 403:  # Verification error
            user = get_user_from_db(session, username=form_data.username)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid username or password")
                
            return Token(
                access_token=None,
                token_type="bearer",
                refresh_token=None,
                is_verified=False,
                email=user.email
            )
        raise e  # Re-raise other exceptions


@app.post("/token/refresh")
def refresh_token(old_refresh_token:str,
                  session:Annotated[Session, Depends(get_session)]):
    
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token, Please login again",
        headers={"www-Authenticate":"Bearer"}
    )
    
    user = validate_refresh_token(old_refresh_token,
                                  session)
    if not user:
        raise credential_exception
    
    expire_time = timedelta(minutes=EXPIRY_TIME)
    access_token = create_access_token({"sub":user.username}, expire_time)

    refresh_expire_time = timedelta(days=7)
    refresh_token = create_refresh_token({"sub":user.email}, refresh_expire_time)

    return Token(access_token=access_token, token_type= "bearer", refresh_token=refresh_token)
