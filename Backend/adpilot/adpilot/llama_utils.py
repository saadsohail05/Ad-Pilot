import aiohttp
from fastapi import HTTPException
from typing import Optional
import json

class LlamaAPI:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.generate_endpoint = f"{base_url}/api/generate"

    async def generate_content(self, prompt: str, model: str = "llama3.2") -> str:
        """
        Generate content using the Llama model's generate endpoint with optimized parameters
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 1000,  # Increased for longer responses
                "top_k": 40,         # Increased for more diverse responses
                "top_p": 0.9,        # Increased for more creative responses
                "temperature": 0.8,   # Increased for more creative responses
                "repeat_penalty": 1.2 # Added to prevent repetition
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

    async def generate_content_stream(self, prompt: str, model: str = "llama3.2"):
        """
        Generate content using the Llama model's generate endpoint with streaming
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "num_predict": 1000,
                "top_k": 40,
                "top_p": 0.9,
                "temperature": 0.8,
                "repeat_penalty": 1.2
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
                    
                    async for line in response.content:
                        if line:
                            try:
                                json_response = json.loads(line)
                                if 'response' in json_response:
                                    yield f"data: {json_response['response']}\n\n"
                            except json.JSONDecodeError:
                                continue
                    
                    yield "data: [DONE]\n\n"

        except aiohttp.ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Llama API: {str(e)}"
            )

# Create a singleton instance
llama_api = LlamaAPI()