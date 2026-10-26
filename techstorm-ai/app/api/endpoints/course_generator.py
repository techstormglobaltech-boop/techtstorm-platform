from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.api.llm import generate_json

router = APIRouter()


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
                        }},
                        "assignment": {{
                            "title": "Assignment Title",
                            "description": "Detailed instructions..."
                        }}
                    }}
                ]
            }}
        ]
    }}
    Provide 3-5 modules, each with 2-4 lessons. Return ONLY the raw JSON object.
    """

    try:
        return generate_json(prompt=prompt, max_tokens=3000, temperature=0.3)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")
