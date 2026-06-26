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

class PlatformStats(BaseModel):
    total_users: int
    total_courses: int
    total_enrollments: int
    completion_rate: float
    top_categories: List[dict]

class MentorStats(BaseModel):
    course_title: str
    student_count: int
    avg_quiz_score: float
    completion_rate: float
    recent_feedback: Optional[str] = None

@router.post("/generate-mentor-insights")
async def generate_mentor_insights(stats: MentorStats):
    prompt = f"""
    You are an expert AI Teaching Assistant and Data Analyst for a mentor on TechStorm Global.
    Based on the following data for the course "{stats.course_title}":
    - Total Students: {stats.student_count}
    - Average Quiz Score: {stats.avg_quiz_score}%
    - Course Completion Rate: {stats.completion_rate}%
    
    BEST PRACTICES & INSTRUCTIONS:
    1. Think step-by-step about the implications of this data before writing the insights.
    2. Provide 2 specific, encouraging, and highly analytical insights for the mentor based purely on the numbers.
    3. Provide 1 extremely tactical and actionable tip to improve student engagement or performance in this specific course.
    
    Format your response as a valid JSON object strictly following this structure (No markdown, no explanations outside JSON):
    {{
        "summary": "One sentence performance summary",
        "insights": ["insight 1", "insight 2"],
        "recommendation": "tactical tip"
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
    last_exception = None
    
    for model_name in models_to_try:
        try:
            print(f"Attempting mentor insights with model: {model_name}")
            messages = [{"role": "user", "content": prompt}]
            response = client.chat_completion(
                messages,
                model=model_name,
                max_tokens=1024,
                temperature=0.3,
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Model {model_name} failed: {str(e)}")
            last_exception = e
            # If we hit a quota limit (429), wait a bit. If 404, fail fast.
            if "429" in str(e):
                time.sleep(5) 
            continue

    # Fallback to a generic response instead of 500
    return {
        "summary": "AI insights are temporarily unavailable due to high demand.",
        "insights": [
            "Maintain consistent engagement with your students.",
            "Review recent quiz performance to identify common struggle areas."
        ],
        "recommendation": "Try refreshing in a few minutes for a detailed AI analysis."
    }

@router.post("/generate-insights")
async def generate_insights(stats: PlatformStats):
    prompt = f"""
    You are a Chief Data Officer and expert educational data analyst for TechStorm Global, an elite LMS platform.
    Based on the following platform statistics, provide a concise, professional, and highly analytical report.
    
    Stats:
    - Total Users: {stats.total_users}
    - Total Courses: {stats.total_courses}
    - Total Enrollments: {stats.total_enrollments}
    - Overall Course Completion Rate: {stats.completion_rate}%
    - Top Categories: {json.dumps(stats.top_categories)}

    BEST PRACTICES & INSTRUCTIONS:
    1. Think step-by-step about what these numbers mean for the business and platform health.
    2. Provide 2-3 key insights that go beyond just repeating the numbers. Tell the administrator what the numbers *mean*.
    3. Provide 1 highly actionable strategic recommendation for the administrator to improve growth or completion rates.
    
    Format your response as a valid JSON object strictly following this structure (No markdown, no explanations outside JSON):
    {{
        "summary": "One sentence executive overview",
        "insights": ["insight 1", "insight 2"],
        "recommendation": "specific actionable strategic advice"
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
    last_exception = None
    
    for model_name in models_to_try:
        try:
            print(f"Attempting platform insights with model: {model_name}")
            messages = [{"role": "user", "content": prompt}]
            response = client.chat_completion(
                messages,
                model=model_name,
                max_tokens=1024,
                temperature=0.3,
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            return json.loads(content)
        except Exception as e:
            print(f"Platform Insight Generation failed for {model_name}: {str(e)}")
            last_exception = e
            if "429" in str(e):
                time.sleep(5)
            continue

    # Fallback
    return {
        "summary": "Platform analysis is currently processing. Check back soon for deeper insights.",
        "insights": [
            f"Currently supporting {stats.total_users} users across {stats.total_courses} courses.",
            "Student enrollment trends remain stable."
        ],
        "recommendation": "Continue monitoring course completion rates for optimization opportunities."
    }
