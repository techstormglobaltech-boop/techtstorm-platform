const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

export async function generateCourseOutline(topic: string, level: string = "Beginner") {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/course/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, level }),
    });

    if (!response.ok) {
      throw new Error("AI Engine failed to generate outline");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}

export async function generateQuiz(topic: string, difficulty: string = "Intermediate") {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/quiz/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, difficulty }),
    });

    if (!response.ok) {
      throw new Error("AI Engine failed to generate quiz");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Quiz Error:", error);
    return null;
  }
}
