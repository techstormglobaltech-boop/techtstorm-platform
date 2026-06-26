import os
import json
import time
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

router = APIRouter()

# Configure Hugging Face
hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(token=hf_token)

class Question(BaseModel):
    text: str
    options: List[str]
    correct_answer: str

class Quiz(BaseModel):
    title: str
    questions: List[Question]

class Assignment(BaseModel):
    title: str
    description: str

class Lesson(BaseModel):
    title: str
    description: str
    video_url: Optional[str] = None
    quiz: Optional[Quiz] = None
    assignment: Optional[Assignment] = None

class Module(BaseModel):
    title: str
    lessons: List[Lesson]

class CourseOutline(BaseModel):
    title: str
    description: str
    modules: List[Module]

class CourseRequest(BaseModel):
    topic: str
    level: str = "Beginner"

@router.post("/generate", response_model=CourseOutline)
async def generate_course(request: CourseRequest):
    print(f"Generating course for: {request.topic}")
    
    prompt = f"""
    Create a highly professional and comprehensive course outline for the topic: "{request.topic}" at a "{request.level}" level.
    
    BEST PRACTICES & INSTRUCTIONS:
    1. Think step-by-step about the logical progression of this topic for a {request.level} learner.
    2. Ensure the curriculum is highly practical and structured logically.
    3. Analyze the topic request carefully:
       - Include RELEVANT 'video_url' fields (use search placeholders if needed, e.g., 'https://www.youtube.com/results?search_query=topic').
       - Include a 'quiz' object for relevant lessons to test understanding.
       - Include an 'assignment' object for hands-on practice.
    
    The response MUST be a valid JSON object strictly following this structure (No markdown, no explanations outside JSON):
    {{
        "title": "Course Title",
        "description": "Short, engaging course description",
        "modules": [
            {{
                "title": "Module Title",
                "lessons": [
                    {{
                        "title": "Lesson Title",
                        "description": "Detailed lesson description",
                        "video_url": "Valid YouTube URL or search link (Optional - null if none)",
                        "quiz": {{
                            "title": "Quiz Title",
                            "questions": [
                                {{
                                    "text": "Question text?",
                                    "options": ["Option A", "Option B", "Option C", "Option D"],
                                    "correct_answer": "Option A"
                                }}
                            ]
                        }} (Optional - null if none),
                        "assignment": {{
                            "title": "Assignment Title",
                            "description": "Detailed instructions..."
                        }} (Optional - null if none)
                    }}
                ]
            }}
        ]
    }}
    Provide 3-5 modules, each with 2-4 lessons. Return ONLY the raw JSON object. Do not wrap in ```json block.
    """

    models_to_try = [
        "meta-llama/Llama-3.3-70B-Instruct",
        "Qwen/Qwen2.5-72B-Instruct",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "meta-llama/Meta-Llama-3-8B-Instruct",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "Qwen/Qwen2.5-7B-Instruct"
    ]
    last_error = ""

    for model_name in models_to_try:
        try:
            print(f"Attempting with model: {model_name}")
            messages = [{"role": "user", "content": prompt}]
            response = client.chat_completion(
                messages,
                model=model_name,
                max_tokens=3000,
                temperature=0.3,
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            outline_data = json.loads(content)
            print(f"Successfully generated using {model_name}")
            return outline_data
        except Exception as e:
            last_error = str(e)
            print(f"Model {model_name} failed: {last_error}")
            if "429" in str(e):
                time.sleep(5)
            continue

    raise HTTPException(status_code=500, detail="AI Generation failed after multiple attempts.")