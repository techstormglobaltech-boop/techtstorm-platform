"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getCourseContent(courseId: string) {
  try {
    return await fetchApi(`/students/courses/${courseId}/content`);
  } catch (error) {
    console.error("Failed to fetch course content:", error);
    return null;
  }
}

export async function markLessonComplete(lessonId: string, completed: boolean = true) {
  try {
    await fetchApi(`/students/lessons/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({ completed }),
    });
    
    revalidatePath("/learn/[id]");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark lesson complete:", error);
    return { error: "Failed to update progress" };
  }
}
