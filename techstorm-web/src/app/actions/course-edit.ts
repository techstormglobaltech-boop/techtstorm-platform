"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getCourseForEdit(courseId: string) {
  try {
    return await fetchApi(`/courses/${courseId}/edit`);
  } catch (error) {
    return null;
  }
}

export async function updateCourseDetails(courseId: string, data: any) {
  try {
    await fetchApi(`/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update course" };
  }
}

// MODULE ACTIONS
export async function createModule(courseId: string, title: string) {
  try {
    await fetchApi("/content/modules", {
      method: "POST",
      body: JSON.stringify({ courseId, title }),
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create module" };
  }
}

export async function deleteModule(moduleId: string, courseId: string) {
  try {
    await fetchApi(`/content/modules/${moduleId}`, { method: "DELETE" });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete module" };
  }
}

// LESSON ACTIONS
export async function createLesson(moduleId: string, title: string, courseId: string) {
  try {
    await fetchApi("/content/lessons", {
      method: "POST",
      body: JSON.stringify({ moduleId, title, courseId }),
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create lesson" };
  }
}

export async function updateLesson(lessonId: string, data: any, courseId: string) {
  try {
    await fetchApi(`/content/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  try {
    await fetchApi(`/content/lessons/${lessonId}`, { method: "DELETE" });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete lesson" };
  }
}

// QUIZ ACTIONS
export async function saveQuiz(lessonId: string, data: { title: string, id?: string }, courseId: string) {
  try {
    const quiz = await fetchApi("/content/quizzes", {
      method: "POST",
      body: JSON.stringify({ lessonId, data, courseId }),
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true, id: quiz.id };
  } catch (error) {
    return { error: "Failed to save quiz" };
  }
}

export async function generateQuizFromAI(lessonId: string, lessonTitle: string, courseId: string) {
  try {
    await fetchApi("/content/quizzes/generate-ai", {
      method: "POST",
      body: JSON.stringify({ lessonId, lessonTitle, courseId }),
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("AI QUIZ SAVE ERROR:", error);
    return { error: "Failed to save AI quiz" };
  }
}

export async function addQuestion(quizId: string, data: any, courseId: string) {
  try {
    await fetchApi("/content/questions", {
      method: "POST",
      body: JSON.stringify({ quizId, data, courseId }),
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to add question" };
  }
}

export async function deleteQuestion(questionId: string, courseId: string) {
  try {
    await fetchApi(`/content/questions/${questionId}`, { method: "DELETE" });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete question" };
  }
}

// ASSIGNMENT ACTIONS
export async function saveAssignment(lessonId: string, data: { title: string, description: string, id?: string }, courseId: string) {
  try {
    await fetchApi("/content/assignments", {
      method: "POST",
      body: JSON.stringify({ lessonId, data, courseId }),
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to save assignment" };
  }
}