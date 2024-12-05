import aiohttp
from fastapi import HTTPException
from typing import Optional

class LlamaAPI:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.generate_endpoint = f"{base_url}/api/generate"

    async def generate_content(self, prompt: str, model: str = "llama3.2") -> str:
        """
        Generate content using the Llama model's generate endpoint with fixed parameters
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 100,
                "top_k": 10,
                "top_p": 0.7,
                "temperature": 0.6
                # "num_ctx": 512,
                # "num_batch": 1
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.generate_endpoint, json=payload) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=response.status,
                            detail="Failed to generate content from Llama"
                        )
                    
                    json_response = await response.json()
                    return json_response.get("response", "").strip()

        except aiohttp.ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Llama API: {str(e)}"
            )

# Create a singleton instance
llama_api = LlamaAPI()