import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import jwt
import datetime
import random
import redis

# Initialize Redis client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def generate_verification_token(email: str):
    secret_key = "1234"  # Replace with your actual secret key
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    numeric_token = random.randint(10000000, 99999999)  # Generate an 8-digit number
    payload = {
        "email": email,
        "exp": expiration,
        "numeric_token": numeric_token
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token, numeric_token

def invalidate_previous_codes(email: str):
    # Get all keys in Redis
    for key in redis_client.scan_iter("*"):
        try:
            # Decode the stored JWT token
            stored_token = redis_client.get(key)
            if stored_token:
                payload = jwt.decode(stored_token, "1234", algorithms=["HS256"])
                # If this token belongs to the email, delete it
                if payload.get("email") == email:
                    redis_client.delete(key)
        except jwt.InvalidTokenError:
            # If token is invalid, remove it
            redis_client.delete(key)
        except Exception as e:
            print(f"Error processing key {key}: {e}")

def send_verification_email(email: str):
    sender_email = "adpilotonline@gmail.com"
    sender_password = "mcsb seid roiv cnnd"
    receiver_email = email

    # Invalidate any existing codes for this email
    invalidate_previous_codes(email)

    # Generate new verification code
    verification_token, numeric_token = generate_verification_token(email)
    
    # Store in Redis with 1-hour expiration
    redis_client.setex(str(numeric_token), 3600, verification_token)

    message = MIMEMultipart("alternative")
    message["Subject"] = "Email Verification"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = f"""\
    Hi,
    Your verification token is: {numeric_token}
    """

    part = MIMEText(text, "plain")
    message.attach(part)

    # Use the actual SMTP server address
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, message.as_string())

def verify_token(numeric_token: int):
    secret_key = "1234"  # Replace with your actual secret key
    jwt_token = redis_client.get(numeric_token)
    if jwt_token:
        try:
            payload = jwt.decode(jwt_token, secret_key, algorithms=["HS256"])
            email = payload["email"]
            print(f"Decoded email: {email}")  # Debugging line to print the email
            return email
        except jwt.ExpiredSignatureError:
            print("Token has expired")  # Debugging line
            return None
        except jwt.InvalidTokenError:
            print("Invalid token")  # Debugging line
            return None
    else:
        print("Invalid numeric token")  # Debugging line
        return None

