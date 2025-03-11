from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, Annotated, Dict, List
from adpilot.llama_utils import llama_api
from adpilot.marketinsights import analyze_data
from fastapi.responses import StreamingResponse
from adpilot.pdf_utils import create_market_analysis_pdf
from adpilot.cache_utils import cache_report, get_latest_report
from adpilot.adllama_utils import adllama_api  
from adpilot.auth import current_user
from adpilot.models import User
from adpilot.imaggen import generate_image
import base64
import time
import os
from ..analytics import get_analytics_data
from sqlmodel import Session
from ..db import get_session
from ..chatbot import chatbot
from ..FBpostschedule import create_facebook_ad
from datetime import datetime
from ..models import User, Campaign, Metrics, Ads  # Added Ads import
from ..instgram_schedule_post import create_page_post as create_instagram_post

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

class ImagePromptRequest(BaseModel):
    ad_content: str = Field(..., description="Advertisement content to base the image prompt on")
    style: Optional[str] = Field(default="digital art", description="Desired style of the image")
    mood: Optional[str] = Field(default="professional", description="Desired mood of the image")

class GenerateImageResponse(BaseModel):
    prompt: str
    image_url: str

class ChatbotRequest(BaseModel):
    text: str
    is_initial: bool = False

class FacebookAdBaseRequest(BaseModel):
    """Base request model for Facebook ads"""
    message: str = Field(..., description="The ad copy/message to post")
    image_urls: List[str] = Field(..., min_items=1, max_items=2, description="List of image URLs to post (1-2 images)")
    ad_id: int = Field(..., description="ID of the existing ad to use")

class FacebookScheduledAdRequest(FacebookAdBaseRequest):
    """Request model for scheduling Facebook ads"""
    scheduled_time: str = Field(..., description="Scheduled time in format YYYY-MM-DDTHH:MM:SS (UTC)")

class FacebookAdResponse(BaseModel):
    """Response model for Facebook ad creation"""
    success: bool
    post_id: str
    campaign_id: str
    adset_id: str
    creative_id: str
    ad_id: str
    post_link: str
    scheduled_time: Optional[str]

class InstagramAdBaseRequest(BaseModel):
    """Base request model for Instagram ads"""
    message: str = Field(..., description="The ad copy/message to post")
    image_urls: List[str] = Field(..., min_items=1, max_items=2, description="List of image URLs to post (1-2 images)")
    ad_id: int = Field(..., description="ID of the existing ad to use")

class InstagramScheduledAdRequest(InstagramAdBaseRequest):
    """Request model for scheduling Instagram ads"""
    scheduled_time: str = Field(..., description="Scheduled time in format YYYY-MM-DDTHH:MM:SS (UTC)")

class InstagramAdResponse(BaseModel):
    """Response model for Instagram ad creation"""
    success: bool
    post_id: str
    campaign_id: str
    adset_id: str
    creative_id: str
    ad_id: str
    post_link: str
    scheduled_time: Optional[str]

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
    current_user: Annotated[User, Depends(current_user)]
):
    """Generate a concise advertisement for a product"""
    try:
        prompt = (
            f"Generate a concise 100-word advertisement for the following product:\n"
            f"Product: {request.product}\n"
            f"Description: {request.description}\n"
            f"Category: {request.category}\n\n"
            f"Make it attention-grabbing, highlight key benefits, and include a clear call-to-action."
        )
        
        response = await adllama_api.generate_content(prompt=prompt)
        return {"content": response}

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

@content_router.post("/generate-combined-image", response_model=GenerateImageResponse)
async def generate_combined_image(
    request: ImagePromptRequest,
    current_user: Annotated[User, Depends(current_user)]
):
    """Generate an image prompt and then use it to generate an image"""
    try:
        # Generate the prompt
        prompt = (
            f"Create a captivating and professional advertisement scene that focuses on: {request.ad_content}\n"
            f"Style: {request.style}\n"
            f"Mood: {request.mood}\n"
            f"Make sure to create a cohesive scene that effectively communicates the product's value proposition."
        )
        
        prompt_response = await llama_api.generate_content(prompt=prompt)
        
        # Generate the image using the prompt
        try:
            image_data = generate_image(prompt_response)
            
            # Save the image
            filename = f"generated_image_{current_user.id}_{int(time.time())}.png"
            filepath = f"./generated_images/{filename}"
            
            # Ensure directory exists
            os.makedirs("./generated_images", exist_ok=True)
            
            with open(filepath, 'wb') as f:
                f.write(image_data)
                
            # Return both the prompt and image URL
            return GenerateImageResponse(
                prompt=prompt_response,
                image_url=f"/generated_images/{filename}"
            )
            
        except Exception as image_error:
            raise HTTPException(
                status_code=500,
                detail=f"Image generation failed: {str(image_error)}"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Process failed: {str(e)}"
        )

