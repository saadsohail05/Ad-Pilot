import requests
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Constants
ACCESS_TOKEN = "EAAG9iABBJD8BO92ZCzvllhPvgbTDAdmJ2ZArzFEoAkbLlZAE3tpLbjqtcYWwtjZAUdUj2g90VKpF1E8DFu7fmTnZCAmoNZAAi8ZAdq3PzCZCGwL70zZBkH8Ipya14rjoNm3NHE3Mp9ZBabkeIc7ENmUWZBxOWosxeJaf37cJlreA6MjYGp7AHak5ibWymFBs1ZAJQnqdGwlCFWmZAg8nZBocWC"
ACCOUNT_ID = "647771843892612"
PAGE_ID = "556103107587849"
BASE_URL = "https://graph.facebook.com/v22.0"

def validate_schedule_time(scheduled_time: str | None) -> tuple[bool, str | None]:
    """
    Validate the scheduled time:
    - If None, return (True, None) for immediate posting
    - If provided, ensure it's at least 20 minutes in the future
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not scheduled_time:
        return True, None
        
    try:
        # Parse the UTC time
        schedule_dt = datetime.strptime(scheduled_time.replace("+0000", ""), "%Y-%m-%dT%H:%M:%S")
        schedule_dt = schedule_dt.replace(tzinfo=ZoneInfo("UTC"))
        
        # Get current time in UTC
        now = datetime.now(ZoneInfo("UTC"))
        
        # Check if scheduled time is at least 20 minutes in the future
        min_schedule_time = now + timedelta(minutes=20)
        
        if schedule_dt < min_schedule_time:
            return False, f"Scheduled time must be at least 20 minutes in the future (after {min_schedule_time.strftime('%Y-%m-%dT%H:%M:%S')} UTC)"
            
        return True, None
        
    except ValueError as e:
        return False, f"Invalid datetime format: {str(e)}"

async def create_facebook_ad(image_urls: list[str], message: str, scheduled_time: str = None):
    """
    Create a complete Facebook ad with optional scheduling
    
    Args:
        image_urls: List of image URLs to post
        message: Ad copy text
        scheduled_time: Optional scheduled time in format YYYY-MM-DDTHH:MM:SS (UTC)
        
    Returns:
        dict: Dictionary containing post_id, campaign_id, adset_id, creative_id, ad_id
    """
    try:
        # Validate schedule time if provided
        is_valid, error_message = validate_schedule_time(scheduled_time)
        if not is_valid:
            raise Exception(error_message)

        # Step 1: Create the page post
        post_id = create_page_post(image_urls, message, scheduled_time)
        if not post_id:
            raise Exception("Failed to create page post")

        # Step 2: Create campaign
        campaign_id = create_campaign()
        if not campaign_id:
            raise Exception("Failed to create campaign")

        # Step 3: Create ad set
        adset_id = create_adset(campaign_id, scheduled_time)
        if not adset_id:
            raise Exception("Failed to create ad set")

        # Step 4: Create ad creative
        creative_id = create_ad_creative(post_id)
        if not creative_id:
            raise Exception("Failed to create ad creative")

        # Step 5: Create ad
        ad_id = create_ad(adset_id, creative_id)
        if not ad_id:
            raise Exception("Failed to create ad")

        # Calculate post link
        post_link = f"https://facebook.com/{post_id}"

        return {
            "success": True,
            "post_id": post_id,
            "campaign_id": campaign_id,
            "adset_id": adset_id,
            "creative_id": creative_id,
            "ad_id": ad_id,
            "post_link": post_link,
            "scheduled_time": scheduled_time
        }

    except Exception as e:
        raise Exception(f"Failed to create Facebook ad: {str(e)}")

def create_page_post(image_urls: list[str], message: str, scheduled_time: str = None):
    """Create a Facebook page post with images"""
    timestamp = None
    if scheduled_time:
        # Parse the UTC time
        dt = datetime.strptime(scheduled_time.replace("+0000", ""), "%Y-%m-%dT%H:%M:%S")
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
        timestamp = int(dt.timestamp())

    # Prepare the attached_media array for multiple images
    attached_media = []
    
    # First, upload each photo and get their IDs
    for image_url in image_urls:
        photo_url = f"{BASE_URL}/{PAGE_ID}/photos"
        photo_data = {
            "url": image_url,
            "published": False,
            "access_token": ACCESS_TOKEN,
        }
        
        response = requests.post(photo_url, data=photo_data)
        photo_response = response.json()
        
        if 'id' in photo_response:
            attached_media.append({"media_fbid": photo_response['id']})
        else:
            raise Exception(f"Failed to upload photo: {image_url}")

    # Create the post with all photos
    post_data = {
        "message": message,
        "access_token": ACCESS_TOKEN,
        "attached_media": json.dumps(attached_media)
    }

    if timestamp:
        post_data["scheduled_publish_time"] = timestamp
        post_data["published"] = False
    
    response = requests.post(f"{BASE_URL}/{PAGE_ID}/feed", data=post_data)
    post_data = response.json()
    
    if 'id' in post_data:
        return post_data['id']
    raise Exception(f"Failed to create post: {post_data.get('error', {}).get('message', 'Unknown error')}")

# Step 2: Create Campaign
def create_campaign():
    campaign_url = f"{BASE_URL}/act_{ACCOUNT_ID}/campaigns"
    campaign_data = {
        "name": "[TEST] Product Campaign",
        "objective": "OUTCOME_AWARENESS",  # Changed to OUTCOME_AWARENESS (REACH)
        "status": "PAUSED",
        "special_ad_categories": "NONE",
        "access_token": ACCESS_TOKEN,
    }
    response = requests.post(campaign_url, data=campaign_data)
    campaign_data = response.json()
    print("Campaign Response:", campaign_data)
    return campaign_data.get('id', None)

# Step 3: Create Ad Set
def create_adset(campaign_id, start_time=None):
    adset_url = f"{BASE_URL}/act_{ACCOUNT_ID}/adsets"
    
    # Calculate end time (1 year from start time)
    end_time = None
    if start_time:
        from datetime import datetime
        from dateutil.relativedelta import relativedelta
        from zoneinfo import ZoneInfo

        # Remove the +0000 from the input time
        cleaned_time = start_time.replace("+0000", "")
        
        # Parse the time and set Pakistan timezone
        pk_tz = ZoneInfo("Asia/Karachi")
        dt = datetime.strptime(cleaned_time, "%Y-%m-%dT%H:%M:%S")
        dt = dt.replace(tzinfo=pk_tz)
        
        # Convert to UTC for the API
        dt_utc = dt.astimezone(ZoneInfo("UTC"))
        end_dt_utc = dt_utc + relativedelta(years=1)
        
        # Format times for the API
        start_time = dt_utc.strftime("%Y-%m-%dT%H:%M:%S+0000")
        end_time = end_dt_utc.strftime("%Y-%m-%dT%H:%M:%S+0000")

    adset_data = {
        "name": "[TEST] Product Ad Set",
        "campaign_id": campaign_id,
        "daily_budget": 30000,  # 300.00 in your currency
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "REACH",  # Changed to REACH
        "bid_amount": 500,
        "targeting": json.dumps({
            "age_min": 18,
            "age_max": 65,
            "geo_locations": {
                "countries": ["US"]
            }
        }),
        "status": "PAUSED",
        "start_time": start_time,
        "end_time": end_time,
        "access_token": ACCESS_TOKEN
    }

    # Remove None values from the dictionary
    adset_data = {k: v for k, v in adset_data.items() if v is not None}

    response = requests.post(adset_url, data=adset_data)
    adset_data = response.json()
    print("Ad Set Response:", adset_data)
    return adset_data.get('id', None)

# Step 4: Create Ad Creative
def create_ad_creative(post_id):
    creative_url = f"{BASE_URL}/act_{ACCOUNT_ID}/adcreatives"
    
    # If post_id doesn't include the page_id, add it
    if '_' not in str(post_id):
        post_id = f"{PAGE_ID}_{post_id}"
        
    creative_data = {
        "name": "[TEST] Product Ad Creative",
        "object_story_id": post_id,
        "access_token": ACCESS_TOKEN
    }
    response = requests.post(creative_url, data=creative_data)
    creative_data = response.json()
    print("Ad Creative Response:", creative_data)
    return creative_data.get('id', None)

# Step 5: Create Ad
def create_ad(adset_id, creative_id):
    ad_url = f"{BASE_URL}/act_{ACCOUNT_ID}/ads"
    ad_data = {
        "name": "[TEST] Product Ad",
        "adset_id": adset_id,
        "creative": json.dumps({"creative_id": creative_id}),  # JSON encode the creative object
        "status": "PAUSED",
        "access_token": ACCESS_TOKEN
    }
    response = requests.post(ad_url, data=ad_data)
    ad_data = response.json()
    print("Ad Response:", ad_data)
    return ad_data.get('id', None)