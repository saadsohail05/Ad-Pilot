import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from starlette.config import Config

try:
    config = Config(".env")
except FileNotFoundError:
    config = Config()

def validate_cloudinary_config():
    try:
        cloud_name = config("CLOUDINARY_CLOUD_NAME")
        api_key = config("CLOUDINARY_API_KEY")
        api_secret = config("CLOUDINARY_API_SECRET")
        
        # Configure Cloudinary with the environment variables
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary credentials not properly configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
        )

async def upload_image(file: UploadFile) -> dict:
    """
    Upload an image to Cloudinary and return the upload result
    """
    try:
        # Validate configuration before attempting upload
        validate_cloudinary_config()
        
        # Read file content
        contents = await file.read()
        
        # Upload to cloudinary
        upload_result = cloudinary.uploader.upload(contents)
        
        if not upload_result.get("secure_url"):
            raise Exception("Failed to get secure URL from Cloudinary")
            
        return {
            "status": "success",
            "url": upload_result.get("secure_url"),
            "public_id": upload_result.get("public_id")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }