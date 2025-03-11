import requests
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import List, Optional, Dict
from .cache_utils import cache_campaign

# Constants
ACCESS_TOKEN = "EAAG9iABBJD8BO92ZCzvllhPvgbTDAdmJ2ZArzFEoAkbLlZAE3tpLbjqtcYWwtjZAUdUj2g90VKpF1E8DFu7fmTnZCAmoNZAAi8ZAdq3PzCZCGwL70zZBkH8Ipya14rjoNm3NHE3Mp9ZBabkeIc7ENmUWZBxOWosxeJaf37cJlreA6MjYGp7AHak5ibWymFBs1ZAJQnqdGwlCFWmZAg8nZBocWC"
ACCOUNT_ID = "647771843892612"
PAGE_ID = "556103107587849"
BASE_URL = "https://graph.facebook.com/v22.0"

async def create_page_post(image_urls: List[str], message: str, scheduled_time: Optional[str] = None) -> Dict:
    """
    Create an Instagram post with optional scheduling
    
    Args:
        image_urls: List of image URLs to post
        message: Post caption/message
        scheduled_time: Optional scheduled time in format YYYY-MM-DDTHH:MM:SS (UTC)
        
    Returns:
        dict: Contains post details including IDs and links
    """
    try:
        # Get Instagram account ID
        ig_account_id = get_instagram_account_id()
        if not ig_account_id:
            raise Exception("Could not find Instagram account connected to this Facebook page")

        # Calculate timestamp if scheduled time is provided
        timestamp = None
        if scheduled_time:
            dt = datetime.strptime(scheduled_time.replace("+0000", ""), "%Y-%m-%dT%H:%M:%S")
            dt = dt.replace(tzinfo=ZoneInfo("UTC"))
            timestamp = int(dt.timestamp())

        # Determine if this is a carousel post
        is_carousel = len(image_urls) > 1

        if is_carousel:
            # Create Instagram carousel post
            child_containers = []
            
            for image_url in image_urls:
                container_url = f"{BASE_URL}/{ig_account_id}/media"
                container_data = {
                    "image_url": image_url,
                    "access_token": ACCESS_TOKEN,
                    "is_carousel_item": True,
                }
                
                response = requests.post(container_url, data=container_data)
                response_data = response.json()
                
                if 'id' in response_data:
                    child_containers.append(response_data['id'])
                else:
                    print("Failed to create carousel item:", response_data)
                    raise Exception(f"Failed to create carousel item: {response_data}")
            
            # Create carousel container
            carousel_url = f"{BASE_URL}/{ig_account_id}/media"
            carousel_data = {
                "media_type": "CAROUSEL",
                "children": ','.join(child_containers),
                "caption": message,
                "access_token": ACCESS_TOKEN,
            }
            
            if timestamp:
                carousel_data["published"] = False
                
            response = requests.post(carousel_url, data=carousel_data)
            container_data = response.json()
            
            if 'id' not in container_data:
                print("Failed to create carousel container:", container_data)
                raise Exception(f"Failed to create carousel container: {container_data}")
                
            container_id = container_data['id']
            
        else:
            # Single image post
            container_url = f"{BASE_URL}/{ig_account_id}/media"
            container_data = {
                "image_url": image_urls[0],
                "caption": message,
                "access_token": ACCESS_TOKEN,
            }
            
            if timestamp:
                container_data["published"] = False
            
            response = requests.post(container_url, data=container_data)
            container_data = response.json()
            print("Container creation response:", container_data)
            
            if 'id' not in container_data:
                print("Failed to create media container:", container_data)
                raise Exception(f"Failed to create media container: {container_data}")
                
            container_id = container_data['id']

        # If scheduled, set publishing time
        if timestamp:
            schedule_url = f"{BASE_URL}/{container_id}"
            schedule_data = {
                "scheduled_publish_time": timestamp,
                "access_token": ACCESS_TOKEN
            }
            schedule_response = requests.post(schedule_url, data=schedule_data)
            if 'success' not in schedule_response.json():
                print("Failed to schedule post:", schedule_response.json())
                raise Exception(f"Failed to schedule post: {schedule_response.json()}")
                
            post_id = container_id
        else:
            # If not scheduled, publish immediately
            publish_url = f"{BASE_URL}/{ig_account_id}/media_publish"
            publish_data = {
                "creation_id": container_id,
                "access_token": ACCESS_TOKEN
            }
            
            publish_response = requests.post(publish_url, data=publish_data)
            publish_data = publish_response.json()
            print("Publish response:", publish_data)
            
            if 'id' not in publish_data:
                print("Failed to publish media:", publish_data)
                raise Exception(f"Failed to publish media: {publish_data}")
                
            post_id = publish_data['id']

        # Generate post link
        post_link = f"https://instagram.com/p/{post_id}"

        # Return success response without creating ad campaign
        return {
            "success": True,
            "post_id": post_id,
            "campaign_id": "",  # Empty since we're not creating a campaign
            "adset_id": "",    # Empty since we're not creating an ad set
            "creative_id": "", # Empty since we're not creating a creative
            "ad_id": "",      # Empty since we're not creating an ad
            "post_link": post_link,
            "platform": "instagram",
            "status": "scheduled" if timestamp else "active",
            "scheduled_time": scheduled_time
        }

    except Exception as e:
        print(f"Error in create_page_post: {str(e)}")
        raise

# Get Instagram Account ID
def get_instagram_account_id():
    """Get Instagram account ID connected to the Facebook page"""
    try:
        url = f"{BASE_URL}/{PAGE_ID}?fields=instagram_business_account&access_token={ACCESS_TOKEN}"
        print(f"Fetching Instagram account ID. URL: {url}")
        
        response = requests.get(url)
        data = response.json()
        print("Instagram Business Account Response:", data)
        
        if 'error' in data:
            print(f"Error in Instagram account fetch: {data['error']}")
            raise Exception(f"Facebook API error: {data['error'].get('message', 'Unknown error')}")
            
        if 'instagram_business_account' in data and 'id' in data['instagram_business_account']:
            ig_account_id = data['instagram_business_account']['id']
            print(f"Successfully got Instagram account ID: {ig_account_id}")
            return ig_account_id
        else:
            print("Error: Could not find Instagram account connected to this Facebook page.")
            print("Response data:", data)
            raise Exception("No Instagram business account found connected to this Facebook page")
            
    except requests.RequestException as e:
        print(f"Network error getting Instagram account ID: {str(e)}")
        raise Exception(f"Network error: {str(e)}")
    except Exception as e:
        print(f"Error getting Instagram account ID: {str(e)}")
        raise

def create_campaign():
    """Create a new campaign for Instagram ad"""
    try:
        campaign_url = f"{BASE_URL}/act_{ACCOUNT_ID}/campaigns"
        campaign_data = {
            "name": "[TEST] Instagram Product Campaign",
            "objective": "OUTCOME_AWARENESS",
            "status": "PAUSED",
            "special_ad_categories": "NONE",
            "access_token": ACCESS_TOKEN,
        }
        response = requests.post(campaign_url, data=campaign_data)
        campaign_data = response.json()
        print("Campaign Response:", campaign_data)
        return campaign_data.get('id', None)
    except Exception as e:
        print(f"Error creating campaign: {str(e)}")
        return None

def create_adset(campaign_id, start_time=None):
    """Create an ad set for the Instagram campaign"""
    try:
        adset_url = f"{BASE_URL}/act_{ACCOUNT_ID}/adsets"
        
        end_time = None
        if start_time:
            # Remove the +0000 from the input time
            cleaned_time = start_time.replace("+0000", "")
            
            # Parse the time and set Pakistan timezone
            pk_tz = ZoneInfo("Asia/Karachi")
            dt = datetime.strptime(cleaned_time, "%Y-%m-%dT%H:%M:%S")
            dt = dt.replace(tzinfo=pk_tz)
            
            # Convert to UTC for the API
            dt_utc = dt.astimezone(ZoneInfo("UTC"))
            end_dt_utc = dt_utc + timedelta(days=365)  # 1 year duration
            
            # Format times for the API
            start_time = dt_utc.strftime("%Y-%m-%dT%H:%M:%S+0000")
            end_time = end_dt_utc.strftime("%Y-%m-%dT%H:%M:%S+0000")

        adset_data = {
            "name": "[TEST] Instagram Product Ad Set",
            "campaign_id": campaign_id,
            "daily_budget": 30000,
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "REACH",
            "bid_amount": 500,
            "targeting": json.dumps({
                "age_min": 18,
                "age_max": 65,
                "geo_locations": {
                    "countries": ["US"]
                },
                "instagram_positions": ["stream", "story", "explore"]
            }),
            "status": "PAUSED",
            "start_time": start_time,
            "end_time": end_time,
            "access_token": ACCESS_TOKEN
        }

        # Remove None values
        adset_data = {k: v for k, v in adset_data.items() if v is not None}

        response = requests.post(adset_url, data=adset_data)
        adset_data = response.json()
        print("Ad Set Response:", adset_data)
        return adset_data.get('id', None)
    except Exception as e:
        print(f"Error creating ad set: {str(e)}")
        return None

def create_ad(adset_id, post_id):
    """Create an Instagram ad directly using the post ID"""
    try:
        ad_url = f"{BASE_URL}/act_{ACCOUNT_ID}/ads"
        ad_data = {
            "name": "[TEST] Instagram Product Ad",
            "adset_id": adset_id,
            "creative": json.dumps({
                "object_story_id": post_id  # Use object_story_id instead of instagram_actor_id
            }),
            "status": "PAUSED",
            "access_token": ACCESS_TOKEN
        }
        response = requests.post(ad_url, data=ad_data)
        ad_data = response.json()
        print("Ad Response:", ad_data)
        return ad_data.get('id', None)
    except Exception as e:
        print(f"Error creating ad: {str(e)}")
        return None