import os
import json
import time
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

load_dotenv()

router = APIRouter()

# Configure Hugging Face
hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(token=hf_token)

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
    Return ONLY the raw JSON object. Do not wrap in ```json block.
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
            print(f"Attempting quiz generation with: {model_name}")
            messages = [{"role": "user", "content": prompt}]
            response = client.chat_completion(
                messages,
                model=model_name,
                max_tokens=2048,
                temperature=0.3,
            )
            
            content = response.choices[0].message.content.strip()
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
