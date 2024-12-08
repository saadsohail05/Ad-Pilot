from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Form
from typing import Annotated
from pydantic import BaseModel
from adpilot.models import Register_User, User, Ads  # Add Ads to imports
from adpilot.db import get_session
from adpilot.auth import hash_password, get_user_from_db, oauth_scheme, current_user
from sqlmodel import Session, select
from adpilot.email import send_verification_email, verify_token
import requests
from adpilot.utils import verify_email_exists  # Add this import at the top

# Add this class near the top with other models
class EmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    verification_code: str
    new_password: str

# Add this class with other models
class CreateAd(BaseModel):
    adcopy: str
    imglink: str
    productname: str
    product_category: str

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
    # Check if email exists with detailed validation
    email_validation = verify_email_exists(new_user.email)
    if not email_validation["valid"]:
        raise HTTPException(
            status_code=400, 
            detail={
                "message": "Invalid email address",
                "status": "error",
                "status_code": 400
            }
        )
    
    # If email is valid, continue with the registration process
    validation_response = {
        "status": "success",
        "status_code": 200,
        "details": {
            "email_validation": email_validation
        }
    }

    # Check if user already exists
    db_user = get_user_from_db(session, new_user.username, new_user.email)
    if db_user:
        raise HTTPException(
            status_code=409, 
            detail={
                "message": "User with these credentials already exists",
                "status": "error",
                "status_code": 409
            }
        )

    try:
        user = User(
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            username=new_user.username,
            email=new_user.email,
            password=hash_password(new_user.password),
            is_verified=False
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        # Send verification email
        background_tasks.add_task(send_verification_email, user.email)
        
        # Return successful response
        return {
            "message": f"User {user.username} successfully registered. Verification email sent.",
            "status": "success",
            "status_code": 201,
            "validation": validation_response,
            "user": {
                "username": user.username,
                "email": user.email,
                "is_verified": user.is_verified
            }
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error during registration: {str(e)}",
                "status": "error",
                "status_code": 500
            }
        )

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

@user_router.post("/resend-verification", response_model=dict)
async def resend_verification(
    email_data: EmailRequest,
    background_tasks: BackgroundTasks,
    session: Annotated[Session, Depends(get_session)]
):
    user = get_user_from_db(session, email=email_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    background_tasks.add_task(send_verification_email, email_data.email)
    return {"message": "Verification Code Resent successfully"}

@user_router.post("/request-password-reset", response_model=dict)
async def request_password_reset(
    email_data: EmailRequest,
    background_tasks: BackgroundTasks,
    session: Annotated[Session, Depends(get_session)]
):
    user = get_user_from_db(session, email=email_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    background_tasks.add_task(send_verification_email, email_data.email)
    return {"message": "Password reset verification code sent"}

@user_router.post("/reset-password", response_model=dict)
async def reset_password(
    reset_data: ResetPasswordRequest,
    session: Annotated[Session, Depends(get_session)]
):
    # Verify the code
    email = verify_token(reset_data.verification_code)
    if not email or email != reset_data.email:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Get the user and update password
    user = get_user_from_db(session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password
    user.password = hash_password(reset_data.new_password)
    session.add(user)
    session.commit()
    
    return {"message": "Password reset successful"}

@user_router.post("/create-ad", response_model=dict)
async def create_ad(
    ad_data: CreateAd,
    current_user: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    try:
        new_ad = Ads(
            adcopy=ad_data.adcopy,
            imglink=ad_data.imglink,
            username=current_user.username,  # Get username from logged in user
            productname=ad_data.productname,
            product_category=ad_data.product_category
        )
        session.add(new_ad)
        session.commit()
        session.refresh(new_ad)
        
        return {
            "message": "Ad created successfully",
            "status": "success",
            "status_code": 201,
            "ad": {
                "id": new_ad.id,
                "productname": new_ad.productname,
                "product_category": new_ad.product_category
            }
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error creating ad: {str(e)}",
                "status": "error",
                "status_code": 500
            }
        )

@user_router.get("/ads", response_model=dict)
async def get_all_ads(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(current_user)]
):
    try:
        statement = select(Ads)
        ads = session.exec(statement).all()
        
        return {
            "message": "Ads retrieved successfully",
            "status": "success",
            "status_code": 200,
            "ads": [
                {
                    "id": ad.id,
                    "adcopy": ad.adcopy,
                    "imglink": ad.imglink,
                    "username": ad.username,
                    "productname": ad.productname,
                    "product_category": ad.product_category
                }
                for ad in ads
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error fetching ads: {str(e)}",
                "status": "error",
                "status_code": 500
            }
        )