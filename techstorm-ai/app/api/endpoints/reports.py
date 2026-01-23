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
    You are an AI Teaching Assistant for a mentor on TechStorm Global.
    Based on the following data for the course "{stats.course_title}":
    - Total Students: {stats.student_count}
    - Average Quiz Score: {stats.avg_quiz_score}%
    - Course Completion Rate: {stats.completion_rate}%
    
    Provide 2 specific, encouraging insights for the mentor and 1 tactical tip to improve student engagement or performance in this specific course.
    
    Format your response as a JSON object:
    {{
        "summary": "One sentence performance summary",
        "insights": ["insight 1", "insight 2"],
        "recommendation": "tactical tip"
    }}
    Return ONLY the JSON object.
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
    last_exception = None
    
    for model_name in models_to_try:
        try:
            print(f"Attempting mentor insights with model: {model_name}")
            current_model = genai.GenerativeModel(model_name)
            response = current_model.generate_content(prompt)
            if not response.text: 
                print(f"Empty response from {model_name}")
                continue
            
            content = response.text.strip()
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
    You are an expert educational data analyst for TechStorm Global, an LMS platform.
    Based on the following platform statistics, provide a concise, professional report with 2-3 key insights and 1 actionable recommendation for the administrator.
    
    Stats:
    - Total Users: {stats.total_users}
    - Total Courses: {stats.total_courses}
    - Total Enrollments: {stats.total_enrollments}
    - Overall Course Completion Rate: {stats.completion_rate}%
    - Top Categories: {json.dumps(stats.top_categories)}

    Format your response as a JSON object:
    {{
        "summary": "One sentence overview",
        "insights": ["insight 1", "insight 2"],
        "recommendation": "specific actionable advice"
    }}
    Return ONLY the JSON object.
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
    last_exception = None
    
    for model_name in models_to_try:
        try:
            print(f"Attempting platform insights with model: {model_name}")
            current_model = genai.GenerativeModel(model_name)
            response = current_model.generate_content(prompt)
            
            if not response.text:
                continue

            content = response.text.strip()
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
