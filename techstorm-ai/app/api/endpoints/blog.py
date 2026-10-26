from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.llm import generate_json

router = APIRouter()


class BlogRequest(BaseModel):
    outline: str


@router.post("/enhance")
async def enhance_blog(request: BlogRequest):
    prompt = f"""
    You are an expert Tech Blogger and SEO Specialist for TechStorm Global.
    A user has provided the following rough draft or outline for a blog post:
    
    "{request.outline}"
    
    Your task is to expand this into a highly engaging, fully fleshed-out blog post.
    
    Requirements:
    1. Write in a professional yet conversational tone, suitable for software engineers and tech students.
    2. Format the response strictly as a JSON object (do not include markdown code block syntax around the JSON).
    3. The JSON must have these exact keys:
       - "title": A catchy, SEO-optimized title for the post.
       - "content": The full expanded blog post in Markdown format.
       - "excerpt": A short 2-3 sentence summary for social media preview cards.
       - "tags": An array of 3 to 5 relevant string tags (e.g. ["React", "AI", "Career"]).
    """

    try:
        return generate_json(prompt=prompt, max_tokens=3000, temperature=0.7)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Blog Enhancement failed: {str(e)}")