@content_router.get("/analytics/{user_id}")
async def get_user_analytics(user_id: int, current_user: Annotated[User, Depends(current_user)]):
    """Get analytics data for a user's campaigns"""
    # Verify user has access to requested data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        analytics_data = get_analytics_data(user_id)
        return analytics_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@content_router.post("/chatbot")
async def get_chatbot_response(
    request: ChatbotRequest,
    current_user: Annotated[User, Depends(current_user)],
    session: Session = Depends(get_session)
):
    """
    Get a response from the chatbot about campaign metrics.
    
    To get initial greeting:
    ```
    {
        "text": "",
        "is_initial": true
    }
    ```
    
    To ask questions about metrics:
    ```
    {
        "text": "What are my campaign metrics?",
        "is_initial": false
    }
    ```
    """
    if not request.is_initial and not request.text:
        raise HTTPException(
            status_code=400,
            detail="Message text is required for non-initial messages"
        )
        
    response = await chatbot.get_response(
        user_id=current_user.id,
        user_message=request.text,
        session=session,
        is_initial=request.is_initial
    )
    
    return response

@content_router.post("/facebook-ad/post-now", response_model=FacebookAdResponse)
async def post_facebook_ad_now(
    request: FacebookAdBaseRequest,
    current_user: Annotated[User, Depends(current_user)],
    session: Session = Depends(get_session)
):
    """
    Create and post a Facebook advertisement immediately.
    - Accepts 1-2 images
    - Posts the ad right away
    """
    try:
        # Get existing ad
        ad = session.query(Ads).filter(Ads.id == request.ad_id).first()
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")
            
        if ad.username != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to use this ad")

        # Create the Facebook ad
        result = await create_facebook_ad(
            image_urls=request.image_urls,
            message=request.message,
            scheduled_time=None  # Explicitly set to None for immediate posting
        )
        
        # Create Campaign record in database with the existing ad_id
        campaign = Campaign(
            user_id=current_user.id,
            ad_id=ad.id,  # Use existing ad ID
            fb_id=result["campaign_id"],
            fb_post_id=result["post_id"],
            fb_adset_id=result["adset_id"],
            fb_creative_id=result["creative_id"],
            fb_ad_id=result["ad_id"],
            fb_post_link=result["post_link"],
            name=f"FB Campaign {result['campaign_id']}",
            platform="facebook",  # Set the platform explicitly
            status="active",
            created_at=datetime.utcnow().isoformat()
        )
        
        session.add(campaign)
        session.flush()
        
        # Create initial Metrics record
        metrics = Metrics(
            user_id=current_user.id,
            campaign_id=campaign.id
        )
        session.add(metrics)
        
        # Update existing ad with any new information
        ad.imglink = request.image_urls[0]
        if len(request.image_urls) > 1:
            ad.cover_imglink = request.image_urls[1]
        
        # Commit all changes
        session.commit()
        
        return result
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Facebook ad: {str(e)}"
        )

@content_router.post("/facebook-ad/schedule", response_model=FacebookAdResponse)
async def schedule_facebook_ad(
    request: FacebookScheduledAdRequest,
    current_user: Annotated[User, Depends(current_user)],
    session: Session = Depends(get_session)
):
    """
    Schedule a Facebook advertisement for future posting.
    - Uses existing ad record
    - Accepts 1-2 images
    - Scheduled time must be at least 20 minutes in the future
    - Time format: YYYY-MM-DDTHH:MM:SS (UTC)
    """
    try:
        # Get existing ad
        ad = session.query(Ads).filter(Ads.id == request.ad_id).first()
        if not ad:
            raise HTTPException(
                status_code=404,
                detail=f"Ad with id {request.ad_id} not found"
            )

        result = await create_facebook_ad(
            image_urls=request.image_urls,
            message=request.message,
            scheduled_time=request.scheduled_time
        )
        
        # Create Campaign record with existing ad ID
        campaign = Campaign(
            user_id=current_user.id,
            ad_id=ad.id,  # Use existing ad ID
            fb_id=result["campaign_id"],
            fb_post_id=result["post_id"],
            fb_adset_id=result["adset_id"],
            fb_creative_id=result["creative_id"],
            fb_ad_id=result["ad_id"],
            fb_post_link=result["post_link"],
            name=f"FB Campaign {result['campaign_id']}",
            platform="facebook",  # Set the platform explicitly
            status="scheduled",
            created_at=datetime.utcnow().isoformat(),
            scheduled_time=request.scheduled_time
        )
        
        session.add(campaign)
        session.flush()
        
        # Create initial Metrics record
        metrics = Metrics(
            user_id=current_user.id,
            campaign_id=campaign.id
        )
        session.add(metrics)
        session.commit()
        
        return result
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule Facebook ad: {str(e)}"
        )

