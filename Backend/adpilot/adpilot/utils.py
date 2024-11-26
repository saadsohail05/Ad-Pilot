import requests
import json
from fastapi import HTTPException
from typing import Dict, Union

def verify_email_exists(email: str) -> Dict[str, Union[bool, str]]:
    url = "https://verify.maileroo.net/check"
    api_key = "4940863ba70de53a800686cb4e5dbf170008dba3f2f98c44f5c4c80679a637ec"

    headers = {
        "X-API-KEY": api_key,
        "Content-Type": "application/json"
    }

    data = {
        "email_address": email
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()

        if not result.get("success"):
            error_code = result.get("error_code")
            if error_code == "0429":
                raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
            elif error_code == "0401":
                raise HTTPException(status_code=401, detail="Invalid API key configuration")
            elif error_code in ["0402", "0403"]:
                return {"valid": False, "reason": "Invalid email format"}
            else:
                raise HTTPException(status_code=400, detail=result.get("message", "Email verification failed"))

        verification_data = result.get("data", {})
        
        # Check all available validation criteria
        is_valid = (
            verification_data.get("format_valid", False) and
            verification_data.get("mx_found", False) and
            not verification_data.get("disposable", True)
        )

        return {
            "valid": is_valid,
            "format_valid": verification_data.get("format_valid", False),
            "mx_found": verification_data.get("mx_found", False),
            "is_disposable": verification_data.get("disposable", True),
            "is_role_account": verification_data.get("role", False),
            "is_free_email": verification_data.get("free", False),
            "suggested_domain": verification_data.get("domain_suggestion", None),
            "reason": None if is_valid else "Invalid email address"
        }

    except requests.RequestException as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Email verification service error: {str(e)}"
        )
