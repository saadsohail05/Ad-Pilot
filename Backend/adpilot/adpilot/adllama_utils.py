import aiohttp
from fastapi import HTTPException
from typing import Optional

class AdLlamaAPI:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.generate_endpoint = f"{base_url}/api/generate"

    async def generate_content(self, prompt: str, model: str = "adllama") -> str:
        """
        Generate content using the AdLlama model's generate endpoint
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "min_p": 0.1,       
                "temperature": 1.5,  
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.generate_endpoint, json=payload) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=response.status,
                            detail="Failed to generate content from AdLlama"
                        )
                    
                    json_response = await response.json()
                    return json_response.get("response", "").strip()

        except aiohttp.ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to AdLlama API: {str(e)}"
            )

# Create a singleton instance
adllama_api = AdLlamaAPI()