@content_router.post("/instagram-ad/post-now", response_model=InstagramAdResponse)
async def post_instagram_ad_now(
    request: InstagramAdBaseRequest,
    current_user: Annotated[User, Depends(current_user)],
    session: Session = Depends(get_session)
):
    """
    Create and post an Instagram advertisement immediately.
    - Accepts 1-2 images
    - Posts the ad right away
    """
    try:
        # Get existing ad
        ad = session.query(Ads).filter(Ads.id == request.ad_id).first()
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")
            
        if ad.username != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to use this ad")

        # Create the Instagram post
        result = await create_instagram_post(
            image_urls=request.image_urls,
            message=request.message,
            scheduled_time=None  # Explicitly set to None for immediate posting
        )
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to create Instagram post"
            )
        
        # Create Campaign record with Instagram-specific fields
        campaign = Campaign(
            user_id=current_user.id,
            ad_id=ad.id,
            name=f"IG Campaign {result['post_id']}",
            platform="instagram",
            status="active",
            created_at=datetime.utcnow().isoformat(),
            # Instagram specific fields
            ig_post_id=result["post_id"],
            ig_post_link=result["post_link"]
        )
        
        session.add(campaign)
        session.flush()
        
        # Create initial Metrics record
        metrics = Metrics(
            user_id=current_user.id,
            campaign_id=campaign.id
        )
        session.add(metrics)
        
        # Update existing ad with any new information
        ad.imglink = request.image_urls[0]
        if len(request.image_urls) > 1:
            ad.cover_imglink = request.image_urls[1]
        
        # Commit changes
        session.commit()
        
        return InstagramAdResponse(
            success=True,
            post_id=result["post_id"],
            campaign_id="",  # These fields are empty since we're not creating ads
            adset_id="",
            creative_id="",
            ad_id="",
            post_link=result["post_link"],
            scheduled_time=None
        )
        
    except Exception as e:
        session.rollback()
        print(f"Error in post_instagram_ad_now: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@content_router.post("/instagram-ad/schedule", response_model=InstagramAdResponse)
async def schedule_instagram_ad(
    request: InstagramScheduledAdRequest,
    current_user: Annotated[User, Depends(current_user)],
    session: Session = Depends(get_session)
):
    """
    Schedule an Instagram advertisement for future posting.
    - Uses existing ad record
    - Accepts 1-2 images
    - Scheduled time must be at least 20 minutes in the future
    - Time format: YYYY-MM-DDTHH:MM:SS (UTC)
    """
    try:
        # Get existing ad
        ad = session.query(Ads).filter(Ads.id == request.ad_id).first()
        if not ad:
            raise HTTPException(
                status_code=404,
                detail=f"Ad with id {request.ad_id} not found"
            )
            
        if ad.username != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to use this ad")

        # Create the Instagram post with scheduling
        result = await create_instagram_post(
            image_urls=request.image_urls,
            message=request.message,
            scheduled_time=request.scheduled_time
        )
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to schedule Instagram post"
            )
        
        # Create Campaign record with Instagram-specific fields
        campaign = Campaign(
            user_id=current_user.id,
            ad_id=ad.id,
            name=f"IG Campaign {result['post_id']}",
            platform="instagram",
            status="scheduled",
            created_at=datetime.utcnow().isoformat(),
            scheduled_time=request.scheduled_time,
            # Instagram specific fields
            ig_post_id=result["post_id"],
            ig_post_link=result["post_link"]
        )
        
        session.add(campaign)
        session.flush()
        
        # Create initial Metrics record
        metrics = Metrics(
            user_id=current_user.id,
            campaign_id=campaign.id
        )
        session.add(metrics)
        
        # Update existing ad with any new information
        ad.imglink = request.image_urls[0]
        if len(request.image_urls) > 1:
            ad.cover_imglink = request.image_urls[1]
        
        session.commit()
        
        return InstagramAdResponse(
            success=True,
            post_id=result["post_id"],
            campaign_id="",
            adset_id="",
            creative_id="",
            ad_id="",
            post_link=result["post_link"],
            scheduled_time=request.scheduled_time
        )
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule Instagram post: {str(e)}"
        )


