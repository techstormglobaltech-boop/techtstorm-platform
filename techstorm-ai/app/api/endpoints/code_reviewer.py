import os
import json
import time
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(token=hf_token)

class CodeReviewRequest(BaseModel):
    code: str
    assignmentDescription: str

@router.post("/socratic")
async def socratic_code_review(request: CodeReviewRequest):
    print(f"Generating Socratic code review")
    
    prompt = f"""
    You are an expert, friendly Socratic coding tutor. A student is working on the following assignment:
    
    ASSIGNMENT DESCRIPTION:
    {request.assignmentDescription}
    
    STUDENT'S CURRENT CODE:
    ```
    {request.code}
    ```
    
    YOUR TASK:
    Analyze the student's code. Point out logical errors, syntax issues, or missing requirements.
    CRITICAL RULE: DO NOT write the correct code for the student. DO NOT give them the direct answer.
    Instead, ask guiding questions that lead the student to discover the solution on their own. Be encouraging and brief.
    Format your response in Markdown.
    """

    models_to_try = [
        "meta-llama/Llama-3.3-70B-Instruct",
        "Qwen/Qwen2.5-72B-Instruct",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "meta-llama/Meta-Llama-3-8B-Instruct"
    ]
    
    last_error = ""

    for model_name in models_to_try:
        try:
            print(f"Attempting with model: {model_name}")
            messages = [{"role": "user", "content": prompt}]
            response = client.chat_completion(
                messages,
                model=model_name,
                max_tokens=1000,
                temperature=0.4,
            )
            
            feedback = response.choices[0].message.content.strip()
            print(f"Successfully generated using {model_name}")
            return {"feedback": feedback}
        except Exception as e:
            last_error = str(e)
            print(f"Model {model_name} failed: {last_error}")
            if "429" in str(e):
                time.sleep(2)
            continue

    raise HTTPException(status_code=500, detail="AI Tutor failed after multiple attempts.")
