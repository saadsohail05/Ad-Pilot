from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from adpilot.llama_utils import llama_api
from adpilot.marketinsights import analyze_data

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

class MarketAnalysisRequest(BaseModel):
    product: str
    category: str
    description: str

class MarketAnalysisDetailRequest(BaseModel):
    product: str = Field(..., min_length=1, description="Name of the product")
    product_type: str = Field(..., min_length=1, description="Type/category of the product")
    category: str = Field(..., min_length=1, description="Market category")
    description: str = Field(..., min_length=10, description="Detailed product description")

    class Config:
        schema_extra = {
            "example": {
                "product": "Smart Water Bottle",
                "product_type": "IoT Device",
                "category": "Health Tech",
                "description": "A smart water bottle that tracks hydration levels and syncs with mobile apps"
            }
        }

content_router = APIRouter(
    prefix="/content",
    tags=["content"],
    responses={404: {"description": "Not found"}},
)

@content_router.post("/generate")
async def generate_content(request: GenerateRequest):
    """Generate content using the Llama model"""
    try:
        response = await llama_api.generate_content(
            prompt=request.prompt,
            model=request.model
        )
        return {"generated_content": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@content_router.post("/generate-ad")
async def generate_ad_content(request: AdGenerateRequest):
    """Generate ad content using the Llama model"""
    try:
        prompt = f"""Create a {request.length} advertisement for {request.platform} with a {request.tone} tone.
Product: {request.product_name}
Description: {request.product_description}
Target Audience: {request.target_audience}"""
        
        response = await llama_api.generate_content(
            prompt=prompt,
            model="llama3.2"
        )
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

@content_router.post("/analyze-market")
async def analyze_market_comprehensive(request: MarketAnalysisDetailRequest):
    """Generate comprehensive market analysis using both Serper and LLaMA"""
    try:
        market_insights, competitor_analysis = analyze_data(
            request.product,
            request.category,
            request.description
        )

        analysis_prompt = (
            f"You are an expert business analyst. Provide a comprehensive market analysis and competitor strategy report "
            f"for the following product:\n\n"
            f"PRODUCT DETAILS:\n"
            f"- Name: {request.product}\n"
            f"- Type: {request.product_type}\n"
            f"- Category: {request.category}\n"
            f"- Description: {request.description}\n\n"
            f"MARKET RESEARCH DATA:\n{market_insights}\n\n"
            f"COMPETITOR DATA:\n{competitor_analysis}\n\n"
            f"Generate a detailed, actionable report with the following sections. For each section, provide at least 3-4 paragraphs "
            f"of detailed analysis and specific examples:\n\n"
            f"1. MARKET OVERVIEW\n"
            f"- Current market size and growth potential\n"
            f"- Major market segments\n"
            f"- Regional market dynamics\n\n"
            f"2. KEY TRENDS\n"
            f"- Technology trends\n"
            f"- Consumer behavior shifts\n"
            f"- Regulatory impacts\n\n"
            f"3. COMPETITOR LANDSCAPE\n"
            f"- Major competitors and their market share\n"
            f"- Competitive advantages and weaknesses\n"
            f"- Market positioning strategies\n\n"
            f"4. STRATEGIC RECOMMENDATIONS\n"
            f"- Product positioning\n"
            f"- Marketing strategy\n"
            f"- Distribution channels\n\n"
            f"5. RISKS AND MITIGATION\n"
            f"- Market risks\n"
            f"- Competitive risks\n"
            f"- Operational risks\n"
            f"- Mitigation strategies\n\n"
            f"Provide specific, actionable insights for each section. Include data points and examples where relevant."
        )

        llama_response = await llama_api.generate_content(
            prompt=analysis_prompt,
            model="llama3.2"
        )

        return {
            "status": "success",
            "analysis_report": llama_response,
            "metadata": {
                "product": request.product,
                "category": request.category,
                "product_type": request.product_type
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis generation failed: {str(e)}"
        )

