from starlette.config import Config
from starlette.datastructures import Secret
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

try:
    config = Config(".env")

except FileNotFoundError:
    config = Config()

DATABASE_URL = config("DATABASE_URL", cast=Secret)

def validate_instagram_schedule_time(scheduled_time: str | None) -> tuple[bool, str | None]:
    """
    Validate the scheduled time for Instagram posts:
    - If None, return (True, None) for immediate posting
    - If provided, ensure it's at least 20 minutes in the future
    
    Args:
        scheduled_time: Optional scheduled time in format YYYY-MM-DDTHH:MM:SS (UTC)
    
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

# Instagram API configuration
INSTAGRAM_CONFIG = {
    "ACCESS_TOKEN": "EAAG9iABBJD8BO92ZCzvllhPvgbTDAdmJ2ZArzFEoAkbLlZAE3tpLbjqtcYWwtjZAUdUj2g90VKpF1E8DFu7fmTnZCAmoNZAAi8ZAdq3PzCZCGwL70zZBkH8Ipya14rjoNm3NHE3Mp9ZBabkeIc7ENmUWZBxOWosxeJaf37cJlreA6MjYGp7AHak5ibWymFBs1ZAJQnqdGwlCFWmZAg8nZBocWC",
    "ACCOUNT_ID": "647771843892612",
    "PAGE_ID": "556103107587849",
    "API_VERSION": "v22.0",
    "BASE_URL": "https://graph.facebook.com/v22.0"
}

# Ad targeting configurations
INSTAGRAM_AD_TARGETING = {
    "age_min": 18,
    "age_max": 65,
    "geo_locations": {
        "countries": ["US"]
    },
    "instagram_positions": ["stream", "story", "explore"]
}

# Campaign configurations
INSTAGRAM_CAMPAIGN_DEFAULTS = {
    "daily_budget": 30000,  # 300.00 in currency
    "billing_event": "IMPRESSIONS",
    "optimization_goal": "REACH",
    "bid_amount": 500,
    "status": "PAUSED"
}