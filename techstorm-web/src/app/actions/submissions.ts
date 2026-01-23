"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

// QUIZ SUBMISSION
export async function submitQuizResult(quizId: string, score: number, totalQuestions: number) {
  try {
    await fetchApi(`/students/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ score, totalQuestions }),
    });
    return { success: true };
  } catch (error) {
    console.error("Quiz submission error:", error);
    return { error: "Failed to save quiz result" };
  }
}

// ASSIGNMENT SUBMISSION
export async function submitAssignment(assignmentId: string, content: string) {
  try {
    await fetchApi(`/students/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    return { success: true };
  } catch (error) {
    console.error("Assignment submission error:", error);
    return { error: "Failed to submit assignment" };
  }
}

// MENTOR: FETCH SUBMISSIONS
export async function getSubmissionsForMentor(courseId: string) {
  try {
    return await fetchApi(`/courses/${courseId}/submissions`);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return [];
  }
}

// MENTOR: GRADE SUBMISSION
export async function gradeSubmission(submissionId: string, data: { grade: string, feedback: string }, courseId: string) {
  try {
    await fetchApi(`/courses/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath(`/mentor/courses/${courseId}/submissions`);
    return { success: true };
  } catch (error) {
    console.error("Grading error:", error);
    return { error: "Failed to grade submission" };
  }
}
