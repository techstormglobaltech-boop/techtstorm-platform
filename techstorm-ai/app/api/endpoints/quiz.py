from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.api.llm import generate_json

router = APIRouter()


class Question(BaseModel):
    text: str
    options: List[str]
    correct_answer: str


class QuizResponse(BaseModel):
    title: str
    questions: List[Question]


class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "Intermediate"
    count: int = 5


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    prompt = f"""
    Create a highly professional and challenging multiple-choice quiz about: "{request.topic}".
    Difficulty Level: {request.difficulty}
    Number of Questions: {request.count}

    BEST PRACTICES & INSTRUCTIONS:
    1. Think step-by-step to create plausible distractors (wrong options) that test real understanding, not just memorization.
    2. Ensure the correct answer is unambiguously correct.
    3. The response MUST be a valid JSON object strictly following this structure (No markdown, no explanations outside JSON):
    {{
        "title": "Quiz Title",
        "questions": [
            {{
                "text": "The question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "The exact text of the correct option"
            }}
        ]
    }}
    Return ONLY the raw JSON object.
    """

    try:
        return generate_json(prompt=prompt, max_tokens=2048, temperature=0.3)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Quiz Generation failed: {str(e)}")
