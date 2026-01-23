"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getCourseContent(courseId: string) {
  try {
    return await fetchApi(`/students/courses/${courseId}/content`);
  } catch (error) {
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
    return { error: "Failed to update progress" };
  }
}