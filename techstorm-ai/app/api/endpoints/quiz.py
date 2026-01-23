import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

load_dotenv()

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

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
    Create a professional multiple-choice quiz about: "{request.topic}".
    Difficulty Level: {request.difficulty}
    Number of Questions: {request.count}

    The response must be a valid JSON object strictly following this structure:
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
    Ensure options are plausible but only one is correct. Return ONLY the JSON object.
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
            print(f"Attempting quiz generation with: {model_name}")
            current_model = genai.GenerativeModel(model_name)
            response = current_model.generate_content(prompt)
            
            if not response.text:
                continue

            content = response.text.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            quiz_data = json.loads(content)
            print(f"Successfully generated quiz using {model_name}")
            return quiz_data
        except Exception as e:
            last_error = str(e)
            print(f"Model {model_name} failed: {last_error}")
            if "429" in str(e):
                time.sleep(5)
            continue

    raise HTTPException(status_code=500, detail=f"AI Quiz Generation failed: {last_error}")
