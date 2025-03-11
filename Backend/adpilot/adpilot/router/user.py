from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Form, UploadFile, File
from typing import Annotated, Optional
from pydantic import BaseModel
from adpilot.models import Register_User, User, Ads  
from adpilot.db import get_session
from adpilot.auth import hash_password, get_user_from_db, oauth_scheme, current_user
from sqlmodel import Session, select
from adpilot.email import send_verification_email, verify_token
import requests
from adpilot.utils import verify_email_exists
from adpilot.image_utils import upload_image

class EmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    verification_code: str
    new_password: str

class CreateAd(BaseModel):
    adcopy: str
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

@user_router.post("/ads", response_model=dict)
async def create_ad(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(current_user)],
    adcopy: str = Form(...),
    imglink: str = Form(...),
    cover_imglink: str = Form(None),
    productname: str = Form(...),
    product_category: str = Form(...)
):
    try:
        ad = Ads(
            adcopy=adcopy,
            imglink=imglink,
            cover_imglink=cover_imglink,
            username=current_user.username,
            productname=productname,
            product_category=product_category
        )
        session.add(ad)
        session.commit()
        session.refresh(ad)

        return {
            "message": "Ad created successfully",
            "status": "success",
            "status_code": 201,
            "ad": {
                "id": ad.id,
                "adcopy": ad.adcopy,
                "imglink": ad.imglink,
                "cover_imglink": ad.cover_imglink,
                "username": ad.username,
                "productname": ad.productname,
                "product_category": ad.product_category
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
    skip: int = 0,
    limit: int = 6
):
    try:
        total = session.exec(select(Ads)).all().__len__()
        statement = select(Ads).offset(skip).limit(limit)
        ads = session.exec(statement).all()
        
        return {
            "message": "Ads retrieved successfully",
            "status": "success",
            "status_code": 200,
            "total": total,
            "page": skip // limit + 1,
            "total_pages": (total + limit - 1) // limit,
            "ads": [
                {
                    "id": ad.id,
                    "adcopy": ad.adcopy,
                    "imglink": ad.imglink,
                    "cover_imglink": ad.cover_imglink,
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

# Add ad_id parameter to upload-image endpoint
@user_router.post("/upload-image/{ad_id}")
async def upload_product_image(
    ad_id: int,
    current_user: Annotated[User, Depends(current_user)],
    file: UploadFile = File(...)
):
    """
    Upload a product image and update the corresponding ad with the image URL
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Get session
        session = next(get_session())
        
        # Get the ad
        ad = session.get(Ads, ad_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")
            
        # Check if user owns the ad
        if ad.username != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to modify this ad")
        
        # Upload the image
        result = await upload_image(file)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        # Update the ad with the image URL
        ad.imglink = result["url"]
        session.add(ad)
        session.commit()
        session.refresh(ad)
            
        return {
            "message": "Image uploaded and ad updated successfully",
            "status": "success", 
            "status_code": 201,
            "data": {
                "url": result["url"],
                "public_id": result["public_id"],
                "ad_id": ad.id
            }
        }
    except Exception as e:
        if 'session' in locals():
            session.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error uploading image: {str(e)}",
                "status": "error",
                "status_code": 500
            }
        )

@user_router.post("/upload-cover-image/{ad_id}")
async def upload_cover_image(
    ad_id: int,
    current_user: Annotated[User, Depends(current_user)],
    file: UploadFile = File(...)
):
    """
    Upload a cover image and update the corresponding ad with the cover image URL
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Get session
        session = next(get_session())
        
        # Get the ad
        ad = session.get(Ads, ad_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")
            
        # Check if user owns the ad
        if ad.username != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to modify this ad")
        
        # Upload the image
        result = await upload_image(file)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        # Update the ad with the cover image URL
        ad.cover_imglink = result["url"]
        session.add(ad)
        session.commit()
        session.refresh(ad)
            
        return {
            "message": "Cover image uploaded and ad updated successfully",
            "status": "success", 
            "status_code": 201,
            "data": {
                "url": result["url"],
                "public_id": result["public_id"],
                "ad_id": ad.id
            }
        }
    except Exception as e:
        if 'session' in locals():
            session.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error uploading cover image: {str(e)}",
                "status": "error",
                "status_code": 500
            }
        )

@user_router.get("/me", response_model=dict)
async def get_current_user(
    current_user: Annotated[User, Depends(current_user)]
):
    """Get information about the currently authenticated user"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_verified": current_user.is_verified
    }