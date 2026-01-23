from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TechStorm AI Engine", version="1.0.0")

# CORS Configuration (Allow requests from Next.js frontend)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "TechStorm AI Engine is Online"}

from app.api.endpoints import course_generator, reports, quiz
app.include_router(course_generator.router, prefix="/api/v1/course", tags=["course"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["quiz"])
