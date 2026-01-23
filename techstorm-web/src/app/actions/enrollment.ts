"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  try {
    const result = await fetchApi("/students/enroll", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
    
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/mentee/my-courses`);
    return { success: true };
  } catch (error) {
    console.error("Enrollment error:", error);
    return { error: "Failed to enroll" };
  }
}

export async function checkEnrollment(courseId: string) {
  try {
    return await fetchApi(`/students/courses/${courseId}/enrolled`);
  } catch (error) {
    return false;
  }
}
