from together import Together
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from typing import List, Optional, Dict
from .models import Campaign, Metrics, User
from .db import get_session

class ChatbotAPI:
    def __init__(self, api_key: str = "9de160c555fb20e06445c4250d235a7785bec3951c5a6a1abd0a824a6737c02a"):
        self.client = Together(api_key=api_key)
        
    async def get_campaign_metrics(self, user_id: int, session: Session) -> str:
        # Fetch all campaigns and their metrics for the user
        query = select(Campaign, Metrics).join(Metrics).where(Campaign.user_id == user_id)
        results = session.exec(query).all()
        
        if not results:
            return "No campaign metrics found for this user."
            
        # Build context about campaigns with non-zero metrics
        campaigns_context = ""
        for campaign, metrics in results:
            # Check if campaign has any non-zero metrics
            has_metrics = any([
                metrics.fb_likes, metrics.fb_reactions, metrics.fb_shares, 
                metrics.fb_comments, metrics.fb_post_clicks,
                metrics.insta_likes, metrics.insta_reactions, metrics.insta_shares,
                metrics.insta_comments, metrics.insta_post_clicks
            ])
            
            if has_metrics:
                campaigns_context += f"\nCampaign: {campaign.name}\n"
                
                # Only include Facebook metrics if there's engagement
                if any([metrics.fb_likes, metrics.fb_reactions, metrics.fb_shares, 
                       metrics.fb_comments, metrics.fb_post_clicks]):
                    campaigns_context += f"Facebook Metrics:\n"
                    campaigns_context += f"- Likes: {metrics.fb_likes}\n"
                    campaigns_context += f"- Reactions: {metrics.fb_reactions}\n"
                    campaigns_context += f"- Shares: {metrics.fb_shares}\n"
                    campaigns_context += f"- Comments: {metrics.fb_comments}\n"
                    campaigns_context += f"- Post Clicks: {metrics.fb_post_clicks}\n"
                
                # Only include Instagram metrics if there's engagement
                if any([metrics.insta_likes, metrics.insta_reactions, metrics.insta_shares,
                       metrics.insta_comments, metrics.insta_post_clicks]):
                    campaigns_context += f"\nInstagram Metrics:\n"
                    campaigns_context += f"- Likes: {metrics.insta_likes}\n"
                    campaigns_context += f"- Reactions: {metrics.insta_reactions}\n"
                    campaigns_context += f"- Shares: {metrics.insta_shares}\n"
                    campaigns_context += f"- Comments: {metrics.insta_comments}\n"
                    campaigns_context += f"- Post Clicks: {metrics.insta_post_clicks}\n"
        
        if not campaigns_context:
            return "No active campaigns with engagement metrics found."
            
        return campaigns_context

    async def get_initial_greeting(self, user_id: int, session: Session) -> str:
        """Generate initial greeting without campaign data context"""
        system_prompt = """You are the Performance Metrics Chatbot for AdPilot, a social media advertising platform. Provide a friendly, brief greeting introducing yourself as the Performance Metrics Chatbot. Mention that you can help with:
1. Analyzing campaign performance metrics
2. Providing insights about social media engagement
3. Answering questions about campaign statistics
4. Offering recommendations for improvement

Keep the greeting concise and welcoming. Do not provide any metrics or data in this greeting."""

        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Please introduce yourself."}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating initial greeting: {str(e)}"
            )

    async def get_response(self, user_id: int, user_message: str, session: Session, is_initial: bool = False) -> Dict[str, str]:
        # If it's the initial message, return only the greeting
        if is_initial:
            greeting = await self.get_initial_greeting(user_id, session)
            return {"response": greeting, "type": "greeting"}

        # For regular queries, get campaign metrics and process the response
        campaign_data = await self.get_campaign_metrics(user_id, session)
        
        system_prompt = """You are the Performance Metrics Chatbot for AdPilot. You help users understand their campaign performance and provide insights about their social media engagement metrics.

When discussing metrics:
- Always mention campaign names explicitly
- If a campaign has no Instagram/Facebook metrics, mention that it's not running on that platform
- Provide context and insights when sharing metrics
- Make suggestions for improvement when relevant
- Be concise but informative in your responses

Here are the current campaign metrics:\n""" + campaign_data

        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            return {"response": response.choices[0].message.content, "type": "response"}
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating chatbot response: {str(e)}"
            )

# Initialize the chatbot
chatbot = ChatbotAPI()