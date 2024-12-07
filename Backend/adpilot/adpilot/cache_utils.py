import redis
import json

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0)
CACHE_EXPIRY = 60 * 30  # 30 minutes expiry

LATEST_REPORT_KEY = "latest_report"

def cache_report(report_data: dict):
    """Cache the latest generated report, replacing any existing one"""
    try:
        # Simply overwrite any existing report with the new one
        redis_client.setex(
            LATEST_REPORT_KEY,
            CACHE_EXPIRY,
            json.dumps(report_data)
        )
    except Exception as e:
        print(f"Cache error: {str(e)}")

def get_latest_report() -> dict:
    """Retrieve the latest cached report without deleting it"""
    try:
        cached_data = redis_client.get(LATEST_REPORT_KEY)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Cache retrieval error: {str(e)}")
    return None