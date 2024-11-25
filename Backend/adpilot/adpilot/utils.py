# import requests

# def email_exists(email: str) -> bool:
#     response = requests.get(f"https://api.emailverifyapi.com/v3/lookups/json?key=YOUR_API_KEY&email={email}")
#     return response.json().get("deliverable", False)
