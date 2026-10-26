from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.llm import generate_text

router = APIRouter()


class CodeReviewRequest(BaseModel):
    code: str
    assignmentDescription: str


@router.post("/socratic")
async def socratic_code_review(request: CodeReviewRequest):
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

    try:
        feedback = generate_text(prompt=prompt, max_tokens=1000, temperature=0.4)
        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Tutor failed: {str(e)}")
