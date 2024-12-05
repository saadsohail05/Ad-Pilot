from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from adpilot.llama_utils import llama_api

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama3.2"

class AdGenerateRequest(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    tone: Optional[str] = "professional"
    platform: Optional[str] = "facebook"
    length: Optional[str] = "medium"

content_router = APIRouter(
    prefix="/content",
    tags=["content"],
    responses={404: {"description": "Not found"}},
)

@content_router.post("/generate")
async def generate_content(request: GenerateRequest):
    """
    Generate content using the Llama model
    """
    try:
        response = await llama_api.generate_content(
            prompt=request.prompt,
            model=request.model
        )  # Added closing parenthesis
        return {"generated_content": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@content_router.post("/generate-ad")
async def generate_ad_content(request: AdGenerateRequest):
    """
    Generate ad content using the Llama model
    """
    try:
        prompt = f"""Create a {request.length} advertisement for {request.platform} with a {request.tone} tone.
        Product: {request.product_name}
        Description: {request.product_description}
        Target Audience: {request.target_audience}"""  # Removed extra newlines and fixed formatting
        
        response = await llama_api.generate_content(
            prompt=prompt,
            model="llama3.2"
        )  # Added closing parenthesis
        
        return {
            "status": "success",
            "platform": request.platform,
            "generated_content": response,
            "metadata": {
                "tone": request.tone,
                "length": request.length,
                "target_audience": request.target_audience
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))