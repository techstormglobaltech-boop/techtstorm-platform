import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import course_generator, reports, quiz, newsletter, code_reviewer, blog

app = FastAPI(title="TechStorm AI Engine", version="1.1.0")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "TechStorm AI Engine is Online",
        "providers": {
            "groq": bool((os.getenv("GROQ_API_KEY") or "").strip()),
            "gemini": bool((os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()),
            "openai": bool((os.getenv("OPENAI_API_KEY") or "").strip()),
            "huggingface": bool((os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY") or "").strip()),
        },
    }


app.include_router(course_generator.router, prefix="/api/v1/course", tags=["course"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["quiz"])
app.include_router(newsletter.router, prefix="/api/v1/newsletter", tags=["newsletter"])
app.include_router(code_reviewer.router, prefix="/api/v1/code-review", tags=["code-review"])
app.include_router(blog.router, prefix="/api/v1/blog", tags=["blog"])
