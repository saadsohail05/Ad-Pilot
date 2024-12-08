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

class ContentCacheRequest(BaseModel):
    content: str

class ContentDownloadRequest(BaseModel):
    content: str
    metadata: dict

content_router = APIRouter(
    prefix="/content",
    tags=["content"],
    responses={404: {"description": "Not found"}},
)

@content_router.post("/analyze-market")
async def analyze_market_comprehensive(
    request: MarketAnalysisDetailRequest,
    current_user: Annotated[User, Depends(current_user)]
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
            f"Format your response using simple markdown with the following structure:\n\n"
            f"# Market Overview\n\n"
            f"## Market Size & Growth\n"
            f"* Current Size: [specific market size]\n"
            f"* Growth Rate: [CAGR and projections]\n"
            f"* Market Value: [current and projected values]\n\n"
            f"## Market Segments\n"
            f"* Primary Segment: [details with percentage share]\n"
            f"* Secondary Segment: [details with percentage share]\n"
            f"* Emerging Segment: [growth potential]\n\n"
            f"# Key Market Trends\n\n"
            f"## Technology Trends\n"
            f"* Leading Tech: [specific details]\n"
            f"* Innovation: [new developments]\n"
            f"* Future Tech: [emerging technologies]\n\n"
            f"## Consumer Behavior\n"
            f"* Preferences: [key consumer preferences]\n"
            f"* Buying Patterns: [purchase behavior]\n"
            f"* Demographics: [target market details]\n\n"
            f"# Competitive Landscape\n\n"
            f"## Major Players\n"
            f"* Market Leader: [name and market share]\n"
            f"* Key Competitor: [strengths and position]\n"
            f"* Emerging Player: [unique advantages]\n\n"
            f"# Strategic Recommendations\n\n"
            f"## Market Entry\n"
            f"* Positioning: [specific strategy]\n"
            f"* Target Market: [primary focus]\n"
            f"* USP: [unique selling points]\n\n"
            f"# Risk Analysis\n\n"
            f"## Key Risks\n"
            f"* Market Risks: [specific challenges]\n"
            f"* Competition: [competitive threats]\n"
            f"* Mitigation: [strategic solutions]"
        )

        return StreamingResponse(
            llama_api.generate_content_stream(
                prompt=analysis_prompt,
                model="llama3.2"
            ),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis generation failed: {str(e)}"
        )

@content_router.post("/download-report")
async def download_report(
    request: ContentDownloadRequest,
    current_user: Annotated[User, Depends(current_user)]
):
    """Generate and download PDF report from provided content"""
    try:
        report_data = {
            'metadata': request.metadata,
            'analysis_report': request.content
        }
        
        # Generate PDF directly from provided content
        pdf_buffer = create_market_analysis_pdf(report_data)
        
        product_name = request.metadata.get("product", "report")
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

@content_router.post("/cache-content")
async def cache_content(
    request: ContentCacheRequest,
    current_user: Annotated[User, Depends(current_user)]
):
    """Cache the content received from frontend"""
    try:
        report_data = {
            'metadata': {
                'product': 'Latest Report',
                'category': 'Market Analysis',
                'product_type': 'Analysis Report'
            },
            'analysis_report': request.content
        }
        cache_report(report_data)
        return {"status": "success", "message": "Content cached successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cache content: {str(e)}"
        )


