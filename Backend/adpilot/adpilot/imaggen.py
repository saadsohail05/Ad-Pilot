import os
import base64
from together import Together

# Set your API key
api_key = "9de160c555fb20e06445c4250d235a7785bec3951c5a6a1abd0a824a6737c02a"
if not api_key:
    raise ValueError("Please set the TOGETHER_API_KEY environment variable")

# Initialize client with API key
together = Together(api_key=api_key)

def generate_image(prompt: str):
    try:
        response = together.images.generate(
            prompt=prompt,
            model="black-forest-labs/FLUX.1-schnell-Free",
            width=1024,
            height=768,
            steps=4,
            n=1,
            response_format="b64_json",
        )
        
        if hasattr(response.data[0], 'b64_json'):
            return base64.b64decode(response.data[0].b64_json)
        else:
            raise ValueError("No image data in response")
            
    except Exception as e:
        raise Exception(f"Error generating image: {str(e)}")

# Export the initialized client
client = together