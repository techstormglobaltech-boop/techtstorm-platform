import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

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
    Create a detailed course outline for: "{request.topic}" at a "{request.level}" level.
    
    Instructions:
    - Create a structure with Modules and Lessons.
    - **CRITICAL:** Analyze the user's topic request carefully.
      - If the user mentions "videos", "youtube", "clips", include RELEVANT 'video_url' fields (use search placeholders if needed, e.g., 'https://www.youtube.com/results?search_query=topic').
      - If the user mentions "quiz", "test", "assessment", include a 'quiz' object for relevant lessons.
      - If the user mentions "assignment", "homework", "project", include an 'assignment' object.
      - If the user says "comprehensive", "full", or "interactive", include ALL (videos, quizzes, assignments) where appropriate.
    - If strictly no extra features are requested, provide a standard outline but YOU ARE ALLOWED to add them if they enhance the learning experience significantly.

    The response must be a valid JSON object strictly following this structure:
    {{
        "title": "Course Title",
        "description": "Short course description",
        "modules": [
            {{
                "title": "Module Title",
                "lessons": [
                    {{
                        "title": "Lesson Title",
                        "description": "Short lesson description",
                        "video_url": "Valid YouTube URL or search link (Optional - null if none)",
                        "quiz": {{
                            "title": "Quiz Title",
                            "questions": [
                                {{
                                    "text": "Question text?",
                                    "options": ["Option A", "Option B", "Option C"],
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
    Provide 3-5 modules, each with 2-4 lessons. Return ONLY the JSON object.
    """

    models_to_try = [
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-2.0-flash-lite-preview',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-2.5-flash', 
        'gemini-2.0-flash', 
        'gemini-2.0-flash-exp',
        'gemini-flash-latest'
    ]
    last_error = ""

    for model_name in models_to_try:
        try:
            print(f"Attempting with model: {model_name}")
            current_model = genai.GenerativeModel(model_name)
            response = current_model.generate_content(prompt)
            
            if not response.text:
                continue

            content = response.text.strip()
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