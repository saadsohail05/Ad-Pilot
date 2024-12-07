from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, Annotated
from adpilot.llama_utils import llama_api
from adpilot.marketinsights import analyze_data
from fastapi.responses import StreamingResponse
from adpilot.pdf_utils import create_market_analysis_pdf
from adpilot.cache_utils import cache_report, get_latest_report
from adpilot.adllama_utils import adllama_api  
from adpilot.auth import current_user
from adpilot.models import User

class MarketAnalysisDetailRequest(BaseModel):
    product: str = Field(..., min_length=1, description="Name of the product")
    product_type: str = Field(..., min_length=1, description="Type/category of the product")
    category: str = Field(..., min_length=1, description="Market category")
    description: str = Field(..., min_length=10, description="Detailed product description")

class AdGenerationRequest(BaseModel):
    product: str = Field(..., description="Name of the product")
    description: str = Field(..., description="Detailed product description")
    category: str = Field(..., description="Product category")

content_router = APIRouter(
    prefix="/content",
    tags=["content"],
    responses={404: {"description": "Not found"}},
)

@content_router.post("/analyze-market")
async def analyze_market_comprehensive(
    request: MarketAnalysisDetailRequest,
    current_user: Annotated[User, Depends(current_user)]  # Add this line
):
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

        response_data = {
            "status": "success",
            "analysis_report": llama_response,
            "metadata": {
                "product": request.product,
                "category": request.category,
                "product_type": request.product_type
            }
        }

        # Cache only the latest report
        cache_report(response_data)

        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis generation failed: {str(e)}"
        )

@content_router.get("/download-latest-report")
async def download_latest_report(
    current_user: Annotated[User, Depends(current_user)]  # Add this line
):
    """Download the most recently generated market analysis report as PDF"""
    try:
        # Get latest report from cache
        report_data = get_latest_report()
        if not report_data:
            raise HTTPException(
                status_code=404, 
                detail="No recent report found. Please generate a new report first."
            )
        
        # Generate PDF from report
        pdf_buffer = create_market_analysis_pdf(report_data)
        
        product_name = report_data.get("metadata", {}).get("product", "report")
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                'Content-Disposition': f'attachment; filename="market_analysis_{product_name}.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )

@content_router.post("/generate-ad")
async def generate_advertisement(
    request: AdGenerationRequest,
    current_user: Annotated[User, Depends(current_user)]  # Add this line
):
    """Generate a concise advertisement for a product"""
    try:
        prompt = {
            "role": "user",
            "content": f"Generate a concise 100-word advertisement for the following product:\n"
                      f"Product: {request.product}\n"
                      f"Description: {request.description}\n"
                      f"Category: {request.category}"
        }

        ad_content = await adllama_api.generate_content(prompt=prompt["content"])

        return {
            "status": "success",
            "advertisement": ad_content,
            "metadata": {
                "product": request.product,
                "category": request.category
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Advertisement generation failed: {str(e)}"
        )


