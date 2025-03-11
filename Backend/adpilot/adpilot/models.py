from sqlmodel import SQLModel, Field, Relationship
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, Optional, List
from fastapi import Form
from pydantic import BaseModel
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str 
    last_name: str 
    username: str 
    email: str 
    password: str 
    is_verified: bool = Field(default=False)
    # Add relationship
    campaigns: List["Campaign"] = Relationship(back_populates="user")

class Register_User (BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str
    is_verified: bool = False

class Token (BaseModel):
    access_token: Optional[str] = None
    token_type: str
    refresh_token: Optional[str] = None
    is_verified: bool
    email: str

class TokenData (BaseModel):
        username:str

class RefreshTokenData (BaseModel):
        email:str

class Ads(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    adcopy: str
    imglink: str
    cover_imglink: Optional[str] = None
    username: str
    productname: str
    product_category: str
    campaign: Optional["Campaign"] = Relationship(back_populates="ad")

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    ad_id: int = Field(foreign_key="ads.id")
    name: str
    platform: str  # 'facebook' or 'instagram' or 'both'
    status: str  # 'active', 'paused', 'completed', 'scheduled'
    created_at: str
    scheduled_time: Optional[str] = None
    
    # Facebook specific fields
    fb_id: Optional[str] = None
    fb_post_id: Optional[str] = None
    fb_adset_id: Optional[str] = None
    fb_creative_id: Optional[str] = None
    fb_ad_id: Optional[str] = None
    fb_post_link: Optional[str] = None
    
    # Instagram specific fields
    ig_id: Optional[str] = None
    ig_post_id: Optional[str] = None
    ig_adset_id: Optional[str] = None
    ig_creative_id: Optional[str] = None
    ig_ad_id: Optional[str] = None
    ig_post_link: Optional[str] = None
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="campaigns")
    ad: Optional["Ads"] = Relationship(back_populates="campaign")
    metrics: List["Metrics"] = Relationship(back_populates="campaign")

class Metrics(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    campaign_id: int = Field(foreign_key="campaign.id")
    
    fb_post_clicks: int = Field(default=0)
    fb_likes: int = Field(default=0)
    fb_reactions: int = Field(default=0)
    fb_shares: int = Field(default=0)
    fb_comments: int = Field(default=0)
    
    insta_post_clicks: int = Field(default=0)
    insta_likes: int = Field(default=0)
    insta_reactions: int = Field(default=0)
    insta_shares: int = Field(default=0)
    insta_comments: int = Field(default=0)
    
    campaign: Optional["Campaign"] = Relationship(back_populates="metrics")

class ChatbotRequest(BaseModel):
    text: str
    is_initial: bool = False